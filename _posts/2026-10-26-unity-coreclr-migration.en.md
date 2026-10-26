---
layout: post
title: "Unity CoreCLR Migration Checklist"
description: Unity 6.8 removes Mono and switches to CoreCLR. The timeline, plus the code changes to check in existing projects, with examples.
image: /assets/coding.jpg
date: 2026-10-26 13:00:00 +0900
tags: [c#]
categories: [unity]
lang: en
permalink: /unity-coreclr-migration/
---

In 2026 Unity switches its scripting runtime from Mono to CoreCLR. As covered in [C# Support by Unity Version and the Key C# 8 and 9 Features]({{ site.baseurl }}/unity-csharp-8-and-9/), **the language version stays at C# 9 / .NET Standard 2.1**, but the runtime change alters how code reloads and how some APIs behave.

Unity describes the change as largely source-compatible, but several breaking changes are intentional. This post is based on Unity's [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279) and lists what to check in existing projects, with examples. The guide is a living document, so check the latest version before applying anything.

| Section | Contents |
|---|---|
| **[<span class="toc-num">1</span>&nbsp;Timeline](#timeline)** | [<span class="toc-num">1.1</span>&nbsp;What changes and what stays](#what-changes) |
| **[<span class="toc-num">2</span>&nbsp;Code reload and static state](#code-reload-and-statics)** | [<span class="toc-num">2.1</span>&nbsp;Fast Enter Play Mode](#fast-enter-play-mode)<br>[<span class="toc-num">2.2</span>&nbsp;Resetting static state](#reset-static-state)<br>[<span class="toc-num">2.3</span>&nbsp;Code reload events](#code-reload-events)<br>[<span class="toc-num">2.4</span>&nbsp;Hidden references in containers](#hidden-references-in-containers)<br>[<span class="toc-num">2.5</span>&nbsp;Static constructor order](#static-constructor-order) |
| **[<span class="toc-num">3</span>&nbsp;API changes](#api-changes)** | [<span class="toc-num">3.1</span>&nbsp;BinaryFormatter](#binaryformatter)<br>[<span class="toc-num">3.2</span>&nbsp;Assembly APIs](#assembly-apis)<br>[<span class="toc-num">3.3</span>&nbsp;Interface re-implementation](#interface-reimplementation)<br>[<span class="toc-num">3.4</span>&nbsp;Access and overflow checks](#access-and-overflow-checks)<br>[<span class="toc-num">3.5</span>&nbsp;Text encodings](#text-encodings)<br>[<span class="toc-num">3.6</span>&nbsp;String hashing and locales](#string-hash-and-locale)<br>[<span class="toc-num">3.7</span>&nbsp;Floating point results](#floating-point)<br>[<span class="toc-num">3.8</span>&nbsp;Mono-specific features](#mono-specific-features)<br>[<span class="toc-num">3.9</span>&nbsp;Burst function pointers](#burst-function-pointers)<br>[<span class="toc-num">3.10</span>&nbsp;Precompiled assemblies](#precompiled-assemblies) |
| **[<span class="toc-num">4</span>&nbsp;Migration steps](#migration-steps)** |  |
{: .toc-table #toc}

---

# Timeline {#timeline}

| Version | Change |
|---|---|
| Unity 6.6 | Fast Enter Play Mode is the default for new projects. Existing projects are unchanged |
| Unity 6.7 LTS alpha | Experimental CoreCLR Desktop Player (from 6000.7.0a2) and Experimental IL2CPP iOS Player (from 6000.7.0a5). Install alongside the LTS, for validation only |
| Unity 6.8 | Mono removed, replaced by CoreCLR. Fast Enter Play Mode is the only option |
| Unity 7.0 alpha | CoreCLR-based Editor. .NET 10-based toolchain and BCL |

The guide says the CoreCLR switch happens in 6.8 in some places and 7.0 in others. Check the release notes for the actual version.

The experimental players are not supported and must not be used in production. They provide the same .NET Standard 2.1 / C# 9 feature set as the Mono player, and performance is not expected to differ noticeably.

## What changes and what stays {#what-changes}

- **Stays the same**
  - Language version C# 9, API compatibility level .NET Standard 2.1
  - IL2CPP keeps using the Boehm GC with no behavior change.
  - The goal is holistic performance parity. Some things get faster and some slower.
- **Changes**
  - The managed domain is no longer unloaded on code changes or when entering Play Mode. **Static variables are not reset automatically.**
  - From 7.0, the .NET 10 BCL is used. Some APIs that existed only in .NET Framework 4.7 are gone or moved to NuGet packages (e.g. `Microsoft.Win32.Registry`).
  - CoreCLR uses its own GC, with an 85 KB large-object threshold.
  - Types like `System.Numerics.Vector3` become usable, but Unity components have no plans to use them yet.

---

# Code reload and static state {#code-reload-and-statics}
This is the biggest change. Until now, domain reload wiped all static state whenever you edited a script or entered Play Mode, so careless use of statics never surfaced as a bug.

## Fast Enter Play Mode
Fast Enter Play Mode skips domain reload when entering Play Mode. It becomes the default for new projects in 6.6 and the only option in 6.8. Scene Reload is very likely to remain an option.

**Turning it on now is the best preparation.** Disable domain reload in Project Settings > Editor > Enter Play Mode Settings and enter Play Mode several times in a row.

[Project Auditor](https://docs.unity3d.com/Packages/com.unity.project-auditor@latest) 2.0.0 (installable from Unity 6.0) finds problem code automatically. Enable **Use Roslyn Analyzers** in Preferences, run an analysis, and check the **Domain Reload** tab.

## Resetting static state {#reset-static-state}
Without domain reload, static values and event subscriptions from the previous play session stay around.

```csharp
public static class ScoreManager
{
    public static int Score;
    public static event Action<int> OnScoreChanged;

    public static void Add(int value)
    {
        Score += value;
        OnScoreChanged?.Invoke(Score);
    }
}
// Second play: old Score kept, destroyed UI handlers called
```

In current versions, reset them yourself at startup with `RuntimeInitializeOnLoadMethod`.

```csharp
public static class ScoreManager
{
    public static int Score;
    public static event Action<int> OnScoreChanged;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    static void ResetStatics()
    {
        Score = 0;
        OnScoreChanged = null;
    }
}
```

With CoreCLR, put `[AutoStaticsCleanup]` on a type or static member and Unity cleans it up. The guide doesn't give its namespace, so check the 6.8 docs.

```csharp
[AutoStaticsCleanup] // Unity 6.8+
public static class ScoreManager
{
    public static int Score;
    public static event Action<int> OnScoreChanged;
}
```

## Code reload events {#code-reload-events}
`AppDomain.CurrentDomain.DomainUnload` no longer fires during code reload. Move cleanup of resources such as native handles, threads, and file handles to Unity's lifecycle attributes.

```csharp
// Before
AppDomain.CurrentDomain.DomainUnload += (_, _) => NativePlugin.Shutdown();

// CoreCLR
[Unity.Scripting.LifecycleManagement.AfterCodeReloadSerialization]
static void CleanupResources()
{
    NativePlugin.Shutdown();
}
```

Code that must run right before assemblies unload goes in a static method marked `[BeforeCodeUnloading]`. Static references to modified types keep an assembly from unloading, and after a while Unity reports it as a leaked `AssemblyLoadContext`.

## Hidden references in containers {#hidden-references-in-containers}
A custom container that doesn't clear removed slots keeps unused objects alive, which blocks both GC and assembly unload.

```csharp
public class CustomStack<T>
{
    private T[] storage;
    private int count;

    public CustomStack(int capacity) => storage = new T[capacity];

    public void Push(T item) => storage[count++] = item;

    // Problem: array keeps the reference
    public T PopLeaky() => storage[--count];

    // Fix: clear the slot
    public T Pop()
    {
        T result = storage[--count];
        storage[count] = default;
        return result;
    }
}
```

Standard collections such as `List<T>` and `Stack<T>` already do this. Lower-level types such as `System.Buffers.MemoryPool<T>` don't, so clear buffers before returning them. With `ArrayPool<T>`, use `Return(array, clearArray: true)`.

## Static constructor order {#static-constructor-order}
In CoreCLR, a static constructor runs on first access to static data, not when a method is first JIT-compiled. The order can change, and **it may run on a background thread instead of the main thread.** Code that calls Unity APIs from a static constructor, or depends on another static constructor running first, is at risk.

```csharp
public static class GameConfig
{
    public static readonly float Gravity;

    static GameConfig()
    {
        // Risky: Unity API fails on a background thread
        Gravity = Resources.Load<ConfigAsset>("Config").gravity;
    }
}
```

If initialization has to happen at a known point, trigger it yourself.

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
static void Init()
{
    System.Runtime.CompilerServices.RuntimeHelpers.RunClassConstructor(typeof(GameConfig).TypeHandle);
}
```

The safest option is to move initialization that needs Unity APIs out of the static constructor into an explicit `Init` method.

---

# API changes {#api-changes}

## BinaryFormatter
`BinaryFormatter` is obsolete in .NET 10 for security reasons. If your save files use it, you need to replace it, and also prepare **a path that converts existing save data to the new format**.

```csharp
// Before
var formatter = new BinaryFormatter();
using (var stream = File.Create(path))
    formatter.Serialize(stream, saveData);

// Option 1: JsonUtility
File.WriteAllText(path, JsonUtility.ToJson(saveData));

// Option 2: BinaryWriter
using var writer = new BinaryWriter(File.Create(path));
writer.Write(saveData.Level);
writer.Write(saveData.Gold);
```

The guide suggests `JsonUtility`, `DataContractSerializer`, `System.Text.Json`, and `BinaryReader`/`BinaryWriter` as replacements.

## Assembly APIs {#assembly-apis}

| Before | CoreCLR |
|---|---|
| `Assembly.Location` | Returns an empty string. Use `Assembly.GetLoadedAssemblyPath()` (6.8+) |
| `AppDomain.CurrentDomain.GetAssemblies()` | Triggers warnings. Use `UnityEngine.Assemblies.CurrentAssemblies.GetLoadedAssemblies()` |
| Some `Assembly.Load` overloads | Compile errors. Use `CurrentAssemblies.LoadFromPath`, `CurrentAssemblies.LoadFromBytes`, or `Assembly.Load(AssemblyName)` |

```csharp
// Before: find interface implementations
var types = AppDomain.CurrentDomain.GetAssemblies()
    .SelectMany(a => a.GetTypes())
    .Where(t => typeof(ICommand).IsAssignableFrom(t));

// CoreCLR
var types = UnityEngine.Assemblies.CurrentAssemblies.GetLoadedAssemblies()
    .SelectMany(a => a.GetTypes())
    .Where(t => typeof(ICommand).IsAssignableFrom(t));
```

In editor code, `UnityEditor.TypeCache.GetTypesDerivedFrom<ICommand>()` is faster and unaffected by the runtime change.

## Interface re-implementation {#interface-reimplementation}
When a base class implements an interface explicitly and a derived class overrides a virtual method of the same name, Mono and CoreCLR call different methods.

```csharp
interface IInteractable { void Interact(); }

class Door : IInteractable
{
    void IInteractable.Interact() => Debug.Log("Door");   // Mono calls this
    public virtual void Interact() { }
}

class LockedDoor : Door
{
    public override void Interact() => Debug.Log("Locked"); // CoreCLR calls this
}

((IInteractable)new LockedDoor()).Interact();
```

Re-listing the interface on the derived class (`class LockedDoor : Door, IInteractable`) makes the intent clear on both runtimes. Better still, avoid this structure altogether.

## Access and overflow checks {#access-and-overflow-checks}
CoreCLR enforces accessibility more strictly, so `MethodAccessException` can appear where Mono let things through. Reflection access to private members is unaffected.

Many System types also use `checked` conversions now and can throw `OverflowException`.

```csharp
IntPtr handle = GetNativeHandle();
int value = handle.ToInt32(); // 64-bit: may throw OverflowException

long safe = handle.ToInt64(); // use long / nint
```

## Text encodings {#text-encodings}
Fewer encodings are registered by default. ASCII and the Unicode encodings remain, but code page encodings such as Windows-1252 or EUC-KR (949) must be registered. Check code that reads old CSV files or data from legacy servers.

```csharp
// Throws without registration
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
var euckr = Encoding.GetEncoding(949);
string text = euckr.GetString(bytes);
```

## String hashing and locales {#string-hash-and-locale}
`string.GetHashCode()` values can differ between processes. Fix any code that stores hash values, compares them with a server, or expects the same value on every run.

```csharp
// Risky: differs per run
PlayerPrefs.SetInt("SaveKey", playerName.GetHashCode());

// Stable hash: compute it yourself
static uint Fnv1a(string s)
{
    uint hash = 2166136261;
    foreach (char c in s)
        hash = (hash ^ c) * 16777619;
    return hash;
}
```

Locale strings must follow the RFC 4646 format. Include the region: `"fr-FR"` instead of `"fr"`, `"ko-KR"` instead of `"ko"`.

```csharp
var culture = new CultureInfo("ko-KR");
```

## Floating point results {#floating-point}
CoreCLR follows IEEE 754, so results can differ slightly from Mono's JIT. Retest code that relies on deterministic results, such as lockstep multiplayer or replays. IL2CPP and Burst (default `FloatMode.Strict`) are unaffected.

## Mono-specific features {#mono-specific-features}
- Mono libraries such as `MonoPosixHelper.dll` are no longer shipped. P/Invoke calls into them still compile but fail at runtime with `DllNotFoundException`. Search your project for things like `DllImport("MonoPosixHelper")`.
- `UnityEditor.Scripting.ManagedDebugger` is not supported. Use `System.Diagnostics.Debugger`.

```csharp
// Before
if (UnityEditor.Scripting.ManagedDebugger.isAttached) { }

// CoreCLR
if (System.Diagnostics.Debugger.IsAttached) { }
```

## Burst function pointers {#burst-function-pointers}
- The delegate type used with `FunctionPointer<T>.Invoke`, and every type in its signature, must be `public` or `internal`, or you get compile error `UAC2016`.
- If `UncheckedInvoke` throws under CoreCLR, the exception is only logged and an undefined value is returned.
- Managed exceptions thrown across native frames (Bursted code or C++) don't propagate and may terminate the process, depending on platform.

```csharp
[BurstCompile]
public class DamageCalculator
{
    // UAC2016 error if this is private
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    internal delegate int CalculateDelegate(int value);

    [BurstCompile]
    private static int Calculate(int value) => value < 0 ? 0 : value * 2;

    public static int Run(int value)
    {
        var fp = BurstCompiler.CompileFunctionPointer<CalculateDelegate>(Calculate);
        return fp.Invoke(value);
    }
}
```

## Precompiled assemblies {#precompiled-assemblies}
DLLs built for any TFM other than .NET Standard 2.1 (e.g. `net472`, `net6.0`) may break in 6.8. Check the target framework of third-party DLLs in `Assets/Plugins` and of in-house libraries, then rebuild them for `netstandard2.1` or upgrade to newer versions.

---

# Migration steps {#migration-steps}
1. **Turn on Fast Enter Play Mode** and find domain reload issues with Project Auditor.
2. Add static reset code, and find code that uses `DomainUnload`.
3. Replace `BinaryFormatter` and build a conversion path for existing save data.
4. Check the TFM of precompiled DLLs.
5. Clean up uses of `Assembly.Location`, `GetAssemblies`, `Assembly.Load`, and `ManagedDebugger`.
6. Review static constructors, custom containers, interface re-implementation, encodings, locales, and hash-dependent code.
7. Check access modifiers on Burst function pointer delegates.
8. Build with the experimental CoreCLR player in 6.7 alpha and compare floating-point-sensitive results. Don't use it for release builds.

Steps 1 and 2 work today on Unity 6.0 and make entering Play Mode faster regardless of runtime, so start there.

---

## References
- [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279)
- [Unity Manual - Configurable Enter Play Mode](https://docs.unity3d.com/Manual/ConfigurableEnterPlayMode.html)
- [Project Auditor](https://docs.unity3d.com/Packages/com.unity.project-auditor@latest)
- [BinaryFormatter security guide](https://learn.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide)
