use sqlx::PgPool;
use super::models::Link;
use chrono::Utc;

/// Retrieves all links from the database
/// 
/// # Returns
/// * `Result<Vec<Link>, sqlx::Error>` - A list of all links or an error
pub async fn get_all_links(pool: &PgPool) -> Result<Vec<Link>, sqlx::Error> {
    sqlx::query_as!(
        Link,
        r#"
        SELECT 
            id,
            url as "url!",
            title as "title!",
            description as "description!",
            username as "username!",
            created_at as "created_at!",
            updated_at as "updated_at!"
        FROM links
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool)
    .await
}

/// Creates a new link in the database
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `url` - The URL to be added
/// * `title` - The title of the link
/// * `description` - A description of the link
/// * `username` - The username of the creator
/// 
/// # Returns
/// * `Result<Link, sqlx::Error>` - The created link or an error
pub async fn create_link(
    pool: &PgPool,
    url: String,
    title: String,
    description: String,
    username: String,
) -> Result<Link, sqlx::Error> {
    let now = Utc::now();
    
    sqlx::query_as!(
        Link,
        r#"
        INSERT INTO links (url, title, description, username, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $5)
        RETURNING 
            id,
            url as "url!",
            title as "title!",
            description as "description!",
            username as "username!",
            created_at as "created_at!",
            updated_at as "updated_at!"
        "#,
        url,
        title,
        description,
        username,
        now,
    )
    .fetch_one(pool)
    .await
}

/// Deletes a link from the database
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `link_id` - The ID of the link to delete
/// 
/// # Returns
/// * `Result<(), sqlx::Error>` - Success or error
pub async fn delete_link(pool: &PgPool, link_id: i32) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM links WHERE id = $1",
        link_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Retrieves a single link by its ID
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `link_id` - The ID of the link to fetch
/// 
/// # Returns
/// * `Result<Option<Link>, sqlx::Error>` - The link if found, None if not found, or an error
pub async fn get_link_by_id(pool: &PgPool, link_id: i32) -> Result<Option<Link>, sqlx::Error> {
    sqlx::query_as!(
        Link,
        r#"
        SELECT 
            id,
            url as "url!",
            title as "title!",
            description as "description!",
            username as "username!",
            created_at as "created_at!",
            updated_at as "updated_at!"
        FROM links
        WHERE id = $1
        "#,
        link_id
    )
    .fetch_optional(pool)
    .await
} 