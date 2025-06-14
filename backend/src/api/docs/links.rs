use crate::api::models::CreateLinkRequest;
use crate::api::{ApiResponse, ErrorResponse};
use crate::database::models::Link;

type EmptyResponse = ApiResponse<()>;
type LinkResponse = ApiResponse<Link>;
type LinksResponse = ApiResponse<Vec<Link>>;

/// Link Management Endpoints
#[utoipa::path(
    get,
    path = "/api/links",
    responses(
        (status = 200, description = "Links retrieved successfully", body = LinksResponse),
        (status = 401, description = "Missing or invalid JWT token", body = ErrorResponse),
        (status = 500, description = "Server error", body = ErrorResponse)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "links"
)]
pub fn get_links_docs() {}

#[utoipa::path(
    post,
    path = "/api/links",
    request_body = CreateLinkRequest,
    responses(
        (status = 201, description = "Link created successfully", body = LinkResponse),
        (status = 422, description = "Invalid request data (URL format, title/description length)", body = ErrorResponse),
        (status = 401, description = "Missing or invalid JWT token", body = ErrorResponse),
        (status = 500, description = "Server error", body = ErrorResponse)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "links"
)]
pub fn create_link_docs() {}

#[utoipa::path(
    delete,
    path = "/api/links/{id}",
    params(
        ("id" = Uuid, Path, description = "ID of the link to delete")
    ),
    responses(
        (status = 200, description = "Link deleted successfully", body = EmptyResponse),
        (status = 401, description = "Missing or invalid JWT token", body = ErrorResponse),
        (status = 403, description = "Not authorized to delete this link", body = ErrorResponse),
        (status = 404, description = "Link not found", body = ErrorResponse),
        (status = 500, description = "Server error", body = ErrorResponse)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "links"
)]
pub fn delete_link_docs() {}
