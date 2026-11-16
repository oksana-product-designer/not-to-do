import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/prototype/poses.html');
await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
await p.waitForTimeout(1000);
console.log(await p.evaluate(() => [...document.body.children].map(e => e.tagName + '#' + e.id + '.' + e.className)));
const poses = JSON.parse(process.argv[3]);
for (const [r, y] of poses) {
  await p.evaluate(([r, y]) => { __cam.rotation.x = r; __cam.position.y = y; }, [r, y]); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/p-${r}-${y}.jpg`, type: 'jpeg', quality: 60 });
}
await b.close();
