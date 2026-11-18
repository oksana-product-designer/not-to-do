// Throwaway: scroll through the intro with fast wheel flicks and check the page stops at the hero.
import { chromium } from 'playwright';
const URL = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(URL); await p.waitForTimeout(4500);
await p.mouse.move(700, 450);
const act = await p.evaluate(() => document.getElementById('act').offsetTop);
// steady scrolling through the intro (lines need time), then a long fast fling like trackpad momentum
for (let i = 0; i < 70; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); }
for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(16); }
await p.waitForTimeout(1500);
const y1 = await p.evaluate(() => scrollY);
console.log('act (hero) top', act, '| after the fling, scrollY', y1, y1 <= act + 2 ? 'STOPPED AT HERO' : 'went past');
// a new gesture after the pause continues into the wipe
await p.waitForTimeout(800);
for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 80); await p.waitForTimeout(40); }
await p.waitForTimeout(800);
console.log('next gesture, scrollY', await p.evaluate(() => scrollY), '(should be past the hero top)');
// scrolling up is never blocked
for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(30); }
await p.waitForTimeout(600);
console.log('after scrolling up, scrollY', await p.evaluate(() => scrollY));
await b.close();
