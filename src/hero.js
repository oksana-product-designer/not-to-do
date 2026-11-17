// Hero entrance. This file splits the headline into words and decides when the entrance plays;
// hero.css does the motion (each word rises through its own window, then the button settles in).
//
// When it plays:
// - The intro hands over (the reader scrolled ahead while the last lines finished): it waits
//   --delay-hero-in so the hills land first, background before text.
// - The reader scrolls to the hero: it starts once half the headline block is on screen.
// - The idle dip: the headline peeks in from below, so the peek shows it rising.
// Scrolling back up until the block is below the screen resets it, so it plays again next time,
// the same way the intro lines replay.
import { tokenMs } from './tokens.js';

let playFn = () => {};

// Called by the idle dip in intro.js.
export function peekHero() { playFn(0); }

export function initHero() {
  const root = document.documentElement;
  const content = document.getElementById('hero-content');
  const title = content && content.querySelector('.hero__title');
  if (!content || !title) return;

  // Split the headline into words. Screen readers get the whole sentence from aria-label.
  const text = title.textContent.trim();
  const words = text.split(/\s+/);
  title.setAttribute('aria-label', text);
  title.textContent = '';
  words.forEach((word, i) => {
    const frame = document.createElement('span');
    frame.className = 'hero__word';
    frame.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.setProperty('--i', i);
    frame.appendChild(inner);
    title.appendChild(frame);
    if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // static, fully visible

  content.style.setProperty('--words', words.length);
  content.classList.add('is-hero-ready'); // from here on, the hidden "before" state applies

  let played = false;
  let visible = false;
  let handedOver = false; // the intro was lingering: wait for the hills
  let doneTimer = null;

  const play = (delayMs) => {
    if (played) return;
    played = true;
    content.style.setProperty('--hero-delay', `${delayMs}ms`);
    void content.offsetWidth; // commit the hidden state so the transition has somewhere to start
    content.classList.add('is-hero-in');
    const words = Number(content.style.getPropertyValue('--words'));
    const stagger = tokenMs('--stagger-hero-word', 80);
    const wordsEnd = (words - 1) * stagger + tokenMs('--duration-hero-word', 1100);
    const ctaEnd = words * stagger + tokenMs('--delay-hero-cta', 450) + tokenMs('--duration-hero-cta', 800);
    clearTimeout(doneTimer);
    doneTimer = setTimeout(() => content.classList.add('is-hero-done'), delayMs + Math.max(wordsEnd, ctaEnd));
  };
  playFn = play;

  const reset = () => {
    if (!played) return;
    played = false;
    clearTimeout(doneTimer);
    content.classList.remove('is-hero-in', 'is-hero-done');
  };

  const check = () => {
    if (root.classList.contains('is-intro-lingering')) { handedOver = true; return; }
    if (!visible) return;
    play(handedOver ? tokenMs('--delay-hero-in', 2000) : tokenMs('--delay-hero-in-scroll', 120));
    handedOver = false;
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= 0.5;
    // Fully below the screen again (reader went back up into the intro): ready to replay.
    if (!entry.isIntersecting && entry.boundingClientRect.top > 0) reset();
    check();
  }, { threshold: [0, 0.5] }).observe(content);

  new MutationObserver(check).observe(root, { attributes: true, attributeFilter: ['class'] });
}
