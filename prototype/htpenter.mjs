// Throwaway: How to play entrance frame by frame (desktop).
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(URL + '#hero');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
await p.waitForTimeout(8500);
const top = await p.evaluate(() => document.getElementById('how-to-play').getBoundingClientRect().top + scrollY);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - 900); await p.waitForTimeout(1500);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top); 
let t0 = Date.now();
for (const ms of [120, 400, 700, 1000, 1400, 2200]) {
  const wait = ms - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `design/screenshots/htp-enter-${ms}ms-${TAG}.png` });
}
console.log('heading reads:', await p.evaluate(() => document.querySelector('.htp__title').textContent));
await b.close();
