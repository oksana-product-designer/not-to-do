// Throwaway: scroll into the hero; time the clouds->hills move and the headline; screenshot during it
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [label, step] of [['normal', 160], ['fast', 600]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:5173/');
  await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
  await p.waitForTimeout(2800);
  await p.evaluate(() => {
    window.__log = []; const t0 = performance.now();
    const tick = () => { const c = window.__camRef; window.__log.push([Math.round(performance.now() - t0), c ? Math.round(c.position.y) : null, +getComputedStyle(document.getElementById('hero-content')).opacity]); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await p.mouse.move(700, 450);
  let n = 0, started = false;
  for (let i = 0; i < 160; i++) {
    if (i < 60) await p.mouse.wheel(0, step);
    await p.waitForTimeout(70);
    const y = await p.evaluate(() => window.__camRef ? window.__camRef.position.y : 9999);
    if (!started && y < 2850) started = true;
    if (started && label === 'fast' && n < 5 && i % 6 === 0) { await p.screenshot({ path: `design/screenshots/transition-1440x900-${n}.png`, scale: 'css' }); n++; }
    if (started && Math.abs(y - 226) < 5 && i > 60) break;
  }
  await p.waitForTimeout(1500);
  const log = await p.evaluate(() => window.__log);
  const start = log.find((r) => r[1] !== null && r[1] < 2850);
  const end = log.find((r) => start && r[0] > start[0] && Math.abs(r[1] - 226) <= 5);
  const heroStart = log.find((r) => start && r[0] > start[0] - 3000 && r[2] > 0.05 && r[2] < 1);
  const heroIn = log.find((r) => start && r[0] > start[0] - 3000 && r[2] > 0.95);
  console.log(`${label}: camera clouds->hills ${end[0] - start[0]} ms | headline starts ${heroStart ? heroStart[0] - start[0] : '?'} ms, fully in ${heroIn ? heroIn[0] - start[0] : '?'} ms (relative to the camera leaving the clouds)`);
  await p.close();
}
await b.close();
