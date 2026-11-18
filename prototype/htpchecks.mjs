// Throwaway: How to play links, focus, a11y, reduced motion. Usage: node prototype/htpchecks.mjs <url> <tag>
import { chromium } from 'playwright';
const [URL, TAG = 'dev'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const SIZES = [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]];
const settle = async (p, phone) => {
  await p.goto('about:blank');
  await p.goto(URL + '#hero');
  if (!phone) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
};
const where = (p) => p.evaluate(() => {
  const t = document.getElementById('how-to-play-title').getBoundingClientRect();
  const n = document.querySelector('.nav__pill').getBoundingClientRect();
  return { titleTop: Math.round(t.top), navBottom: Math.round(n.bottom), clear: t.top >= n.bottom, current: document.querySelector('.nav [aria-current]')?.textContent || null };
});
for (const [size, opts] of SIZES) {
  const phone = size.startsWith('390');
  const p = await (await b.newContext(opts)).newPage();
  p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  // Links
  const links = phone ? [['menu', async () => { await p.click('.nav__menu-button'); await p.click('#nav-panel a[href="#how-to-play"]'); }], ['hero-link', () => p.click('#hero .text-link')], ['scroll-cue', () => p.click('.hero__cue')]]
    : [['header', () => p.click('.nav__links a[href="#how-to-play"]')], ['hero-link', () => p.click('#hero .text-link')], ['scroll-cue', () => p.click('.hero__cue')]];
  for (const [name, click] of links) {
    await settle(p, phone);
    await click(); await p.waitForTimeout(5000);
    await p.screenshot({ path: `design/screenshots/htp-${size}-link-${name}-${TAG}.png` });
    console.log(size, 'link', name, JSON.stringify(await where(p)));
  }
  // Focus on each level button (pinned on desktop)
  for (let i = 0; i < 3; i++) {
    await p.locator('.htp__level-button').nth(i).focus();
    if (!phone) { await p.keyboard.press('Enter'); await p.waitForTimeout(2800); await p.locator('.htp__level-button').nth(i).focus(); }
    else await p.waitForTimeout(800);
    await p.screenshot({ path: `design/screenshots/htp-${size}-focus-level${i + 1}-${TAG}.png` });
    console.log(size, 'focus level', i + 1, JSON.stringify(await p.evaluate(() => ({ focused: document.activeElement.textContent.trim(), active: [...document.querySelectorAll('.htp__level')].findIndex((l) => l.classList.contains('is-active')), outline: getComputedStyle(document.activeElement).outlineStyle }))));
  }
  console.log(size, 'a11y:\n' + await p.locator('#how-to-play').ariaSnapshot());
  console.log(size, 'focusable inside cards:', await p.evaluate(() => document.querySelectorAll('.htp-card a, .htp-card button, .htp-card [tabindex]').length));
  await p.close();
  // Reduced motion
  const r = await (await b.newContext({ ...opts, reducedMotion: 'reduce' })).newPage();
  await r.goto(URL + '#how-to-play'); await r.waitForTimeout(1500);
  await r.screenshot({ path: `design/screenshots/htp-${size}-reduced-${TAG}.png`, fullPage: false });
  console.log(size, 'reduced:', JSON.stringify(await r.evaluate(() => ({ pinned: document.getElementById('how-to-play').classList.contains('is-pinned'), levelOpacity: getComputedStyle(document.querySelector('.htp__level')).opacity, miniCards: [...document.querySelectorAll('.htp-card--mini')].map((c) => getComputedStyle(c).display) }))));
  await r.close();
}
await b.close();
