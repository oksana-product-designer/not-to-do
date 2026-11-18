// Throwaway: Problem word entrance, mid-way and done, plus replay after scrolling back.
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h, phone] of [[1440, 900, false], [390, 844, true]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true, hasTouch: true } : {}) })).newPage();
  p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
  const act = await p.evaluate(() => document.getElementById('act').offsetTop);
  const at = (q) => act + h * 0.6 + h * 2 * q;
  const state = () => p.evaluate(() => ({ cls: document.getElementById('problem').className, name: document.querySelector('#problem-title') && document.querySelector('#problem-title').textContent.replace(/\s+/g, ' ').trim() }));
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), at(0.8)); await p.waitForTimeout(2000);
  console.log(w, 'before trigger', JSON.stringify(await state()));
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), at(0.95)); await p.waitForTimeout(1200);
  await p.screenshot({ path: `design/screenshots/problem-${w}x${h}-words-mid-${TAG}.png` });
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `design/screenshots/problem-${w}x${h}-words-done-${TAG}.png` });
  console.log(w, 'after', JSON.stringify(await state()));
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), at(0.5)); await p.waitForTimeout(1500);
  console.log(w, 'scrolled back', JSON.stringify(await state()));
  await p.close();
}
await b.close();
