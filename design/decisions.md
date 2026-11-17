# Design decisions

## 2026-11-16
- Fonts: Imbue (titles) and Inter 400/500/600 (text) from Google Fonts, display=swap. Imbue fallback metrics are approximate, to tune by eye.
- Tokens: starting colors from CLAUDE.md plus role-named additions (--color-text-muted, --color-page-bg, --color-cta-text, --color-focus-ring, --shadow-float). Not final.
- Spline scene published through the connector as a code export (vanilla): https://prod.spline.design/gy8pOJOY0CmAM2FX/scene.splinecode
- Prototype finding: the scene's embedded motion code rewrites Hero Camera position and rotation every frame, so scroll control is overwritten. Camera ownership needs a decision (see CLAUDE.md, 3D scene).
- Prototype finding: the export reports "WebGPU only" in browsers without WebGPU. Needs re-export with renderer "Both" or "WebGL 2".
- Camera ownership: the website owns Hero Camera (scroll). Pointer parallax and the per-frame camera write were removed from the Spline file's embedded script and the scene was republished to the same URL. Cloud drift and click gust stay in Spline.
- Prototype re-test: scroll now holds the camera pose, clouds still drift, 60 fps. At the level pose (rotation x 0, y lowered by 120) the Ground plane ends in front of the camera and the lower 40% of a 1440x900 view is empty. Final camera poses or the Ground size need adjusting.

## 2026-11-16 · Intro (Screen 0)
- Camera poses: intro = rotation x 0, height 10500 (sky only). Hero = rotation x 0.15, height 6500 (cloud tops at the bottom edge). Tilting up alone ran past the top of the Sky Backdrop and kept clouds behind the text, so the camera starts high and descends instead. Poses are first guesses, to review.
- Intro scroll length: one screen height (spec did not say). Lines lift 30% of the screen and fade over the first 60% of that scroll.
- Timing reading: line 2 starts 1.2 s after line 1 starts. Hint starts 0.8 s after line 2 has finished fading (2.6 s from load).
- Idle dip: once, after 6 s without scroll. Camera moves 12% toward the hero pose and the hero headline lifts so about 56px of it shows, then both settle back. On phones only the headline moves.
- Return visits: localStorage key `ntd-intro-seen`, set when the hero is 60% in view.
- New tokens: --color-intro-text, --duration-intro-line, --duration-intro-hint-delay, --duration-hint-loop, --z-scene/content/nav/skip, --size-hint-*, --size-stroke, --size-touch-target, --measure-title, --content-max.
- Contrast of #141414 on the sky, measured from the 1440x900 screenshot: 6.6 at the darkest corner, 6.9 behind Skip intro, 7.3 behind the lines, 14.9 behind the hint. AA passes.
- Fallback image: 1600x1000 JPEG, 47 KB, scene at the intro pose. Phones and reduced motion always use it.
- Known: the export is still WebGPU only, so browsers without WebGPU get the static image. The live scene shows a "Built with Spline" badge bottom right (Spline plan setting).

## 2026-11-16 · Intro, second version
- Copy changed (page-spec.md first): "In a world / of corporate games / be the most / inefficient player." No comma after "games", since each part stands alone on screen. The first version is kept under copy alternatives.
- Intro text uses a new size token --text-display (56px on phones up to 192px on wide screens).
- The intro is pinned for 280vh of scroll, four equal steps, one part visible at a time. Part change: old part slides up and fades in 0.35 s, new part rises in over 0.7 s after a 0.32 s wait so the two never show together. Scrolling up reverses the direction.
- Clouds: the camera stands close to the cloud layer (z 0) and sinks from height 7000 to 3400 during the pinned scroll, so the clouds are large and travel up the screen. Their sideways drift still comes from the Spline file.
- End of intro: over the next screen of scroll the camera pulls back to the scene's own pose (tilt 0.297, height 226, z 3733). The clouds shrink and lift away and the hero shows the whole scene with the hills.
- Fallback image is now the whole scene, 1200x1500, 89 KB, shown at twice the screen height and slid up with scroll. Phones get clouds moving with the scroll and the hills at the hero, without the 3D scene.
- Reduced motion and no JavaScript: all four parts as one static block at the H1 size, no pinning.
- Project rules win over the design-taste skill where they clash (Inter and Imbue stay, vanilla CSS, centred intro text).

