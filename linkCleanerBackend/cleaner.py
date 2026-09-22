import httpx


def resolver(url: str):

    if "instagram.com" in url or "snapchat.com" in url:
        final_url = url

    elif "tiktok.com" in url or "pinterest.com" in url or "pin.it" in url:
        response = httpx.get(
            url,
            follow_redirects=True
        )

        final_url = str(response.url)

    else:
        return {
            "error": "This link is not supported yet. Please use a link from Instagram, Snapchat, TikTok, or Pinterest."
        }

    clean_url = final_url.split("?")[0]

    return {
        "original_url": url,
        "resolved_url": clean_url
    }