use regex::Regex;
use lazy_static::lazy_static;
use zxcvbn::zxcvbn;

lazy_static! {
    static ref EMAIL_REGEX: Regex = Regex::new(
        r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    ).unwrap();
}

#[derive(Debug)]
pub struct PasswordError {
    pub score: u8,
    pub feedback: String,
}

pub fn validate_email(email: &str) -> bool {
    EMAIL_REGEX.is_match(email)
}

pub fn validate_password(password: &str) -> Result<(), PasswordError> {
    // Check minimum length
    if password.len() < 8 {
        return Err(PasswordError {
            score: 0,
            feedback: "Password must be at least 8 characters long".to_string(),
        });
    }

    // Use zxcvbn to check password strength
    let estimate = zxcvbn(password, &[]);
    
    // Score ranges from 0-4, where:
    // 0 - too guessable
    // 1 - very guessable
    // 2 - somewhat guessable
    // 3 - safely unguessable
    // 4 - very unguessable
    
    if (estimate.score() as u8) < 3 {
        let feedback = estimate
            .feedback()
            .as_ref()
            .and_then(|f| f.warning().map(|w| w.to_string()))
            .unwrap_or_else(|| "Password is too weak".to_string());
            
        return Err(PasswordError {
            score: estimate.score() as u8,
            feedback,
        });
    }

    Ok(())
} 