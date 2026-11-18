// Screen 2 · Problem: the statement's entrance. Same motion as the hero headline: each word rises
// through its own window, one after another, straightening from a small tilt (hero tokens).
// It is triggered by scroll: it plays when the cloud wipe has cleared, and scrolling back up into
// the wipe resets it so it plays again next time (like the hero). problem.css does the motion.
// The words are already spans inside the heading in the HTML, so it reads as one sentence;
// this file only adds an inner span per word (the part that moves) and the --i order.
// Reduced motion or no JS: shown static.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { holdLengthPx, wipeLengthPx, wipeStages } from './wipe.js';

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
}
