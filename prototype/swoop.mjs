import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = []; p.on('pageerror', (e) => logs.push(e.message));
await p.goto('http://127.0.0.1:5173/');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
const pinned = await p.evaluate(() => document.getElementById('intro').offsetHeight - innerHeight);
for (const f of [0.25, 0.5, 0.75]) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), pinned + 900 * f); await p.waitForTimeout(1500);
  await p.screenshot({ path: `design/screenshots/intro-1440x900-6-swoop-${f * 100}.png`, scale: 'css' });
}
console.log(logs);
await b.close();
