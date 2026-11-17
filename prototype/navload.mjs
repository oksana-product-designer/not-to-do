// Throwaway: is the header visible in the first second after opening the page?
import { chromium } from 'playwright';
const URL = process.argv[2] || 'http://localhost:5173/not-to-do/';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const samples = [];
p.on('domcontentloaded', () => {});
await p.goto(URL, { waitUntil: 'commit' });
const t0 = Date.now();
for (let i = 0; i < 40; i++) {
  const s = await p.evaluate(() => { const n = document.getElementById('nav'); if (!n) return 'no nav yet'; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return `vis=${cs.visibility} op=${(+cs.opacity).toFixed(2)} top=${Math.round(r.top)} h=${Math.round(r.height)}`; }).catch(() => 'loading');
  samples.push(`${Date.now() - t0}ms ${s}`);
  if (i === 2 || i === 6) await p.screenshot({ path: `prototype/navload-${i}.png`, clip: { x: 0, y: 0, width: 1440, height: 200 } });
  await p.waitForTimeout(25);
}
console.log(URL); console.log([...new Set(samples.map((s) => s.replace(/^\d+ms /, '')))].join('\n'));
await b.close();
