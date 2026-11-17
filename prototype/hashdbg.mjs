// Throwaway: open the page at #hero and report the intro/hero state
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const url of process.argv.slice(2)) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(url + '#hero', { waitUntil: 'domcontentloaded', timeout: 20000 }); await p.waitForTimeout(5000);
  console.log(url, JSON.stringify(await p.evaluate(() => ({ root: document.documentElement.className, hero: (document.querySelector('.hero.is-hero-ready') || document.querySelector('#hero-content')).className, y: scrollY, heroTop: document.getElementById('hero').offsetTop, line: document.querySelector('.intro__part.is-in')?.textContent }))));
}
await b.close();
