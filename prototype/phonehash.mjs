// Throwaway: what happens on a phone opened at #hero (scroll position and hero classes over time).
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await p.goto(process.argv[2] + '#hero');
for (const t of [300, 1500, 3000, 4500, 7000]) {
  await p.waitForTimeout(t - (t > 300 ? [300,1500,3000,4500,7000][[300,1500,3000,4500,7000].indexOf(t)-1] : 0));
  console.log(t, await p.evaluate(() => ({ y: Math.round(scrollY), act: document.getElementById('act')?.offsetTop ?? document.getElementById('hero').offsetTop, hero: document.getElementById('hero').className, root: document.documentElement.className })));
}
await b.close();
