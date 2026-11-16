// Scroll mapping: scroll progress through a segment of the page moves the camera
// from one pose to the next. Only the intro segment exists so far.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSES, setCameraPose } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

const LIFT_VH = 30; // how far the intro lines lift while fading, in % of screen height

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

let introProgress = 0;
let nudge = 0; // small extra progress used by the idle "dip" in intro.js

function applyCamera() {
  const t = clamp01(introProgress + nudge);
  setCameraPose({
    rotX: mix(POSES.intro.rotX, POSES.hero.rotX, t),
    y: mix(POSES.intro.y, POSES.hero.y, t),
  });
}

// Lets intro.js push the camera a little toward the hero pose and back.
export function setCameraNudge(value) {
  nudge = value;
  applyCamera();
}

// One entry per screen. Later screens: add { trigger, from, to, onProgress } here.
const SEGMENTS = [
  {
    trigger: '#intro',
    start: 'top top',
    end: 'bottom top',
    onProgress(progress) {
      introProgress = progress;
      applyCamera();
      const lines = document.getElementById('intro-lines');
      if (lines) {
        // Lines lift and fade over the first 60% of the scroll.
        const t = clamp01(progress / 0.6);
        gsap.set(lines, { yPercent: 0, y: -(window.innerHeight * LIFT_VH / 100) * t, opacity: 1 - t });
      }
    },
  },
];

export function initScroll() {
  // Reduced motion: no scroll-linked animation at all. The page scrolls normally.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  SEGMENTS.forEach((segment) => {
    ScrollTrigger.create({
      trigger: segment.trigger,
      start: segment.start,
      end: segment.end,
      scrub: true,
      onUpdate: (self) => segment.onProgress(self.progress),
      onRefresh: (self) => segment.onProgress(self.progress),
    });
  });
}
