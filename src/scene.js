// 3D scene: loads the Spline file behind the page and exposes small helpers.
// The scene is decoration. If anything here fails, the static image stays and the page works.

const SCENE_URL = 'https://prod.spline.design/gy8pOJOY0CmAM2FX/scene.splinecode';

// Objects the site depends on (see CLAUDE.md, "3D scene").
const REQUIRED_OBJECTS = [
  'Hero Camera', 'Hill Back Ridge', 'Hill Far Right', 'Hill Right', 'Hill Mid Left',
  'Hill Front Left', 'Ground', 'Sky Backdrop', 'Directional Light',
];

// Camera poses. rotX is the tilt in radians (0 = level, positive = looking up),
// y is the camera height, z is how far forward it stands (smaller = closer to the clouds).
// Later screens add entries here.
export const POSES = {
  introStart: { rotX: 0, y: 7000, z: 0 },     // close to the clouds, their tops at the bottom edge
  introEnd: { rotX: 0.05, y: 3400, z: 0 },    // sunk into the cloud layer
  hero: { rotX: 0.297, y: 226, z: 3733 },     // pulled back and down: the full scene, hills along the bottom
};

let app = null;
let camera = null;
let pose = { ...POSES.introStart };

// Phones and reduced motion get the static image only.
export function sceneAllowed() {
  const phone = window.matchMedia('(max-width: 767px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !phone && !reduced;
}

// Find an object by its Spline name. Warns and returns null if it is missing.
export function findObject(name) {
  if (!app) return null;
  const obj = app.findObjectByName(name);
  if (!obj) console.warn(`[scene] Object "${name}" not found in the Spline scene.`);
  return obj || null;
}

// Set the camera tilt, height and distance. Safe to call before the scene has loaded:
// the pose is remembered and applied as soon as the camera exists.
export function setCameraPose(next) {
  pose = { ...pose, ...next };
  if (!camera) return;
  camera.rotation.x = pose.rotX;
  camera.position.y = pose.y;
  camera.position.z = pose.z;
}

// Slide the static image up as the page scrolls (0 = start, 1 = fully slid).
// It is taller than the screen, so this only ever shows more of its lower part.
export function setFallbackShift(t) {
  const image = document.querySelector('.scene__fallback');
  if (!image) return;
  const spare = image.offsetHeight - window.innerHeight;
  image.style.transform = `translate3d(0, ${-Math.max(0, spare) * t}px, 0)`;
}

// Load the scene. Resolves true if it is showing, false if the page stays on the image.
export async function initScene() {
  const wrap = document.getElementById('scene');
  const canvas = document.getElementById('scene-canvas');
  if (!wrap || !canvas || !sceneAllowed()) return false;

  try {
    const { Application } = await import('@splinetool/runtime');
    app = new Application(canvas);
    await app.load(SCENE_URL);

    const found = REQUIRED_OBJECTS.map((name) => findObject(name));
    if (found.every((obj) => obj === null)) {
      // Nothing usable came back (for example: the export needs WebGPU and this browser has none).
      throw new Error('scene loaded without any of the expected objects');
    }

    camera = found[0];
    setCameraPose(pose);

    // The runtime adds an iframe for the scene's own script. Keep it out of the Tab order.
    wrap.querySelectorAll('iframe').forEach((frame) => {
      frame.setAttribute('tabindex', '-1');
      frame.setAttribute('aria-hidden', 'true');
    });

    // Wait two frames so the first image of the scene is drawn, then crossfade.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    wrap.classList.add('is-loaded');
    return true;
  } catch (error) {
    console.warn('[scene] 3D scene unavailable, keeping the static image.', error);
    app = null;
    camera = null;
    canvas.hidden = true;
    return false;
  }
}
