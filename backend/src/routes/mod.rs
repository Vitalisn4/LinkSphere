pub mod links;
mod health;

use axum::{Router, routing::{get, post, delete}};
use crate::database::PgPool;

pub fn create_router(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(health::root))
        .route("/api/links", get(links::get_links))
        .route("/api/links", post(links::handle_create_link))
        .route("/api/links/:id", delete(links::delete_link))
        .with_state(pool)
}