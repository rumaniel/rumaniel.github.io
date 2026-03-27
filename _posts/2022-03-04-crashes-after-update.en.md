---
layout: post
title: "Common Build Errors After Unity/OSX Updates"
description: Guide to resolving build errors after Unity or macOS updates
image: /assets/idewithnotebook.webp
date: 2022-03-04 13:52:23 +0900
tags: [macos, android]
categories: [unity]
lang: en
permalink: /crashes-after-update/
---

# Common Build Errors After Unity/OSX Updates

## Introduction
After updating Unity or OSX, builds may suddenly break or unknown errors may occur.
This article summarizes such problems.

---

## Xcode `xcrun` Error

```
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools),
missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun

```

- **Cause**: Command Line Tools path breaks after Xcode update  
- **Solution**: Reinstall Command Line Tools with `xcode-select --install`

---

## Android SDK/Gradle Version Mismatch
- **Symptoms**: Unity Android build fails, `compileSdkVersion` related errors  
- **Cause**: Unity update changes SDK/Gradle versions, conflicting with existing settings  
- **Solution**: Update `compileSdkVersion` in `mainTemplate.gradle`, match Gradle version to Unity recommendations

---

## Manifest `<queries>` Element Error
```
unexpected element <queries> found in <manifest>
```

- **Cause**: `<queries>` element added after Android 11, using unsupported SDK/Gradle during Unity merge  
- **Solution**: Update SDK/Gradle, set `compileSdkVersion` to 30 or higher

---

## Multidex Issues
- **Symptoms**: `DexArchiveMergerException` occurs  
- **Cause**: Increased method count requires Multidex but Unity settings incomplete  
- **Solution**:  
  - Add `multiDexEnabled true`  
  - Specify `implementation 'androidx.multidex:multidex:2.0.1'` dependency  
  - Remove unnecessary classes with Proguard

---

*todo*
