// Floating header behavior: the phone menu and the highlight of the section in view.
// When the header shows is decided by intro.js; how it looks and moves is nav.css.
// Link clicks scroll with the page's own smooth scrolling (base.css), which is off with reduced motion.

const SECTIONS = ['how-to-play', 'high-score', 'stealth'];

export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  // Turn the show/hide motion on only after the first frames, so the header starts out hidden
  // instead of animating from its unstyled position when the page opens.
  requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add('is-animated')));

  // Phone menu
  const button = nav.querySelector('.nav__menu-button');
  const panel = document.getElementById('nav-panel');
  if (button && panel) {
    const isOpen = () => button.getAttribute('aria-expanded') === 'true';
    const open = () => {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      const first = panel.querySelector('a[href]');
      if (first) first.focus();
    };
    const close = ({ focusButton = true } = {}) => {
      if (!isOpen()) return;
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (focusButton) button.focus({ preventScroll: true });
    };
    button.addEventListener('click', () => (isOpen() ? close() : open()));
    // Link in the panel: close, let the browser jump, then put focus back on the Menu button
    // (the jump itself would otherwise drop focus to the page).
    panel.addEventListener('click', (event) => {
      if (!event.target.closest('a[href]')) return;
      close({ focusButton: false });
      requestAnimationFrame(() => button.focus({ preventScroll: true }));
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
    document.addEventListener('pointerdown', (event) => { if (!nav.contains(event.target)) close({ focusButton: false }); });
    // Header hidden (back in the intro) or screen widened past the phone layout: close quietly.
    new MutationObserver(() => { if (!nav.classList.contains('is-shown')) close({ focusButton: false }); })
      .observe(nav, { attributes: true, attributeFilter: ['class'] });
    window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) close({ focusButton: false }); });
  }

  // Highlight the link of the section in view. A section counts as "in view" when it covers
  // a thin line 40% down the screen. The hero is watched too: while it covers the line, nothing is highlighted.
  const targets = ['hero', ...SECTIONS].map((id) => document.getElementById(id)).filter(Boolean);
  const setCurrent = (id) => {
    nav.querySelectorAll('.nav__link').forEach((link) => {
      if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  // A section only counts once it is in place: How to play overlaps the last screen of Problem while it is
  // still hidden (is-entrance-ready without is-entered), so it is not highlighted until it has arrived.
  const onLine = new Set();
  const inPlace = (el) => !el.classList.contains('is-entrance-ready') || el.classList.contains('is-entered');
  const update = () => {
    const current = targets.filter((el) => onLine.has(el) && SECTIONS.includes(el.id) && inPlace(el)).pop();
    setCurrent(current ? current.id : null);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) onLine.add(entry.target); else onLine.delete(entry.target); });
    update();
  }, { rootMargin: '-40% 0px -59% 0px' });
  targets.forEach((el) => {
    observer.observe(el);
    new MutationObserver(update).observe(el, { attributes: true, attributeFilter: ['class'] });
  });
}
