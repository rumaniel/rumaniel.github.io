---
layout: case-study
slug: ugui-rendering-optimization
title: UGUI 렌더링 최적화
subtitle: 다회사·다게임에 걸친 라이브 게임 UI 성능 엔지니어링
order: 1
companies: [Bagelcode, StudioZoo, SZ Code Lab]
tech: [Unity, UGUI, NGUI, C#, HLSL, Unity Profiler, Frame Debugger]
mermaid: true
metrics:
  - label: 평균 FPS
    value: 60 (저사양 단말 기준)
  - label: 최대 Draw Calls
    value: ≈ 100
  - label: 검증 단말
    value: iPhone 5s · 저사양 Android
  - label: 적용 타이틀
    value: 8종 라이브 게임
permalink: /portfolio/ugui-rendering-optimization/
lang: ko
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

Party Slots부터 Golden Mango Casino까지, **8종의 라이브 슬롯·캐주얼 게임**을 NGUI와 UGUI로 개발하면서 동일한 패턴이 반복적으로 나타났습니다. 로비의 복잡한 UI/UX 요구가 누적되고, 인게임에서 실시간 마스킹/클리핑이 추가되면, **Draw Call 폭증과 비효율적 Batching**으로 저사양 단말에서 프레임이 끊겼습니다. iPhone 5s 같은 레거시 타깃에서는 UX가 무너지는 임계점이 빨리 왔습니다.

## Solution

### 커스텀 UGUI 컴포넌트

복잡한 UI 구조와 실시간 마스킹/클리핑을 다루기 위해, **UGUI 컴포넌트를 상속해 재작성**했습니다. 호환성을 유지한 채로 동적 클리핑·중첩 마스크를 안전하게 처리하도록 했습니다.

### 병목 분석 루틴 정착

Unity Profiler와 Frame Debugger로 **Draw Call · SetPass · Batches를 주기적으로 측정**했습니다. UI 변경이 들어올 때마다 단순한 체크리스트를 따라가도록 문서화해서, 새 인원이 합류해도 같은 기준을 유지할 수 있게 했습니다.

### Canvas 계층 재설계

Canvas 한 장에 모든 UI를 던지지 않고, **동적/정적 요소를 분리**하고 **전역 아틀라스를 레이어 단위로 재구성**해서 Batching이 최대로 작동하는 구조로 정리했습니다.

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

### 경량 커스텀 셰이더

UI 요소에 따라 기본 UI 셰이더를 **HLSL 기반 경량 셰이더**로 교체했습니다. 알파 테스트가 필요 없는 요소는 단순화하고, 마스크가 필요한 요소는 전용 셰이더로 분리해 오버드로우를 줄였습니다.

### 아트팀과의 파이프라인

UI 에셋이 추가될 때마다 최적화 구조가 깨지지 않도록, **에디터 인스펙터에 자동화 스크립트**를 붙여 디자이너·아티스트가 직접 배치를 검증하게 만들었습니다. 빌드 직전이 아니라 **에셋 추가 시점**에 잘못된 패턴을 차단했습니다.

## Achievements

- **저사양 단말에서 안정적 60 FPS** — *Slot & Dragons*에서 iPhone 5s 기준 Draw Call을 ~100 이하로 유지하면서 60 FPS 안정화.
- **8종 라이브 타이틀에 동일 패턴 적용** — Bagelcode, StudioZoo, SZ Code Lab을 거치며 같은 원칙으로 신규 프로젝트마다 적용 시간 단축.
- **개발 생산성 향상** — 비엔지니어(디자이너·아티스트)도 인스펙터에서 직접 배치를 시도·검증할 수 있어, 엔지니어가 매 PR마다 손대지 않아도 되는 워크플로우 정착.
