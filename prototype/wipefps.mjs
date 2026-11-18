// Throwaway: frame rate while scrolling through the wipe. Usage: node prototype/wipefps.mjs <url>
import { chromium } from 'playwright';
const URL = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [name, opts, throttle] of [['desktop 1440x900', { viewport: { width: 1440, height: 900 } }, 1], ['phone 390x844, CPU 4x slower', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, 4]]) {
  for (let run = 0; run < 1; run++) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    await p.goto(URL + '#hero');
    if (throttle === 1) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
    await p.waitForTimeout(8500);
    if (throttle > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
    const { act, vh } = await p.evaluate(() => ({ act: document.getElementById('act').offsetTop, vh: innerHeight }));
    await p.evaluate(() => { window.__f = []; let l = performance.now(); const t = (n) => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
    for (let i = 1; i <= 120; i++) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), act + vh * 2 * i / 120); await p.waitForTimeout(25); }
    await p.waitForTimeout(800);
    const fr = await p.evaluate(() => window.__f.slice(3));
    const avg = 1000 / (fr.reduce((a, c) => a + c, 0) / fr.length);
    console.log(name, 'run', run, 'avg fps', avg.toFixed(1), 'worst frame', Math.round(Math.max(...fr)) + 'ms', 'frames over 33ms', fr.filter((x) => x > 33.4).length, 'of', fr.length);
    await ctx.close();
  }
}
await b.close();
