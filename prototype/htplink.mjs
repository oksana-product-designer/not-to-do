// Throwaway: header How to play link lands on the section in place, entrance plays, title clear of the header.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + '#hero');
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
await p.waitForTimeout(8500);
await p.click('.nav__links a[href="#how-to-play"]'); await p.waitForTimeout(6000);
console.log(JSON.stringify(await p.evaluate(() => ({ sectionTop: Math.round(document.getElementById('how-to-play').getBoundingClientRect().top), titleTop: Math.round(document.getElementById('how-to-play-title').getBoundingClientRect().top), navBottom: Math.round(document.querySelector('.nav__pill').getBoundingClientRect().bottom), entered: document.getElementById('how-to-play').classList.contains('is-entered'), current: document.querySelector('.nav [aria-current]')?.textContent }))));
await p.screenshot({ path: 'design/screenshots/htp-1440x900-link-header-inplace.png' });
await b.close();
