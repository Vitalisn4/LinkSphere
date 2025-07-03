use bcrypt::{hash, DEFAULT_COST};

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password.as_bytes(), DEFAULT_COST)
}
