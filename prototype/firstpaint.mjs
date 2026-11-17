import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
await p.screenshot({ path: 'design/screenshots/opening-1440x900-0-first-paint.png' });
console.log(await p.evaluate(() => [document.documentElement.className, getComputedStyle(document.querySelector('.scene'), '::after').backgroundColor]));
await b.close();
