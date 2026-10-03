import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://arlequin.uy/categoria-producto/cunas/", wait_until="networkidle", timeout=30000)

        title = await page.title()
        print(f"Title: {title}")

        for sel in ['li.product', 'article', '.product-item', 'ul.products li']:
            els = await page.query_selector_all(sel)
            if els:
                print(f"'{sel}': {len(els)}")

        el = await page.query_selector("li.product") or await page.query_selector("article")
        if el:
            html = await el.evaluate("el => el.outerHTML")
            print("\n--- First product card ---")
            print(html[:3000])

        await browser.close()

asyncio.run(debug())
