// Throwaway: scroll to the hero, reload, and check the page starts at the top with the opening
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(3500);
await p.mouse.move(700, 450);
for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(80); if (await p.evaluate(() => scrollY >= document.getElementById('hero').offsetTop)) break; }
await p.waitForTimeout(3000);
console.log('before reload:', await p.evaluate(() => [Math.round(scrollY), localStorage.getItem('ntd-intro-seen')]));
for (const where of ['hero', 'mid-intro']) {
  if (where === 'mid-intro') { await p.evaluate(() => scrollTo({ top: 2000, behavior: 'instant' })); await p.waitForTimeout(1500); }
  await p.reload({ waitUntil: 'domcontentloaded' });
  const ys = [];
  for (let i = 0; i < 25; i++) { ys.push(await p.evaluate(() => Math.round(scrollY))); await p.waitForTimeout(80); }
  const st = await p.evaluate(() => ({ opening: document.documentElement.classList.contains('is-opening'), seenClass: document.documentElement.classList.contains('intro-seen'), line: document.querySelector('.intro__part.is-in')?.textContent || '-' }));
  console.log('reload at', where, '-> scrollY over first 2 s:', [...new Set(ys)].join(','), JSON.stringify(st));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `design/screenshots/opening-1440x900-reload-${where}.png` });
}
// A new visit (new page in the same browser) still starts at the hero
const p2 = await ctx.newPage(); await p2.goto('http://127.0.0.1:5173/'); await p2.waitForTimeout(1200);
console.log('new visit:', await p2.evaluate(() => [Math.round(scrollY), document.getElementById('hero').offsetTop, document.documentElement.classList.contains('is-opening')]), errs);
await b.close();
