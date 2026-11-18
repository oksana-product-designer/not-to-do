// Autoplayed transitions. Between resting points (stops) the page does not follow the scroll: a swipe at a stop
// starts the transition to the next stop (or the previous one, scrolling up), and the page plays it at its own
// pace by moving the scroll position itself, so every scroll-tied effect (clouds, camera, Problem's exit) plays
// exactly as designed, at a steady speed, whatever the strength of the swipe. While it plays, scroll input is
// ignored; on arrival the page rests for at least --duration-landing-min (longer while the same gesture's
// momentum keeps coming, at most --duration-landing-max), then the next swipe moves on.
// Entering a transition stretch some other way with a scroll gesture (for example scrolling up out of
// How to play) also hands over to the autoplay, in the direction of travel. Links, Tab and the scrollbar are free.
// Not used with reduced motion.
import gsap from 'gsap';
import { tokenMs } from './tokens.js';

const QUIET_MS = 220;     // no input for this long = the gesture has paused (rest extension)
const SAME_GESTURE_MS = 600; // input closer together than this belongs to the same swipe (with its momentum)
const TAKEOVER_MS = 400;  // a scroll this soon after wheel/touch/key input counts as the reader's own
const UP_KEYS = ['PageUp', 'ArrowUp', 'Home'];
const DOWN_KEYS = [' ', 'PageDown', 'ArrowDown', 'End'];
const ease = 'power1.inOut'; // gentle start, gentle landing (it moves between two places)

export function initAutoplay({ stops, durations, busy = () => false }) {
  const minMs = () => tokenMs('--duration-landing-min', 1000);
  const maxMs = () => tokenMs('--duration-landing-max', 3000);
  let playing = null;
  let lastInput = 0;
  let restFrom = 0;
  let restUntil = 0;
  let lastY = window.scrollY;
  const proxy = { y: 0 };

  const near = (y, s) => Math.abs(y - s) <= 2;
  const stopIndex = (y) => stops.findIndex((s) => near(y, s()));
  const zoneOf = (y) => {
    for (let i = 0; i < stops.length - 1; i++) if (y > stops[i]() + 2 && y < stops[i + 1]() - 2) return i;
    return -1;
  };

  const go = (target, ms) => {
    proxy.y = window.scrollY;
    playing = gsap.to(proxy, {
      y: target,
      duration: Math.max(0.3, ms / 1000),
      ease,
      onUpdate: () => window.scrollTo({ top: proxy.y, behavior: 'instant' }),
      onComplete: () => {
        playing = null;
        restFrom = performance.now();
        restUntil = restFrom + minMs();
        lastY = window.scrollY;
      },
    });
  };

  // A scroll intent (+1 down, -1 up). Returns true when the page handles it (the browser must not scroll).
  let swallowFrom = 0; // the current swipe began while a transition played or rested: ignore it to its end
  const intent = (dir) => {
    const now = performance.now();
    const sameGesture = now - lastInput < SAME_GESTURE_MS;
    lastInput = now;
    if (swallowFrom && sameGesture && now - swallowFrom < maxMs() + tokenMs('--duration-autoplay-wipe', 2600)) return true;
    swallowFrom = 0;
    if (playing || now < restUntil) { swallowFrom = now; return true; } // playing or resting: ignore this swipe
    if (busy()) return false; // another hold (the hero landing) has it
    const i = stopIndex(window.scrollY);
    if (i < 0) return false;
    if (dir > 0 && i < stops.length - 1) { go(stops[i + 1](), durations[i]()); return true; }
    if (dir < 0 && i > 0) { go(stops[i - 1](), durations[i - 1]()); return true; }
    return false;
  };

  window.addEventListener('wheel', (event) => {
    if (event.deltaY && intent(Math.sign(event.deltaY))) event.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    const dir = DOWN_KEYS.includes(event.key) ? 1 : UP_KEYS.includes(event.key) ? -1 : 0;
    if (dir && intent(dir)) event.preventDefault();
  });
  let touchY = null;
  window.addEventListener('touchstart', (event) => { touchY = event.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (event) => {
    if (touchY === null) return;
    const dy = touchY - event.touches[0].clientY;
    if (Math.abs(dy) < 8) return;
    if (intent(Math.sign(dy))) event.preventDefault();
  }, { passive: false });

  // A scroll gesture that lands inside a transition stretch (not at a stop) hands over to the autoplay.
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!playing && performance.now() - lastInput < TAKEOVER_MS && !busy()) {
      const z = zoneOf(y);
      if (z >= 0) {
        const down = y > lastY;
        const from = stops[z]();
        const to = stops[z + 1]();
        const left = down ? (to - y) / (to - from) : (y - from) / (to - from);
        go(down ? to : from, durations[z]() * Math.max(0.3, left));
      }
    }
    lastY = y;
  }, { passive: true });
}
