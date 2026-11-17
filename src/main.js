// Entry point: loads the styles, then starts each module.
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections/intro.css';
import './styles/sections/nav.css';
import './styles/sections/hero.css';
import './styles/sections/wipe.css';
import './styles/sections/problem.css';
import './styles/sections/placeholders.css';
import { initScene } from './scene.js';
import { initScroll, playOpening } from './scroll.js';
import { initIntro } from './intro.js';
import { initHero } from './hero.js';
import { initNav } from './nav.js';
import { initWipe } from './wipe.js';
import { initProblem } from './problem.js';

initHero();
initNav();
initIntro();
initScroll();
initWipe();
initProblem();

// The 3D scene starts loading only after the first paint, so text never waits for it.
const sceneReady = new Promise((resolve) => {
  requestAnimationFrame(() => setTimeout(() => initScene().then(resolve), 0));
});

// Opening fly-out: starts as soon as the scene is drawn, but never waits more than 1.5 s.
// If the scene is late, the opening plays on the static image and the scene fades in mid-way.
const OPENING_WAIT_MS = 1500;
Promise.race([sceneReady, new Promise((resolve) => setTimeout(() => resolve(false), OPENING_WAIT_MS))])
  .then((sceneShowing) => playOpening(sceneShowing));
