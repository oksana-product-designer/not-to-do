// Throwaway: scroll through; page must end at the hero; header must arrive first, text right after.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:5173/not-to-do/';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(4500); await p.mouse.move(w / 2, h / 2);
  let t0 = null, navAt = null, wordAt = null, cueAt = null;
  for (let i = 0; i < 700; i++) {
    await p.mouse.wheel(0, 150); await p.waitForTimeout(40);
    const s = await p.evaluate(() => ({ nav: +getComputedStyle(document.getElementById('nav')).opacity, word: +getComputedStyle(document.querySelector('.hero__word > span')).opacity, cue: +getComputedStyle(document.querySelector('.hero__cue')).opacity, go: !!document.querySelector('.hero.is-hero-in') }));
    if (s.go && !t0) t0 = Date.now();
    if (t0) { const dt = Date.now() - t0; if (!navAt && s.nav > 0.5) navAt = dt; if (!wordAt && s.word > 0.5) wordAt = dt; if (!cueAt && s.cue > 0.5) cueAt = dt; }
    if (cueAt) break;
  }
  await p.waitForTimeout(1500);
  const end = await p.evaluate(() => ({ y: Math.round(scrollY), maxScroll: document.documentElement.scrollHeight - innerHeight, heroTop: document.getElementById('hero').offsetTop }));
  await p.screenshot({ path: `design/screenshots/hero-final-${w}x${h}-end-of-page.png` });
  console.log(`${w}x${h} after entrance starts: header >50% at ${navAt}ms, first word at ${wordAt}ms, cue at ${cueAt}ms;`, JSON.stringify(end), errs);
}
await b.close();
