// Landings: resting points where a downward scroll stops, so a section cannot be scrolled past by mistake.
// The same behavior for every section (hero, Problem, How to play):
// - a scroll that crosses the resting point from above is put back exactly on it;
// - optionally, a scroll that starts while the page already sits there (sitOn) waits too;
// - downward scrolling is then ignored for at least --duration-landing-min, and for as long as that same
//   gesture (trackpad momentum) keeps arriving, but never longer than --duration-landing-max;
// - after that, the next scroll moves on. One landing per arrival: it lands again only after the reader
//   has scrolled back up above the resting point.
// Scrolling up, Tab and links are never blocked. Not used with reduced motion (nothing is pinned then).
import { tokenMs } from './tokens.js';

const QUIET_MS = 220; // no scroll input for this long = the gesture has ended
const CHECK_MS = 100;
const SCROLL_KEYS = [' ', 'PageDown', 'ArrowDown', 'End'];

export function addLanding({ at, range, sitOn = () => false, active = () => true }) {
  const minMs = () => tokenMs('--duration-landing-min', 1000);
  const maxMs = () => tokenMs('--duration-landing-max', 3000);
  let lastY = window.scrollY;
  let landed = false;
  let settled = false;
  let landedAt = 0;
  let quiet = null;

  const release = () => { landed = false; settled = true; };
  const tryRelease = () => {
    clearTimeout(quiet);
    if (performance.now() - landedAt >= minMs()) { release(); return; }
    quiet = setTimeout(tryRelease, CHECK_MS);
  };
  const land = () => { landed = true; landedAt = performance.now(); tryRelease(); };
  const gesture = () => { // more scroll input: wait for it to pause before letting go
    clearTimeout(quiet);
    if (performance.now() - landedAt >= maxMs()) { release(); return; }
    quiet = setTimeout(tryRelease, QUIET_MS);
  };

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const stop = at();
    if (active() && !landed && !settled && lastY < stop - 1 && y > stop + 1 && y < stop + range()) {
      window.scrollTo({ top: stop, behavior: 'instant' });
      land();
    }
    if (y < stop - 1) settled = false; // back above the resting point: the next arrival lands again
    lastY = window.scrollY;
  }, { passive: true });

  const wantsDown = () => {
    if (!landed && !settled && active() && Math.abs(window.scrollY - at()) <= 2 && sitOn()) land();
    if (!landed) return false;
    gesture();
    return landed;
  };
  window.addEventListener('wheel', (event) => { if (event.deltaY > 0 && wantsDown()) event.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove', (event) => { if (wantsDown()) event.preventDefault(); }, { passive: false });
  window.addEventListener('keydown', (event) => { if (SCROLL_KEYS.includes(event.key) && wantsDown()) event.preventDefault(); });
  return { holding: () => landed };
}
