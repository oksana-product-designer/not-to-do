// Throwaway: phone state at the end of the Problem reveal.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await p.goto(process.argv[2] + '#hero'); await p.waitForTimeout(8500);
const info = await p.evaluate(() => ({ act: document.getElementById('act').offsetTop, actH: document.getElementById('act').offsetHeight, htpTop: document.getElementById('how-to-play').getBoundingClientRect().top + scrollY, docH: document.documentElement.scrollHeight, vh: innerHeight }));
console.log(info);
const y = info.act + info.vh * (0.6 + 2 + 1.2);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(2600);
console.log(await p.evaluate(() => ({ y: scrollY, root: document.documentElement.className, nav: document.getElementById('nav').className, problemVis: getComputedStyle(document.getElementById('problem')).visibility, stageTop: Math.round(document.querySelector('.act__stage').getBoundingClientRect().top), htpTop: Math.round(document.getElementById('how-to-play').getBoundingClientRect().top), htpPinned: document.getElementById('how-to-play').className })));
await p.screenshot({ path: '/tmp/claude-501/phoneend.png' });
await b.close();
