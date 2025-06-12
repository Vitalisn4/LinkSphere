use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;
use uuid::Uuid;
use serde_json::Value as JsonValue;
use sqlx::types::Json;

/// Represents a link preview metadata
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
pub struct LinkPreview {
    /// Title from the webpage metadata
    #[schema(example = "Rust Programming Language")]
    pub title: Option<String>,
    /// Description from the webpage metadata
    #[schema(example = "A language empowering everyone to build reliable and efficient software.")]
    pub description: Option<String>,
    /// URL of the page's favicon
    #[schema(example = "https://www.rust-lang.org/favicon.ico")]
    pub favicon: Option<String>,
    /// URL of the page's main image
    #[schema(example = "https://www.rust-lang.org/static/images/rust-social.jpg")]
    pub image: Option<String>,
}

#[derive(Debug, sqlx::Type)]
#[sqlx(transparent)]
pub struct JsonLinkPreview(pub Json<Option<LinkPreview>>);

impl From<JsonValue> for JsonLinkPreview {
    fn from(value: JsonValue) -> Self {
        JsonLinkPreview(Json(serde_json::from_value(value).ok()))
    }
}

impl From<JsonLinkPreview> for Option<LinkPreview> {
    fn from(wrapper: JsonLinkPreview) -> Self {
        wrapper.0.0
    }
}

impl From<Option<&LinkPreview>> for JsonLinkPreview {
    fn from(preview: Option<&LinkPreview>) -> Self {
        JsonLinkPreview(Json(preview.cloned()))
    }
}

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
    pub updated_at: DateTime<Utc>,
    /// Preview metadata from the link
    #[serde(with = "preview_serde")]
    pub preview: Option<LinkPreview>
}

// Custom serialization for preview field to handle JSON conversion
mod preview_serde {
    use super::*;
    use serde::{Deserializer, Serializer};

    pub fn serialize<S>(preview: &Option<LinkPreview>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match preview {
            Some(preview) => preview.serialize(serializer),
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<LinkPreview>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let json_value = JsonValue::deserialize(deserializer)?;
        Ok(JsonLinkPreview::from(json_value).into())
    }
} 