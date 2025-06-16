use crate::handlers::auth::{login, register, verify_email};
use crate::services::{auth::AuthService, email::EmailService};
use axum::{routing::post, Router};
use sqlx::PgPool;
use std::env;

#[derive(Clone)]
pub struct AppState {
    pub auth_service: AuthService,
    pub email_service: EmailService,
}

pub fn create_router(pool: PgPool) -> Router {
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let auth_service = AuthService::new(pool, jwt_secret);
    let email_service = EmailService::new().expect("Failed to create email service");
    let state = AppState {
        auth_service,
        email_service,
    };

    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/verify-email", post(verify_email))
        .with_state(state)
}
