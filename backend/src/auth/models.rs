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

#[derive(Debug, Serialize, Deserialize, sqlx::Type, ToSchema, PartialEq, Clone)]
#[sqlx(type_name = "user_status", rename_all = "lowercase")]
pub enum UserStatus {
    Active,
    Inactive,
    Suspended,
}

fn validate_username(username: &str) -> Result<(), validator::ValidationError> {
    if USERNAME_REGEX.is_match(username) {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_username"))
    }
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,
    pub exp: i64,
    pub email: String,
    pub username: String,
}

lazy_static::lazy_static! {
    static ref USERNAME_REGEX: regex::Regex = regex::Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap();
}
