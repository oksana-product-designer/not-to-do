// Throwaway: sample camera height every frame during wheel scrolls; count frozen stretches
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [speed, gap] of [[160, 70], [600, 80], [60, 60]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:5173/');
  await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
  // read camera via the runtime: scene.js keeps it private, so read the Spline app through the canvas owner
  await p.evaluate(() => {
    window.__cy = [];
    const t = () => { const c = window.__camRef; window.__cy.push(c ? Math.round(c.position.y) : null); requestAnimationFrame(t); };
    requestAnimationFrame(t);
  });
  await p.mouse.move(700, 450);
  const t0 = Date.now();
  for (let i = 0; i < 400; i++) {
    await p.mouse.wheel(0, speed); await p.waitForTimeout(gap);
    const done = await p.evaluate(() => scrollY >= document.getElementById('hero').offsetTop && getComputedStyle(document.getElementById('hero-content')).opacity === '1');
    if (done) break;
  }
  await p.waitForTimeout(1500);
  const ys = (await p.evaluate(() => window.__cy)).filter((v) => v !== null);
  // frozen stretch: 12+ consecutive frames (~0.2 s) with no change before the camera reaches its final height
  const finalY = ys.at(-1); let run = 0, worst = 0;
  for (let i = 1; i < ys.length; i++) {
    if (ys[i] === ys[i - 1] && ys[i] !== finalY && ys[i] !== ys[0]) { run++; worst = Math.max(worst, run); } else run = 0;
  }
  console.log(`wheel ${speed}px every ${gap}ms: ${Date.now() - t0} ms to settled hero, longest frozen stretch ${worst} frames, start ${ys[0]} end ${finalY}`, errs);
  await p.close();
}
await b.close();
