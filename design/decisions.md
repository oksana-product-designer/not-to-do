# Design decisions

## 2026-11-16
- Fonts: Imbue (titles) and Inter 400/500/600 (text) from Google Fonts, display=swap. Imbue fallback metrics are approximate, to tune by eye.
- Tokens: starting colors from CLAUDE.md plus role-named additions (--color-text-muted, --color-page-bg, --color-cta-text, --color-focus-ring, --shadow-float). Not final.
- Spline scene published through the connector as a code export (vanilla): https://prod.spline.design/gy8pOJOY0CmAM2FX/scene.splinecode
- Prototype finding: the scene's embedded motion code rewrites Hero Camera position and rotation every frame, so scroll control is overwritten. Camera ownership needs a decision (see CLAUDE.md, 3D scene).
- Prototype finding: the export reports "WebGPU only" in browsers without WebGPU. Needs re-export with renderer "Both" or "WebGL 2".
- Camera ownership: the website owns Hero Camera (scroll). Pointer parallax and the per-frame camera write were removed from the Spline file's embedded script and the scene was republished to the same URL. Cloud drift and click gust stay in Spline.
- Prototype re-test: scroll now holds the camera pose, clouds still drift, 60 fps. At the level pose (rotation x 0, y lowered by 120) the Ground plane ends in front of the camera and the lower 40% of a 1440x900 view is empty. Final camera poses or the Ground size need adjusting.
