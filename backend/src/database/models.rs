use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;

/// Represents a link in the system
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Link {
    /// Unique identifier for the link
    pub id: i32,
    /// The URL of the link
    pub url: String,
    /// Title of the link
    pub title: String,
    /// Description of the link
    pub description: String,
    /// Username of the link creator
    pub username: String,
    /// When the link was created
    pub created_at: DateTime<Utc>,
    /// When the link was last updated
    pub updated_at: DateTime<Utc>,
} 