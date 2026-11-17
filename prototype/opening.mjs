// Throwaway: screenshots of the opening at fixed moments; checks it ends in the normal first view
import { chromium } from 'playwright';
const GPU = ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'];
for (const [tag, o, gpu] of [['1440x900', { viewport: { width: 1440, height: 900 } }, true], ['390x844', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true]]) {
  const b = await chromium.launch({ args: gpu ? GPU : [] }); const ctx = await b.newContext(o); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:5173/', { waitUntil: 'commit' });
  const t0 = Date.now(); const at = async (ms) => { const d = ms - (Date.now() - t0); if (d > 0) await p.waitForTimeout(d); };
  let start = null;
  await p.waitForFunction(() => document.readyState !== 'loading');
  await p.screenshot({ path: `design/screenshots/opening-${tag}-0-first-paint.png` });
  // wait for the fly-out to start, then capture through it
  for (let i = 0; i < 60; i++) { const v = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--opening-veil')); if (v !== '') { start = Date.now() - t0; break; } await p.waitForTimeout(50); }
  const s0 = Date.now();
  for (const [ms, n] of [[150, 1], [600, 2], [1200, 3]]) { const d = ms - (Date.now() - s0); if (d > 0) await p.waitForTimeout(d); await p.screenshot({ path: `design/screenshots/opening-${tag}-${n}-${ms}ms.png` }); }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `design/screenshots/opening-${tag}-4-done.png` });
  const end = await p.evaluate(() => ({ opening: document.documentElement.classList.contains('is-opening'), sceneLoaded: document.getElementById('scene').classList.contains('is-loaded'), label: getComputedStyle(document.getElementById('intro-hint')).opacity }));
  console.log(tag, 'fly-out started after', start, 'ms', JSON.stringify(end), errs);
  // return visit: no opening
  const p2 = await ctx.newPage(); await p2.goto('http://127.0.0.1:5173/'); await p2.evaluate(() => scrollTo(0, 0));
  await ctx.close(); await b.close();
}
