import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [1088, 979], [768, 1024], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto('http://localhost:5173/not-to-do/#hero'); await p.waitForTimeout(9000);
  await p.screenshot({ path: `design/screenshots/hero-final-${w}x${h}-quick.png` });
  console.log(w, JSON.stringify(await p.evaluate(() => { const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)]; }; const words = [...document.querySelectorAll('.hero__word')]; return { pill: r('.nav__pill'), h1Frame: r('.hero__title'), font: getComputedStyle(document.querySelector('.hero__title')).fontSize, lines: new Set(words.map((e) => Math.round(e.getBoundingClientRect().top))).size }; })));
}
await b.close();
