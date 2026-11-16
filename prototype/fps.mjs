import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (let run = 0; run < 3; run++) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:5173/');
  await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
  await p.waitForTimeout(2500);
  const total = await p.evaluate(() => document.getElementById('hero').offsetTop);
  await p.evaluate(() => { window.__f = []; let l = performance.now(); const t = (n) => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t); });
  for (let i = 1; i <= 150; i++) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), (total * i) / 150); await p.waitForTimeout(33); }
  const fr = await p.evaluate(() => window.__f.slice(2));
  const slow = fr.filter((x) => x > 33.4).map((x) => Math.round(x));
  console.log('run', run, 'avg fps', (1000 / (fr.reduce((a, c) => a + c, 0) / fr.length)).toFixed(1), 'slow frames', slow);
  if (run === 0) { await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(1500);
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), total * 0.3); await p.waitForTimeout(520);
    await p.screenshot({ path: 'design/screenshots/intro-1440x900-5-mid-swap.png' }); }
  await p.close();
}
await b.close();
