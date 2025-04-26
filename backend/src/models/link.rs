use serde::Serialize;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

// Define the Link structure matching the DB schema
// Make struct and fields public for accessibility across modules
#[derive(Serialize, FromRow, Debug, Clone)] // Added Debug, Clone
pub struct Link {
    pub id: i32,
    pub user_id: i32,
    pub url: String,
    pub title: String,
    pub description: String,
    pub click_count: i32,
    pub favicon_url: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub uploader_username: Option<String>,
} 