// Throwaway: load the production preview under the /not-to-do/ base and check it renders
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const failed = []; p.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://127.0.0.1:4173/not-to-do/');
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const img = document.querySelector('.scene__fallback');
  return { imgLoaded: img.complete && img.naturalWidth > 0, imgSrc: img.currentSrc, sceneLoaded: document.getElementById('scene').classList.contains('is-loaded'), styled: getComputedStyle(document.body).fontFamily };
});
await p.screenshot({ path: 'design/screenshots/pages-preview-1440x900.png' });
console.log(JSON.stringify(r), 'failed requests:', failed, errs);
await b.close();
