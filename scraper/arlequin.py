import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products, delete_missing_products

STORE = "Arlequin"
BASE_URL = "https://arlequin.uy"

PAGES = [
    # Descanso
    (f"{BASE_URL}/categoria-producto/cunas/",       "descanso",     "descanso-practicunas"),
    (f"{BASE_URL}/categoria-producto/colecho/",     "descanso",     "descanso-colecho"),
    (f"{BASE_URL}/categoria-producto/blanqueria/",  "descanso",     "descanso-ropa-sabanas"),
    # Estimulación
    (f"{BASE_URL}/categoria-producto/mecedoras/",           "estimulacion", "estim-mecedoras"),
    (f"{BASE_URL}/categoria-producto/moviles/",             "estimulacion", "estim-moviles"),
    (f"{BASE_URL}/categoria-producto/alfombras-y-cestos/",  "estimulacion", "estim-gimnasios"),
    # Juguetes
    (f"{BASE_URL}/categoria-producto/babyessentials/munecos/", "juguetes", "juguetes-didacticos"),
    # Textiles / Ropa
    (f"{BASE_URL}/categoria-producto/indumentaria/nb-a-24-meses/",  "textiles", "textiles-ropa"),
    (f"{BASE_URL}/categoria-producto/indumentaria/primera-muda/",   "textiles", "textiles-ropa"),
    (f"{BASE_URL}/categoria-producto/pijamas/",                     "textiles", "textiles-ropa"),
    (f"{BASE_URL}/categoria-producto/indumentaria/bebes/",          "textiles", "textiles-ropa"),
    (f"{BASE_URL}/categoria-producto/indumentaria/beba/",           "textiles", "textiles-ropa"),
    (f"{BASE_URL}/categoria-producto/indumentaria/bebe/",           "textiles", "textiles-ropa"),
    (f"{BASE_URL}/categoria-producto/baby-alpaca/",                 "textiles", "textiles-ropa"),
]


def parse_price(text: str) -> tuple[int | None, str]:
    """Parse WooCommerce price like '$42,900.00 UYU' → 42900"""
    text = text.strip()
    # Remove currency symbol and code, keep numbers
    # Format: $42,900.00 — comma=thousands, dot=decimal
    # Remove everything after dot (decimals)
    no_sym = re.sub(r"[^0-9,\.]", "", text)
    if "." in no_sym:
        no_sym = no_sym.split(".")[0]  # remove decimals
    digits = re.sub(r"[^0-9]", "", no_sym)
    return (int(digits) if digits else None), text


async def scrape_page(page, url: str, category: str, subcategory: str) -> list[dict]:
    products = []
    print(f"Fetching {url}...")
    await page.goto(url, wait_until="networkidle", timeout=30000)

    cards = await page.query_selector_all("li.product")
    print(f"  Found {len(cards)} products")

    for card in cards:
        link_el = await card.query_selector("a.woocommerce-loop-product__link")
        href = await link_el.get_attribute("href") if link_el else ""

        name_el = await card.query_selector("h4, h2, .woocommerce-loop-product__title")
        name = (await name_el.inner_text()).strip() if name_el else ""
        if not name:
            continue

        price_el = await card.query_selector("span.woocommerce-Price-amount bdi")
        price_text_raw = (await price_el.inner_text()).strip() if price_el else ""
        price_val, price_text = parse_price(price_text_raw)

        img_el = await card.query_selector("span.et_shop_image img")
        img_src = await img_el.get_attribute("src") if img_el else ""
        img_alt = await img_el.get_attribute("alt") if img_el else name

        slug = href.rstrip("/").split("/")[-1] if href else name.lower().replace(" ", "-")

        products.append({
            "id": slug,
            "name": name,
            "brand": None,
            "price": price_val,
            "price_text": price_text,
            "original_price": None,
            "original_price_text": None,
            "currency": "UYU",
            "image_url": img_src,
            "image_alt": img_alt,
            "product_url": href,
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
                url = base_url if page_num == 1 else f"{base_url.rstrip('/')}/page/{page_num}/"
                products = await scrape_page(page, url, category, subcategory)
                all_products.extend(products)
                if not products:
                    break
                page_num += 1
        await browser.close()

    if all_products:
        count = upsert_products(all_products)
        current_ids = [p["id"] for p in all_products]
        deleted = delete_missing_products(STORE, current_ids)
        print(f"\nUpserted {count} products to Supabase")
        print(f"Deleted {deleted} products no longer in store")
        print(f"Total scraped: {len(all_products)}")
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
