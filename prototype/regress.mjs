// Throwaway: the same intro moments on two builds, to compare before/after.
// Usage: node prototype/regress.mjs <url> <tag>
import { chromium } from 'playwright';
const [URL, TAG] = [process.argv[2], process.argv[3]];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [size, opts] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const p = await (await b.newContext(opts)).newPage();
  await p.goto(URL); await p.waitForTimeout(4500);
  await p.screenshot({ path: `design/screenshots/regress-${size}-label-${TAG}.png` });
  await p.click('#intro-hint'); await p.waitForTimeout(2200);
  await p.screenshot({ path: `design/screenshots/regress-${size}-first-line-${TAG}.png` });
  // keep scrolling at a steady pace until the move to the hero starts, then 1.6 s in (half of the 3.2 s reveal)
  let t = null;
  for (let i = 0; i < 600 && !t; i++) {
    await p.evaluate(() => window.scrollBy(0, 40)); await p.waitForTimeout(30);
    if (await p.evaluate(() => document.documentElement.classList.contains('is-intro-leaving') || document.documentElement.classList.contains('is-past-intro'))) t = Date.now();
  }
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `design/screenshots/regress-${size}-transition-mid-${TAG}.png` });
  console.log(size, TAG, 'done');
}
await b.close();
