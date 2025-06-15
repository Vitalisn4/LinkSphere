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
            r#"<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkSphere OTP Verification</title>
                <style>
                    body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
                    }}
                    .container {{
            max-width: 600px;
            margin: 40px auto;
            padding: 32px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
                    }}
                    .header {{
                        text-align: center;
            padding-bottom: 32px;
            margin-bottom: 32px;
            border-bottom: 1px solid #e5e7eb;
                    }}
                    .logo {{
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 16px;
        }}
        .brand {{
            font-size: 48px;
            font-weight: 800;
            color: #7c3aed;
            margin: 16px 0 8px;
        }}
        .title {{
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            text-align: center;
            margin-bottom: 24px;
                    }}
                    .otp-container {{
            background-color: #f3e8ff;
            border-radius: 16px;
            padding: 32px;
                        text-align: center;
            margin: 32px 0;
                    }}
        .otp-code {{
            background: white;
            display: inline-block;
            padding: 40px 60px;
            border-radius: 12px;
            font-size: 48px;
            font-weight: 800;
            color: #111827;
            letter-spacing: 0.2em;
            border: 1px solid #d8b4fe;
                    }}
                    .footer {{
                        text-align: center;
            margin-top: 40px;
            padding-top: 24px;
                        border-top: 1px solid #e5e7eb;
                        color: #6b7280;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
            <img src="https://raw.githubusercontent.com/Nkwenti-Severian-Ndongtsop/LinkSphere/refs/heads/master/my-link-uploader/public/logo.png" 
                 alt="LinkSphere Logo" class="logo">
            <h1 class="brand">LinkSphere</h1>
            <p>Organize, manage, and share your links — beautifully.</p>
                    </div>
                    
        <h2 class="title">Verify Your Identity</h2>
                    
        <p style="font-size: 18px; color: #374151; line-height: 1.75; margin-bottom: 32px; text-align: center;">
            To keep your account secure and your links protected, please use the one-time password (OTP) below to complete your login on <strong>LinkSphere</strong>.
        </p>
                    
                    <div class="otp-container">
            <p>Your verification code:</p>
            <div class="otp-code">{otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>Please don't share this code with anyone.</p>
                    </div>
                    
        <p>If you didn't request this code, you can safely ignore this email.</p>
                    
                    <div class="footer">
            <p>&copy; 2024 LinkSphere. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
</html>
            "#,
            otp = otp
        );

        let email = Message::builder()
            .from("LinkSphere <no-reply@linksphere.io>".parse()?)
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
