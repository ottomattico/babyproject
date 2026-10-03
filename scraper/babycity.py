import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "Baby City"
BASE_URL = "https://babycity.com.uy"

PAGES = [
    # Movilidad - Coches
    (f"{BASE_URL}/coches-de-bebe/travel-system/1",      "movilidad", "movilidad-coches-ts"),
    (f"{BASE_URL}/coches-de-bebe/compactos-paseo/1",    "movilidad", "movilidad-coches-paseo"),
    (f"{BASE_URL}/coches-de-bebe/paraguitas/1",         "movilidad", "movilidad-coches-para"),
    (f"{BASE_URL}/coches-de-bebe/coches-dobles/1",      "movilidad", "movilidad-coches-doble"),
    # Movilidad - Sillas de auto
    (f"{BASE_URL}/sillas-de-auto/booster/1",            "movilidad", "movilidad-auto-booster"),
    (f"{BASE_URL}/sillas-de-auto/butacas/1",            "movilidad", "movilidad-auto-butaca"),
    (f"{BASE_URL}/sillas-de-auto/babysillas-bases/1",   "movilidad", "movilidad-auto-baby"),
    # Lactancia
    (f"{BASE_URL}/lactancia/extractores-de-leche/1",    "alimentacion", "alim-lactancia-extra"),
    (f"{BASE_URL}/lactancia/calienta-biberones/1",      "alimentacion", "alim-lactancia-esteri"),
    (f"{BASE_URL}/lactancia/biberones-accesorios/1",    "alimentacion", "alim-lactancia-biber"),
    (f"{BASE_URL}/lactancia/chupetes-y-accesorios/1",   "alimentacion", "alim-lactancia-chupe"),
    (f"{BASE_URL}/lactancia/accesorios-de-lactancia/1", "alimentacion", "alim-lactancia"),
    # Alimentación
    (f"{BASE_URL}/alimentacion/sillas-de-comer/1",              "alimentacion", "alim-sillas"),
    (f"{BASE_URL}/alimentacion/platos-bowls/1",                 "alimentacion", "alim-vajilla-platos"),
    (f"{BASE_URL}/alimentacion/cubiertos/1",                    "alimentacion", "alim-vajilla-cubier"),
    (f"{BASE_URL}/alimentacion/botellas-termos-vasos/1",        "alimentacion", "alim-vajilla-vasos"),
    (f"{BASE_URL}/alimentacion/accesorios-de-alimentacion/1",   "alimentacion", "alim-vajilla"),
    (f"{BASE_URL}/alimentacion/baberos/1",                      "alimentacion", "alim-baberos"),
    (f"{BASE_URL}/alimentacion/luncheras/1",                    "alimentacion", "alim-luncheras"),
    # Baño
    (f"{BASE_URL}/bano/catres-de-bano-baneras/1",   "bano", "bano-baneras"),
    (f"{BASE_URL}/bano/pelelas-y-accesorios/1",     "bano", "bano-pelelas"),
    (f"{BASE_URL}/bano/juguetes-de-bano/1",         "bano", "bano-higiene"),
    (f"{BASE_URL}/bano/toallas/1",                  "bano", "bano-toallas"),
    # Descanso
    (f"{BASE_URL}/dormitorio/colechos-minicunas/1",         "descanso", "descanso-colecho"),
    (f"{BASE_URL}/dormitorio/practicunas-corrales/1",        "descanso", "descanso-practicunas"),
    (f"{BASE_URL}/dormitorio/accesorios-para-dormir/1",      "descanso", "descanso-ropa-almoha"),
    (f"{BASE_URL}/dormitorio/ropa-de-cama/1",                "descanso", "descanso-ropa-sabanas"),
    (f"{BASE_URL}/dormitorio/swaddles-muselinas/1",          "textiles", "textiles-muselinas"),
    (f"{BASE_URL}/dormitorio/sobres-de-dormir-pijamas/1",    "textiles", "textiles-ropa"),
    # Seguridad
    (f"{BASE_URL}/dormitorio/baby-calls-seguridad/1",        "seguridad", "seguridad-babycall"),
    (f"{BASE_URL}/accesorios/accesorios-de-seguridad/1",     "seguridad", "seguridad-portones"),
    # Bolsos y accesorios
    (f"{BASE_URL}/dormitorio/cambiadores-y-contenedores/1",  "bolsos", "bolsos-cambiadores"),
    (f"{BASE_URL}/dormitorio/organizacion/1",                "bolsos", "bolsos-cambiadores"),
    (f"{BASE_URL}/accesorios/bolsos-mochilas-maternales/1",  "bolsos", "bolsos-maternal"),
    (f"{BASE_URL}/accesorios/mochilas/1",                    "bolsos", "bolsos-infantil"),
    (f"{BASE_URL}/accesorios/paseo/1",                       "bolsos", "bolsos-parasoles"),
    # Textiles
    (f"{BASE_URL}/accesorios/ropa/1",   "textiles", "textiles-ropa"),
    # Juguetes
    (f"{BASE_URL}/juguetes/madera/1",                       "juguetes", "juguetes-didacticos"),
    (f"{BASE_URL}/juguetes/didacticos/1",                   "juguetes", "juguetes-didacticos"),
    (f"{BASE_URL}/juguetes/juguetes-varios/1",              "juguetes", "juguetes-didacticos"),
    (f"{BASE_URL}/juguetes/casitas-cocinas/1",              "juguetes", "juguetes-casitas"),
    (f"{BASE_URL}/juguetes/puzzles/1",                      "juguetes", "juguetes-puzzles"),
    (f"{BASE_URL}/juguetes/imanes/1",                       "juguetes", "juguetes-puzzles"),
    (f"{BASE_URL}/juguetes/masas-manualidades-arte/1",      "juguetes", "juguetes-puzzles"),
    (f"{BASE_URL}/juguetes/mordillos-sonajeros/1",          "estimulacion", "estim-mordillos"),
    (f"{BASE_URL}/juguetes/bouncers-columpios/1",           "estimulacion", "estim-columpios"),
    (f"{BASE_URL}/juguetes/gimnasios-alfombras/1",          "estimulacion", "estim-gimnasios"),
    (f"{BASE_URL}/juguetes/andadores-caminadores-jumper/1", "estimulacion", "estim-andadores"),
    # Sobre ruedas
    (f"{BASE_URL}/juguetes/triciclos/1",                "ruedas", "ruedas-triciclos"),
    (f"{BASE_URL}/juguetes/bicicletas-monopatines/1",   "ruedas", "ruedas-bicis"),
    (f"{BASE_URL}/juguetes/buggies/1",                  "ruedas", "ruedas-buggies"),
    (f"{BASE_URL}/juguetes/electricos-e-cars/1",        "ruedas", "ruedas-electricos"),
]


def parse_price(text: str) -> tuple[int | None, str]:
    text = text.strip().replace("\xa0", " ")
    if "," in text:
        text = text.split(",")[0]
    digits = re.sub(r"[^0-9]", "", text)
    return (int(digits) if digits else None), text.strip()


async def scrape_page(page, url: str, category: str, subcategory: str) -> list[dict]:
    products = []
    print(f"Fetching {url}...")
    await page.goto(url, wait_until="load", timeout=60000)
    await page.wait_for_timeout(2000)

    cards = await page.query_selector_all("a.productViewContainer")
    print(f"  Found {len(cards)} cards")

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
