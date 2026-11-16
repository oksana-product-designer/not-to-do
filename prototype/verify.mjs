// Throwaway: screenshots and checks for the intro. Usage: node prototype/verify.mjs
import { chromium } from 'playwright';
const GPU = ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'];
const URL = 'http://127.0.0.1:5173/';
const dir = 'design/screenshots';
const report = {};
const visibleParts = () => [...document.querySelectorAll('.intro__part')].filter((e) => +getComputedStyle(e).opacity > 0.5).map((e) => e.textContent);

async function run(tag, ctxOpts) {
  const b = await chromium.launch({ args: GPU });
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  const logs = []; p.on('console', (m) => { if (m.type() !== 'debug') logs.push(m.type() + ': ' + m.text().slice(0, 160)); });
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  const r = (report[tag] = { logs });
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  const at = async (ms) => { const d = ms - (Date.now() - t0); if (d > 0) await p.waitForTimeout(d); };
  const go = async (y, wait = 1300) => { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(wait); };
  await p.screenshot({ path: `${dir}/intro-${tag}-1-first-frame.png` });
  r.skipVisibleAtFirstFrame = await p.evaluate(() => { const e = document.querySelector('.skip-intro'); const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.visibility === 'visible' && s.opacity === '1' && b.width > 0 && b.top >= 0; });
  await at(3000); await p.screenshot({ path: `${dir}/intro-${tag}-2-part-1-hint.png` });
  r.sceneLoaded = await p.evaluate(() => document.getElementById('scene').classList.contains('is-loaded'));
  r.navHiddenInIntro = await p.evaluate(() => document.getElementById('nav').hidden);
  r.partsAtStart = await p.evaluate(visibleParts);
  r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const order = [];
  for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => (document.activeElement.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26))); }
  r.tabOrder = order;
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await at(7150); await p.screenshot({ path: `${dir}/intro-${tag}-3-idle-dip.png` });
  await at(9300);
  r.afterDipHeroTransform = await p.evaluate(() => getComputedStyle(document.getElementById('hero-content')).transform);
  const vh = ctxOpts.viewport.height;
  const pinned = await p.evaluate(() => document.getElementById('intro').offsetHeight - innerHeight);
  r.pinnedScrollPx = pinned;
  // Frame rate while scrolling through the whole intro and into the hero
  await p.evaluate(() => { window.__f = []; let l = performance.now(); const t = (n) => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
  const total = pinned + vh;
  for (let i = 1; i <= 150; i++) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), (total * i) / 150); await p.waitForTimeout(33); }
  const fr = await p.evaluate(() => window.__f.slice(2));
  const sorted = [...fr].sort((a, b) => a - b);
  r.fps = { avg: +(1000 / (fr.reduce((a, c) => a + c, 0) / fr.length)).toFixed(1), p95ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), maxMs: +sorted.at(-1).toFixed(1), over33ms: fr.filter((x) => x > 33.4).length, frames: fr.length };
  r.hintHiddenAfterScroll = await p.evaluate(() => document.getElementById('intro-hint').classList.contains('is-hidden'));
  // Each part
  r.parts = {};
  for (const [n, f] of [[2, 0.36], [3, 0.61], [4, 0.9]]) { await go(pinned * f); r.parts[n] = await p.evaluate(visibleParts); await p.screenshot({ path: `${dir}/intro-${tag}-4-part-${n}.png` }); }
  // Mid-swap between part 2 and 3
  await go(pinned * 0.37); await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), pinned * 0.46); await p.waitForTimeout(330);
  await p.screenshot({ path: `${dir}/intro-${tag}-5-mid-swap.png` });
  await go(pinned + vh * 0.5, 900); await p.screenshot({ path: `${dir}/intro-${tag}-6-clouds-leaving.png` });
  await go(pinned + vh, 1000); await p.screenshot({ path: `${dir}/intro-${tag}-7-hero.png` });
  r.atHero = await p.evaluate(() => ({ navHidden: document.getElementById('nav').hidden, skipVisibility: getComputedStyle(document.querySelector('.skip-intro')).visibility, seen: localStorage.getItem('ntd-intro-seen') }));
  // Scrolling back up reverses
  await go(pinned * 0.37); r.backToPart2 = await p.evaluate(visibleParts);
  await go(0); r.backToTop = await p.evaluate(visibleParts);
  await p.keyboard.press('Space'); await p.waitForTimeout(900);
  r.scrollYAfterSpace = await p.evaluate(() => Math.round(scrollY));
  const p2 = await ctx.newPage(); await p2.goto(URL); await p2.waitForTimeout(1500);
  r.returnVisit = await p2.evaluate(() => ({ scrollY: Math.round(scrollY), heroTop: document.getElementById('hero').offsetTop }));
  await b.close();
}

await run('1440x900', { viewport: { width: 1440, height: 900 } });
await run('390x844', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

for (const [tag, o] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const b = await chromium.launch({ args: GPU }); const ctx = await b.newContext({ ...o, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  await p.goto(URL); await p.waitForTimeout(500);
  await p.screenshot({ path: `${dir}/intro-${tag}-8-reduced-motion.png` });
  report['reduced-' + tag] = await p.evaluate(() => ({ canvasShown: document.getElementById('scene').classList.contains('is-loaded'), introHeight: document.getElementById('intro').offsetHeight, visible: [...document.querySelectorAll('.intro__part')].filter((e) => +getComputedStyle(e).opacity > 0.5).length, overflowX: document.documentElement.scrollWidth - innerWidth }));
  await b.close();
}
{ const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL); await p.waitForTimeout(5000);
  report.noWebGPU = { loaded: await p.evaluate(() => document.getElementById('scene').classList.contains('is-loaded')), canvasHidden: await p.evaluate(() => document.getElementById('scene-canvas').hidden) };
  await p.evaluate(() => window.scrollTo({ top: document.getElementById('hero').offsetTop, behavior: 'instant' })); await p.waitForTimeout(800);
  await p.screenshot({ path: `${dir}/intro-1440x900-9-no-scene-hero.png` });
  await b.close(); }
console.log(JSON.stringify(report));
