---
layout: project
slug: solitaire
title: Solitaire
subtitle: A classic card game made with Unity
status: Live
order: 1
image: /assets/portfolio/solitaire/feature-graphic.png
image_alt: Solitaire feature graphic
tech: [Unity 6.3 LTS, C#, VContainer, R3, UniTask, MemoryPack, Addressables, GitHub Actions]
links:
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.mangru.solitaire
  - label: itch.io
    url: https://rumaniel.itch.io/solitaire-tower
  - label: GitHub
    url: https://github.com/rumaniel/solitaire
permalink: /portfolio/solitaire/
lang: en
page_id: project-solitaire
---

A Klondike / Easthaven solitaire game built on a Clean Architecture foundation. Domain models are kept Unity-free; VContainer handles dependency injection, while R3 + UniTask drive reactive and async flows. The game is live on Google Play and itch.io, and is still being polished and extended.

## Screenshots

![Lobby](/assets/portfolio/solitaire/screenshots/01-lobby.png)

![Mid-game](/assets/portfolio/solitaire/screenshots/02-midgame.png)

![Hint overlay](/assets/portfolio/solitaire/screenshots/04-hint.png)

![Win panel](/assets/portfolio/solitaire/screenshots/06-win-panel.png)

![Stats screen](/assets/portfolio/solitaire/screenshots/07-stats.png)

## Key features

- Two rule sets: Klondike and Easthaven
- Drag-and-drop card movement with automatic move validation
- Hint system and auto-win handling
- Unlimited undo / redo
- Session stats and lifetime stats (win rate, streak, best score)
- Korean / English localization
- Session snapshot save and restore

## Architecture

The codebase is split into ten assembly layers: Domain → Data → Service → Gateway → Component → Core → Scene → App. The domain layer carries no Unity dependencies, so it can be unit-tested in pure C#. VContainer wires the layers via DI; game rules are encapsulated as Strategy implementations; reactive UI and async work flow through R3 streams and UniTask, which keeps state changes and async paths easy to follow.

## Build & release

A GitHub Actions pipeline (self-hosted macOS runner) runs EditMode tests, builds and validates the Android AAB, signs it, and uploads a draft to the Play Console. Every pull request must pass tests + build before it can merge, and release notes are generated from merged PRs.

## Try it

Use the **Google Play** or **itch.io** buttons above to install and play. The source is available on **GitHub**.
