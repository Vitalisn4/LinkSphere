use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;
use uuid::Uuid;

/// Represents a link in the system
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Link {
    /// Unique identifier for the link
    pub id: Uuid,
    /// The URL of the link
    pub url: String,
    /// Title of the link
    pub title: String,
    /// Description of the link
    pub description: String,
    /// ID of the user who created the link
    pub user_id: Uuid,
    /// Number of times the link has been clicked
    pub click_count: i32,
    /// When the link was created
    pub created_at: DateTime<Utc>,
    /// When the link was last updated
    pub updated_at: DateTime<Utc>
} 