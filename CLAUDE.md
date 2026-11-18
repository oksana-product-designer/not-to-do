# Not To Do: landing page

Landing page for Not To Do, a pet-project app that tracks how people procrastinate at work.
The page sells the joke: the corporate game, played to lose on purpose.
There are no Figma files. Design happens in code, in this repo.

Read `design/page-spec.md` before any UI work. It holds the section order, copy and motion spec.

## About me

- I'm a product designer, not a developer. I'm learning to read code.
- After each change, explain what you did in 2 to 3 plain sentences: which file, what it does, why.
- If I ask for something that will hurt performance, accessibility or maintainability, say so before building it.

## Stack

- Vite + vanilla HTML, CSS and JavaScript (ES modules). No framework, no TypeScript, no Tailwind.
- 3D: Spline scene loaded with `@splinetool/runtime`.
- Scroll animation: GSAP + ScrollTrigger.
- Hosting: GitHub Pages, at https://oksana-product-designer.github.io/not-to-do/ (deployed by `.github/workflows/deploy.yml` on every push to `main`).
- Base path rule: the site lives in the `/not-to-do/` subfolder (`base` in `vite.config.js`). Never hard-code a path starting with `/` in JS: use `import.meta.env.BASE_URL` (for example `${import.meta.env.BASE_URL}images/scene-fallback.jpg`). Paths in `index.html` that start with `/` are rewritten by Vite at build time.
- Ask before adding any other dependency. Explain what it does and why plain JS isn't enough.

## Commands

```
npm install        # first time
npm run dev        # local server at http://localhost:5173/not-to-do/
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
git push           # deploys to GitHub Pages via the workflow; only when I say so
```

## Structure

```
index.html                  one page, all sections in order
src/
  main.js                   entry: imports styles, starts modules
  scene.js                  loads Spline, exposes camera and object helpers
  scroll.js                 GSAP ScrollTrigger: maps scroll progress to camera poses
  intro.js                  intro screen: line reveal, scroll hint, skip
  styles/
    tokens.css              design tokens (CSS custom properties). Only place raw values live
    base.css                reset, typography, layout primitives
    sections/*.css          one file per section, named after the section id
public/
  images/                   scene fallback stills, app screenshot
design/
  page-spec.md              sections, copy, motion (source of truth for content)
  decisions.md              log of design decisions with date and reason
  screenshots/              verification screenshots, overwritten each check
```

## Design system

- All colors, type sizes, spacing, radii, shadows and durations come from `tokens.css`. Never hard-code a value in a section file.
- Need a new value? Add a token, name it by role (`--color-cta-bg`), and tell me.
- Starting tokens are approximate, sampled from the app screenshot. Confirm with me before treating them as final:
  - Card surface white, radius 24px, soft shadow
  - Activity yellow `#FACC15`, CTA pink `#F9A8F0`, text `#141414`
- Fonts (confirmed), both from Google Fonts:
  - Imbue: titles only (H1, H2, the intro lines, the high-score number). Tokens `--font-display`.
  - Inter: everything else (paragraphs, subtitles, labels, buttons, nav, chips). Tokens `--font-text`.
  - Load only the weights in use, with `display=swap`, and preconnect to fonts.gstatic.com.
  - Set fallback stacks with similar metrics so text doesn't jump when the fonts load.
- Spacing on a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Type scale (tokens in `tokens.css`): base 16px, ratio 1.25, fixed sizes, one step down on phones. Hero H1 96/44, Problem statement 80/44, H2 64/40 (Imbue); H3 24/20, body large 20/18, body 16, small 14, caption 12 (Inter). Only the intro text stays fluid.
- Breakpoints: 390 (phone), 768 (tablet), 1280 (desktop), 1440 (wide). Build mobile first.
- Log any design decision that changes tokens, layout or copy in `design/decisions.md`.

## 3D scene

- Spline file: https://app.spline.design/file/d1fdf642-2947-4765-a86b-1b5a1361b28e
- Object names code depends on: `Hero Camera`, `Hill Back Ridge`, `Hill Far Right`, `Hill Right`, `Hill Mid Left`, `Hill Front Left`, `Ground`, `Sky Backdrop`, `Cloud 0` to `Cloud 33`, `Directional Light`. If a name is missing at load, log a warning and keep the page usable.
- The Spline file also carries its own motion code (cloud drift, pointer parallax, click gust). One owner per property: if the site drives the camera on scroll, the Spline parallax must not also move it. Decide with me before changing who owns what.
- The scene is decoration. Text and buttons never depend on it to render or be readable.
- Show `public/images/scene-fallback.jpg` until the scene reports loaded, then crossfade.
- Phones, `prefers-reduced-motion`, or a failed load: static image, no scroll-linked camera.

## Rules for every task

1. Read this file and `design/page-spec.md` first.
2. Use plan mode for anything bigger than one section or one interaction. Wait for my OK.
3. One section or one interaction per task.
4. After any visual change, run the dev server and take Playwright screenshots at 1440x900 and 390x844. Save them to `design/screenshots/`, look at them, and compare against the spec.
5. Finish with: what changed, what you checked, what you did not check.
6. Commit after each working step with a short message. Never push or deploy to production without asking.
7. Never delete files outside `design/screenshots/` without asking.

## Quality bar

- Accessibility: WCAG 2.1 AA contrast, real `<button>` and `<a>` elements, visible focus, the whole page usable by keyboard, `prefers-reduced-motion` respected.
- The intro must never trap anyone: "Skip intro" is present and focusable from the first frame (drawn only while it has keyboard focus).
- Performance: Lighthouse performance 85+ on mobile, LCP under 2.5 s. The scene loads after the first paint.
- No layout shift when the scene or fonts load.

## Copy rules

- Copy lives in `design/page-spec.md`. Change it there first, then in HTML.
- Voice: deadpan and supportive. Treat procrastination as a serious metric. No guilt.
- No exclamation marks. No em or en dashes.
- The main CTA always reads "Start avoiding" (same as the app button).
- Game vocabulary (player, quest, high score, stealth) at most once per section.

## Open questions

- Can `@splinetool/runtime` move the camera from page code smoothly enough for scroll scrubbing? Test this first with a throwaway prototype before building sections.
- Does the Spline file's own motion code run in this export? If not, cloud drift moves into `scene.js`.
- Signup: where does "Start avoiding" go? Placeholder `#signup` until decided.
- Pricing or free-plan note: placeholder until decided.
