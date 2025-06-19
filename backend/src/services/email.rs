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
    resend_api_key: String,
    upstash_url: String,
    upstash_token: String,
    sender_email: String,
    sender_name: String,
}

impl EmailService {
    pub fn new() -> Result<Self, BoxError> {
        let resend_api_key = env::var("RESEND_API_KEY").expect("RESEND_API_KEY must be set");
        let upstash_url =
            env::var("UPSTASH_REDIS_REST_URL").expect("UPSTASH_REDIS_REST_URL must be set");
        let upstash_token =
            env::var("UPSTASH_REDIS_REST_TOKEN").expect("UPSTASH_REDIS_REST_TOKEN must be set");

        Ok(Self {
            resend_api_key,
            upstash_url,
            upstash_token,
            sender_email: "verify@resend.dev".to_string(),
            sender_name: "LinkSphere Team".to_string(),
        })
    }

    pub async fn send_otp(&self, email: &str) -> Result<(), BoxError> {
        // Check rate limiting
        let attempts = self.get_attempt_count(email).await?;
        if attempts >= MAX_OTP_ATTEMPTS {
            return Err(
                "Maximum OTP attempts exceeded. Please contact support to unlock your account."
                    .into(),
            );
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
        let client = reqwest::Client::new();

        for attempt in 0..MAX_RETRY_ATTEMPTS {
            let send_url = "https://api.resend.com/emails";
            let payload = json!({
                "from": format!("{} <{}>", self.sender_name, self.sender_email),
                "to": to_email,
                "subject": "Verify Your LinkSphere Account",
                "html": html_content,
                "text": text_content
            });

            match client
                .post(send_url)
                .header("Authorization", format!("Bearer {}", self.resend_api_key))
                .json(&payload)
                .send()
                .await
            {
                Ok(response) if response.status().is_success() => return Ok(()),
                Ok(response) if attempt == MAX_RETRY_ATTEMPTS - 1 => {
                    let error_text = response.text().await.unwrap_or_default();
                    return Err(format!("Failed to send email: {}", error_text).into());
                }
                _ => {
                    sleep(Duration::from_millis(RETRY_DELAY_MS * attempt as u64)).await;
                    continue;
                }
            }
        }

        Err("Failed to send email after all retry attempts".into())
    }

    fn create_email_content(&self, otp: &str) -> (String, String) {
        let html = EMAIL_TEMPLATE_HTML
            .get_or_init(create_html_template)
            .replace("{otp}", otp);
        let text = EMAIL_TEMPLATE_TEXT
            .get_or_init(create_text_template)
            .replace("{otp}", otp);
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

    pub async fn verify_otp(&self, email: &str, otp: &str) -> bool {
        let client = reqwest::Client::new();
        let get_url = format!("{}/get/otp:{}", self.upstash_url, email);

        match client
            .get(&get_url)
            .header("Authorization", format!("Bearer {}", self.upstash_token))
            .send()
            .await
        {
            Ok(response) => {
                let response_text = response.text().await.unwrap_or_default();
                match serde_json::from_str::<serde_json::Value>(&response_text) {
                    Ok(json) => {
                        let stored_otp = json
                            .get("result")
                            .and_then(|v| v.as_str())
                            .unwrap_or_default();
                        stored_otp == otp
                    }
                    Err(_) => false,
                }
            }
            Err(_) => false,
        }
    }
}

fn create_html_template() -> String {
    r####"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>LinkSphere OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(to bottom right, #ffffff, #f3e8ff); color: #1f2937; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; min-height: 100vh;">
    <div style="max-width: 600px; margin: 48px auto; padding: 32px 16px;">
        <div style="background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 32px 40px; border: 1px solid #e9d5ff;">
            <!-- Header Section -->
            <div style="text-align: center; padding-bottom: 32px; margin-bottom: 32px; border-bottom: 1px solid #f3f4f6;">
                <div style="margin-bottom: 16px;">
                    <img src="https://raw.githubusercontent.com/Nkwenti-Severian-Ndongtsop/LinkSphere/refs/heads/master/my-link-uploader/public/logo.png" 
                         alt="LinkSphere Logo" 
                         style="height: 80px; width: auto; margin-bottom: 16px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h1 style="margin: 0; background: linear-gradient(to right, #7e22ce, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 48px; font-weight: 800; line-height: 1; letter-spacing: -0.025em;">
                        LinkSphere
                    </h1>
                </div>
                <p style="color: #4b5563; font-size: 20px; font-weight: 300; margin: 0;">Organize, manage, and share your links — beautifully.</p>
            </div>

            <!-- Main Verification Message -->
            <h2 style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 24px; text-align: center; line-height: 1.2;">
                Verify Your Identity
            </h2>
            
            <p style="font-size: 18px; color: #374151; margin-bottom: 32px; text-align: center; line-height: 1.6;">
                To keep your account secure and your links protected, please use the one-time password (OTP) below to complete your login on <strong>LinkSphere</strong>.
            </p>
            
            <!-- OTP Display -->
            <div style="background-color: #f3e8ff; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <p style="color: #6b21a8; font-size: 18px; margin-bottom: 16px; font-weight: 500;">Your OTP code:</p>
                <div style="background-color: #ffffff; border-radius: 12px; display: inline-block; padding: 20px 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e9d5ff;">
                    <span style="font-size: 48px; font-weight: 800; color: #000000; letter-spacing: 0.1em; line-height: 1;">
                        {otp}
                    </span>
                </div>
                <p style="margin-top: 24px; font-size: 16px; color: #6b21a8; font-weight: 500;">
                    This code will expire in <span style="font-weight: 800; color: #581c87;">5 minutes</span>. Please don't share it with anyone.
                </p>
            </div>

            <!-- Security Notice -->
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
                If you didn't request this code, simply ignore this email — your data is safe, and no changes will be made.
            </p>

            <!-- Footer Section -->
            <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p style="margin-bottom: 8px;">Need help? Visit our <a href="#" style="color: #7c3aed; text-decoration: none; font-weight: 500;">Help Center</a> or reach us at <a href="mailto:support@linksphere.com" style="color: #7c3aed; text-decoration: none; font-weight: 500;">support@linksphere.com</a>.</p>
                <p style="margin: 0;">&copy; 2024 LinkSphere. All rights reserved.</p>
                <p style="margin-top: 4px; font-style: italic;">This is an automated message — please do not reply.</p>
            </div>
        </div>
    </div>
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
Need help? Contact us at support@linksphere.com

This is an automated message — please do not reply."####
        .to_string()
}
