// Throwaway: path B. Scroll faster than the intro lines (the intro holds the page at the hero), stop,
// wait until the hero has fully appeared, then ONE swipe: it should start the wipe.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2]);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000); await p.mouse.move(700, 450);
for (let i = 0; i < 50; i++) { await p.mouse.wheel(0, 140); await p.waitForTimeout(25); } // fast: reach the hero before the lines are done
const s1 = await p.evaluate(() => ({ y: Math.round(scrollY), held: document.documentElement.classList.contains('is-scroll-held') }));
console.log('after fast scroll', JSON.stringify(s1));
await p.waitForFunction(() => document.getElementById('hero').classList.contains('is-hero-done'), null, { timeout: 15000 });
await p.waitForTimeout(1500);
console.log('hero fully appeared, scrollY', await p.evaluate(() => Math.round(scrollY)));
for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, Math.round(220 * Math.pow(0.86, i))); await p.waitForTimeout(16); }
await p.waitForTimeout(1200);
const y = await p.evaluate(() => Math.round(scrollY));
console.log('one swipe ->', y, y > 4862 ? 'WIPE STARTED (good)' : 'SWALLOWED (needs a second swipe)');
await b.close();
