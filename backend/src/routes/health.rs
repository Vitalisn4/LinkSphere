use crate::api::ApiResponse;
use axum::{
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    Json,
    extract::State,
};
use serde::Serialize;
use utoipa::ToSchema;
use serde_json::json;
use sqlx::PgPool;
use std::env;

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

pub async fn health_check(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> impl IntoResponse {
    // Check admin token
    let admin_token = env::var("ADMIN_TOKEN").unwrap_or_default();
    let provided_token = headers
        .get("X-Admin-Token")
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default();

    if admin_token.is_empty() || admin_token != provided_token {
        let response = json!({
            "status": "error",
            "message": "Unauthorized access"
        });
        return (StatusCode::UNAUTHORIZED, Json(response));
    }

    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => {
            let response = json!({
                "status": "healthy",
                "database": "connected"
            });
            (StatusCode::OK, Json(response))
        }
        Err(e) => {
            let response = json!({
                "status": "unhealthy",
                "database": "disconnected",
                "error": e.to_string()
            });
            (StatusCode::SERVICE_UNAVAILABLE, Json(response))
        }
    }
}