## 2026-11-16 · Intro, slower text and more clouds
- Intro part animation is twice as slow: in 1.4 s, out 0.7 s, 0.64 s wait between them. Softer curves (--ease-enter, --ease-exit), shorter travel (0.25em) and less scaling (0.98) so it reads calmer. Hint now appears 2.84 s after load.
- Spline file: every cloud scaled x2 in width and height, and 17 clouds added (Cloud 17 to Cloud 33, copies placed higher and to the side). 34 clouds in total. The drift script picks them up by name. CLAUDE.md still says Cloud 0 to Cloud 16.
- Scene republished to the same URL with the 34 clouds. Fallback image recaptured from it: 1200x1500, 105 KB.

## 2026-11-16 · Intro text speed
- Back to the earlier speed: in 0.7 s, out 0.35 s, 0.32 s wait. The softer curves, shorter travel (0.25em) and lighter scaling (0.98) stay.
- Cursor tracking is back at the hero, now driven by the site (scroll.js), not the Spline file. It fades in as the hero arrives and is off during the intro, on touch and with reduced motion. Amounts match the old Spline values: 120 units sideways, 30 up and down, about 1.2 and 2.5 degrees of lean.
- Skip intro is no longer drawn. It stays in the page for screen readers and keyboard users and shows (top right) only while focused, so keyboard-only sighted users can still see where focus is. This changes the CLAUDE.md rule 'visible and focusable from the first frame' to 'present and focusable from the first frame'; CLAUDE.md itself is not edited.

## 2026-11-16 · Intro text tied to scroll
- Problem: a part change was a short timed animation fired at a scroll point, so a quick scroll could pass a part before it was read.
- Now each part's arrival and exit follow scroll distance. Pinned scroll grew from 280vh to 440vh (110vh per part). Exit takes 42% of a step, arrival 28%. Text trails the scrollbar by 0.8 s.
- Cursor tracking now runs during the intro as well as the hero.
- Removed tokens no longer used: --duration-part-out, --ease-exit, --scale-intro-part. --delay-part-in is now the load delay (0.2 s).
- Intro camera stands closer to the clouds (z 0 to z -1800).
- Intro to hero is now a swoop, not a straight line: fast pull-back that slows, early lift of the camera's nose, and a soft drop so the hills rise in from the bottom. A first try that tipped the camera forward showed the far edge of the Ground plane, so it was dropped. The camera trails the scrollbar by 0.5 s.

## 2026-11-16 · Animation review (animation-principles skill)
- Load entrance: 0.7 s to 0.5 s, delay 0.2 s to 0.1 s. Hint fade 0.6 s to 0.25 s, still 0.8 s after the text.
- Hint leaving: 0.3 s standard curve to 0.15 s with an exit curve (--ease-exit is back).
- Text and camera now share one scroll trailing value, 0.5 s (text was 0.8 s), so they stay in step.
- Idle dip: 0.9 s each way to 0.6 s, hold 0.7 s to 0.5 s.
- Cursor tracking is time-based, so 120 Hz screens no longer run it twice as fast.
- Scene crossfade 0.6 s to 0.4 s.
- Button: hover lift and press feedback, 0.1 s. New tokens --duration-micro, --duration-crossfade, --shift-button-hover, --scale-button-press.
- Kept on purpose: scroll-tied part changes (ease-out in, ease-in out), the swoop curves, the 4.4-screen pinned scroll, the hint loop.

## 2026-11-16 · Intro text: on-scroll reveal
- The scroll-tied part changes are replaced by a timed reveal (animation-on-scroll skill): fade, 30px rise and an 8px blur clearing over 0.8 s, replaying every time a part comes back. The old part fades out in 0.2 s first.
- Built with plain CSS keyframes and an IntersectionObserver in intro.js, not the skill's Tailwind classes, because the project has no Tailwind.
- Trade-off accepted: a fast scroll can pass a part before its reveal finishes again. Animated blur on large text is also the most expensive effect on the page.

## 2026-11-16 · Intro: Scroll label and held lines
- The screen starts empty with a small floating "Scroll" label in the center. Part 1 appears after the first scroll. Copy change: "Scroll to start the game" / "Swipe up to start the game" became "Scroll" on all devices.
- The label replaces the bottom scroll hint. Clicking it now scrolls a little (starting part 1) instead of jumping to the hero. Skip intro still jumps to the hero.
- Lines play in order with a minimum time on screen: reveal (1.05 s) plus a 0.7 s hold. Scroll is not locked (chosen over a scroll lock for accessibility), so a hard fling past the whole intro can still miss the last lines.
- New tokens: --color-label-bg, --size-hint-icon, --shift-hint-float, --duration-hint-float, --duration-part-hold. Removed the mouse and swipe icon tokens.
- Scroll label is now plain text: no pill background, shadow or chevron. Removed tokens --color-label-bg and --size-hint-icon. Contrast relies on #141414 over the sky and clouds (about 6.6 or better on the sky, higher on clouds).

