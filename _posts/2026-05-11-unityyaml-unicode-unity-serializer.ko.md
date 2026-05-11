---
layout: post
title: "UnityYAML과 Unicode: Unity Serializer의 문자 처리 이슈"
description: UnityYAML과 Unicode 문자와 그 활용 방법에 대한 심층 분석
image: /assets/coding.jpg
date: 2026-05-11 12:00:00 +0900
tags: [unicode, character, encoding, unity, yaml]
categories: [unity]
lang: ko
permalink: /unityyaml-unicode-unity-serializer/
---

# UnityYAML in Unity Serializer

유니티에서는 meta 파일 등 여러 형식에서 YAML 파일을 사용합니다.
그러나 UnityYAML은 표준 YAML 1.2가 아니라 Unity custom-optimized 된 커스텀 YAML 라이브러리입니다.

공식 문서를 살펴보면 다음과 같은 디테일들이 있습니다.

["You cannot externally produce or edit UnityYAML files."](https://docs.unity3d.com/Manual/UnityYAML.html)

["You can use UTF-8 characters in scalars, but UnityYAML only decodes them when they are part of a double quoted scalar."](https://docs.unity3d.com/Manual/UnityYAML.html)

즉, plain scalar(따옴표 없는 스칼라)와 single-quoted scalar(단일 따옴표 스칼라)에서는 UTF-8 바이트가 디코딩되지 않고 그대로 패스스루되지만, double-quoted scalar(이중 따옴표 스칼라)에서는 적극적으로 escape 시퀀스를 해석하려고 시도합니다. 그리고 이게 escape 정책 비대칭을 야기하는걸로 보입니다.

또 comments, complex, mapping keys, tags 등의 YAML 요소들도 지원하지 않아, UnityYAML은 YAML 1.2의 subset이자, Unity의 특정 요구사항에 맞춘 커스텀 포맷으로 이해하는 것이 맞습니다.

---

## Unicode 개요

우선 이 문서를 읽기전에 다음과 같은 간단한 Unicode 개요를 알고 있으면 좋습니다.
Unicode는 전 세계의 모든 문자를 고유한 코드 포인트로 표현하는 표준입니다. 각 문자는 U+0000에서 U+10FFFF 사이의 코드 포인트를 가지며, 이를 UTF-8, UTF-16, UTF-32 등의 인코딩 방식으로 표현할 수 있습니다.

- 코드 포인트 (Code Point)
유니코드가 각 문자에 부여하는 추상적 번호. U+0041 처럼 U+ 뒤에 16진수로 표기. 현재 할당 범위는 U+0000 ~ U+10FFFF (총 1,114,112개).
```
U+0041  →  'A'
U+AC00  →  '가'
U+1F600 →  '😀'
U+0000  →  NULL (U+0000도 유효한 CP)
```

- 코드 유닛 (Code Unit)
인코딩이 실제 메모리에 쓰는 단위. 인코딩마다 크기가 다르고, 하나의 코드 포인트가 여러 코드 유닛으로 표현될 수 있음.
```
UTF-8  : 1 code unit = 1 byte
UTF-16 : 1 code unit = 2 bytes
UTF-32 : 1 code unit = 4 bytes

'가' (U+AC00)
  UTF-8  : 3 code units (3 bytes)
  UTF-16 : 1 code unit  (2 bytes)
  UTF-32 : 1 code unit  (4 bytes)
```

- BMP
Basic Multilingual Plane. U+0000~U+FFFF. 대부분의 현대 문자가 여기 있음. UTF-16으로 2바이트.

- 서로게이트 쌍(surrogate pair)
U+FFFF 초과 문자를 UTF-16으로 표현하기 위해 2개의 코드 유닛(4바이트)을 쌍으로 사용. High(D800-DBFF) + Low(DC00-DFFF).

- BOM
Byte Order Mark. UTF-16/32에서 바이트 순서를 알리기 위해 파일 맨 앞에 붙임. UTF-8 BOM(EF BB BF)은 불필요하나 Windows 관행.

---

## 문제 상황

![C# in Depth 2th](/assets/unity6_crash.png)

개발하는 도중 localization에서 Unicode 이모지(🃏)를 활용하려 했는데, 다음과 같은 에러를 만났습니다.

**에러 메시지**
```csharp
[Worker2] Unable to parse file Assets/Localization/Tables/Share_ko.asset:
  [Parser Failure at line 24: Found invalid Unicode character escape code]
```

en 파일은 literal UTF-8 이모지 그대로 파싱이 잘 되었는데, ko 파일만 surrogate pair escape(**\uD83C\uDCCF**)로 변환되어 있어 Unity YAML 파서가 lone high surrogate를 reject 하는 것으로 보입니다.

---

## Unity Serializer가 esacape를 결정하는 규칙

유니티 포럼에서 관련된 이슈를 찾아보니 비슷한 이슈를 발견 하였습니다. 

```
This will properly serialize into unicode, and the string will be surrounded by quotes. This works on device.

"This is only a test. \U0001F3F0\U0001F622" (two copied and pasted emoji, as invisible characters in the string field)

However, if I then manually type the unicode in so that I can see it in editor, the resulting YAML will not have quotes around it, and it will not work on device.

This is only a test. \U0001F3F0\U0001F622 (manually typed, or copied from the prior YAML)
```
[String field serializes with and without quotes depending on content?](https://discussions.unity.com/t/string-field-serializes-with-and-without-quotes-depending-on-content/855492)

이 테스트로 보건데 serializer는 문자열 내용을 보고 quoting 스타일을 자동 선택하는 걸로 보입니다.
규칙은 대략 이렇게 추론됩니다.

1. 모든 문자가 plain scalar로 안전하게 표현 가능 → 따옴표 없음 (plain scalar)
2. 특수 문자, 컨트롤 문자, 후행 공백, 또는 시작이 special char → double-quoted + escape
3. double-quoted를 선택하면 non-ASCII는 \u escape로 변환

String.Length 관점에서 보면 BMP 밖 문자 1개는 C# 입장에서 char 2개(서로게이트 쌍)입니다.즉, serializer가 char[] 순회하면서 escape를 만들 때 코드 포인트 단위가 아니라 코드 유닛 단위로 처리하면 **\uD83C\uDCCF**가 만들어집니다. **\U0001F0CF** 형식이 안 나오는 이유는 .NET String의 내부 표현 자체가 UTF-16 코드 유닛 시퀀스이기 때문입니다.

---

## 그래서 정확히 무슨 일이 일어났을까?

정확한 동작은 Unity 소스가 비공개라 확정은 못해 몇가지 시나리오를 생각해 볼 수 있습니다.

1. 한글 트리거 가설 
ko 파일의 한글 때문에 serializer가 "non-ASCII 발견 → double-quoted + escape 정책" 으로 진입했고, 같은 문자열 안의 emoji도 동일하게 \uXXXX 처리 된걸로 보입니다.
→ 하지만 이게 맞다면 한글이 escape돼야 하는데, BMP 안에 있는 한글 완성형(U+AC00~)은 plain scalar 안에서도 valid UTF-8 byte로 안전하게 표현 가능하므로 escape할 필요가 없습니다. 즉 한글 자체가 트리거였다기보단 emoji가 트리거였을 가능성이 더 커 보입니다.

2. Emoji 트리거 + Locale별 다른 직렬화 경로 가설 
Unity Localization 패키지가 string entry를 직렬화할 때, emoji 같은 non-BMP 문자가 포함되면 serializer가 double-quoted 경로로 진입합니다. 

그런데 en 파일은 literal UTF-8 bytes 상태로 저장됐고, 그 이후 re-serialize 되지 않았으나, ko 파일은 한글 텍스트를 편집하면서 Editor가 m_Localized 항목 전체를 re-serialize했고, 그때 emoji가 \uXXXX escape로 변환되는 걸로 보입니다.

즉 차이는 "어떤 텍스트가 들어있냐"가 아니라 **"마지막으로 누가 / 언제 / 어떤 도구가 그 파일을 write 했냐"**일 가능성이 있습니다. 위 포럼 사례에서도 정확히 같은 콘텐츠가 입력 방식(클립보드 vs 타이핑)에 따라 다르게 직렬화 되는걸 확인 하였습니다. Unity는 이걸 의도된 동작으로 보고 있어서 해당 포럼 글에 관련된 fix는 없었습니다.

3. Unity Localization 1.x 시리즈의 알려진 직렬화 버그
Unity Localization changelog를 보면 escape 관련 fix들을 찾아 볼 수 있습니다.

["Fixed Android build failure when the application name contains an escape character (LOC-292)"](https://docs.unity3d.com/Packages/com.unity.localization@1.0/changelog/CHANGELOG.html)

그리고 2022년에 보고된 IL2CPP 관련 버그도 확인 할 수 있습니다.

["TextMeshPro accepts surrogate pair characters (e.g. emojis), however it doesn't properly handle them causing a crash within the IL2CPP marshaller"](https://issuetracker.unity3d.com/issues/backport-il2cpp-doesnt-properly-handle-invalid-surrogate-pairs-causing-crash)

이 버그들의 패턴이 일관되 보입니다. Unity는 서로게이트 쌍 처리에 일관성 있는 이슈가 있는걸로 보입니다. Localization 패키지 자체가 ScriptableObject 기반인데, Unity의 native YAML serializer가 ScriptableObject의 string field를 쓸 때 위에 설명한 자동 quoting 규칙을 적용합니다. Localization 패키지가 별도로 emoji-safe writer를 가지고 있지 않기 때문에 이런 문제가 발생하는 걸로 보입니다.

---

## 그럼 왜 long surrogate가 invalid escape로 처리되나?

YAML 1.2.2 spec을 살펴보면 다음을 확인 가능합니다.
"Escape sequences are only interpreted in double-quoted scalars... Escaped 16-bit Unicode character (\u)... Escaped 32-bit Unicode character (\U)"
YAML 표준 YAML은 \uXXXX 와 \Uxxxxxxxx 둘 다 valid Unicode scalar value를 기대합니다. 
Surrogate range(U+D800–DFFF)는 valid scalar value가 아님.


> "The spec around escaped unicode characters lacks any mention of surrogates being encoded in two \u sequences, but rather specifies \u as: which is an unhelpfully not-even-wrong statement. In practice, trying to treat JSON as a subset of YAML results in things not round-tripping"
[YAML is equally horrible and the spec is an order of magnitude more complex.](https://news.ycombinator.com/item?id=12797294)

JSON은 관용적으로 \uD83C\uDCCF 같은 surrogate pair 페어링을 허용하지만(RFC 8259가 명시적으로 다룸), YAML에서는 UsB(Unspecfified Behavior) 입니다. 즉, 각 파서 구현체에 따라 결정 됩니다. UnityYAML 파서는 strict 쪽을 택해서 lone surrogate를 만나는 순간 reject, 또 다른 YAML 라이브러리 yaml/YAML2 wiki에서도 명시적으로 언급합니다.

> "It is only possible to place invalid UTF-16 in a scalar by using the double-quoted notation"
 [Yaml wiki](https://github.com/yaml/YAML2/wiki/Invalid-utf)


그래서 보이는 상황은 다음과 같습니다.

1. Unity native serializer가 `\uD83C\uDCCF` 를 write (UTF-16 code unit 단위로 escape)
2. Unity YAML 파서가 그 파일을 read 할 때, `\uD83C` 토큰을 만나서 single Unicode scalar value로 해석 시도
3. U+D800–DBFF 범위는 valid scalar value가 아님 → "invalid Unicode character escape code"

같은 도구 안에서도 writer와 reader 사이에 합의가 깨진 상황으로 보입니다. Writer는 "이건 UTF-16 surrogate pair니까 reader가 알아서 페어링하겠지" 가정하고, reader는 strict YAML spec을 따라서 reject. 이건 사실 Unity 측의 이슈라고 보입니다.

---

## en 파일이 살아남은 이유

위 가정 대로라면 en 파일도 문제가 되야 하는데, 실제 문제는 ko 파일에만 발생하였습니다.

그런데 살아있다는 건 다음과 같이 가설을 세워 볼 수 있습니다.

1. en 파일이 더 오래된 Unity 버전이나 다른 경로로 만들어져서 plain scalar 또는 single-quoted scalar로 저장되어 `\` 가 escape 문자로 해석 안 되니까 emoji UTF-8 bytes가 그대로 살아있게 되고, 따라서 파서가 plain scalar의 UTF-8 bytes는 그대로 패스스루 한걸로 보입니다.

2. en 파일도 double-quoted였는데, serializer가 BMP 안의 문자만 있는 경우엔 escape 없이 literal UTF-8을 그대로 쓰고, non-BMP 문자 (emoji) 가 새로 추가될 때 escape 변환을 트리거 한겁니다. 만약 en에 처음부터 emoji가 있던 게 아니라 나중에 추가됐고, 추가하는 시점에 어떤 다른 경로(예: importer, batch script, source control)를 거쳤다면 escape를 회피했을 수 있습니다.

만약 ko 텍스트를 편집할 때 Inspector에서 직접 텍스트 수정 하였을떄 → SerializedObject.ApplyModifiedProperties → asset write 트리거 → escape 정책 적용 되는 과정을 겪었을 것입니다.

만약 en은 그 사이에 손대지 않아서 이전 형식 유지 되었을 테고 같은 emoji 같은 코드인데 결과가 달랐던 건 `"마지막 writer가 누구였냐"` 의 차이가 있을 수 있습니다.

--- 

## 검증/방어 전략

1. non-BMP 문자를 localization에서 아예 피하는 방법입니다. 이모지는 TextMeshPro Atlas 문제도 같이 딸려오기 때문에 실용적으로 최선인 경우가 많습니다.

2. U+10XXXX escape 형식 사용하는 방법입니다. YAML spec은 \Uxxxxxxxx (대문자 U, 8자리)로 non-BMP를 서로게이트 없이 직접 표현할 수 있습니다.

3. .asset 파일 변경 후 CI에서 byte 검증 스크립트 돌리기. 서로게이트 range인 0xED 0xA0 0x80 ~ 0xED 0xBF 0xBF (UTF-8로 인코딩된 서로게이트, 기술적으로 invalid UTF-8)이나 \uD[89AB] 패턴을 grep으로 잡아서 체크 해볼 수 있습니다.


```bash
# 출력이 있으면 lone/surrogate-pair escape → 크래시 위험
grep -Pn '\\uD[89AB][0-9A-Fa-f]{2}' Assets/Localization/Tables/*.asset

# 모든 .asset 파일에서 surrogate escape 패턴 찾기
grep -rPn '\\u[Dd][89ABab][0-9A-Fa-f]{2}' Assets/Localization/Tables/

# YAML 안에 lone surrogate (페어 안 맞는 것) 찾기
grep -rPn '\\u[Dd][89AB][0-9A-Fa-f]{2}(?!\\u[Dd][CDEFcdef])' Assets/
```

4. Unity 버전 확인. 이 serialize 버그가 특정 Unity 버전에서 수정됐을 수 있습니다. Editor 버전과 Unity Localization 패키지 버전 업데이트 시 같이 체크 해봐야 합니다.


---

## 요약

결론적으로 이 크래시는 세 개의 서로 다른 스펙이 교차하는 지점에서 터진 걸로 보입니다. 

1. C# string의 UTF-16 내부 표현
2. Unity serializer의 escape 정책 비일관성
3. YAML scalar value 정의에서의 서로게이트 배제.

각 레이어 단독으론 무해하지만 조합되면 이런 크래시 체인이 생성될 수 있습니다.

---

## 참고 자료
- [The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)
- [Unity YAML Manual](https://docs.unity3d.com/Manual/UnityYAML.html)
- [String field serializes with and without quotes depending on content?](https://discussions.unity.com/t/string-field-serializes-with-and-without-quotes-depending-on-content/855492)
- [YAML Spec](https://yaml.org/spec/1.2.2/)
- [Invalid UTF-8 처리](https://github.com/yaml/YAML2/wiki/Invalid-utf)
- [YAML is equally horrible and the spec is an order of magnitude more complex](https://news.ycombinator.com/item?id=12797294)
- [Unity IL2CPP surrogate pair issue](https://issuetracker.unity3d.com/issues/backport-il2cpp-doesnt-properly-handle-invalid-surrogate-pairs-causing-crash)
- [Unity Localization Change logs](https://docs.unity3d.com/Packages/com.unity.localization@1.5/changelog/CHANGELOG.html)