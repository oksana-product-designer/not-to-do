import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (let i = 0; i < 3; i++) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = []; p.on('console', m => logs.push(m.text())); p.on('pageerror', e => logs.push('ERR ' + e.message));
  await p.goto('http://127.0.0.1:5173/prototype/index.html');
  await p.waitForTimeout(6000);
  console.log(i, await p.evaluate(() => document.getElementById('hud').textContent), logs.filter(l => !l.includes('vite')).slice(0, 4));
  await p.close();
}
await b.close();
