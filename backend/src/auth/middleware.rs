use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
    extract::State,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use axum::body::Body;
use super::models::Claims;

#[derive(Clone)]
pub struct AuthMiddlewareState {
    jwt_secret: String,
}

impl AuthMiddlewareState {
    pub fn new(jwt_secret: String) -> Self {
        Self { jwt_secret }
    }
}

pub async fn auth_middleware(
    State(state): State<AuthMiddlewareState>,
    mut request: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get token from Authorization header
    let token = request
        .headers()
        .get("Authorization")
        .and_then(|auth_header| auth_header.to_str().ok())
        .and_then(|auth_str| {
            if auth_str.starts_with("Bearer ") {
                Some(auth_str[7..].to_string())
            } else {
                None
            }
        })
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Verify token
    let token_data = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;
    // Add claims to request extensions
    request.extensions_mut().insert(token_data.claims);

    // Continue with the request
    Ok(next.run(request).await)
}