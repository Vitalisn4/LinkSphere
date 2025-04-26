use axum::{
    extract::{Path, State}, // Added Path
    http::{StatusCode, Method, HeaderValue}, // Added Method, HeaderValue
    response::{IntoResponse, Response}, // Added Response
    routing::{delete, get, post}, // Added delete, post
    Json, Router,
};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use dotenvy::dotenv;
use std::env;
use std::sync::Arc;
use serde::{Deserialize, Serialize}; // Added serde
use chrono::{DateTime, Utc}; // Added chrono for timestamps
use tower_http::cors::{CorsLayer, Any}; // Add this import

// Define an alias for our application state
type AppState = Arc<PoolState>;

// Structure to hold the database pool
struct PoolState {
    pool: sqlx::PgPool,
}

// Define the Link structure matching the DB schema
// Need Serialize for sending JSON, Deserialize might be needed for POST/PUT later
#[derive(Serialize, sqlx::FromRow)] // Derive FromRow for sqlx query mapping
struct Link {
    id: i32,
    user_id: i32,
    url: String,
    title: String,
    description: String,
    click_count: i32,
    favicon_url: Option<String>, // Option because it can be NULL
    created_at: Option<DateTime<Utc>>, // Changed to Option to match potential DB nullability
    uploader_username: Option<String>, // Added field for username
}


#[tokio::main]
async fn main() {
    dotenv().ok();
    println!("Loaded .env file");

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
    println!("Database URL loaded");

    let pool = match PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            println!("✅ Successfully connected to database!");
            pool
        }
        Err(err) => {
            eprintln!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    // Run migrations (recommended for dev)
    match sqlx::migrate!("./migrations").run(&pool).await {
         Ok(_) => println!("✅ Database migrations ran successfully!"),
         Err(err) => {
             eprintln!("🔥 Failed to run database migrations: {:?}", err);
             // Consider more nuanced error handling here in production
             // std::process::exit(1); // Exit on critical migration errors
         }
    };

    let app_state = Arc::new(PoolState { pool });

    // Define CORS layer
    let cors = CorsLayer::new()
        // Allow requests from any origin (consider restricting in production)
        .allow_origin(Any)
        // Allow common methods
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        // Allow common headers
        .allow_headers(Any);

    // Build the Axum application router
    let app = Router::new()
        .route("/", get(root_handler))
        .route("/api/links", get(get_links_handler)) // Add GET route
        .route("/api/links/:id", delete(delete_link_handler)) // Add DELETE route
        .route("/api/links/:id/click", post(increment_click_count_handler)) // Add this route
        // TODO: Add user routes etc.
        .with_state(app_state)
        .layer(cors); // Apply the CORS layer

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

// Simple handler for the root route
async fn root_handler() -> &'static str {
    "Hello from LinkSphere Backend (Rust/Axum)!"
}

// Handler to GET all links
async fn get_links_handler(
    State(state): State<AppState>
) -> Result<Json<Vec<Link>>, StatusCode> {
    match sqlx::query_as!(
        Link,
        r#"
        SELECT
            l.id as "id!",
            l.user_id as "user_id!",
            l.url,
            l.title,
            l.description,
            l.click_count as "click_count!",
            l.favicon_url,
            l.created_at,
            u.username as uploader_username -- Select username from users table
        FROM links l
        LEFT JOIN users u ON l.user_id = u.id -- Join users table
        ORDER BY l.created_at DESC
        "#
    )
    .fetch_all(&state.pool)
    .await
    {
        Ok(links) => Ok(Json(links)),
        Err(e) => {
            eprintln!("Error fetching links with usernames: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// Handler to increment click count for a link
async fn increment_click_count_handler(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, StatusCode> {
    match sqlx::query!(
        "UPDATE links SET click_count = click_count + 1 WHERE id = $1",
        id
    )
    .execute(&state.pool)
    .await
    {
        Ok(result) => {
            if result.rows_affected() == 1 {
                println!("Incremented click count for link ID: {}", id);
                Ok(StatusCode::NO_CONTENT) // Success, no content needed
            } else {
                println!("Link not found for click increment, ID: {}", id);
                Err(StatusCode::NOT_FOUND)
            }
        }
        Err(e) => {
            eprintln!("Error incrementing click count: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// Handler to DELETE a link by ID
async fn delete_link_handler(
    State(state): State<AppState>,
    Path(id): Path<i32>, // Extract id from path
) -> Result<StatusCode, StatusCode> {
    // TODO: Add authentication and authorization check here!
    // Ensure the logged-in user owns this link ID before deleting.

    match sqlx::query!("DELETE FROM links WHERE id = $1", id)
        .execute(&state.pool)
        .await
    {
        Ok(result) => {
            if result.rows_affected() == 1 {
                println!("Deleted link with ID: {}", id);
                Ok(StatusCode::NO_CONTENT) // Success, no content to return
            } else {
                println!("Link not found with ID: {}", id);
                Err(StatusCode::NOT_FOUND) // Link ID didn't exist
            }
        }
        Err(e) => {
            eprintln!("Error deleting link: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// --- TODO ---
// - Define request/response structs (DTOs) for user routes
// - Implement user registration handler (/api/users/register) with password hashing
// - Implement user login handler (/api/users/login)
// - Implement authentication middleware
// - Implement link creation handler (/api/links POST) (requires auth)
// - Add more robust error handling (custom error types)