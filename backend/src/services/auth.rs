use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
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

    pub async fn register(&self, req: RegisterRequest) -> Result<User, sqlx::Error> {
        let password_hash = hash(req.password.as_bytes(), DEFAULT_COST)
            .map_err(|e| sqlx::Error::Protocol(format!("Failed to hash password: {}", e)))?;

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
            UserStatus::Inactive as _
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
            .map_err(|e| sqlx::Error::Protocol(format!("Failed to verify password: {}", e)))?
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
        Ok(AuthResponse { token, user })
    }

    pub async fn complete_verification(&self, email: &str) -> Result<(), sqlx::Error> {
        queries::complete_registration(&self.pool, email).await
    }

    fn create_token(&self, user: &User) -> Result<String, sqlx::Error> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::hours(24))
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
        .map_err(|e| sqlx::Error::Protocol(format!("Failed to create token: {}", e)))
    }
}
