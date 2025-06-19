use resend::Error as ResendError;
use resend::Resend;
use rand::random;
use reqwest;
use serde_json::json;
use std::error::Error;
use std::sync::OnceLock;
use std::{env, time::Duration};
use tokio::{task, time::sleep};

const OTP_EXPIRY_SECONDS: u64 = 300; // 5 minutes
const MAX_RETRY_ATTEMPTS: u32 = 3;
const RETRY_DELAY_MS: u64 = 250;
const MAX_OTP_ATTEMPTS: i32 = 5;

// Cache for email templates
static EMAIL_TEMPLATE_HTML: OnceLock<String> = OnceLock::new();
static EMAIL_TEMPLATE_TEXT: OnceLock<String> = OnceLock::new();

type BoxError = Box<dyn Error + Send + Sync + 'static>;

#[derive(Clone)]
pub struct EmailService {
    resend_client: Resend,
    upstash_url: String,
    upstash_token: String,
    sender_email: String,
    sender_name: String,
}

impl EmailService {
    pub fn new() -> Result<Self, BoxError> {
        let resend_api_key = env::var("RESEND_API_KEY")
            .expect("RESEND_API_KEY must be set");
        let upstash_url = env::var("UPSTASH_REDIS_URL")
            .expect("UPSTASH_REDIS_URL must be set");
        let upstash_token = env::var("UPSTASH_REDIS_TOKEN")
            .expect("UPSTASH_REDIS_TOKEN must be set");
        
        Ok(Self {
            resend_client: Resend::new(resend_api_key),
            upstash_url,
            upstash_token,
            sender_email: "verify@resend.dev".to_string(), // Resend's verified domain
            sender_name: "LinkSphere Team".to_string(),
        })
    }

    pub async fn send_otp(&self, email: &str) -> Result<(), BoxError> {
        // Check rate limiting
        let attempts = self.get_attempt_count(email).await?;
        if attempts >= MAX_OTP_ATTEMPTS {
            return Err("Maximum OTP attempts exceeded. Please contact support to unlock your account.".into());
        }

        let otp = self.generate_otp();

        // Store OTP and send email concurrently
        let store_otp_future = self.store_otp_with_retry(email, &otp);
        let send_email_future = self.send_email_with_retry(email, &otp);

        let (store_result, send_result) = tokio::join!(store_otp_future, send_email_future);

        // Check results
        store_result?;
        send_result?;

        // Increment attempt counter in the background
        let email_owned = email.to_string();
        let self_clone = self.clone();
        task::spawn(async move {
            if let Err(e) = self_clone.increment_attempt_count(&email_owned).await {
                eprintln!("Failed to increment attempt counter: {}", e);
            }
        });

        Ok(())
    }

    async fn send_email_with_retry(&self, to_email: &str, otp: &str) -> Result<(), BoxError> {
        let (html_content, text_content) = self.create_email_content(otp);

        for attempt in 0..MAX_RETRY_ATTEMPTS {
            let params = resend::SendEmailRequest::new()
                .from(format!("{} <{}>", self.sender_name, self.sender_email))
                .to(to_email.to_string())
                .subject("Verify Your LinkSphere Account")
                .html(html_content.clone())
                .text(text_content.clone());

            match self.resend_client.send_email(&params).await {
                Ok(_) => return Ok(()),
                Err(e) if attempt == MAX_RETRY_ATTEMPTS - 1 => return Err(Box::new(e)),
                Err(_) => {
                    sleep(Duration::from_millis(RETRY_DELAY_MS * attempt as u64)).await;
                    continue;
                }
            }
        }

        Err("Failed to send email after all retry attempts".into())
    }

    fn create_email_content(&self, otp: &str) -> (String, String) {
        let html = EMAIL_TEMPLATE_HTML.get_or_init(|| create_html_template()).replace("{otp}", otp);
        let text = EMAIL_TEMPLATE_TEXT.get_or_init(|| create_text_template()).replace("{otp}", otp);
        (html, text)
    }

