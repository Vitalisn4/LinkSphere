use super::models::{JsonLinkPreview, Link, LinkPreview};
use crate::database::models::OptionalJsonUser;
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

/// Retrieves all links from the database
///
/// # Returns
/// * `Result<Vec<Link>, sqlx::Error>` - A list of all links or an error
pub async fn get_all_links(pool: &PgPool) -> Result<Vec<Link>, sqlx::Error> {
    sqlx::query_as!(
        Link,
        r#"
        SELECT 
            l.id,
            l.url as "url!",
            l.title as "title!",
            l.description as "description!",
            l.user_id as "user_id!",
            l.click_count as "click_count!",
            l.created_at as "created_at!",
            l.updated_at as "updated_at!",
            l.preview as "preview: JsonLinkPreview",
            COALESCE(
                jsonb_build_object('username', u.username)::jsonb,
                'null'::jsonb
            ) as "user!: OptionalJsonUser"
        FROM links l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
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
/// * `user_id` - The ID of the user creating the link
/// * `preview` - The preview of the link
///
/// # Returns
/// * `Result<Link, sqlx::Error>` - The created link or an error
pub async fn create_link(
    pool: &PgPool,
    url: String,
    title: String,
    description: String,
    user_id: Uuid,
    preview: Option<&LinkPreview>,
) -> Result<Link, sqlx::Error> {
    let now = Utc::now();
    let preview_json = JsonLinkPreview::from(preview);

    sqlx::query_as!(
        Link,
        r#"
        WITH inserted_link AS (
            INSERT INTO links (url, title, description, user_id, created_at, updated_at, preview)
            VALUES ($1, $2, $3, $4, $5, $5, $6)
            RETURNING *
        )
        SELECT 
            l.id,
            l.url as "url!",
            l.title as "title!",
            l.description as "description!",
            l.user_id as "user_id!",
            l.click_count as "click_count!",
            l.created_at as "created_at!",
            l.updated_at as "updated_at!",
            l.preview as "preview: JsonLinkPreview",
            COALESCE(
                jsonb_build_object('username', u.username)::jsonb,
                'null'::jsonb
            ) as "user!: OptionalJsonUser"
        FROM inserted_link l
        LEFT JOIN users u ON l.user_id = u.id
        "#,
        url,
        title,
        description,
        user_id,
        now,
        preview_json as _
    )
    .fetch_one(pool)
    .await
}

/// Increment the click count for a link
///
/// # Arguments
/// * `pool` - Database connection pool
/// * `link_id` - The ID of the link
///
/// # Returns
/// * `Result<(), sqlx::Error>` - Success or error
pub async fn increment_click_count(pool: &PgPool, link_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        UPDATE links 
        SET click_count = click_count + 1 
        WHERE id = $1
        "#,
        link_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Deletes a link from the database
///
/// # Arguments
/// * `pool` - Database connection pool
/// * `link_id` - The ID of the link to delete
///
/// # Returns
/// * `Result<(), sqlx::Error>` - Success or error
pub async fn delete_link(pool: &PgPool, link_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!("DELETE FROM links WHERE id = $1", link_id)
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
pub async fn get_link_by_id(pool: &PgPool, link_id: Uuid) -> Result<Option<Link>, sqlx::Error> {
    sqlx::query_as!(
        Link,
        r#"
        SELECT 
            l.id,
            l.url as "url!",
            l.title as "title!",
            l.description as "description!",
            l.user_id as "user_id!",
            l.click_count as "click_count!",
            l.created_at as "created_at!",
            l.updated_at as "updated_at!",
            l.preview as "preview: JsonLinkPreview",
            COALESCE(
                jsonb_build_object('username', u.username)::jsonb,
                'null'::jsonb
            ) as "user!: OptionalJsonUser"
        FROM links l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.id = $1
        "#,
        link_id
    )
    .fetch_optional(pool)
    .await
}

pub async fn check_user_exists(
    pool: &PgPool,
    email: &str,
    username: &str,
) -> Result<bool, sqlx::Error> {
    let count = if username.is_empty() {
        // Only check email
        sqlx::query!(
            r#"
            SELECT COUNT(*) as count
            FROM users
            WHERE email = $1
            "#,
            email
        )
        .fetch_one(pool)
        .await?
        .count
        .unwrap_or(0)
    } else {
        // Check both email and username
        sqlx::query!(
            r#"
            SELECT COUNT(*) as count
            FROM users
            WHERE email = $1 OR username = $2
            "#,
            email,
            username
        )
        .fetch_one(pool)
        .await?
        .count
        .unwrap_or(0)
    };

    Ok(count > 0)
}

#[allow(dead_code)]
pub async fn create_unverified_user(
    pool: &PgPool,
    email: &str,
    username: &str,
    password_hash: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO users (email, username, password_hash, is_verified)
        VALUES ($1, $2, $3, false)
        "#,
        email,
        username,
        password_hash
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn complete_registration(pool: &PgPool, email: &str) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        r#"
        UPDATE users
        SET 
            is_verified = true,
            status = 'active',
            verified_at = NOW()
        WHERE email = $1 AND is_verified = false
        "#,
        email
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }

    Ok(())
}

pub async fn is_user_verified(pool: &PgPool, email: &str) -> Result<bool, sqlx::Error> {
    let result = sqlx::query!(
        r#"
        SELECT is_verified
        FROM users
        WHERE email = $1
        "#,
        email
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|r| r.is_verified).unwrap_or(false))
}

/// Inserts a new refresh token for a user
pub async fn insert_refresh_token(
    pool: &PgPool,
    user_id: Uuid,
    token: &str,
    expires_at: chrono::DateTime<chrono::Utc>,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        "#,
        user_id,
        token,
        expires_at
    )
    .execute(pool)
    .await?;
    Ok(())
}

/// Gets a refresh token record by token string
pub async fn get_refresh_token(
    pool: &PgPool,
    token: &str,
) -> Result<Option<(Uuid, chrono::DateTime<chrono::Utc>)>, sqlx::Error> {
    let rec = sqlx::query!(
        r#"
        SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1
        "#,
        token
    )
    .fetch_optional(pool)
    .await?;
    Ok(rec.map(|r| (r.user_id, r.expires_at)))
}

/// Deletes a refresh token (for rotation or logout)
pub async fn delete_refresh_token(pool: &PgPool, token: &str) -> Result<(), sqlx::Error> {
    sqlx::query!(r#"DELETE FROM refresh_tokens WHERE token = $1"#, token)
        .execute(pool)
        .await?;
    Ok(())
}
