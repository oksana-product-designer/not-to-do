// Throwaway: normal-pace scroll; screenshot while lines still play past the intro, and after they finish
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
await p.mouse.move(700, 450);
let shots = 0; const log = [];
for (let i = 0; i < 80; i++) {
  await p.mouse.wheel(0, 160); await p.waitForTimeout(70);
  const s = await p.evaluate(() => ({ y: Math.round(scrollY), linger: document.documentElement.classList.contains('is-intro-lingering'), hero: document.getElementById('hero').offsetTop }));
  if (s.linger && shots === 0) { await p.screenshot({ path: 'design/screenshots/intro-1440x900-6-lingering.png' }); shots++; log.push('linger at ' + s.y); }
  if (s.y >= s.hero) break;
}
log.push('reached hero');
await p.screenshot({ path: 'design/screenshots/intro-1440x900-6b-hero-arriving.png' });
await p.waitForTimeout(2500);
await p.screenshot({ path: 'design/screenshots/intro-1440x900-7-hero.png' });
// Back up into the intro and down again
await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' })); await p.waitForTimeout(1500);
await p.screenshot({ path: 'design/screenshots/intro-1440x900-4-back-in-intro.png' });
console.log(log, errs);
await b.close();
