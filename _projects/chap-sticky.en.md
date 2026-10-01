---
layout: project
slug: chap-sticky
title: Splat! Sticky (찹! 찐득이)
subtitle: A physics minigame built in vanilla JS — no engine
status: Live
order: 3
image: /assets/portfolio/chap-sticky/itch_cover.png
image_alt: Splat! Sticky cover
tech: [JavaScript, HTML5 Canvas, WebAudio, Capacitor, GitHub Actions]
mermaid: true
links:
  - label: itch.io (play)
    url: https://rumaniel.itch.io/splat-sticky
  - label: GitHub
    url: https://github.com/rumaniel/chap-sticky
permalink: /portfolio/chap-sticky/
lang: en
page_id: project-chap-sticky
---

A physics minigame where you **flick a sticky toy at a wall**, it splats and clings, then slowly tumbles down as its grip wears off. Score = time hung × bullseye-ring multiplier. Add spin on release and the throw curves via the **Magnus effect**. **No engine, no library, no asset files** — vanilla JavaScript + HTML5 Canvas, graphics drawn in code, audio synthesized with WebAudio. A 2026 Minigame Makers Challenge entry, shipped on itch.io and Google Play (internal).

## At a glance

| Property | Value |
| --- | --- |
| Engine | None — vanilla JavaScript + HTML5 Canvas |
| Runtime dependencies | 0 (graphics code-drawn, audio WebAudio-synth → runs from `file://` by double-click) |
| Modules | 12 JS modules loaded in dependency order (no cycles) |
| Modes | Practice (5-throw rounds + localStorage leaderboard), Party (2–8 player hot-seat) |
| Content | 3 toys (man/octo/star) · 4 walls (chalk/room/glass/fridge) |
| Mobile packaging | Capacitor 8.5 → Android AAB |
| Deployment | Tag-driven GitHub Actions → itch.io (butler) + Google Play (internal) · v1.0.1 |

## Architecture

12 JS modules stacked in **one dependency direction** (lower calls higher, no cycles). No build step — plain `<script>` tags register onto a `window.ST` namespace in order. Gameplay branches through **two state machines**: the throw flow (idle→aim→fly→…) and, once stuck, the adhesion phase (settle→hold⇄roll→peel→fall).

<div class="mermaid" markdown="0">
flowchart TD
  subgraph LOAD["Module load order (deps bottom→top)"]
    direction LR
    i18n --> shapes --> materials --> audio --> score --> physics --> input --> sticky --> ui --> modes --> main
  end

  subgraph GSM["Game state machine (main.js)"]
    direction LR
    idle --> aim --> fly
    fly --> stuck
    fly --> bounceoff
    fly --> fall
    stuck --> done
    bounceoff --> done
    fall --> done
  end

  subgraph SSM["Sticky phase machine (sticky.js)"]
    direction LR
    settle --> hold
    hold --> roll
    roll --> hold
    hold --> peel --> fallS["fall"]
  end
</div>

Four coordinate systems are kept distinct — world (meters), wall-normalized, a 480×800 virtual screen, and shape-local. Physics runs only in world coordinates regardless of resolution/aspect; rendering projects to the virtual screen.

## Deterministic physics: same landing at 60/90/120/144 Hz

The core requirement of a physics minigame is that **the same throw always lands in the same place**. If the landing point drifts with frame rate or a hitch, a skill game becomes a luck game. `stepFlight` accumulates frame time and **integrates in exact 1/120 s steps**, then **linearly interpolates** to the wall plane so the collision state is decoupled from frame length.

