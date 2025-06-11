mod routes;
mod database;
use axum::{routing::{get, post}, Router};
use database::get_db_pool;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let db_pool = get_db_pool().await;

    // build our application with a route
    let app = Router::new()
        .route("/upload", post(routes::uploads::upload_link))
        .layer(CorsLayer::permissive())
        .with_state(db_pool);

    // run it
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
