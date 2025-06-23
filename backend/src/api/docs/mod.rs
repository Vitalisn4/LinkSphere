mod auth;
mod links;

use crate::api::models::VerifyEmailRequest;
use crate::api::{ApiResponse, ErrorResponse};
use crate::database::models::Link;
use crate::models::auth::{AuthResponse, LoginRequest, RegisterRequest, User, UserStatus};
use crate::models::user::Gender;
use utoipa::OpenApi;

type EmptyResponse = ApiResponse<()>;
type AuthResponseWrapper = ApiResponse<AuthResponse>;
type LinkResponse = ApiResponse<Link>;
type LinksResponse = ApiResponse<Vec<Link>>;

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::api::docs::auth::register_docs,
        crate::api::docs::auth::verify_email_docs,
        crate::api::docs::auth::login_docs,
        crate::api::docs::links::get_links_docs,
        crate::api::docs::links::create_link_docs,
        crate::api::docs::links::delete_link_docs
    ),
    components(schemas(
        RegisterRequest,
        LoginRequest,
        AuthResponse,
        User,
        Gender,
        UserStatus,
        VerifyEmailRequest,
        EmptyResponse,
        AuthResponseWrapper,
        LinkResponse,
        LinksResponse,
        ErrorResponse,
        Link
    ))
)]
pub struct ApiDoc;

struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                utoipa::openapi::security::SecurityScheme::Http(
                    utoipa::openapi::security::Http::new(
                        utoipa::openapi::security::HttpAuthScheme::Bearer,
                    ),
                ),
            );
        }
    }
}
