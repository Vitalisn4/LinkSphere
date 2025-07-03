use axum::{
    Router,
    routing::post,
};

use crate::{
    handlers::auth::{register, login, verify_email, resend_otp},
    services::{auth::AuthService, email::EmailService},
};

#[derive(Clone)]
pub struct AuthState {
    pub auth_service: AuthService,
    pub email_service: EmailService,
}

pub fn create_router(auth_service: AuthService, email_service: EmailService) -> Router {
    let state = AuthState {
        auth_service,
        email_service,
    };

    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/verify", post(verify_email))
        .route("/resend-otp", post(resend_otp))
        .with_state(state)
} 