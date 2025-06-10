use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;
use validator::Validate;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, ToSchema, PartialEq)]
#[sqlx(type_name = "user_gender", rename_all = "lowercase")] 
#[derive(Clone)]
pub enum Gender {
    Male,
    Female,
    Other,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, ToSchema, PartialEq)]
#[sqlx(type_name = "user_status", rename_all = "lowercase")]
pub enum UserStatus {
    Active,
    Inactive,
    Suspended,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub username: String,
    #[serde(skip_serializing)]
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
    pub email: String,
    #[validate(
        length(min = 3, max = 50, message = "Username must be between 3 and 50 characters"),
        regex(path = "USERNAME_REGEX", message = "Username must be alphanumeric with underscores only")
    )]
    pub username: String,
    #[validate(length(min = 6, message = "Password must be at least 6 characters long"))]
    pub password: String,
    pub gender: Gender,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[validate(email(message = "Invalid email format"))]
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid, // user id
    pub exp: i64, // expiration time
    pub email: String,
    pub username: String,
}

lazy_static::lazy_static! {
    static ref USERNAME_REGEX: regex::Regex = regex::Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap();
} 