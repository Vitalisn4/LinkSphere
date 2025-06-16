use crate::{
    api::{ApiResponse, ErrorResponse},
    auth::routes::AppState,
    models::auth::{LoginRequest, RegisterRequest, VerifyEmailRequest},
};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use tokio::spawn;
use validator::Validate;

/// Register a new user
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    // Validate the request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response();
    }

    // Register user
    match state.auth_service.register(payload.clone()).await {
        Ok(user) => {
            // Send OTP in background
            let email_service = state.email_service.clone();
            let user_email = payload.email.clone();
            spawn(async move {
                if let Err(e) = email_service.send_otp(&user_email).await {
                    eprintln!("Failed to send verification email: {}", e);
                }
            });

            // Return success response
            let response = ApiResponse::success_with_message(
                json!({
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                }),
                "Registration successful. Please check your email for verification code.",
            );
            (StatusCode::CREATED, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Registration failed: {}", e))
                .with_code("REGISTRATION_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Login user
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    match state
        .auth_service
        .login(&payload.email, &payload.password)
        .await
    {
        Ok(auth_response) => {
            let response = ApiResponse::success_with_message(auth_response, "Login successful");
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Login failed: {}", e)).with_code("LOGIN_ERROR");
            (StatusCode::UNAUTHORIZED, Json(error)).into_response()
        }
    }
}

/// Verify email with OTP
pub async fn verify_email(
    State(state): State<AppState>,
    Json(payload): Json<VerifyEmailRequest>,
) -> impl IntoResponse {
    if !state
        .email_service
        .verify_otp(&payload.email, &payload.otp)
        .await
    {
        let error = ErrorResponse::new("Invalid or expired OTP").with_code("INVALID_OTP");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    match state
        .auth_service
        .complete_verification(&payload.email)
        .await
    {
        Ok(_) => {
            let response = ApiResponse::success_with_message(
                json!({"email": payload.email}),
                "Email verified successfully",
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Verification failed: {}", e))
                .with_code("VERIFICATION_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}
