---
layout: case-study
slug: ugui-rendering-optimization
title: UGUI Rendering Optimization
subtitle: Live-game UI performance engineering across multiple companies and titles
order: 1
companies: [Bagelcode, StudioZoo, SZ Code Lab]
tech: [Unity, UGUI, NGUI, C#, HLSL, Unity Profiler, Frame Debugger]
mermaid: true
metrics:
  - label: Avg FPS
    value: 60 (on low-end devices)
  - label: Peak Draw Calls
    value: ≈ 100
  - label: Reference Device
    value: iPhone 5s · low-end Android
  - label: Live Titles
    value: 8 shipped games
permalink: /portfolio/ugui-rendering-optimization/
lang: en
page_id: case-ugui
videos:
  - title: Party Slots
    company: Gamevil USA
    provider: vimeo
    id: "98393512"
    url: https://vimeo.com/98393512
  - title: Vegas Party Slots
    company: Bigfish Games
    provider: youtube
    id: "65lmwo14FMk"
    url: https://www.youtube.com/watch?v=65lmwo14FMk
  - title: Epic Diamond Slots
    company: Bagelcode
    provider: youtube
    id: "apW3OJf15rU"
    url: https://www.youtube.com/watch?v=apW3OJf15rU
  - title: Club Vegas
    company: Bagelcode
    provider: youtube
    id: "2_RlPzj9W1M"
    url: https://www.youtube.com/watch?v=2_RlPzj9W1M
  - title: City of Holdem
    company: SZ Code Lab
    provider: youtube
    id: "WVQzsbKQBOE"
    url: https://www.youtube.com/watch?v=WVQzsbKQBOE
gists:
  - label: UGUI Extension
    id: 09a022e7b59289e2b811cb60a518003d
  - label: Custom Shader
    id: a8b929b8791f8759b19068ec00c36c32
---

## Challenge

Across **eight live slot and casual titles** — Party Slots, Vegas Party Slots, Club Vegas, Epic Diamond Slots, Jackpotjoy, Starspins, Slot & Dragons, City of Holdem, and Golden Mango Casino — the same pattern recurred. Out-game lobbies accumulated dense UI/UX requirements, and in-game features added real-time masking/clipping. The result was **draw-call explosions and broken batching**, which produced critical frame drops on low-end devices. The breaking point came fast on legacy targets like the iPhone 5s.

## Solution

### Custom UGUI components

I subclassed and rewrote UGUI components to handle complex hierarchies and real-time clipping/masking **without breaking compatibility** with the rest of the project. New patterns plugged into the existing prefab graph and still benefited from optimized batching.

### A repeatable bottleneck-analysis routine

Every UI change went through a short checklist: profile draw calls, set-pass calls, and batches with **Unity Profiler + Frame Debugger**. Documenting that loop kept the bar consistent as the team grew.

### Canvas hierarchy redesign

Instead of one giant canvas, I split UI into **static / dynamic / overlay layers** and **reorganized the global atlas by layer and usage frequency**, so batching collapsed naturally on most screens.

<div class="mermaid" markdown="0">
graph TD
  Canvas["Root Canvas"]
  StaticLayer["<b>Static Layer</b><br/>Background · Frames · Headers<br/>(Batched aggressively)"]
  DynamicLayer["<b>Dynamic Layer</b><br/>Counters · Animations · Tooltips<br/>(Re-batched per frame)"]
  OverlayLayer["<b>Overlay Layer</b><br/>Popups · Toasts<br/>(On-demand canvas)"]
  AtlasGroup["<b>Global Atlas Groups</b><br/>per layer · per usage frequency"]

  Canvas --> StaticLayer
  Canvas --> DynamicLayer
  Canvas --> OverlayLayer
  StaticLayer --> AtlasGroup
  DynamicLayer --> AtlasGroup
  OverlayLayer --> AtlasGroup
</div>

### Lightweight custom shaders

For UI elements that didn't need full alpha testing or generic UI features, I replaced the default UI shader with **lightweight HLSL shaders**, cutting overdraw and shader switches on hot paths.

### Tooling for non-engineers

To keep new assets from breaking the batching structure, I shipped **editor inspector tooling** that designers and artists could use to test placements themselves. Mistakes were caught at the moment assets were added, not at build time.

## Achievements

- **Rock-solid 60 FPS on low-end devices.** *Slot & Dragons* held a steady 60 FPS with draw calls kept around ≤100 on iPhone 5s-class hardware.
- **Same playbook applied across eight live titles.** Bagelcode → StudioZoo → SZ Code Lab — each new project converged on the optimized structure faster than the last.
- **Productivity multiplier for non-engineers.** Inspector-driven scripts let design and art teams validate UI placements without an engineer in the loop, freeing core engineering time.
