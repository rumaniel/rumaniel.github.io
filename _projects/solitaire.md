---
layout: project
slug: solitaire
title: Solitaire
subtitle: Unity로 만든 클래식 카드 게임
status: 서비스 중
order: 1
image: /assets/portfolio/solitaire/feature-graphic.png
image_alt: Solitaire feature graphic
tech: [Unity 2022.3 LTS, C#, VContainer, R3, UniTask, MemoryPack, Addressables, GitHub Actions]
links:
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.mangru.solitaire
  - label: itch.io
    url: https://rumaniel.itch.io/solitaire-tower
  - label: GitHub
    url: https://github.com/rumaniel/solitaire
permalink: /portfolio/solitaire/
lang: ko
page_id: project-solitaire
---

Clean Architecture를 기반으로 직접 설계한 솔리테어(클론다이크/이스트헤이븐) 카드 게임입니다. 도메인 모델은 Unity 의존을 배제했고, VContainer로 의존성 주입을, R3 + UniTask로 반응형/비동기 흐름을 다룹니다. 현재 Google Play와 itch.io에 출시되어 서비스 중이며, 기능을 다듬어가는 중입니다.

## 스크린샷

![로비 화면](/assets/portfolio/solitaire/screenshots/01-lobby.png)

![인게임 진행](/assets/portfolio/solitaire/screenshots/02-midgame.png)

![힌트 표시](/assets/portfolio/solitaire/screenshots/04-hint.png)

![승리 패널](/assets/portfolio/solitaire/screenshots/06-win-panel.png)

![통계 화면](/assets/portfolio/solitaire/screenshots/07-stats.png)

## 핵심 기능

- 클론다이크 / 이스트헤이븐 두 가지 룰 지원
- 드래그 & 드롭 카드 이동, 자동 카드 검증
- 힌트 시스템과 자동 승리(Auto-win) 처리
- 무제한 언두/리두
- 세션 통계 + 라이프타임 통계 (승률, 연승, 최고 점수)
- 한국어 / 영어 로컬라이즈
- 세션 스냅샷 저장·복원

## 아키텍처

도메인 → 데이터 → 서비스 → 게이트웨이 → 컴포넌트 → 코어 → 씬 → 앱으로 이어지는 10개 어셈블리 레이어로 구성했습니다. 도메인 모델에는 Unity 의존을 두지 않아 순수 C#으로 단위 테스트가 가능하고, VContainer로 각 레이어 간 결합을 의존성 주입으로 끊어냈습니다. 게임 룰은 전략(Strategy) 패턴으로, 카드/UI 흐름은 R3 스트림과 UniTask로 다뤄 상태 변화 추적과 비동기 처리가 단순합니다.

## 빌드/배포

GitHub Actions(self-hosted macOS runner) 위에 EditMode 테스트 → Android 빌드 검증 → AAB 서명 → Play Console 업로드까지 이어지는 파이프라인을 구성했습니다. 모든 PR은 테스트 + 빌드 게이트를 통과해야 머지되며, 릴리즈 노트는 머지된 PR에서 자동 생성됩니다.

## 직접 플레이해보기

위의 **Google Play** 또는 **itch.io** 버튼을 눌러 설치/플레이할 수 있습니다. 코드는 **GitHub** 저장소에서 확인할 수 있습니다.
