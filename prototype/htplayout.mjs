// Throwaway: How to play composition per level and width (head position must not move).
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of (process.argv[4] ? JSON.parse(process.argv[4]) : [[1440, 900], [1280, 800], [768, 1024]])) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL + '#hero');
  await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
  const top = await p.evaluate(() => document.getElementById('how-to-play').getBoundingClientRect().top + scrollY);
  for (let i = 0; i < 3; i++) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top + h * (i + 0.6)); await p.waitForTimeout(2600);
    await p.screenshot({ path: `design/screenshots/htp-${w}x${h}-layout-level${i + 1}-${TAG}.png` });
    console.log(w, `L${i + 1}`, JSON.stringify(await p.evaluate(() => {
      const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
      const lv = [...document.querySelectorAll('.htp__level')]; const levelsH = Math.round(lv[2].getBoundingClientRect().bottom - lv[0].getBoundingClientRect().top);
      return { head: r('.htp__head'), levels: r('.htp__levels'), levelsContent: levelsH, card: r('.htp-card--live'), nav: r('.nav__pill') };
    })));
  }
  await p.close();
}
await b.close();
