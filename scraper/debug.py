import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://babycity.com.uy/dormitorio/practicunas-corrales/1", wait_until="load", timeout=60000)
        await page.wait_for_timeout(2000)

        title = await page.title()
        print(f"Title: {title}")

        for sel in ['a[href*="/p/"]', '[class*="product"]', 'article', '.item', 'li']:
            els = await page.query_selector_all(sel)
            if els:
                print(f"'{sel}': {len(els)}")

        el = await page.query_selector('a[href*="/p/"]')
        if el:
            parent = await el.evaluate_handle("el => el.parentElement")
            html = await parent.evaluate("el => el.outerHTML")
            print("\n--- Parent of first /p/ link ---")
            print(html[:3000])

        await browser.close()

asyncio.run(debug())
