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
