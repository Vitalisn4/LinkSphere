mod api;
mod database;
mod routes;
mod auth;
mod services;

use std::env;
use std::net::SocketAddr;
use axum::{Router, middleware, http::{Method, HeaderName}};
use dotenv::dotenv;
use tower_http::{trace::TraceLayer, cors::CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::api::docs::ApiDoc;
use crate::auth::middleware::AuthMiddlewareState;

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Database connection
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = database::create_pool(&database_url).await;
    
    // Run database migrations
    if let Err(e) = database::run_migrations(&pool).await {
        tracing::error!("Failed to run database migrations: {:?}", e);
        std::process::exit(1);
    }

    // JWT secret
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let auth_middleware_state = AuthMiddlewareState::new(jwt_secret.clone());

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(["http://localhost:5173".parse().unwrap()])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([HeaderName::from_static("authorization"), HeaderName::from_static("content-type")])
        .allow_credentials(true);

    // Build our application with routes
    let app = Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .nest("/api/auth", auth::create_router(pool.clone()))
        .merge(
            routes::create_router(pool)
                .layer(middleware::from_fn_with_state(
                    auth_middleware_state.clone(),
                    auth::middleware::auth_middleware,
                ))
        )
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    // Run it
    let port = env::var("PORT")
        .expect("PORT must be set")
        .parse::<u16>()
        .expect("PORT must be a valid number");
    let host = env::var("HOST")
        .expect("HOST must be set");
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("Invalid HOST:PORT combination");
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");
    tracing::info!("listening on {}", addr);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}