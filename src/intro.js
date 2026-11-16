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

  // Intro text: one part at a time, revealed when its stretch of the intro reaches the middle of the screen.
  // The intro is split into one invisible "step" per part. An IntersectionObserver watches a thin
  // line across the middle of the screen; whichever step crosses it decides the visible part.
  // The reveal itself is a CSS animation (intro.css) and replays every time a part comes back.
  const intro = document.getElementById('intro');
  const parts = Array.from(document.querySelectorAll('.intro__part'));
  if (intro && parts.length && !reduced) {
    let current = -1;
    const showPart = (index) => {
      if (index === current) return;
      parts.forEach((part, i) => {
        part.classList.toggle('is-out', i === current);
        part.classList.toggle('is-in', i === index);
      });
      current = index;
    };
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) showPart(Number(entry.target.dataset.part));
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    parts.forEach((part, i) => {
      const step = document.createElement('div');
      step.className = 'intro__step';
      step.dataset.part = String(i);
      step.style.top = `${(100 / parts.length) * i}%`;
      step.style.height = `${100 / parts.length}%`;
      step.setAttribute('aria-hidden', 'true');
      intro.appendChild(step);
      stepObserver.observe(step);
    });
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

  // First scroll: hide the hint and call off the dip. Reduced motion keeps the hint.
  const onFirstScroll = () => {
    if (window.scrollY < 2) return;
    window.removeEventListener('scroll', onFirstScroll);
    cancelDip();
    if (hint && !reduced) hint.classList.add('is-hidden');
  };
  window.addEventListener('scroll', onFirstScroll, { passive: true });
  if (returning && hint && !reduced) hint.classList.add('is-hidden');
}
