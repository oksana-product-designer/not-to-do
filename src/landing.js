// Landings: resting points where a downward scroll stops, so a section cannot be scrolled past by mistake.
// The same behavior for every section (hero, Problem, How to play):
// - a scroll gesture (wheel, touch, keys) that crosses the resting point from above is put back exactly on it;
//   the page's own scrolling (an in-page link, Tab, the scrollbar) is never caught;
// - a downward scroll that starts while the page sits exactly on the resting point waits too, unless the
//   reader has already rested there (sitOn can veto, for example while the intro still holds the page);
// - downward scrolling is then ignored until the section is ready to be seen (ready, for example the hero's
//   entrance has played; at most --duration-landing-wait), then for at least --duration-landing-min, and for as
//   long as that same gesture (trackpad momentum) keeps arriving, but never longer than --duration-landing-max;
// - after that, the next scroll moves on. It lands again once the page has moved away from the point.
// Scrolling up is never blocked. Not used with reduced motion (nothing is pinned then).
import { tokenMs } from './tokens.js';

const SCROLL_KEYS = [' ', 'PageDown', 'ArrowDown', 'End'];
const INPUT_KEYS = [...SCROLL_KEYS, 'PageUp', 'ArrowUp', 'Home'];

export function addLanding({ at, range, sitOn = () => true, active = () => true, ready = () => true }) {
  const minMs = () => tokenMs('--duration-landing-min', 1000);
  const maxMs = () => tokenMs('--duration-landing-max', 3000);
  const quietMs = () => tokenMs('--duration-landing-quiet', 220);
  const takeoverMs = () => tokenMs('--duration-landing-input', 400);
  const waitMs = () => tokenMs('--duration-landing-wait', 8000);
  let lastY = window.scrollY;
  let lastInput = 0;
  let landed = false;
  let settled = false;
  let landedAt = 0;
  let readyAt = 0; // when the section became ready during this landing (the hold counts from then)
  let quiet = null;

  const release = () => { landed = false; settled = true; };
  // Has the section become ready? Starts the hold's clock the first time it is (or gives up waiting).
  const isReady = (now) => {
    if (!readyAt && (ready() || now - landedAt >= waitMs())) readyAt = now;
    return readyAt > 0;
  };
  const tryRelease = () => {
    clearTimeout(quiet);
    const now = performance.now();
    if (!isReady(now)) { quiet = setTimeout(tryRelease, quietMs()); return; }
    const left = minMs() - (now - readyAt);
    if (left <= 0) { release(); return; }
    quiet = setTimeout(tryRelease, left);
  };
  const land = () => { landed = true; landedAt = performance.now(); readyAt = 0; tryRelease(); };
  const gesture = () => { // more scroll input: wait for it to pause before letting go
    clearTimeout(quiet);
    const now = performance.now();
    if (isReady(now) && now - readyAt >= maxMs()) { release(); return; }
    quiet = setTimeout(tryRelease, quietMs());
  };

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const stop = at();
    const byReader = performance.now() - lastInput < takeoverMs();
    if (byReader && active() && sitOn() && !landed && !settled && lastY < stop - 1 && y > stop + 1 && y < stop + range()) {
      window.scrollTo({ top: stop, behavior: 'instant' });
      land();
    }
    if (Math.abs(window.scrollY - stop) > 2) settled = false; // moved away: the next arrival lands again
    lastY = window.scrollY;
  }, { passive: true });

  // A downward scroll intent. Returns true when it must be ignored.
  const wantsDown = () => {
    lastInput = performance.now();
    if (!landed && !settled && active() && Math.abs(window.scrollY - at()) <= 2 && sitOn()) land();
    if (!landed) return false;
    gesture();
    return landed;
  };
  window.addEventListener('wheel', (event) => {
    lastInput = performance.now();
    if (event.deltaY > 0 && wantsDown()) event.preventDefault();
  }, { passive: false });
  let touchY = null;
  window.addEventListener('touchstart', (event) => { touchY = event.touches[0].clientY; lastInput = performance.now(); }, { passive: true });
  window.addEventListener('touchmove', (event) => {
    lastInput = performance.now();
    if (touchY === null) return;
    const down = touchY - event.touches[0].clientY > 0; // finger moving up = page scrolling down
    if (down && wantsDown()) event.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (INPUT_KEYS.includes(event.key)) lastInput = performance.now();
    if (SCROLL_KEYS.includes(event.key) && wantsDown()) event.preventDefault();
  });
  return { holding: () => landed };
}
