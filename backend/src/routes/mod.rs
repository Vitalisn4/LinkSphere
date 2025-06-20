pub mod health;
pub mod links;

use crate::database::PgPool;
use axum::{
    routing::{delete, get, post},
    Router,
};


pub fn create_ping_router(pool: PgPool) -> Router {
    Router::new()
        .route("/api/admin/db/health", get(health::health_check))
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
