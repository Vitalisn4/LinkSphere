mod routes;
mod database;
use actix_web::{App, HttpServer, web};
use database::get_db_pool;
use routes::uploads::upload_link;
use actix_cors::Cors;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db_pool = get_db_pool().await;
    HttpServer::new(move || {
        App::new()
            .wrap(Cors::permissive())
            .app_data(web::Data::new(db_pool.clone()))
            .service(upload_link)
    })
    .bind(("0.0.0.0", 8000))?
    .run()
    .await
}
