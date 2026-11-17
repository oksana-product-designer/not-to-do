// Intro screen behavior. This file decides which text part shows; intro.css animates it.
// This file handles: hiding the hint on first scroll, the one-time idle dip,
// remembering that the intro was seen, and what changes once the hero is reached.
import { tokenMs } from './tokens.js';
import gsap from 'gsap';
import { setCameraNudge } from './scroll.js';
import { peekHero } from './hero.js';

const IDLE_MS = 6000;      // wait this long without scrolling before the dip
const DIP_AMOUNT = 0.06;   // how far the camera moves along its intro path (0 to 1)
const PEEK_PX = 56;        // how much of the hero headline shows above the bottom edge

export function initIntro() {
  const root = document.documentElement;
  const hint = document.getElementById('intro-hint');
  const hero = document.getElementById('hero');
  const heroContent = document.getElementById('hero-content');
  const nav = document.getElementById('nav');
  if (!hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Intro text. Nothing shows at the very top except the "Scroll" label.
  // Scrolling is never locked: the camera and clouds follow the scroll as usual.
  // Only the text is locked into a sequence: lines play strictly in order, and each one
  // stays for its full reveal plus a short rest before the next may replace it.
  // If the reader reaches the end of the intro before the last line has played,
  // the page waits there (the pinned intro stays on screen) until the lines catch up.
  // Scrolling back up is free. "Skip intro" bypasses everything.
  const intro = document.getElementById('intro');
  const parts = Array.from(document.querySelectorAll('.intro__part'));
  if (intro && parts.length && !reduced) {
    const ms = (name) => tokenMs(name);
    const LINE_MS = ms('--delay-part-in') + ms('--duration-part-in') + ms('--duration-part-hold');
    const TOP_PX = 8; // closer to the top than this counts as "not scrolled yet"
    // The lines share the first 75% of the pinned scroll. The last 25% is runway for the
    // final line, so at a normal pace it has finished before the intro ends and nothing stalls.
    const LINES_SPAN = 0.75;
    const last = parts.length - 1;

    let shown = -1;     // line on screen now (-1 = none, the label shows)
    let target = -1;    // line the scroll position asks for
    let freeAt = 0;     // time when the line on screen may be replaced
    let timer = null;
    let bypass = false; // true while "Skip intro" carries the reader to the hero
    let holding = false;

    const hold = () => {
      if (holding) return;
      holding = true;
      root.classList.add('is-scroll-held');
    };
    const release = () => {
      if (holding) {
        holding = false;
        root.classList.remove('is-scroll-held');
      }
      // Lines done: if the text is still lingering past the intro, fade it out, then let it go
      // and show the hero. The fade stops the text jumping as it returns to its normal place.
      if (sequenceDone()) announce(true);
      if (lingering && sequenceDone() && !root.classList.contains('is-intro-leaving')) {
        root.classList.add('is-intro-leaving');
        setTimeout(() => linger(false), ms('--duration-fast'));
      }
    };
    let lingering = false;
    const linger = (on) => {
      if (on === lingering) return;
      lingering = on;
      root.classList.toggle('is-intro-lingering', on);
      if (on) root.classList.remove('is-intro-leaving');
    };
    // While held, swallow the inputs that scroll the page. Tab and everything else still work.
    const SCROLL_KEYS = [' ', 'PageDown', 'ArrowDown', 'End'];
    const block = (event) => { if (holding && (event.deltaY === undefined || event.deltaY > 0)) event.preventDefault(); };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', (event) => { if (holding) event.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', (event) => { if (holding && SCROLL_KEYS.includes(event.key)) event.preventDefault(); });

    const exitY = () => intro.offsetHeight - window.innerHeight; // last scroll position with the intro pinned
    const partAt = (y) => (y < TOP_PX ? -1 : Math.min(last, Math.floor((y / Math.max(1, exitY() * LINES_SPAN)) * parts.length)));
    const sequenceDone = () => shown === last && performance.now() >= freeAt;

    // Tell scroll.js whether the lines are done, so the hills only appear for the hero.
    let announced = null;
    const announce = (done, instant = false) => {
      if (done === announced) return;
      announced = done;
      window.dispatchEvent(new CustomEvent('intro:lines', { detail: { done, instant } }));
    };

    const render = (index) => {
      // Tell scroll.js which line is up, so the camera keeps an even pace with the lines.
      window.dispatchEvent(new CustomEvent('intro:line', { detail: { index, count: parts.length, ms: LINE_MS } }));
      parts.forEach((part, i) => {
        part.classList.toggle('is-out', i === shown && i !== index);
        part.classList.toggle('is-in', i === index);
      });
      if (hint) hint.classList.toggle('is-hidden', index !== -1);
      shown = index;
    };

    const advance = () => {
      clearTimeout(timer);
      const now = performance.now();
      if (target < shown) { linger(false); release(); announce(false); render(target); freeAt = now + LINE_MS; return; } // back up: straight there
      if (target === shown) {
        if (shown === last) {
          if (now < freeAt) timer = setTimeout(advance, freeAt - now);
          else release();
        }
        return;
      }
      if (now < freeAt) { timer = setTimeout(advance, freeAt - now); return; }
      render(shown + 1); // forward: one line at a time, never a jump
      freeAt = now + LINE_MS;
      timer = setTimeout(advance, LINE_MS);
    };

    const readScroll = () => {
      const y = window.scrollY;
      if (bypass) {
        if (y >= intro.offsetHeight) { bypass = false; render(last); freeAt = 0; announce(true); }
        return;
      }
      // Past the pinned intro with lines still to play: the scroll carries on, so the camera
      // keeps moving and the clouds fly off, but the text stays on screen (lingering) and the
      // hero headline waits until the last line has had its time.
      // Only if the reader reaches the hero itself before that does the page hold, briefly.
      const gate = exitY();
      const pending = !sequenceDone();
      if (y <= gate) root.classList.remove('is-intro-leaving'); // back inside the intro: text visible again
      linger(y > gate && pending);
      if (y >= intro.offsetHeight - 1 && pending) {
        if (y > intro.offsetHeight) window.scrollTo({ top: intro.offsetHeight, behavior: 'instant' });
        hold();
      }
      if (!pending) release();
      announce(!pending);
      target = y > gate ? last : partAt(y);
      advance();
    };

    window.addEventListener('scroll', readScroll, { passive: true });

    // "Skip intro" must always get through.
    const skip = document.querySelector('.skip-intro');
    if (skip) skip.addEventListener('click', () => { bypass = true; clearTimeout(timer); release(); linger(false); announce(true); });

    // Arriving below the intro (a link to #hero): the lines count as played.
    if (window.scrollY >= intro.offsetHeight) {
      render(last);
      freeAt = 0;
      announce(true, true);
    }
    readScroll();

    // Clicking the label does what it says: scrolls a little, which starts the first line.
    if (hint) {
      hint.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
      });
    }
  }

  // Hero reached: show the nav, hide "Skip intro".
  const observer = new IntersectionObserver(([entry]) => {
    const past = entry.isIntersecting;
    root.classList.toggle('is-past-intro', past);
    if (nav) { nav.inert = !past; nav.classList.toggle('is-shown', past); } // nav.css decides how it appears
  }, { threshold: 0.6 });
  observer.observe(hero);

  // One-time idle dip: camera eases toward the hero and the headline peeks in from below.
  let dip = null;
  let idleTimer = null;
  const state = { nudge: 0, lift: 0 };
  const applyDip = () => {
    setCameraNudge(state.nudge);
    if (heroContent) gsap.set(heroContent, { y: -state.lift });
  };
  const playDip = () => {
    if (!heroContent) return;
    const title = heroContent.querySelector('h1');
    const gap = (title || heroContent).getBoundingClientRect().top - window.innerHeight;
    peekHero(); // the headline rises into the peek
    dip = gsap.timeline({ onUpdate: applyDip })
      .to(state, { nudge: DIP_AMOUNT, lift: Math.max(0, gap + PEEK_PX), duration: 0.6, ease: 'power2.inOut' })
      .to(state, { nudge: 0, lift: 0, duration: 0.6, ease: 'power2.inOut' }, '+=0.5');
  };
  const cancelDip = () => {
    clearTimeout(idleTimer);
    if (dip && dip.isActive()) {
      dip.kill();
      gsap.to(state, { nudge: 0, lift: 0, duration: 0.25, ease: 'power2.out', onUpdate: applyDip });
    }
  };
  if (!reduced && window.scrollY === 0) {
    idleTimer = setTimeout(playDip, IDLE_MS);
  }

  // First scroll: call off the dip.
  const onFirstScroll = () => {
    if (window.scrollY < 2) return;
    window.removeEventListener('scroll', onFirstScroll);
    cancelDip();
  };
  window.addEventListener('scroll', onFirstScroll, { passive: true });
}
