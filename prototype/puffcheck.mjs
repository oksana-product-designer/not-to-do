// Throwaway: the intro wisp's computed look on two builds must be identical.
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(url); await p.waitForTimeout(800);
  const s = await p.evaluate(() => [...document.querySelectorAll('.intro__wisp > span')].map((el) => {
    const c = getComputedStyle(el); return [c.backgroundImage, c.width, c.height, c.animationName, c.animationDuration, c.display].join(' | ');
  }));
  console.log(url, '\n ', s.join('\n  '));
}
await b.close();
