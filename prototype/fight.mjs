import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/prototype/index.html');
await p.waitForFunction(() => window.__proto && window.__proto.ready);
await p.waitForTimeout(1000);
// 1. set camera to level and sample over the next frames
const r = await p.evaluate(async () => {
  const out = [];
  __proto.setP(1); out.push(['right after set', __proto.getCam().rotX, __proto.getCam().y]);
  for (let i = 1; i <= 3; i++) { await new Promise(requestAnimationFrame); out.push(['frame ' + i, __proto.getCam().rotX, __proto.getCam().y]); }
  return out;
});
console.log(JSON.stringify(r));
// 2. pointer parallax: move pointer, sample camera x/rotY each frame
await p.mouse.move(50, 50); await p.mouse.move(1400, 850, { steps: 15 }); await p.waitForTimeout(1500);
console.log('after pointer', JSON.stringify(await p.evaluate(() => __proto.getCam())));
await b.close();
