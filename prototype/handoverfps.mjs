// Throwaway: frame rate through the Problem exit and How to play entrance (desktop).
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + '#hero');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
await p.waitForTimeout(8500);
const { from, to } = await p.evaluate(() => ({ from: document.getElementById('act').offsetTop + innerHeight * 2.6, to: document.getElementById('how-to-play').getBoundingClientRect().top + scrollY + innerHeight * 0.5 }));
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), from); await p.waitForTimeout(3000);
await p.evaluate(() => { window.__f = []; let l = performance.now(); const t = (n) => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
for (let i = 1; i <= 120; i++) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), from + (to - from) * i / 120); await p.waitForTimeout(25); }
await p.waitForTimeout(1500);
const fr = await p.evaluate(() => window.__f.slice(3));
console.log('hand-over: avg fps', (1000 / (fr.reduce((a, c) => a + c, 0) / fr.length)).toFixed(1), 'worst', Math.round(Math.max(...fr)) + 'ms', 'over 33ms:', fr.filter((x) => x > 33.4).length, '/', fr.length);
await b.close();
