pub mod schema;
// Database connection logic
use sqlx::{Pool, Postgres};
use dotenv::dotenv;
use std::env;

pub async fn get_db_pool() -> Pool<Postgres> {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    Pool::<Postgres>::connect(&database_url).await.expect("Failed to create pool")
}