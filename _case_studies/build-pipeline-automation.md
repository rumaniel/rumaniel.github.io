---
layout: case-study
slug: build-pipeline-automation
title: 플러그인 통합 & 빌드 파이프라인 자동화
subtitle: 비엔지니어가 직접 빌드를 돌리는 CI/CD 환경 구축
order: 2
companies: [Bagelcode, StudioZoo, SZ Code Lab]
tech: [Jenkins, Fastlane, Groovy, Shell, Java, Objective-C, C++, JavaScript, Unity Editor Scripting]
mermaid: true
metrics:
  - label: 지원 플랫폼
    value: iOS · Android · WebGL · UWP
  - label: 환경 분기
    value: Dev / QA / Prod
  - label: 배포 채널
    value: Slack · Firebase App Distribution · TestFlight
  - label: 트리거
    value: QA · Design · Product 셀프 서비스
permalink: /portfolio/build-pipeline-automation/
lang: ko
page_id: case-build-pipeline
gists:
  - label: Build/Editor Scripts
    id: 2291d985472a2d9424dda4623dec457e
  - label: Fastlane Scripts
    id: b72e2d7f52e108d3957982ede24b00f0
---

## Challenge

라이브 게임 운영에는 두 가지 부담이 동시에 걸립니다. **(a) 다양한 퍼블리셔 SDK와 Unity가 직접 지원하지 않는 네이티브 기능을 안정적으로 통합**해야 하고, **(b) 빌드/배포 과정이 자동화되어 있어야** QA·디자인·기획이 엔지니어를 기다리지 않고 단말에서 바로 검증할 수 있습니다. 빌드가 사람 손을 거치는 시점이 늘어날수록 사이클이 늘어나고, 엔지니어는 코어 작업에서 멀어집니다.

## Solution

### 네이티브 플러그인 통합

Unity 래퍼가 없는 서드파티 SDK는 **프록시 패턴**으로 통합해서, 게임 코드 입장에서는 균일한 인터페이스만 보이도록 했습니다. 플랫폼별 네이티브 코드(Java · Objective-C · C++ · JS)를 직접 작성해 구독 결제, IAP 영수증 검증, 푸시, 햅틱 같은 복잡한 흐름을 처리했습니다.

### Jenkins + Fastlane 기반 CI/CD

비엔지니어도 다룰 수 있는 셀프서비스 빌드 환경이 목표였습니다. 핵심은 **파라미터화된 잡 + 동적 설정 주입 + 자동 배포**의 세 층입니다.

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

- **파라미터화** — App / Version / Platform / Env 같은 차원을 잡 파라미터로 표면화. 잡 하나가 모든 빌드 요청을 받습니다.
- **동적 설정 주입** — Pre-build 단계의 셸 + Unity Editor 스크립트가 App 아이콘·스플래시·Bundle ID·JSON 설정을 파라미터에 맞춰 스왑.
- **자동 배포** — Fastlane이 결과물(APK·IPA)을 Slack, Firebase App Distribution, TestFlight 채널로 푸시.

### 신규 플랫폼·신규 기능을 빠르게 얹는 구조

프록시 패턴이 자리잡힌 뒤에는 새 플랫폼 대응이 추가 비용이 아니라 **재사용**이 됐습니다. 서버 동기화 결제 복원, 커스텀 푸시, 햅틱 컨트롤, WebGL 전용 로딩 랜딩 페이지 같은 플랫폼별 기능들이 같은 인터페이스 위에서 굴러갑니다.

## Achievements

- **QA · 디자인 · 기획의 셀프서비스 빌드** — 엔지니어가 빌드 버튼을 누르는 일이 사라지면서 코어 작업 집중도가 크게 올라갔습니다.
- **여러 플랫폼·여러 게임에 동일 파이프라인 재활용** — 한 번 잘 만든 파이프라인을 다음 프로젝트에 그대로 옮겨 초기 셋업 시간을 단축.
- **장애 추적 용이성** — 모든 빌드가 파라미터·로그·결과물 링크가 묶인 단일 잡 단위로 남아, 문제가 생긴 빌드를 시간순으로 재추적하기 쉬워졌습니다.
