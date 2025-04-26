use axum::{
    extract::Path,
    routing::{get, post, delete},
    Json, Router,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Link {
    id: String,
    url: String,
    title: Option<String>,
    description: Option<String>,
}

pub fn routes() -> Router {
    Router::new()
        .route("/", get(list_links))
        .route("/", post(create_link))
        .route("/:id", get(get_link))
        .route("/:id", delete(delete_link))
}

async fn list_links() -> Json<Vec<Link>> {
    Json(vec![])
}

async fn get_link(Path(_id): Path<String>) -> Json<Option<Link>> {
    Json(None)
}

async fn create_link(Json(link): Json<Link>) -> Json<Link> {
    Json(link)
}

async fn delete_link(Path(_id): Path<String>) -> Json<bool> {
    Json(true)
} 