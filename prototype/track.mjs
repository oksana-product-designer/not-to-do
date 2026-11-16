import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = []; p.on('pageerror', (e) => logs.push(e.message));
await p.goto('http://127.0.0.1:5173/');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
const shot = (n) => p.screenshot({ path: `design/screenshots/hero-1440x900-cursor-${n}.png` });
// Intro: moving the pointer must not move anything
await p.mouse.move(100, 100); await p.waitForTimeout(600); const a1 = await p.screenshot();
await p.mouse.move(1300, 800, { steps: 10 }); await p.waitForTimeout(1500); const a2 = await p.screenshot();
await p.evaluate(() => window.scrollTo({ top: document.getElementById('hero').offsetTop, behavior: 'instant' }));
await p.mouse.move(60, 60, { steps: 10 }); await p.waitForTimeout(2500); await shot('top-left');
await p.mouse.move(1380, 840, { steps: 10 }); await p.waitForTimeout(2500); await shot('bottom-right');
console.log(JSON.stringify({ logs, introBytesSame: Math.abs(a1.length - a2.length) }));
await b.close();
