// Scroll mapping: scroll progress through a segment of the page moves the camera
// from one pose to the next. Only the intro segments exist so far.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSES, setCameraPose, setFallbackShift } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

// One entry per stretch of scroll. Later screens add entries here.
const SEGMENTS = [
  // Intro, pinned: the camera sinks through the clouds while the four parts take turns.
  { trigger: '#intro', start: 'top top', end: 'bottom bottom', from: POSES.introStart, to: POSES.introEnd, onProgress: showIntroPart },
  // Intro scrolls away: the camera pulls back, the clouds fly off and the full scene with the hills appears.
  { trigger: '#intro', start: 'bottom bottom', end: 'bottom top', from: POSES.introEnd, to: POSES.hero },
];
const progress = SEGMENTS.map(() => 0);
let nudge = 0; // small extra progress used by the idle "dip" in intro.js

// Cursor tracking at the hero: the camera leans a little toward the pointer.
// Same amounts the Spline file used before the site took over the camera.
const TRACK = { slide: 120, lift: 30, tilt: 0.021, turn: 0.044, ease: 0.05 };
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }; // -1..1 from the screen center
let tracking = false;

function trackPointer() {
  pointer.x += (pointer.targetX - pointer.x) * TRACK.ease;
  pointer.y += (pointer.targetY - pointer.y) * TRACK.ease;
  applyCamera();
  const settled = Math.abs(pointer.targetX - pointer.x) < 0.001 && Math.abs(pointer.targetY - pointer.y) < 0.001;
  // Stop the loop when the camera has caught up or the hero is not on screen.
  if (settled || progress[1] === 0) { tracking = false; return; }
  requestAnimationFrame(trackPointer);
}

function onPointerMove(event) {
  if (event.pointerType === 'touch') return;
  pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  if (!tracking && progress[1] > 0) { tracking = true; requestAnimationFrame(trackPointer); }
}

function applyCamera() {
  // The last segment that has started decides the pose.
  let index = 0;
  progress.forEach((value, i) => { if (value > 0) index = i; });
  const segment = SEGMENTS[index];
  const t = clamp01(progress[index] + (index === 0 ? nudge : 0));
  // Cursor tracking fades in as the hero arrives (0 during the intro, full at the hero).
  const follow = progress[1];
  setCameraPose({
    rotX: mix(segment.from.rotX, segment.to.rotX, t) - pointer.y * TRACK.tilt * follow,
    y: mix(segment.from.y, segment.to.y, t) - pointer.y * TRACK.lift * follow,
    z: mix(segment.from.z, segment.to.z, t),
    dx: pointer.x * TRACK.slide * follow,
    rotY: -pointer.x * TRACK.turn * follow,
  });
  // The static image slides the same way, for phones and before the scene has loaded.
  setFallbackShift(clamp01((progress[0] * 2.8 + progress[1]) / 3.8)); // weighted by scroll length
}

// Lets intro.js push the camera a little along its path and back.
export function setCameraNudge(value) {
  nudge = value;
  applyCamera();
}

// Intro text: four parts, one visible at a time. CSS does the animation (intro.css);
// this only says which part is active, which are already passed and which still wait.
let activePart = -1;
function showIntroPart(t) {
  const parts = document.querySelectorAll('.intro__part');
  const index = Math.min(parts.length - 1, Math.floor(t * parts.length));
  if (index === activePart) return;
  activePart = index;
  parts.forEach((part, i) => {
    part.classList.toggle('is-active', i === index);
    part.classList.toggle('is-before', i < index);
  });
}

export function initScroll() {
  // Reduced motion: no scroll-linked animation at all. The page scrolls normally.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Two frames later, so part 1 eases in instead of just being there.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    SEGMENTS.forEach((segment, i) => {
      const update = (self) => {
        progress[i] = self.progress;
        if (segment.onProgress) segment.onProgress(self.progress);
        applyCamera();
      };
      ScrollTrigger.create({ trigger: segment.trigger, start: segment.start, end: segment.end, scrub: true, onUpdate: update, onRefresh: update });
    });
  }));
}
