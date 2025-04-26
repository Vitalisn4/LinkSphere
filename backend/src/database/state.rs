use std::sync::Arc;
use sqlx::PgPool;

// Structure to hold the database pool
#[derive(Clone)] // Add Clone for state sharing
pub struct PoolState {
    pub pool: PgPool, // Make field public
}

// Define an alias for our application state, making it accessible
pub type AppState = Arc<PoolState>; 