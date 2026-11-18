// Throwaway: cloud wipe and Problem screenshots at given progress points.
// Usage: node prototype/wipe.mjs <url> <tag> [sizes]
import { chromium } from 'playwright';
const [URL, TAG = 'dev', SIZES = '1440x900,390x844'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const size of SIZES.split(',')) {
  const [w, h] = size.split('x').map(Number);
  const phone = w < 768;
  const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true, hasTouch: true } : {}) })).newPage();
  p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  p.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('console', m.type(), m.text()); });
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => console.log('scene not loaded'));
  await p.waitForTimeout(8500);
  const info = await p.evaluate(() => ({ act: document.getElementById('act').offsetTop, vh: innerHeight, docH: document.documentElement.scrollHeight }));
  const hold = 0, wipeLen = info.vh * 2.2, revealLen = info.vh * 1.4;
  const go = async (y, name) => {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await p.waitForTimeout(3200);
    await p.screenshot({ path: `design/screenshots/wipe-${size}-${name}-${TAG}.png` });
    return p.evaluate(() => ({ y: Math.round(scrollY), heroInert: document.getElementById('hero').inert, problemInert: document.getElementById('problem').inert, uncovered: document.getElementById('problem').classList.contains('is-uncovered'), navShown: document.getElementById('nav').classList.contains('is-shown'), heroOpacity: getComputedStyle(document.getElementById('hero')).opacity }));
  };
  console.log(size, 'hold-mid', JSON.stringify(await go(info.act + hold / 2, 'hold-mid')));
  for (const pc of [0, 15, 30, 50, 75, 100]) console.log(size, pc, JSON.stringify(await go(info.act + hold + wipeLen * pc / 100, `p${pc}`)));
  console.log(size, 'reveal50', JSON.stringify(await go(info.act + hold + wipeLen + revealLen * 0.5, 'problem-reveal-half')));
  console.log(size, 'reveal100', JSON.stringify(await go(info.act + hold + wipeLen + revealLen, 'problem-revealed')));
  console.log(size, 'back', JSON.stringify(await go(info.act, 'back-to-hero')));
  console.log(size, info);
}
await b.close();
