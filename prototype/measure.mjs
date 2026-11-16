// Throwaway: measures the scroll prototype. Usage: node prototype/measure.mjs desktop|mobile [headed]
import { chromium } from 'playwright';
const mode = process.argv[2] || 'desktop';
const headed = process.argv[3] === 'headed';
const cfg = mode === 'mobile'
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const browser = await chromium.launch({ headless: !headed, args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const ctx = await browser.newContext(cfg);
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
const t0 = Date.now();
await page.goto('http://127.0.0.1:5173/prototype/index.html');
await page.waitForFunction(() => window.__proto && window.__proto.ready, null, { timeout: 60000 });
const wall = Date.now() - t0;
await page.waitForTimeout(1500);
const info = await page.evaluate(() => ({ loadMs: __proto.loadMs, firstFrameMs: __proto.firstFrameMs, missing: __proto.missing, start: __proto.start,
  gl: (() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; })() }));

// (b) Does Spline's own motion run? Sample cloud x twice, 2s apart, without touching anything.
const c1 = await page.evaluate(() => __proto.getClouds()); await page.waitForTimeout(2000);
const c2 = await page.evaluate(() => __proto.getClouds());
// (c) Pointer parallax: camera before/after moving the pointer at scroll p=0.
const cam1 = await page.evaluate(() => __proto.getCam());
if (mode === 'desktop') { await page.mouse.move(100, 100); await page.mouse.move(1300, 800, { steps: 20 }); }
await page.waitForTimeout(1200);
const cam2 = await page.evaluate(() => __proto.getCam());

// (a) Scroll for 6s with wheel/touch-like scrolling and record frame times.
await page.evaluate(() => { __proto.frames.length = 0; });
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const steps = 120;
for (let i = 0; i <= steps; i++) { await page.evaluate((y) => window.scrollTo(0, y), (total * i) / steps); await page.waitForTimeout(40); }
const camEnd = await page.evaluate(() => __proto.getCam());
const fr = await page.evaluate(() => __proto.frames.slice());
const avg = fr.reduce((a, b) => a + b, 0) / fr.length;
const sorted = [...fr].sort((a, b) => a - b);
const stats = { frames: fr.length, avgFps: +(1000 / avg).toFixed(1), p95ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), maxMs: +sorted[sorted.length - 1].toFixed(1), over33ms: fr.filter((x) => x > 33.4).length };

console.log(JSON.stringify({ mode, headed, wall, info, cloudsBefore: c1, cloudsAfter2s: c2, camNoPointer: cam1, camAfterPointer: cam2, camEnd, scrollFps: stats, logs: logs.slice(0, 8) }, null, 1));

// screenshots at p=0 and p=1
const tag = mode === 'mobile' ? '390x844' : '1440x900';
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
await page.screenshot({ path: `design/screenshots/prototype-${tag}-top.png` });
await page.evaluate((y) => window.scrollTo(0, y), total); await page.waitForTimeout(800);
await page.screenshot({ path: `design/screenshots/prototype-${tag}-bottom.png` });
await browser.close();
