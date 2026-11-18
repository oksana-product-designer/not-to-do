// Throwaway: down to How to play, then swipes up; plus impatient swipes during a transition.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(process.argv[2]);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000); await p.mouse.move(700, 450);
for (let i = 0; i < 64; i++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(90); }
await p.waitForTimeout(5000);
const swipe = async (dir) => { for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, dir * Math.round(220 * Math.pow(0.86, i))); await p.waitForTimeout(16); } };
const y = () => p.evaluate(() => Math.round(scrollY));
await swipe(1); await p.waitForTimeout(3000); console.log('down 1 (hero):', await y());
// impatient: swipe, then two more swipes during the transition
const t0 = Date.now(); await swipe(1);
const track = [];
for (let k = 0; k < 14; k++) { await p.waitForTimeout(250); track.push(await y()); if (k === 2 || k === 5) await swipe(1); }
console.log('down 2 with impatient swipes during it, every 250 ms:', track.join(' '));
await p.waitForTimeout(2000); console.log('rest (should be Problem 7281):', await y());
await swipe(1); await p.waitForTimeout(3500); console.log('down 3 (How to play 8100):', await y());
await swipe(1); await p.waitForTimeout(2500); console.log('down 4 (inside levels):', await y());
await swipe(-1); await p.waitForTimeout(3500); console.log('up 1:', await y());
await swipe(-1); await p.waitForTimeout(3500); console.log('up 2:', await y());
await swipe(-1); await p.waitForTimeout(3500); console.log('up 3:', await y());
await swipe(-1); await p.waitForTimeout(3500); console.log('up 4:', await y());
console.log(JSON.stringify(await p.evaluate(() => window.__autoplay)));
await b.close();
