import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from db import upsert_products

STORE = "MVD Kids"
BASE_URL = "https://www.mvdkids.com"

PAGES = [
    # Movilidad - Coches
    (f"{BASE_URL}/coches-de-bebe/travel-system-con-baby-silla", "movilidad", "movilidad-coches-ts"),
    (f"{BASE_URL}/coches-de-bebe/coches-sin-baby-silla",        "movilidad", "movilidad-coches-paseo"),
    (f"{BASE_URL}/coches-de-bebe/coches-dobles",                "movilidad", "movilidad-coches-doble"),
    # Movilidad - Sillas de auto
    (f"{BASE_URL}/sillas-de-auto/baby-sillas-y-bases",          "movilidad", "movilidad-auto-baby"),
    (f"{BASE_URL}/sillas-de-auto/butacas",                      "movilidad", "movilidad-auto-butaca"),
    (f"{BASE_URL}/sillas-de-auto/boosters-y-alzadores",         "movilidad", "movilidad-auto-booster"),
    # Movilidad - Porteo
    (f"{BASE_URL}/paseo-y-seguridad/mochilas-porta-bebe",       "movilidad", "movilidad-porteo"),
    # Descanso
    (f"{BASE_URL}/descanso/minicunas-y-colechos",               "descanso",  "descanso-colecho"),
    (f"{BASE_URL}/descanso/practicunas",                        "descanso",  "descanso-practicunas"),
    (f"{BASE_URL}/descanso/corrales",                           "descanso",  "descanso-practicunas"),
    (f"{BASE_URL}/descanso/colchones",                          "descanso",  "descanso-colchones"),
    (f"{BASE_URL}/descanso/sabanas-y-ropa-de-cama",             "descanso",  "descanso-ropa-sabanas"),
    (f"{BASE_URL}/descanso/colchonetas-y-posicionadores",       "descanso",  "descanso-ropa-almoha"),
    (f"{BASE_URL}/descanso/nidos",                              "descanso",  "descanso-ropa-almoha"),
    (f"{BASE_URL}/descanso/almohadas-y-almohadones",            "descanso",  "descanso-ropa-almoha"),
    (f"{BASE_URL}/descanso/cambiadores-dormitorio",             "bolsos",    "bolsos-cambiadores"),
    # Alimentación - Lactancia
    (f"{BASE_URL}/lactancia/extractores-de-leche",              "alimentacion", "alim-lactancia-extra"),
    (f"{BASE_URL}/lactancia/biberones-y-tetinas",               "alimentacion", "alim-lactancia-biber"),
    (f"{BASE_URL}/lactancia/chupetes",                          "alimentacion", "alim-lactancia-chupe"),
    (f"{BASE_URL}/lactancia/porta-chupetes-y-clips",            "alimentacion", "alim-lactancia-chupe"),
    (f"{BASE_URL}/lactancia/calienta-biberones",                "alimentacion", "alim-lactancia-esteri"),
    (f"{BASE_URL}/lactancia/esterilizadores",                   "alimentacion", "alim-lactancia-esteri"),
    (f"{BASE_URL}/lactancia/accesorios-lactancia",              "alimentacion", "alim-lactancia"),
    (f"{BASE_URL}/lactancia/almohadas-lactancia",               "alimentacion", "alim-lactancia"),
    (f"{BASE_URL}/lactancia/escurridores-cepillos-y-otros",     "alimentacion", "alim-lactancia"),
    # Alimentación
    (f"{BASE_URL}/alimentacion/sillas-de-comer-clasicas",       "alimentacion", "alim-sillas"),
    (f"{BASE_URL}/alimentacion/sillas-de-comer-portatiles",     "alimentacion", "alim-sillas"),
    (f"{BASE_URL}/alimentacion/platos-y-bowls",                 "alimentacion", "alim-vajilla-platos"),
    (f"{BASE_URL}/alimentacion/cubiertos",                      "alimentacion", "alim-vajilla-cubier"),
    (f"{BASE_URL}/alimentacion/vasos-termos-y-botellas",        "alimentacion", "alim-vajilla-vasos"),
    (f"{BASE_URL}/alimentacion/tuppers-recipientes-y-viandas",  "alimentacion", "alim-luncheras"),
    (f"{BASE_URL}/alimentacion/baberos-alimentacion",           "alimentacion", "alim-baberos"),
    (f"{BASE_URL}/alimentacion/luncheras-termicas",             "alimentacion", "alim-luncheras"),
    # Baño
    (f"{BASE_URL}/bano/banos-con-cambiador",                    "bano", "bano-baneras"),
    (f"{BASE_URL}/bano/banos-plegables",                        "bano", "bano-baneras"),
    (f"{BASE_URL}/bano/pelelas-y-reductores",                   "bano", "bano-pelelas"),
    (f"{BASE_URL}/bano/termometros",                            "bano", "bano-higiene"),
    (f"{BASE_URL}/bano/articulos-de-cuidado-e-higiene",         "bano", "bano-higiene"),
    (f"{BASE_URL}/bano/juegos-para-el-bano",                    "bano", "bano-higiene"),
    (f"{BASE_URL}/bano/reposeras-y-asientos-de-bano",           "bano", "bano-baneras"),
    (f"{BASE_URL}/bano/articulos-de-cosmetica",                 "bano", "bano-cosmeticos"),
    # Estimulación
    (f"{BASE_URL}/estimulacion-primera-infancia/gimnasios",                 "estimulacion", "estim-gimnasios"),
    (f"{BASE_URL}/estimulacion-primera-infancia/alfombras",                 "estimulacion", "estim-gimnasios"),
    (f"{BASE_URL}/estimulacion-primera-infancia/sillas-con-vibracion",      "estimulacion", "estim-mecedoras"),
    (f"{BASE_URL}/estimulacion-primera-infancia/mecedoras",                 "estimulacion", "estim-mecedoras"),
    (f"{BASE_URL}/estimulacion-primera-infancia/moviles-musicales",         "estimulacion", "estim-moviles"),
    (f"{BASE_URL}/estimulacion-primera-infancia/barras-entretenedoras",     "estimulacion", "estim-moviles"),
    (f"{BASE_URL}/estimulacion-primera-infancia/entretenedores",            "estimulacion", "estim-moviles"),
    (f"{BASE_URL}/estimulacion-primera-infancia/colgantes",                 "estimulacion", "estim-moviles"),
    (f"{BASE_URL}/estimulacion-primera-infancia/cuneros",                   "estimulacion", "estim-moviles"),
    (f"{BASE_URL}/estimulacion-primera-infancia/apegos",                    "estimulacion", "estim-mordillos"),
    (f"{BASE_URL}/estimulacion-primera-infancia/mordillos-y-sonajeros",     "estimulacion", "estim-mordillos"),
    # Juguetes
    (f"{BASE_URL}/juguetes",                                    "juguetes", "juguetes-0-12"),
    # Sobre ruedas (dentro de juguetes en MVD Kids)
    (f"{BASE_URL}/juguetes?tipo-de-juguete=rodados-24m",        "ruedas",   "ruedas-buggies"),
    (f"{BASE_URL}/juguetes?tipo-de-juguete=caminadores",        "estimulacion", "estim-andadores"),
    (f"{BASE_URL}/juguetes?tipo-de-juguete=buggys",             "ruedas",   "ruedas-buggies"),
    # Seguridad
    (f"{BASE_URL}/paseo-y-seguridad/portones-seguridad",        "seguridad", "seguridad-portones"),
    (f"{BASE_URL}/paseo-y-seguridad/barandas-de-cama",          "seguridad", "seguridad-portones"),
    (f"{BASE_URL}/paseo-y-seguridad/baby-call-monitores",       "seguridad", "seguridad-babycall"),
    (f"{BASE_URL}/paseo-y-seguridad/espejos-para-auto",         "seguridad", "seguridad-auto"),
    (f"{BASE_URL}/paseo-y-seguridad/trancas-y-articulos-de-seguridad", "seguridad", "seguridad-portones"),
    # Bolsos y accesorios
    (f"{BASE_URL}/bolsos-y-mochilas-maternales",                "bolsos", "bolsos-maternal"),
    (f"{BASE_URL}/paseo-y-seguridad/mochilas-infantiles",       "bolsos", "bolsos-infantil"),
    (f"{BASE_URL}/paseo-y-seguridad/cambiadores-portatiles",    "bolsos", "bolsos-cambiadores"),
    (f"{BASE_URL}/paseo-y-seguridad/parasoles",                 "bolsos", "bolsos-parasoles"),
    (f"{BASE_URL}/paseo-y-seguridad/mosquiteros",               "bolsos", "bolsos-parasoles"),
    # Textiles
    (f"{BASE_URL}/textiles/primeras-mudas",                     "textiles", "textiles-ropa"),
    (f"{BASE_URL}/textiles/mantas",                             "textiles", "textiles-muselinas"),
    (f"{BASE_URL}/textiles/toallas",                            "bano",     "bano-toallas"),
    (f"{BASE_URL}/textiles/sabanas-recibidoras",                "descanso", "descanso-ropa-sabanas"),
    (f"{BASE_URL}/textiles/muselinas",                          "textiles", "textiles-muselinas"),
    (f"{BASE_URL}/textiles/medias-y-escarpines",                "textiles", "textiles-medias"),
    (f"{BASE_URL}/textiles/mitones-y-gorros",                   "textiles", "textiles-medias"),
    (f"{BASE_URL}/textiles/baberas",                            "alimentacion", "alim-baberos"),
    (f"{BASE_URL}/textiles/babitas-y-provecheros",              "alimentacion", "alim-baberos"),
    # Vestimenta
    (f"{BASE_URL}/vestimenta/zapatos",                          "textiles", "textiles-calzado"),
    (f"{BASE_URL}/vestimenta/ropa-con-filtro",                  "textiles", "textiles-ropa"),
    (f"{BASE_URL}/vestimenta/gorros",                           "textiles", "textiles-medias"),
    (f"{BASE_URL}/vestimenta/ropa-interior",                    "textiles", "textiles-ropa"),
]


