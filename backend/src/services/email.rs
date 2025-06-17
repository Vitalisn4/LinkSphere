use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, AsyncSmtpTransport,
    AsyncTransport, Message, Tokio1Executor,
};
use rand::random;
use reqwest;
use serde_json::json;
use std::{env, time::Duration};
use tokio::time::sleep;

const OTP_EXPIRY_SECONDS: u64 = 300; // 5 minutes
const MAX_RETRY_ATTEMPTS: u32 = 3;
const RETRY_DELAY_MS: u64 = 1000; // 1 second
const MAX_OTP_ATTEMPTS: i32 = 5;

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
        // Check rate limiting
        let attempts = self.get_attempt_count(email).await?;
        if attempts >= MAX_OTP_ATTEMPTS {
            return Err("Maximum OTP attempts exceeded. Please contact support to unlock your account.".into());
        }

        let otp = self.generate_otp();

        // Store OTP in Redis with expiration
        let client = reqwest::Client::new();
        let set_url = format!("{}/set/otp:{}", self.upstash_url, email);

        // Store OTP with retry logic
        for attempt in 1..=MAX_RETRY_ATTEMPTS {
            match client
                .post(&set_url)
                .header("Authorization", format!("Bearer {}", self.upstash_token))
                .json(&json!({
                    "value": otp,
                    "ex": OTP_EXPIRY_SECONDS
                }))
                .send()
                .await
            {
                Ok(_) => break,
                Err(e) if attempt == MAX_RETRY_ATTEMPTS => return Err(e.into()),
                Err(_) => sleep(Duration::from_millis(RETRY_DELAY_MS)).await,
            }
        }

        // Increment attempt counter (without expiry to maintain block)
        self.increment_attempt_count(email).await?;

        // Create and send email with retry logic
        let email_message = self.create_email_message(email, &otp)?;
        
        for attempt in 1..=MAX_RETRY_ATTEMPTS {
            match self.smtp_transport.send(email_message.clone()).await {
                Ok(_) => return Ok(()),
                Err(e) if attempt == MAX_RETRY_ATTEMPTS => return Err(e.into()),
                Err(_) => sleep(Duration::from_millis(RETRY_DELAY_MS)).await,
            }
        }

        Ok(())
    }

    async fn get_attempt_count(&self, email: &str) -> Result<i32, Box<dyn std::error::Error>> {
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

    async fn increment_attempt_count(&self, email: &str) -> Result<(), Box<dyn std::error::Error>> {
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
    pub async fn admin_reset_attempts(&self, email: &str, admin_token: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Verify admin token
        let expected_token = env::var("ADMIN_SECRET_KEY")
            .map_err(|_| "Admin secret not configured")?;
        
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

    fn create_email_message(&self, to_email: &str, otp: &str) -> Result<Message, Box<dyn std::error::Error>> {
        let email_html = format!(
            r####"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkSphere OTP Verification</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    body {{
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(to bottom right, white, #f3e8ff);
      color: #1f2937;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .wrapper {{
      width: 100%;
      max-width: 100%;
      padding: 1rem;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
    }}
    .container {{
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      width: 100%;
      max-width: 32rem;
      margin: 1rem;
      border: 1px solid #e9d5ff;
    }}
    .header {{
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }}
    .logo {{
      height: 3rem;
      width: 3rem;
      border-radius: 50%;
      margin-bottom: 0.75rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }}
    .brand {{
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(to right, #7e22ce, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }}
    .subtitle {{
      color: #4b5563;
      font-size: 1rem;
      font-weight: 300;
      margin: 0.5rem 0 0;
    }}
    .main-title {{
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      margin: 0 0 1rem;
    }}
    .description {{
      font-size: 1rem;
      color: #374151;
      text-align: center;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }}
    .otp-box {{
      background: #f3e8ff;
      padding: 1.5rem;
      border-radius: 0.75rem;
      text-align: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
      margin: 0 -0.5rem;
    }}
    .otp-label {{
      color: #6b21a8;
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }}
    .otp-code {{
      background: white;
      border: 1px solid #d8b4fe;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      display: inline-block;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: 0.2rem;
      color: #111827;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }}
    .otp-expiry {{
      margin-top: 1rem;
      color: #6b21a8;
      font-size: 0.875rem;
      font-weight: 500;
    }}
    .otp-expiry span {{
      font-weight: 800;
      color: #4c1d95;
    }}
    .notice {{
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      line-height: 1.5;
      text-align: center;
    }}
    .footer {{
      text-align: center;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }}
    .footer a {{
      color: #9333ea;
      text-decoration: none;
      font-weight: 500;
    }}
    .footer a:hover {{
      text-decoration: underline;
    }}
    .italic {{
      font-style: italic;
    }}
    @media (max-width: 640px) {{
      .container {{
        margin: 0.5rem;
        padding: 1rem;
      }}
      .brand {{
        font-size: 1.75rem;
      }}
      .main-title {{
        font-size: 1.25rem;
      }}
      .otp-code {{
        font-size: 1.75rem;
        padding: 0.5rem 1rem;
      }}
      .description, .notice {{
        font-size: 0.875rem;
      }}
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img class="logo" src="https://raw.githubusercontent.com/Nkwenti-Severian-Ndongtsop/LinkSphere/refs/heads/master/my-link-uploader/public/logo.png" alt="LinkSphere Logo">
        <h1 class="brand">LinkSphere</h1>
        <p class="subtitle">Organize, manage, and share your links — beautifully.</p>
      </div>
      <h2 class="main-title">Verify Your Identity</h2>
      <p class="description">
        To keep your account secure and your links protected, please use the one-time password (OTP) below to complete your login on <strong>LinkSphere</strong>.
      </p>
      <div class="otp-box">
        <p class="otp-label">Your OTP code:</p>
        <div class="otp-code">{otp}</div>
        <p class="otp-expiry">
          This code will expire in <span>5 minutes</span>. Please don't share it with anyone.
        </p>
      </div>
      <p class="notice">
        If you didn't request this code, simply ignore this email — your data is safe, and no changes will be made.
      </p>
      <div class="footer">
        <p>Need help? Visit our <a href="#">Help Center</a> or reach us at <a href="mailto:support@linksphere.com">support@linksphere.com</a>.</p>
        <p>&copy; 2025 LinkSphere. All rights reserved.</p>
        <p class="italic">This is an automated message — please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>"####,
            otp = otp
        );

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
                match response.json::<serde_json::Value>().await {
                    Ok(json) => {
                        if let Some(result) = json.get("result").and_then(|v| v.as_str()) {
                            match serde_json::from_str::<serde_json::Value>(result) {
                                Ok(parsed) => {
                                    if let Some(stored_otp) =
                                        parsed.get("value").and_then(|v| v.as_str())
                                    {
                                        return stored_otp == otp;
                                    }
                                    println!("No 'value' field found in parsed JSON: {:?}", parsed);
                                }
                                Err(e) => println!("Failed to parse result JSON: {}", e),
                            }
                        } else {
                            println!("No 'result' field found in response: {:?}", json);
                        }
                    }
                    Err(e) => println!("Failed to parse response JSON: {}", e),
                }
                false
            }
            Err(e) => {
                println!("Failed to send request: {}", e);
                false
            }
        }
    }
}
