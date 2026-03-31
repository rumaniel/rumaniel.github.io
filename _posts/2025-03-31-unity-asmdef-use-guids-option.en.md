---
layout: post
title: "Understanding Unity Assembly Definition (asmdef) Use GUIDs Option"
description: Understanding the Use GUIDs option in Unity asmdef files and the differences between GUID vs named references
image: /assets/coding.jpg
date: 2025-03-31 16:00:00 +0900
tags: [unity, asmdef, assembly-definition]
categories: [unity]
lang: en
permalink: /unity-asmdef-use-guids-option/
---

# Understanding Unity Assembly Definition (asmdef) Use GUIDs Option

When working with Assembly Definition Files (asmdef) in Unity, you may notice the **Use GUIDs** option. New and existing asmdef files may show references differently - this is due to this option.

---

## The Problem

When referencing other assemblies in the asmdef inspector:

- **Existing files**: `GUID:861626f26602c48888a26b...` (shown as GUID)
- **Newly created files**: `Model`, `Service` (shown as names)

Why does this difference occur?

---

## Cause: Use GUIDs Option

There's a **Use GUIDs** checkbox at the top of the asmdef inspector.

### Use GUIDs Checked ON (Recommended)
```json
{
  "reference": "GUID:861626f26602c48888a26b..."
}
```

### Use GUIDs Checked OFF
```json
{
  "reference": "Model"
}
```

**Newly created asmdef files have Use GUIDs checked by default, but existing files may not.**

---

## GUID vs Named Reference Comparison

| Aspect | GUID Reference | Named Reference |
|--------|---------------|-----------------|
| Storage format | `"GUID:..."` | `"AssemblyName"` |
| Readability | Low (GUID string) | High (intuitive) |
| Renaming safety | ✅ Safe (persists through rename) | ❌ Risky (breaks references) |
| Team collaboration | ✅ Fewer conflicts | ❌ Possible name conflicts |
| Manual editing | Difficult | Easy |

---

## Unity 2019.1 Release Notes

This feature was first introduced in **Unity 2019.1**.

### Background

Before 2019.1, asmdef files referenced other asmdefs **only by assembly name**. Problems with this approach:

1. **When referenced name changes** → All references break (Missing Reference)
2. **Same name used across projects** → Conflicts possible

To solve this, **GUID-based reference using meta files** was added.

### Official Release Notes Excerpt

> Editor: Added support for referencing Assembly Definition Files with GUIDs instead of assembly names. Enable with 'Use GUIDs' option in Assembly Definition File inspector. Enabled by default for new Assembly Definition Files.

---

## Actual File Comparison

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

## Recommendations

### ✅ Use GUIDs Recommended

Unity documentation recommends keeping Use GUIDs enabled for **maintainability and stability**.

**Advantages:**
- References persist through assembly name changes
- Reduced conflicts in team projects
- Increased refactoring safety

**Disadvantages:**
- Difficult to edit directly in text editors
- Reduced JSON file readability

### 📝 How to Modify Existing Files

To convert existing asmdef files to GUID mode:

1. Select the asmdef file
2. Check **Use GUIDs** in the inspector
3. Apply

After this, all new references will be saved as GUIDs.

---

## Migration Tip

### Bulk Conversion Script

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
            
            // Enable Use GUIDs in inspector
            // (Requires internal API in practice)
            Debug.Log($"Processing: {path}");
        }
        
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
    }
}
#endif
```

---

## Summary

- **Use GUIDs ON**: Stores references as GUIDs, safe for renaming
- **Use GUIDs OFF**: Stores references as names, readable but risky
- Introduced in **Unity 2019.1+**
- **New asmdef files default to ON**
- **Existing files need manual checking**

> 💡 **TL;DR**: Keep Use GUIDs checked for asmdef references. It prevents broken references when names change.

---

## References
- [Unity 2019.1.0b4 Release Notes](https://unity.com/releases/editor/beta/2019.1.0b4)
- [Unity 2019.1 Release Notes (Japanese)](https://shibuya24.info/entry/unity_releasenote2019_1_0b2)
- [Unity Documentation - Assembly Definitions](https://docs.unity3d.com/Manual/ScriptCompilationAssemblyDefinitionFiles.html)
