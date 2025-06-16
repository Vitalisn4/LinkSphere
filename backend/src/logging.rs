use std::time::Duration;
use tracing::Level;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::{fmt::format::FmtSpan, prelude::*, EnvFilter};
use uuid::Uuid;

/// Initialize the logging system with custom configuration
pub fn init_logging() {
    // Create a rolling file appender for logs
    let file_appender = RollingFileAppender::new(Rotation::DAILY, "logs", "app.log");

    // Create a console appender with custom formatting
    let console_layer = tracing_subscriber::fmt::layer()
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false)
        .with_span_events(FmtSpan::CLOSE)
        .with_level(true)
        .with_thread_names(false)
        .with_ansi(true);

    // Create a file layer with JSON formatting
    let file_layer = tracing_subscriber::fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .with_span_events(FmtSpan::CLOSE)
        .with_level(true)
        .with_thread_names(true)
        .with_ansi(false)
        .with_writer(file_appender)
        .json();

    // Set up the subscriber with custom filters
    let filter_layer = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("info"))
        .unwrap()
        .add_directive(Level::INFO.into())
        .add_directive("tower_http=debug".parse().unwrap())
        .add_directive("sqlx=warn".parse().unwrap());

    // Initialize the subscriber
    tracing_subscriber::registry()
        .with(filter_layer)
        .with(console_layer)
        .with(file_layer)
        .init();

    // Log startup message
    tracing::info!("Logging system initialized");
}

/// Create a request ID for tracing
pub fn generate_request_id() -> String {
    Uuid::new_v4().to_string()
}

/// Log a request with timing information
pub fn log_request(method: &str, path: &str, status: u16, duration: Duration, request_id: &str) {
    tracing::info!(
        request_id = request_id,
        method = method,
        path = path,
        status = status,
        duration_ms = duration.as_millis(),
        "Request completed"
    );
}

/// Log an error with context
#[allow(dead_code)]
pub fn log_error(error: &dyn std::error::Error, context: &str) {
    tracing::error!(
        error = %error,
        context = context,
        "Error occurred"
    );
}

#[allow(dead_code)]
/// Log a database query with timing
pub fn log_query(query: &str, duration: Duration) {
    if duration > Duration::from_millis(100) {
        tracing::warn!(
            query = query,
            duration_ms = duration.as_millis(),
            "Slow query detected"
        );
    } else {
        tracing::debug!(
            query = query,
            duration_ms = duration.as_millis(),
            "Query executed"
        );
    }
}
