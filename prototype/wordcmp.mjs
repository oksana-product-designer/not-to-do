import { chromium } from 'playwright';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => { const w = document.querySelector('.hero__word'); const c = getComputedStyle(w); const i = getComputedStyle(w.firstElementChild); return [c.display, c.overflow, c.verticalAlign, c.padding, c.margin, i.display, i.transformOrigin].join(' | '); }));
}
await b.close();
