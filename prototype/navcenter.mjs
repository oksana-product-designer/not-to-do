import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto('http://localhost:5173/not-to-do/#hero'); await p.waitForTimeout(6000);
  console.log(w, await p.evaluate(() => { const c = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return Math.round((r.left + r.right) / 2); }; const pill = c('.nav__pill'); return { pillCenter: pill, linksCenter: getComputedStyle(document.querySelector('.nav__links')).display === 'none' ? 'hidden (phone)' : c('.nav__links'), wordmarkLeft: Math.round(document.querySelector('.nav__wordmark').getBoundingClientRect().left - document.querySelector('.nav__pill').getBoundingClientRect().left) }; }));
}
await b.close();
