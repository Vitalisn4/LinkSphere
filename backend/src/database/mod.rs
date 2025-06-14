pub mod models;
pub mod queries;
pub use queries::get_all_links;
pub use sqlx::PgPool;

use sqlx::migrate::MigrateError;
use sqlx::postgres::PgPoolOptions;

pub async fn create_pool(database_url: &str) -> PgPool {
    PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
        .expect("Failed to create database pool")
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), MigrateError> {
    sqlx::migrate!("./migrations").run(pool).await
}
