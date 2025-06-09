use axum::{
    routing::post,
    Router,
    Json,
    extract::State,
    response::IntoResponse,
    http::StatusCode,
};
use validator::Validate;

use crate::api::{ApiResponse, ErrorResponse};
use super::{
    models::{LoginRequest, RegisterRequest},
    service::AuthService,
};

pub fn create_router(auth_service: AuthService) -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .with_state(auth_service)
}

async fn register(
    State(service): State<AuthService>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    match service.register(payload).await {
        Ok(user) => {
            let response = ApiResponse::success_with_message(
                user,
                "User registered successfully"
            );
            (StatusCode::CREATED, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to register user: {}", e))
                .with_code("REGISTRATION_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

async fn login(
    State(service): State<AuthService>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    match service.login(payload.email, payload.password).await {
        Ok(auth_response) => {
            let response = ApiResponse::success_with_message(
                auth_response,
                "Login successful"
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(_) => {
            let error = ErrorResponse::new("Invalid credentials")
                .with_code("AUTHENTICATION_ERROR");
            (StatusCode::BAD_REQUEST, Json(error)).into_response()
        }
    }
} 