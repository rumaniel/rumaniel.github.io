---
layout: post
title: "C# Support by Unity Version and the Key C# 8 and 9 Features"
description: Which C# language version each Unity version supports, from 2020.2 to Unity 6, and the C# 8 and 9 features you can use in Unity, with examples.
image: /assets/coding.jpg
date: 2026-10-26 12:00:00 +0900
tags: [c#]
categories: [unity]
lang: en
permalink: /unity-csharp-8-and-9/
---

The earlier post, [Introduction to C# Scripting Available in Unity 2018.3 and Later]({{ site.baseurl }}/the-difference-of-scripting-on-the-unity-2018-3/), covered features up to C# 7.3. Since then Unity added C# 8 in 2020.2 and C# 9 in 2021.2, and has stayed on C# 9 with .NET Standard 2.1 through Unity 6.

In 2026 Unity's scripting runtime moves from Mono to CoreCLR. According to [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279), however, **the language version stays at C# 9 / .NET Standard 2.1**. So the newest syntax you can use in Unity today is C# 8 and 9, and that is what this post covers. Migrating to CoreCLR is covered in [Unity CoreCLR Migration Checklist]({{ site.baseurl }}/unity-coreclr-migration/).

| Section | Contents |
|---|---|
| **[<span class="toc-num">1</span>&nbsp;C# support by Unity version](#unity-csharp-versions)** | [<span class="toc-num">1.1</span>&nbsp;Unsupported features](#unsupported-features) |
| **[<span class="toc-num">2</span>&nbsp;C#8.0](#c80)** | [<span class="toc-num">2.1</span>&nbsp;Readonly members](#readonly-members)<br>[<span class="toc-num">2.2</span>&nbsp;Default interface methods](#default-interface-methods)<br>[<span class="toc-num">2.3</span>&nbsp;Switch expressions](#switch-expressions)<br>[<span class="toc-num">2.4</span>&nbsp;Property patterns](#property-patterns)<br>[<span class="toc-num">2.5</span>&nbsp;Tuple patterns](#tuple-patterns)<br>[<span class="toc-num">2.6</span>&nbsp;Positional patterns](#positional-patterns)<br>[<span class="toc-num">2.7</span>&nbsp;Using declarations](#using-declarations)<br>[<span class="toc-num">2.8</span>&nbsp;Static local functions](#static-local-functions)<br>[<span class="toc-num">2.9</span>&nbsp;Disposable ref structs](#disposable-ref-structs)<br>[<span class="toc-num">2.10</span>&nbsp;Nullable reference types](#nullable-reference-types)<br>[<span class="toc-num">2.11</span>&nbsp;Asynchronous streams](#asynchronous-streams)<br>[<span class="toc-num">2.12</span>&nbsp;Asynchronous disposable](#asynchronous-disposable)<br>[<span class="toc-num">2.13</span>&nbsp;Indices and ranges](#indices-and-ranges)<br>[<span class="toc-num">2.14</span>&nbsp;Null-coalescing assignment](#null-coalescing-assignment)<br>[<span class="toc-num">2.15</span>&nbsp;Unmanaged constructed types](#unmanaged-constructed-types)<br>[<span class="toc-num">2.16</span>&nbsp;Stackalloc in nested expressions](#stackalloc-in-nested-expressions)<br>[<span class="toc-num">2.17</span>&nbsp;Enhancement of interpolated verbatim strings](#enhancement-of-interpolated-verbatim-strings) |
| **[<span class="toc-num">3</span>&nbsp;C#9.0](#c90)** | [<span class="toc-num">3.1</span>&nbsp;Records](#records)<br>[<span class="toc-num">3.2</span>&nbsp;Init only setters](#init-only-setters)<br>[<span class="toc-num">3.3</span>&nbsp;Top-level statements](#top-level-statements)<br>[<span class="toc-num">3.4</span>&nbsp;Pattern matching enhancements](#pattern-matching-enhancements)<br>[<span class="toc-num">3.5</span>&nbsp;Native sized integers](#native-sized-integers)<br>[<span class="toc-num">3.6</span>&nbsp;Function pointers](#function-pointers)<br>[<span class="toc-num">3.7</span>&nbsp;Suppress emitting localsinit flag](#suppress-emitting-localsinit-flag)<br>[<span class="toc-num">3.8</span>&nbsp;Target-typed new expressions](#target-typed-new-expressions)<br>[<span class="toc-num">3.9</span>&nbsp;Static anonymous functions](#static-anonymous-functions)<br>[<span class="toc-num">3.10</span>&nbsp;Target-typed conditional expressions](#target-typed-conditional-expressions)<br>[<span class="toc-num">3.11</span>&nbsp;Covariant return types](#covariant-return-types)<br>[<span class="toc-num">3.12</span>&nbsp;Extension GetEnumerator support for foreach loops](#extension-getenumerator-support-for-foreach-loops)<br>[<span class="toc-num">3.13</span>&nbsp;Lambda discard parameters](#lambda-discard-parameters)<br>[<span class="toc-num">3.14</span>&nbsp;Attributes on local functions](#attributes-on-local-functions)<br>[<span class="toc-num">3.15</span>&nbsp;Module initializers](#module-initializers)<br>[<span class="toc-num">3.16</span>&nbsp;New features for partial methods](#new-features-for-partial-methods) |
{: .toc-table #toc}

---

# C# support by Unity version {#unity-csharp-versions}

| Unity version | C# version | API compatibility level | Notes |
|---|---|---|---|
| 2017.1 | C# 6 | .NET 4.x (experimental) | Roslyn compiler introduced |
| 2018.3 | C# 7.3 | .NET Standard 2.0 / .NET 4.x | [Previous post]({{ site.baseurl }}/the-difference-of-scripting-on-the-unity-2018-3/) |
| 2020.2 ~ 2021.1 | C# 8.0 | .NET Standard 2.0 / .NET 4.x | Some C# 8 features unsupported |
| 2021.2 ~ Unity 6 | C# 9.0 | .NET Standard 2.1 / .NET Framework 4.8 | All of C# 8, some C# 9 features unsupported |
| Unity 6.8 / 7.0 (CoreCLR) | C# 9.0 | .NET Standard 2.1 | Only the runtime changes to CoreCLR; .NET 10-based BCL in 7.0 |

In 2021.2 Unity upgraded its bundled Mono and added the .NET Standard 2.1 API, which unlocked the C# 8 features that had been blocked until then.

## Unsupported features
Using any of these is a compile error.

- **2020.2 ~ 2021.1 (C# 8)**: Default interface methods, Indices and ranges, Asynchronous streams, Asynchronous disposable. These need runtime support or types from .NET Standard 2.1.
- **2021.2 and later (C# 9)**: Init only setters, Covariant return types, Module initializers, Suppress emitting localsinit flag, and extensible calling conventions for function pointers.

Records and init only setters work once you declare the `IsExternalInit` type yourself. See [Records](#records).

---

# C#8.0

## Readonly members
Mark struct methods or properties `readonly` to say they don't change the struct's state. The compiler checks it, and it avoids defensive copies when they are called through `in` parameters or `readonly` fields.

```csharp
public struct Stat
{
    public int Base;
    public int Bonus;

    // members that don't modify state
    public readonly int Total => Base + Bonus;

    public readonly override string ToString() => $"{Total} ({Base} + {Bonus})";

    public void AddBonus(int value) => Bonus += value;

    // public readonly void Reset() => Bonus = 0; // compile error
}
```

## Default interface methods
Interfaces can contain default implementations. You can add a method to an interface that many classes already implement without touching those classes. **Available from 2021.2.**

```csharp
public interface IDamageable
{
    int Health { get; }
    void TakeDamage(int amount);

    // default implementations
    bool IsDead => Health <= 0;
    void Kill() => TakeDamage(Health);
}

public class Enemy : MonoBehaviour, IDamageable
{
    public int Health { get; private set; } = 100;
    public void TakeDamage(int amount) => Health -= amount;
}

IDamageable target = enemy;
target.Kill();             // interface type only
Debug.Log(target.IsDead);  // true
// enemy.Kill();           // compile error: no Kill on class
```

## Switch expressions
`switch` can be used as an expression instead of a statement. No `case` or `break`; it returns a value directly and is much shorter.

```csharp
public enum Rarity { Common, Rare, Epic, Legendary }

// C#7.3
Color GetColor(Rarity rarity)
{
    switch (rarity)
    {
        case Rarity.Common: return Color.white;
        case Rarity.Rare: return Color.blue;
        case Rarity.Epic: return Color.magenta;
        default: return Color.yellow;
    }
}

// C#8.0
Color GetColor(Rarity rarity) => rarity switch
{
    Rarity.Common => Color.white,
    Rarity.Rare => Color.blue,
    Rarity.Epic => Color.magenta,
    _ => Color.yellow,
};
```

`_` works like `default`. The compiler warns if not every case is handled.

## Property patterns
Match on an object's property values. `{ }` means "not null".

```csharp
string Describe(Collider other) => other switch
{
    { isTrigger: true } => "Trigger",
    { attachedRigidbody: { isKinematic: true } } => "Kinematic body",
    { attachedRigidbody: { } } => "Rigidbody",
    _ => "Static collider",
};
```

**Unity caveat**: null checks in patterns (`{ }`, `null`) bypass Unity's overloaded `== null`. A destroyed object still counts as not null, so check objects that may have been destroyed with `!= null` first.

## Tuple patterns
Group several values into a tuple and match them together. Useful when you handle combinations of two or more states.

```csharp
public enum Hand { Rock, Paper, Scissors }

string Play(Hand me, Hand other) => (me, other) switch
{
    (Hand.Rock, Hand.Scissors) => "Win",
    (Hand.Paper, Hand.Rock) => "Win",
    (Hand.Scissors, Hand.Paper) => "Win",
    _ when me == other => "Draw",
    _ => "Lose",
};
```

## Positional patterns
Types with a `Deconstruct` method can be matched by position. A `Deconstruct` written as an extension method works too.

```csharp
public static class VectorExtensions
{
    public static void Deconstruct(this Vector2 v, out float x, out float y)
    {
        x = v.x;
        y = v.y;
    }
}

string GetDirection(Vector2 input) => input switch
{
    (0, 0) => "Idle",
    (0, > 0) => "Up",
    (0, < 0) => "Down",
    (> 0, _) => "Right",
    _ => "Left",
};
```

Relational patterns such as `> 0` are C# 9 syntax, so this example compiles on 2021.2 and later.

## Using declarations
`using` can be written as a variable declaration without a block. `Dispose` is called when the enclosing scope ends, which removes nesting.

```csharp
// C#7.3
void Save(string path, string json)
{
    using (var stream = File.OpenWrite(path))
    {
        using (var writer = new StreamWriter(stream))
        {
            writer.Write(json);
        }
    }
}

// C#8.0
void Save(string path, string json)
{
    using var stream = File.OpenWrite(path);
    using var writer = new StreamWriter(stream);
    writer.Write(json);
} // disposed: writer, then stream
```

## Static local functions
A `static` local function cannot capture outer variables. The compiler catches accidental captures and the allocations or bugs they cause.

```csharp
int CalculateScore(int kills, int deaths)
{
    int bonus = 100;
    return Score(kills, deaths);

    static int Score(int k, int d) => k * 10 - d * 5;
    // static int Score2(int k) => k * bonus; // compile error: can't capture
}
```

## Disposable ref structs
A `ref struct` can't implement interfaces, so it couldn't be `IDisposable`. Now a `public void Dispose()` method is enough to use it with `using`.

```csharp
public ref struct ProfilerScope
{
    public ProfilerScope(string name) => UnityEngine.Profiling.Profiler.BeginSample(name);
    public void Dispose() => UnityEngine.Profiling.Profiler.EndSample();
}

void Update()
{
    using var scope = new ProfilerScope("Enemy.Update");
    // code to measure
}
```

## Nullable reference types
Reference types can be marked as nullable (`string?`) or not (`string`), and the compiler warns about possible nulls. It is off by default; turn it on with `#nullable enable` at the top of a file or `-nullable:enable` in `csc.rsp`.

```csharp
#nullable enable
public class Inventory
{
    private readonly Dictionary<string, Item> items = new Dictionary<string, Item>();

    public Item? Find(string id) => items.TryGetValue(id, out var item) ? item : null;

    public void Use(string id)
    {
        var item = Find(id);
        // item.Use();      // warning: may be null
        if (item != null)
            item.Use();     // OK
    }
}
```

**Unity caveat**: the Unity API has no nullable annotations, and `[SerializeField]` fields are assigned in the Inspector where the compiler can't see them, so you get a lot of warnings. A destroyed object also isn't null as far as the compiler knows. It works best in plain C# logic code rather than on Unity objects.

## Asynchronous streams
`IAsyncEnumerable<T>` and `await foreach` produce and consume values asynchronously one at a time. `yield return` can be used inside an `async` method. **Available from 2021.2.**

```csharp
async IAsyncEnumerable<int> CountdownAsync(int from)
{
    for (int i = from; i > 0; i--)
    {
        await Task.Delay(1000);
        yield return i;
    }
}

async void Start()
{
    await foreach (var count in CountdownAsync(3))
        Debug.Log(count); // 3, 2, 1 (one second apart)
    Debug.Log("Start!");
}
```

## Asynchronous disposable
`IAsyncDisposable` and `await using` handle cleanup that has to be awaited, such as closing a file or a network connection. **Available from 2021.2.**

```csharp
public class SaveSession : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        await FlushToDiskAsync(); // write remaining data
    }
}

async Task SaveAsync()
{
    await using var session = new SaveSession();
    // save work
} // DisposeAsync is awaited here
```

## Indices and ranges
`^` indexes from the end and `..` slices a range. **Available from 2021.2.**

```csharp
int[] scores = { 10, 20, 30, 40, 50 };

Debug.Log(scores[^1]);        // 50 (last)
Debug.Log(scores[^2]);        // 40

int[] top3 = scores[..3];     // 10, 20, 30
int[] middle = scores[1..^1]; // 20, 30, 40

string fileName = "player_save.json";
string ext = fileName[^4..];  // "json"
```

Arrays and `string` support ranges, but `List<T>` only supports indices like `^1`; a range such as `[1..3]` is a compile error. Also remember that slicing an array copies it into a new array.

## Null-coalescing assignment
`??=` assigns a value only when the variable is null.

```csharp
private List<Enemy> enemies;

public List<Enemy> Enemies => enemies ??= new List<Enemy>();
```

**Unity caveat**: `??=` also bypasses Unity's overloaded `== null`. The code below never looks the component up again after the cached one is destroyed. For Unity objects, check with `if (body == null)`.

```csharp
private Rigidbody body;

// Risky: no re-lookup after Destroy
public Rigidbody Body => body ??= GetComponent<Rigidbody>();
```

## Unmanaged constructed types
The C# 7.3 `unmanaged` constraint now accepts generic structs. If all fields are unmanaged, a constructed generic type like `Pair<int>` counts as unmanaged. Handy for putting generic structs into native containers such as `NativeArray<T>`.

```csharp
public struct Pair<T> where T : unmanaged
{
    public T First;
    public T Second;
}

public static unsafe int SizeOf<T>() where T : unmanaged => sizeof(T);

Debug.Log(SizeOf<Pair<int>>());      // 8
Debug.Log(SizeOf<Pair<Vector3>>());  // 24
```

## Stackalloc in nested expressions
When the result of `stackalloc` is a `Span<T>`, it can be used directly inside other expressions. From 2021.2, .NET Standard 2.1 includes `Span<T>`, so no `unsafe` is needed.

```csharp
Span<int> numbers = stackalloc[] { 1, 2, 3, 4, 5, 6 };

// stackalloc inside an argument
int index = numbers.IndexOfAny(stackalloc[] { 4, 6 });
Debug.Log(index); // 3
```

## Enhancement of interpolated verbatim strings
When combining interpolated and verbatim strings, `@$` is now allowed in addition to `$@`.

```csharp
string path = $@"C:\Saves\{slot}.json"; // allowed since C#7.3
string path2 = @$"C:\Saves\{slot}.json"; // allowed from C#8.0
```

---

# C#9.0

## Records
A `record` is an immutable data type with value-based equality. The compiler generates the constructor, properties, `Equals`, `GetHashCode`, `ToString`, and `Deconstruct`. A `with` expression makes a copy with some values changed.

```csharp
public record ItemData(string Id, string Name, int Price);

var potion = new ItemData("potion", "Potion", 100);
var sale = potion with { Price = 50 };  // copy with only Price changed

Debug.Log(potion == new ItemData("potion", "Potion", 100)); // true (value equality)
Debug.Log(sale); // ItemData { Id = potion, Name = Potion, Price = 50 }
```

**To use it in Unity**: records use init-only setters internally, which need the `IsExternalInit` type that only exists in .NET 5 and later, so they fail to compile as-is. Add this to your project:

```csharp
namespace System.Runtime.CompilerServices
{
    internal static class IsExternalInit { }
}
```

Records don't work with Unity serialization. Use them for runtime data such as event messages or server responses, not for data that has to show up in the Inspector.

## Init only setters
Using `init` instead of `set` lets a value be assigned only during object initialization; after that it is read-only. Unity's docs list this as unsupported, but it works once you add the same `IsExternalInit` declaration as in [Records](#records).

```csharp
public class SpawnRequest
{
    public string PrefabId { get; init; }
    public Vector3 Position { get; init; }
}

var request = new SpawnRequest { PrefabId = "slime", Position = Vector3.zero };
// request.PrefabId = "bat"; // compile error: read-only after init
```

## Top-level statements
Code can go straight at the top of a file without a `Main` method or class. Unity scripts have no entry point, so this isn't useful inside Unity, but it is convenient for standalone console tools.

```csharp
// The whole Program.cs
using System;

Console.WriteLine("Asset converter start");
foreach (var file in args)
    Console.WriteLine(file);
```

## Pattern matching enhancements
Patterns can use relational operators (`<`, `>`, `<=`, `>=`) and logical operators (`and`, `or`, `not`), and can be grouped with parentheses.

```csharp
string GetGrade(int damage) => damage switch
{
    < 0 => throw new ArgumentOutOfRangeException(nameof(damage)),
    0 => "Miss",
    > 0 and < 50 => "Normal",
    >= 50 and < 100 => "Strong",
    _ => "Critical",
};

bool IsVowel(char c) => c is 'a' or 'e' or 'i' or 'o' or 'u';

if (item is not null)
    item.Use();
```

**Unity caveat**: `is not null` and `is null` also bypass Unity's overloaded `== null`. Use `!= null` with Unity objects.

## Native sized integers
`nint` and `nuint` are integers that are 32-bit or 64-bit depending on the platform. Use them when passing pointer-sized values to and from native plugins.

```csharp
nint size = IntPtr.Size;     // 8 on 64-bit platforms
nint offset = 16;
nint next = size + offset;   // unlike IntPtr, arithmetic works
```

## Function pointers
`delegate*` declares and calls function pointers. No delegate object is created, so allocation and call overhead are lower. Requires `unsafe` code, and extensible calling conventions such as `unmanaged[Cdecl]` are not supported.

```csharp
public static unsafe class MathOps
{
    static int Add(int a, int b) => a + b;

    public static void Run()
    {
        delegate*<int, int, int> op = &Add; // static methods only
        Debug.Log(op(1, 2)); // 3
    }
}
```

## Suppress emitting localsinit flag
`[SkipLocalsInit]` skips zero-initializing local variables for performance. **Not supported in Unity.**

```csharp
[System.Runtime.CompilerServices.SkipLocalsInit] // compile error in Unity
static void Fill() { /* ... */ }
```

## Target-typed new expressions
When the type is known, the type name after `new` can be omitted. Long generic declarations get much shorter.

```csharp
// C#8.0
private Dictionary<string, List<Enemy>> enemiesByZone = new Dictionary<string, List<Enemy>>();
Vector3 offset = new Vector3(0, 1, 0);

// C#9.0
private Dictionary<string, List<Enemy>> enemiesByZone = new();
Vector3 offset = new(0, 1, 0);
```

## Static anonymous functions
A `static` lambda cannot capture outer variables. Lambdas without captures are cached and reused, which helps avoid allocations in hot paths like `Update`.

```csharp
int threshold = 10;

var weak = enemies.Where(static e => e.Health < 10);
// var weak2 = enemies.Where(static e => e.Health < threshold); // compile error: can't capture
```

## Target-typed conditional expressions
The conditional operator `?:` compiles even when its two branches have different types, as long as both convert to the target type.

```csharp
// C#8.0: needed (int?)null
int? bonus = isCritical ? 100 : null;

IEnumerable<int> values = useDefault ? new List<int> { 1, 2 } : new int[0];
```

## Covariant return types
Lets an override return a more specific type than the method it overrides. **Not supported in Unity.**

```csharp
public abstract class Weapon
{
    public abstract Weapon Clone();
}

public class Sword : Weapon
{
    public override Sword Clone() => new Sword(); // compile error in Unity
}
```

## Extension GetEnumerator support for foreach loops
`foreach` recognizes a `GetEnumerator` defined as an extension method, so you can iterate types you can't modify.

```csharp
public static class RangeExtensions
{
    public static IEnumerator<int> GetEnumerator(this Range range)
    {
        for (int i = range.Start.Value; i < range.End.Value; i++)
            yield return i;
    }
}

foreach (var i in 0..5)
    Debug.Log(i); // 0, 1, 2, 3, 4
```

## Lambda discard parameters
Unused lambda parameters can be discarded with `_`. Clean for event handlers that don't need their arguments.

```csharp
// C#8.0
SceneManager.sceneLoaded += (scene, mode) => Debug.Log("Loaded");

// C#9.0
SceneManager.sceneLoaded += (_, _) => Debug.Log("Loaded");
```

## Attributes on local functions
Local functions can have attributes.

```csharp
float Evaluate(float t)
{
    return Ease(t) * 2f;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    static float Ease(float x) => x * x * (3f - 2f * x);
}
```

## Module initializers
`[ModuleInitializer]` marks a method that runs once when the assembly loads. **Not supported in Unity.** Use Unity's initialization attributes instead.

```csharp
// compile error in Unity
[System.Runtime.CompilerServices.ModuleInitializer]
internal static void Init() { }

// Unity alternatives
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void InitRuntime() { }

#if UNITY_EDITOR
[UnityEditor.InitializeOnLoadMethod]
static void InitEditor() { }
#endif
```

## New features for partial methods
`partial` methods used to be limited to `void` returns and no access modifiers. Now they can have return values, `out` parameters, and access modifiers, but such partial methods must be implemented. Mostly used to split source-generated code from hand-written code.

```csharp
// PlayerStats.cs
public partial class PlayerStats
{
    public partial int GetMaxHealth();
}

// PlayerStats.Generated.cs (generated code)
public partial class PlayerStats
{
    public partial int GetMaxHealth() => 100;
}
```

---

## References
- [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279)
- [Unity Manual 6000.7 - C# compiler](https://docs.unity.com/en-us/engine/6000.7/manual/programming-environment/overview-of-dot-net-in-unity/csharp-compiler)
- [Unity Manual 2021.2 - C# compiler](https://docs.unity3d.com/2021.2/Documentation/Manual/CSharpCompiler.html)
- [Unity Manual 2021.1 - C# compiler](https://docs.unity3d.com/2021.1/Documentation/Manual/CSharpCompiler.html)
- [Unity 2021.2 programmer features](https://unity.com/releases/programmer-features/2021-2-tech-tier2-features)
- [What's new in C# 8.0](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-80)
- [What's new in C# 9.0](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
