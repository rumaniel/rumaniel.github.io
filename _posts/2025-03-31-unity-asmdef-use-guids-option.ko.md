---
layout: post
title: "Unity Assembly Definition (asmdef) Use GUIDs 옵션 이해하기"
description: Unity asmdef의 Use GUIDs 옵션 차이점과 GUID vs 기명 참조의 장단점 정리
image: /assets/coding.jpg
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

## 실제 파일 비교

### Use GUIDs ON

```json
// App.asmdef
{
  "name": "App",
  "rootNamespace": "",
  "references": [
    "GUID:861626f26602c48888a26b..."
  ],
  "includePlatforms": [],
  "excludePlatforms": [],
  "allowUnsafeCode": false,
  "overrideReferences": false,
  "precompiledReferences": [],
  "autoReferenced": true,
  "defineConstraints": [],
  "versionDefines": [],
  "noEngineReferences": false
}
```

### Use GUIDs OFF

```json
// Tests.EditMode.asmdef
{
  "name": "Tests.EditMode",
  "rootNamespace": "",
  "references": [
    "Model",
    "Service"
  ],
  "includePlatforms": [],
  "excludePlatforms": [],
  "allowUnsafeCode": false,
  "overrideReferences": false,
  "precompiledReferences": [],
  "autoReferenced": true,
  "defineConstraints": [],
  "versionDefines": [],
  "noEngineReferences": false
}
```

---

## 권장사항

### ✅ Use GUIDs 사용 권장

Unity 공식 문서에서는 **유지보수와 안정성**을 위해 Use GUIDs를 켜두는 것을 권장한다.

**장점:**
- 어셈블리 이름 변경 시 참조 유지
- 팀 프로젝트에서 충돌 감소
- 리팩토링 안전성 증가

**단점:**
- 텍스트 에디터에서 직접 편집 어려움
- JSON 파일 가독성 감소

### 📝 기존 파일 수정 방법

기존 asmdef 파일을 GUID 방식으로 변경하려면:

1. asmdef 파일 선택
2. 인스펙터에서 **Use GUIDs** 체크
3. Apply

이후 새로 추가하는 참조는 모두 GUID로 저장된다.

---

## 마이그레이션 팁

### 대량 변환 스크립트

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Compilation;
using System.IO;

public class AsmdefGuidMigration
{
    [MenuItem("Tools/Migrate asmdef to GUIDs")]
    static void MigrateToGuids()
    {
        var asmdefs = AssetDatabase.FindAssets("t:AssemblyDefinitionAsset");
        
        foreach (var guid in asmdefs)
        {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            var asmdef = AssetDatabase.LoadAssetAtPath<AssemblyDefinitionAsset>(path);
            
            // 인스펙터에서 Use GUIDs 활성화
            // (실제로는 내부 API 필요)
            Debug.Log($"Processing: {path}");
        }
        
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
    }
}
#endif
```

---

## 요약

- **Use GUIDs ON**: GUID로 참조 저장, 리네이밍 안전
- **Use GUIDs OFF**: 이름으로 참조 저장, 가독성 좋지만 위험
- **Unity 2019.1+** 에서 도입된 기능
- **새 asmdef 파일은 기본 ON**
- **기존 파일은 수동으로 체크 필요**

> 💡 **TL;DR**: asmdef 참조는 Use GUIDs를 켜두자. 이름 변경 시 참조가 깨지는 것을 방지할 수 있다.

---

## 참고 자료
- [Unity 2019.1.0b4 Release Notes](https://unity.com/releases/editor/beta/2019.1.0b4)
- [Unity 2019.1 릴리즈 노트 (일본어)](https://shibuya24.info/entry/unity_releasenote2019_1_0b2)
- [Unity Documentation - Assembly Definitions](https://docs.unity3d.com/Manual/ScriptCompilationAssemblyDefinitionFiles.html)
