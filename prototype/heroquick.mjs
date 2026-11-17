// Throwaway: jump to the hero via #hero (entrance plays at once) and screenshot after it lands.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:5173/not-to-do/';
const sizes = (process.env.SIZES || '1440x900,390x844,768x1024').split(',').map((s) => s.split('x').map(Number));
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of sizes) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto(URL + '#hero'); await p.waitForTimeout(9000);
  await p.screenshot({ path: `design/screenshots/hero-final-${w}x${h}-quick.png` });
  console.log(w, h, await p.evaluate(() => { const b = document.querySelector('.hero__cue').getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), scrollY, document.getElementById('hero').offsetTop]; }));
}
await b.close();
