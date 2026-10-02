import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "MVD Kids"
BASE_URL = "https://www.mvdkids.com"
PRACTICUNAS_URL = f"{BASE_URL}/descanso/practicunas"


def clean_price(sim: str, monto: str) -> tuple[int | None, str]:
    """Returns (numeric_price, display_text) from separate sim/monto elements."""
    full_text = f"{sim.strip()} {monto.strip()}"
    digits = re.sub(r"[^0-9]", "", monto)
    return (int(digits) if digits else None), full_text


async def scrape_practicunas() -> list[dict]:
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print(f"Fetching {PRACTICUNAS_URL}...")
        await page.goto(PRACTICUNAS_URL, wait_until="networkidle", timeout=30000)

        cards = await page.query_selector_all("div.cnt")
        print(f"Found {len(cards)} product cards")

        for card in cards:
            # URL + title from the image link
            link_el = await card.query_selector("a.img")
            href = await link_el.get_attribute("href") if link_el else ""

            # Name from h2 inside .tit link
            name_el = await card.query_selector("a.tit h2")
            name = (await name_el.inner_text()).strip() if name_el else ""
            if not name:
                continue

            # Brand
            brand_el = await card.query_selector("div.marca")
            brand = (await brand_el.inner_text()).strip() if brand_el else ""

            # Price: .precio.venta span.sim + span.monto
            sim_el = await card.query_selector("strong.precio.venta span.sim")
            monto_el = await card.query_selector("strong.precio.venta span.monto")
            sim = (await sim_el.inner_text()).strip() if sim_el else "$"
            monto = (await monto_el.inner_text()).strip() if monto_el else ""
            price_val, price_text = clean_price(sim, monto)

            # Image
            img_el = await card.query_selector("a.img img")
            img_src = await img_el.get_attribute("src") if img_el else ""
            img_alt = await img_el.get_attribute("alt") if img_el else name
            # Normalize protocol-relative URLs
            if img_src.startswith("//"):
                img_src = "https:" + img_src

            slug = href.rstrip("/").split("/")[-1] if href else name.lower().replace(" ", "-")

            products.append({
                "id": slug,
                "name": name,
                "brand": brand or None,
                "price": price_val,
                "price_text": price_text,
                "original_price": None,
                "original_price_text": None,
                "image_url": img_src,
                "image_alt": img_alt,
                "product_url": href or "",
                "store": STORE,
                "category": "descanso",
                "subcategory": "descanso-practicunas",
                "scraped_at": datetime.utcnow().isoformat(),
            })

        await browser.close()

    return products


async def main():
    products = await scrape_practicunas()
    if products:
        count = upsert_products(products)
        print(f"Upserted {count} products to Supabase")
        print("\nSample product:")
        print(json.dumps(products[0], ensure_ascii=False, indent=2))
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
