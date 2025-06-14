#![allow(dead_code)]
pub mod email;
pub mod middleware;
pub mod models;
pub mod routes;
pub mod service;
pub mod validation;

pub use routes::create_router;
