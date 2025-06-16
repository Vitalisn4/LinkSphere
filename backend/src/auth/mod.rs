pub mod middleware;
pub mod routes;

use axum::Router;
use sqlx::PgPool;

pub fn create_router(pool: PgPool) -> Router {
    Router::new()
        .merge(routes::create_router(pool))
} 