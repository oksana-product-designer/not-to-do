// Throwaway: reduced-motion veil between hero and Problem.
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [size, opts] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const r = await (await b.newContext({ ...opts, reducedMotion: 'reduce' })).newPage();
  await r.goto(URL); await r.waitForTimeout(1500);
  const top = await r.evaluate(() => document.getElementById('problem').getBoundingClientRect().top + scrollY);
  const h = opts.viewport.height;
  await r.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - h * 0.6); await r.waitForTimeout(500);
  await r.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - h * 0.4); await r.waitForTimeout(180);
  const mid = await r.evaluate(() => getComputedStyle(document.querySelector('.act__veil')).opacity);
  await r.screenshot({ path: `design/screenshots/wipe-${size}-reduced-veil-${TAG}.png` });
  await r.waitForTimeout(500);
  const after = await r.evaluate(() => getComputedStyle(document.querySelector('.act__veil')).opacity);
  await r.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top); await r.waitForTimeout(500);
  await r.screenshot({ path: `design/screenshots/wipe-${size}-reduced-problem-${TAG}.png` });
  console.log(size, 'veil mid', mid, 'after', after);
  await r.close();
}
await b.close();
