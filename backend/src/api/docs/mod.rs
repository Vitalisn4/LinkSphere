mod auth;
mod links;

use utoipa::OpenApi;
use crate::{
    api::{ApiResponse, ErrorResponse, models::CreateLinkRequest},
    auth::{LoginRequest, RegisterRequest, User, AuthResponse, Gender},
    database::models::Link,
};

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::api::docs::auth::register_docs,
        crate::api::docs::auth::login_docs,
        crate::api::docs::links::get_links_docs,
        crate::api::docs::links::create_link_docs
    ),
    components(
        schemas(
            ApiResponse<Link>,
            ApiResponse<Vec<Link>>,
            ApiResponse<User>,
            ApiResponse<AuthResponse>,
            ErrorResponse,
            Link,
            CreateLinkRequest,
            LoginRequest,
            RegisterRequest,
            User,
            AuthResponse,
            Gender
        )
    ),
    tags(
        (name = "auth", description = "Authentication endpoints"),
        (name = "links", description = "Link management endpoints")
    ),
    info(
        title = "LinkSphere API",
        version = "0.1.0",
        description = "API for managing and sharing links with authentication"
    )
)]
pub struct ApiDoc; 