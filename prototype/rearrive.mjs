import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + '#hero');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(8500); await p.mouse.move(700, 450);
const stop = await p.evaluate(() => document.getElementById('act').offsetTop + innerHeight * 2.2);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), stop); await p.waitForTimeout(1500);
for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(40); } await p.waitForTimeout(1500); // first swipe: lands/rests
for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(40); } await p.waitForTimeout(1500); // moves on a little
console.log('moved off Problem to', await p.evaluate(() => Math.round(scrollY)), '(stop', Math.round(stop) + ')');
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), stop); await p.waitForTimeout(800);
for (let i = 0; i < 20; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(16); } await p.waitForTimeout(800);
const y = await p.evaluate(() => Math.round(scrollY));
console.log('hard flick from Problem again ->', y, Math.abs(y - stop) <= 2 ? 'HELD ON PROBLEM' : 'went on');
await b.close();
