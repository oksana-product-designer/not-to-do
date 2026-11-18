// Cloud wipe between the hero and Problem. The clouds are the real 3D ones: scroll.js flies the camera
// up through the scene's cloud layer. This file moves a soft cloud-white veil in front of the page with
// the same curve and the same trailing, fades the hero, and decides what can be reached.
//
// Storyboard by wipe progress (the stage boundaries are tokens):
//   0 to cover-start: the camera starts climbing toward the clouds; the hero text fades from fade-start
//   cover-start to full: the veil rises with a long soft edge as the camera enters the clouds, until all is white
//   full to break: a beat of white (Problem is put in place under it)
//   break to 1: the veil sinks off the bottom while the camera rises above the clouds; Problem is uncovered top first
// Scrolling back up plays it backwards. Covered content is inert: no clicks, no focus.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tokenMs, tokenNumber } from './tokens.js';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const mix = (a, b, t) => a + (b - a) * t;
const between = (t, a, b) => clamp01((t - a) / (b - a));
// Same curve as the opening fly-out: eases in, eases out (it moves between two places).
export const wipeEase = gsap.parseEase('power2.inOut');

// Stage boundaries and lengths from tokens.css, read once.
let stages = null;
export function wipeStages() {
  if (!stages) {
    stages = {
      fadeStart: tokenNumber('--wipe-fade-start', 0.15),
      fadeEnd: tokenNumber('--wipe-fade-end', 0.4),
      cover: tokenNumber('--wipe-cover-start', 0.25),
      full: tokenNumber('--wipe-full', 0.5),
      brk: tokenNumber('--wipe-break', 0.6),
      clear: tokenNumber('--wipe-clear', 0.85),
    };
  }
  return stages;
}
// Scroll lengths in pixels (the tokens are in vh).
const vhToken = (name, fallback) => (tokenNumber(name, fallback) / 100) * window.innerHeight;
export const holdLengthPx = () => vhToken('--length-hero-hold', 60);
export const wipeLengthPx = () => vhToken('--length-wipe-scroll', 200);
export const revealLengthPx = () => vhToken('--length-problem-reveal', 120);

// Veil, camera and the scroll-tied parts of Problem and How to play trail the scrollbar by 1.5 s,
// so even a quick scroll becomes an unhurried glide (the move from the intro to the hero trails by 1 s).
export const WIPE_SMOOTHING = 1.5;

