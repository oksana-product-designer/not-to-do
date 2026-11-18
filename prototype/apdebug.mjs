import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2]);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000); await p.mouse.move(700, 450);
for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); }
await p.waitForTimeout(5000);
const swipe = async () => { for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, Math.round(220 * Math.pow(0.86, i))); await p.waitForTimeout(16); } };
await swipe(); await p.waitForTimeout(3000);
const t = await p.evaluate(() => performance.now());
await swipe();
const track = [];
for (let k = 0; k < 16; k++) { await p.waitForTimeout(200); track.push(await p.evaluate(() => [Math.round(performance.now()), Math.round(scrollY)])); }
console.log('swipe 2 started at', Math.round(t));
console.log(track.map(([a, y]) => `${a - Math.round(t)}ms:${y}`).join(' '));
console.log(JSON.stringify(await p.evaluate(() => window.__autoplay), null, 0));
console.log('token', await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--duration-autoplay-wipe')));
await b.close();
