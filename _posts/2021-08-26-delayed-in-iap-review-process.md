---
layout: post
title: Delayed in IAP Review Process
image: /assets/applereview.webp
date: 2021-08-26 22:53:34 +0900
tags: [iap, appstore]
categories: [unity]
---
<br>

# 인앱 결제 리뷰 지연 문제

신규 개발을 하다 보면 예상치 못한 **시스템 버그**나 **리뷰 지연** 문제를 마주하게 됩니다.  
최근 iTunes Connect에서 인앱 결제가 *“Waiting for Review”* 상태에서 멈춘채로 리뷰가 진행되지 않는 문제를 겪었습니다.
---

## 인앱 결제 리뷰 문제 해결 체크리스트
- [x] 인앱 결제를 앱 바이너리에 올바르게 첨부했는지 확인  
- [x] Clean Build로 다시 제출  
- [x] Apple 지원팀에 문의 (Contact Us)
- [x] Radar 버그 리포트 제출
- [x] 새로운 바이너리와 함께 인앱 결제 재제출  

---

## 교훈
- **문제의 원인은 종종 시스템 내부 버그**에 있다.  
- **Clean Build**는 가장 기본적이지만 강력한 해결책이다.  
- **의존성(Dependency) 확인**은 필수.  
- **공식 지원 채널에 문의**하는 것이 빠른 해결로 이어진다.  

---

## 마무리
결국 해결의 핵심은 **체계적인 체크리스트**와 **끈질긴 확인 과정**입니다.  
개발 과정에서 이런 경험은 귀찮지만, 동시에 성장의 발판이 됩니다.
애플은 죄가 없을거에요 아마도.
