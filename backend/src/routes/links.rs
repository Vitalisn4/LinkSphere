use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use crate::database::state::AppState;
use crate::models::link::Link;

// Handler to GET all links
pub async fn get_links_handler(
    State(state): State<AppState>
) -> Result<Json<Vec<Link>>, StatusCode> {
    match sqlx::query_as!(
        Link, // Use the imported Link struct
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
            u.username as uploader_username
        FROM links l
        LEFT JOIN users u ON l.user_id = u.id
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
pub async fn increment_click_count_handler(
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
                Ok(StatusCode::NO_CONTENT)
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
pub async fn delete_link_handler(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, StatusCode> {
    match sqlx::query!("DELETE FROM links WHERE id = $1", id)
        .execute(&state.pool)
        .await
    {
        Ok(result) => {
            if result.rows_affected() == 1 {
                println!("Deleted link with ID: {}", id);
                Ok(StatusCode::NO_CONTENT)
            } else {
                println!("Link not found with ID: {}", id);
                Err(StatusCode::NOT_FOUND)
            }
        }
        Err(e) => {
            eprintln!("Error deleting link: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
} 