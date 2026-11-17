import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(1000);
for (let i = 0; i < 40; i++) { await p.evaluate(() => scrollBy({ top: 160, behavior: 'instant' })); await p.waitForTimeout(90); }
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => [Math.round(scrollY), document.getElementById('hero').offsetTop, getComputedStyle(document.getElementById('hero-content')).opacity]));
await p.screenshot({ path: 'design/screenshots/intro-390x844-7-hero.png' });
await b.close();
