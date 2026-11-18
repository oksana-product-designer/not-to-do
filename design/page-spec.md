# Page spec: Not To Do landing (option C2 "Corporate game")

The 3D scene stays fixed behind the page. Scrolling moves the camera from sky to hills. One focal message per screen.

Priority markers (0 to 5) show the order of attention, one per screen.

## Screen 0 · Intro

Scene: sky with big clouds close to the camera. The clouds drift, and move up through the frame as the page scrolls down. The camera leans slightly toward the cursor. No nav.

- Text, very large, shown one part at a time:
  1. In a world
  2. of corporate games
  3. be the most
  4. inefficient player.
- Top right link: Skip intro
- Scroll label: plain text reading "Scroll down" with a down arrow after it (no background), floating in the center of the screen.

Motion:
- Opening (every visit): the page starts inside the clouds, fully covered, and the veil lifts off the 3D clouds (0.4 s), then the camera flies back out to the first view in 2 s, starting from rest, speeding up as the clouds part and landing softly. It starts as soon as the scene is drawn, at most 1.5 s after load; without the 3D scene the static image zooms out from inside a cloud-white veil instead. Not shown with reduced motion or when the page is opened at a link target such as #hero.
- After the opening: only the sky and the Scroll label. No text yet. The page waits.
- First scroll: the "Scroll down" label fades out and part 1 is revealed. Back at the very top, the text goes and the label returns.
- Trigger: scroll only (wheel, swipe, arrow keys, Space). No timer advances the page.
- The intro stays pinned while the reader scrolls through 4.4 screens. Only one part is visible at a time.
- Each part owns a quarter of the intro. When its quarter reaches the middle of the screen, the part is revealed: it fades in, rises 30px and comes out of an 8px blur over 0.8 s. The part before it fades out in 0.2 s first.
- Scrolling is never locked: the camera and clouds follow the scroll as before. Only the text is locked into a sequence: lines play strictly in order, one at a time, and each stays for its full reveal plus a short rest (about 1.2 s) before the next may replace it. The lines share the first 75% of the pinned scroll; the last 25% is runway so the final line finishes before the intro ends. If the reader scrolls past the intro before the last line has played, the scroll and the camera carry on while the text stays on screen, but the camera stays in the clouds (sinking and drifting forward). The hills belong to the hero only: once the last line has had its time, the clouds part and the hills rise in over 3.2 s (soft start, strong middle, soft landing). The hero headline follows 2 s later, as the hills settle (see Screen 1 · Hero for the entrance). When the reader scrolls through this stretch instead, the camera trails the scroll by 1 s so it still glides. The page only holds if the reader reaches the hero before that. Scrolling back up is free. Skip intro bypasses everything.
- Soft cloud wisps float in front of the text: four translucent wisps rise through the screen with the scroll, each passing over the text at a different point (about one per line), so the lines look like they float among clouds. They sway sideways slowly on their own. Not shown with reduced motion.
- The camera descends through the clouds at an even pace: it follows the scroll, but never runs ahead of the lines. Each line unlocks an equal quarter of the descent, spread over the time the line is on screen, so a fast scroll gives a steady glide instead of a jump and a freeze. Scrolling up reverses it.
- After 6 s idle: the camera dips so the hero headline peeks above the bottom edge, then settles back.
- Clicking the label (or Enter on it) scrolls a little, which starts part 1.
- Every visit, new or reload, starts at the top with the opening and the intro. Nothing is remembered between visits; the browser's own scroll restore is switched off so the page never jumps to an old position. Reduced motion: all four parts shown together as static text, the label at the bottom, no pinning.

## Floating nav (appears after the intro)

Not To Do · How to play · High score · Stealth mode · Log in · [Start avoiding]

- Not To Do: wordmark, links to the hero.
- How to play, High score, Stealth mode: section links. The link of the section in view is highlighted. No highlight on the hero.
- Log in: same muted style as the section links, placed right next to Start avoiding.
- Start avoiding: the only filled element.
- Phone (under 768px): Not To Do · [Start avoiding] · Menu. Menu opens a panel under the pill: How to play, High score, Stealth mode, Log in.
- Look: a floating white pill, centered, inset from the top.
- Hidden during the intro. When the hero is reached it slides down and fades in, first in the hero entrance, with the headline right after it. It slides back up when the reader scrolls back into the intro.

