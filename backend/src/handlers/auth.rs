use crate::{
    api::{ApiResponse, ErrorResponse},
    auth::routes::AppState,
    models::auth::{LoginRequest, RegisterRequest, VerifyEmailRequest, ResendOtpRequest, UserStatus, User},
};
use axum::{
    extract::State,
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    Json,
};
use axum_macros::debug_handler;
use serde::{Deserialize};
use serde_json::json;
use validator::Validate;

/// Register a new user
#[debug_handler]
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

    // Check if user already exists first
    match state.auth_service.check_user_exists(&payload.email, &payload.username).await {
        Ok(true) => {
            let error = ErrorResponse::new("User with this email or username already exists")
                .with_code("USER_EXISTS");
            return (StatusCode::CONFLICT, Json(error)).into_response();
        }
        Ok(false) => {
            // User doesn't exist, proceed with OTP
            if let Err(e) = state.email_service.send_otp(&payload.email).await {
                let error = ErrorResponse::new(format!("Failed to send verification email: {}", e))
                    .with_code("EMAIL_ERROR");
                return (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response();
            }

            // Register user
            match state.auth_service.register(payload.clone()).await {
                Ok(user) => {
                    let response = ApiResponse::success_with_message(
                        json!({
                            "id": user.id,
                            "email": user.email,
                            "username": user.username,
                            "status": "pending_verification"
                        }),
                        "Registration successful. Please enter the verification code sent to your email.",
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
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to check user existence: {}", e))
                .with_code("DATABASE_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Login user
#[debug_handler]
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
#[debug_handler]
pub async fn verify_email(
    State(state): State<AppState>,
    Json(payload): Json<VerifyEmailRequest>,
) -> impl IntoResponse {
    // Log verification attempt
    println!("Starting email verification for: {}", payload.email);

    // Validate the request
    if let Err(validation_errors) = payload.validate() {
        println!("Validation error: {}", validation_errors);
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Verify OTP
    let otp_valid = state
        .email_service
        .verify_otp(&payload.email, &payload.otp)
        .await;

    if !otp_valid {
        println!("Invalid OTP for email: {}", payload.email);
        let error = ErrorResponse::new("Invalid or expired OTP").with_code("INVALID_OTP");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    println!("OTP verified successfully for: {}", payload.email);

    // Complete verification
    match state
        .auth_service
        .complete_verification(&payload.email)
        .await
    {
        Ok(_) => {
            println!("Email verification completed for: {}", payload.email);
            let response = ApiResponse::success_with_message(
                json!({"email": payload.email}),
                "Email verified successfully. You can now login to your account.",
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            println!("Verification failed for {}: {}", payload.email, e);
            let error = ErrorResponse::new(format!("Verification failed: {}", e))
                .with_code("VERIFICATION_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Resend OTP for email verification
pub async fn resend_otp(
    State(state): State<AppState>,
    Json(payload): Json<ResendOtpRequest>,
) -> (StatusCode, Json<ApiResponse<serde_json::Value>>) {
    // Validate the request
    if let Err(validation_errors) = payload.validate() {
        let response = ApiResponse {
            success: false,
            message: format!("Validation error: {}", validation_errors),
            data: json!({ "code": "VALIDATION_ERROR" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(response));
    }

    // Check if user exists and is in pending verification state
    let user = match sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, email, username, password_hash, 
            gender as "gender: _",
            status as "status: _",
            is_verified,
            verification_attempts,
            verified_at,
            created_at, 
            updated_at
        FROM users
        WHERE email = $1
        "#,
        payload.email
    )
    .fetch_optional(state.auth_service.get_pool())
    .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            let response = ApiResponse {
                success: false,
                message: "User not found".to_string(),
                data: json!({ "code": "USER_NOT_FOUND" }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            return (StatusCode::NOT_FOUND, Json(response));
        }
        Err(e) => {
            let response = ApiResponse {
                success: false,
                message: format!("Database error: {}", e),
                data: json!({ "code": "DATABASE_ERROR" }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
        }
    };

    // Check if user is in pending verification state
    if user.status != UserStatus::PendingVerification {
        let response = ApiResponse {
            success: false,
            message: "User is not in pending verification state".to_string(),
            data: json!({ "code": "INVALID_STATE" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::BAD_REQUEST, Json(response));
    }

    // Send new OTP
    match state.email_service.send_otp(&payload.email).await {
        Ok(_) => {
            let response = ApiResponse::success_with_message(
                json!({"email": payload.email}),
                "OTP resent successfully",
            );
            (StatusCode::OK, Json(response))
        }
        Err(e) => {
            let response = ApiResponse {
                success: false,
                message: format!("Failed to send OTP: {}", e),
                data: json!({ "code": "EMAIL_ERROR" }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
}

/// Reset OTP attempts counter for an email
pub async fn reset_otp_attempts(
    State(state): State<AppState>,
    Json(payload): Json<ResendOtpRequest>,
) -> impl IntoResponse {
    // Validate the request
    if let Err(validation_errors) = payload.validate() {
        let response = ApiResponse {
            success: false,
            message: format!("Validation error: {}", validation_errors),
            data: json!({ "code": "VALIDATION_ERROR" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(response));
    }

    // Check if user exists and is in pending verification state
    let user = match sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, email, username, password_hash, 
            gender as "gender: _",
            status as "status: _",
            is_verified,
            verification_attempts,
            verified_at,
            created_at, 
            updated_at
        FROM users
        WHERE email = $1
        "#,
        payload.email
    )
    .fetch_optional(state.auth_service.get_pool())
    .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            let response = ApiResponse {
                success: false,
                message: "User not found".to_string(),
                data: json!({ "code": "USER_NOT_FOUND" }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            return (StatusCode::NOT_FOUND, Json(response));
        }
        Err(e) => {
            let response = ApiResponse {
                success: false,
                message: format!("Database error: {}", e),
                data: json!({ "code": "DATABASE_ERROR" }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
        }
    };

    // Reset attempts counter with admin privileges
    if let Err(e) = state.email_service.admin_reset_attempts(&payload.email, "").await {
        let response = ApiResponse {
            success: false,
            message: format!("Failed to reset attempts: {}", e),
            data: json!({ "code": "RESET_ERROR" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
    }

    let response = ApiResponse::success_with_message(
        json!({
            "email": payload.email,
            "username": user.username,
            "status": user.status
        }),
        "OTP attempts reset successfully. You can now request a new OTP.",
    );
    (StatusCode::OK, Json(response))
}

#[derive(Debug, Deserialize, Validate)]
pub struct AdminResetOtpRequest {
    #[validate(email(message = "Invalid email format"))]
    pub email: String,
}

/// Admin-only endpoint to reset OTP attempts for blocked users
#[debug_handler]
pub async fn admin_reset_otp_attempts(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<AdminResetOtpRequest>,
) -> impl IntoResponse {
    // Validate the request
    if let Err(validation_errors) = payload.validate() {
        let response = ApiResponse {
            success: false,
            message: format!("Validation error: {}", validation_errors),
            data: json!({ "code": "VALIDATION_ERROR" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::UNPROCESSABLE_ENTITY, Json(response));
    }

    // Get admin token from headers
    let admin_token = match headers.get("X-Admin-Token") {
        Some(token) => match token.to_str() {
            Ok(t) => t,
            Err(_) => {
                let response = ApiResponse {
                    success: false,
                    message: "Invalid admin token format".to_string(),
                    data: json!({ "code": "INVALID_TOKEN" }),
                    pagination: None,
                    timestamp: chrono::Utc::now(),
                };
                return (StatusCode::UNAUTHORIZED, Json(response));
            }
        },
        None => {
            let response = ApiResponse {
                success: false,
                message: "Missing admin token".to_string(),
                data: json!({ "code": "MISSING_TOKEN" }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            return (StatusCode::UNAUTHORIZED, Json(response));
        }
    };

    // Reset attempts counter with admin privileges
    if let Err(e) = state.email_service.admin_reset_attempts(&payload.email, admin_token).await {
        let response = ApiResponse {
            success: false,
            message: format!("Failed to reset attempts: {}", e),
            data: json!({ "code": "RESET_ERROR" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
    }

    let response = ApiResponse::success_with_message(
        json!({
            "email": payload.email,
            "status": "reset_successful"
        }),
        "OTP attempts reset successfully by admin. User can now request a new OTP.",
    );
    (StatusCode::OK, Json(response))
}
