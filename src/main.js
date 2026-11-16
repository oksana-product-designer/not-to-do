// Entry point: loads the styles, then starts each module.
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections/intro.css';
import './styles/sections/hero.css';
import { initScene } from './scene.js';
import { initScroll } from './scroll.js';
import { initIntro } from './intro.js';

initIntro();
initScroll();

// The 3D scene starts loading only after the first paint, so text never waits for it.
requestAnimationFrame(() => setTimeout(initScene, 0));
