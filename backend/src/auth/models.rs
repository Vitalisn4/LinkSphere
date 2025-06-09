use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, ToSchema)]
#[sqlx(type_name = "user_gender", rename_all = "lowercase")]
pub enum Gender {
    Male,
    Female,
    Other,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub gender: Gender,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
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
    pub sub: i32, // user id
    pub exp: i64, // expiration time
    pub email: String,
    pub username: String,
}

lazy_static::lazy_static! {
    static ref USERNAME_REGEX: regex::Regex = regex::Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap();
} 