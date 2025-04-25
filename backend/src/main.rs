use axum::{routing::get, Router};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use dotenvy::dotenv;
use std::env;
use std::sync::Arc; // For sharing the pool state

// Define an alias for our application state
type AppState = Arc<PoolState>;

// Structure to hold the database pool
struct PoolState {
    pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    // Load .env file variables
    dotenv().ok();
    println!("Loaded .env file");

    // Get database URL from environment
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
    println!("Database URL loaded");

    // Create the database connection pool
    let pool = match PgPoolOptions::new()
        .max_connections(5) // Adjust pool size as needed
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            println!("✅ Successfully connected to database!");
            pool
        }
        Err(err) => {
            eprintln!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1); // Exit if connection fails
        }
    };

    // Optional: Run migrations at startup (useful in development)
    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => println!("✅ Database migrations ran successfully!"),
        Err(err) => {
            eprintln!("🔥 Failed to run database migrations: {:?}", err);
            std::process::exit(1);
        }
    };

    // Create the application state (wrapping the pool in an Arc for sharing)
    let app_state = Arc::new(PoolState { pool });

    // Build the Axum application router
    let app = Router::new()
        .route("/", get(root_handler)) // Add root route
        // Add routes for users and links later
        .with_state(app_state); // Make the pool available to handlers via state

    // Define the server address
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000)); // Listen on port 3000
    println!("🚀 Server listening on {}", addr);

    // Run the server
    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => listener,
        Err(err) => {
            eprintln!("🔥 Failed to bind server address: {:?}", err);
            std::process::exit(1);
        }
    };

    if let Err(err) = axum::serve(listener, app.into_make_service()).await {
        eprintln!("🔥 Server error: {:?}", err);
    }
}

// Simple handler for the root route
async fn root_handler() -> &'static str {
    "Hello from LinkSphere Backend (Rust/Axum)!"
}

// --- TODO ---
// - Define request/response structs (DTOs)
// - Implement user registration handler (/api/users/register) with password hashing
// - Implement user login handler (/api/users/login)
// - Implement authentication middleware
// - Implement link creation handler (/api/links POST) (requires auth)
// - Implement link fetching handler (/api/links GET)
// - Add proper error handling
