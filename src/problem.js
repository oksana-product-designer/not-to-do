// Screen 2 · Problem: word reveal. The statement's words are already in the HTML (spans inside the
// heading, so it reads as one sentence). After the cloud wipe, scrolling turns each word from faint to
// full in turn. Scrubbed and reversible. Opacity only.
// Reduced motion: nothing to do, everything is fully shown.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tokenNumber } from './tokens.js';
import { holdLengthPx, wipeLengthPx, revealLengthPx, WIPE_SMOOTHING } from './wipe.js';

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const OVERLAP = 2;      // each word takes two word-slots to arrive, so neighbours blend instead of blinking

export function initProblem() {
  const act = document.getElementById('act');
  const problem = document.getElementById('problem');
  if (!act || !problem) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = Array.from(problem.querySelectorAll('.problem__word'));
  problem.classList.add('is-reveal-ready'); // from here on, the faint "before" state applies

  const start = tokenNumber('--opacity-problem-word-start', 0.2);
  const render = (r) => {
    // the words share the whole reveal scroll; the last one lands at the end
    const slots = r * (words.length + 1);
    words.forEach((word, i) => {
      const t = clamp01((slots - i) / OVERLAP);
      word.style.opacity = (start + (1 - start) * t).toFixed(3);
    });
  };

  ScrollTrigger.create({
    trigger: act,
    start: () => `top+=${holdLengthPx() + wipeLengthPx()} top`,
    end: () => `+=${revealLengthPx()}`,
    scrub: WIPE_SMOOTHING,
    invalidateOnRefresh: true,
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
  });
  render(0);
}
