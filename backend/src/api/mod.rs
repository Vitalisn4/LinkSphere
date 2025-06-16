#![allow(dead_code)]
pub mod docs;
pub mod models;
pub mod utils;

use axum::{http::StatusCode, response::IntoResponse, Json};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub struct ApiResponse<T: Serialize + ToSchema> {
    pub success: bool,
    pub message: String,
    pub data: T,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<PaginationMeta>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PaginationMeta {
    pub current_page: u32,
    pub page_size: u32,
    pub total_items: u64,
    pub total_pages: u32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub struct ErrorResponse {
    pub success: bool,
    pub message: String,
    pub code: String,
    pub timestamp: DateTime<Utc>,
}

impl<T: Serialize + ToSchema> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            message: String::new(),
            data,
            pagination: None,
            timestamp: Utc::now(),
        }
    }

    pub fn success_with_message(data: T, message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            data,
            pagination: None,
            timestamp: Utc::now(),
        }
    }

    pub fn with_pagination(mut self, pagination: PaginationMeta) -> Self {
        self.pagination = Some(pagination);
        self
    }
}

impl ErrorResponse {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            code: String::new(),
            timestamp: Utc::now(),
        }
    }

    pub fn with_code(mut self, code: impl Into<String>) -> Self {
        self.code = code.into();
        self
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> axum::response::Response {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(self)).into_response()
    }
}
