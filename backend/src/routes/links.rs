use axum::{
    extract::{State, Path, Extension},
    response::IntoResponse,
    http::StatusCode,
    Json,
};
use crate::database::queries::create_link;
use crate::{
    database::{self, PgPool},
    api::{ApiResponse, ErrorResponse, models::CreateLinkRequest},
    auth::middleware::AuthUser,
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
/// 
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
/// Delete a link by its ID. This operation requires authentication and can only be performed by the link's owner.
/// 
/// # OpenAPI Specification
/// ```yaml
/// /api/links/{id}:
///   delete:
///     summary: Delete a link
///     description: Delete a link by its ID. Only the owner of the link can delete it.
///     tags:
///       - links
///     security:
///       - bearerAuth: []
///     parameters:
///       - name: id
///         in: path
///         required: true
///         description: Numeric ID of the link to delete
///         schema:
///           type: integer
///           format: int32
///     responses:
///       200:
///         description: Link successfully deleted
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
///                   example: Link deleted successfully
///       401:
///         description: Unauthorized - Missing or invalid JWT token
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 error:
///                   type: string
///                   example: Missing or invalid authorization header
///                 code:
///                   type: string
///                   example: UNAUTHORIZED
///       403:
///         description: Forbidden - User doesn't own the link
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 error:
///                   type: string
///                   example: You don't have permission to delete this link
///                 code:
///                   type: string
///                   example: FORBIDDEN
///       404:
///         description: Link not found
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 error:
///                   type: string
///                   example: Link not found
///                 code:
///                   type: string
///                   example: NOT_FOUND
///       500:
///         description: Internal server error
///         content:
///           application/json:
///             schema:
///               type: object
///               properties:
///                 error:
///                   type: string
///                   example: Failed to delete link
///                 code:
///                   type: string
///                   example: LINK_DELETE_ERROR
/// ```
pub async fn delete_link(
    State(pool): State<PgPool>,
    Extension(user): Extension<AuthUser>,
    Path(link_id): Path<i32>,
) -> impl IntoResponse {
    // First check if the link exists and belongs to the user
    match database::queries::get_link_by_id(&pool, link_id).await {
        Ok(Some(link)) => {
            if link.username != user.username {
                let error = ErrorResponse::new("You don't have permission to delete this link")
                    .with_code("FORBIDDEN");
                return (StatusCode::FORBIDDEN, Json(error)).into_response();
            }

            // If the user owns the link, proceed with deletion
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
        Ok(None) => {
            let error = ErrorResponse::new("Link not found")
                .with_code("NOT_FOUND");
            (StatusCode::NOT_FOUND, Json(error)).into_response()
        }
        Err(e) => {
            let error = ErrorResponse::new(format!("Failed to fetch link: {}", e))
                .with_code("LINK_FETCH_ERROR");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error)).into_response()
        }
    }
} 