use crate::api::{ApiResponse, ErrorResponse};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde::Serialize;
use serde_json::json;
use sqlx::PgPool;
use std::env;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
struct HealthStatus {
    name: String,
    version: String,
    status: String,
    timestamp: chrono::DateTime<chrono::Utc>,
}

pub async fn root() -> impl IntoResponse {
    let status = HealthStatus {
        name: String::from("LinkSphere API"),
        version: env!("CARGO_PKG_VERSION").to_string(),
        status: String::from("running"),
        timestamp: chrono::Utc::now(),
    };

    let response =
        ApiResponse::success_with_message(status, "Welcome to LinkSphere API - Service is running");

    (StatusCode::OK, axum::Json(response)).into_response()
}

/// Health check endpoint protected by admin token
#[utoipa::path(
    get,
    path = "/api/admin/health",
    params(
        ("X-Admin-Token" = String, Header, description = "Admin authentication token")
    ),
    responses(
        (status = 200, description = "Database connection healthy", body = ApiResponse<serde_json::Value>),
        (status = 401, description = "Missing or invalid admin token", body = ErrorResponse),
        (status = 503, description = "Database connection failed", body = ErrorResponse)
    ),
    tag = "admin"
)]
pub async fn health_check(State(pool): State<PgPool>, headers: HeaderMap) -> impl IntoResponse {
    // Check admin token
    let admin_token = env::var("ADMIN_SECRET_KEY").unwrap_or_default();
    let provided_token = headers
        .get("X-Admin-Token")
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default();

    if admin_token.is_empty() || admin_token != provided_token {
        let response = ApiResponse {
            success: false,
            message: "Missing or invalid authorization header".to_string(),
            data: json!({ "code": "UNAUTHORIZED" }),
            pagination: None,
            timestamp: chrono::Utc::now(),
        };
        return (StatusCode::UNAUTHORIZED, Json(response));
    }

    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => {
            let response = ApiResponse {
                success: true,
                message: "Database connection is healthy".to_string(),
                data: json!({
                    "status": "healthy",
                    "database": "connected"
                }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            (StatusCode::OK, Json(response))
        }
        Err(e) => {
            let response = ApiResponse {
                success: false,
                message: format!("Database connection failed: {e}"),
                data: json!({
                    "status": "unhealthy",
                    "database": "disconnected",
                    "error": e.to_string()
                }),
                pagination: None,
                timestamp: chrono::Utc::now(),
            };
            (StatusCode::SERVICE_UNAVAILABLE, Json(response))
        }
    }
}
