// Declare modules
mod database;
mod models;
mod routes;

use axum::{
    http::Method, routing::{delete, get, post}, Router
};
use std::net::SocketAddr;
use dotenvy::dotenv;
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};

// Import necessary items from modules
use database::state::{PoolState, AppState};
use database::db::{create_pool, run_migrations};
use routes::{root_handler, get_links_handler, delete_link_handler, increment_click_count_handler};

#[tokio::main]
async fn main() {
    dotenv().ok();
    println!("Loaded .env file");

    // Create database pool using db module
    let pool = match create_pool().await {
        Ok(pool) => {
            println!("✅ Successfully connected to database!");
            pool
        }
        Err(err) => {
            eprintln!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    // Run migrations using db module
    if let Err(err) = run_migrations(&pool).await {
        // Decide whether to exit or continue if migrations fail
        eprintln!("Migration error: {:?}. Server starting anyway...", err);
        // std::process::exit(1); // Optionally exit on migration error
    };

    // Create AppState
    let app_state: AppState = Arc::new(PoolState { pool });

    // Define CORS layer (remains the same)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers(Any);

    // Build the Axum application router using imported handlers
    let app = Router::new()
        .route("/", get(root_handler))
        .route("/api/links", get(get_links_handler))
        .route("/api/links/:id", delete(delete_link_handler))
        .route("/api/links/:id/click", post(increment_click_count_handler))
        .with_state(app_state) // Use the created AppState
        .layer(cors);

    // Server startup logic (remains the same)
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("🚀 Server listening on {}", addr);

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

// --- Handlers and Structs moved to respective modules ---
