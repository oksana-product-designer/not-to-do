// Throwaway: scroll steadily through lines 3 and 4 and record scrollY each frame to spot snap-backs
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
const gate = await p.evaluate(() => document.getElementById('intro').offsetHeight - innerHeight);
// Get to line 3 calmly
for (let y = 200; y <= gate * 0.6; y += 300) { await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(500); }
await p.waitForTimeout(1500);
await p.evaluate(() => { window.__ys = []; const t = () => { window.__ys.push(Math.round(scrollY)); requestAnimationFrame(t); }; requestAnimationFrame(t); });
await p.mouse.move(700, 450);
for (let i = 0; i < 30; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(50); }
await p.waitForTimeout(800);
const ys = await p.evaluate(() => window.__ys);
let backs = 0; for (let i = 1; i < ys.length; i++) if (ys[i] < ys[i - 1]) backs++;
console.log('gate', gate, 'frames', ys.length, 'backward jumps', backs, 'max', Math.max(...ys));
console.log(ys.filter((_, i) => i % 3 === 0).join(' '));
await b.close();