export function initWipe() {
  const act = document.getElementById('act');
  const hero = document.getElementById('hero');
  const problem = document.getElementById('problem');
  if (!act || !hero || !problem) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initVeil(problem);
    return;
  }

  const stage = act.querySelector('.act__stage');
  const veil = act.querySelector('.wipe__veil');
  if (!stage || !veil) return;

  const S = wipeStages();
  const place = (el, y) => { if (el) el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`; };

  let heroInert = null;
  let problemInert = null;
  let uncovered = null;
  const render = (p) => {
    const vh = window.innerHeight;
    const edge = (tokenNumber('--size-wipe-edge', 60) / 100) * vh;
    const below = vh;      // soft edge just under the screen
    const covered = -edge; // solid part over the whole screen
    let y;
    if (p < S.cover) y = below;
    else if (p < S.full) y = mix(below, covered, wipeEase(between(p, S.cover, S.full)));
    else if (p < S.brk) y = covered;
    else y = mix(covered, below, wipeEase(between(p, S.brk, S.clear)));
    place(veil, y);

    stage.style.setProperty('--wipe-hero', (1 - between(p, S.fadeStart, S.fadeEnd)).toFixed(3));
    stage.style.setProperty('--wipe-sky', between(p, S.full, S.brk).toFixed(3));

    // Reach: the hero goes out of reach once it has faded; Problem is shown only under full cover
    // and becomes reachable when the cover breaks. The header (outside this stage) is never touched.
    const hInert = p >= S.fadeEnd;
    if (hInert !== heroInert) { heroInert = hInert; hero.inert = hInert; }
    const isUncovered = p >= S.full;
    if (isUncovered !== uncovered) { uncovered = isUncovered; problem.classList.toggle('is-uncovered', isUncovered); }
    const pInert = p < S.brk;
    if (pInert !== problemInert) { problemInert = pInert; problem.inert = pInert; }
  };

  ScrollTrigger.create({
    trigger: act,
    // the hero holds still for a moment first, then the wipe starts
    start: () => `top+=${holdLengthPx()} top`,
    end: () => `+=${wipeLengthPx()}`,
    scrub: WIPE_SMOOTHING,
    invalidateOnRefresh: true,
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
  });
  render(0);

  // Links to #hero (wordmark, Skip intro) while the stage is pinned further down: the hero is
  // stuck to the top of the screen, so the browser would not move. Scroll back to the start of the act.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href="#hero"]');
    if (!link || window.scrollY <= act.offsetTop + 1) return;
    event.preventDefault();
    window.scrollTo({ top: act.offsetTop });
  });

  // Landing on the hero. A scroll coming down out of the intro stops at the hero instead of carrying on
  // (with trackpad momentum) through the wipe into Problem. Two cases:
  // - the scroll crosses the hero's top from above: the page is put back exactly on the hero;
  // - the page already sits on the hero (the intro held it there while its last lines played) and the
  //   reader keeps scrolling: the scroll waits.
  // Either way, downward scrolling is ignored until the hero's entrance has finished (is-hero-done, so the
  // hills, headline and buttons have arrived) and the gesture has paused, or at most LANDING.maxMs.
  // Then the next scroll continues into the wipe. Scrolling up, Tab and links are never blocked.
  let lastY = window.scrollY;
  let landed = false;
  let landedAt = 0;
  let quiet = null;
  const heroDone = () => hero.classList.contains('is-hero-done');
  const atHero = () => Math.abs(window.scrollY - act.offsetTop) <= 2;
  const tryRelease = () => {
    clearTimeout(quiet);
    const since = performance.now() - landedAt;
    if (since >= LANDING.maxMs || (since >= LANDING.minMs && heroDone())) { landed = false; return; }
    quiet = setTimeout(tryRelease, LANDING.checkMs);
  };
  const land = () => {
    landed = true;
    landedAt = performance.now();
    tryRelease();
  };
  const gesture = () => { // more scroll input arrived: wait for it to pause before letting go
    clearTimeout(quiet);
    if (performance.now() - landedAt >= LANDING.maxMs) { landed = false; return; } // never longer than maxMs
    quiet = setTimeout(tryRelease, LANDING.quietMs);
  };
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroTop = act.offsetTop;
    if (!landed && lastY < heroTop - 1 && y > heroTop + 1 && y < heroTop + holdLengthPx() + wipeLengthPx()) {
      window.scrollTo({ top: heroTop, behavior: 'instant' });
      land();
    }
    lastY = window.scrollY;
  }, { passive: true });
  const wantsDown = (event) => {
    if (!landed && atHero() && !heroDone()) land(); // sitting on the hero before it has arrived
    if (!landed) return false;
    gesture();
    return landed;
  };
  const SCROLL_KEYS = [' ', 'PageDown', 'ArrowDown', 'End'];
  window.addEventListener('wheel', (event) => { if (event.deltaY > 0 && wantsDown(event)) event.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove', (event) => { if (wantsDown(event)) event.preventDefault(); }, { passive: false });
  window.addEventListener('keydown', (event) => { if (SCROLL_KEYS.includes(event.key) && wantsDown(event)) event.preventDefault(); });
}

// Landing on the hero: the page holds at least minMs, waits for the hero's entrance and a pause in the
// scroll gesture (quietMs), and never longer than maxMs.
const LANDING = { minMs: 600, quietMs: 220, checkMs: 100, maxMs: 5000 };

// Reduced motion: no pin and no clouds. When Problem's top crosses the middle of the screen
// (either way), a cloud-white veil fades in and out once, a 0.4 s crossfade. Opacity only.
function initVeil(problem) {
  const veil = document.querySelector('.act__veil');
  if (!veil || !veil.animate) return;
  let last = null;
  // The observed area is the top half of the screen: Problem enters it when its top crosses the middle.
  new IntersectionObserver(([entry]) => {
    const past = entry.isIntersecting;
    if (last !== null && past !== last) {
      veil.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
        duration: tokenMs('--duration-crossfade', 400),
        easing: 'ease-in-out',
      });
    }
    last = past;
  }, { rootMargin: '0px 0px -50% 0px' }).observe(problem);
}
