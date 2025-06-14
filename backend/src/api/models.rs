use regex;
use serde::Deserialize;
use url::Url;
use utoipa::ToSchema;
use validator::Validate;

/// Request payload for creating a new link
#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct CreateLinkRequest {
    /// The complete URL to be added. Must be a valid URL starting with http:// or https://
    #[validate(url(message = "Invalid URL format"))]
    #[schema(example = "https://www.rust-lang.org")]
    pub url: String,

    /// A descriptive title for the link
    #[validate(length(
        min = 1,
        max = 255,
        message = "Title must be between 1 and 255 characters"
    ))]
    #[schema(example = "Official Rust Website")]
    pub title: String,

    /// A detailed description of what the link contains or represents
    #[validate(length(
        min = 1,
        max = 1000,
        message = "Description must be between 1 and 1000 characters"
    ))]
    #[schema(example = "The home page of the Rust programming language")]
    pub description: String,
}

impl CreateLinkRequest {
    pub fn validate_url(&self) -> Result<Url, url::ParseError> {
        Url::parse(&self.url)
    }
}

lazy_static::lazy_static! {
    static ref USERNAME_REGEX: regex::Regex = regex::Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap();
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 3))]
    pub username: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct VerifyEmailRequest {
    /// The email address to verify
    #[validate(email(message = "Invalid email format"))]
    #[schema(example = "user@example.com")]
    pub email: String,

    /// The 6-digit OTP code sent to the email
    #[validate(length(equal = 6, message = "OTP must be exactly 6 digits"))]
    #[validate(custom(function = "validate_otp", message = "OTP must contain only digits"))]
    #[schema(example = "123456")]
    pub otp: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct ResendOtpRequest {
    /// The email address to resend the OTP to
    #[validate(email(message = "Invalid email format"))]
    #[schema(example = "user@example.com")]
    pub email: String,
}

lazy_static::lazy_static! {
    static ref OTP_REGEX: regex::Regex = regex::Regex::new(r"^[0-9]{6}$").unwrap();
}

fn validate_otp(otp: &str) -> Result<(), validator::ValidationError> {
    if otp.chars().all(|c| c.is_ascii_digit()) {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_otp"))
    }
}
