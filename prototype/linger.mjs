// Throwaway: normal-pace wheel scroll; does the scroll keep moving through lines 3 and 4?
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const vis = "[...document.querySelectorAll('.intro__part')].filter((e) => +getComputedStyle(e).opacity > 0.5).map((e) => e.textContent).join('|') || '-'";
for (const speed of [120, 400]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:5173/');
  await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'));
  await p.mouse.move(700, 450);
  const rows = []; let stalls = 0; let prev = 0; let shot = false;
  for (let i = 0; i < 80; i++) {
    await p.mouse.wheel(0, speed); await p.waitForTimeout(70);
    const s = await p.evaluate((v) => ({ v: eval(v), y: Math.round(scrollY), heroOp: getComputedStyle(document.getElementById('hero-content')).opacity, lingering: document.documentElement.classList.contains('is-intro-lingering'), held: document.documentElement.classList.contains('is-scroll-held'), hero: document.getElementById('hero').offsetTop }), vis);
    if (s.y === prev && s.y < s.hero) stalls++;
    prev = s.y;
    if (rows.at(-1)?.v !== s.v || rows.at(-1)?.lingering !== s.lingering || rows.at(-1)?.held !== s.held) rows.push(s);
    if (speed === 120 && s.lingering && !shot) { await p.screenshot({ path: 'design/screenshots/intro-1440x900-6-lingering.png' }); shot = true; }
    if (s.y >= s.hero) break;
  }
  await p.waitForTimeout(1500);
  const end = await p.evaluate((v) => ({ v: eval(v), heroOp: getComputedStyle(document.getElementById('hero-content')).opacity, lingering: document.documentElement.classList.contains('is-intro-lingering') }), vis);
  console.log('wheel', speed, 'stalled samples before hero:', stalls);
  rows.forEach((r) => console.log('  ', r.y, r.v, 'linger', r.lingering, 'held', r.held, 'heroOpacity', r.heroOp));
  console.log('   end:', JSON.stringify(end), errs);
  await p.close();
}
await b.close();
