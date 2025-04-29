use axum::Router;

pub mod links;
pub mod users;

pub fn api_routes() -> Router {
    Router::new()
        .nest("/api/v1", v1_routes())
}

fn v1_routes() -> Router {
    Router::new()
        .nest("/links", links::routes())
        .nest("/users", users::routes())
}