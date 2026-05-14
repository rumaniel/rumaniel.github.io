---
layout: case-study
slug: build-pipeline-automation
title: Plugin Integration & Build Pipeline Automation
subtitle: A self-service CI/CD environment that non-engineers can actually run
order: 2
companies: [Bagelcode, StudioZoo, SZ Code Lab]
tech: [Jenkins, Fastlane, Groovy, Shell, Java, Objective-C, C++, JavaScript, Unity Editor Scripting]
mermaid: true
metrics:
  - label: Platforms
    value: iOS · Android · WebGL · UWP
  - label: Environments
    value: Dev / QA / Prod
  - label: Distribution
    value: Slack · Firebase App Distribution · TestFlight
  - label: Trigger
    value: Self-serve by QA · Design · Product
permalink: /portfolio/build-pipeline-automation/
lang: en
page_id: case-build-pipeline
gists:
  - label: Build / Editor Scripts
    id: 2291d985472a2d9424dda4623dec457e
  - label: Fastlane Scripts
    id: b72e2d7f52e108d3957982ede24b00f0
---

## Challenge

Operating live games piles two demands on top of each other: **(a) integrate a variety of publisher SDKs and native features Unity doesn't expose directly**, and **(b) automate the build and distribution flow so QA, design, and product can validate on real devices without an engineer in the loop**. Every manual hand-off in the build path lengthens the cycle and pulls engineers away from core work.

## Solution

### Native plugin integrations

For third-party SDKs that lacked Unity wrappers, I wrapped them with a **proxy pattern** so game code saw a uniform interface regardless of the underlying platform. The platform-specific layers — written in Java, Objective-C, C++, and JS — handled the messy realities: subscription billing, IAP receipt validation, push notifications, haptics.

### Jenkins + Fastlane CI/CD

The goal was a build path that non-engineers could drive. Three layers, parameter-driven end to end:

<div class="mermaid" markdown="0">
graph LR
  Trigger["Trigger<br/>(QA · Design · Product)"]
  Params["Jenkins Job<br/>App / Version / Platform / Env"]
  PreBuild["Pre-build Hooks<br/>(Shell + C# Editor scripts)"]
  Build["Unity Build<br/>(iOS / Android / WebGL / UWP)"]
  PostBuild["Post-build Hooks<br/>(sign · meta · validate)"]
  Distribute["Fastlane Distribution<br/>(Slack · Firebase · TestFlight)"]

  Trigger --> Params
  Params --> PreBuild
  PreBuild --> Build
  Build --> PostBuild
  PostBuild --> Distribute
</div>

- **Parameterization** — Jenkins jobs expose App / Version / Platform / Env as parameters, so one job answers every request.
- **Dynamic configuration** — Pre-build shell + Unity Editor scripts inject and swap app icons, splash images, bundle IDs, and JSON configs based on selected parameters.
- **Automated distribution** — Fastlane uploads each successful APK/IPA straight to Slack, Firebase App Distribution, and TestFlight.

### A platform-extension pattern, not a one-off

Once the proxy pattern landed, adding a new platform stopped being a tax — it became reuse. Server-synced purchase restoration, custom push channels, haptic controls, and a WebGL-specific loading landing page all rode on the same shared interface.

## Achievements

- **Self-service builds for QA, design, and product.** Engineers stopped pressing build buttons, which reclaimed focus for actual engineering work.
- **One pipeline, many games.** Each new project inherited the pipeline with minimal setup.
- **Traceable failures.** Every build is a single Jenkins job with bound parameters, logs, and artifact links, so problematic builds are easy to reproduce historically.
