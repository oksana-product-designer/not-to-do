// Throwaway: flings the wheel through the intro; records lines, scroll and camera height
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const vis = "[...document.querySelectorAll('.intro__part')].filter((e) => +getComputedStyle(e).opacity > 0.5).map((e) => e.textContent).join('|') || '-'";
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = []; p.on('pageerror', (e) => logs.push(e.message));
await p.goto('http://127.0.0.1:5173/');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
await p.mouse.move(700, 450);
const seen = []; const t0 = Date.now(); let heroAt = null; const frames = [];
for (let i = 0; i < 160 && heroAt === null; i++) {
  await p.mouse.wheel(0, 600); await p.waitForTimeout(80);
  const s = await p.evaluate((v) => ({ v: eval(v), y: Math.round(scrollY), hero: document.getElementById('hero').offsetTop }), vis);
  frames.push(s.y);
  if (seen.at(-1)?.v !== s.v) seen.push({ v: s.v, y: s.y, t: Date.now() - t0 });
  if (s.y >= s.hero) heroAt = Date.now() - t0;
}
console.log('lines:', JSON.stringify(seen));
console.log('hero reached after ms:', heroAt);
console.log('scroll positions (first 12):', frames.slice(0, 12).join(' '));
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(500);
await p.mouse.wheel(0, 300); await p.waitForTimeout(150);
const shotA = await p.screenshot(); await p.mouse.wheel(0, 700); await p.waitForTimeout(700);
const shotB = await p.screenshot();
console.log('camera moved during first line (screens differ):', shotA.length !== shotB.length, 'scrollY', await p.evaluate(() => Math.round(scrollY)));
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(500);
await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
console.log('skip intro:', await p.evaluate(() => [Math.round(scrollY), document.getElementById('hero').offsetTop]), logs);
await b.close();
