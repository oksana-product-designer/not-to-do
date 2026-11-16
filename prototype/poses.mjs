import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/prototype/poses.html');
await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
await p.waitForTimeout(1000);
for (const [r, y, z] of JSON.parse(process.argv[3])) {
  await p.evaluate(([r, y, z]) => { __cam.rotation.x = r; __cam.position.y = y; __cam.position.z = z; }, [r, y, z]); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/p_${r}_${y}_${z}.jpg`, type: 'jpeg', quality: 60 });
}
await b.close();
