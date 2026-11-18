// Throwaway: scroll near the end of the intro, pause, then one quick flick (like trackpad momentum).
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2]); await p.waitForTimeout(4000); await p.mouse.move(700, 450);
const act = await p.evaluate(() => document.getElementById('act').offsetTop);
for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); } // to about 4500
await p.waitForTimeout(5000); // pause: lines finish
console.log('before flick', await p.evaluate(() => Math.round(scrollY)), 'hero top', act);
const t0 = Date.now();
for (let i = 0; i < 20; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(16); }
console.log('flick lasted', Date.now() - t0, 'ms');
await p.waitForTimeout(1500);
const y = await p.evaluate(() => Math.round(scrollY));
console.log('after flick', y, y <= act + 2 ? 'STOPPED AT HERO' : 'went past');
await b.close();