## Screen 1 · Hero

Scene: deep blue sky, one small cloud drifting.

- H1: Climb nothing. Track everything.
- Sub: Not To Do logs the work you dodge, what you do instead, and how long you get away with it.
- Primary: Start avoiding · Secondary link: How to play
- Entrance: each headline word rises up through its own invisible window, one after another (80 ms apart, 1.1 s each, long soft landing), straightening from a 4 degree tilt as it lands. Order: the header slides down first; 120 ms later the words start; then, each 120 ms after the previous, starting 120 ms after the last word starts: the sub, the button row, the scroll cue. Each fades in, rises 16px and comes out of a 6px blur over 0.8 s (the button row also grows from 94%); the header slides down instead of rising. It waits 2 s after the intro hands over (hills first), or starts at once when the reader scrolls or skips to the hero. The idle dip shows the headline rising into the peek. Scrolling back up into the intro resets it, so it plays again. Reduced motion or no JS: shown static.
- Scroll cue: Scroll down. Slowly is fine.

## Transition 1 to 2 · Cloud wipe

The page passes through the clouds again, the way it entered them in the opening, and through the same clouds: the 3D scene's own. Scroll-driven and reversible: the hero and the Problem screen share one pinned stage. The wipe takes 2.2 screens of scroll and starts with the first scroll after the reader has landed on the hero. Scrolling back up plays it backwards and the hero returns exactly as built (its entrance does not replay). Autoplayed transitions: the hero, Problem (statement up, before its exit) and How to play (in place) are resting points. A scroll out of the intro lands on the hero. From a resting point, one swipe down starts the transition to the next one, and it plays by itself at a steady pace (hero to Problem 2.6 s, Problem to How to play 2.2 s), whatever the strength of the swipe; one swipe up plays it backwards. Scrolling during a transition is ignored, and after arriving the page rests at least 1 s (a swipe that started during the transition or the rest is ignored to its end). Inside How to play the levels follow the scroll as before; links, Tab and the scrollbar move freely. The camera and the veil trail the scroll by 1.5 s, so even a quick scroll glides.

