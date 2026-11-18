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

## 2026-11-17 · Header: Log in next to Start avoiding
- Log in moved out of the centered link group and sits right before Start avoiding (8px apart), same muted link style (Oksana). The centered group is now the three section links. Phones: unchanged (Log in stays in the Menu panel). Tab order follows: wordmark, section links (currently off), Log in, Start avoiding.
- At 768 wide the right group (Log in + Start avoiding) is wider than the left (wordmark), so the section links sit 23px left of the exact center. From about 900 wide up they are exactly centered (720 of 720 at 1440).

## 2026-11-17 · Hero headline: frame width adapts, text size does not scale to fill
- Undone: the headline no longer grows to fill the header (Oksana: "text size should not be adaptive, only text frame width"). Removed --text-hero-title and --size-header-width.
- The headline frame is as wide as the header pill at every screen width (measured: identical edges at 1440, 1088, 768, 390). The text uses the title size from the type scale (--text-title-xl, 96px on desktop) and wraps inside the frame when it does not fit (one line from 768 up, two lines on phones).
- Note: --text-title-xl is itself a fluid token from the start of the project (44px on phones up to 96px at about 1440). A single fixed size would be a type-scale change; not done.

## 2026-11-17 · Hero headline: fixed size
- The hero H1 no longer scales with the screen (Oksana). New tokens: --text-hero-title 96px (768 and up) and --text-hero-title-phone 44px (under 768). Measured: 96px at 1440, 1280, 1088 and 768; 44px at 390. It wraps inside the header-wide frame (one line from about 960 wide, two lines at 768 and on phones).
- --text-title-xl (fluid) is unchanged and still used by the intro; only the hero H1 moved to the fixed tokens.

