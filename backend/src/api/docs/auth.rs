use crate::api::models::{ResendOtpRequest, VerifyEmailRequest};
use crate::api::{ApiResponse, ErrorResponse};
use crate::models::auth::{AuthResponse, LoginRequest, RegisterRequest};
type EmptyResponse = ApiResponse<()>;
type AuthResponseWrapper = ApiResponse<AuthResponse>;

#[utoipa::path(
    post,
    path = "/api/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "Registration initiated successfully", body = EmptyResponse),
        (status = 400, description = "Invalid request data", body = ErrorResponse),
        (status = 409, description = "Email or username already exists", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub fn register_docs() {}

#[utoipa::path(
    post,
    path = "/api/auth/verify",
    request_body = VerifyEmailRequest,
    responses(
        (status = 200, description = "Email verified successfully", body = EmptyResponse),
        (status = 400, description = "Invalid verification code", body = ErrorResponse),
        (status = 404, description = "Registration not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub fn verify_email_docs() {}

#[utoipa::path(
    post,
    path = "/api/auth/resend-otp",
    request_body = ResendOtpRequest,
    responses(
        (status = 200, description = "Verification code resent", body = EmptyResponse),
        (status = 404, description = "Email not found", body = ErrorResponse),
        (status = 429, description = "Too many attempts", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub fn resend_otp_docs() {}

#[utoipa::path(
    post,
    path = "/api/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = AuthResponseWrapper),
        (status = 400, description = "Invalid credentials", body = ErrorResponse),
        (status = 401, description = "Email not verified", body = ErrorResponse),
        (status = 403, description = "Account not active", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub fn login_docs() {}