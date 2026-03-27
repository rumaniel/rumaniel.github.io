---
layout: post
title: "Unity3d Package Dependency Bug"
description: Fixing Mathematics dependency issue in Unity 2D Animation package
image: /assets/2d.animation.mathematics.errors.png
tags: [package-manager, debugging]
categories: [unity]
lang: en
permalink: /unity-package-dependency-bug/
---

# Symptom

We introduced 2D animation to our company project and after finishing tests, created a Live build, but animations didn't work.

Checking the logs, I found this CRC mismatch error:

```CRC Mismatch. Provided 2b55a317, calculated ce66e140 from data. Will not load AssetBundle 'prefabs_ab'.```

The issue didn't occur in QA builds but only in Live builds. However, clean builds fixed the problem.
But since clean builds take a lot of time, we needed to solve this properly.

# Analysis

## Build Pipeline
QA builds are created when Jenkins runs build scripts in a single workspace that bakes asset bundles, uploads them, and then creates the build.
Live builds have separate workspaces for creating asset bundles and making builds. We separated them for convenience since we often need asset bundle patches.

## Branch Changes
We develop following git-flow rules by default, but when branch swaps occur, I confirmed the following errors appear:

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
Unity 2D animation package has the following information:

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

# Analysis
Based on the above information, the 2D animation package has mathematics as a dependency but appears to fail importing it properly.

# Solution
I simply added the following to Packages/manifest.json:
```
    "com.unity.mathematics": "1.2.5",
```

After compiling, I confirmed that the mathematics package that came as dependency in Packages/packages-lock.json changed to the specified version 1.2.5 instead of the dependency version.

Afterwards, continuous Live builds worked correctly.

It seems Unity Packages still have bugs, so we should check before proceeding.

The checked Unity version is 2019.4.24f1.

# todo
Find related Unity bug report
