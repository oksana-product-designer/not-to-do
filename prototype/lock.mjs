// Throwaway: flings the wheel through the intro and records which lines show
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const vis = () => [...document.querySelectorAll('.intro__part')].filter((e) => +getComputedStyle(e).opacity > 0.5).map((e) => e.textContent).join('|') || '-';
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = []; p.on('pageerror', (e) => logs.push(e.message));
  await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(1500);
  await p.mouse.move(700, 450);
  const seen = []; const t0 = Date.now(); let heroAt = null;
  for (let i = 0; i < 140 && heroAt === null; i++) {
    await p.mouse.wheel(0, 1500); await p.waitForTimeout(80);
    const s = await p.evaluate((f) => ({ v: eval('(' + f + ')()'), y: Math.round(scrollY), hero: document.getElementById('hero').offsetTop }), vis.toString());
    if (seen.at(-1)?.v !== s.v) seen.push({ v: s.v, y: s.y, t: Date.now() - t0 });
    if (s.y >= s.hero) heroAt = Date.now() - t0;
  }
  console.log('wheel fling 1440:', JSON.stringify(seen), 'hero reached after ms:', heroAt);
  // Keyboard: End key from the top
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(500);
  await p.keyboard.press('End'); await p.waitForTimeout(700);
  console.log('End key:', await p.evaluate(vis), await p.evaluate(() => Math.round(scrollY)));
  await p.waitForTimeout(1200);
  // Scroll back up is free
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(400);
  console.log('back at top:', await p.evaluate(vis), 'label hidden:', await p.evaluate(() => document.getElementById('intro-hint').classList.contains('is-hidden')));
  // Skip intro gets through
  await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
  console.log('skip intro:', await p.evaluate(() => [Math.round(scrollY), document.getElementById('hero').offsetTop, document.documentElement.classList.contains('is-scroll-locked')]), logs);
  await p.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/'); await p.waitForTimeout(1500);
  const hero = await p.evaluate(() => document.getElementById('hero').offsetTop);
  const seen = []; const t0 = Date.now(); let heroAt = null;
  for (let i = 0; i < 140 && heroAt === null; i++) {
    await p.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' })); await p.waitForTimeout(80);
    const v = await p.evaluate(vis); const y = await p.evaluate(() => Math.round(scrollY));
    if (seen.at(-1)?.v !== v) seen.push({ v, y, t: Date.now() - t0 });
    if (y >= hero) heroAt = Date.now() - t0;
  }
  console.log('scripted fling 390:', JSON.stringify(seen), 'hero reached after ms:', heroAt);
  await ctx.close();
}
await b.close();
