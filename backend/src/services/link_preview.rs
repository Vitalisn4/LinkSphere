use crate::database::models::LinkPreview;
use anyhow::{anyhow, Context, Result};
use reqwest::{header, Client};
use scraper::{Html, Selector};
use std::time::Duration;
use url::Url;

pub async fn fetch_link_preview(url: &str) -> Result<LinkPreview> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(10))
        .build()?;

    let base_url = Url::parse(url)?;

    // Special handling for YouTube URLs
    if is_youtube_url(&base_url) {
        return fetch_youtube_preview(&client, &base_url).await;
    }

    let response = client
        .get(url)
        .send()
        .await
        .context("Failed to fetch URL")?;

    // Check content type
    let content_type = response
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !content_type.contains("text/html") {
        return Ok(LinkPreview {
            title: Some(url.to_string()),
            description: None,
            image: None,
            favicon: None,
        });
    }

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
        .map(|href| resolve_url(&base_url, href));

    let favicon = document
        .select(&favicon_selector)
        .next()
        .and_then(|el| el.value().attr("href"))
        .map(|href| resolve_url(&base_url, href));

    Ok(LinkPreview {
        title,
        description,
        image,
        favicon,
    })
}

fn resolve_url(base: &Url, path: &str) -> String {
    if path.starts_with("http://") || path.starts_with("https://") {
        path.to_string()
    } else {
        base.join(path)
            .map(|u| u.to_string())
            .unwrap_or_else(|_| path.to_string())
    }
}

fn is_youtube_url(url: &Url) -> bool {
    url.host_str()
        .map(|host| host == "youtube.com" || host == "www.youtube.com" || host == "youtu.be")
        .unwrap_or(false)
}

async fn fetch_youtube_preview(client: &Client, url: &Url) -> Result<LinkPreview> {
    let video_id = extract_youtube_video_id(url)?;

    // First try the YouTube Data API v3 public endpoint
    let api_url = format!("https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key=AIzaSyDqOtZx4Tq8h9J-uG9-1cxNNmj_iE8cRb4");

    let api_response = client.get(&api_url).send().await;

    if let Ok(response) = api_response {
        if let Ok(data) = response.json::<serde_json::Value>().await {
            if let Some(items) = data["items"].as_array() {
                if let Some(first_item) = items.first() {
                    if let Some(snippet) = first_item["snippet"].as_object() {
                        let title = snippet["title"].as_str().map(String::from);
                        let description = snippet["description"].as_str().map(String::from);
                        let channel_title = snippet["channelTitle"]
                            .as_str()
                            .unwrap_or("Unknown Channel");

                        // Get the best thumbnail available
                        let thumbnails = &snippet["thumbnails"];
                        let image = thumbnails["maxres"]
                            .as_object()
                            .or_else(|| thumbnails["high"].as_object())
                            .or_else(|| thumbnails["medium"].as_object())
                            .or_else(|| thumbnails["default"].as_object())
                            .and_then(|thumb| thumb["url"].as_str())
                            .map(String::from);

                        return Ok(LinkPreview {
                            title,
                            description: Some(format!(
                                "{} - {}",
                                description.unwrap_or_default(),
                                channel_title
                            )),
                            image,
                            favicon: Some("https://www.youtube.com/favicon.ico".to_string()),
                        });
                    }
                }
            }
        }
    }

    // Fallback to oEmbed if API fails
    let oembed_url = format!(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    );

    let oembed_response = client
        .get(&oembed_url)
        .send()
        .await
        .context("Failed to fetch YouTube oEmbed data")?;

    if oembed_response.status().is_success() {
        let oembed_data: serde_json::Value = oembed_response.json().await?;

        // Get high quality thumbnail
        let thumbnail_url = format!("https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg");

        // Check if maxresdefault exists
        let thumb_response = client
            .get(&thumbnail_url)
            .send()
            .await
            .map_err(|_| anyhow!("Failed to check thumbnail"))?;

        let image = if thumb_response.status().is_success() {
            thumbnail_url
        } else {
            format!("https://i.ytimg.com/vi/{video_id}/hqdefault.jpg")
        };

        Ok(LinkPreview {
            title: oembed_data["title"].as_str().map(String::from),
            description: Some(format!(
                "YouTube video by {}",
                oembed_data["author_name"].as_str().unwrap_or("Unknown")
            )),
            image: Some(image),
            favicon: Some("https://www.youtube.com/favicon.ico".to_string()),
        })
    } else {
        // Last resort fallback
        Ok(LinkPreview {
            title: Some(format!("YouTube Video ({video_id})")),
            description: None,
            image: Some(format!("https://i.ytimg.com/vi/{video_id}/hqdefault.jpg")),
            favicon: Some("https://www.youtube.com/favicon.ico".to_string()),
        })
    }
}

fn extract_youtube_video_id(url: &Url) -> Result<String> {
    // Handle youtu.be URLs
    if let Some(host) = url.host_str() {
        if host == "youtu.be" {
            let path = url.path().trim_start_matches('/');
            return Ok(path.split('?').next().unwrap_or(path).to_string());
        }
    }

    // Handle youtube.com URLs
    let video_id = url
        .query_pairs()
        .find(|(key, _)| key == "v")
        .map(|(_, value)| value.into_owned())
        .context("Could not find video ID in YouTube URL")?;

    Ok(video_id)
}