## 2026-11-17 · Cloud wipe (hero to Problem) and Screen 2 · Problem
- Structure: the hero, the cloud layer and Problem share one pinned stage (.act, CSS sticky like the intro). The wipe takes 150vh of scroll, the Problem word reveal 120vh after it, then the page ends (placeholders still hidden). Hero markup, timing and entrance unchanged; it fades out from 15% and comes back as built when scrolling up (its entrance does not replay).
- Direction (Oksana): front clouds rise in from below the hills and, on the way out, break up and sink off the bottom while the camera climbs above the cloud layer, so front and back clouds move the same way.
- Front clouds: a bank (puffy top edge + solid body) plus two looser layers that roll in slightly ahead and behind it and sink away slower and faster. Built from the intro's cloud shape, now a shared .cloud-puff component in base.css; the intro wisps use it with identical computed styles. Dense puffs get a solid core (--size-puff-core-dense). Transform and opacity only, no animated blur.
- Camera: new pose problem (tilt -0.12, height 10500, z 3733: open sky, cloud tops along the bottom, no hills). Path: holds while the cloud tops rise, climbs into the clouds (the opening's pose) as the bank covers the text, rises out to the problem pose as the cover sinks. Same curve as the opening (power2.inOut) and the same 0.5 s trailing as the CSS clouds.
- Pale sky (Oksana): the 3D sky above the clouds is a medium blue, so a 45% cloud-white wash sits behind Problem (fades in under the full cover). Without the 3D scene (phones, failed load, reduced motion, no JS) a pale gradient sampled from the washed sky. The wash also greys the "Built with Spline" badge.
- Reach: the hero is inert from 40% (faded), Problem is hidden until full cover (50%) and inert until 60%. The bank blocks clicks where it is. Checked: under full cover Tab only reaches the header, and its button stays clickable. The wordmark and Skip intro links jump back to the start of the act (the hero is stuck to the top while pinned).
- Problem: one h2, words are plain spans inside it, line groups per sentence; accessibility tree reads the full sentence. Statement fixed 64px (36px on phones), sub --text-body-l. Word reveal on opacity only: words start at 20% of the text color (light grey) and turn full in turn, sub fades in after the last word. Contrast at the end: statement 10.8:1 lowest, sub 12.9:1 lowest (desktop and phone).
- Reduced motion: no pin, hero and Problem follow each other, a 0.4 s crossfade through cloud white when Problem crosses the middle of the screen (Web Animations, opacity only). No JS: same without the crossfade.
- Measured: 60 fps through the wipe on desktop and on phone emulation with 4x CPU slowdown (no frame over 17 ms). Layout shift 0 over the whole act. Intro label, first line and intro-to-hero move unchanged against the live site. Hero after scrolling back matches the live hero.
- Known, not changed: opening the page directly at #hero still makes the hero wait for the intro's "lingering" state (about 6 s locally, live got lucky with timing). Pre-existing in intro.js, out of scope here.
- Tokens: --length-wipe-scroll, --length-problem-reveal, --wipe-fade-start, --wipe-fade-end, --wipe-cover-start, --wipe-full, --wipe-break, --size-wipe-edge, --size-puff-core-dense, --opacity-cloud-cover, --opacity-sky-wash, --color-sky-pale-top/-mid/-bottom, --color-cloud-cover-edge, --text-problem-title, --text-problem-title-phone, --opacity-problem-word-start, --measure-problem, --z-cloud-cover.

## 2026-11-17 · Problem: white card
- The statement and sub now sit in a white card with rounded corners on the pale sky (Oksana; replaces "no card" from the brief). Existing card tokens: --color-surface-card, --radius-card (24px), --shadow-card. Padding 96/64px on tablet and up, 48/24px on phones. No new tokens.

## 2026-11-17 · Problem: no sub, second line grey
- Sub "Not To Do is a tracker for the other seven hours of the workday." removed (Oksana). The words now share the whole reveal scroll.
- "We did some research." and "You don't." merged into one line group, which lands grey (--color-problem-muted = --color-text-muted, #5c5c5c, 6.7:1 on the white card) instead of black (Oksana). The first sentence stays #141414.

## 2026-11-17 · Cloud wipe: real 3D clouds, smoother
- The CSS cloud bank (gradient puffs) looked flat next to the 3D clouds (Oksana). Replaced: the camera now flies through the Spline scene's own cloud layer (hero pose, into the opening's buried-in-cloud pose, out to the problem pose above the clouds), and the only CSS layer is a soft cloud-white veil with a 60vh gradient edge that rises in, holds the white beat, and sinks away to uncover the Problem card top first (Oksana chose "uncovered by clouds" over an on-scroll reveal of the card).
- Smoother: wipe scroll 150vh to 200vh, the camera starts climbing at 0 instead of 25%, hero fades 10 to 40%, the veil clears by 85% (new token --wipe-clear) so the white does not drag, and the camera and veil (and the word reveal) trail the scrollbar by 1 s instead of 0.5 s, like the intro-to-hero move.
- Removed: the dense puff variant (.cloud-puff--dense, --size-puff-core-dense), --opacity-cloud-cover and the bank markup. .cloud-puff is back to the intro's original shape (intro unchanged against live).
- Phones: no 3D, so the veil carries the whole move over the static image.
- Measured: 60 fps on desktop and phone emulation with 4x CPU slowdown; intro label, first line and intro-to-hero move unchanged against live.

## 2026-11-17 · Problem: plain background, no card, bigger text
- The sky and clouds behind Problem are gone (Oksana): the screen has a plain background, --color-problem-bg = --color-cloud-cover (#f3f7fc), the same white the wipe ends on, so the hand-over is seamless. Removed the sky wash and the pale-sky gradient tokens (--opacity-sky-wash, --color-sky-pale-top/-mid/-bottom).
- The white rounded card is removed (Oksana); the statement sits straight on the background.
- Statement bigger: 80px from tablet up (was 64), 44px on phones (was 36), fixed. --measure-problem 16em.
- Contrast on #f3f7fc: #141414 about 17:1, the grey line #5c5c5c about 6.2:1 (AA passes).
- The camera still climbs to the problem pose during the wipe, now hidden behind the background. Left in place; it can be simplified if the screen stays plain.

## 2026-11-17 · Hero hold before the wipe; lighter second line
- The hero holds still for 60vh of scroll before the cloud wipe starts (--length-hero-hold, Oksana). The wipe, the camera climb and the Problem word reveal all start after it.
- "We did some research. You don't." lighter (Oksana: less contrast with the black line): --color-problem-muted #888888 (was #5c5c5c), 3.3:1 on #f3f7fc. AA for large text (80px and 44px) needs 3:1, so this is close to the lightest grey that still passes.

## 2026-11-17 · Screen 3 · How to play
- Built after the cloud wipe and Problem. The four How to play links are on again (header, phone menu, hero link, hero scroll cue: data-href back to href). The hero link and cue now travel through the wipe and Problem to this section. High score and Stealth stay hidden placeholders.
- Copy (page-spec.md first): Level 2.0 is "Choose a distraction" instead of "Choose a side quest", so the game word "quest" appears once in the section (CLAUDE.md rule, Oksana's choice).
- Layout, tablet and up with motion: pinned for 300vh (one screen per level). Levels on the left as buttons inside H3 headings (aria-current="step" on the active one); a live app card on the right. Inactive levels show label and title only; their text folds away but stays in the page for screen readers. Level change: old text fades out fast, new text fades in and rises (hero item tokens). Progress bar fills with the scroll inside the level (transform only).
- Live card states, scrubbed with 1 s trailing, all computed from the scroll so scrolling up rewinds them: level 1 types the title (first 55%) and ticks the estimate to 3h; level 2 spins the Instead reel three times through Online shopping, Scrolling, Watching Netflix and lands on Video gaming (transform only, slowing down); level 3 presses the button, counts tracked time to 1h 32m (first 80%) and fades in a soft pink glow (opacity only).
- Demo card built from the app screenshot Oksana supplied (design/reference/app-dashboard.webp): white, 24px radius, card shadow, outlined project pill, When / Instead / Estimation, dividers, tracked time, light lavender-grey "Start avoiding" button with a play triangle. Differences from the app: "Start avoiding" (CLAUDE.md CTA rule) instead of "Start Avoiding"; emoji icons kept as in the app (the card is hidden from screen readers). Cards are aria-hidden with nothing focusable; one visually hidden sentence describes the demo.
- Phone, reduced motion, no JS: stacked blocks, each with a small card in that level's final state (the three small cards repeat the live card's markup so no-JS gets real HTML). Phones fade each block in once as it enters (IntersectionObserver, the animation-on-scroll pattern); not with reduced motion.
- Background: with the 3D scene, the text sits on the real sky; the section's top edge fades from Problem's cloud white into it, so there is no hard line. Without the scene (phones, reduced motion, no JS), a pale-sky gradient of its own (tokens --color-sky-pale-* re-added).
- Camera: new pose htp (tilt 0.02, height 7200, z -600), sunk into the top of the cloud layer. Over the pinned scroll the camera sinks there from the problem pose (power2.inOut, 1 s trailing), so clouds rise behind the card.
- Contrast (measured against background pixels in the screenshots): H2 6.4:1 worst, sub 6.3:1, active label 4.6:1, active title 5.2:1, active text 10.4:1, phone text 4.7:1 or better. Inactive levels: the usual muted grey fails on mid blue, so a dark slate token --color-htp-inactive #263040 (about 4.8:1 on the darkest blue behind the list; first try #2f3a4a was borderline). Card: labels #6b6b6b on white 5.3:1, button text 13.6:1.
- Measured: 60 fps through the pinned scroll on desktop and on phone emulation with 4x CPU slowdown, layout shift 0.002. All four links land with the title below the header and the header link highlighted. Intro, hero and wipe unchanged.
- Tokens: --length-htp-scroll, --size-htp-fade, --color-sky-pale-top/-mid/-bottom, --color-htp-inactive, --color-htp-label, --size-htp-progress, --color-htp-progress-track, --color-htp-progress-fill, --size-htp-card, --htp-type-share, --htp-shuffle-turns, --htp-count-share, --shadow-htp-glow, --text-caption, --color-card-label, --color-card-divider, --color-card-pill, --color-card-button, --color-card-button-pressed, --color-card-empty.

## 2026-11-18 · How to play: composition (design-taste-frontend)
- Problem (Oksana): the title sat at the top, the columns floated in the leftover space with a large empty band, and the text column was wider than the card's.
- Now the title, sub and both columns form one block, centered in the space below the header (64px between the title block and the columns, --space-8). Two columns of equal width (--size-htp-levels 480px, same as --size-htp-card), pushed to the header's left and right edges (aligned with the pill at 1440 and 1280). The levels column has a fixed height (--size-htp-levels-height 340px, the tallest state), so opening a level never moves the title or the card. Level text and progress bar run the full column width.
- Tablet (768 to 1279): columns 4:5, the card a little wider so its values fit (at 768 "Video gaming" was clipped).
- Measured: title, levels and card positions identical across all three levels at 1440, 1280 and 768. Phones unchanged (stacked layout).
- Progress bar is now a vertical rail on the left of each level (Oksana): 3px wide, the full height of the level. The active rail fills top to bottom with the scroll (scaleY); finished levels stay full, later ones empty. The rail moved out of the folding text block so all three show.
- Level 3: the card no longer glows pink (Oksana). It lifts with the default deeper shadow (--shadow-htp-lift = --shadow-float), still fading in with opacity only. --shadow-htp-glow removed.
- Fix: while moving the rail, an edit removed the pinned rules for the single live card, so desktop briefly showed a card under every level. Restored and checked: one card on the right at every level.
