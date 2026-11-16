# Page spec: Not To Do landing (option C2 "Corporate game")

The 3D scene stays fixed behind the page. Scrolling moves the camera from sky to hills. One focal message per screen.

Priority markers (0 to 5) show the order of attention, one per screen.

## Screen 0 · Intro

Scene: sky only. No nav, no clouds in front of text.

- Line 1 (small): In a world of career ladders and corporate games,
- Line 2 (large): be the most inefficient player.
- Top right link: Skip intro
- Scroll hint: mouse icon + "Scroll to start the game". Phone: swipe icon + "Swipe up to start the game".

Motion:
- On load: line 1 fades in (0.6 s). Line 2 appears 1.2 s later. Then the page waits.
- Trigger: scroll only (wheel, swipe, arrow keys, Space). No timer advances the page.
- Camera tilt and the lines lifting away follow scroll progress. Scrolling up reverses them.
- Hint fades in 0.8 s after line 2, wheel dot loops, hides on first scroll.
- After 6 s idle: the camera dips so the hero headline peeks above the bottom edge, then settles back.
- The hint is a link to `#hero`, so click and Enter also work.
- Return visits skip the intro. Reduced motion: both lines static, hint shown.

## Floating nav (appears after the intro)

Not To Do · Log in · [Start avoiding]

## Screen 1 · Hero

Scene: deep blue sky, one small cloud drifting.

- H1: Climb nothing. Track everything.
- Sub: Not To Do logs the work you dodge, what you do instead, and how long you get away with it.
- Primary: Start avoiding · Secondary link: How to play
- Scroll cue: Scroll down. Slowly is fine.

## Screen 2 · How to play

Scene: camera tilts into the cloud layer. Cards drift in one at a time, staggered on desktop, stacked on phone.

- H2: How to play
- Sub: Three moves. No training required.
- Move 1, Pick your quest: Choose a task you have no plans to finish. Give it an honest estimate anyway.
- Move 2, Choose a side quest: Gaming, shopping, one more video. Pick what you'll do instead.
- Move 3, Start avoiding: Press the button. Every minute the task stays untouched goes on your score.

## Screen 3 · High score

Scene: camera level, haze, hills enter at the bottom edge. Number counts up on arrival.

- Label: High score
- Number: 47h 30m
- Sub: One sample week of procrastination. Your personal best is waiting.
- Chips: 4h scrolling · 2h YouTube · 40m shopping
- Note: A leaderboard of one. Nobody else needs to see it.

## Screen 4 · Stealth

Scene: camera drifts over the first hill. App screenshot slides in from the right.

- H2: Stealth mode is the default.
- Body: Cards, projects, estimates, a clean dashboard. From two desks away, you look like the most organized person on the team.
- Body: Your manager sees a plan. You see a score.
- Image: app screenshot, Today's Not-to-do's

## Screen 5 · Final

Scene: camera settles low, hills fill the lower half, text sits in the sky.

- H2: Ready player none?
- Sub: Your tasks will wait. They always do.
- Primary: Start avoiding
- Small print: [PRICING OR FREE-PLAN NOTE]

## Footer

Not To Do · Built during work hours. · Privacy · Contact

## Copy alternatives (kept for testing)

Intro:
- Everyone is climbing the career ladder. / You found a comfortable step.
- The corporate game has winners and losers. / Lose with dedication.
- Some people play to get promoted. / You play to get away with it.

Hero:
- Level down.
- Procrastination, now with stats.
- Play the long game. Very long.
