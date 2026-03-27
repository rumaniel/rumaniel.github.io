---
layout: post
title: "Fixing Unity 2018.3 WebGL Brotli Compression Build Failure"
description: How to resolve WebGL build failure when using Brotli compression option in Unity 2018.3
image: /assets/196px-Brotli-logo.svg
date: 2020-01-17 00:54:00 +0900
tags: [webgl, brotli]
categories: [unity]
lang: en
permalink: /unity-webgl-build-error-on-brotli-compression-method/
---

This article documents a fix for WebGL build failures when using the Brotli compression option in Unity 2018.3.

## The Phenomenon

When **WebGL build** is performed with the **Brotli compression** option enabled in Unity 2018.3, the following error occurs:

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

## Root Cause Analysis

The In Unity 2018.3, Unity's `BuildPostProcessor` classes related to Brotli compression have compatibility issues.
    Specifically, the `UnityEditor.WebGL.WebGlBuildPostprocessor.CompressBuild` method executes the `python` command for Brotli compression, but encounters permission issues.

## Solution Methods

### 1. Grant Permissions to Brotli Folder (Recommended)

```bash
sudo chmod 755 /Applications/Unity/Hub/Editor/2018.4.12f1/PlaybackEngines/WebGLSupport/BuildTools/python
```

### 2. Install Python (Alternative)

If system Python is not present, installing Python 3 directly and modifying Brotli folder permissions can be easier.

```bash
# Install Python 3
brew install python3

# Modify permissions
sudo chmod 755 /Applications/Unity/Hub/Editor/2018.4.12f1/PlaybackEngines/WebGLSupport/BuildTools/python
```

### 3. Use Lower Compatibility Version

Upgrading to Unity 2018.4 or later resolves this issue. However, depending on project circumstances, upgrading may be difficult.

## Verification Method

1. Open **File > Build Settings...** from Unity Editor menu
2. Select **Player Settings** → **WebGL**
3. Select **Brotli** under **Compression Format**
4. Execute build

If build completes normally, the issue is resolved.

## References

- [Unity Issue Tracker](https://issuetracker.unity3d.com/issues/macos-slash-linux-webgl-brotli-compression-subdirectory-python-lacks-permissions-for-group-and-other)
- [Unity Answers - WebGL Build Error](https://answers.unity.com/questions/1508173/unity-webgl-build-error.html)
- [Unity LTS Release Notes 2018.4](https://unity.cn/releases/lts/2018/2018.4.12f1)
