use backend::{
    api::docs::ApiDoc,
    auth::{self},
    database,
    logging::init_logging,
    middleware::{auth::auth, request_logger::request_logger},
    routes,
    services::auth::AuthService,
};

use axum::routing::get;
use axum::{
    http::{HeaderName, Method},
    middleware::{from_fn, from_fn_with_state},
    Router,
};
use dotenv::dotenv;
use std::env;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenv().ok();

    // Initialize logging
    init_logging();

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
    let auth_service = AuthService::new(pool.clone(), jwt_secret.clone());
    let frontend_request_url =
        env::var("FRONTEND_REQUEST_URL").expect("FRONTEND_REQUEST_URL must be set");
    let cors = CorsLayer::new()
        .allow_origin([frontend_request_url.parse().unwrap()])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            HeaderName::from_static("authorization"),
            HeaderName::from_static("content-type"),
        ])
        .allow_credentials(true);

    // Build our application with routes
    let app = Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .route("/health", get(routes::health::root))
        .merge(routes::create_ping_router(pool.clone()))
        .merge(auth::create_router(pool.clone()))
        .merge(routes::create_protected_router(pool).layer(from_fn_with_state(auth_service, auth)))
        .layer(cors)
        .layer(from_fn(request_logger));

    // Run it
    let port = env::var("PORT")
        .expect("PORT must be set")
        .parse::<u16>()
        .expect("PORT must be a valid number");
    let host = env::var("HOST").expect("HOST must be set");
    let addr: SocketAddr = format!("{host}:{port}")
        .parse()
        .expect("Invalid HOST:PORT combination");
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");
    tracing::info!("Server listening on {addr}");

    axum::serve(listener, app).await.expect("Server failed");
}
