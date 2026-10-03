import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "Carestino"
BASE_URL = "https://www.carestino.com.uy"

PAGES = [
    (f"{BASE_URL}/productos/cunas/",                   "descanso",      "descanso-practicunas"),
    (f"{BASE_URL}/productos/cochecitos/",              "movilidad",     "movilidad-coches"),
    (f"{BASE_URL}/productos/butacas/",                 "movilidad",     "movilidad-auto-butaca"),
    (f"{BASE_URL}/productos/sillas/",                  "alimentacion",  "alim-sillas"),
    (f"{BASE_URL}/productos/mecedoras/",               "estimulacion",  "estim-mecedoras"),
    (f"{BASE_URL}/productos/porteo/",                  "movilidad",     "movilidad-porteo"),
    (f"{BASE_URL}/productos/bolsos-y-mochilas/",       "bolsos",        "bolsos-maternal"),
    (f"{BASE_URL}/productos/banio-y-cuidado/",         "bano",          "bano-higiene"),
    (f"{BASE_URL}/productos/diversion/",               "juguetes",      "juguetes-0-12"),
    (f"{BASE_URL}/productos/seguridad/",               "seguridad",     "seguridad-portones"),
    (f"{BASE_URL}/productos/alimentacion-y-lactancia/","alimentacion",  "alim-lactancia"),
]


def parse_price_and_discount(raw: str) -> tuple[int | None, str, int | None, int | None]:
    """Returns (price, price_text, original_price, discount_pct)"""
    raw = " ".join(raw.split())
    # Extract discount % if present: "$ 3.514 5% OFF"
    pct_match = re.search(r"(\d+)%\s*OFF", raw, re.IGNORECASE)
    discount_pct = int(pct_match.group(1)) if pct_match else None
    # Remove "% OFF" part to get clean price text
    price_text = re.sub(r"\d+%\s*OFF", "", raw, flags=re.IGNORECASE).strip()
    digits = re.sub(r"[^0-9]", "", price_text)
    price = int(digits) if digits else None
    # Calculate original price from discount %
    original_price = None
    if discount_pct and price:
        original_price = round(price / (1 - discount_pct / 100))
    return price, price_text, original_price, discount_pct


async def scrape_page(page, url: str, category: str, subcategory: str) -> list[dict]:
    products = []
    print(f"Fetching {url}...")
    await page.goto(url, wait_until="networkidle", timeout=30000)

    articles = await page.query_selector_all('section[data-testid="products-container"] article')
    print(f"  Found {len(articles)} products")

    for article in articles:
        info_link = await article.query_selector('a.flex.flex-col')
        if not info_link:
            links = await article.query_selector_all('a[href*="/producto/"]')
            if not links:
                continue
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
        original_el = await info_link.query_selector("s")

        name = (await name_el.inner_text()).strip() if name_el else ""
        if not name:
            continue

        price_raw = (await price_el.inner_text()) if price_el else ""
        price, price_text, original_price, _ = parse_price_and_discount(price_raw)

        img_el = await article.query_selector("img")
        img_src = await img_el.get_attribute("src") if img_el else ""
        img_alt = await img_el.get_attribute("alt") if img_el else name

        slug = href.strip("/").split("/")[-1] if href else name.lower().replace(" ", "-")

        products.append({
            "id": slug,
            "name": name,
            "price": price,
            "price_text": price_text,
            "original_price": original_price,
            "original_price_text": f"$ {original_price:,}".replace(",", ".") if original_price else None,
            "currency": "UYU",
            "card_bank": None,
            "card_discount_pct": None,
            "card_price": None,
            "image_url": img_src,
            "image_alt": img_alt,
            "product_url": f"{BASE_URL}{href}" if href else "",
            "store": STORE,
            "category": category,
            "subcategory": subcategory,
            "scraped_at": datetime.utcnow().isoformat(),
        })

    return products


async def main():
    all_products = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        for base_url, category, subcategory in PAGES:
            page_num = 1
            while True:
                url = base_url if page_num == 1 else f"{base_url.rstrip('/')}/?page={page_num}"
                products = await scrape_page(page, url, category, subcategory)
                all_products.extend(products)
                if not products:
                    break
                page_num += 1
        await browser.close()

    if all_products:
        count = upsert_products(all_products)
        print(f"\nUpserted {count} products to Supabase")
        print(f"Total scraped: {len(all_products)}")
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