def clean_price(sim: str, monto: str) -> tuple[int | None, str]:
    full_text = f"{sim.strip()} {monto.strip()}"
    digits = re.sub(r"[^0-9]", "", monto)
    return (int(digits) if digits else None), full_text


async def scrape_page(page, url: str, category: str, subcategory: str) -> list[dict]:
    products = []
    print(f"Fetching {url}...")
    await page.goto(url, wait_until="networkidle", timeout=30000)

    cards = await page.query_selector_all("div.cnt:has(a.img)")
    print(f"  Found {len(cards)} cards")

    seen = set()
    for card in cards:
        link_el = await card.query_selector("a.img")
        href = await link_el.get_attribute("href") if link_el else ""
        if not href or href in seen:
            continue
        seen.add(href)

        name_el = await card.query_selector("a.tit h2")
        name = (await name_el.inner_text()).strip() if name_el else ""
        if not name:
            continue

        brand_el = await card.query_selector("div.marca")
        brand = (await brand_el.inner_text()).strip() if brand_el else ""

        sim_el = await card.query_selector("strong.precio.venta span.sim")
        monto_el = await card.query_selector("strong.precio.venta span.monto")
        sim = (await sim_el.inner_text()).strip() if sim_el else "$"
        monto = (await monto_el.inner_text()).strip() if monto_el else ""
        price_val, price_text = clean_price(sim, monto)

        # Bank card discount (e.g. "Scotiabank 15%")
        card_bank, card_discount_pct, card_price = None, None, None
        bank_el = await card.query_selector("div.descuentosMDP span.img")
        if bank_el:
            title = await bank_el.get_attribute("title") or ""
            m = re.match(r"(.+?)\s+(\d+)%", title)
            if m:
                card_bank = m.group(1).strip()
                card_discount_pct = int(m.group(2))
            card_monto_el = await card.query_selector("div.descuentosMDP span.precio span.monto")
            if card_monto_el:
                cm = (await card_monto_el.inner_text()).strip()
                digits = re.sub(r"[^0-9]", "", cm)
                card_price = int(digits) if digits else None

        img_el = await card.query_selector("a.img img")
        img_src = ""
        img_alt = name
        if img_el:
            img_alt = await img_el.get_attribute("alt") or name
            img_src = await img_el.get_attribute("data-src") or await img_el.get_attribute("src") or ""
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
            "currency": "UYU",
            "card_bank": card_bank,
            "card_discount_pct": card_discount_pct,
            "card_price": card_price,
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
        print(f"\nUpserted {count} products to Supabase")
        print(f"Total scraped: {len(all_products)}")
    else:
        print("No products found.")


if __name__ == "__main__":
    asyncio.run(main())
