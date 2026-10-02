import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://www.carestino.com.uy/productos/cunas/", wait_until="networkidle", timeout=30000)

        # Walk up more levels
        card = await page.query_selector('a[href*="/producto/"]')
        parent = await card.evaluate_handle("""el => {
            let p = el;
            for (let i = 0; i < 6; i++) p = p.parentElement;
            return p;
        }""")
        html = await parent.evaluate("el => el.outerHTML")
        print(html[:4000])

        await browser.close()

asyncio.run(debug())
