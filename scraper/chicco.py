import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "Chicco"
BASE_URL = "https://www.chicco.com.uy"

# (url, category, subcategory)
PAGES = [
    # Movilidad - Coches
    (f"{BASE_URL}/catalogo/de-paseo/coches-travel-system/",     "movilidad",     "movilidad-coches-ts"),
    (f"{BASE_URL}/catalogo/de-paseo/coches-ultralivianos/",     "movilidad",     "movilidad-coches-paseo"),
    (f"{BASE_URL}/catalogo/de-paseo/coches-de-mellizos/",       "movilidad",     "movilidad-coches-doble"),
    (f"{BASE_URL}/catalogo/de-paseo/porta-bebes/",              "movilidad",     "movilidad-porteo"),
    # Movilidad - Sillas de auto
    (f"{BASE_URL}/catalogo/de-viaje/sillas-de-auto/",           "movilidad",     "movilidad-auto-butaca"),
    # Descanso
    (f"{BASE_URL}/catalogo/descanso/practicunas/",              "descanso",      "descanso-practicunas"),
    # Estimulación
    (f"{BASE_URL}/catalogo/descanso/columpios-y-mecedoras/",    "estimulacion",  "estim-mecedoras"),
    (f"{BASE_URL}/catalogo/descanso/mordillos/",                "estimulacion",  "estim-mordillos"),
    (f"{BASE_URL}/catalogo/juego/alfombras-y-gimnasios/",       "estimulacion",  "estim-gimnasios"),
    (f"{BASE_URL}/catalogo/juego/juguetes-para-la-cuna/",       "estimulacion",  "estim-moviles"),
    (f"{BASE_URL}/catalogo/juego/sonajeros/",                   "estimulacion",  "estim-mordillos"),
    (f"{BASE_URL}/catalogo/juego/primeras-actividades/",        "estimulacion",  "estim-mordillos"),
    (f"{BASE_URL}/catalogo/juego/juguetes-musicales/",          "estimulacion",  "estim-moviles"),
    # Sobre ruedas
    (f"{BASE_URL}/catalogo/juego/vehiculos/",                   "ruedas",        "ruedas-electricos"),
    # Alimentación
    (f"{BASE_URL}/catalogo/alimentacion/sillas-de-comer/",      "alimentacion",  "alim-sillas"),
    (f"{BASE_URL}/catalogo/alimentacion/vasos/",                "alimentacion",  "alim-vajilla-vasos"),
    (f"{BASE_URL}/catalogo/alimentacion/platos-cubiertos-y-accesorios/", "alimentacion", "alim-vajilla-platos"),
    # Lactancia
    (f"{BASE_URL}/catalogo/lactancia/extractores-de-leche/",    "alimentacion",  "alim-lactancia-extra"),
    (f"{BASE_URL}/catalogo/lactancia/biberones-y-tetinas/",     "alimentacion",  "alim-lactancia-biber"),
    (f"{BASE_URL}/catalogo/lactancia/calienta-biberones-y-esterilizadores/", "alimentacion", "alim-lactancia-esteri"),
    (f"{BASE_URL}/catalogo/lactancia/accesorios-para-lactancia/", "alimentacion", "alim-lactancia"),
    # Baño
    (f"{BASE_URL}/catalogo/bano/cambiadores-y-banitos/",        "bano",          "bano-baneras"),
    (f"{BASE_URL}/catalogo/bano/higiene/",                      "bano",          "bano-higiene"),
    # Seguridad
    (f"{BASE_URL}/catalogo/cuidado/seguridad/",                 "seguridad",     "seguridad-portones"),
]


def parse_price(moneda: str, precio: str) -> tuple[int | None, str, str]:
    precio = precio.strip()
    moneda = moneda.strip()
    full_text = f"{moneda} {precio}"
    digits = re.sub(r"[^0-9]", "", precio.split(",")[0])
    currency = "USD" if any(x in moneda for x in ("U$S", "US$", "USD")) else "UYU"
    return (int(digits) if digits else None), full_text, currency


async def scrape_page(page, url: str, category: str, subcategory: str) -> list[dict]:
    products = []
    print(f"Fetching {url}...")
    await page.goto(url, wait_until="networkidle", timeout=30000)

    cards = await page.query_selector_all("article.prod_item")
    print(f"  Found {len(cards)} products")

    for card in cards:
        link_el = await card.query_selector("div.foto a")
        href = await link_el.get_attribute("href") if link_el else ""

        name_el = await card.query_selector("h2 a span")
        name = (await name_el.inner_text()).strip() if name_el else ""
        if not name:
            continue

        moneda_el = await card.query_selector("span.pmoneda")
        precio_el = await card.query_selector("span.pprecio")
        moneda = (await moneda_el.inner_text()).strip() if moneda_el else "USD"
        precio = (await precio_el.inner_text()).strip() if precio_el else ""
        price_val, price_text, currency = parse_price(moneda, precio)

        img_el = await card.query_selector("div.foto img")
        img_src = await img_el.get_attribute("src") if img_el else ""
        img_alt = await img_el.get_attribute("alt") if img_el else name

        slug = href.rstrip("/").split("/")[-1] if href else name.lower().replace(" ", "-")
        full_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        products.append({
            "id": slug,
            "name": name,
            "brand": "Chicco",
            "price": price_val,
            "price_text": price_text,
            "original_price": None,
            "original_price_text": None,
            "currency": currency,
            "image_url": img_src,
            "image_alt": img_alt,
            "product_url": full_url,
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
        print("Sample:", json.dumps(all_products[0], ensure_ascii=False, indent=2))
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
