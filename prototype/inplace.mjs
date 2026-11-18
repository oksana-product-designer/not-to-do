// Throwaway: frames around the Problem to How to play hand-over, to see that nothing slides up from the bottom.
import { chromium } from 'playwright';
const [URL] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(URL + '#hero');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
await p.waitForTimeout(8500);
const { htp, actEnd } = await p.evaluate(() => { const a = document.getElementById('act'); return { htp: document.getElementById('how-to-play').getBoundingClientRect().top + scrollY, actEnd: a.offsetTop + a.offsetHeight }; });
console.log('htp top', htp, 'act end', actEnd, '(htp top should be act end - 900)');
const frames = [['a-exit-late', htp - 450, 3200], ['b-pinned-120ms', htp, 120], ['c-500ms', htp, 380], ['d-1200ms', htp, 700], ['e-settled', htp, 1600]];
for (const [name, y, wait] of frames) {
  if (y !== null) await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await p.waitForTimeout(wait);
  await p.screenshot({ path: `design/screenshots/inplace-${name}.png` });
  console.log(name, JSON.stringify(await p.evaluate(() => ({ htpTop: Math.round(document.getElementById('how-to-play').getBoundingClientRect().top), stageTop: Math.round(document.querySelector('.htp__stage').getBoundingClientRect().top), cls: document.getElementById('how-to-play').className.replace(/htp |is-fade-ready |is-pinned /g, '') }))));
}
await b.close();
