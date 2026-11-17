// Throwaway: all hero + header checks in one run. Usage: node prototype/verifyall.mjs [baseURL] [tag]
// Screenshots go to design/screenshots/, results print as JSON lines.
import { chromium } from 'playwright';
const URL = process.argv[2] || 'http://localhost:5173/not-to-do/';
const TAG = process.argv[3] || '';
const OUT = (name) => `design/screenshots/${name}${TAG}.png`;
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const log = (...a) => console.log(...a);
const SIZES = [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]];

const toHero = async (p) => p.evaluate(() => window.scrollTo({ top: document.getElementById('hero').offsetTop, behavior: 'instant' }));
const rects = (p) => p.evaluate(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom].map(Math.round); };
  return { h1: r('.hero__title'), sub: r('.hero__sub'), link: r('.hero__actions .text-link'), cue: r('.hero__cue .scroll-cue__inner'), navLinks: r('.nav__links'), wordmark: r('.nav__wordmark') };
});

for (const [size, opts] of SIZES) {
  const ctx = await b.newContext(opts); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL); await p.waitForTimeout(4500);

  // 1. In the intro: header invisible, inert, not reachable by Tab or click
  const intro = await p.evaluate(() => { const n = document.getElementById('nav'); return { inert: n.inert, visibility: getComputedStyle(n).visibility, opacity: getComputedStyle(n).opacity }; });
  const tabbed = [];
  for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); tabbed.push(await p.evaluate(() => document.activeElement.className || document.activeElement.tagName)); }
  await p.mouse.click(size === '1440x900' ? 780 : 330, 48); await p.waitForTimeout(300);
  const hashAfterClick = await p.evaluate(() => location.hash);
  log(size, 'INTRO header', JSON.stringify(intro), 'tab order:', tabbed.join(' > '), 'hash after click at header spot:', JSON.stringify(hashAfterClick));
  await p.evaluate(() => document.activeElement.blur());
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(800);

  // 2. Scroll through: mid-entrance 2.3 s into the move, then arrived
  await p.mouse.move(200, 400);
  let tLeave = null, mid = false;
  for (let i = 0; i < 600; i++) {
    const at = await p.evaluate(() => scrollY >= document.getElementById('hero').offsetTop - 4);
    if (!tLeave && !at) await p.mouse.wheel(0, 120);
    await p.waitForTimeout(50);
    const s = await p.evaluate(() => ({ go: document.documentElement.classList.contains('is-intro-leaving') || !!document.querySelector('.hero.is-hero-in'), done: !!document.querySelector('.hero.is-hero-done') }));
    if (!tLeave && s.go) tLeave = Date.now();
    if (tLeave && !mid && Date.now() - tLeave >= 2300) { mid = true; await p.screenshot({ path: OUT(`hero-final-${size}-mid-entrance`) }); }
    if (s.done && mid) break;
  }
  await toHero(p); await p.waitForTimeout(2500);
  await p.screenshot({ path: OUT(`hero-final-${size}-arrived`) });
  log(size, 'RECTS', JSON.stringify(await rects(p)), 'current link on hero:', await p.evaluate(() => document.querySelector('.nav__link[aria-current]')?.textContent || 'none'));

  // 3. Keyboard focus on each header item
  const items = await p.evaluate(() => [...document.querySelectorAll('#nav a, #nav button')].filter((e) => e.offsetParent !== null).length);
  await p.evaluate(() => document.querySelector('.nav__wordmark').focus());
  for (let i = 0; i < items; i++) {
    if (i > 0) await p.keyboard.press('Tab');
    const name = await p.evaluate(() => document.activeElement.textContent.trim());
    await p.screenshot({ path: OUT(`header-${size}-focus-${i + 1}`), clip: { x: 0, y: 0, width: opts.viewport.width, height: 140 } });
    log(size, 'FOCUS', i + 1, name);
  }

  if (size === '390x844') {
    // 4. Phone menu: open, focus, Escape, tap outside, link click
    const menu = p.locator('.nav__menu-button');
    await menu.click(); await p.waitForTimeout(300);
    const opened = await p.evaluate(() => ({ expanded: document.querySelector('.nav__menu-button').getAttribute('aria-expanded'), focus: document.activeElement.textContent.trim(), panel: !document.getElementById('nav-panel').hidden }));
    await p.screenshot({ path: OUT('header-390x844-menu-open') });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    const afterEsc = await p.evaluate(() => ({ expanded: document.querySelector('.nav__menu-button').getAttribute('aria-expanded'), focus: document.activeElement.textContent.trim() }));
    await menu.click(); await p.waitForTimeout(200);
    await p.mouse.click(195, 700); await p.waitForTimeout(200);
    const afterOutside = await p.evaluate(() => document.querySelector('.nav__menu-button').getAttribute('aria-expanded'));
    await menu.click(); await p.waitForTimeout(200);
    const targetSize = await p.evaluate(() => [...document.querySelectorAll('#nav a, #nav button')].filter((e) => e.offsetParent !== null).map((e) => Math.round(e.getBoundingClientRect().height)));
    await p.locator('#nav-panel a[href="#high-score"]').click(); await p.waitForTimeout(1800);
    const afterLink = await p.evaluate(() => ({ expanded: document.querySelector('.nav__menu-button').getAttribute('aria-expanded'), focus: document.activeElement.textContent.trim(), sectionTop: Math.round(document.getElementById('high-score').getBoundingClientRect().top), current: document.querySelector('#nav-panel .nav__link[aria-current]')?.textContent }));
    log(size, 'MENU', JSON.stringify({ opened, afterEsc, afterOutside, afterLink, targetHeights: targetSize }));
  }

  // 5. Click each header link
  for (const id of ['how-to-play', 'high-score', 'stealth']) {
    await toHero(p); await p.waitForTimeout(600);
    if (size === '390x844') { await p.locator('.nav__menu-button').click(); await p.waitForTimeout(200); await p.locator(`#nav-panel a[href="#${id}"]`).click(); }
    else await p.locator(`.nav__links a[href="#${id}"]`).click();
    await p.waitForTimeout(1800);
    const r = await p.evaluate((id) => ({ sectionTop: Math.round(document.getElementById(id).getBoundingClientRect().top), navBottom: Math.round(document.querySelector('.nav__pill').getBoundingClientRect().bottom), current: [...document.querySelectorAll('.nav__link[aria-current]')].map((e) => e.textContent).join(',') }), id);
    await p.screenshot({ path: OUT(`header-${size}-link-${id}`) });
    log(size, 'LINK', id, JSON.stringify(r));
  }
  // back up into the intro: header hides again
  await p.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' })); await p.waitForTimeout(1200);
  log(size, 'BACK IN INTRO header', JSON.stringify(await p.evaluate(() => { const n = document.getElementById('nav'); return { inert: n.inert, visibility: getComputedStyle(n).visibility }; })));
  log(size, 'errors', JSON.stringify(errs));
  await ctx.close();

  // 6. Reduced motion
  const rctx = await b.newContext({ ...opts, reducedMotion: 'reduce' }); const r = await rctx.newPage();
  await r.goto(URL); await r.waitForTimeout(1500); await toHero(r); await r.waitForTimeout(1500);
  await r.screenshot({ path: OUT(`hero-final-${size}-reduced-motion`) });
  log(size, 'REDUCED', JSON.stringify(await r.evaluate(() => ({ opacities: [...document.querySelectorAll('.hero__word > span, .hero__item')].map((e) => getComputedStyle(e).opacity).join(','), nav: getComputedStyle(document.getElementById('nav')).visibility }))));
  await rctx.close();

  // 7. Skip intro still works
  const sctx = await b.newContext(opts); const s = await sctx.newPage();
  await s.goto(URL); await s.waitForTimeout(4500);
  await s.keyboard.press('Tab'); const first = await s.evaluate(() => document.activeElement.textContent.trim());
  await s.keyboard.press('Enter'); await s.waitForTimeout(4000);
  log(size, 'SKIP', JSON.stringify(await s.evaluate((f) => ({ firstTab: f, atHero: Math.abs(scrollY - document.getElementById('hero').offsetTop) < 4, entrance: document.querySelector('.hero').className, nav: document.getElementById('nav').classList.contains('is-shown') }), first)));
  await sctx.close();
}
await b.close();
