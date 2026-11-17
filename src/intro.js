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
  // Each part owns a quarter of the intro. When the scroll reaches a new part, the part is
  // revealed and scrolling is locked until the reveal has finished, so no part can be skipped.
  // Scrolling back up never locks. "Skip intro" bypasses the lock.
  const intro = document.getElementById('intro');
  const parts = Array.from(document.querySelectorAll('.intro__part'));
  if (intro && parts.length && !reduced) {
    const ms = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
    const LOCK_MS = ms('--delay-part-in') + ms('--duration-part-in') + ms('--duration-part-hold');
    const TOP_PX = 8; // closer to the top than this counts as "not scrolled yet"
    const last = parts.length - 1;

    let shown = -1;      // part on screen now (-1 = none, the label shows)
    let locked = false;
    let lockY = 0;       // where the page is held while locked
    let bypass = false;  // true while "Skip intro" is carrying the reader to the hero

    const stepHeight = () => intro.offsetHeight / parts.length;
    const partAt = (y) => (y < TOP_PX ? -1 : Math.min(last, Math.floor((y + window.innerHeight / 2) / stepHeight())));
    const startOf = (index) => Math.max(TOP_PX, Math.ceil(index * stepHeight() - window.innerHeight / 2)) + 1;
    const jumpTo = (y) => window.scrollTo({ top: y, behavior: 'instant' });

    const render = (index) => {
      parts.forEach((part, i) => {
        part.classList.toggle('is-out', i === shown && i !== index);
        part.classList.toggle('is-in', i === index);
      });
      if (hint) hint.classList.toggle('is-hidden', index !== -1);
      shown = index;
    };

    const unlock = () => {
      locked = false;
      root.classList.remove('is-scroll-locked');
      readScroll();
    };
    const lock = (y) => {
      locked = true;
      lockY = y;
      root.classList.add('is-scroll-locked');
      setTimeout(unlock, LOCK_MS);
    };

    function readScroll() {
      const y = window.scrollY;
      if (y >= intro.offsetHeight) {
        // The intro has left the screen (hero reached, or a return visit): rest on the last part.
        bypass = false;
        if (shown !== last) render(last);
        return;
      }
      if (bypass) return;
      if (locked) {
        if (Math.abs(y - lockY) > 1) jumpTo(lockY); // hold the page where it was
        return;
      }
      const wanted = partAt(y);
      if (wanted === shown) return;
      if (wanted < shown) { render(wanted); return; } // going back up: no lock
      // Going down: only ever one part forward. A big jump is pulled back to the next part.
      const next = shown + 1;
      const holdAt = wanted > next ? startOf(next) : y;
      if (holdAt !== y) jumpTo(holdAt);
      render(next);
      lock(holdAt);
    }

    window.addEventListener('scroll', readScroll, { passive: true });

    // While locked, swallow the inputs that scroll the page. Tab and everything else still work.
    const SCROLL_KEYS = [' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'End', 'Home'];
    const block = (event) => { if (locked) event.preventDefault(); };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', (event) => { if (locked && SCROLL_KEYS.includes(event.key)) event.preventDefault(); });

    // "Skip intro" must always get through.
    const skip = document.querySelector('.skip-intro');
    if (skip) {
      skip.addEventListener('click', () => {
        bypass = true;
        locked = false;
        root.classList.remove('is-scroll-locked');
      });
    }

    readScroll();

    // Clicking the label does what it says: scrolls a little, which starts the first part.
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
