
/// Link Management Endpoints
#[utoipa::path(
    get,
    path = "/api/links",
    responses(
        (status = 200, description = "Links retrieved successfully", body = ApiResponse<Vec<Link>>),
        (status = 401, description = "Missing or invalid JWT token in Authorization header", body = ErrorResponse),
        (status = 500, description = "Database or server error occurred", body = ErrorResponse)
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
    request_body(
        content = CreateLinkRequest,
        description = "Link details to create. The username must match the authenticated user's username.",
        content_type = "application/json"
    ),
    responses(
        (status = 201, description = "Link was successfully created", body = ApiResponse<Link>),
        (status = 400, description = "Invalid request data - Check the error message for validation details", body = ErrorResponse),
        (status = 401, description = "Missing or invalid JWT token in Authorization header", body = ErrorResponse),
        (status = 403, description = "Username in request doesn't match authenticated user", body = ErrorResponse),
        (status = 500, description = "Database or server error occurred", body = ErrorResponse)
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
        ("id" = i32, Path, description = "Numeric ID of the link to delete. Must be owned by the authenticated user.")
    ),
    responses(
        (status = 200, description = "Link was successfully deleted. This operation is permanent and cannot be undone.", body = ApiResponse<()>),
        (status = 401, description = "Missing or invalid JWT token in Authorization header", body = ErrorResponse),
        (status = 403, description = "Authenticated user is not the owner of this link", body = ErrorResponse),
        (status = 404, description = "Link with the specified ID was not found", body = ErrorResponse),
        (status = 500, description = "Database or server error occurred", body = ErrorResponse)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "links"
)]
pub fn delete_link_docs() {} 