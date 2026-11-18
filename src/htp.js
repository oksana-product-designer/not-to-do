// Screen 3 · How to play. With JS and motion welcome the section is pinned on every screen size (htp.css
// arranges desktop, tablet and phone): three screens of scroll, one per level. The scroll picks the active
// level, fills its progress bar and moves the live app card through its states. Scrubbed, so scrolling back
// up rewinds everything. Level buttons scroll to their level.
// Reduced motion and no JS: the stacked blocks from the HTML, everything in its final state, no movement.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tokenNumber } from './tokens.js';
import { WIPE_SMOOTHING } from './wipe.js';
import { addLanding } from './landing.js';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const TITLE = 'Prototype for usability testing';
const ESTIMATE_HOURS = 3;
const TRACKED_MINUTES = 92; // 1h 32m
const DISTRACTIONS = [['🛒', 'Online shopping'], ['📱', 'Scrolling'], ['🍿', 'Watching Netflix']];
const LANDING = ['🎮', 'Video gaming'];
const spin = gsap.parseEase('power3.out'); // the reel starts fast and slows down as it lands

export function initHtp() {
  const section = document.getElementById('how-to-play');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const levels = Array.from(section.querySelectorAll('.htp__level'));
  const buttons = levels.map((level) => level.querySelector('.htp__level-button'));
  const fills = levels.map((level) => level.querySelector('.htp__progress-fill'));
  section.classList.add('is-pinned');

  // Live card parts
  const card = section.querySelector('.htp-card--live');
  const title = card && card.querySelector('.htp-card__title-text');
  const estimate = card && card.querySelector('.htp-card__estimate');
  const tracked = card && card.querySelector('.htp-card__tracked');
  const instead = card && card.querySelector('.htp-card__instead');
  // Build the reel: an empty slot, the distractions a few times over, then the landing value.
  const turns = Math.round(tokenNumber('--htp-shuffle-turns', 3));
  let reel = null;
  let reelSteps = 0;
  let rowHeight = 0; // one reel row, measured on refresh (not on every scroll frame)
  const measure = () => { rowHeight = reel && reel.firstElementChild ? reel.firstElementChild.offsetHeight : 0; };
  if (instead) {
    const rows = ['<span><span class="htp-card__empty"></span></span>'];
    for (let t = 0; t < turns; t++) DISTRACTIONS.forEach(([icon, text]) => rows.push(`<span><span class="htp-card__icon">${icon}</span> ${text}</span>`));
    rows.push(`<span><span class="htp-card__icon">${LANDING[0]}</span> ${LANDING[1]}</span>`);
    instead.innerHTML = `<span class="htp-card__reel-window"><span class="htp-card__reel">${rows.join('')}</span></span>`;
    reel = instead.querySelector('.htp-card__reel');
    reelSteps = rows.length - 1;
  }
  const typeShare = tokenNumber('--htp-type-share', 0.55);
  const countShare = tokenNumber('--htp-count-share', 0.8);

  let active = -1;
  const setActive = (index) => {
    if (index === active) return;
    active = index;
    levels.forEach((level, i) => {
      level.classList.toggle('is-active', i === index);
      if (i === index) buttons[i].setAttribute('aria-current', 'step');
      else buttons[i].removeAttribute('aria-current');
    });
  };

  const render = (p) => {
    const count = levels.length;
    const x = p * count;
    const index = Math.min(count - 1, Math.floor(x));
    const local = clamp01(x - index);
    setActive(index);
    fills.forEach((fill, i) => {
      const t = i < index ? 1 : i > index ? 0 : local;
      if (fill) fill.style.transform = `scaleX(${t.toFixed(4)})`;
    });
    if (!card) return;
    const share = (i) => (index > i ? 1 : index < i ? 0 : local); // how far through level i the scroll is

    // Level 1.0: the title types itself in, then the estimate ticks up.
    const t1 = share(0);
    const typed = clamp01(t1 / typeShare);
    if (title) title.textContent = TITLE.slice(0, Math.round(typed * TITLE.length));
    card.classList.toggle('is-typing', t1 > 0 && typed < 1);
    if (estimate) estimate.textContent = `${Math.round(clamp01((t1 - typeShare) / (1 - typeShare)) * ESTIMATE_HOURS)}h`;

    // Level 2.0: the Instead reel spins and lands on the last value.
    if (reel) reel.style.transform = `translate3d(0, ${(-spin(share(1)) * reelSteps * rowHeight).toFixed(1)}px, 0)`;

    // Level 3.0: the button is pressed, the tracked time counts up, the card lifts (deeper shadow).
    const t3 = share(2);
    const counted = clamp01(t3 / countShare);
    card.classList.toggle('is-pressed', t3 > 0);
    card.style.setProperty('--htp-glow', counted.toFixed(3));
    if (tracked) {
      const minutes = Math.round(counted * TRACKED_MINUTES);
      tracked.textContent = `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: WIPE_SMOOTHING,
    invalidateOnRefresh: true,
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => { measure(); render(self.progress); },
  });
  // The live card's HTML holds the final state (for no-JS); from here it starts at the first level.
  if (card) card.classList.remove('htp-card--level-3');
  // The pinned section is taller than the stacked one: let every scroll trigger set up before it re-measure.
  ScrollTrigger.refresh();
  measure();
  render(trigger.progress);

  // Entrance (pinned layout): plays when the section is in place (its stage pinned at the top), resets when the reader scrolls back
  // up into Problem, so it plays again (htp.css does the motion). The title's words get a window each
  // for the signature word rise; the text inside the heading stays the same, so it reads as before.
  const heading = section.querySelector('.htp__title');
  if (heading) {
    const words = heading.textContent.trim().split(/\s+/);
    heading.innerHTML = words.map((w, i) => `<span class="htp__word word-window"><span style="--i: ${i}">${w}</span></span>`).join(' ');
  }
  section.classList.add('is-entrance-ready');
  ScrollTrigger.create({
    trigger: section,
    start: 'top 2px', // the section is in place (pinned): play there
    onEnter: () => section.classList.add('is-entered'),
    onLeaveBack: () => section.classList.remove('is-entered'),
    onRefresh: (self) => { if (self.progress > 0) section.classList.add('is-entered'); },
  });

  // Landing (landing.js): How to play is a resting point when it is in place (pinned layout only).
  addLanding({
    at: () => trigger.start,
    range: () => trigger.end - trigger.start,
    active: () => section.classList.contains('is-pinned'),
  });

  // Level buttons: go to the start of that level's share of the pinned scroll.
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => {
      const top = trigger.start + (trigger.end - trigger.start) * ((i + 0.02) / levels.length);
      window.scrollTo({ top });
    });
  });
}
