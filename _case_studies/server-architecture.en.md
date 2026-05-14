---
layout: case-study
slug: server-architecture
title: High-Availability Game Server Platform Architecture
subtitle: A cloud-native foundation that absorbs launch-day traffic for a small team to run
order: 3
companies: [SZ Code Lab]
tech: [ASP.NET Core, Node.js, TypeScript, Docker, Kubernetes (EKS), AWS, Terraform, Photon Engine, CloudWatch, Splunk, ELK]
mermaid: true
metrics:
  - label: Availability
    value: Zero-downtime rolling updates
  - label: Traffic
    value: HPA-driven pod scale-out for spikes
  - label: Environments
    value: Dev · Staging · Prod (IaC)
  - label: Ops team
    value: Operated by a small engineering team
permalink: /portfolio/server-architecture/
lang: en
page_id: case-server
---

## Challenge

Two projects arrived around the same time with very different server-side asks.

- **City of Holdem** — Unify the client and server so feature developers could write cross-platform content logic in one language.
- **Golden Mango Casino** — Survive global-launch and marketing-campaign traffic spikes, and stay **manageable by a small engineering team**.

## Solution

### City of Holdem — a unified client/server workflow

- **Prototyping**: Abstracted the network module behind an Adapter, started development against a mock server, and moved to Photon Engine for real-time multiplayer prototyping.
- **Live architecture**: Rewrote the server side in **ASP.NET Core** so client and server share the same C# content logic. The same engineer can implement a feature end-to-end without context-switching languages.

### Golden Mango Casino — cloud-native infrastructure

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

- **Containerization** — TypeScript/Node.js API servers packaged into Docker images so the runtime environment was identical from a dev laptop to production.
- **IaC with Terraform** — VPC, EKS, IAM, ECR — everything declared as code. Differences between Dev / Staging / Prod live as variables only, which kills the silent environment drift that normally rots multi-env setups.
- **Orchestration on Kubernetes** — Distribution, scaling, recovery delegated to K8s. Predictable spikes (marketing campaigns) ride on HPA, and rolling updates keep deploys zero-downtime.
- **Telemetry layered intentionally** — CloudWatch + Splunk for infra load, ELK for application/logic errors. Each channel watches what it should watch.

## Achievements

- **Zero-downtime live updates and elastic traffic handling.** Kubernetes rolling updates plus HPA absorbed major marketing-driven spikes with no service interruptions.
- **A small team running a complex cloud.** Terraform + IaC discipline made the entire ecosystem manageable, extendable, and reproducible by a small engineering team.
- **Faster feature cycles thanks to client/server unification.** In *City of Holdem*, a content change is one flow on one language instead of two parallel PRs in two stacks.

> This case touches operational data, so I don't share code excerpts or log captures publicly. The summary stays at the structural and decision level; concrete numbers and trade-offs are best discussed in an interview.
