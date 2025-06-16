use lettre::{
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport,
    AsyncTransport,
    Message,
    Tokio1Executor,
    message::header::ContentType,
};
use rand::Rng;
use reqwest;
use serde_json::json;
use std::env;

const OTP_EXPIRY_SECONDS: u64 = 300; // 5 minutes

#[derive(Clone)]
pub struct EmailService {
    smtp_transport: AsyncSmtpTransport<Tokio1Executor>,
    upstash_url: String,
    upstash_token: String,
}

impl EmailService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let smtp_username = env::var("SMTP_USERNAME")?;
        let smtp_password = env::var("SMTP_PASSWORD")?;
        let smtp_server = env::var("SMTP_SERVER").unwrap_or_else(|_| "smtp.gmail.com".to_string());
        let upstash_url = env::var("UPSTASH_REDIS_REST_URL")?;
        let upstash_token = env::var("UPSTASH_REDIS_REST_TOKEN")?;

        let creds = Credentials::new(smtp_username, smtp_password);
        let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay(&smtp_server)?
            .credentials(creds)
            .build();

        Ok(Self {
            smtp_transport: mailer,
            upstash_url,
            upstash_token,
        })
    }

    pub async fn send_otp(&self, email: &str) -> Result<(), Box<dyn std::error::Error>> {
        let otp = self.generate_otp();
        
        // Store OTP in Redis with expiration
        let client = reqwest::Client::new();
        let set_url = format!("{}/set/otp:{}", self.upstash_url, email);
        
        client
            .post(&set_url)
            .header("Authorization", format!("Bearer {}", self.upstash_token))
            .json(&json!({
                "value": otp,
                "ex": OTP_EXPIRY_SECONDS
            }))
            .send()
            .await?;

        // Create email HTML
        let email_html = format!(
            r#"
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6b21a8; margin-bottom: 20px;">Welcome to LinkSphere!</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                    Thank you for registering. To complete your registration, please use the following verification code:
                </p>
                <div style="margin: 30px 0; text-align: center;">
                    {}
                </div>
                <p style="color: #374151; font-size: 14px;">
                    This code will expire in 5 minutes. If you didn't request this verification, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px; text-align: center;">
                    &copy; 2024 LinkSphere. All rights reserved.
                </p>
            </div>
            "#,
            otp.chars()
                .map(|c| format!(
                    r#"<span class="otp-digit" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; font-size: 28px; font-weight: bold; width: 40px; height: 40px; line-height: 40px; text-align: center; border-radius: 8px; margin: 0 4px;">{}</span>"#,
                    c
                ))
                .collect::<Vec<String>>()
                .join("")
        );

        let email_message = Message::builder()
            .from("LinkSphere <noreply@linksphere.com>".parse()?)
            .to(email.parse()?)
            .subject("Verify Your Email - LinkSphere")
            .header(ContentType::TEXT_HTML)
            .body(email_html)?;

        self.smtp_transport.send(email_message).await?;
        Ok(())
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
                if let Ok(json) = response.json::<serde_json::Value>().await {
                    if let Some(result) = json.get("result").and_then(|v| v.as_str()) {
                        // Parse the result which is a JSON string
                        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(result) {
                            if let Some(stored_otp) = parsed.get("value").and_then(|v| v.as_str()) {
                                return stored_otp == otp;
                            }
                        }
                    }
                }
                false
            }
            Err(_) => false,
        }
    }

    fn generate_otp(&self) -> String {
        let mut rng = rand::rng();
        (0..6)
            .map(|_| rng.random_range(0..10).to_string())
            .collect()
    }
} 