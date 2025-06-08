// Table schema definitions

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct UploadForm {
    pub link: String,
    pub topic: String,
    pub description: String,
    pub uploader: String,
}