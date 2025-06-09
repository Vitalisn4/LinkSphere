use axum::{
    response::IntoResponse,
    http::StatusCode,
};
use crate::api::ApiResponse;
use serde::Serialize;

#[derive(Serialize)]
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

    let response = ApiResponse::success_with_message(
        status,
        "Welcome to LinkSphere API - Service is running"
    );

    (StatusCode::OK, axum::Json(response)).into_response()
} 