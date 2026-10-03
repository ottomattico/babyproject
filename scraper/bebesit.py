import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products, delete_missing_products

STORE = "Bebesit"
BASE_URL = "https://bebesit.com.uy"

PAGES = [
    # Movilidad - Coches
    (f"{BASE_URL}/coches/travel-system",        "movilidad", "movilidad-coches-ts"),
    (f"{BASE_URL}/coches/paraguitas",           "movilidad", "movilidad-coches-para"),
    (f"{BASE_URL}/coches/paseo",                "movilidad", "movilidad-coches-paseo"),
    (f"{BASE_URL}/coches/dobles",               "movilidad", "movilidad-coches-doble"),
    # Movilidad - Sillas de auto
    (f"{BASE_URL}/sillas-de-auto/butacas",      "movilidad", "movilidad-auto-butaca"),
    (f"{BASE_URL}/sillas-de-auto/booster",      "movilidad", "movilidad-auto-booster"),
    (f"{BASE_URL}/sillas-de-auto/bases",        "movilidad", "movilidad-auto-baby"),
    # Descanso
    (f"{BASE_URL}/dormitorio/colecho",                  "descanso", "descanso-colecho"),
    (f"{BASE_URL}/dormitorio/practicunas-y-corrales",   "descanso", "descanso-practicunas"),
    (f"{BASE_URL}/dormitorio/otros",                    "bolsos",   "bolsos-cambiadores"),
    # Baño
    (f"{BASE_URL}/bano/catres-de-bano-y-baneras",   "bano", "bano-baneras"),
    (f"{BASE_URL}/bano/pelelas-y-accesorios",        "bano", "bano-pelelas"),
    # Alimentación
    (f"{BASE_URL}/alimentacion/silla-de-comer",     "alimentacion", "alim-sillas"),
    (f"{BASE_URL}/alimentacion/accesorios",          "alimentacion", "alim-vajilla"),
    (f"{BASE_URL}/alimentacion/extractores",         "alimentacion", "alim-lactancia-extra"),
    # Estimulación
    (f"{BASE_URL}/estimulacion/gimnasios-y-alfombras",      "estimulacion", "estim-gimnasios"),
    (f"{BASE_URL}/estimulacion/mordillos-y-sonajeros",      "estimulacion", "estim-mordillos"),
    (f"{BASE_URL}/estimulacion/bouncer-y-columpios",        "estimulacion", "estim-columpios"),
    (f"{BASE_URL}/estimulacion/andadores-y-caminadores",    "estimulacion", "estim-andadores"),
    # Juguetes
    (f"{BASE_URL}/juguetes/coches-de-muneca",       "juguetes", "juguetes-casitas"),
    (f"{BASE_URL}/juguetes/didactico-de-madera",    "juguetes", "juguetes-didacticos"),
    (f"{BASE_URL}/juguetes/casitas-de-munecas",     "juguetes", "juguetes-casitas"),
    (f"{BASE_URL}/juguetes/cocinas",                "juguetes", "juguetes-casitas"),
    (f"{BASE_URL}/juguetes/casita-de-jardin",       "juguetes", "juguetes-casitas"),
    (f"{BASE_URL}/juguetes/juegos-de-rol",          "juguetes", "juguetes-casitas"),
    (f"{BASE_URL}/juguetes/estimulacion-y-sensoriales", "estimulacion", "estim-mordillos"),
    # Sobre ruedas
    (f"{BASE_URL}/sobre-ruedas/bicicletas",             "ruedas", "ruedas-bicis"),
    (f"{BASE_URL}/sobre-ruedas/bicicletas-sin-pedales", "ruedas", "ruedas-bicis"),
    (f"{BASE_URL}/sobre-ruedas/buggies",                "ruedas", "ruedas-buggies"),
    (f"{BASE_URL}/sobre-ruedas/triciclos",              "ruedas", "ruedas-triciclos"),
    (f"{BASE_URL}/sobre-ruedas/vehiculos-a-bateria",    "ruedas", "ruedas-electricos"),
    (f"{BASE_URL}/sobre-ruedas/monopatines",            "ruedas", "ruedas-mono"),
    # Bolsos y seguridad
    (f"{BASE_URL}/accesorios/bolsos-y-mochilas",    "bolsos",    "bolsos-maternal"),
    (f"{BASE_URL}/accesorios/de-paseo",             "bolsos",    "bolsos-parasoles"),
    (f"{BASE_URL}/accesorios/de-seguridad",         "seguridad", "seguridad-portones"),
]


def parse_price(sim: str, monto: str) -> tuple[int | None, str, str]:
    sim = sim.strip()
    monto = monto.strip()
    full_text = f"{sim} {monto}"
    if "," in monto:
        monto = monto.split(",")[0]
    digits = re.sub(r"[^0-9]", "", monto)
    currency = "USD" if any(x in sim for x in ("U$S", "US$", "USD")) else "UYU"
    return (int(digits) if digits else None), full_text, currency


async def scrape_page(page, url: str, category: str, subcategory: str) -> list[dict]:
    products = []
    print(f"Fetching {url}...")
    await page.goto(url, wait_until="networkidle", timeout=30000)

    while True:
        btn = await page.query_selector("a.btnMas")
        if not btn:
            break
        await btn.click()
        await page.wait_for_load_state("networkidle", timeout=10000)

    cards = await page.query_selector_all("div.cnt:has(a.img)")
    print(f"  Found {len(cards)} cards")

    for card in cards:
        link_el = await card.query_selector("a.img")
        href = await link_el.get_attribute("href") if link_el else ""

        name_el = await card.query_selector("a.tit")
        name = (await name_el.inner_text()).strip() if name_el else ""
        if not name:
            continue

        sim_el = await card.query_selector("strong.precio.venta span.sim")
        monto_el = await card.query_selector("strong.precio.venta span.monto")
        sim = (await sim_el.inner_text()).strip() if sim_el else "$"
        monto = (await monto_el.inner_text()).strip() if monto_el else ""
        price_val, price_text, currency = parse_price(sim, monto)

        orig_sim_el = await card.query_selector("del.precio.lista span.sim")
        orig_monto_el = await card.query_selector("del.precio.lista span.monto")
        orig_price_val, orig_price_text = None, None
        if orig_sim_el and orig_monto_el:
            orig_sim = (await orig_sim_el.inner_text()).strip()
            orig_monto = (await orig_monto_el.inner_text()).strip()
            orig_price_val, orig_price_text, _ = parse_price(orig_sim, orig_monto)

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
            "currency": currency,
            "image_url": img_src,
            "image_alt": img_alt,
            "product_url": href or "",
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
        current_ids = [p["id"] for p in all_products]
        deleted = delete_missing_products(STORE, current_ids)
        print(f"\nUpserted {count} products to Supabase")
        print(f"Deleted {deleted} products no longer in store")
        print(f"Total scraped: {len(all_products)}")
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
