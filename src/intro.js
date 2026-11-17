// Intro screen behavior. This file decides which text part shows; intro.css animates it.
// This file handles: hiding the hint on first scroll, the one-time idle dip,
// remembering that the intro was seen, and what changes once the hero is reached.
import gsap from 'gsap';
import { setCameraNudge } from './scroll.js';

const SEEN_KEY = 'ntd-intro-seen';
const IDLE_MS = 6000;      // wait this long without scrolling before the dip
const DIP_AMOUNT = 0.06;   // how far the camera moves along its intro path (0 to 1)
const PEEK_PX = 56;        // how much of the hero headline shows above the bottom edge

function markSeen() {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* storage blocked: intro plays again next time */ }
}

export function initIntro() {
  const root = document.documentElement;
  const hint = document.getElementById('intro-hint');
  const hero = document.getElementById('hero');
  const heroContent = document.getElementById('hero-content');
  const nav = document.getElementById('nav');
  if (!hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const returning = root.classList.contains('intro-seen');

  // Return visit: start at the hero (unless the browser already restored a scroll position or a link target).
  if (returning && window.scrollY === 0 && !window.location.hash) {
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, hero.offsetTop);
    root.style.scrollBehavior = '';
  }

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
    const ms = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
    const LINE_MS = ms('--delay-part-in') + ms('--duration-part-in') + ms('--duration-part-hold');
    const TOP_PX = 8; // closer to the top than this counts as "not scrolled yet"
    const last = parts.length - 1;

    let shown = -1;     // line on screen now (-1 = none, the label shows)
    let target = -1;    // line the scroll position asks for
    let freeAt = 0;     // time when the line on screen may be replaced
    let timer = null;
    let bypass = false; // true while "Skip intro" carries the reader to the hero

    const exitY = () => intro.offsetHeight - window.innerHeight; // last scroll position with the intro pinned
    const partAt = (y) => (y < TOP_PX ? -1 : Math.min(last, Math.floor((y / Math.max(1, exitY())) * parts.length)));
    const sequenceDone = () => shown === last && performance.now() >= freeAt;

    const render = (index) => {
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
      if (target < shown) { render(target); freeAt = now + LINE_MS; return; } // back up: straight there
      if (target === shown) {
        if (shown === last && now < freeAt) timer = setTimeout(advance, freeAt - now); // re-check the exit gate
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
        if (y >= intro.offsetHeight) { bypass = false; render(last); freeAt = 0; }
        return;
      }
      // Exit gate: until every line has played, the page cannot scroll past the pinned intro.
      // Everything before that point scrolls freely, so the camera keeps moving.
      const gate = exitY();
      if (y > gate && !sequenceDone()) {
        window.scrollTo({ top: gate, behavior: 'instant' });
        target = last;
        advance();
        return;
      }
      target = partAt(Math.min(y, gate));
      advance();
    };

    window.addEventListener('scroll', readScroll, { passive: true });

    // "Skip intro" must always get through.
    const skip = document.querySelector('.skip-intro');
    if (skip) skip.addEventListener('click', () => { bypass = true; clearTimeout(timer); });

    // Return visits start at the hero: the lines count as played.
    if (window.scrollY >= intro.offsetHeight || root.classList.contains('intro-seen')) {
      render(last);
      freeAt = 0;
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

  // Hero reached: show the nav, hide "Skip intro", remember the visit.
  const observer = new IntersectionObserver(([entry]) => {
    const past = entry.isIntersecting;
    root.classList.toggle('is-past-intro', past);
    if (nav) nav.hidden = !past;
    if (past) markSeen();
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
  if (!reduced && !returning && window.scrollY === 0) {
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
