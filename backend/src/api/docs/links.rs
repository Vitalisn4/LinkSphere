#[utoipa::path(
    get,
    path = "/api/links",
    responses(
        (status = 200, description = "Links retrieved successfully", body = ApiResponse<Vec<Link>>),
        (status = 401, description = "Unauthorized - Valid JWT token required", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
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
        (status = 201, description = "Link created successfully", body = ApiResponse<Link>),
        (status = 400, description = "Invalid request data", body = ErrorResponse),
        (status = 401, description = "Unauthorized - Valid JWT token required", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
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
        ("id" = i32, Path, description = "Numeric ID of the link to delete")
    ),
    responses(
        (status = 200, description = "Link was successfully deleted. This operation is permanent and cannot be undone.", body = ApiResponse<()>),
        (status = 401, description = "Missing or invalid JWT token in Authorization header", body = ErrorResponse),
        (status = 403, description = "User doesn't have permission to delete this link", body = ErrorResponse),
        (status = 404, description = "Link with the specified ID was not found", body = ErrorResponse),
        (status = 500, description = "Database or server error occurred", body = ErrorResponse)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "links"
)]
pub fn delete_link_docs() {} 