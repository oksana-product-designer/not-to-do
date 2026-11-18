// Throwaway: Problem to How to play hand-over, frame by frame.
import { chromium } from 'playwright';
const [URL, TAG = 'dev', SIZES = '1440x900,390x844'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const size of SIZES.split(',')) {
  const [w, h] = size.split('x').map(Number); const phone = w < 768;
  const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true, hasTouch: true } : {}) })).newPage();
  p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
  const { act, htp } = await p.evaluate(() => ({ act: document.getElementById('act').offsetTop, htp: document.getElementById('how-to-play').getBoundingClientRect().top + scrollY }));
  const readStart = act + h * 2.6; // end of wipe
  const frames = [['1-read', readStart + h * 0.25, 3600], ['2-exit-half', readStart + h * 0.95, 3000], ['3-exit-done', readStart + h * 1.4, 3000], ['4-rising', htp - h * 0.5, 600], ['5-entering', htp - h * 0.2, 450], ['6-settled', htp, 2200]];
  for (const [name, y, wait] of frames) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(wait);
    await p.screenshot({ path: `design/screenshots/handover-${size}-${name}-${TAG}.png` });
    console.log(size, name, JSON.stringify(await p.evaluate(() => ({ fade: getComputedStyle(document.getElementById('problem')).getPropertyValue('--problem-fade'), htp: document.getElementById('how-to-play').className }))));
  }
  await p.close();
}
await b.close();
