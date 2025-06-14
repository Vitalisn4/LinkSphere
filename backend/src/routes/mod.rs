pub mod links;
pub mod health;

use axum::{Router, routing::{get, post, delete}};
use crate::{
    database::PgPool
};

// Public routes that don't require authentication
pub fn create_public_router(pool: PgPool) -> Router {
    Router::new()
        .with_state(pool)
}

// Protected routes that require authentication
pub fn create_protected_router(pool: PgPool) -> Router {
    Router::new()
        .route("/api/links", get(links::get_links))
        .route("/api/links", post(links::handle_create_link))
        .route("/api/links/{id}", delete(links::delete_link))
        .route("/api/links/{id}/click", post(links::track_click))
        .with_state(pool)
}