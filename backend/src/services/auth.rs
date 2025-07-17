use base64::{engine::general_purpose, Engine as _};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use rand::rng;
use rand::RngCore;
use sqlx::PgPool;

use crate::{
    database::queries,
    models::auth::{AuthResponse, Claims, RegisterRequest, User, UserStatus},
};

#[derive(Clone)]
pub struct AuthService {
    pool: PgPool,
    jwt_secret: String,
}

impl AuthService {
    pub fn new(pool: PgPool, jwt_secret: String) -> Self {
        Self { pool, jwt_secret }
    }

    pub fn get_jwt_secret(&self) -> &str {
        &self.jwt_secret
    }

    pub fn get_pool(&self) -> &PgPool {
        &self.pool
    }

    pub async fn check_user_exists(
        &self,
        email: &str,
        username: &str,
    ) -> Result<bool, sqlx::Error> {
        queries::check_user_exists(&self.pool, email, username).await
    }

    pub async fn register(&self, req: RegisterRequest) -> Result<User, sqlx::Error> {
        let password_hash = hash(req.password.as_bytes(), DEFAULT_COST)
            .map_err(|e| sqlx::Error::Protocol(format!("Failed to hash password: {e}")))?;

        sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (
                email, username, password_hash, gender, 
                status, is_verified, verification_attempts
            )
            VALUES ($1, $2, $3, $4, $5, false, 0)
            RETURNING 
                id, email, username, password_hash, 
                gender as "gender: _", 
                status as "status: _",
                is_verified,
                verification_attempts,
                verified_at,
                created_at, 
                updated_at
            "#,
            req.email,
            req.username,
            password_hash,
            req.gender as _,
            UserStatus::PendingVerification as _
        )
        .fetch_one(&self.pool)
        .await
    }

    pub async fn login(&self, email: &str, password: &str) -> Result<AuthResponse, sqlx::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT 
                id, email, username, password_hash, 
                gender as "gender: _",
                status as "status: _",
                is_verified,
                verification_attempts,
                verified_at,
                created_at, 
                updated_at
            FROM users
            WHERE email = $1
            "#,
            email
        )
        .fetch_one(&self.pool)
        .await?;

        if !verify(password.as_bytes(), &user.password_hash)
            .map_err(|e| sqlx::Error::Protocol(format!("Failed to verify password: {e}")))?
        {
            return Err(sqlx::Error::Protocol("Invalid password".to_string()));
        }

        // Check if user is verified
        if !user.is_verified {
            return Err(sqlx::Error::Protocol("Email not verified".to_string()));
        }

        // Check if user is active
        if user.status != UserStatus::Active {
            return Err(sqlx::Error::Protocol("Account is not active".to_string()));
        }

        let token = self.create_token(&user)?;
        let (refresh_token, refresh_expires_at) = Self::generate_refresh_token_and_expiry();
        crate::database::queries::insert_refresh_token(
            &self.pool,
            user.id,
            &refresh_token,
            refresh_expires_at,
        )
        .await?;
        Ok(AuthResponse {
            token,
            refresh_token,
            user,
        })
    }

    /// Generate a secure random refresh token and expiry (30 days)
    pub fn generate_refresh_token_and_expiry() -> (String, chrono::DateTime<chrono::Utc>) {
        let mut bytes = [0u8; 32];
        rng().fill_bytes(&mut bytes);
        let token = general_purpose::URL_SAFE_NO_PAD.encode(&bytes);
        let expires_at = Utc::now() + Duration::days(2); // 2 days expiry
        (token, expires_at)
    }

    /// Delete all expired refresh tokens from the database
    pub async fn cleanup_expired_refresh_tokens(pool: &PgPool) -> Result<u64, sqlx::Error> {
        let result = sqlx::query!(r#"DELETE FROM refresh_tokens WHERE expires_at < NOW()"#)
            .execute(pool)
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn complete_verification(&self, email: &str) -> Result<(), sqlx::Error> {
        queries::complete_registration(&self.pool, email).await
    }

    pub fn create_token(&self, user: &User) -> Result<String, sqlx::Error> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::hours(24)) // 24 hours expiry (default)
            .expect("Valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: user.id,
            exp: expiration,
            email: user.email.clone(),
            username: user.username.clone(),
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )
        .map_err(|e| sqlx::Error::Protocol(format!("Failed to create token: {e}")))
    }
}
