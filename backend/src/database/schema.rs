// Table schema definitions

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Link {
    pub id: i32,
    pub url: String,
    pub title: String,
    pub description: String,
    pub user_id: i32,
    pub click_count: Option<i32>,
    pub favicon_url: Option<String>,
    pub created_at: DateTime<Utc>,
}