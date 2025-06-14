use crate::logging::{generate_request_id, log_request};
use axum::{
    body::Body,
    http::{Request, Response},
    middleware::Next,
};

pub async fn request_logger(req: Request<Body>, next: Next) -> Response<Body> {
    let request_id = generate_request_id();
    let method = req.method().clone();
    let path = req.uri().path().to_string();
    let start = std::time::Instant::now();

    // Add request ID to extensions
    let mut req = req;
    req.extensions_mut().insert(request_id.clone());

    // Process the request
    let response = next.run(req).await;

    // Log the request
    log_request(
        method.as_str(),
        &path,
        response.status().as_u16(),
        start.elapsed(),
        &request_id,
    );

    response
}
