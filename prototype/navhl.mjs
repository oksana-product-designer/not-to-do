import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + '#hero');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(8500);
const htp = await p.evaluate(() => document.getElementById('how-to-play').getBoundingClientRect().top + scrollY);
for (const [name, y] of [['Problem exit, How to play hidden underneath', htp - 300], ['How to play in place', htp + 50]]) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(1500);
  console.log(name, '-> highlighted:', await p.evaluate(() => document.querySelector('.nav__links [aria-current]')?.textContent || 'none'));
}
await b.close();
