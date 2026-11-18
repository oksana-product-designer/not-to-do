// Throwaway: computed type for every text role on the page, desktop and phone.
import { chromium } from 'playwright';
const b = await chromium.launch();
const SEL = [
  ['intro part (staged)', '.intro__part'], ['intro hint', '.intro__hint .scroll-cue__inner'], ['skip intro', '.skip-intro'],
  ['nav wordmark', '.nav__wordmark'], ['nav link', '.nav__links .nav__link'], ['nav login', '.nav__login'], ['nav CTA', '.nav__cta'], ['menu button', '.nav__menu-button'], ['menu panel link', '.nav__panel .nav__link'],
  ['hero H1', '.hero__title'], ['hero sub', '.hero__sub'], ['hero button', '.hero__actions .button'], ['hero text link', '.hero__actions .text-link'], ['hero cue', '.hero__cue .scroll-cue__inner'],
  ['problem line 1', '.problem__line'], ['problem line 2', '.problem__line--muted'],
  ['htp H2', '.htp__title'], ['htp sub', '.htp__sub'], ['step title', '.htp__level-title'], ['step text', '.htp__level-text'],
  ['card title', '.htp-card--live .htp-card__title, .htp-card--mini .htp-card__title'], ['card pill', '.htp-card__pill'], ['card label', '.htp-card__label'], ['card value', '.htp-card__value'], ['card tracked', '.htp-card__tracked'], ['card tracked label', '.htp-card__tracked-label'], ['card button', '.htp-card__button'],
];
for (const [w, h, phone] of [[1440, 900, false], [390, 844, true]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true } : {}) })).newPage();
  await p.goto('http://localhost:5173/not-to-do/'); await p.waitForTimeout(2500);
  const rows = await p.evaluate((SEL) => SEL.map(([name, sel]) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length) || document.querySelector(sel);
    if (!el) return `${name}: missing`;
    const c = getComputedStyle(el);
    const fs = parseFloat(c.fontSize); const lh = c.lineHeight === 'normal' ? 'normal' : (parseFloat(c.lineHeight) / fs).toFixed(2);
    const fam = c.fontFamily.split(',')[0].replace(/"/g, '');
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const r = el.getBoundingClientRect(); const lines = c.lineHeight === 'normal' ? 1 : Math.max(1, Math.round(r.height / parseFloat(c.lineHeight)));
    return `${name}: ${fam} ${fs}px w${c.fontWeight} lh ${lh} ls ${c.letterSpacing} ${c.textTransform !== 'none' ? c.textTransform : ''} align ${c.textAlign} | ${lines} line(s), ~${Math.round(text.length / lines)} chars/line`;
  }), SEL);
  console.log(`== ${w}x${h}`); rows.forEach((r) => console.log(r));
  await p.close();
}
await b.close();
