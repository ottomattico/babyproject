import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "Bebesit"
BASE_URL = "https://bebesit.com.uy"
URL = f"{BASE_URL}/dormitorio/practicunas-y-corrales"



def parse_price(sim: str, monto: str) -> tuple[int | None, str]:
    """Returns (numeric_price, display_text). Handles UYU (3.799 = 3799) and USD (159,00 = 159)."""
    sim = sim.strip()
    monto = monto.strip()
    full_text = f"{sim} {monto}"
    # Comma = decimal separator (USD style) → drop decimal part
    if "," in monto:
        monto = monto.split(",")[0]
    digits = re.sub(r"[^0-9]", "", monto)
    return (int(digits) if digits else None), full_text


async def scrape() -> list[dict]:
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print(f"Fetching {URL}...")
        await page.goto(URL, wait_until="networkidle", timeout=30000)

        cards = await page.query_selector_all("div.cnt:has(a.img)")
        print(f"Found {len(cards)} product cards")

        for card in cards:
            link_el = await card.query_selector("a.img")
            href = await link_el.get_attribute("href") if link_el else ""

            # Name is directly in a.tit (no h2)
            name_el = await card.query_selector("a.tit")
            name = (await name_el.inner_text()).strip() if name_el else ""
            if not name:
                continue

            # Sale price: strong.precio.venta
            sim_el = await card.query_selector("strong.precio.venta span.sim")
            monto_el = await card.query_selector("strong.precio.venta span.monto")
            sim = (await sim_el.inner_text()).strip() if sim_el else "$"
            monto = (await monto_el.inner_text()).strip() if monto_el else ""
            price_val, price_text = parse_price(sim, monto)

            # Original price: del.precio.lista
            orig_sim_el = await card.query_selector("del.precio.lista span.sim")
            orig_monto_el = await card.query_selector("del.precio.lista span.monto")
            orig_price_val, orig_price_text = None, None
            if orig_sim_el and orig_monto_el:
                orig_sim = (await orig_sim_el.inner_text()).strip()
                orig_monto = (await orig_monto_el.inner_text()).strip()
                orig_price_val, orig_price_text = parse_price(orig_sim, orig_monto)

            # Product image is the direct img child of a.img (not inside div.logoMarca)
            img_el = await card.query_selector("a.img > img")
            img_src = await img_el.get_attribute("src") if img_el else ""
            img_alt = await img_el.get_attribute("alt") if img_el else name
            if img_src.startswith("//"):
                img_src = "https:" + img_src

            slug = href.rstrip("/").split("/")[-1] if href else name.lower().replace(" ", "-")

            products.append({
                "id": slug,
                "name": name,
                "brand": None,
                "price": price_val,
                "price_text": price_text,
                "original_price": orig_price_val,
                "original_price_text": orig_price_text,
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
    products = await scrape()
    if products:
        count = upsert_products(products)
        print(f"Upserted {count} products to Supabase")
        print("\nSample product:")
        print(json.dumps(products[0], ensure_ascii=False, indent=2))
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
