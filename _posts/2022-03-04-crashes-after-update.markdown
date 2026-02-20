---
layout: post
title: Crashes after Update
image: /assets/idewithnotebook.webp
date: 2022-03-04 13:52:23 +0900
tags: [macos, android]
categories: [unity]
---

# Unity/OSX 업데이트 후 자주 발생하는 빌드 에러 모음

## 시작하며
Unity나 OSX를 업데이트하다 보면, 갑자기 빌드가 깨지거나 알 수 없는 에러가 발생하는 경우가 있습니다.
이 글에서는 그런 문제들을 정리해 보았습니다.

---

## Xcode `xcrun` 에러

```
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools),
missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

```

- **원인**: Xcode 업데이트 후 Command Line Tools 경로가 깨짐  
- **해결**: `xcode-select --install` 로 Command Line Tools 재설치

---

## Android SDK/Gradle 버전 불일치
- **증상**: Unity Android 빌드 실패, `compileSdkVersion` 관련 에러  
- **원인**: Unity 업데이트로 SDK/Gradle 버전이 바뀌면서 기존 설정과 충돌  
- **해결**: `mainTemplate.gradle`에서 `compileSdkVersion` 최신화, Gradle 버전 Unity 권장값으로 맞춤

---

## Manifest `<queries>` 요소 에러
```
unexpected element <queries> found in <manifest>
```

- **원인**: Android 11 이후 `<queries>` 요소 추가, Unity 병합 과정에서 지원되지 않는 SDK/Gradle 사용  
- **해결**: SDK/Gradle 업데이트, `compileSdkVersion`을 30 이상으로 설정

---

## Multidex 문제
- **증상**: `DexArchiveMergerException` 발생  
- **원인**: 메서드 수 증가로 Multidex 필요하지만 Unity 설정 불완전  
- **해결**:  
  - `multiDexEnabled true` 추가  
  - `implementation 'androidx.multidex:multidex:2.0.1'` 의존성 명시  
  - Proguard로 불필요한 클래스 제거

---

todo