// Throwaway: captures the scene at the intro pose for public/images/scene-fallback.jpg
// Uses the real page with the text hidden. Usage: node prototype/fallback.mjs out.png
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1600, height: 1150 } });
await p.goto('http://127.0.0.1:5173/');
await p.addStyleTag({ content: 'main, .skip-intro, .scene__fallback { visibility: hidden !important; }' });
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
await p.waitForTimeout(1500);
// Top 1000px only: leaves out the "Built with Spline" badge in the bottom right corner.
await p.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 1600, height: 1000 } });
await b.close();
