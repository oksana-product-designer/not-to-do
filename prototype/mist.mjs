// Throwaway: normal-pace scroll, screenshot each line while it is on screen
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [tag, o] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const ctx = await b.newContext(o); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(tag === '1440x900' ? 3000 : 1200);
  await p.screenshot({ path: `design/screenshots/intro-${tag}-1-scroll-label.png` });
  const taken = new Set();
  for (let i = 0; i < 200 && taken.size < 4; i++) {
    await p.evaluate((d) => scrollBy({ top: d, behavior: 'instant' }), o.viewport.height / 12); await p.waitForTimeout(110);
    const s = await p.evaluate(() => { const a = document.querySelector('.intro__part.is-in'); return a ? [...document.querySelectorAll('.intro__part')].indexOf(a) : -1; });
    if (s >= 0 && !taken.has(s)) { await p.waitForTimeout(700); taken.add(s); await p.screenshot({ path: `design/screenshots/intro-${tag}-mist-line-${s + 1}.png` }); }
  }
  console.log(tag, [...taken], errs);
  await ctx.close();
}
await b.close();
