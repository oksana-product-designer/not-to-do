// Throwaway: trackpad-like swipes (burst + decaying momentum, then a pause) from the end of the intro onward.
// Logs where each swipe ends relative to the resting points: hero, Problem, How to play.
import { chromium } from 'playwright';
const [URL, PAUSE = '1200'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(URL);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000); await p.mouse.move(700, 450);
for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); }
await p.waitForTimeout(5000);
const stops = await p.evaluate(() => { const a = document.getElementById('act'); const vh = innerHeight; return { hero: a.offsetTop, problem: a.offsetTop + vh * 2.2, htp: document.getElementById('how-to-play').getBoundingClientRect().top + scrollY }; });
console.log('resting points', JSON.stringify(stops));
const name = (y) => Object.entries(stops).find(([, v]) => Math.abs(v - y) <= 3)?.[0] || '';
for (let n = 1; n <= 9; n++) {
  for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, Math.round(220 * Math.pow(0.86, i))); await p.waitForTimeout(16); }
  await p.waitForTimeout(Number(PAUSE));
  const y = await p.evaluate(() => Math.round(scrollY));
  console.log(`swipe ${n}: ${y}`, name(y) ? `ON ${name(y).toUpperCase()}` : '');
}
await b.close();
