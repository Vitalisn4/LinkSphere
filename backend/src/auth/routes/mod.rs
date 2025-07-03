use crate::handlers::auth::update_username;
use crate::middleware::auth::auth;
use axum::middleware::from_fn_with_state;
use crate::handlers::auth::{admin_reset_otp_attempts, login, register, resend_otp, verify_email};
use crate::services::{auth::AuthService, email::EmailService};
use axum::routing::put;
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
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/verify", post(verify_email))
        .route("/api/auth/resend-otp", post(resend_otp))
        .route(
            "/api/admin/auth/reset-otp-attempts",
            post(admin_reset_otp_attempts),
        )
        .route(
            "/api/update-username",
            put(update_username).route_layer(from_fn_with_state(state.auth_service.clone(), auth)),
        )
        .with_state(state)
}
