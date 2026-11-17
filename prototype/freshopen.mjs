// Throwaway: a browser that already has the old "seen" flag opens the page fresh. It must start at the top with the opening.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:5173/not-to-do/';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('ntd-intro-seen', '1'); } catch (e) {} });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  const ys = [];
  for (let i = 0; i < 20; i++) { ys.push(await p.evaluate(() => Math.round(scrollY))); await p.waitForTimeout(100); }
  const st = await p.evaluate(() => ({ opening: document.documentElement.classList.contains('is-opening'), label: getComputedStyle(document.getElementById('intro-hint')).opacity }));
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `design/screenshots/fresh-open-${w}x${h}.png` });
  // Second new tab in same browser (a "return visit")
  const p2 = await ctx.newPage(); await p2.goto(URL); await p2.waitForTimeout(1500);
  const again = await p2.evaluate(() => Math.round(scrollY));
  console.log(`${w}x${h} fresh open scrollY:`, [...new Set(ys)].join(','), JSON.stringify(st), 'second visit scrollY:', again, 'errors:', errs);
  await ctx.close();
}
await b.close();
