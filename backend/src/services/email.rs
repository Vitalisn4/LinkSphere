use lettre::{
    transport::smtp::authentication::Credentials,
    transport::smtp::client::{Tls, TlsParameters},
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};
use rand::random;
use reqwest;
use serde_json::json;
use std::error::Error;
use std::sync::OnceLock;
use std::{env, time::Duration};
use tokio::time::sleep;

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
    smtp_transport: AsyncSmtpTransport<Tokio1Executor>,
    upstash_url: String,
    upstash_token: String,
    sender_email: String,
    sender_name: String,
}

impl EmailService {
    pub fn new() -> Result<Self, BoxError> {
        let smtp_host = env::var("SMTP_HOST").expect("SMTP_HOST must be set");
        let smtp_username = env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
        let smtp_password = env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set");
        let smtp_port = env::var("SMTP_PORT")
            .expect("SMTP_PORT must be set")
            .parse::<u16>()
            .expect("SMTP_PORT must be a valid number");
        let sender_email = env::var("SMTP_FROM_EMAIL").expect("SMTP_FROM_EMAIL must be set");
        let sender_name =
            env::var("SMTP_FROM_NAME").unwrap_or_else(|_| "LinkSphere Team".to_string());

        let upstash_url =
            env::var("UPSTASH_REDIS_REST_URL").expect("UPSTASH_REDIS_REST_URL must be set");
        let upstash_token =
            env::var("UPSTASH_REDIS_REST_TOKEN").expect("UPSTASH_REDIS_REST_TOKEN must be set");

        let creds = Credentials::new(smtp_username, smtp_password);

        // Configure TLS parameters
        let tls_parameters = TlsParameters::new(smtp_host.clone())?;

        let transport = if smtp_port == 465 {
            // Use implicit TLS for port 465
            AsyncSmtpTransport::<Tokio1Executor>::relay(&smtp_host)?
                .port(smtp_port)
                .credentials(creds)
                .tls(Tls::Wrapper(tls_parameters))
                .build()
        } else {
            // Use STARTTLS for port 587 and others
            AsyncSmtpTransport::<Tokio1Executor>::relay(&smtp_host)?
                .port(smtp_port)
                .credentials(creds)
                .tls(Tls::Required(tls_parameters))
                .build()
        };

        Ok(Self {
            smtp_transport: transport,
            upstash_url,
            upstash_token,
            sender_email,
            sender_name,
        })
    }

    /// Initiates OTP sending process without waiting for completion
    pub async fn initiate_otp_process(&self, email: &str) -> Result<(), BoxError> {
        // Check rate limiting first - this needs to be synchronous
        let attempts = self.get_attempt_count(email).await?;
        if attempts >= MAX_OTP_ATTEMPTS {
            return Err(
                "Maximum OTP attempts exceeded. Please contact support to unlock your account."
                    .into(),
            );
        }

        // Clone necessary data for the background task
        let email = email.to_string();
        let self_clone = self.clone();

        // Spawn background task
        tokio::spawn(async move {
            match self_clone.process_and_send_otp(&email).await {
                Ok(_) => tracing::info!(
                    "Background OTP process completed successfully for {}",
                    email
                ),
                Err(e) => tracing::error!("Background OTP process failed for {}: {}", email, e),
            }
        });

        Ok(())
    }

    /// Internal method to process and send OTP
    async fn process_and_send_otp(&self, email: &str) -> Result<(), BoxError> {
        let otp = self.generate_otp();

        // Store OTP and send email concurrently
        let store_otp_future = self.store_otp_with_retry(email, &otp);
        let send_email_future = self.send_email_with_retry(email, &otp);

        let (store_result, send_result) = tokio::join!(store_otp_future, send_email_future);

        // Check results
        store_result?;
        send_result?;

        // Increment attempt counter
        if let Err(e) = self.increment_attempt_count(email).await {
            tracing::error!("Failed to increment attempt counter: {}", e);
        }

        Ok(())
    }

    /// Deprecated: Use initiate_otp_process instead
    #[deprecated(note = "Use initiate_otp_process for better performance")]
    pub async fn send_otp(&self, email: &str) -> Result<(), BoxError> {
        self.initiate_otp_process(email).await
    }