```js
// game/js/physics.js — fixed-timestep accumulator
f.acc = (f.acc || 0) + dt;
while (f.acc >= H_STEP - 1e-9) {
  f.acc -= H_STEP;
  const h = H_STEP;                            // exactly 1/120 s
  const px = f.x, pz = f.z;                     // keep pre-substep state
  f.vy -= TUNE.GRAVITY * h;
  f.vx += TUNE.MAGNUS * f.spin * f.vz * h;      // Magnus curve
  f.spin *= 1 - TUNE.SPIN_DECAY * h;
  f.x += f.vx * h; f.y += f.vy * h; f.z += f.vz * h;

  if (f.z >= TUNE.WALL_Z) {
    // interpolate to the wall → landing pos/vel independent of frame length
    const u = f.z > pz ? (TUNE.WALL_Z - pz) / (f.z - pz) : 1;
    f.x = px + (f.x - px) * u;
    // … y / vx / vy / angle / spin interpolated by u too …
  }
}
```

An early version scaled the step count to the frame, which produced a "100 ms hitch shifts the landing 2 cm and the toy bounces off the glass window frame" bug. An adversarial review (R15) reproduced it; after switching to fixed step + interpolation, I verified **Δ=0 landing coordinates across 5,280 cases at 60/90/120/144 Hz** (bit-identical).

## Inverted-pendulum topple: descent emerges from physics

The toy's fall is **real rotation**, not an animation curve. It pivots about the pad that's still stuck, tilts like an inverted pendulum, accelerates as it tilts, and re-sticks lower down — you watch the "grip juice" get spent.

```js
// game/js/sticky.js — _updateRoll (inverted-pendulum rotation)
const acc = (9.8 / V2.ROLL_L) * Math.sin(Math.min(R.phi + R.nudge, Math.PI / 2));
R.vel += acc * dt;
let d = Math.min(0.3, R.vel * dt);              // per-frame rotation cap (stability)
R.phi += d;

const a = d * R.dir;                            // real rotation about the pivot
const c = Math.cos(a), s = Math.sin(a);
const dx = st.x - R.pivot.x, dy = st.y - R.pivot.y;
st.x = R.pivot.x + dx * c + dy * s;
st.y = R.pivot.y - dx * s + dy * c;
st.angle += a;
```

On top of this sits a **per-pad grip model** (deterministic geometry factor + quality-linked jitter + discrete hold-slip events), so the collapse order differs on every throw. That's why the same wall and toy still read as a different sequence each round.

## No engine, no assets

Zero runtime dependencies, on purpose.

- **All graphics are code-drawn** — 3 toys and 4 walls are Canvas paths. Zero image files.
- **All sound is WebAudio synth** — zero audio files. Copyright-clean, near-zero footprint.
- **No build step** — double-click `game/index.html` and it runs, even from `file://`.

This drives file size and copyright risk to zero, while mobile is just a Capacitor wrapper that emits an AAB — a simple pipeline.

## Screenshots

![Aiming the throw](/assets/portfolio/chap-sticky/itch_s1_aim.png)

![Magnus curve](/assets/portfolio/chap-sticky/itch_s3_curve.png)

![Party mode (simultaneous crawl)](/assets/portfolio/chap-sticky/itch_s4_party.png)

![Glass wall](/assets/portfolio/chap-sticky/itch_s5_glass.png)

![Play loop](/assets/portfolio/chap-sticky/itch_play.gif)

## Deployment

Pushing a tag triggers GitHub Actions to (1) upload the web build to itch.io via butler, and (2) ship the Capacitor-wrapped Android AAB to the Google Play internal track. Web and mobile share the **same vanilla-JS core**, so one codebase serves both platforms with no porting cost.

## Decisions worth calling out

- **No engine.** A single minigame doesn't need a Unity/Godot runtime. I traded that for instant load, copyright-clean assets, and a tiny footprint — at the cost of hand-writing the physics, rendering, and audio.
- **Determinism first in physics.** A skill game must be frame-rate-independent. Fixed timestep + interpolation buys bit-identical reproducibility.
- **An adversarial review loop.** Balance and determinism bugs were reproduced and fixed over review rounds R9–R16; the commit history carries the trail.

## Try it

The **itch.io** button plays it right in the browser, and the full source is public on **GitHub**.
