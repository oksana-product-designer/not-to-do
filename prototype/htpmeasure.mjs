// Throwaway: contrast boxes at level 2 mid, frame rate through the pin, CLS.
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [size, opts, throttle] of [['1440x900', { viewport: { width: 1440, height: 900 } }, 1], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, 4]]) {
  const ctx = await b.newContext(opts); const p = await ctx.newPage();
  await p.goto(URL + '#hero');
  if (throttle === 1) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
  await p.waitForTimeout(8500);
  const { top, h, len } = await p.evaluate(() => { const s = document.getElementById('how-to-play'); return { top: s.getBoundingClientRect().top + scrollY, h: innerHeight, len: s.offsetHeight - innerHeight }; });
  // contrast boxes
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), throttle === 1 ? top + len * 0.5 : top + 300); await p.waitForTimeout(2800);
  const boxes = await p.evaluate(() => {
    const box = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(','); };
    const out = [];
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
    document.querySelectorAll('.htp__level').forEach((l, i) => {
      const a = l.classList.contains('is-active') || !document.getElementById('how-to-play').classList.contains('is-pinned');
      [['label', '.htp__level-label'], ['title', '.htp__level-title'], ['text', '.htp__level-text']].forEach(([n, s]) => { const el = l.querySelector(s); if (vis(el)) out.push([`L${i + 1}-${n}${a ? '' : '-inactive'}`, box(el)]); });
    });
    [['sub', '.htp__sub'], ['h2', '.htp__title']].forEach(([n, s]) => { const el = document.querySelector(s); if (vis(el)) out.push([n, box(el)]); });
    return out;
  });
  await p.screenshot({ path: `/tmp/claude-501/htp-contrast-${size}.png` });
  console.log('BOXES', size, boxes.map((x) => x.join(' ')).join(' '));
  // fps + CLS through the section
  if (throttle > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - h); await p.waitForTimeout(1200);
  await p.evaluate(() => { window.__cls = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift' }); window.__f = []; let l = performance.now(); const t = (n) => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
  const total = throttle === 1 ? len + h : h * 4;
  for (let i = 1; i <= 150; i++) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - h + total * i / 150); await p.waitForTimeout(25); }
  await p.waitForTimeout(1200);
  const fr = await p.evaluate(() => window.__f.slice(3));
  console.log(size, throttle > 1 ? '(CPU 4x slower)' : '', 'avg fps', (1000 / (fr.reduce((a, c) => a + c, 0) / fr.length)).toFixed(1), 'worst', Math.round(Math.max(...fr)) + 'ms', 'over 33ms:', fr.filter((x) => x > 33.4).length, '/', fr.length, 'CLS', (await p.evaluate(() => window.__cls)).toFixed(4));
  await ctx.close();
}
await b.close();
