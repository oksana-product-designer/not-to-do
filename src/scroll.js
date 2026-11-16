// Scroll mapping: scroll progress through a segment of the page moves the camera
// from one pose to the next. Only the intro segments exist so far.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSES, setCameraPose, setFallbackShift } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

// The move from the clouds to the hero is not a straight line:
// - the camera backs away fast at first, so the clouds rush off, then slows down
// - it lifts its nose early, which keeps the far edge of the ground out of sight
// - it drops with a soft start and a soft landing, so the hills rise in from the bottom at the end
function swoop(from, to, t) {
  const soft = t * t * (3 - 2 * t);
  const fastThenSlow = 1 - Math.pow(1 - t, 3);
  return {
    rotX: mix(from.rotX, to.rotX, fastThenSlow),
    y: mix(from.y, to.y, soft),
    z: mix(from.z, to.z, fastThenSlow),
  };
}
const straight = (from, to, t) => ({ rotX: mix(from.rotX, to.rotX, t), y: mix(from.y, to.y, t), z: mix(from.z, to.z, t) });

// One entry per stretch of scroll. Later screens add entries here.
const SEGMENTS = [
  // Intro, pinned: the camera sinks through the clouds while the four parts take turns.
  { trigger: '#intro', start: 'top top', end: 'bottom bottom', from: POSES.introStart, to: POSES.introEnd },
  // Intro scrolls away: the camera pulls back fast and drops, the clouds fly off and the hills rise into view.
  { trigger: '#intro', start: 'bottom bottom', end: 'bottom top', from: POSES.introEnd, to: POSES.hero, path: swoop },
];
const progress = SEGMENTS.map(() => 0);
let nudge = 0; // small extra progress used by the idle "dip" in intro.js

// Cursor tracking: the camera leans a little toward the pointer, in the intro and at the hero.
// Same amounts the Spline file used before the site took over the camera.
// catchUp: seconds the camera needs to close most of the gap to the pointer.
const TRACK = { slide: 120, lift: 30, tilt: 0.021, turn: 0.044, catchUp: 0.33 };
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }; // -1..1 from the screen center
let tracking = false;
let lastTrack = 0;

function trackPointer(now) {
  // Based on elapsed time, so it feels the same on 60 Hz and 120 Hz screens.
  const dt = Math.min(0.05, (now - lastTrack) / 1000);
  lastTrack = now;
  const step = 1 - Math.exp(-dt / TRACK.catchUp);
  pointer.x += (pointer.targetX - pointer.x) * step;
  pointer.y += (pointer.targetY - pointer.y) * step;
  applyCamera();
  const settled = Math.abs(pointer.targetX - pointer.x) < 0.001 && Math.abs(pointer.targetY - pointer.y) < 0.001;
  // Stop the loop when the camera has caught up.
  if (settled) { tracking = false; return; }
  requestAnimationFrame(trackPointer);
}

function onPointerMove(event) {
  if (event.pointerType === 'touch') return;
  pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  if (!tracking) { tracking = true; lastTrack = performance.now(); requestAnimationFrame(trackPointer); }
}

function applyCamera() {
  // The last segment that has started decides the pose.
  let index = 0;
  progress.forEach((value, i) => { if (value > 0) index = i; });
  const segment = SEGMENTS[index];
  const t = clamp01(progress[index] + (index === 0 ? nudge : 0));
  // Cursor tracking runs through the intro and the hero alike.
  const follow = 1;
  const at = (segment.path || straight)(segment.from, segment.to, t);
  setCameraPose({
    rotX: at.rotX - pointer.y * TRACK.tilt * follow,
    y: at.y - pointer.y * TRACK.lift * follow,
    z: at.z,
    dx: pointer.x * TRACK.slide * follow,
    rotY: -pointer.x * TRACK.turn * follow,
  });
  // The static image slides the same way, for phones and before the scene has loaded.
  setFallbackShift(clamp01((progress[0] * 4.4 + progress[1]) / 5.4)); // weighted by scroll length
}

// Lets intro.js push the camera a little along its path and back.
export function setCameraNudge(value) {
  nudge = value;
  applyCamera();
}

// The camera trails the scrollbar by half a second, which gives it some weight.
const SMOOTHING = 0.5;

export function initScroll() {
  // Reduced motion: no scroll-linked animation at all. The page scrolls normally.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  {
    SEGMENTS.forEach((segment, i) => {
      const update = (self) => {
        progress[i] = self.progress;
        if (segment.onProgress) segment.onProgress(self.progress);
        applyCamera();
      };
      ScrollTrigger.create({ trigger: segment.trigger, start: segment.start, end: segment.end, scrub: SMOOTHING, onUpdate: update, onRefresh: update });
    });
  }
}
