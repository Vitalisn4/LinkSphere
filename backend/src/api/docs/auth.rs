
#[utoipa::path(
    post,
    path = "/api/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "Registration initiated successfully. An OTP has been sent to the provided email.", body = ApiResponse<()>),
        (status = 400, description = "Invalid request data - Check the error message for validation details", body = ErrorResponse),
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
        (status = 200, description = "Email verified successfully. User can now log in.", body = ApiResponse<()>),
        (status = 400, description = "Invalid or expired verification code", body = ErrorResponse),
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
        (status = 200, description = "Verification code resent successfully", body = ApiResponse<()>),
        (status = 404, description = "Email not found or registration expired", body = ErrorResponse),
        (status = 429, description = "Too many verification attempts", body = ErrorResponse),
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
        (status = 200, description = "Login successful", body = ApiResponse<AuthResponse>),
        (status = 400, description = "Invalid credentials", body = ErrorResponse),
        (status = 401, description = "Email not verified", body = ErrorResponse),
        (status = 403, description = "Account is not active or suspended", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub fn login_docs() {} 