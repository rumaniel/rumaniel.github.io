---
layout: post
title: "Unity 2018.3 WebGL Brotli 압축 빌드 실패 해결 방법"
description: Unity 2018.3에서 WebGL 빌드 시 Brotli 압축 옵션으로 인한한 빌드 실패 문제 해결
image: /assets/196px-Brotli-logo.svg
date: 2020-01-17 00:54:00 +0900
tags: [webgl, brotli]
categories: [unity]
lang: ko
permalink: /unity-webgl-build-error-on-brotli-compression-method/
---

Unity3d 2018.3 버전에서 WebGL 빌드 시 Brotli 압축 옵션을 켜 경우 빌드가 실패하는 문제가 있습니다. 해결 방법을 정리합니다.

## 현상

Unity 2018.3 버전에서 **WebGL 빌드** 후 **Brotli 압축 옵션**을 켤 경우 다음과 같은 에러가 발생합니다:

```
ExecutionFailedException: BuildPostprocessor.CompressBuild
  at UnityEditor.WebGL.WebGlBuildPostprocessor.CompressBuild (UnityEditor.Modules.BuildPostProcessArgs args)
  at UnityEditor.Modules.BuildPipeline:BuildPostProcess (BuildPostProcessArgs args)
  at UnityEditor.Modules.BuildPipeline:BuildPostProcess (BuildPostProcessArgs args)
  at UnityEditor.Modules.BuildPipeline:BuildContent (BuildContent content, BuildPref[] dependencies)
  at UnityEditor.BuildPipeline:Build (BuildPlayerOptions options, BuildPlayerOptions& outOptions)
  at UnityEditor.BuildPipeline:BuildPlayer (BuildPlayerOptions options)
  at UnityEditor.BuildPipeline:BuildPlayerWithDefaultOptions (Boolean incremental, BuildPlayerOptions& options)
```

## 원인 분석

기존 Unity 2018.3 버전에서 Unity가 제공하는 `BuildPostProcessor` 관련 클래스들이 Brotli 압축과 관련하여 호환성 문제가 있습니다.

특히 `UnityEditor.WebGL.WebGlBuildPostprocessor.CompressBuild` 메서드에서 `python` 명령어로 Brotli 압축을 수행하는 부분에서 문제가 발생합니다.

## 해결 방법

### 1. Brotli 폴더에 권한 부여 (권장)

```bash
sudo chmod 755 /Applications/Unity/Hub/Editor/2018.4.12f1/PlaybackEngines/WebGLSupport/BuildTools/python
```

### 2. Python 설치 (대안)

시스템 Python이 없거나 Python 3을 직접 설치해서 Brotli 폴더의 권한을 수정하는 것이 더 간편합니다:

```bash
# Python 3 설치
brew install python3

# 권한 수정
sudo chmod 755 /Applications/Unity/Hub/Editor/2018.4.12f1/PlaybackEngines/WebGLSupport/BuildTools/python
```

### 3. 하위 호환성 버전 사용

Unity 2018.4 이상 버전으로 업그레이드하면 이 문제는 해결됩니다. 하지만 프로젝트 사정에 따라 업그레이드가 어려울 수 있습니다.

## 확인 방법

1. Unity 에디터에서 **File > Build Settings...** 메뉴 열기
2. **Player Settings** → **WebGL** 선택
3. **Compression Format**에서 **Brotli** 선택
4. 빌드 실행

정상적으로 빌드가 완료되면 해결된 것입니다.

## 참고사이트

- [Unity Issue Tracker](https://issuetracker.unity3d.com/issues/macos-slash-linux-webgl-brotli-compression-subdirectory-python-lacks-permissions-for-group-and-other)
- [Unity Answers - WebGL Build Error](https://answers.unity.com/questions/1508173/unity-webgl-build-error.html)
- [Unity LTS Release Notes 2018.4](https://unity.cn/releases/lts/2018/2018.4.12f1)
