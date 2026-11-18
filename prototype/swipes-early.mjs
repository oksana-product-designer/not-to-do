// Throwaway: trackpad-like swipes (burst + momentum tail, then a pause). Counts swipes until the wipe starts.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2]); await p.waitForTimeout(4000); await p.mouse.move(700, 450);
const act = await p.evaluate(() => document.getElementById('act').offsetTop);
const swipe = async () => { // a swipe: strong start, decaying momentum (~1 s), then the hand lifts
  for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, Math.round(160 * Math.pow(0.86, i))); await p.waitForTimeout(16); }
  await p.waitForTimeout(700);
};
// through the intro at a reading pace
for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); }
await p.waitForTimeout(600);
for (let n = 1; n <= 4; n++) {
  await swipe();
  const s = await p.evaluate(() => ({ y: Math.round(scrollY), heroOpacity: getComputedStyle(document.getElementById('hero')).opacity }));
  console.log(`swipe ${n}: scrollY ${s.y} (hero top ${act})`, s.y <= act + 2 ? 'on the hero' : 'wipe started', 'hero opacity', s.heroOpacity);
}
await b.close();
