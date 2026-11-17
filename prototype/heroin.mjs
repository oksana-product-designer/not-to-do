// Throwaway: film the hero entrance. Path A: scroll through the intro at a normal pace. Path B: Skip intro link.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:5173/not-to-do/';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL); await p.waitForTimeout(4500);
  await p.mouse.move(w / 2, h / 2);
  const t0 = Date.now(); let tIn = null; const log = [];
  for (let i = 0; i < 400; i++) {
    if (!tIn) { await p.mouse.wheel(0, 120); }
    await p.waitForTimeout(60);
    const s = await p.evaluate(() => {
      const c = document.getElementById('hero-content');
      const spans = [...c.querySelectorAll('.hero__word > span')];
      const btn = c.querySelector('.button');
      return { cls: c.className, w0: +getComputedStyle(spans[0]).opacity, wl: +getComputedStyle(spans.at(-1)).opacity, b: +getComputedStyle(btn).opacity, y: Math.round(scrollY), heroTop: document.getElementById('hero').offsetTop, ling: document.documentElement.classList.contains('is-intro-lingering') };
    });
    if (!tIn && s.cls.includes('is-hero-in')) tIn = Date.now();
    if (tIn) {
      const dt = Date.now() - tIn;
      log.push(`${dt}ms w1=${s.w0.toFixed(2)} w5=${s.wl.toFixed(2)} btn=${s.b.toFixed(2)}`);
      for (const mark of [2100, 2300, 2900]) if (dt >= mark && !log[`m${mark}`]) { log[`m${mark}`] = 1; await p.screenshot({ path: `design/screenshots/hero-in-${w}x${h}-${mark}ms.png` }); }
      if (s.cls.includes('is-hero-done') && dt > 1700) { await p.screenshot({ path: `design/screenshots/hero-in-${w}x${h}-done.png` }); break; }
    }
  }
  console.log(`${w}x${h}: entrance began ${((tIn - t0) / 1000).toFixed(1)}s after first scroll`);
  console.log(log.filter((_, i) => i % 4 === 0).join('\n'));
  // hover still works after done
  if (w === 1440) {
    const btn = p.locator('#hero-content .button'); await btn.hover(); await p.waitForTimeout(300);
    console.log('hover transform:', await btn.evaluate((e) => getComputedStyle(e).transform));
    // a11y name of h1
    console.log('h1 name:', await p.evaluate(() => document.querySelector('.hero__title').getAttribute('aria-label')));
    // replay after going back up
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(800);
    console.log('after scrolling back to top, class:', await p.evaluate(() => document.getElementById('hero-content').className));
  }
  console.log('errors:', errs);
}
await b.close();