## 2026-11-17 · Intro: scroll lock per line
- The line-hold queue is removed. It let the first line sit while the scroll ran on to the hero, so the other lines were missed.
- Now scrolling is locked for about 1.2 s each time a new line appears (wheel, touch and scroll keys are swallowed, the page is held in place). Going down moves one line at a time; a larger jump is pulled back to the next line. Going up is free.
- Known cost, accepted by Oksana: this overrides the reader's scroll. CLAUDE.md says the intro must never trap anyone, so the Skip intro link bypasses the lock, Tab is never blocked, and reduced motion has no lock at all.
- --duration-part-hold is now 150 ms and means the rest after a reveal before the lock lifts.
- page-spec.md had been emptied by a script bug in the plain-label commit (a6f4270); restored from the commit before it.

## 2026-11-17 · Intro: lock the text, not the scroll
- The page-wide scroll lock is removed: it froze the camera and clouds while each line appeared.
- Scroll is free again and drives the camera as before. Lines play in a locked sequence: in order, one at a time, about 1.2 s each.
- To keep lines unskippable, the only hold left is at the exit of the pinned intro: the page cannot scroll past it until the last line has played (at most about 4.8 s from the first scroll). Skip intro bypasses it.
- Fix: scrolling from line 3 to line 4 stalled at the intro exit, because line 4 started too close to the end and the page was pulled back on every scroll event. Lines now share the first 75% of the pinned scroll (last 25% is runway), and the rare remaining wait is a quiet hold (scrolling switched off) instead of repeated snap-backs.
- Label copy: "Scroll" became "Scroll down", with a straight down arrow (shaft and head, not a chevron) after the text. Token --size-hint-icon is back.
- Fix: on a normal scroll the lines ran behind and the page waited at the end of the intro, so the background stopped during the last two lines. Now the scroll and camera carry on into the move to the hero while the text lingers on screen; the hero headline fades in once the last line is done. The hold remains only at the hero itself.
- Fix: the hills showed while intro lines were still playing. The camera now stays in the clouds (extra sink of 500 and forward drift of 600 over the lingering stretch) until the last line is done, then blends into the swoop to the hero over 1.2 s. Scrolling back into the intro closes it again in 0.3 s. The phone fallback image follows the same rule.
- Fix: the background still froze on the last lines, because the camera followed the scroll and the scroll got ahead of the text. The intro descent is now capped by the lines: each line unlocks a quarter of it, linearly over its 1.2 s. Slow scroll follows the scroll; fast scroll glides at a constant pace with the lines.

## 2026-11-17 · Intro: clouds in front of the text
- The 3D scene sits behind the page, so its clouds cannot cover the text. Added a separate front layer: four soft wisps made of CSS gradients (no images, no new dependency), at 80% opacity, rising with the same even pace as the camera and swaying sideways over 16 s.
- Each wisp crosses the text at a different point of the intro, roughly one per line, so covering is brief and partial.
- Accessibility cost: contrast drops where a wisp overlaps letters. Kept translucent and passing; hidden with reduced motion and without JavaScript.
- New tokens: --color-mist, --color-mist-edge, --opacity-mist, --size-wisp-w, --size-wisp-h, --duration-wisp-drift, --shift-wisp-drift.

