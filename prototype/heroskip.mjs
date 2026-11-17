// Throwaway: Skip intro (keyboard) -> hero entrance starts almost at once
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:5173/not-to-do/'); await p.waitForTimeout(4500);
await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
const t = Date.now(); let first = null;
for (let i = 0; i < 60; i++) { const o = await p.evaluate(() => +getComputedStyle(document.querySelector('.hero__word > span')).opacity); if (o > 0.05 && !first) first = Date.now() - t; await p.waitForTimeout(50); }
console.log('first word visible after', first, 'ms; done:', await p.evaluate(() => document.getElementById('hero-content').className), errs);
const r = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
await r.goto('http://localhost:5173/not-to-do/#hero'); await r.waitForTimeout(1000);
console.log('reduced motion opacities:', await r.evaluate(() => [...document.querySelectorAll('.hero__word > span, #hero-content .button')].map((e) => getComputedStyle(e).opacity).join(',')));
await b.close();
