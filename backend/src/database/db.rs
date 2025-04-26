use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

// Function to create the database pool
pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
    println!("Database URL loaded");

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
}

// Function to run database migrations
pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
     match sqlx::migrate!("./migrations").run(pool).await {
         Ok(_) => {
            println!("✅ Database migrations ran successfully!");
            Ok(())
         },
         Err(err) => {
             eprintln!("🔥 Failed to run database migrations: {:?}", err);
             // Consider exiting or more robust error handling in production
             Err(err)
         }
    }
} 