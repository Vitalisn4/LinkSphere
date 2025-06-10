use axum::{
    routing::post,
    Router,
    Json,
    extract::State,
    response::IntoResponse,
    http::StatusCode
};
use validator::Validate;

use crate::api::{ApiResponse, ErrorResponse};
use crate::auth::models::{LoginRequest, RegisterRequest};
use crate::api::models::{VerifyEmailRequest, ResendOtpRequest};
use crate::auth::service::AuthService;
use crate::auth::validation::{validate_email, validate_password};
use crate::auth::email::EmailService;
use crate::database::{PgPool, queries};

#[derive(Clone)]
pub struct AuthState {
    pub pool: PgPool,
    pub email_service: EmailService,
    pub auth_service: AuthService,
}

pub fn create_router(pool: PgPool) -> Router {
    let email_service = EmailService::new().expect("Failed to create email service");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let auth_service = AuthService::new(pool.clone(), jwt_secret);
    let state = AuthState {
        pool,
        email_service,
        auth_service,
    };

    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/verify", post(verify_email))
        .route("/resend-otp", post(resend_otp))
        .with_state(state)
}

/// Register a new user
/// 
/// # OpenAPI Specification
/// ```yaml
/// /api/auth/register:
///   post:
///     summary: Register a new user
///     description: Initiates user registration by validating credentials and sending OTP
///     tags:
///       - auth
///     requestBody:
///       required: true
///       content:
///         application/json:
///           schema:
///             type: object
///             required:
///               - email
///               - password
///               - username
///             properties:
///               email:
///                 type: string
///                 format: email
///                 example: user@example.com
///               password:
///                 type: string
///                 minLength: 8
///                 description: Must meet minimum strength requirements
///                 example: StrongP@ssw0rd
///               username:
///                 type: string
///                 minLength: 3
///                 pattern: ^[a-zA-Z0-9_]{3,50}$
///                 example: john_doe
///     responses:
///       200:
///         description: Registration initiated, OTP sent
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 success:
///                   type: boolean
///                   example: true
///                 message:
///                   type: string
///                   example: Registration initiated. Please check your email for verification code.
///       400:
///         description: Invalid input - email format, password strength, or validation errors
///       409:
///         description: Email or username already exists
///       500:
///         description: Server error
/// ```
pub async fn register(
    State(state): State<AuthState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Validate email format
    if !validate_email(&payload.email) {
        let error = ErrorResponse::new("Invalid email format")
            .with_code("INVALID_EMAIL");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Validate password strength
    if let Err(password_error) = validate_password(&payload.password) {
        let error = ErrorResponse::new(password_error.feedback)
            .with_code("WEAK_PASSWORD");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Check if email or username already exists
    if let Ok(exists) = queries::check_user_exists(&state.pool, &payload.email, &payload.username).await {
        if exists {
            let error = ErrorResponse::new("Email or username already exists")
                .with_code("USER_EXISTS");
            return (StatusCode::CONFLICT, Json(error)).into_response();
        }
    }

    // Create unverified user
    if let Err(e) = state.auth_service.register(payload.clone()).await {
        let error = ErrorResponse::new(format!("Failed to create user: {}", e))
            .with_code("REGISTRATION_ERROR");
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response();
    }

    // Send OTP
    match state.email_service.send_otp(&payload.email).await {
        Ok(_) => {
            let response = ApiResponse::success_with_message(
                (),
                "Registration initiated. Please check your email for verification code."
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to send verification email: {}", e))
                .with_code("EMAIL_SEND_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Verify email with OTP
/// 
/// # OpenAPI Specification
/// ```yaml
/// /api/auth/verify:
///   post:
///     summary: Verify email with OTP
///     description: Completes user registration by verifying the 6-digit OTP code sent to the email
///     tags:
///       - auth
///     requestBody:
///       required: true
///       content:
///         application/json:
///           schema:
///             type: object
///             required:
///               - email
///               - otp
///             properties:
///               email:
///                 type: string
///                 format: email
///                 example: user@example.com
///                 description: The email address to verify
///               otp:
///                 type: string
///                 pattern: ^[0-9]{6}$
///                 example: "123456"
///                 description: The 6-digit verification code sent to the email
///     responses:
///       200:
///         description: Email verified successfully
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 success:
///                   type: boolean
///                   example: true
///                 message:
///                   type: string
///                   example: Email verified successfully. You can now log in.
///       400:
///         description: Invalid input - email format or OTP format
///       401:
///         description: Invalid or expired OTP
///       404:
///         description: Registration not found
///       500:
///         description: Server error
/// ```
pub async fn verify_email(
    State(state): State<AuthState>,
    Json(payload): Json<VerifyEmailRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Verify OTP
    if !state.email_service.verify_otp(&payload.email, &payload.otp).await {
        let error = ErrorResponse::new("Invalid or expired verification code")
            .with_code("INVALID_OTP");
        return (StatusCode::UNAUTHORIZED, Json(error)).into_response();
    }

    // Complete registration
    match queries::complete_registration(&state.pool, &payload.email).await {
        Ok(_) => {
            let response = ApiResponse::success_with_message(
                (),
                "Email verified successfully. You can now log in."
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(sqlx::Error::RowNotFound) => {
            let error = ErrorResponse::new("Registration not found")
                .with_code("NOT_FOUND");
            (StatusCode::NOT_FOUND, Json(error)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to complete registration: {}", e))
                .with_code("REGISTRATION_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Resend OTP
/// 
/// # OpenAPI Specification
/// ```yaml
/// /api/auth/resend-otp:
///   post:
///     summary: Resend verification OTP
///     description: Resends a new 6-digit verification code to the specified email. Limited to 3 attempts per hour.
///     tags:
///       - auth
///     requestBody:
///       required: true
///       content:
///         application/json:
///           schema:
///             type: object
///             required:
///               - email
///             properties:
///               email:
///                 type: string
///                 format: email
///                 example: user@example.com
///                 description: The email address to resend the verification code to
///     responses:
///       200:
///         description: OTP resent successfully
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 success:
///                   type: boolean
///                   example: true
///                 message:
///                   type: string
///                   example: Verification code resent. Please check your email.
///       400:
///         description: Invalid email format
///       404:
///         description: Email not found or registration expired
///       429:
///         description: Too many verification attempts
///       500:
///         description: Server error
/// ```
pub async fn resend_otp(
    State(state): State<AuthState>,
    Json(payload): Json<ResendOtpRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Check if email exists
    let exists = match queries::check_user_exists(&state.pool, &payload.email, "").await {
        Ok(exists) => exists,
        Err(e) => {
            let error = ErrorResponse::new(format!("Database error: {}", e))
                .with_code("DATABASE_ERROR");
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response();
        }
    };

    if !exists {
        let error = ErrorResponse::new("Email not found")
            .with_code("NOT_FOUND");
        return (StatusCode::NOT_FOUND, Json(error)).into_response();
    }

    // Check if user is already verified
    match queries::is_user_verified(&state.pool, &payload.email).await {
        Ok(is_verified) => {
            if is_verified {
                let error = ErrorResponse::new("Account is already verified. Please login instead.")
                    .with_code("ALREADY_VERIFIED");
                return (StatusCode::BAD_REQUEST, Json(error)).into_response();
            }
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Database error: {}", e))
                .with_code("DATABASE_ERROR");
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response();
        }
    }

    // Send new OTP
    match state.email_service.send_otp(&payload.email).await {
        Ok(_) => {
            let response = ApiResponse::success_with_message(
                (),
                "Verification code resent. Please check your email."
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to resend verification code: {}", e))
                .with_code("EMAIL_SEND_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Login user
/// 
/// # OpenAPI Specification
/// ```yaml
/// /api/auth/login:
///   post:
///     summary: Authenticate user
///     description: Login with email and password to receive JWT token
///     tags:
///       - auth
///     requestBody:
///       required: true
///       content:
///         application/json:
///           schema:
///             type: object
///             required:
///               - email
///               - password
///             properties:
///               email:
///                 type: string
///                 format: email
///                 example: user@example.com
///               password:
///                 type: string
///                 format: password
///                 example: StrongP@ssw0rd
///     responses:
///       200:
///         description: Login successful
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 success:
///                   type: boolean
///                   example: true
///                 data:
///                   type: object
///                   properties:
///                     token:
///                       type: string
///                       example: eyJhbGciOiJIUzI1NiIs...
///                     user:
///                       type: object
///                       properties:
///                         id:
///                           type: integer
///                           example: 1
///                         email:
///                           type: string
///                           example: user@example.com
///                         username:
///                           type: string
///                           example: john_doe
///                 message:
///                   type: string
///                   example: Login successful
///       400:
///         description: Invalid credentials or validation error
///       401:
///         description: Email not verified
///       500:
///         description: Server error
/// ```
async fn login(
    State(state): State<AuthState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    match state.auth_service.login(payload.email, payload.password).await {
        Ok(auth_response) => {
            let response = ApiResponse::success_with_message(
                auth_response,
                "Login successful"
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error_msg = e.to_string();
            match error_msg.as_str() {
                "Email not verified" => {
                    let error = ErrorResponse::new("Email not verified. Please verify your email before logging in")
                        .with_code("EMAIL_NOT_VERIFIED");
                    (StatusCode::UNAUTHORIZED, Json(error)).into_response()
                }
                "Account is not active" => {
                    let error = ErrorResponse::new("Account is not active")
                        .with_code("ACCOUNT_INACTIVE");
                    (StatusCode::FORBIDDEN, Json(error)).into_response()
                }
                _ => {
                    let error = ErrorResponse::new("Invalid credentials")
                        .with_code("AUTHENTICATION_ERROR");
                    (StatusCode::BAD_REQUEST, Json(error)).into_response()
                }
            }
        }
    }
} 