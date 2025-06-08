// Endpoint for uploading links

use actix_web::{post, web, HttpResponse, Responder};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Deserialize, Debug)]
pub struct LinkUpload {
    pub url: String,
    pub title: String,
    pub description: String,
}

#[derive(Serialize)]
pub struct LinkResponse {
    pub id: i32,
    pub url: String,
    pub title: String,
    pub description: String,
    pub user_id: i32,
    pub click_count: Option<i32>,
    pub favicon_url: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[post("/upload")]
pub async fn upload_link(
    pool: web::Data<PgPool>,
    link_data: web::Json<LinkUpload>,
) -> impl Responder {
    println!("Received upload request: {:?}", link_data);

    // Hardcode user_id for now, as frontend doesn't provide it
    let default_user_id = 1;

    match sqlx::query!(
        r#"
        INSERT INTO links (url, title, description, user_id, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, url, title, description, user_id, click_count, favicon_url, created_at
        "#,
        link_data.url,
        link_data.title,
        link_data.description,
        default_user_id
    )
    .fetch_one(&**pool)
    .await
    {
        Ok(record) => {
            println!("Successfully inserted link with ID: {}", record.id);
            HttpResponse::Ok().json(LinkResponse {
                id: record.id,
                url: record.url,
                title: record.title,
                description: record.description,
                user_id: record.user_id,
                click_count: record.click_count,
                favicon_url: record.favicon_url,
                created_at: record.created_at,
            })
        }
        Err(e) => {
            println!("Error inserting link: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Database error: {}", e))
        }
    }
}
