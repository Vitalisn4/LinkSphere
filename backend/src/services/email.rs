use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, AsyncSmtpTransport,
    AsyncTransport, Message, Tokio1Executor,
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
            r##"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LinkSphere OTP Verification</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    body {{
      font-family: 'Inter', sans-serif;
    }}
    .font-playfair {{
      font-family: 'Playfair Display', serif;
    }}
  </style>
</head>
<body class=\"bg-gradient-to-br from-white to-purple-50 text-gray-800 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-inter\">
  <div class=\"bg-white rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12 max-w-2xl mx-auto w-full border border-purple-100\">
    <div class=\"text-center pb-8 mb-8 border-b border-gray-100\">
      <div class=\"flex flex-col items-center justify-center mb-4\">
        <img src=\"https://raw.githubusercontent.com/Nkwenti-Severian-Ndongtsop/LinkSphere/refs/heads/master/my-link-uploader/public/logo.png\" 
             alt=\"LinkSphere Logo\" class=\"h-16 sm:h-20 w-auto mb-4 rounded-full shadow-md\">
        <h1 class=\"text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 text-5xl sm:text-6xl font-extrabold tracking-tight leading-none font-playfair\">
          LinkSphere
        </h1>
      </div>
      <p class=\"text-gray-600 text-xl font-light\">Organize, manage, and share your links — beautifully.</p>
    </div>
    <h2 class=\"text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center leading-tight\">
      Verify Your Identity
    </h2>
    <p class=\"text-lg text-gray-700 leading-relaxed mb-8 text-center\">
      To keep your account secure and your links protected, please use the one-time password (OTP) below to complete your login on <strong>LinkSphere</strong>.
    </p>
    <div class=\"bg-purple-100 rounded-2xl p-8 my-8 text-center shadow-lg\">
      <p class=\"text-purple-800 text-lg mb-4 font-medium\">Your OTP code:</p>
      <div class=\"bg-white rounded-xl inline-block px-10 py-5 shadow-2xl border border-purple-300\">
        <span class=\"text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-widest leading-none\">{}</span>
      </div>
      <p class=\"mt-6 text-base text-purple-800 font-medium\">
        This code will expire in <span class=\"font-extrabold text-purple-900\">5 minutes</span>. Please don't share it with anyone.
      </p>
    </div>
    <p class=\"text-md text-gray-600 leading-relaxed mb-8 pt-6 border-t border-gray-100\">
      If you didn't request this code, simply ignore this email — your data is safe, and no changes will be made.
    </p>
    <div class=\"text-center mt-10 pt-6 border-t border-gray-200 text-gray-500 text-sm\">
      <p class=\"mb-2\">Need help? Visit our <a href=\"#\" class=\"text-purple-600 hover:underline font-medium\">Help Center</a> or reach us at <a href=\"mailto:support@linksphere.com\" class=\"text-purple-600 hover:underline font-medium\">support@linksphere.com</a>.</p>
      <p>&copy; 2024 LinkSphere. All rights reserved.</p>
      <p class=\"mt-1 italic\">This is an automated message — please do not reply.</p>
    </div>
  </div>
</body>
</html>"##,
            otp
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

    fn generate_otp(&self) -> String {
        let mut rng = rand::rng();
        (0..6)
            .map(|_| rng.random_range(0..10).to_string())
            .collect()
    }
}
