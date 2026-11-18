// Scroll mapping: scroll progress through a segment of the page moves the camera
// from one pose to the next. Only the intro segments exist so far.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSES, setCameraPose, setFallbackShift, setFallbackZoom } from './scene.js';
import { tokenMs, tokenNumber } from './tokens.js';
import { wipeStages, wipeEase, holdLengthPx, wipeLengthPx, WIPE_SMOOTHING, TRANSITION_SMOOTHING } from './wipe.js';

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
// While the intro lines are still playing past the end of the intro, the camera stays in
// the clouds: it keeps sinking a little and drifting forward, so the background moves
// but no hills show. heroGate goes 0 -> 1 once the last line is done, and blends this
// cloud path into the swoop above, so the hills only ever appear for the hero.
const IN_CLOUDS = { y: -500, z: -600 }; // extra sink and forward drift over the lingering stretch
const inClouds = (from, t) => ({ rotX: from.rotX, y: from.y + IN_CLOUDS.y * t, z: from.z + IN_CLOUDS.z * t });
const gate = { value: 0 };

// Even pace through the intro: the camera follows the scroll, but never runs ahead of the
// lines. Each line owns an equal share of the descent (1/4 each) and the share it has
// unlocked grows steadily over the time the line is on screen. So:
// - a slow scroll: the camera simply follows the scroll, no pauses
// - a fast scroll: the camera moves at a constant pace with the lines instead of jumping
//   ahead and then freezing while the text catches up
const lineCap = { value: 0 };
window.addEventListener('intro:line', (event) => {
  const { index, count, ms } = event.detail;
  const goal = clamp01((index + 1) / count);
  gsap.killTweensOf(lineCap);
  if (goal <= lineCap.value) {
    // Going back up: no waiting.
    gsap.to(lineCap, { value: goal, duration: 0.3, ease: 'power2.out', onUpdate: applyCamera });
  } else {
    // Linear on purpose: a constant speed reads as one continuous move across all lines.
    gsap.to(lineCap, { value: goal, duration: ms / 1000, ease: 'none', onUpdate: applyCamera });
  }
});
window.addEventListener('intro:lines', (event) => {
  const done = event.detail.done;
  gsap.killTweensOf(gate);
  if (done && event.detail.instant) { gate.value = 1; applyCamera(); return; }
  // Opening the view to the hills: unhurried, but with a strong middle so it still feels like a swoop
  // (power3.inOut: eases away from the clouds, sweeps, then lands softly). Closing (back into the intro): quick.
  const reveal = tokenMs('--duration-hero-reveal', 3200) / 1000;
  gsap.to(gate, { value: done ? 1 : 0, duration: done ? reveal : 0.3, ease: done ? 'power3.inOut' : 'power2.out', onUpdate: applyCamera });
});

const straight = (from, to, t) => ({ rotX: mix(from.rotX, to.rotX, t), y: mix(from.y, to.y, t), z: mix(from.z, to.z, t) });

// Hero to Problem, through the 3D cloud layer (the cloud wipe; wipe.js moves the front veil in step).
// The camera starts climbing at once and reaches the heart of the clouds (the opening's pose) as the
// screen turns fully white, stays there for the beat of white, then rises out above them.
// Climbing in: height leads and distance follows, so the path clears the hills.
function climb(from, to, t) {
  const S = wipeStages();
  const cloud = POSES.opening;
  if (t < S.brk) {
    const a = wipeEase(clamp01(t / S.full));
    return { rotX: mix(from.rotX, cloud.rotX, a), y: mix(from.y, cloud.y, 1 - (1 - a) * (1 - a)), z: mix(from.z, cloud.z, a * a) };
  }
  return straight(cloud, to, wipeEase(clamp01((t - S.brk) / (1 - S.brk))));
}

// Slow, even sink with a soft start and a soft landing (the opening's curve).
const sink = (from, to, t) => straight(from, to, wipeEase(t));

