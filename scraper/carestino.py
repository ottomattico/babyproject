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


def clean_price(text: str) -> int | None:
    if not text:
        return None
    digits = re.sub(r"[^0-9]", "", text)
    return int(digits) if digits else None


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

        price_text = " ".join((await price_el.inner_text()).split()) if price_el else ""
        original_text = (await original_el.inner_text()).strip() if original_el else ""

        img_el = await article.query_selector("img")
        img_src = await img_el.get_attribute("src") if img_el else ""
        img_alt = await img_el.get_attribute("alt") if img_el else name

        slug = href.strip("/").split("/")[-1] if href else name.lower().replace(" ", "-")

        products.append({
            "id": slug,
            "name": name,
            "price": clean_price(price_text),
            "price_text": price_text,
            "original_price": clean_price(original_text) if original_text else None,
            "original_price_text": original_text or None,
            "currency": "UYU",
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
        for url, category, subcategory in PAGES:
            products = await scrape_page(page, url, category, subcategory)
            all_products.extend(products)
        await browser.close()

    if all_products:
        count = upsert_products(all_products)
        print(f"\nUpserted {count} products to Supabase")
        print(f"Total scraped: {len(all_products)}")
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
