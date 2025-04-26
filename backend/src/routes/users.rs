use axum::{
    extract::Path,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    id: String,
    username: String,
    email: String,
}

pub fn routes() -> Router {
    Router::new()
        .route("/", get(list_users))
        .route("/", post(create_user))
        .route("/:id", get(get_user))
}

async fn list_users() -> Json<Vec<User>> {
    Json(vec![])
}

async fn get_user(Path(_id): Path<String>) -> Json<Option<User>> {
    Json(None)
}

async fn create_user(Json(user): Json<User>) -> Json<User> {
    Json(user)
} 