// One entry per stretch of scroll. Later screens add entries here.
const SEGMENTS = [
  // Intro, pinned: the camera sinks through the clouds while the four parts take turns.
  { trigger: '#intro', start: 'top top', end: 'bottom bottom', from: POSES.introStart, to: POSES.introEnd },
  // Intro scrolls away: the camera pulls back fast and drops, the clouds fly off and the hills rise into view.
  // It trails the scrollbar by a full second, so even a quick scroll becomes an unhurried glide.
  { trigger: '#intro', start: 'bottom bottom', end: 'bottom top', from: POSES.introEnd, to: POSES.hero, path: swoop, smoothing: 1 },
  // Cloud wipe: hero to Problem through the cloud layer, after a short hold on the hero. Same length and trailing as the front clouds (wipe.js).
  { trigger: '#act', start: () => `top+=${holdLengthPx()} top`, end: () => `+=${wipeLengthPx()}`, from: POSES.hero, to: POSES.problem, path: climb, smoothing: TRANSITION_SMOOTHING },
  // How to play: while the section is pinned, the camera sinks slowly from the sky into the top of the cloud layer.
  { trigger: '#how-to-play', start: 'top top', end: 'bottom bottom', from: POSES.problem, to: POSES.htp, path: sink, smoothing: WIPE_SMOOTHING },
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
  const introT = Math.min(clamp01(progress[0] + nudge), lineCap.value);
  const t = index === 0 ? introT : clamp01(progress[index]);
  // Cursor tracking runs through the intro and the hero alike.
  const follow = 1;
  let at = (segment.path || straight)(segment.from, segment.to, t);
  if (index === 1 && gate.value < 1) {
    // Still in the clouds: carry on from wherever the even-paced intro descent has got to.
    const cloud = inClouds(straight(POSES.introStart, POSES.introEnd, introT), t);
    at = { rotX: mix(cloud.rotX, at.rotX, gate.value), y: mix(cloud.y, at.y, gate.value), z: mix(cloud.z, at.z, gate.value) };
  }
  if (opening.value < 1) {
    // Opening: start buried in the clouds and blend out to wherever the scroll says.
    const o = opening.value;
    at = { rotX: mix(POSES.opening.rotX, at.rotX, o), y: mix(POSES.opening.y, at.y, o), z: mix(POSES.opening.z, at.z, o) };
  }
  setCameraPose({
    rotX: at.rotX - pointer.y * TRACK.tilt * follow,
    y: at.y - pointer.y * TRACK.lift * follow,
    z: at.z,
    dx: pointer.x * TRACK.slide * follow,
    rotY: -pointer.x * TRACK.turn * follow,
  });
  moveMist(introT + MIST.linger * progress[1] * (1 - gate.value));
  // The static image slides the same way, for phones and before the scene has loaded.
  setFallbackShift(clamp01((introT * 4.4 + progress[1] * gate.value) / 5.4)); // weighted by scroll length; the hills wait for the hero too
}

// Cloud wisps in front of the intro text. Each one rises up through the screen and passes
// the text at a different point of the intro (roughly one per line), so every line is
// veiled for a moment and then clears. They follow the same even pace as the camera.
const MIST = {
  passAt: [0.14, 0.38, 0.62, 0.86], // intro progress at which each wisp crosses the middle
  travel: 170,                      // screen heights (in vh) a wisp rises per whole intro
  linger: 0.35,                     // keeps rising a little while the last lines finish
};
let wisps = null;
function moveMist(t) {
  if (!wisps) wisps = Array.from(document.querySelectorAll('.intro__wisp'));
  wisps.forEach((wisp, i) => {
    const y = (MIST.passAt[i] - t) * MIST.travel;
    wisp.style.transform = `translate3d(0, ${y.toFixed(2)}vh, 0)`;
  });
}

// Opening: on a first visit the page starts inside the clouds and the camera flies out
// to the first view. It starts from rest so the covered view is actually seen, speeds up
// as the clouds part, and lands softly (ease in and out: it moves between two places).
// With the 3D scene the veil just lifts off the real clouds first; without it (phones,
// slow or failed load) the static image zooms out while the veil fades with it.
const opening = { value: document.documentElement.classList.contains('is-opening') ? 0 : 1 };
export function playOpening(sceneShowing) {
  const root = document.documentElement;
  if (!root.classList.contains('is-opening')) return;
  const seconds = tokenMs('--duration-opening', 2000) / 1000;
  const zoom = tokenNumber('--scale-opening-fallback', 1.4);
  const veil = { value: 1 };
  const paint = () => {
    root.style.setProperty('--opening-veil', veil.value.toFixed(3));
    setFallbackZoom(mix(zoom, 1, opening.value));
    applyCamera();
  };
  gsap.timeline({
    onUpdate: paint,
    onComplete: () => {
      root.classList.remove('is-opening');
      root.style.removeProperty('--opening-veil');
      setFallbackZoom(1);
    },
  })
    .to(veil, { value: 0, duration: sceneShowing ? 0.4 : seconds * 0.7, ease: 'power1.out' }, 0)
    .to(opening, { value: 1, duration: seconds, ease: 'power2.inOut' }, sceneShowing ? 0.2 : 0);
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
      ScrollTrigger.create({ trigger: segment.trigger, start: segment.start, end: segment.end, scrub: segment.smoothing || SMOOTHING, onUpdate: update, onRefresh: update });
    });
  }
}
