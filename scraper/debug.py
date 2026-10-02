import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://www.mvdkids.com/descanso/practicunas", wait_until="networkidle", timeout=30000)

        # Find product cards
        cards = await page.query_selector_all('a[href*="/catalogo/"]')
        print(f"Links with /catalogo/: {len(cards)}")

        if cards:
            # Show parent of first card
            parent = await cards[0].evaluate_handle("el => el.parentElement")
            html = await parent.evaluate("el => el.outerHTML")
            print("\n--- Parent of first card ---")
            print(html[:3000])

        await browser.close()

asyncio.run(debug())
