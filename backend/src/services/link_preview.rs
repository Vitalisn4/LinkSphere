use crate::database::models::LinkPreview;
use anyhow::Result;
use reqwest::Client;
use scraper::{Html, Selector};

pub async fn fetch_link_preview(url: &str) -> Result<LinkPreview> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (compatible; LinkSphere/1.0)")
        .build()?;

    let response = client.get(url).send().await?;
    let html = response.text().await?;
    let document = Html::parse_document(&html);

    // Selectors for metadata
    let title_selector =
        Selector::parse("meta[property='og:title'], meta[name='twitter:title'], title").unwrap();
    let desc_selector = Selector::parse("meta[property='og:description'], meta[name='twitter:description'], meta[name='description']").unwrap();
    let image_selector =
        Selector::parse("meta[property='og:image'], meta[name='twitter:image']").unwrap();
    let favicon_selector = Selector::parse("link[rel='icon'], link[rel='shortcut icon']").unwrap();

    // Extract metadata
    let title = document.select(&title_selector).next().map(|el| {
        el.value()
            .attr("content")
            .map(String::from)
            .unwrap_or_else(|| el.inner_html())
    });

    let description = document
        .select(&desc_selector)
        .next()
        .and_then(|el| el.value().attr("content"))
        .map(String::from);

    let image = document
        .select(&image_selector)
        .next()
        .and_then(|el| el.value().attr("content"))
        .map(String::from);

    let favicon = document
        .select(&favicon_selector)
        .next()
        .and_then(|el| el.value().attr("href"))
        .map(|href| {
            if href.starts_with("http") {
                href.to_string()
            } else {
                format!("{}{}", url.trim_end_matches('/'), href)
            }
        });

    Ok(LinkPreview {
        title,
        description,
        image,
        favicon,
    })
}
