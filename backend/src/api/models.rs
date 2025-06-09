use serde::{Deserialize};
use validator::Validate;
use url::Url;
use regex;
use utoipa::ToSchema;

/// Request payload for creating a new link
#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct CreateLinkRequest {
    /// The complete URL to be added. Must be a valid URL starting with http:// or https://
    #[validate(url(message = "Invalid URL format"))]
    #[schema(example = "https://www.rust-lang.org")]
    pub url: String,

    /// A descriptive title for the link
    #[validate(length(min = 1, max = 255, message = "Title must be between 1 and 255 characters"))]
    #[schema(example = "Official Rust Website")]
    pub title: String,

    /// A detailed description of what the link contains or represents
    #[validate(length(min = 1, max = 1000, message = "Description must be between 1 and 1000 characters"))]
    #[schema(example = "The home page of the Rust programming language")]
    pub description: String,

    /// Username of the link creator. Must match the authenticated user's username.
    /// The link will be associated with this user and only they can modify or delete it.
    #[validate(
        length(min = 3, max = 50, message = "Username must be between 3 and 50 characters"),
        regex(path = "USERNAME_REGEX", message = "Username must be alphanumeric with underscores only")
    )]
    #[schema(example = "rustdev123")]
    pub username: String,
}

impl CreateLinkRequest {
    pub fn validate_url(&self) -> Result<Url, url::ParseError> {
        Url::parse(&self.url)
    }
}

lazy_static::lazy_static! {
    static ref USERNAME_REGEX: regex::Regex = regex::Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap();
} 