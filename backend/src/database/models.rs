use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;
use uuid::Uuid;

/// Represents a link in the system
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Link {
    /// Unique identifier for the link
    #[schema(example = "123e4567-e89b-12d3-a456-426614174000")]
    pub id: Uuid,
    /// The URL of the link
    #[schema(example = "https://www.rust-lang.org")]
    pub url: String,
    /// Title of the link
    #[schema(example = "Official Rust Website")]
    pub title: String,
    /// Description of the link
    #[schema(example = "The home page of the Rust programming language")]
    pub description: String,
    /// ID of the user who created the link
    #[schema(example = "123e4567-e89b-12d3-a456-426614174000")]
    pub user_id: Uuid,
    /// Number of times the link has been clicked
    #[schema(example = 0)]
    pub click_count: i32,
    /// When the link was created
    #[schema(example = "2024-03-10T15:00:00Z")]
    pub created_at: DateTime<Utc>,
    /// When the link was last updated
    #[schema(example = "2024-03-10T15:00:00Z")]
    pub updated_at: DateTime<Utc>
} 