// Throwaway: How to play screenshots. Usage: node prototype/htp.mjs <url> <tag> [sizes]
import { chromium } from 'playwright';
const [URL, TAG = 'dev', SIZES = '1440x900,390x844'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const size of SIZES.split(',')) {
  const [w, h] = size.split('x').map(Number);
  const phone = w < 768;
  const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true, hasTouch: true } : {}) })).newPage();
  p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.text()); });
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => console.log('no scene'));
  await p.waitForTimeout(8500);
  const top = await p.evaluate(() => document.getElementById('how-to-play').getBoundingClientRect().top + scrollY);
  const go = async (y, name, wait = 2600) => {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(wait);
    await p.screenshot({ path: `design/screenshots/htp-${size}-${name}-${TAG}.png` });
    return p.evaluate(() => ({ active: [...document.querySelectorAll('.htp__level')].findIndex((l) => l.classList.contains('is-active')), title: document.querySelector('.htp-card--live .htp-card__title-text')?.textContent, est: document.querySelector('.htp-card--live .htp-card__estimate')?.textContent, tracked: document.querySelector('.htp-card--live .htp-card__tracked')?.textContent, navCurrent: document.querySelector('.nav__links [aria-current]')?.textContent || null }));
  };
  if (phone) {
    await go(top - h * 0.3, 'start');
    for (let i = 1; i <= 3; i++) await go(top + i * h * 0.8, `stack-${i}`, 1500);
  } else {
    console.log(size, 'start', JSON.stringify(await go(top, 'start')));
    for (let i = 0; i < 3; i++) {
      console.log(size, `L${i + 1} mid`, JSON.stringify(await go(top + h * 3 * (i + 0.5) / 3, `level${i + 1}-mid`)));
      console.log(size, `L${i + 1} end`, JSON.stringify(await go(top + h * 3 * (i + 0.97) / 3, `level${i + 1}-end`)));
    }
  }
}
await b.close();
