// Throwaway: How to play pinned on a phone, each step mid-way.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(process.argv[2] + '#hero'); await p.waitForTimeout(8500);
const top = await p.evaluate(() => document.getElementById('how-to-play').getBoundingClientRect().top + scrollY);
for (const [name, y, wait] of [['step1', top + 844 * 0.6, 2600], ['step2', top + 844 * 1.5, 2600], ['step3', top + 844 * 2.6, 2600]]) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(wait);
  await p.screenshot({ path: `design/screenshots/htp-390x844-pinned-${name}.png` });
  console.log(name, JSON.stringify(await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; }; return { pinned: document.getElementById('how-to-play').classList.contains('is-pinned'), head: r('.htp__head'), card: r('.htp-card--live'), levels: r('.htp__levels'), active: [...document.querySelectorAll('.htp__level')].findIndex((l) => l.classList.contains('is-active')) }; })));
}
await b.close();
