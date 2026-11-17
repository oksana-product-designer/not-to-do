// Cloud wipe between the hero and Problem. wipe.css sets up the layers; this file moves them
// with the scroll. scroll.js moves the 3D camera along the same stretch, with the same curve and the
// same trailing, so the clouds in front (CSS) and behind (3D) travel as one.
//
// Storyboard by wipe progress (the stage boundaries are tokens):
//   0 to cover-start: cloud tops rise from below the hills; the hero text fades from fade-start
//   cover-start to full: the bank rolls up over the hero until the whole screen is cloud
//   full to break: a beat of nothing (Problem is put in place under the cover)
//   break to 1: the cover breaks up and sinks off the bottom; Problem shows on a pale sky
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
    };
  }
  return stages;
}
// Scroll lengths in pixels (the tokens are in vh).
const vhToken = (name, fallback) => (tokenNumber(name, fallback) / 100) * window.innerHeight;
export const wipeLengthPx = () => vhToken('--length-wipe-scroll', 150);
export const revealLengthPx = () => vhToken('--length-problem-reveal', 120);

// The two looser cloud layers: how far ahead/behind the bank they roll in (in wipe progress),
// and how fast they sink away compared with it.
const LAYER = { lead: 0.04, backRate: 0.8, frontRate: 1.25 };

// Same trailing as the camera segments in scroll.js.
export const WIPE_SMOOTHING = 0.5;

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
  const bank = act.querySelector('.wipe__bank');
  const body = act.querySelector('.wipe__body');
  const back = act.querySelector('.wipe__layer--back');
  const front = act.querySelector('.wipe__layer--front');
  if (!stage || !bank) return;

  const S = wipeStages();
  const place = (el, y) => { if (el) el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`; };

  let heroInert = null;
  let problemInert = null;
  let uncovered = null;
  const render = (p) => {
    const vh = window.innerHeight;
    const edge = (tokenNumber('--size-wipe-edge', 45) / 100) * vh;
    const below = vh;               // bank top just under the screen
    const peek = vh * 0.72;         // cloud tops over the hills
    const covered = -edge * 0.6;    // solid body over the whole screen
    const gone = vh * 1.05;         // top edge sunk off the bottom

    const bankAt = (q) => {
      if (q <= 0) return below;
      if (q < S.cover) return mix(below, peek, wipeEase(q / S.cover));
      if (q < S.full) return mix(peek, covered, wipeEase(between(q, S.cover, S.full)));
      if (q < S.brk) return covered;
      return mix(covered, gone, wipeEase(between(q, S.brk, 1)));
    };
    const y = bankAt(p);
    place(bank, y);
    // The looser layers give the cloud depth. Rolling in, the one behind runs slightly ahead of the bank
    // and the one in front slightly behind it (all start below the screen, so the hero is untouched at 0).
    // Sinking away, the one behind travels slower and the one in front faster, so the cloud pulls apart.
    const layerAt = (lead, rate) => (p < S.brk ? bankAt(p + lead) : covered + (y - covered) * rate);
    place(back, layerAt(LAYER.lead, LAYER.backRate));
    place(front, layerAt(-LAYER.lead, LAYER.frontRate));
    // Breaking up: the solid body thins out early in the exit, so Problem shows between the puffs.
    if (body) body.style.opacity = (1 - between(p, S.brk, S.brk + 0.2)).toFixed(3);
    if (back) back.style.opacity = (1 - between(p, 0.75, 1)).toFixed(3);

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
    start: 'top top',
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
}

// Reduced motion: no pin and no clouds. When Problem's top crosses the middle of the screen
// (either way), a cloud-white veil fades in and out once, a 0.4 s crossfade. Opacity only.
function initVeil(problem) {
  const veil = document.querySelector('.act__veil');
  if (!veil || !veil.animate) return;
  let last = null;
  new IntersectionObserver(([entry]) => {
    const past = entry.boundingClientRect.top < window.innerHeight / 2;
    if (last !== null && past !== last) {
      veil.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
        duration: tokenMs('--duration-crossfade', 400),
        easing: 'ease-in-out',
      });
    }
    last = past;
  }, { rootMargin: '-50% 0px -50% 0px' }).observe(problem);
}