Storyboard by scroll progress:
- 0 to 20%: the camera starts climbing from the hero toward the cloud layer. The hero text and scroll cue fade out from 10% (gone by 40%).
- 20 to 50%: the camera flies into the 3D clouds while a soft cloud-white veil with a long gradient edge rises in front of the page, until the whole screen is white (the opening's cloud white).
- 50 to 60%: a short beat of white.
- 60 to 85%: the veil sinks off the bottom, uncovering the Problem text top first on its plain cloud-white background (the 3D sky and clouds are hidden behind it).

- The header stays on top and usable throughout. Nothing under the white can be clicked or focused.
- Phone (under 768px): no 3D; the veil does the whole move over the static image. Problem has the same plain background.
- Reduced motion: no pin; the hero and Problem follow each other, with a 0.4 s crossfade through cloud white between them.
- No JS: the hero and Problem follow each other.
- Performance: transform and opacity only, no animated blur.

## Screen 2 · Problem

Scene: plain cloud white (the white the wipe ends on). No sky, no clouds, no hills.

- Statement (H2): Every productivity app assumes you want to work. We did some research. You don't.
- Layout: centered, large text straight on the plain background. No card, no dark background. The statement breaks into two line groups: "Every productivity app assumes you want to work." then "We did some research. You don't." on one line, in light grey.
- Entrance: the same motion as the hero headline. Each word rises through its own invisible window, one after another (80 ms apart, 1.1 s each, long soft landing), straightening from a 4 degree tilt. Triggered by scroll: it plays when the cloud wipe has cleared, and scrolling back up into the wipe resets it so it plays again. The screen then stays for a short read, and on the way out (scrubbed, reversible) the words drift up and fade one after another while the cloud white behind them dissolves into the real sky above the clouds (phones keep the white). How to play then rises into that sky. Reduced motion and no JS: fully shown.

## Screen 3 · How to play

Scene: the camera sinks slowly from the sky above the clouds into the top of the cloud layer over the pinned scroll, so clouds drift past behind the card. Its top edge fades from Problem's cloud white into the sky.

- H2: How to play
- Sub: Three levels. Nobody has ever lost.
- Pick your quest: Choose a task you have no plans to finish. Give it an honest estimate anyway.
- Choose a distraction: Gaming, shopping, one more video. Pick what you'll do instead.
- Start avoiding: Press the button. Every minute the task stays untouched goes on your score.

Layout (tablet and desktop): title and sub centered at the top. The demo app card is the main visual: large, in the middle of the screen. The three steps sit in a row along the bottom, each with a thin horizontal progress bar above it that fills with the scroll inside that step. Steps show their title only (no "Level" labels); the active step also shows its body, the others are muted. Each step is a button: clicking it scrolls to that step. Everything light: white card, text on the sky.

Appears in place (tablet and desktop): the section's stage is already pinned at the top when Problem's stage leaves, so nothing slides up from the bottom; its content stays hidden until then. Entrance (tablet and desktop), in three layers with the hero's soft landing: the title's words rise through their windows like the hero headline, then the sub settles; the card rises from lower down, tipped back in 3D, and flattens and grows into place, and its rows (top, fields, bottom) cascade in just after it lands; the step bars draw in from the left and the step titles follow, 60 ms apart. About 1.5 s in all. It resets when the reader scrolls back up into Problem, so it plays again.

Pinned scroll: the section stays on screen for 3 screens of scroll, one per level, scrubbed and reversible. On a level change the old body fades out and the new one fades in and rises (the hero item motion).

Demo card: a picture of the app's task card (title, project pill "Waffle Cone Project", When / Instead / Estimation, divider, time tracked, a light grey "Start avoiding" button). Hidden from screen readers, with one hidden sentence describing it. States follow the scroll and rewind when scrolling up:
- Pick your quest: the title types itself in ("Prototype for usability testing"), then the estimate ticks up to 3h.
- Choose a distraction: the Instead value spins like a slot machine (Online shopping, Scrolling, Watching Netflix) and lands on "Video gaming".
- Start avoiding: the button looks pressed, "tracked" counts up from 0h 00m to 1h 32m, and the card gets a soft glow.

Phone (under 768px): no pinning. Three stacked blocks, each with its level text and a small card already in that level's final state, fading in gently as they enter the screen. Reduced motion: the same stacked layout, all final states, no typing, spinning, counting or fading. No JS: the stacked layout with final states.

## Screen 4 · High score

Scene: camera level, haze, hills enter at the bottom edge. Number counts up on arrival.

- Label: High score
- Number: 47h 30m
- Sub: One sample week of procrastination. Your personal best is waiting.
- Chips: 4h scrolling · 2h YouTube · 40m shopping
- Note: A leaderboard of one. Nobody else needs to see it.

## Screen 5 · Stealth

Scene: camera drifts over the first hill. App screenshot slides in from the right.

- H2: Stealth mode is the default.
- Body: Cards, projects, estimates, a clean dashboard. From two desks away, you look like the most organized person on the team.
- Body: Your manager sees a plan. You see a score.
- Image: app screenshot, Today's Not-to-do's

## Screen 6 · Final

Scene: camera settles low, hills fill the lower half, text sits in the sky.

- H2: Ready player none?
- Sub: Your tasks will wait. They always do.
- Primary: Start avoiding
- Small print: [PRICING OR FREE-PLAN NOTE]

## Footer

Not To Do · Built during work hours. · Privacy · Contact

## Copy alternatives (kept for testing)

Intro:
- In a world of career ladders and corporate games, / be the most inefficient player. (first version)
- Everyone is climbing the career ladder. / You found a comfortable step.
- The corporate game has winners and losers. / Lose with dedication.
- Some people play to get promoted. / You play to get away with it.

Hero:
- Level down.
- Procrastination, now with stats.
- Play the long game. Very long.