## 2026-11-17 · Opening: fly out of the clouds
- First visits start inside the 3D cloud layer (camera at height 5200, 5400 units into the clouds, which fills the screen) and fly out to the first intro view (first version: 1.8 s, power3.out, cleared too fast; now 2 s, power2.inOut, starting 0.2 s after the veil begins to lift).
- A cloud-white veil (#f3f7fc) covers the scene at first paint so there is no flash of clear sky while the scene loads. With the 3D scene it fades in the first 0.45 s; the real clouds do the rest.
- Starts when the scene is drawn, at most 1.5 s after load. Phones, slow or failed loads: the static image zooms out from 1.4x while the veil fades.
- The Scroll label waits until the opening is done. No opening on return visits, with a link target, or with reduced motion.
- New tokens: --color-cloud-cover, --duration-opening, --scale-opening-fallback.
- Fix: reloading restored the old scroll position (the intro raced through its lines from there) and counted as a return visit (no opening). Now the browser's scroll restore is off and a reload replays the intro from the top with the opening. A new visit after reaching the hero still starts at the hero.

## 2026-11-17 · Intro to hero: slower, still dynamic
- Measured before: the move from clouds to hills took 0.9 s and the headline arrived with it.
- Now: 3.2 s with power3.inOut (2.4 s was tried first: visible move 1.6 s, headline landed before the camera) (eases out of the clouds, sweeps through the middle, lands softly). Scrolling through it, the camera trails by 1 s instead of 0.5 s.
- Choreography: background first, then text. The hero headline starts 2 s into the move and fades in while rising 24px over 0.8 s.
- New tokens: --duration-hero-reveal, --delay-hero-in, --duration-hero-in, --shift-hero-in.

## 2026-11-17 · Hosting moved to GitHub Pages
- Site served from the /not-to-do/ subfolder, so vite.config.js sets base: '/not-to-do/'. Vite rewrites the two root paths in index.html (fallback image, main script) at build time; the JS has no root-relative paths.
- .github/workflows/deploy.yml builds and deploys dist/ with the official Pages actions on every push to main. It is added through the GitHub website, because the saved access token on this Mac cannot push workflow files.
- netlify.toml left in place (unused); delete only on request.

## 2026-11-17 · Fix: live site animations ran far too fast
- The production build minifies CSS durations ("800ms" becomes ".8s"). The JS read tokens with parseFloat as milliseconds, so live timings became 1000x too short: the opening ended at once and the intro lines raced through. Localhost (dev server, unminified CSS) was fine.
- New src/tokens.js reads duration tokens in either unit (tokenMs) and plain numbers (tokenNumber); intro.js and scroll.js use it.

## 2026-11-17 · Every visit plays the intro
- Removed the "return visit" rule. Before, reaching the hero saved a flag in the browser (localStorage `ntd-intro-seen`), and every later new visit jumped straight to the hero; only a reload replayed the intro. Oksana wants the opening and intro on every open.
- The page no longer stores anything. The old flag may still sit in browsers that visited before; it is ignored.

## 2026-11-17 · Hero entrance: word-by-word reveal
- Replaced the single fade-and-rise of the whole hero block with a choreographed entrance: headline words rise through their own masks in sequence (80 ms stagger, 1.1 s, new --ease-hero), each straightening from a 4 degree tilt, then the Start avoiding button settles in (fade, 16px rise, 94% to 100%, 6px blur clearing, 0.8 s).
- It now also plays when the reader scrolls or skips to the hero (before, only the intro handover animated it), and replays after scrolling back up into the intro, like the intro lines.
- New src/hero.js splits the headline into words (screen readers get the full sentence via aria-label). Hidden state applies only once JS is ready, so text stays visible if JS fails.
- Tokens: removed --duration-hero-in, --shift-hero-in. Added --delay-hero-in-scroll, --duration-hero-word, --stagger-hero-word, --rotate-hero-word, --duration-hero-cta, --delay-hero-cta, --shift-hero-cta, --scale-hero-cta, --blur-hero-cta, --ease-hero.

## 2026-11-17 · Final hero and floating header
- Hero: H1, sub, Start avoiding + How to play link, scroll cue "Scroll down. Slowly is fine." (copy from the spec). Text starts below the header and sits in the sky; the cue sits above the hills (28vh from the bottom on tablet and up, 40vh on phones, where the hills start higher). Checked at 1440x900, 768x1024 and 390x844: no text or button over the hills or the Spline badge.
- Entrance: kept the word-by-word H1 reveal (Oksana's choice over the old block fade; --duration-hero-in and --shift-hero-in stay removed). After the last word starts, the sub, the button row, the header and the scroll cue follow, 120 ms apart (--stagger-hero-step), each fading in, rising 16px and coming out of a 6px blur. Same start time as before (2 s after the intro hands over).
- Header: white pill, centered, max --content-max, 16px from the top. Wordmark (Imbue) · How to play · High score · Stealth mode · Log in (one muted style) · Start avoiding (the only filled element, same .button). Phone: wordmark · Start avoiding · Menu, with a panel for the four links.
- When the header shows stays in intro.js: on the hero and anywhere below it, hidden in the intro. Changed from "hero 60% visible" to "hero top in the upper 40% of the screen, or further down", checked on scroll, so the header also stays on the sections below and hides even after a jump straight to the top. While the hero entrance has not started, the header waits for it (is-hero-pending), so it always arrives in its slot.
- Active link: the section covering a line 40% down the screen. aria-current="true" on its links. None on the hero.
- Anchor sections How to play, High score, Stealth mode: empty placeholders, 100vh, visually hidden H2, scroll-margin-top --offset-nav (96px) so the section lands 16px below the header.
- The "Scroll down" label is now a shared .scroll-cue component (base.css), used by the intro and the hero. The intro looks the same (compared before and after).
- Kept the CTA as the existing pink .button: it already uses --color-cta-bg, so there was no second version to compare.
- Skip intro keeps its own hiding rules; the new .visually-hidden helper is used by the section H2s only.
- Contrast, measured from the screenshots (AA needs 4.5:1 under 24px, 3:1 for the H1): H1 7.0:1 lowest (desktop), 7.2:1 (phone, static image); sub 7.4:1; How to play link 8.6:1; scroll cue 9.5:1; nav links #5c5c5c on the white pill 6.7:1; button text on pink 10.4:1. --color-text-muted passes, no change.
- Tokens added: --color-nav-link, --color-nav-link-current, --color-nav-surface, --measure-sub, --offset-nav-top, --size-nav-height, --offset-nav, --offset-hero-top, --offset-hero-cue, --offset-hero-cue-phone, --stagger-hero-step, --duration-nav. Renamed: --duration-hero-cta / --shift-hero-cta / --scale-hero-cta / --blur-hero-cta became --duration-hero-item / --shift-hero-item / --scale-hero-item / --blur-hero-item. Removed: --delay-hero-cta (replaced by the step).

## 2026-11-17 · Hero: centered, cue at the bottom, links to unbuilt sections off
- Links to sections that are not built yet (How to play, High score, Stealth mode in the header and the phone menu, the hero's How to play link and its scroll cue) have data-href instead of href: not clickable, not in the Tab order, not announced as links. Same look, default cursor. Rename data-href back to href when a section is built. Requested by Oksana.
- Hero text block centered in the screen (same room above and below, which also clears the header). Requested by Oksana.
- Hero scroll cue 80px from the bottom edge (--offset-hero-cue, between the 64 and 96 steps). Requested by Oksana. It now sits on the hills: contrast 3.4:1 (desktop) and 3.3:1 (phone) at the darkest grass stripe, below the 4.5:1 AA minimum for 14px text. Known AA failure, accepted by Oksana: left as is (a soft white pill behind the cue was offered and declined). On phones the button row also sits on the first hill edge (5.3:1 there, passes).

## 2026-11-17 · Page ends at the hero; header leads the entrance
- The three placeholder sections are taken out of the layout (display: none in placeholders.css; markup kept). The page now ends at the hero, so scrolling stops there instead of running into empty sky. Requested by Oksana. Undo per section when it is built (remove the rule, data-href back to href).
- Entrance order changed: the header slides down first (same start: 2 s after the intro hands over), the headline words follow 120 ms later, then sub, buttons and scroll cue, 120 ms apart. Requested by Oksana ("hero text right after the header").

## 2026-11-17 · Header: hidden on open, links centered; cue 40px from the bottom
- Fix: on opening the page the header was briefly drawn and then slid away (its hidden style arrived after the first frame, and the slide transition animated the change). The show/hide motion now switches on only after load (is-animated, set by nav.js), so the header starts out hidden. Checked on dev and production builds; it still slides in at the hero, before the text.
- Header links centered in the pill (tablet and up): three columns, wordmark left, links centered, Start avoiding right. Pill padding made even (8px all round, the wordmark has its own 16px), so the links sit exactly in the middle. Requested by Oksana.
- Hero scroll cue now 40px from the bottom edge (--offset-hero-cue, between the 32 and 48 steps). Requested by Oksana. At 768x1024 the "Built with Spline" badge covers the cue's arrow (the badge comes from the Spline export and sits bottom right). At 1440x900 and on phones it is clear.

## 2026-11-17 · Hero: headline as wide as the header, smaller sub, cue lifted on tablet
- Headline as wide as the header pill and growing with the screen (Oksana). Tablet and up: one line, font size = header width x 0.103 (--text-hero-title; the Imbue line is 9.5 times its font size), so it runs edge to edge of the pill: 76px at 768, 109px at 1088, 115px from 1280 (header capped at --content-max). Phones (under 768): one line would shrink it to about 37px, so it keeps --text-title-xl (44px), wraps to two lines and uses the full width. --measure-title is no longer used by the hero.
- Sub smaller: --text-body (16px) instead of --text-body-l (20px) (Oksana).
- Scroll cue on tablet (768 to 1279) sits 96px from the bottom (--offset-hero-cue-tablet) so the Spline badge no longer covers its arrow. Desktop and phones keep 40px.
- New token --size-header-width (the pill width), used by the headline size.
