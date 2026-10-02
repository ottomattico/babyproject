import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "Carestino"
BASE_URL = "https://www.carestino.com.uy"
CUNAS_URL = f"{BASE_URL}/productos/cunas/"


def clean_price(text: str) -> int | None:
    if not text:
        return None
    digits = re.sub(r"[^0-9]", "", text)
    return int(digits) if digits else None


async def scrape_cunas() -> list[dict]:
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print(f"Fetching {CUNAS_URL}...")
        await page.goto(CUNAS_URL, wait_until="networkidle", timeout=30000)

        # Each product is an <article> inside section[data-testid="products-container"]
        articles = await page.query_selector_all('section[data-testid="products-container"] article')
        print(f"Found {len(articles)} product articles")

        for article in articles:
            # The info link (name + price) is the last <a> in the article
            info_link = await article.query_selector('a.flex.flex-col')
            if not info_link:
                # Fallback: get all links and take the last one
                links = await article.query_selector_all('a[href*="/producto/"]')
                if not links:
                    continue
                # Deduplicate by href
                hrefs = []
                for l in links:
                    h = await l.get_attribute("href")
                    if h not in hrefs:
                        hrefs.append(h)
                # The info link is the one containing h2
                info_link = None
                for l in links:
                    h2 = await l.query_selector("h2")
                    if h2:
                        info_link = l
                        break
                if not info_link:
                    continue

            href = await info_link.get_attribute("href")
            name_el = await info_link.query_selector("h2")
            price_el = await info_link.query_selector("h3")
            # Original price (struck through)
            original_el = await info_link.query_selector("s")

            name = (await name_el.inner_text()).strip() if name_el else ""
            if not name:
                continue

            price_text = " ".join((await price_el.inner_text()).split()) if price_el else ""
            original_text = (await original_el.inner_text()).strip() if original_el else ""

            # Image: first img inside the carousel (first <a> in the article)
            img_el = await article.query_selector("img")
            img_src = await img_el.get_attribute("src") if img_el else ""
            img_alt = await img_el.get_attribute("alt") if img_el else name

            # Build slug-based ID from URL
            slug = href.strip("/").split("/")[-1] if href else name.lower().replace(" ", "-")

            products.append({
                "id": slug,
                "name": name,
                "price": clean_price(price_text),
                "price_text": price_text,
                "original_price": clean_price(original_text) if original_text else None,
                "original_price_text": original_text or None,
                "image_url": img_src,
                "image_alt": img_alt,
                "product_url": f"{BASE_URL}{href}" if href else "",
                "store": STORE,
                "category": "descanso",
                "subcategory": "descanso-practicunas",
                "scraped_at": datetime.utcnow().isoformat(),
            })

        await browser.close()

    return products


async def main():
    products = await scrape_cunas()
    if products:
        count = upsert_products(products)
        print(f"Upserted {count} products to Supabase")
        print("\nSample product:")
        print(json.dumps(products[0], ensure_ascii=False, indent=2))
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
