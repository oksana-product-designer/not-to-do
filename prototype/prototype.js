import { Application } from '@splinetool/runtime';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const URL = 'https://prod.spline.design/gy8pOJOY0CmAM2FX/scene.splinecode';
const hud = document.getElementById('hud');
const canvas = document.getElementById('scene');
const m = (window.__proto = { frames: [], loadMs: null, firstFrameMs: null, ready: false, camLog: [] });

const t0 = performance.now();
const app = new Application(canvas);
await app.load(URL);
m.loadMs = Math.round(performance.now() - t0);
requestAnimationFrame(() => { m.firstFrameMs = Math.round(performance.now() - t0); });

const cam = app.findObjectByName('Hero Camera');
const cloud0 = app.findObjectByName('Cloud 0');
const cloud9 = app.findObjectByName('Cloud 9');
const names = ['Hill Back Ridge','Hill Far Right','Hill Right','Hill Mid Left','Hill Front Left','Ground','Sky Backdrop','Directional Light'];
m.missing = names.filter((n) => !app.findObjectByName(n));
if (!cam) { hud.textContent = 'Hero Camera missing'; throw new Error('no camera'); }

const startRotX = cam.rotation.x;
const startY = cam.position.y;
m.start = { rotX: startRotX, y: startY, x: cam.position.x };

// Scroll drives the camera: rotation.x goes from its start value to 0 (level), y drops by 120.
const state = { p: 0 };
const apply = () => {
  cam.rotation.x = startRotX * (1 - state.p);
  cam.position.y = startY - 120 * state.p;
};
ScrollTrigger.create({
  trigger: '.page', start: 'top top', end: 'bottom bottom', scrub: true,
  onUpdate: (self) => { state.p = self.progress; apply(); },
});

m.getCam = () => ({ rotX: cam.rotation.x, y: cam.position.y, x: cam.position.x, p: state.p });
m.getClouds = () => ({ c0: cloud0 && cloud0.position.x, c9: cloud9 && cloud9.position.x });
m.apply = apply;
m.setP = (p) => { state.p = p; apply(); };

let last = performance.now();
const tick = (now) => {
  m.frames.push(now - last); last = now;
  if (m.frames.length > 4000) m.frames.shift();
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
setInterval(() => {
  const f = m.frames.slice(-60); const avg = f.reduce((a, b) => a + b, 0) / (f.length || 1);
  const c = m.getCam();
  hud.textContent = `fps ${(1000 / avg).toFixed(0)}  load ${m.loadMs}ms\np ${c.p.toFixed(2)} rotX ${c.rotX.toFixed(3)} y ${c.y.toFixed(1)}`;
}, 500);
m.ready = true;
