import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const vis = () => [...document.querySelectorAll('.intro__part')].filter((e) => +getComputedStyle(e).opacity > 0.5).map((e) => e.textContent).join('|') || '-';
for (const [tag, o] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const ctx = await b.newContext(o); const p = await ctx.newPage();
  const logs = []; p.on('pageerror', (e) => logs.push(e.message));
  await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `design/screenshots/intro-${tag}-1-scroll-label.png` });
  const r = { atLoad: await p.evaluate(vis), labelHidden: await p.evaluate(() => document.getElementById('intro-hint').classList.contains('is-hidden')) };
  // Fling: jump straight to 90% of the pinned intro, then watch what shows
  const pinned = await p.evaluate(() => document.getElementById('intro').offsetHeight - innerHeight);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), pinned * 0.9);
  const seen = [];
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(400); const v = await p.evaluate(vis); if (seen.at(-1) !== v) seen.push(v); }
  r.flingSequence = seen;
  r.labelHiddenAfterScroll = await p.evaluate(() => document.getElementById('intro-hint').classList.contains('is-hidden'));
  // Back to the top: text goes, label returns
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(700);
  r.backAtTop = { parts: await p.evaluate(vis), labelHidden: await p.evaluate(() => document.getElementById('intro-hint').classList.contains('is-hidden')) };
  // Click the label
  await p.click('#intro-hint'); await p.waitForTimeout(2200);
  r.afterLabelClick = { scrollY: await p.evaluate(() => Math.round(scrollY)), parts: await p.evaluate(vis) };
  await p.screenshot({ path: `design/screenshots/intro-${tag}-2-part-1.png` });
  r.logs = logs; console.log(tag, JSON.stringify(r));
  await ctx.close();
}
await b.close();
