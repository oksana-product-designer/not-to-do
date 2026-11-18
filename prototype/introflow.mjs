// Throwaway: one long continuous scroll gesture through the intro, logging where the page goes.
import { chromium } from 'playwright';
const [URL, PACE = '40'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(URL);
await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4000);
await p.mouse.move(700, 450);
const act = await p.evaluate(() => document.getElementById('act').offsetTop);
console.log('hero (act) top', act, 'intro height', await p.evaluate(() => document.getElementById('intro').offsetHeight));
const t0 = Date.now();
let shot = 0;
for (let i = 0; i < 260; i++) {
  await p.mouse.wheel(0, Number(PACE)); await p.waitForTimeout(30);
  if (i % 20 === 0) {
    const s = await p.evaluate(() => ({ y: Math.round(scrollY), root: document.documentElement.className.replace('js ', ''), hero: document.getElementById('hero').className.replace('hero ', '') }));
    console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(s));
  }
}
await p.waitForTimeout(3000);
console.log('end', JSON.stringify(await p.evaluate(() => ({ y: Math.round(scrollY), root: document.documentElement.className, hero: document.getElementById('hero').className }))));
await p.screenshot({ path: '/tmp/claude-501/introflow-end.png' });
await b.close();
