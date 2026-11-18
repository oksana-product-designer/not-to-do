// Throwaway: wipe/Problem checks. Usage: node prototype/wipechecks.mjs <url> <tag>
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const SIZES = [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]];
const arrive = async (p, phone) => {
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
  return p.evaluate(() => ({ act: document.getElementById('act').offsetTop, vh: innerHeight }));
};
const to = async (p, y, wait = 1600) => { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(wait); };

for (const [size, opts] of SIZES) {
  const phone = size.startsWith('390');
  // 1. Focus, header and links during the wipe
  const p = await (await b.newContext(opts)).newPage();
  p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  const { act, vh } = await arrive(p, phone);
  const W = vh * 1.5, R = vh * 1.2;
  for (const pc of [30, 50, 55]) {
    await to(p, act + W * pc / 100);
    await p.evaluate(() => document.getElementById('nav').querySelector('a').focus());
    const seen = [];
    for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); seen.push(await p.evaluate(() => { const a = document.activeElement; return (a.closest('#hero') ? 'HERO:' : a.closest('#problem') ? 'PROBLEM:' : a.closest('#nav') ? 'nav:' : 'other:') + (a.textContent || a.tagName).trim().slice(0, 18); })); }
    const ctaHit = await p.evaluate(() => { const r = document.querySelector('.nav__cta').getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!el.closest('.nav__cta'); });
    const heroCtaHit = await p.evaluate(() => { const r = document.querySelector('#hero .button').getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el ? (el.closest('#hero') ? 'hero button reachable' : el.className.toString().slice(0, 30)) : 'none'; });
    console.log(size, `p${pc}`, 'header CTA clickable:', ctaHit, '| point over hero button hits:', heroCtaHit, '| tab:', [...new Set(seen)].join(', '));
  }
  // wordmark from the end of the act goes back to the hero
  await to(p, act + W + R);
  if (!phone) { await p.click('.nav__wordmark'); await p.waitForTimeout(2500); console.log(size, 'wordmark from Problem -> scrollY', Math.round(await p.evaluate(() => scrollY)), 'act top', act); }
  // accessibility: heading name and what the wipe exposes
  console.log(size, 'a11y:\n' + await p.locator('#problem').ariaSnapshot());
  console.log(size, 'wipe in a11y tree:', JSON.stringify(await p.locator('.wipe').ariaSnapshot()));
  // contrast boxes for the revealed state
  await to(p, act + W + R, 2000);
  const boxes = await p.evaluate(() => ['.problem__title', '.problem__sub'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)].join(','); }));
  await p.screenshot({ path: `/tmp/claude-501/contrast-${size}.png` });
  console.log(size, 'BOXES', boxes.join(' '));
  // CLS over a scroll through the act
  await to(p, act - vh, 800);
  await p.evaluate(() => { window.__cls = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: false }); });
  for (let i = 0; i <= 60; i++) await to(p, act - vh + (vh + W + R) * i / 60, 30);
  await p.waitForTimeout(800);
  console.log(size, 'CLS during scroll', await p.evaluate(() => window.__cls.toFixed(4)));
  await p.close();

  // 2. Reduced motion
  const r = await (await b.newContext({ ...opts, reducedMotion: 'reduce' })).newPage();
  await r.goto(URL); await r.waitForTimeout(1500);
  const top = await r.evaluate(() => document.getElementById('problem').offsetTop);
  await r.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top); await r.waitForTimeout(800);
  await r.screenshot({ path: `design/screenshots/wipe-${size}-reduced-problem-${TAG}.png` });
  console.log(size, 'reduced: word opacity', await r.evaluate(() => getComputedStyle(document.querySelector('.problem__word')).opacity), 'sub', await r.evaluate(() => getComputedStyle(document.querySelector('.problem__sub')).opacity), 'act height', await r.evaluate(() => document.getElementById('act').offsetHeight));
  // veil mid-crossfade: put the Problem top just below the middle, then cross it
  await r.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - r.viewportSize().height * 0.6); await r.waitForTimeout(500);
  await r.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - r.viewportSize().height * 0.4); await r.waitForTimeout(170);
  console.log(size, 'reduced: veil opacity mid-crossfade', await r.evaluate(() => getComputedStyle(document.querySelector('.act__veil')).opacity));
  await r.screenshot({ path: `design/screenshots/wipe-${size}-reduced-veil-${TAG}.png` });
  await r.waitForTimeout(500);
  console.log(size, 'reduced: veil opacity after', await r.evaluate(() => getComputedStyle(document.querySelector('.act__veil')).opacity));
  await r.close();
}
await b.close();