    async fn send_email_with_retry(&self, to_email: &str, otp: &str) -> Result<(), BoxError> {
        let (html_content, text_content) = self.create_email_content(otp);

        for attempt in 0..MAX_RETRY_ATTEMPTS {
            let email = Message::builder()
                .from(format!("{} <{}>", self.sender_name, self.sender_email).parse()?)
                .to(to_email.parse()?)
                .subject("Verify Your LinkSphere Account")
                .multipart(
                    lettre::message::MultiPart::alternative()
                        .singlepart(lettre::message::SinglePart::plain(text_content.clone()))
                        .singlepart(lettre::message::SinglePart::html(html_content.clone())),
                )?;

            match self.smtp_transport.send(email).await {
                Ok(_) => {
                    tracing::debug!("Email sent successfully to {}", to_email);
                    return Ok(());
                }
                Err(e) if attempt == MAX_RETRY_ATTEMPTS - 1 => {
                    tracing::error!("Failed to send email after all attempts: {}", e);
                    return Err(format!("Failed to send email: {e}").into());
                }
                Err(e) => {
                    tracing::warn!("Failed to send email (attempt {}): {}", attempt + 1, e);
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

        tracing::debug!("Attempting to store OTP for email: {}", email);

        for attempt in 0..MAX_RETRY_ATTEMPTS {
            match client
                .post(set_url.clone())
                .header("Authorization", format!("Bearer {}", self.upstash_token))
                .json(&payload)
                .send()
                .await
            {
                Ok(resp) => {
                    let status = resp.status();
                    if status.is_success() {
                        let response_text = resp.text().await.unwrap_or_default();
                        tracing::debug!("Successfully stored OTP. Response: {}", response_text);
                        return Ok(());
                    } else if attempt == MAX_RETRY_ATTEMPTS - 1 {
                        let error_text = resp.text().await.unwrap_or_default();
                        tracing::error!(
                            "Failed to store OTP. Status: {}, Error: {}",
                            status,
                            error_text
                        );
                        return Err(
                            "Failed to store OTP: server returned non-success status".into()
                        );
                    }
                }
                Err(e) => {
                    tracing::error!("Error storing OTP (attempt {}): {}", attempt + 1, e);
                    if attempt == MAX_RETRY_ATTEMPTS - 1 {
                        return Err(format!("Failed to store OTP: {e}").into());
                    }
                    sleep(Duration::from_millis(RETRY_DELAY_MS * attempt as u64)).await;
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
                Err(e) => tracing::error!("Failed to delete key {url}: {e}"),
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
                if !response.status().is_success() {
                    return false;
                }

                let json: serde_json::Value = match response.json().await {
                    Ok(json) => json,
                    Err(_) => return false,
                };

                // Get the stored OTP directly from the nested structure
                let stored_otp = json
                    .get("result")
                    .and_then(|result| result.as_str())
                    .and_then(|s| serde_json::from_str::<serde_json::Value>(s).ok())
                    .and_then(|data| {
                        data.get("value")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string())
                    })
                    .unwrap_or_default();

                if stored_otp.is_empty() {
                    return false;
                }

                let matches = stored_otp == otp;
                if matches {
                    // Delete OTP in background
                    let email = email.to_string();
                    let service = self.clone();
                    tokio::spawn(async move {
                        if let Err(e) = service.delete_otp(&email).await {
                            tracing::error!("Failed to delete used OTP: {e}");
                        }
                    });
                }

                matches
            }
            Err(_) => false,
        }
    }

    async fn delete_otp(&self, email: &str) -> Result<(), BoxError> {
        let client = reqwest::Client::new();
        let del_url = format!("{}/del/otp:{}", self.upstash_url, email);

        client
            .post(&del_url)
            .header("Authorization", format!("Bearer {}", self.upstash_token))
            .send()
            .await?;

        Ok(())
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
            <div style="background-color: #f3e8ff; border-radius: 16px; padding: 24px 8px; margin: 24px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <p style="color: #6b21a8; font-size: 18px; margin-bottom: 16px; font-weight: 500;">Your OTP code:</p>
                <div style="background-color: #ffffff; border-radius: 12px; display: inline-block; padding: 16px 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e9d5ff; max-width: 90vw; width: 100%; box-sizing: border-box;">
                    <span style="font-size: 36px; font-weight: 800; color: #000000; letter-spacing: 0.1em; line-height: 1;">
                        {otp}
                    </span>
                </div>
                <p style="margin-top: 20px; font-size: 15px; color: #6b21a8; font-weight: 500;">
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
