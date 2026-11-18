// Throwaway: boxes for How to play text at the middle of step 2, plus a phone shot.
import { chromium } from 'playwright';
const URL = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h, phone] of [[1440, 900, false], [390, 844, true]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true, hasTouch: true } : {}) })).newPage();
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
  const top = await p.evaluate(() => document.getElementById('how-to-play').getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), phone ? top : top + h * 1.5); await p.waitForTimeout(2600);
  await p.screenshot({ path: `/tmp/claude-501/htpc-${w}.png` });
  const boxes = await p.evaluate(() => {
    const out = []; const box = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(','); };
    document.querySelectorAll('.htp__level').forEach((l, i) => {
      const act = l.classList.contains('is-active') || !document.getElementById('how-to-play').classList.contains('is-pinned');
      ['label', 'title'].forEach((k) => { const el = l.querySelector(`.htp__level-${k}`); const r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) out.push(`${act ? 'A' : 'I'}-L${i + 1}-${k} ${box(el)}`); });
    });
    const sub = document.querySelector('.htp__sub'); out.push(`A-sub ${box(sub)}`); return out;
  });
  console.log(w, boxes.join(' | '));
}
await b.close();
