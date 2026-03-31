---
layout: post
title: "Unity Assembly Definition (asmdef) Use GUIDs 옵션 이해하기"
description: Unity asmdef의 Use GUIDs 옵션 차이점과 GUID vs 기명 참조의 장단점 정리
image: /assets/asmdef-inspector.png
date: 2025-03-31 16:00:00 +0900
tags: [unity, asmdef, assembly-definition]
categories: [unity]
lang: ko
permalink: /unity-asmdef-use-guids-option/
---

# Unity Assembly Definition (asmdef) Use GUIDs 옵션 이해하기

Unity에서 Assembly Definition File(asmdef)을 작업하다 보면 **Use GUIDs**라는 옵션을 볼 수 있다. 새로 만든 asmdef 파일과 기존 파일의 참조 방식이 다르게 표시되는 현상을 겪을 수 있는데, 이는 바로 이 옵션 때문이다.

---

## 문제 상황

asmdef 인스펙터에서 다른 어셈블리를 참조할 때:

- **기존 파일**: `GUID:861626f26602c48888a26b...` (GUID로 표시)
- **새로 만든 파일**: `Model`, `Service` (이름으로 표시)

왜 이런 차이가 발생할까?

---

## 원인: Use GUIDs 옵션

asmdef 인스펙터 상단에 **Use GUIDs** 체크박스가 있다.

![인스펙터 스크린샷 - Use GUIDs 옵션 위치](/assets/asmdef-inspector.png)

### Use GUIDs 체크 ON (권장)
```json
{
  "reference": "GUID:861626f26602c48888a26b..."
}
```

### Use GUIDs 체크 OFF
```json
{
  "reference": "Model"
}
```

**새로 만든 asmdef 파일은 기본적으로 Use GUIDs가 체크되어 있지만, 기존 파일은 그렇지 않을 수 있다.**

---

## 실제 파일 비교

![GUID vs 기명 참조 차이](/assets/asmdef-code-diff.png)

왼쪽 파일(`Tests.EditMode.asmdef`)은 **이름으로 참조**하고, 오른쪽 파일(`App.asmdef`)은 **GUID로 참조**한다.

---

## GUID vs 기명 참조 비교

| 항목 | GUID 참조 | 기명 참조 |
|------|----------|----------|
| 저장 방식 | `"GUID:..."` | `"AssemblyName"` |
| 가독성 | 낮음 (GUID 문자열) | 높음 (직관적) |
| 리네이밍 안전성 | ✅ 안전 (이름 변경해도 유지) | ❌ 위험 (참조 끊김) |
| 팀 협업 | ✅ 충돌 적음 | ❌ 이름 충돌 가능 |
| 수동 편집 | 어려움 | 쉬움 |

---

## Unity 2019.1 패치 노트

이 기능은 **Unity 2019.1**에서 처음 도입되었다.

### 도입 배경

2019.1 이전에는 asmdef가 다른 asmdef를 참조할 때 **오직 어셈블리 이름**으로만 연결했다. 이 방식의 문제점:

1. **참조 대상의 이름이 변경되면** → 모든 참조가 깨짐 (Missing Reference)
2. **여러 프로젝트에서 같은 이름 사용 시** → 충돌 가능

이를 해결하기 위해 **meta 파일 기반의 GUID 참조 방식**을 추가했다.

### 공식 릴리즈 노트 원문

> Editor: Added support for referencing Assembly Definition Files with GUIDs instead of assembly names. Enable with 'Use GUIDs' option in Assembly Definition File inspector. Enabled by default for new Assembly Definition Files.
> 
> (에디터: 어셈블리 이름 대신 GUID를 사용하여 어셈블리 정의 파일을 참조하는 기능 추가. 인스펙터의 "Use GUIDs" 옵션으로 활성화. 새 파일 생성 시 기본적으로 활성화됨.)

---

## 마이그레이션 권장사항

### 기존 프로젝트 업데이트

1. **모든 asmdef 파일 열기**
2. **Use GUIDs 체크박스 활성화**
3. **Unity가 자동으로 기명 참조를 GUID로 변환**
4. **커밋 후 팀원과 공유**

### 주의사항

- **버전 관리**: Use GUIDs는 Unity 2019.1 이상에서만 지원
- **패키지 배포**: 에셋 스토어 패키지는 기본적으로 GUID 사용 권장
- **자동 변환**: Unity가 기존 기명 참조를 자동으로 GUID로 변환

---

## 요약

- `Use GUIDs` 체크 시: GUID로 저장 → **리네이밍 안전**
- `Use GUIDs` 해제 시: 이름으로 저장 → **읽기 쉽지만 위험**
- **Unity 2019.1+** 기능
- **새 asmdef 파일**은 기본적으로 Use GUIDs 활성화
- **기존 파일**은 수동으로 활성화 필요

> 💡 **TL;DR**: Use GUIDs를 켜면 어셈블리 이름이 바뀌어도 참조가 깨지지 않는다. Unity 2019.1+ 기능.

---

## 참고 자료
- [Unity 2019.1.0b4 Release Notes](https://unity.com/releases/editor/beta/2019.1.0b4)
- [Unity 2019.1 Release Notes (Japanese)](https://shibuya24.info/entry/unity_releasenote2019_1_0b2)
- [Unity Manual - Assembly Definitions](https://docs.unity3d.com/Manual/ScriptCompilationAssemblyDefinitionFiles.html)
