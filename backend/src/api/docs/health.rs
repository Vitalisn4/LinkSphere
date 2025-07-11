use crate::api::{ApiResponse, ErrorResponse};
use utoipa::ToSchema;
use serde_json::Value;

/// Public health check endpoint
#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "API is running", body = ApiResponse<Value>),
    ),
    tag = "health"
)]
pub fn root_docs() {}

/// Admin database health check endpoint
#[utoipa::path(
    get,
    path = "/api/admin/db/health",
    params(
        ("X-Admin-Token" = String, Header, description = "Admin authentication token")
    ),
    responses(
        (status = 200, description = "Database connection healthy", body = ApiResponse<Value>),
        (status = 401, description = "Missing or invalid admin token", body = ErrorResponse),
        (status = 503, description = "Database connection failed", body = ErrorResponse)
    ),
    tag = "admin"
)]
pub fn admin_db_health_docs() {} 