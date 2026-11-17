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
