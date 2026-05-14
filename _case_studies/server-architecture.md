---
layout: case-study
slug: server-architecture
title: 고가용성 게임 서버 플랫폼 아키텍처
subtitle: 글로벌 런칭 트래픽 스파이크를 흡수하는 클라우드 네이티브 인프라 설계
order: 3
companies: [SZ Code Lab]
tech: [ASP.NET Core, Node.js, TypeScript, Docker, Kubernetes (EKS), AWS, Terraform, Photon Engine, CloudWatch, Splunk, ELK]
mermaid: true
metrics:
  - label: 가용성
    value: Zero-downtime rolling updates
  - label: 트래픽 대응
    value: Pod 자동 스케일-아웃 (스파이크 대응)
  - label: 환경 일관성
    value: Dev · Staging · Prod (IaC)
  - label: 운영 인력
    value: 소규모 팀이 단독 관리
permalink: /portfolio/server-architecture/
lang: ko
page_id: case-server
---

## Challenge

두 프로젝트가 비슷한 시기에 서로 다른 종류의 서버 과제를 안겨줬습니다.

- **City of Holdem** — 클라이언트와 서버를 같은 언어·같은 컨텐츠 모델로 묶어, 기획·개발이 한쪽만 보고 일할 수 있게 만들어야 했습니다.
- **Golden Mango Casino** — 글로벌 런칭 + 대규모 마케팅 캠페인에서 발생하는 트래픽 스파이크를 흡수해야 했고, 그 인프라를 **소수 인원이 관리 가능**해야 했습니다.

## Solution

### City of Holdem — 클라이언트/서버 통합 워크플로우

- **프로토타이핑**: 네트워크 모듈을 Adapter 패턴으로 추상화해서 Mock 서버로 빠르게 시작했고, 이후 Photon Engine으로 실시간 멀티플레이 프로토타이핑.
- **라이브 아키텍처**: 서버 측을 **ASP.NET Core**로 재작성. 클라이언트와 같은 C# 위에서 컨텐츠 로직을 공유하니, 한 사람이 같은 코드 위에서 클라/서버를 모두 다루는 흐름이 가능해졌습니다.

### Golden Mango Casino — 클라우드 네이티브 인프라

<div class="mermaid" markdown="0">
graph TD
  Terraform["<b>Terraform (IaC)</b><br/>VPC · EKS · IAM · ECR<br/>Git-tracked, version-pinned"]
  AWS["<b>AWS</b><br/>VPC / EKS / ELB / CloudWatch"]
  EKS["<b>Kubernetes (EKS)</b><br/>Rolling updates · HPA"]
  Pods["<b>Game API Pods</b><br/>Node.js / TypeScript<br/>Dockerized"]
  Telemetry["<b>Telemetry</b><br/>CloudWatch + Splunk + ELK"]
  Envs["<b>Environments</b><br/>Dev / Staging / Prod"]

  Terraform --> AWS
  Terraform --> Envs
  AWS --> EKS
  EKS --> Pods
  Pods --> Telemetry
  Envs --> EKS
</div>

- **컨테이너화** — TypeScript/Node.js API 서버를 Docker로 패키징해서 실행 환경 일관성을 확보.
- **IaC (Terraform)** — VPC, EKS, IAM, ECR까지 전부 코드로 선언. Dev/Staging/Prod 간 차이는 변수로만 다루도록 정리해서 환경 간 의도치 않은 드리프트를 차단.
- **오케스트레이션 (K8s)** — 컨테이너 분배, 스케일링, 복구를 Kubernetes에 위임. 마케팅 캠페인 같은 예측 가능한 스파이크는 HPA로 흡수하고, 롤링 업데이트로 무중단 배포.
- **계측 (CloudWatch + Splunk + ELK)** — 부하 측정과 로직 에러 추적을 분리해, 인프라 알람과 애플리케이션 알람이 같은 채널에서 섞이지 않도록 했습니다.

## Achievements

- **무중단 + 고가용성** — K8s 롤링 업데이트로 라이브 업데이트를 끊김 없이 진행. 마케팅 이벤트 트래픽 급증도 자동 스케일-아웃으로 처리.
- **소수 인원으로 운영 가능한 클라우드** — Terraform과 IaC 원칙을 깊게 결합해, 복잡한 클라우드 생태계를 작은 팀이 관리·확장할 수 있는 구조를 만들었습니다.
- **클라이언트/서버 통합으로 사이클 단축** — *City of Holdem*에서 같은 C# 컨텐츠 모델을 양쪽에서 공유한 덕에, 컨텐츠 변경 한 건이 클라/서버 PR 두 개로 쪼개지지 않고 한 흐름으로 처리됐습니다.

> 이 케이스는 회사·게임 운영 데이터를 직접 다루는 영역이라 코드 스니펫·로그 캡처는 공유하지 않습니다. 구조와 의사결정 위주로 요약했고, 면접에서는 구체 수치와 트레이드오프를 따로 설명드릴 수 있습니다.
