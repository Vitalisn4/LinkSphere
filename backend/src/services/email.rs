use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, AsyncSmtpTransport,
    AsyncTransport, Message, Tokio1Executor,
};
use rand::random;
use reqwest;
use serde_json::json;
use std::{env, time::Duration};
use tokio::{task, time::sleep};
use std::error::Error;
use std::sync::OnceLock;

const OTP_EXPIRY_SECONDS: u64 = 300; // 5 minutes
const MAX_RETRY_ATTEMPTS: u32 = 3;
const RETRY_DELAY_MS: u64 = 250; // Reduced from 1000ms to 250ms
const MAX_OTP_ATTEMPTS: i32 = 5;

// Cache for email template
static EMAIL_TEMPLATE: OnceLock<String> = OnceLock::new();

type BoxError = Box<dyn Error + Send + Sync + 'static>;

#[derive(Clone)]
pub struct EmailService {
    smtp_transport: AsyncSmtpTransport<Tokio1Executor>,
    upstash_url: String,
    upstash_token: String,
}

impl EmailService {
    pub fn new() -> Result<Self, BoxError> {
        let smtp_username = env::var("SMTP_USERNAME")?;
        let smtp_password = env::var("SMTP_PASSWORD")?;
        let smtp_server = env::var("SMTP_SERVER").unwrap_or_else(|_| "smtp.gmail.com".to_string());
        let upstash_url = env::var("UPSTASH_REDIS_REST_URL")?;
        let upstash_token = env::var("UPSTASH_REDIS_REST_TOKEN")?;

        let creds = Credentials::new(smtp_username, smtp_password);
        let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay(&smtp_server)?
            .credentials(creds)
            .timeout(Some(Duration::from_secs(10))) // Add timeout
            .pool_config(lettre::transport::smtp::PoolConfig::new().max_size(20)) // Connection pooling
            .build();

        Ok(Self {
            smtp_transport: mailer,
            upstash_url,
            upstash_token,
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

        // Spawn Redis operation in parallel with email sending
        let store_otp_future = self.store_otp_with_retry(email, &otp);
        let send_email_future = self.send_email_with_retry(email, &otp);
        
        // Run both operations concurrently
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

    async fn store_otp_with_retry(&self, email: &str, otp: &str) -> Result<(), BoxError> {
        let client = reqwest::Client::new();
        let set_url = format!("{}/set/otp:{}", self.upstash_url, email);
        let payload = json!({
            "value": otp,
            "ex": OTP_EXPIRY_SECONDS
        });

        for attempt in 0..MAX_RETRY_ATTEMPTS {
            match client
                .post(&set_url.clone())
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

    async fn send_email_with_retry(&self, to_email: &str, otp: &str) -> Result<(), BoxError> {
        let email_message = self.create_email_message(to_email, otp)?;
        
        for attempt in 0..MAX_RETRY_ATTEMPTS {
            match self.smtp_transport.send(email_message.clone()).await {
                Ok(_) => return Ok(()),
                Err(e) if attempt == MAX_RETRY_ATTEMPTS - 1 => return Err(e.into()),
                Err(_) => {
                    sleep(Duration::from_millis(RETRY_DELAY_MS * attempt as u64)).await;
                    continue;
                }
            }
        }

        Err("Failed to send email after all retry attempts".into())
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
    pub async fn admin_reset_attempts(&self, email: &str, admin_token: &str) -> Result<(), BoxError> {
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

    fn create_email_message(&self, to_email: &str, otp: &str) -> Result<Message, BoxError> {
        // Use cached template or create and cache it
        let email_template = EMAIL_TEMPLATE.get_or_init(create_optimized_email_template);
        let email_html = email_template.replace("{otp}", otp);

        Ok(Message::builder()
            .from("LinkSphere <noreply@linksphere.com>".parse()?)
            .to(to_email.parse()?)
            .subject("Verify Your Email - LinkSphere")
            .header(ContentType::TEXT_HTML)
            .body(email_html)?)
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
                        // Handle null result case
                        if json.get("result").is_none() || json.get("result").unwrap().is_null() {
                            println!("No OTP found for email");
                            return false;
                        }

                        // Parse the nested JSON string from the result
                        let result_str = json
                            .get("result")
                            .and_then(|v| v.as_str())
                            .unwrap_or_default();

                        match serde_json::from_str::<serde_json::Value>(result_str) {
                            Ok(nested_json) => {
                                let stored_otp = nested_json
                                    .get("value")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or_default();

                                println!(
                                    "Comparing OTP: stored='{}' vs provided='{}'",
                                    stored_otp, otp
                                );
                                let matches = stored_otp == otp;
                                println!("OTP match result: {}", matches);
                                matches
                            }
                            Err(_) => {
                                false
                            }
                        }
                    }
                    Err(e) => {
                        println!("Failed to parse Redis response: {}", e);
                        false
                    }
                }
            }
            Err(e) => {
                println!("Failed to send request to Redis: {}", e);
                false
            }
        }
    }
}

fn create_optimized_email_template() -> String {
    // Minified version of the existing template
    // Remove unnecessary whitespace and optimize CSS
    r####"<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LinkSphere OTP Verification</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@500;700;800&display=swap" rel="stylesheet"><style>body{margin:0;padding:0;font-family:Inter,sans-serif;background:linear-gradient(to bottom right,#fff,#f3e8ff);color:#1f2937;min-height:100vh;display:flex;align-items:center;justify-content:center}*{box-sizing:border-box}.wrapper{width:100%;max-width:100%;padding:1rem;display:flex;justify-content:center}.container{background:#fff;border-radius:1rem;box-shadow:0 10px 25px rgba(0,0,0,.1);padding:1.5rem;width:100%;max-width:32rem;margin:1rem;border:1px solid #e9d5ff}.header{text-align:center;border-bottom:1px solid #f3f4f6;padding-bottom:1.5rem;margin-bottom:1.5rem}.logo{height:3rem;width:3rem;border-radius:50%;margin-bottom:.75rem;box-shadow:0 4px 12px rgba(0,0,0,.1)}.brand{font-family:'Playfair Display',serif;font-size:2rem;font-weight:800;background:linear-gradient(to right,#7e22ce,#4f46e5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0}.subtitle,.main-title{margin:0}.description,.notice{line-height:1.5}.otp-box{background:#f3e8ff;padding:1.5rem;border-radius:.75rem;text-align:center;margin:0 -.5rem}.otp-code{background:#fff;border:1px solid #d8b4fe;padding:.75rem 1.5rem;border-radius:.5rem;display:inline-block;font-size:2rem;font-weight:800;letter-spacing:.2rem;color:#111827;box-shadow:0 10px 30px rgba(0,0,0,.1)}.footer{text-align:center;font-size:.75rem;color:#6b7280;margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e5e7eb}@media (max-width:640px){.container{margin:.5rem;padding:1rem}.brand{font-size:1.75rem}.main-title{font-size:1.25rem}.otp-code{font-size:1.75rem;padding:.5rem 1rem}}</style></head><body><div class="wrapper"><div class="container"><div class="header"><img class="logo" src="https://raw.githubusercontent.com/Nkwenti-Severian-Ndongtsop/LinkSphere/refs/heads/master/my-link-uploader/public/logo.png" alt="LinkSphere Logo"><h1 class="brand">LinkSphere</h1><p class="subtitle">Organize, manage, and share your links — beautifully.</p></div><h2 class="main-title">Verify Your Identity</h2><p class="description">To keep your account secure and your links protected, please use the one-time password (OTP) below to complete your login on <strong>LinkSphere</strong>.</p><div class="otp-box"><p class="otp-label">Your OTP code:</p><div class="otp-code">{otp}</div><p class="otp-expiry">This code will expire in <span>5 minutes</span>. Please don't share it with anyone.</p></div><p class="notice">If you didn't request this code, simply ignore this email — your data is safe, and no changes will be made.</p><div class="footer"><p>Need help? Visit our <a href="#">Help Center</a> or reach us at <a href="mailto:support@linksphere.com">support@linksphere.com</a>.</p><p>&copy; 2025 LinkSphere. All rights reserved.</p><p class="italic">This is an automated message — please do not reply.</p></div></div></div></body></html>"####.to_string()
}
