// Throwaway: same scripted visit on two URLs; records what happens over time
import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.type() + ': ' + m.text().slice(0, 140)); });
const t0 = Date.now(); const at = () => Date.now() - t0;
await p.goto(url);
const ev = [];
const snap = async () => p.evaluate(() => {
  const r = document.documentElement;
  const part = document.querySelector('.intro__part.is-in');
  const w = document.querySelector('.intro__wisp');
  const fb = document.querySelector('.scene__fallback');
  return {
    opening: r.classList.contains('is-opening'), veil: r.style.getPropertyValue('--opening-veil'),
    loaded: document.getElementById('scene').classList.contains('is-loaded'),
    line: part ? part.textContent : '-', lingering: r.classList.contains('is-intro-lingering'),
    hero: getComputedStyle(document.getElementById('hero-content')).opacity,
    wisp: w ? w.style.transform : '', fb: fb ? fb.style.transform : '', y: Math.round(scrollY),
    css: getComputedStyle(r).getPropertyValue('--duration-part-in').trim(),
  };
});
let last = '';
const record = async (tag) => { const s = await snap(); const k = JSON.stringify({ ...s, wisp: s.wisp ? 'set' : '', fb: s.fb ? 'set' : '', veil: s.veil ? 'v' : '', y: 0 }); if (k !== last) { ev.push(`${at()}ms ${tag} ${JSON.stringify(s)}`); last = k; } };
for (let i = 0; i < 40; i++) { await record('load'); await p.waitForTimeout(100); }
await p.mouse.move(700, 450);
for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, 160); await p.waitForTimeout(70); await record('scroll'); }
for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); await record('after'); }
console.log(ev.join('\n')); console.log('errors:', errs);
await b.close();
