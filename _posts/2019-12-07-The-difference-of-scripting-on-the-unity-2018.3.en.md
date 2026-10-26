---
layout: post
title: "Introduction to C# Scripting Available in Unity 2018.3 and Later"
description: C# features available from Unity 2018.3 - async/await, tuples, pattern matching, and more C# 7.3 features
image: /assets/coding.jpg
date: 2019-12-07 22:24:34 +0900
tags: [c#]
categories: [unity]
lang: en
permalink: /the-difference-of-scripting-on-the-unity-2018-3/
---

Starting from Unity 2017.1, the [Roslyn compiler](https://github.com/dotnet/roslyn) was experimentally applied, enabling scripting compatible with .NET 4.x and C# 6. In 2018.1, the .NET 3.5 runtime became legacy, and from 2018.3, C# 7.3 became available.

- 2017.1 .NET 4.6, C#6 Compatible version
- 2018.1 .NET 4.x Equivalent runtime is no longer considered experimental
- 2018.3 Support C#7.3
- 2019.2 Removed .NET 3.5 Equivalent

Using the latest C# language features in Unity was previously limited. Here's a summary of now-available C# features:

- [C#4](#c4)
  - [Dynamic binding](#dynamic-binding)
  - [Named/optional arguments](#namedoptional-arguments)
- [C#5](#c5)
  - [New keyword async await](#new-keyword-async-await)
    - [Key differences between coroutines and async-await](#key-differences-between-coroutines-and-async-await)
- [C#6](#c6)
  - [Read-only auto-properties](#read-only-auto-properties)
  - [Auto-property initializers](#auto-property-initializers)
  - [String interpolation](#string-interpolation)
  - [Expression-bodied function members](#expression-bodied-function-members)
  - [using static](#using-static)
  - [Null-conditional operators](#null-conditional-operators)
- [C#7.0](#c70)
  - [out variables](#out-variables)
  - [Tuples](#tuples)
  - [Pattern Matching](#pattern-matching)
  - [ref locals and returns](#ref-locals-and-returns)
  - [Local Functions](#local-functions)
  - [More expression-bodied members](#more-expression-bodied-members)
- [C#7.1](#c71)
  - [default literal expressions](#default-literal-expressions)
  - [Inferred tuple element names](#inferred-tuple-element-names)
- [C#7.2](#c72)
  - [Techniques for writing safe efficient code](#techniques-for-writing-safe-efficient-code)
  - [Non-trailing named arguments](#non-trailing-named-arguments)
  - [private protected access modifier](#private-protected-access-modifier)
- [C#7.3](#c73)
  - [Indexing fixed fields without pinning](#indexing-fixed-fields-without-pinning)
  - [Reassigning ref local variables](#reassigning-ref-local-variables)
  - [stackalloc array initializers](#stackalloc-array-initializers)
  - [More types support the fixed statement](#more-types-support-the-fixed-statement)
  - [Enhanced generic constraints](#enhanced-generic-constraints)
  - [Tuple equality](#tuple-equality)
  - [Attributes on backing fields of auto-properties](#attributes-on-backing-fields-of-auto-properties)
  - [Expression variables in initializers](#expression-variables-in-initializers)
  - [Improved overload candidates](#improved-overload-candidates)
  - [in method overload tiebreaker](#in-method-overload-tiebreaker)

---

# C#4

## Dynamic binding
`dynamic` is similar to `object`, but the type is determined at runtime.

## Named/optional arguments
Allows passing arguments by parameter name rather than position.

```csharp
void UpdateProfile(string name, int age, string job)
{
    // do
}

void Start()
{
    // Normal call
    UpdateProfile("Kim", 32, "Programmer");

    // Call regardless of order
    UpdateProfile(age: 32, job: "Programmer", name: "Kim");
    UpdateProfile(job: "Programmer", name: "Kim", age: 32);
}
```

---

# C#5

## New keyword async await
Enables asynchronous operations with `async` and `await` keywords.

```csharp
// Unity Coroutine
using UnityEngine;
public class UnityCoroutineExample : MonoBehaviour
{
    void Start()
    {
        var coroutine = StartCoroutine(WaitAndPrint(2.0f));
        Debug.Log("Before wait " + Time.time);
    }

    IEnumerator WaitAndPrint(float waitTime)
    {
        yield return new WaitForSeconds(waitTime);
        Debug.Log("Finish wait " + Time.time);
    }
}
```

```csharp
// .NET 4.x async-await
using UnityEngine;
using System.Threading.Tasks;
public class AsyncAwaitExample : MonoBehaviour
{
    async void Start()
    {
        Debug.Log("Before wait " + Time.time);
        await WaitAndPrint(1.5f);
        Debug.Log("Print when WaitAndPrint has completed");
    }
    
    async Task WaitAndPrint(float time)
    {
        await Task.Delay(TimeSpan.FromSeconds(time));
        Debug.Log("Finish wait " + Time.time);
    }
}
```

### Key differences between coroutines and async-await
- Coroutines cannot return values, but `Task<TResult>` can
- Cannot use `yield` in try-catch, making error handling difficult in coroutines
- Coroutines only work in MonoBehaviour-derived classes
- async-await is not recommended to completely replace Unity coroutines - profile and decide

---

# C#6

## Read-only auto-properties
Read-only properties can be created by declaring only `get`.

```csharp
public class NPC
{
    public int health { get; }

    public NPC(int health)
    {
        this.health = health;
    }
}
```

## Auto-property initializers
Auto-property constructors can initialize values at declaration.

```csharp
public ICollection<double> Grades { get; } = new List<double>();
public int Health { get; set; } = 100;
```

## String interpolation
```csharp
// .NET 3.5
Debug.Log(String.Format("{0} health: {1}", playerName, health));

// .NET 4.x
Debug.Log($"{playerName} health: {health}");
```

## Expression-bodied function members
```csharp
public override string ToString() => $"{name} : {health * 0.5}";
public string GetInfo => $"{name} : {(hpRatio < 0.1 ? "Dead" : "Live")}";
```

## using static
Improved importing of static methods from a class.

```csharp
// .NET 4.x
using UnityEngine;
using static UnityEngine.Mathf;

public class UsingStaticExample: MonoBehaviour
{
    private void Start()
    {
        Debug.Log(RoundToInt(PI));
        // Output: 3
    }
}
```

## Null-conditional operators
Makes null checks easier and smoother. Simply change member access from `.` to `?.`.

```csharp
var first = person?.FirstName;
first = person?.FirstName ?? "Unspecified";
```

---

# C#7.0

## out variables
`out` variables can now be declared as arguments where the method is called.

```csharp
// .NET 4.x
string text = StringTable.GetString("SOME_TEXT", out var error);
```

## Tuples
Can now create lightweight types with multiple public fields.

```csharp
(string Alpha, string Beta) letter = ("a", "b");
Debug.Log($"{letter.Alpha}, {letter.Beta}");

var letter = (Alpha: "a", Beta: "b");
Debug.Log($"{letter.Alpha}, {letter.Beta}");
```

## Pattern Matching
Enables method dispatch not only on objects but also on properties.

```csharp
if (input is int count)
    sum += count;
```

## ref locals and returns
Can handle references to value types.

```csharp
int number = 0;
ref int copyNumber = ref number;
copyNumber = 1;
Debug.Log($"number: {number}"); // 1
```

## Local Functions
Can nest functions within other functions.

```csharp
public string GetA()
{
    return PrintA();

    string PrintA()
    {
        return "a";
    }
}
```

## More expression-bodied members
```csharp
// Constructor
public ExpressionMembersExample(string label) => this.Label = label;

// Destructor
~ExpressionMembersExample() => Console.Error.WriteLine("Finalized!");
```

---

# C#7.1

## default literal expressions
Can use literal in `default` value expressions when type is inferrable.

```csharp
// .NET 3.5
Func<string, bool> whereClause = default(Func<string, bool>);

// .NET 4.x
Func<string, bool> whereClause = default;
```

## Inferred tuple element names
Tuple element names can be inferred during initialization.

```csharp
// C#7.1
int count = 5;
string label = "Colors used in the map";
var pair = (count, label); // element names are "count" and "label"
```

---

# C#7.2

## Techniques for writing safe efficient code
- `in` - Passed by reference but not modified by called function
- `ref readonly` - Returns reference value but doesn't allow writing
- `readonly struct` - Indicates struct is immutable and should be passed as `in` parameter
- `ref struct` - Indicates struct type can directly access managed memory and is always stack allocated

## Non-trailing named arguments
Named arguments can be used before positional arguments when in correct position.

```csharp
UpdateProfile(name: "Kim", 32, job: "Programmer");
UpdateProfile("Kim", age: 32, "Programmer");
```

## private protected access modifier
`private protected` modifier is accessible only in inherited classes declared in the same assembly.

---

# C#7.3

C# 7.3 focuses on writing safe, efficient code and on polishing existing features. It is available from Unity 2018.3.

The `unsafe` examples below only compile with **Allow 'unsafe' Code** enabled in Player Settings.

## Indexing fixed fields without pinning
Fixed-size buffer fields can be indexed without pinning them in a `fixed` statement first.

```csharp
unsafe struct Packet
{
    public fixed byte data[16];
}

class PacketReader
{
    static Packet packet = new Packet();

    // C#7.2
    unsafe byte ReadOld()
    {
        fixed (byte* ptr = packet.data)
        {
            return ptr[5];
        }
    }

    // C#7.3
    unsafe byte ReadNew() => packet.data[5];
}
```

## Reassigning ref local variables
A `ref` local can be reassigned to refer to a different variable after it is initialized.

```csharp
int a = 1, b = 5;

ref int larger = ref a;
if (b > a)
    larger = ref b; // allowed from C#7.3

larger = 10;
Debug.Log(b); // 10
```

## stackalloc array initializers
Arrays allocated on the stack with `stackalloc` can be initialized inline. They are not heap allocated, so they add no GC pressure.

```csharp
unsafe
{
    int* a = stackalloc int[3] { 1, 2, 3 };
    int* b = stackalloc int[] { 1, 2, 3 };
}
```

On .NET Core you can write `Span<int> span = stackalloc int[] { 1, 2, 3 };` without `unsafe`, but Unity 2018.3 does not ship `Span<T>` (`System.Memory`) by default, so you need a pointer.

## More types support the fixed statement
`fixed` used to work only with arrays, `string`, fixed-size buffers, and unmanaged variables. Now any type with a `ref T GetPinnableReference()` method can be used.

```csharp
class PixelBuffer
{
    private readonly int[] pixels = new int[256];

    public ref int GetPinnableReference() => ref pixels[0];
}

unsafe
{
    var buffer = new PixelBuffer();
    fixed (int* ptr = buffer)
    {
        ptr[0] = 0xFF;
    }
}
```

## Enhanced generic constraints
`unmanaged`, `System.Enum`, and `System.Delegate` can be used as generic constraints.

- `unmanaged` - only structs without reference-type fields (`int`, `float`, `Vector3`, ...), which allows pointers and `sizeof` in generic code
- `System.Enum` - only enum types
- `System.Delegate` - only delegate types

```csharp
// unmanaged
public static unsafe int SizeOf<T>() where T : unmanaged => sizeof(T);

Debug.Log(SizeOf<Vector3>()); // 12

// System.Enum
public static Dictionary<int, string> EnumNamedValues<T>() where T : System.Enum
{
    var result = new Dictionary<int, string>();
    foreach (int item in Enum.GetValues(typeof(T)))
        result.Add(item, Enum.GetName(typeof(T), item));
    return result;
}

// System.Delegate
public static TDelegate Combine<TDelegate>(TDelegate source, TDelegate target)
    where TDelegate : System.Delegate
    => Delegate.Combine(source, target) as TDelegate;
```

## Tuple equality
Tuples support `==` and `!=`. Elements are compared in order; element names do not affect the result.

```csharp
var left = (a: 5, b: 10);
var right = (a: 5, b: 10);
Debug.Log(left == right); // true

// Up to C#7.2
Debug.Log(left.a == right.a && left.b == right.b);

// Different names, same values: still true
(int x, int y) point = (5, 10);
Debug.Log(left == point); // true
```

## Attributes on backing fields of auto-properties
Attributes can target the compiler-generated backing field of an auto-property with `field:`. This is especially handy with Unity's `SerializeField`.

```csharp
// C#7.2
[SerializeField] private int health;
public int Health => health;

// C#7.3
[field: SerializeField]
public int Health { get; private set; }
```

Note that the serialized field name becomes `<Health>k__BackingField`. If you later switch to a plain field, add `[FormerlySerializedAs("<Health>k__BackingField")]` or the existing data is lost.

## Expression variables in initializers
`out var` and pattern variables can be used in field initializers, property initializers, constructor initializers, and LINQ query clauses.

```csharp
public class Base
{
    public Base(int i, out int j)
    {
        j = i;
    }
}

public class Derived : Base
{
    // out var in a constructor initializer
    public Derived(int i) : base(i, out var j)
    {
        Debug.Log($"The value of 'j' is {j}");
    }
}
```

## Improved overload candidates
Overload resolution now drops obviously invalid candidates early, which removes many unnecessary "ambiguous call" errors.

- Candidates whose type arguments don't satisfy their generic constraints are removed.
- Instance members are removed when there is no receiver; static members are removed when called through an instance.
- When passing a method group, candidates whose return type doesn't match the delegate are removed.

## in method overload tiebreaker
When two overloads differ only by a by-value parameter versus an `in` parameter, C#7.2 reported an ambiguous call. From C#7.3, the by-value overload wins unless the caller writes `in`.

```csharp
static void Move(Vector3 position) { }
static void Move(in Vector3 position) { }

Move(position);    // by-value overload
Move(in position); // in overload
```

---

## References
- [Unity Blog - Scripting Runtime Improvements](https://blogs.unity3d.com/2018/07/11/scripting-runtime-improvements-in-unity-2018-2/)
- [Visual Studio - Unity Scripting Upgrade](https://docs.microsoft.com/en-us/visualstudio/cross-platform/unity-scripting-upgrade?view=vs-2019)
- [Microsoft Docs - C# Version History](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history)
- [Microsoft Docs - What's new in C# 7.3](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-7-3)
