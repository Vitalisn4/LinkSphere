pub mod links;
mod health;

use axum::{Router, routing::{get, post, delete}, middleware};
use crate::{
    database::PgPool,
    auth::middleware::{auth_middleware, AuthMiddlewareState}
};
use std::env;

pub fn create_router(pool: PgPool) -> Router {
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let auth_state = AuthMiddlewareState::new(jwt_secret);
    
    Router::new()
        .route("/", get(health::root))
        .route("/api/links", get(links::get_links))
        .route("/api/links", post(links::handle_create_link))
        .route("/api/links/:id", delete(links::delete_link))
        .route("/api/links/:id/click", post(links::track_click))
        .layer(middleware::from_fn_with_state(auth_state, auth_middleware))
        .with_state(pool)
}