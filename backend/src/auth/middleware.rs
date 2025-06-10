use axum::{
    http::Request,
    middleware::Next,
    response::Response,
    http::StatusCode,
    extract::State,
    body::Body,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use super::models::Claims;
use crate::api::ErrorResponse;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
    pub username: String,
}

impl From<Claims> for AuthUser {
    fn from(claims: Claims) -> Self {
        Self {
            id: claims.sub,
            email: claims.email,
            username: claims.username,
        }
    }
}

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
) -> Result<Response, (StatusCode, axum::Json<ErrorResponse>)> {
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
        .ok_or_else(|| {
            let error = ErrorResponse::new("Missing or invalid authorization header")
                .with_code("UNAUTHORIZED");
            (StatusCode::UNAUTHORIZED, axum::Json(error))
        })?;

    // Verify token
    let token_data = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|e| {
        let error = ErrorResponse::new(format!("Invalid token: {}", e))
            .with_code("UNAUTHORIZED");
        (StatusCode::UNAUTHORIZED, axum::Json(error))
    })?;

    // Convert claims to AuthUser and add to request extensions
    let auth_user = AuthUser::from(token_data.claims);
    request.extensions_mut().insert(auth_user);

    // Continue with the request
    Ok(next.run(request).await)
}