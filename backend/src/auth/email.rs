use lettre::{
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};
use rand::Rng;
use std::env;
use reqwest;
use serde_json::json;

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
        
        // Store OTP with expiry in Upstash
        let client = reqwest::Client::new();
        let set_url = format!("{}/set/otp:{}", self.upstash_url, email);
        
        client.post(&set_url)
            .header("Authorization", format!("Bearer {}", self.upstash_token))
            .json(&json!({
                "value": otp,
                "ex": OTP_EXPIRY_SECONDS
            }))
            .send()
            .await?;

        let email_body = format!(
            "Your verification code is: {}\n\nThis code will expire in 5 minutes.",
            otp
        );

        let email = Message::builder()
            .from("LinkSphere <noreply@linksphere.com>".parse()?)
            .to(email.parse()?)
            .subject("Email Verification Code")
            .body(email_body)?;

        self.smtp_transport.send(email).await?;
        Ok(())
    }

    pub async fn verify_otp(&self, email: &str, otp: &str) -> bool {
        let client = reqwest::Client::new();
        let get_url = format!("{}/get/otp:{}", self.upstash_url, email);
        
        match client.get(&get_url)
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
            Err(_) => false
        }
    }

    fn generate_otp(&self) -> String {
        rand::thread_rng()
            .sample_iter(&rand::distributions::Uniform::new(0, 10))
            .take(6)
            .map(|d| d.to_string())
            .collect()
    }
} 