use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, ToSchema, PartialEq, Clone)]
#[sqlx(type_name = "user_gender", rename_all = "lowercase")]
pub enum Gender {
    Male,
    Female,
    Other,
}

impl std::fmt::Display for Gender {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self:?}")
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, ToSchema, PartialEq, Clone)]
#[sqlx(type_name = "user_status", rename_all = "snake_case")]
pub enum UserStatus {
    Active,
    Inactive,
    Suspended,
    PendingVerification,
}

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema, Clone)]
pub struct User {
    #[schema(example = "123e4567-e89b-12d3-a456-426614174000")]
    pub id: Uuid,

    #[validate(email)]
    #[schema(example = "user@example.com")]
    pub email: String,

    #[validate(length(min = 3, max = 50))]
    #[validate(custom(
        function = "validate_username",
        message = "Username must be alphanumeric with underscores only"
    ))]
    #[schema(example = "john_doe")]
    pub username: String,

    pub password_hash: String,
    pub gender: Gender,
    pub status: UserStatus,
    pub is_verified: bool,
    pub verification_attempts: i32,
    pub verified_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate, ToSchema, Clone)]
pub struct RegisterRequest {
    #[validate(email(message = "Invalid email format"))]
    #[schema(example = "user@example.com")]
    pub email: String,

    #[validate(length(min = 3, max = 50))]
    #[validate(custom(
        function = "validate_username",
        message = "Username must be alphanumeric with underscores only"
    ))]
    #[schema(example = "john_doe")]
    pub username: String,

    #[validate(length(min = 6))]
    #[schema(example = "StrongP@ssw0rd")]
    pub password: String,

    pub gender: Gender,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[validate(email(message = "Invalid email format"))]
    #[schema(example = "user@example.com")]
    pub email: String,

    #[schema(example = "StrongP@ssw0rd")]
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct AuthResponse {
    #[schema(example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    pub token: String,
    pub user: User,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct VerifyEmailRequest {
    #[validate(email(message = "Invalid email format"))]
    #[schema(example = "user@example.com")]
    pub email: String,

    #[validate(length(equal = 6))]
    #[schema(example = "123456")]
    pub otp: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct ResendOtpRequest {
    #[validate(email(message = "Invalid email format"))]
    #[schema(example = "user@example.com")]
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,
    pub exp: i64,
    pub email: String,
    pub username: String,
}

fn validate_username(username: &str) -> Result<(), validator::ValidationError> {
    let username_regex = regex::Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap();
    if username_regex.is_match(username) {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_username"))
    }
}
