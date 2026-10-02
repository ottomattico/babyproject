import asyncio
import json
import re
import os
from datetime import datetime
from playwright.async_api import async_playwright

STORE = "Baby City"
BASE_URL = "https://babycity.com.uy"
URL = f"{BASE_URL}/dormitorio/practicunas-corrales/1"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../data/products.json")


def parse_price(text: str) -> tuple[int | None, str]:
    """Parse price text like 'USD\xa0199' or '$ 3.799'."""
    text = text.strip().replace("\xa0", " ")
    # Remove decimal part if comma-separated
    if "," in text:
        text = text.split(",")[0]
    digits = re.sub(r"[^0-9]", "", text)
    return (int(digits) if digits else None), text.strip()


async def scrape() -> list[dict]:
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print(f"Fetching {URL}...")
        await page.goto(URL, wait_until="load", timeout=60000)
        await page.wait_for_timeout(2000)

        cards = await page.query_selector_all("a.productViewContainer")
        print(f"Found {len(cards)} product cards")

        for card in cards:
            href = await card.get_attribute("href") or ""

            name_el = await card.query_selector("h2.productViewName")
            name = (await name_el.inner_text()).strip() if name_el else ""
            if not name:
                continue

            price_el = await card.query_selector("div.productViewPrice")
            price_text_raw = (await price_el.inner_text()).strip() if price_el else ""
            price_val, price_text = parse_price(price_text_raw)

            img_el = await card.query_selector("img.firstImg")
            img_src = await img_el.get_attribute("src") if img_el else ""
            img_alt = await img_el.get_attribute("alt") if img_el else name

            slug = href.rstrip("/").split("/")[-1] if href else name.lower().replace(" ", "-")
            full_url = f"{BASE_URL}{href}" if href.startswith("/") else href

            products.append({
                "id": slug,
                "name": name,
                "brand": None,
                "price": price_val,
                "price_text": price_text,
                "original_price": None,
                "original_price_text": None,
                "image_url": img_src,
                "image_alt": img_alt,
                "product_url": full_url,
                "store": STORE,
                "category": "cunas",
                "scraped_at": datetime.utcnow().isoformat(),
            })

        await browser.close()

    return products


def save_products(products: list[dict]):
    existing = []
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            try:
                existing = json.load(f)
            except json.JSONDecodeError:
                existing = []

    filtered = [
        p for p in existing
        if not (p.get("store") == STORE and p.get("category") == "cunas")
    ]
    merged = filtered + products

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(products)} products → {OUTPUT_FILE} ({len(merged)} total)")


async def main():
    products = await scrape()
    if products:
        save_products(products)
        print("\nSample product:")
        print(json.dumps(products[0], ensure_ascii=False, indent=2))
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
