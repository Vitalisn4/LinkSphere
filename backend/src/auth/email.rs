use lettre::{
    transport::smtp::authentication::Credentials, AsyncSmtpTransport, AsyncTransport, Message,
    Tokio1Executor,
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

        // Store OTP with expiry in Upstash
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

        let html_body = format!(
            r#"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .container {{
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 30px;
                    }}
                    .logo {{
                        color: #6366f1;
                        font-size: 28px;
                        font-weight: bold;
                        text-decoration: none;
                    }}
                    .otp-container {{
                        background-color: #f3f4f6;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 25px 0;
                    }}
                    .otp {{
                        font-size: 32px;
                        font-weight: bold;
                        color: #4f46e5;
                        letter-spacing: 4px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">LinkSphere</div>
                    </div>
                    
                    <h2>Welcome to LinkSphere! 🎉</h2>
                    
                    <p>We're excited to have you join our community. To get started, please verify your email address using the verification code below:</p>
                    
                    <div class="otp-container">
                        <div class="otp">{}</div>
                        <p style="margin-top: 10px; color: #6b7280;">This code will expire in 5 minutes</p>
                    </div>
                    
                    <p>Once verified, you'll have full access to:</p>
                    <ul>
                        <li>Share and organize your favorite links</li>
                        <li>Connect with other members</li>
                        <li>Discover amazing content</li>
                    </ul>
                    
                    <p>If you didn't create an account with LinkSphere, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>© 2025 LinkSphere. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        "#,
            otp
        );

        let email = Message::builder()
            .from("LinkSphere <noreply@linksphere.com>".parse()?)
            .to(email.parse()?)
            .subject("Welcome to LinkSphere - Verify Your Email")
            .header(lettre::message::header::ContentType::TEXT_HTML)
            .body(html_body)?;

        self.smtp_transport.send(email).await?;
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
