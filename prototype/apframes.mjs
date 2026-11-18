// Throwaway: frames while the transitions autoplay.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2]);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000); await p.mouse.move(700, 450);
for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); }
await p.waitForTimeout(5000);
const swipe = async () => { for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(16); } };
await swipe(); await p.waitForTimeout(3000);
await swipe(); const t0 = Date.now();
for (const ms of [500, 1000, 1500, 2000, 2600, 3500]) { const w = ms - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); await p.screenshot({ path: `design/screenshots/autoplay-wipe-${ms}ms.png` }); }
await p.waitForTimeout(1500);
await swipe(); const t1 = Date.now();
for (const ms of [600, 1200, 1800, 2600, 3600]) { const w = ms - (Date.now() - t1); if (w > 0) await p.waitForTimeout(w); await p.screenshot({ path: `design/screenshots/autoplay-handover-${ms}ms.png` }); }
await b.close();
