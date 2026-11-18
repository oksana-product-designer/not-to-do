// Throwaway: after reaching the hero from the intro, swipe every 0.7 s and count swipes until the wipe starts.
import { chromium } from 'playwright';
const [URL, FAST] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000); await p.mouse.move(700, 450);
if (FAST) { for (let i = 0; i < 50; i++) { await p.mouse.wheel(0, 140); await p.waitForTimeout(25); } }
else { for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); } await p.waitForTimeout(4000); }
const act = await p.evaluate(() => document.getElementById('act').offsetTop);
const t0 = Date.now();
for (let n = 1; n <= 15; n++) {
  for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, Math.round(200 * Math.pow(0.85, i))); await p.waitForTimeout(16); }
  await p.waitForTimeout(700);
  const y = await p.evaluate(() => Math.round(scrollY));
  if (y > act + 2) { console.log(FAST ? 'fast through intro:' : 'reading pace:', `wipe started on swipe ${n}, ${((Date.now() - t0) / 1000).toFixed(1)} s after reaching the hero`); break; }
}
await b.close();
