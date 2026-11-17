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
