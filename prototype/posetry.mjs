// Throwaway: screenshot the live dev scene at given camera poses [rotX, y, z].
import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5173/not-to-do/#hero');
await p.waitForFunction(() => window.__camRef && document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
await p.addStyleTag({ content: 'main, header, .skip-intro { visibility: hidden !important; }' });
await p.waitForTimeout(7000);
for (const [r, y, z] of JSON.parse(process.argv[3])) {
  await p.evaluate(([r, y, z]) => { const c = window.__camRef; c.rotation.x = r; c.position.y = y; c.position.z = z; }, [r, y, z]);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/p_${r}_${y}_${z}.jpg`, type: 'jpeg', quality: 55, scale: 'css' });
}
await b.close();
