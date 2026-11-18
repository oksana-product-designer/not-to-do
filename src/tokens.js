// Reads design tokens from tokens.css for the JavaScript that needs them.

// A duration token in milliseconds. Accepts "800ms" and "0.8s" alike:
// the production build rewrites "800ms" as ".8s", so both forms must work.
export function tokenMs(name, fallback = 0) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith('ms') ? value : raw.endsWith('s') ? value * 1000 : value;
}

// A plain number token, such as a scale.
export function tokenNumber(name, fallback = 0) {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isNaN(value) ? fallback : value;
}

// One CSS "vh" in pixels, measured from the stylesheet's own unit rather than window.innerHeight
// (on phones with a collapsing address bar the two differ, and the pinned sections are sized in CSS).
let vhCache = 0;
export function cssVh() {
  if (!vhCache) {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    vhCache = probe.offsetHeight / 100 || window.innerHeight / 100;
    probe.remove();
  }
  return vhCache;
}
window.addEventListener('resize', () => { vhCache = 0; });
