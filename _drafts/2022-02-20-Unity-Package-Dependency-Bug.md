---
layout: post
title: Unity3d Package Dependency Bug
image: /img/hello_world.jpeg
tags: [unity, c#]
categories: [unity, c#]
---


# 현상

회사 프로젝트에 2d animation 을 도입을 하였고 테스트 까지 마친 이후로 Live 빌드를 만들었는데, 애니메이션이 동작 하지 않았습니다.

해당 로그를 확인해보니 아래와 같은 CRC mismatch 에러를 확인하였습니다.

```CRC Mismatch. Provided 2b55a317, calculated ce66e140 from data. Will not load AssetBundle 'prefabs_ab'.```

하지만 QA 빌드에서 문제가 생기지 않았는데 유독 Live 빌드에서 문제가 생겼지만, Clean build 를 하면 문제가 해결되었습니다.
하지만 Clean build 자체가 시간이 많이 걸리는지라 문제 해결이 필요했죠.

# 분석
## 빌드 파이프라인
QA 빌드는 Jenkins에 의해 빌드 스크립트가 실행되면 하나의 워크스페이스에서 에셋번들을 굽고 업로드하고 이어서 빌드를 만듭니다.
Live 빌드는 에셋번들 만드는 워크스페이스와 빌드를 만드는 워크스페이스가 따로 만들어져 있습니다. 종종 에셋번들 패치를 해야하기 때문에 편의상 분리해뒀습니다.

## 브랜치 변경
기본적으로 git-flow 규칙에 따라 개발 하는데, 종종 브랜치 스왑이 발생할 경우 아래와 같은 에러가 발생하는것을 확인하였습니다.


```
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(4,13): error CS0234: The type or namespace name 'Mathematics' does not exist in the namespace 'Unity' (are you missing an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(274,37): error CS0246: The type or namespace name 'float4x4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(274,67): error CS0246: The type or namespace name 'float3' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(274,134): error CS0246: The type or namespace name 'float4x4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(274,172): error CS0246: The type or namespace name 'float4x4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(274,205): error CS0246: The type or namespace name 'float3' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,37): error CS0246: The type or namespace name 'float4x4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,67): error CS0246: The type or namespace name 'float3' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,97): error CS0246: The type or namespace name 'float4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,164): error CS0246: The type or namespace name 'float4x4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,202): error CS0246: The type or namespace name 'float4x4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,235): error CS0246: The type or namespace name 'float3' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(302,265): error CS0246: The type or namespace name 'float4' could not be found (are you missing a using directive or an assembly reference?)
Library\PackageCache\com.unity.2d.animation@3.2.15\Runtime\SpriteSkinUtility.cs(416,70): error CS0246: The type or namespace name 'float3' could not be found (are you missing a using directive or an assembly reference?)

An error occurred while resolving packages:
  One or more packages could not be added to the local file system:
    com.unity.mathematics: EBUSY: resource busy or locked, open 'C:\Project Files\Unity\alpha_client\Library\PackageCache\.tmp140560mcNs6a6j0Un\copy\Unity.Mathematics\matrix.gen.cs'

A re-import of the project may be required to fix the issue or a manual modification of C:/Project Files/Unity/alpha_client/Packages/manifest.json file.
```

## Packages/packages-lock.json
Unity 2d animation package 는 아래와 같은 정보를 가지고 있습니다.

```
    "com.unity.2d.animation": {
      "version": "3.2.15",
      "depth": 0,
      "source": "registry",
      "dependencies": {
        "com.unity.2d.common": "2.1.0",
        "com.unity.mathematics": "1.1.0",
        "com.unity.2d.sprite": "1.0.0",
        "com.unity.modules.animation": "1.0.0",
        "com.unity.modules.uielements": "1.0.0"
      },
      "url": "https://packages.unity.com"
    },
```

# 분석
위의 정보로 분석하자면 2d animation package 는 mathematics 를 dependency 로 가지고 있지만 해당 패키지를 제대로 임포트 하지 못하는 것으로 보입니다.

# 해결
단순히 Packages/manifest.json 에 
```
    "com.unity.mathematics": "1.2.5",
```
를 추가해줬고, 이후 컴파일을 통해 Packages/packages-lock.json 에 dependency 로 딸려온 mathematics package가 dependency 버전이 아닌 지정한 1.2.5 버전으로 변경된것을 확인하였습니다.

이후 Live 빌드를 Continuous 하게 빌드를 해본 결과 잘 되는것을 확인하였습니다.

아직 Unity Packages 에 버그가 존재하는거 같으니 확인하고 진행을 해야할거 같습니다.

체크한 유니티 버전은 2019.4.24f1 입니다.



