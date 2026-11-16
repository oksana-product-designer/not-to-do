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
