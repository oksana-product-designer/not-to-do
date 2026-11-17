// Throwaway: scroll through the intro, wait for the hero entrance to finish, screenshot. Also mid-entrance (2.3 s into the move).
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:5173/not-to-do/';
const TAG = process.env.TAG || '';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL); await p.waitForTimeout(4500);
  await p.mouse.move(w / 2, h / 2);
  let tLeave = null, shotMid = false;
  for (let i = 0; i < 500; i++) {
    const atHero = await p.evaluate(() => scrollY >= document.getElementById('hero').offsetTop - 4);
    if (!tLeave && !atHero) await p.mouse.wheel(0, 120);
    await p.waitForTimeout(50);
    const s = await p.evaluate(() => ({ leaving: document.documentElement.classList.contains('is-intro-leaving') || !!document.querySelector('.hero.is-hero-in'), done: !!document.querySelector('.hero.is-hero-done') }));
    if (!tLeave && s.leaving) tLeave = Date.now();
    if (tLeave && !shotMid && Date.now() - tLeave >= 2300) { shotMid = true; await p.screenshot({ path: `design/screenshots/hero-final-${w}x${h}-mid-entrance${TAG}.png` }); }
    if (s.done && shotMid) break;
  }
  await p.evaluate(() => window.scrollTo({ top: document.getElementById('hero').offsetTop, behavior: 'instant' }));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `design/screenshots/hero-final-${w}x${h}-arrived${TAG}.png` });
  const info = await p.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.left), Math.round(b.right)]; };
    return { nav: r('.nav__pill'), h1: r('.hero__title'), sub: r('.hero__sub'), actions: r('.hero__actions'), cue: r('.hero__cue'), navShown: document.getElementById('nav').classList.contains('is-shown'), inert: document.getElementById('nav').inert };
  });
  console.log(`${w}x${h}`, JSON.stringify(info), 'errors:', errs);
}
await b.close();
