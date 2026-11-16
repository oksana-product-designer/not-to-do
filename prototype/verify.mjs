// Throwaway: screenshots and checks for the intro. Usage: node prototype/verify.mjs
import { chromium } from 'playwright';
const GPU = ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'];
const URL = 'http://127.0.0.1:5173/';
const dir = 'design/screenshots';
const report = {};

async function run(tag, ctxOpts, { gpu = true } = {}) {
  const b = await chromium.launch({ args: gpu ? GPU : [] });
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  const logs = []; p.on('console', (m) => { if (m.type() !== 'debug') logs.push(m.type() + ': ' + m.text().slice(0, 160)); });
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  const r = (report[tag] = { logs });
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  const at = async (ms) => { const d = ms - (Date.now() - t0); if (d > 0) await p.waitForTimeout(d); };
  await p.screenshot({ path: `${dir}/intro-${tag}-1-first-frame.png` });
  r.skipVisibleAtFirstFrame = await p.evaluate(() => { const e = document.querySelector('.skip-intro'); const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.visibility === 'visible' && s.opacity === '1' && b.width > 0 && b.top >= 0; });
  await at(2100); await p.screenshot({ path: `${dir}/intro-${tag}-2-after-line-2.png` });
  await at(3800); await p.screenshot({ path: `${dir}/intro-${tag}-3-hint-visible.png` });
  r.sceneLoaded = await p.evaluate(() => document.getElementById('scene').classList.contains('is-loaded'));
  r.navHiddenInIntro = await p.evaluate(() => document.getElementById('nav').hidden);
  // Tab order (before any scroll)
  const order = [];
  for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => { const a = document.activeElement; return a ? (a.tagName + ':' + (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)) : 'none'; })); }
  r.tabOrder = order;
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  r.scrollYAfterTabs = await p.evaluate(() => scrollY);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  // Idle dip at 6s
  await at(7150); await p.screenshot({ path: `${dir}/intro-${tag}-3b-idle-dip.png` });
  r.dipHeroLift = await p.evaluate(() => getComputedStyle(document.getElementById('hero-content')).transform);
  await at(9200);
  r.afterDipHeroTransform = await p.evaluate(() => getComputedStyle(document.getElementById('hero-content')).transform);
  // Frame rate while scrolling through the intro
  const vh = ctxOpts.viewport.height;
  await p.evaluate(() => { window.__f = []; let l = performance.now(); const t = (n) => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
  for (let i = 1; i <= 60; i++) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), (vh * i) / 60); await p.waitForTimeout(33); }
  const fr = await p.evaluate(() => window.__f.slice(2));
  const sorted = [...fr].sort((a, b) => a - b);
  r.fps = { avg: +(1000 / (fr.reduce((a, c) => a + c, 0) / fr.length)).toFixed(1), p95ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), maxMs: +sorted.at(-1).toFixed(1), over33ms: fr.filter((x) => x > 33.4).length, frames: fr.length };
  r.hintHiddenAfterScroll = await p.evaluate(() => document.getElementById('intro-hint').classList.contains('is-hidden'));
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), vh / 2); await p.waitForTimeout(600);
  await p.screenshot({ path: `${dir}/intro-${tag}-4-halfway.png` });
  r.linesHalfway = await p.evaluate(() => { const s = getComputedStyle(document.getElementById('intro-lines')); return { opacity: s.opacity, transform: s.transform }; });
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), vh); await p.waitForTimeout(800);
  await p.screenshot({ path: `${dir}/intro-${tag}-5-hero.png` });
  r.atHero = await p.evaluate(() => ({ navHidden: document.getElementById('nav').hidden, skipVisibility: getComputedStyle(document.querySelector('.skip-intro')).visibility, seen: localStorage.getItem('ntd-intro-seen') }));
  // Scroll back up reverses
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(600);
  r.linesBackAtTop = await p.evaluate(() => getComputedStyle(document.getElementById('intro-lines')).opacity);
  // Keyboard scroll: Space
  await p.keyboard.press('Space'); await p.waitForTimeout(900);
  r.scrollYAfterSpace = await p.evaluate(() => Math.round(scrollY));
  // Return visit (same storage)
  const p2 = await ctx.newPage(); await p2.goto(URL); await p2.waitForTimeout(1200);
  r.returnVisit = await p2.evaluate(() => ({ scrollY: Math.round(scrollY), heroTop: document.getElementById('hero').offsetTop, seenClass: document.documentElement.classList.contains('intro-seen') }));
  await b.close();
}

await run('1440x900', { viewport: { width: 1440, height: 900 } });
await run('390x844', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

// Reduced motion (desktop + phone): one screenshot each, straight after load
for (const [tag, o] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const b = await chromium.launch({ args: GPU }); const ctx = await b.newContext({ ...o, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  await p.goto(URL); await p.waitForTimeout(400);
  await p.screenshot({ path: `${dir}/intro-${tag}-6-reduced-motion.png` });
  await p.evaluate(() => window.scrollTo(0, 300)); await p.waitForTimeout(300);
  report['reduced-' + tag] = await p.evaluate(() => ({ canvasShown: document.getElementById('scene').classList.contains('is-loaded'), hintHidden: document.getElementById('intro-hint').classList.contains('is-hidden'), linesOpacity: getComputedStyle(document.getElementById('intro-lines')).opacity, lineOpacity: getComputedStyle(document.querySelector('.intro__line--large')).opacity }));
  await b.close();
}

// Failed scene: block the Spline file, and separately a browser without WebGPU
{ const b = await chromium.launch({ args: GPU }); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/*.splinecode', (r) => r.abort()); const logs = []; p.on('console', (m) => { if (m.type() === 'warning') logs.push(m.text().slice(0, 120)); });
  await p.goto(URL); await p.waitForTimeout(4000);
  await p.screenshot({ path: `${dir}/intro-1440x900-7-scene-blocked.png` });
  report.blocked = { loaded: await p.evaluate(() => document.getElementById('scene').classList.contains('is-loaded')), canvasHidden: await p.evaluate(() => document.getElementById('scene-canvas').hidden), logs };
  await b.close(); }
{ const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL); await p.waitForTimeout(5000);
  report.noWebGPU = { loaded: await p.evaluate(() => document.getElementById('scene').classList.contains('is-loaded')), canvasHidden: await p.evaluate(() => document.getElementById('scene-canvas').hidden) };
  await b.close(); }
console.log(JSON.stringify(report, null, 1));
