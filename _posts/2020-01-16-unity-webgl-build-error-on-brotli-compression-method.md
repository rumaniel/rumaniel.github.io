---
layout: post
title: Unity 2018.3 버전에서 Brotli compress 옵션으로 WebGL 빌드 실패시 해결 방법
image: /assets/196px-Brotli-logo.svg
date: 2020-01-17 00:54:00 +0900
tags: [unity, C#, webgl, brotli]
categories: [unity, C#, brotli]
---

Unity3d 2018.3 버전에서 WebGL 빌드시 압축 옵션에 [Brotli compress](https://en.wikipedia.org/wiki/Brotli) 로 선택시 아래와 같은 에러를 확인 할 수 있습니다.

```
Failed running python “/Applications/Unity_2018.3.8f1/PlaybackEngines/WebGLSupport/BuildTools/Brotli/python/bro.py” -o “/Users/ID/Documents/Repositories/hybrid/Temp/StagingArea/Data/Output/Build/ca.data.unityweb.compressed” -i “/Users/ID/Documents/Repositories/hybrid/Temp/StagingArea/Data/Output/Build/ca.data.unityweb” --comment “UnityWeb Compressed Content (brotli)”stdout:stderr:/usr/bin/python: can’t open file ‘/Applications/Unity_2018.3.8f1/PlaybackEngines/WebGLSupport/BuildTools/Brotli/python/bro.py’: [Errno 13] Permission deniedUnityEngine.GUIUtility:ProcessEvent(Int32, IntPtr)Exception: Failed building WebGL Player.UnityEditor.WebGL.ProgramUtils.StartProgramChecked (System.Diagnostics.ProcessStartInfo p) (at /Users/builduser/buildslave/unity/build/PlatformDependent/WebGL/Extensions/Unity.WebGL.extensions/ProgramUtils.cs:48)UnityEditor.WebGL.WebGlBuildPostprocessor.CompressAndMarkBrotli (System.String path) (at /Users/builduser/buildslave/unity/build/PlatformDependent/WebGL/Extensions/Unity.WebGL.extensions/BuildPostprocessor.cs:880)UnityEditor.WebGL.WebGlBuildPostprocessor.CompressBuild (UnityEditor.Modules.BuildPostProcessArgs args) (at /Users/builduser/buildslave/unity/build/PlatformDependent/WebGL/Extensions/Unity.WebGL.extensions/BuildPostprocessor.cs:892)UnityEditor.WebGL.WebGlBuildPostprocessor.PostProcess (UnityEditor.Modules.BuildPostProcessArgs args) (at /Users/builduser/buildslave/unity/build/PlatformDependent/WebGL/Extensions/Unity.WebGL.extensions/BuildPostprocessor.cs:966)UnityEditor.Modules.DefaultBuildPostprocessor.PostProcess (UnityEditor.Modules.BuildPostProcessArgs args, UnityEditor.BuildProperties& outProperties) (at /Users/builduser/buildslave/unity/build/Editor/Mono/Modules/DefaultBuildPostprocessor.cs:27)UnityEditor.PostprocessBuildPlayer.Postprocess (UnityEditor.BuildTargetGroup targetGroup, UnityEditor.BuildTarget target, System.String installPath, System.String companyName, System.String productName, System.Int32 width, System.Int32 height, UnityEditor.BuildOptions options, UnityEditor.RuntimeClassRegistry usedClassRegistry, UnityEditor.Build.Reporting.BuildReport report) (at /Users/builduser/buildslave/unity/build/Editor/Mono/BuildPipeline/PostprocessBuildPlayer.cs:286)UnityEngine.GUIUtility:ProcessEvent(Int32, IntPtr)
```

이는 brotli 압축을 실행시켜주는 ```PlaybackEngines/WebGLSupport/BuildTools/Brotli/python/bro.py``` 파일을 여는데 권한이 없어서 실패했다는 의미입니다.

실제로 Brotli 폴더의 pyrhon 폴더에 권한이 없는 이슈가 있습니다.

이미 해당 이슈는 [이슈트래커](https://issuetracker.unity3d.com/issues/macos-slash-linux-webgl-brotli-compression-subdirectory-python-lacks-permissions-for-group-and-other)에서 확인 할 수 있었고, 맥과 리눅스 환경에서 발생한다고 합니다. 해당 2018.4, 2019.2, 2019.3 에 이미 수정된 내용입니다.

하지만 쉽게 버전을 올리지 못하기 때문에 other 와 group에 읽기와 실행 권한을 주는 방법으로 해결했습니다.

Brotli 폴더로 가서 ```sudo chmod 755 python``` 명령으로 python 폴더에 권한을 부여하면 빌드가 잘 되는것을 확인 할 수 있습니다.


참고사이트
* https://issuetracker.unity3d.com/issues/macos-slash-linux-webgl-brotli-compression-subdirectory-python-lacks-permissions-for-group-and-other
* https://answers.unity.com/questions/1508173/unity-webgl-build-error.html
* https://unity.cn/releases/lts/2018/2018.4.12f1