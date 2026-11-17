import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto('http://localhost:5173/not-to-do/#hero'); await p.waitForTimeout(8000);
  await p.screenshot({ path: `design/screenshots/header-${w}x${h}-layout.png`, clip: { x: 0, y: 0, width: w, height: 100 } });
  const order = [];
  await p.evaluate(() => document.querySelector('.nav__wordmark').focus());
  for (let i = 0; i < 6; i++) { order.push(await p.evaluate(() => document.activeElement.closest('#nav') ? document.activeElement.textContent.trim() : '(left header)')); await p.keyboard.press('Tab'); }
  console.log(w, JSON.stringify(await p.evaluate(() => { const c = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return Math.round((r.left + r.right) / 2); }; const pill = c('.nav__pill'); const links = getComputedStyle(document.querySelector('.nav__links')).display === 'none' ? null : c('.nav__links'); const login = document.querySelector('.nav__login').getBoundingClientRect(); const cta = document.querySelector('.nav__cta').getBoundingClientRect(); return { pillCenter: pill, linksCenter: links, loginToCtaGap: login.width ? Math.round(cta.left - login.right) : 'hidden', loginHeight: Math.round(login.height) }; })), 'tab:', order.join(' > '));
}
await b.close();
