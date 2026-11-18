// Throwaway: hero screenshot on a given build, opened at #hero and settled.
import { chromium } from 'playwright';
const [URL, TAG] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
for (const [size, opts] of [['1440x900', { viewport: { width: 1440, height: 900 } }], ['390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const p = await (await b.newContext(opts)).newPage();
  await p.goto(URL + '#hero');
  if (!opts.isMobile) await p.waitForFunction(() => document.getElementById('scene').classList.contains('is-loaded'), null, { timeout: 60000 });
  await p.waitForTimeout(8500);
  await p.screenshot({ path: `design/screenshots/hero-${size}-${TAG}.png` });
}
await b.close();
