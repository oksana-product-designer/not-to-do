// Throwaway: frames during the move from the intro to the hero, with the hero content's position.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(process.argv[2]);

await p.waitForTimeout(4000); await p.mouse.move(700, 450);
for (let i = 0; i < 52; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); } // into the intro, lines playing
await p.waitForTimeout(5000); // lines done
const act = await p.evaluate(() => document.getElementById('act').offsetTop);
for (const [name, y, wait] of [['a-act-at-70pct', act - 590, 1800], ['b-act-at-40pct', act - 338, 1500], ['c-act-at-10pct', act - 84, 1500], ['d-arrived', act, 1500]]) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(wait);
  await p.screenshot({ path: `design/screenshots/hero-arrive-phone-${name}.png` });
  console.log(name, JSON.stringify(await p.evaluate(() => ({ actTop: Math.round(document.getElementById('act').getBoundingClientRect().top), titleTop: Math.round(document.querySelector('.hero__title').getBoundingClientRect().top), arriving: document.getElementById('act').classList.contains('is-arriving'), hero: document.getElementById('hero').className.replace('hero ', '') }))));
}
await b.close();
