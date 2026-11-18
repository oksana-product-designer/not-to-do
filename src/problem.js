// Screen 2 · Problem: the statement's entrance. Same motion as the hero headline: each word rises
// through its own window, one after another, straightening from a small tilt (hero tokens).
// It is triggered by scroll: it plays when the cloud wipe has cleared, and scrolling back up into
// the wipe resets it so it plays again next time (like the hero). problem.css does the motion.
// The words are already spans inside the heading in the HTML, so it reads as one sentence;
// this file only adds an inner span per word (the part that moves) and the --i order.
// On the way out (after a short read, scrubbed and reversible): the words drift up and fade one after another,
// and with the 3D scene the white behind them dissolves into the real sky (wipe.css reads --problem-fade).
// Reduced motion or no JS: shown static.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tokenNumber } from './tokens.js';
import { holdLengthPx, wipeLengthPx, revealLengthPx, wipeStages, WIPE_SMOOTHING } from './wipe.js';

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const leave = gsap.parseEase('sine.in'); // exits accelerate away, gently (ease-in)

export function initProblem() {
  const act = document.getElementById('act');
  const problem = document.getElementById('problem');
  if (!act || !problem) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = Array.from(problem.querySelectorAll('.problem__word'));
  words.forEach((word, i) => {
    const inner = document.createElement('span');
    inner.textContent = word.textContent;
    word.textContent = '';
    word.appendChild(inner);
    word.style.setProperty('--i', i);
  });
  problem.classList.add('is-words-ready'); // from here on, the hidden "before" state applies

  const play = () => {
    void problem.offsetWidth; // commit the hidden state so the transition has somewhere to start
    problem.classList.add('is-words-in');
  };
  const reset = () => problem.classList.remove('is-words-in');

  // Plays once the wipe's veil has cleared the screen (the "clear" stage boundary).
  ScrollTrigger.create({
    trigger: act,
    start: () => `top+=${holdLengthPx() + wipeLengthPx() * wipeStages().clear} top`,
    onEnter: play,
    onLeaveBack: reset,
    onRefresh: (self) => { if (self.progress > 0) play(); },
  });

  // Exit: the last part of the Problem pin. Words leave first word first, a little apart.
  const exitStart = tokenNumber('--problem-exit-start', 0.4);
  const shift = tokenNumber('--shift-problem-exit', 40);
  const SPREAD = 0.6; // share of the exit over which the word departures are spread
  let exiting = false;
  const exit = (p) => {
    const e = clamp01((p - exitStart) / (1 - exitStart));
    if (e === 0 && !exiting) return;
    exiting = e > 0;
    words.forEach((word, i) => {
      const t = leave(clamp01((e - (i / words.length) * SPREAD) / (1 - SPREAD)));
      word.style.transform = t ? `translate3d(0, ${(-t * shift).toFixed(1)}px, 0)` : '';
      word.style.opacity = t ? (1 - t).toFixed(3) : '';
    });
    problem.style.setProperty('--problem-fade', e.toFixed(3));
  };
  ScrollTrigger.create({
    trigger: act,
    start: () => `top+=${holdLengthPx() + wipeLengthPx()} top`,
    end: () => `+=${revealLengthPx()}`,
    scrub: WIPE_SMOOTHING,
    invalidateOnRefresh: true,
    onUpdate: (self) => exit(self.progress),
    onRefresh: (self) => exit(self.progress),
  });
}
