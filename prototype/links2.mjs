// Throwaway: every How to play link from the hero must reach How to play (not stop on Problem).
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [name, sel] of [['header', '.nav__links a[href="#how-to-play"]'], ['hero link', '#hero .text-link'], ['scroll cue', '.hero__cue']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(process.argv[2] + '#hero');
  await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(8500);
  await p.click(sel); await p.waitForTimeout(6000);
  console.log(name, JSON.stringify(await p.evaluate(() => ({ sectionTop: Math.round(document.getElementById('how-to-play').getBoundingClientRect().top), current: document.querySelector('.nav__links [aria-current]')?.textContent || null }))));
  await p.close();
}
await b.close();
