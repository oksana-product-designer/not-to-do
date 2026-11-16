import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, '1440x900'], [390, 844, '390x844']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://127.0.0.1:5173/design/tokens-preview.html');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `design/screenshots/tokens-preview-${tag}.png`, fullPage: true });
}
await b.close();