    async fn store_otp_with_retry(&self, email: &str, otp: &str) -> Result<(), BoxError> {
        let client = reqwest::Client::new();
        let set_url = format!("{}/set/otp:{}", self.upstash_url, email);
        let payload = json!({
            "value": otp,
            "ex": OTP_EXPIRY_SECONDS
        });

        for attempt in 0..MAX_RETRY_ATTEMPTS {
            match client
                .post(set_url.clone())
                .header("Authorization", format!("Bearer {}", self.upstash_token))
                .json(&payload)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => return Ok(()),
                Ok(_) if attempt == MAX_RETRY_ATTEMPTS - 1 => {
                    return Err("Failed to store OTP: server returned non-success status".into())
                }
                _ => {
                    sleep(Duration::from_millis(RETRY_DELAY_MS * attempt as u64)).await;
                    continue;
                }
            }
        }

        Err("Failed to store OTP after all retry attempts".into())
    }

    async fn get_attempt_count(&self, email: &str) -> Result<i32, BoxError> {
        let client = reqwest::Client::new();
        let get_url = format!("{}/get/attempts:{}", self.upstash_url, email);

        let response = client
            .get(&get_url)
            .header("Authorization", format!("Bearer {}", self.upstash_token))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        Ok(response
            .get("result")
            .and_then(|v| v.as_str())
            .and_then(|s| s.parse::<i32>().ok())
            .unwrap_or(0))
    }

    async fn increment_attempt_count(&self, email: &str) -> Result<(), BoxError> {
        let client = reqwest::Client::new();
        let set_url = format!("{}/incr/attempts:{}", self.upstash_url, email);

        client
            .post(&set_url)
            .header("Authorization", format!("Bearer {}", self.upstash_token))
            .send()
            .await?;

        Ok(())
    }

    /// Admin-only function to reset OTP attempts for blocked users
    pub async fn admin_reset_attempts(
        &self,
        email: &str,
        admin_token: &str,
    ) -> Result<(), BoxError> {
        // Verify admin token
        let expected_token =
            env::var("ADMIN_SECRET_KEY").map_err(|_| "Admin secret not configured")?;

        if admin_token != expected_token {
            return Err("Invalid admin token".into());
        }

        // Delete both the OTP and attempts counter from Redis
        let client = reqwest::Client::new();

        // Delete attempts counter
        let del_attempts_url = format!("{}/del/attempts:{}", self.upstash_url, email);
        let del_otp_url = format!("{}/del/otp:{}", self.upstash_url, email);

        // Try to delete both keys, but don't fail if one doesn't exist
        for url in [del_attempts_url, del_otp_url] {
            match client
                .post(&url)
                .header("Authorization", format!("Bearer {}", self.upstash_token))
                .send()
                .await
            {
                Ok(_) => continue,
                Err(e) => println!("Warning: Failed to delete key {}: {}", url, e),
            }
        }

        Ok(())
    }

    fn generate_otp(&self) -> String {
        (0..6)
            .map(|_| random::<u8>() % 10)
            .map(|n| n.to_string())
            .collect()
    }
}

fn create_html_template() -> String {
    r####"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your LinkSphere Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
        <tr>
            <td style="padding: 20px;">
                <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #6b46c1; font-size: 24px;">LinkSphere</h1>
                            <p style="margin: 10px 0 30px; color: #666666;">Verify Your Account</p>
                            
                            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0 0 10px; font-size: 16px;">Your verification code:</p>
                                <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4c1d95;">{otp}</div>
                                <p style="margin: 10px 0 0; font-size: 14px; color: #666666;">This code will expire in 5 minutes</p>
                            </div>

                            <p style="margin: 20px 0; font-size: 14px; color: #666666;">If you didn't request this code, please ignore this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666666; text-align: center;">
                            <p style="margin: 0 0 10px;">© 2024 LinkSphere. All rights reserved.</p>
                            <p style="margin: 0;">123 Tech Street, Digital City, DC 12345</p>
                            <p style="margin: 10px 0 0;">
                                <a href="https://linksphere.com/unsubscribe" style="color: #6b46c1; text-decoration: none;">Unsubscribe</a> |
                                <a href="https://linksphere.com/privacy" style="color: #6b46c1; text-decoration: none;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"####.to_string()
}

fn create_text_template() -> String {
    r####"Welcome to LinkSphere!

Your verification code is: {otp}

This code will expire in 5 minutes. If you didn't request this code, please ignore this email.

For security reasons, please do not share this code with anyone.

Best regards,
The LinkSphere Team

---
© 2024 LinkSphere. All rights reserved.
123 Tech Street, Digital City, DC 12345

To unsubscribe: https://linksphere.com/unsubscribe
Privacy Policy: https://linksphere.com/privacy"####.to_string()
}
