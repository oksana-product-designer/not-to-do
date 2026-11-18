// Hero entrance. This file splits the headline into words and decides when the entrance plays;
// hero.css does the motion. Order: the header slides down, then each headline word rises through
// its own window, then sub, buttons and scroll cue settle in, one step apart.
//
// When it plays:
// - The intro hands over (the reader scrolled ahead while the last lines finished): it waits
//   --delay-hero-in so the hills land first, background before text.
// - The reader scrolls to the hero: it starts once the act is half way up the screen (as when half the
//   headline block was on screen; the content itself is already in its place then, see is-arriving).
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

  const hero = content.closest('.hero') || content;
  const nav = document.getElementById('nav');
  hero.style.setProperty('--words', words.length);
  hero.classList.add('is-hero-ready'); // from here on, the hidden "before" state applies
  // The header is part of this entrance: until it plays, the header waits (nav.css), even if
  // intro.js already says it may show. play() releases it with its delay for step 3.
  root.classList.add('is-hero-pending');

  let played = false;
  let visible = false;
  let handedOver = false; // the intro was lingering: wait for the hills
  let doneTimer = null;
  let navTimer = null;

  const play = (delayMs) => {
    if (played) return;
    played = true;
    const stagger = tokenMs('--stagger-hero-word', 80);
    const step = tokenMs('--stagger-hero-step', 120);
    // Order: the header first, then (one step later) the headline words, sub, buttons and scroll cue.
    const textStart = delayMs + step;
    const lastWord = textStart + (words.length - 1) * stagger; // when the last headline word starts
    hero.style.setProperty('--hero-delay', `${textStart}ms`);
    // intro.js still decides whether the header shows; this only times its slide-down for this entrance.
    if (nav) {
      nav.style.setProperty('--nav-delay', `${delayMs}ms`);
      clearTimeout(navTimer);
      navTimer = setTimeout(() => nav.style.removeProperty('--nav-delay'), delayMs + tokenMs('--duration-nav', 700));
    }
    void hero.offsetWidth; // commit the hidden state so the transition has somewhere to start
    hero.classList.add('is-hero-in');
    root.classList.remove('is-hero-pending');
    const wordsEnd = lastWord + tokenMs('--duration-hero-word', 1100);
    const itemsEnd = lastWord + 3 * step + tokenMs('--duration-hero-item', 800);
    clearTimeout(doneTimer);
    doneTimer = setTimeout(() => hero.classList.add('is-hero-done'), Math.max(wordsEnd, itemsEnd));
  };
  playFn = play;

  const reset = () => {
    if (!played) return;
    played = false;
    clearTimeout(doneTimer);
    hero.classList.remove('is-hero-in', 'is-hero-done');
    root.classList.add('is-hero-pending');
  };

  const check = () => {
    if (root.classList.contains('is-intro-lingering')) { handedOver = true; return; }
    if (!visible) return;
    play(handedOver ? tokenMs('--delay-hero-in', 2000) : tokenMs('--delay-hero-in-scroll', 120));
    handedOver = false;
  };

  // Appears in place. During the move from the intro the act (hero and Problem) rises from the bottom of the
  // screen. Its stage is fixed to the screen in its final place for that stretch (wipe.css: is-arriving), so the
  // hero's content appears where it stays instead of sliding up. When the act reaches the top, the stage is
  // pinned there as usual (same spot, no jump). The entrance timing is unchanged: it starts when the act is
  // half way up, the moment the headline block used to be half on screen.
  const act = document.getElementById('act');
  let arriving = null;
  let frame = 0;
  const place = () => {
    frame = 0;
    if (!act) return;
    const top = act.getBoundingClientRect().top;
    const vh = window.innerHeight;
    const isArriving = top > 0 && top < vh;
    if (isArriving !== arriving) { arriving = isArriving; act.classList.toggle('is-arriving', isArriving); }
    const near = top <= vh * 0.5;
    if (near !== visible) { visible = near; check(); }
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(place); }, { passive: true });
  window.addEventListener('resize', place);
  place();

  new IntersectionObserver(([entry]) => {
    // Fully below the screen again (reader went back up into the intro): ready to replay.
    if (!entry.isIntersecting && entry.boundingClientRect.top > 0) reset();
    // Already past the hero (for example opened at a section link): count it as played,
    // so the header is not held back.
    if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) play(0);
    check();
  }, { threshold: [0, 0.5] }).observe(content);

  new MutationObserver(check).observe(root, { attributes: true, attributeFilter: ['class'] });
}
