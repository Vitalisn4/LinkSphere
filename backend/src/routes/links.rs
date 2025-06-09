use axum::{
    extract::{State, Path},
    response::IntoResponse,
    http::StatusCode,
    Json,
};
use crate::database::queries::create_link;
use crate::{
    database::{self, PgPool},
    api::{ApiResponse, ErrorResponse, models::CreateLinkRequest},
};
use validator::Validate;

/// Get all links
/// 
/// Returns a list of all links in the system
/// Requires Authentication: Bearer token from /api/auth/login
pub async fn get_links(
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    match database::get_all_links(&pool).await {
        Ok(links) => {
            let response = ApiResponse::success(links);
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to fetch links: {}", e))
                .with_code("LINKS_FETCH_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Create a new link
/// 
/// Creates a new link with the provided details
/// Requires Authentication: Bearer token from /api/auth/login
pub async fn handle_create_link(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateLinkRequest>,
) -> impl IntoResponse {
    // Validate the request payload
    if let Err(validation_errors) = payload.validate() {
        let error = ErrorResponse::new(format!("Validation error: {}", validation_errors))
            .with_code("VALIDATION_ERROR");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Validate URL format
    if let Err(url_error) = payload.validate_url() {
        let error = ErrorResponse::new(format!("Invalid URL format: {}", url_error))
            .with_code("INVALID_URL");
        return (StatusCode::BAD_REQUEST, Json(error)).into_response();
    }

    // Create the link
    match create_link(
        &pool,
        payload.url,
        payload.title,
        payload.description,
        payload.username
    ).await {
        Ok(link) => {
            let response = ApiResponse::success_with_message(
                link,
                "Link created successfully"
            );
            (StatusCode::CREATED, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to create link: {}", e))
                .with_code("LINK_CREATE_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
}

/// Delete a link
/// 
/// Deletes a link by its ID. Only the owner of the link can delete it.
/// Requires Authentication: Bearer token from /api/auth/login
pub async fn delete_link(
    State(pool): State<PgPool>,
    Path(link_id): Path<i32>,
) -> impl IntoResponse {
    match database::queries::delete_link(&pool, link_id).await {
        Ok(_) => {
            let response = ApiResponse::success_with_message(
                (),
                "Link deleted successfully"
            );
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to delete link: {}", e))
                .with_code("LINK_DELETE_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
} 