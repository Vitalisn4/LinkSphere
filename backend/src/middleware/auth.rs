use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use uuid::Uuid;

use crate::{
    api::ErrorResponse,
    models::auth::Claims,
    services::auth::AuthService,
};

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

pub async fn auth(
    State(auth_service): State<AuthService>,
    mut request: Request<Body>,
    next: Next,
) -> Result<Response, (StatusCode, ErrorResponse)> {
    // Get the token from the Authorization header
    let token = request
        .headers()
        .get("Authorization")
        .and_then(|auth_header| auth_header.to_str().ok())
        .and_then(|auth_str| auth_str.strip_prefix("Bearer "))
        .ok_or_else(|| {
            let error = ErrorResponse::new("Missing or invalid authorization header")
                .with_code("UNAUTHORIZED");
            (StatusCode::UNAUTHORIZED, error)
        })?;

    // Validate the token
    let jwt_secret = auth_service.get_jwt_secret();
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|e| {
        let error = ErrorResponse::new(format!("Invalid token: {}", e))
            .with_code("INVALID_TOKEN");
        (StatusCode::UNAUTHORIZED, error)
    })?;

    // Add the claims to the request extensions
    let auth_user = AuthUser::from(token_data.claims);
    request.extensions_mut().insert(auth_user);

    Ok(next.run(request).await)
} 