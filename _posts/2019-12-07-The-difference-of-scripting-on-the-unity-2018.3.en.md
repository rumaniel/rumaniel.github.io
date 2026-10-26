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

| Version | Contents |
|---|---|
| <span class="toc-num">1</span>&nbsp;**[C#4](#c4)** | <span class="toc-num">1.1</span>&nbsp;[Dynamic binding](#dynamic-binding)<br><span class="toc-num">1.2</span>&nbsp;[Named/optional arguments](#namedoptional-arguments)<br><span class="toc-num">1.3</span>&nbsp;[Generic covariant and contravariant](#generic-covariant-and-contravariant)<br><span class="toc-num">1.4</span>&nbsp;[Embedded interop types](#embedded-interop-types) |
| <span class="toc-num">2</span>&nbsp;**[C#5](#c5)** | <span class="toc-num">2.1</span>&nbsp;[New keyword async await](#new-keyword-async-await)<br>&emsp;<span class="toc-num">2.1.1</span>&nbsp;[Notes for async programming in Unity](#notes-for-async-programming-in-unity)<br>&emsp;<span class="toc-num">2.1.2</span>&nbsp;[Key differences between coroutines and async-await](#key-differences-between-coroutines-and-async-await)<br><span class="toc-num">2.2</span>&nbsp;[Caller info attributes](#caller-info-attributes) |
| <span class="toc-num">3</span>&nbsp;**[C#6](#c6)** | <span class="toc-num">3.1</span>&nbsp;[Read-only auto-properties](#read-only-auto-properties)<br><span class="toc-num">3.2</span>&nbsp;[Auto-property initializers](#auto-property-initializers)<br><span class="toc-num">3.3</span>&nbsp;[Index initializers](#index-initializers)<br><span class="toc-num">3.4</span>&nbsp;[String interpolation](#string-interpolation)<br><span class="toc-num">3.5</span>&nbsp;[Expression-bodied function members](#expression-bodied-function-members)<br><span class="toc-num">3.6</span>&nbsp;[using static](#using-static)<br><span class="toc-num">3.7</span>&nbsp;[Null-conditional operators](#null-conditional-operators)<br><span class="toc-num">3.8</span>&nbsp;[nameof expressions](#nameof-expressions)<br><span class="toc-num">3.9</span>&nbsp;[Exception filters](#exception-filters)<br><span class="toc-num">3.10</span>&nbsp;[Await in catch and finally blocks](#await-in-catch-and-finally-blocks)<br><span class="toc-num">3.11</span>&nbsp;[Extension Add methods in collection initializers](#extension-add-methods-in-collection-initializers) |
| <span class="toc-num">4</span>&nbsp;**[C#7.0](#c70)** | <span class="toc-num">4.1</span>&nbsp;[out variables](#out-variables)<br><span class="toc-num">4.2</span>&nbsp;[Tuples](#tuples)<br><span class="toc-num">4.3</span>&nbsp;[Discards](#discards)<br><span class="toc-num">4.4</span>&nbsp;[Pattern Matching](#pattern-matching)<br><span class="toc-num">4.5</span>&nbsp;[ref locals and returns](#ref-locals-and-returns)<br><span class="toc-num">4.6</span>&nbsp;[Local Functions](#local-functions)<br><span class="toc-num">4.7</span>&nbsp;[More expression-bodied members](#more-expression-bodied-members)<br><span class="toc-num">4.8</span>&nbsp;[throw Expressions](#throw-expressions)<br><span class="toc-num">4.9</span>&nbsp;[Generalized async return types](#generalized-async-return-types)<br><span class="toc-num">4.10</span>&nbsp;[Numeric literal syntax improvements](#numeric-literal-syntax-improvements) |
| <span class="toc-num">5</span>&nbsp;**[C#7.1](#c71)** | <span class="toc-num">5.1</span>&nbsp;[async Main method](#async-main-method)<br><span class="toc-num">5.2</span>&nbsp;[default literal expressions](#default-literal-expressions)<br><span class="toc-num">5.3</span>&nbsp;[Inferred tuple element names](#inferred-tuple-element-names)<br><span class="toc-num">5.4</span>&nbsp;[Pattern matching on generic type parameters](#pattern-matching-on-generic-type-parameters) |
| <span class="toc-num">6</span>&nbsp;**[C#7.2](#c72)** | <span class="toc-num">6.1</span>&nbsp;[Techniques for writing safe efficient code](#techniques-for-writing-safe-efficient-code)<br><span class="toc-num">6.2</span>&nbsp;[Non-trailing named arguments](#non-trailing-named-arguments)<br><span class="toc-num">6.3</span>&nbsp;[Leading underscores in numeric literals](#leading-underscores-in-numeric-literals)<br><span class="toc-num">6.4</span>&nbsp;[private protected access modifier](#private-protected-access-modifier)<br><span class="toc-num">6.5</span>&nbsp;[Conditional ref expressions](#conditional-ref-expressions) |
| <span class="toc-num">7</span>&nbsp;**[C#7.3](#c73)** | <span class="toc-num">7.1</span>&nbsp;[Indexing fixed fields without pinning](#indexing-fixed-fields-without-pinning)<br><span class="toc-num">7.2</span>&nbsp;[Reassigning ref local variables](#reassigning-ref-local-variables)<br><span class="toc-num">7.3</span>&nbsp;[stackalloc array initializers](#stackalloc-array-initializers)<br><span class="toc-num">7.4</span>&nbsp;[More types support the fixed statement](#more-types-support-the-fixed-statement)<br><span class="toc-num">7.5</span>&nbsp;[Enhanced generic constraints](#enhanced-generic-constraints)<br><span class="toc-num">7.6</span>&nbsp;[Tuple equality](#tuple-equality)<br><span class="toc-num">7.7</span>&nbsp;[Attributes on backing fields of auto-properties](#attributes-on-backing-fields-of-auto-properties)<br><span class="toc-num">7.8</span>&nbsp;[Expression variables in initializers](#expression-variables-in-initializers)<br><span class="toc-num">7.9</span>&nbsp;[Improved overload candidates](#improved-overload-candidates)<br><span class="toc-num">7.10</span>&nbsp;[in method overload tiebreaker](#in-method-overload-tiebreaker) |
{: .toc-table}

---

# C#4

## Dynamic binding
`dynamic` is similar to `object`, but the type is resolved at runtime.

```csharp
dynamic value = 10;
value = value + 5;       // resolved as int addition at runtime
value = "Hello";
Debug.Log(value.Length); // resolved as string.Length at runtime; a missing member is a runtime error
```

`dynamic` relies on runtime code generation (Reflection.Emit), so it does not work on AOT platforms such as IL2CPP (iOS, consoles, WebGL, ...).

## Named/optional arguments
Arguments can be passed by parameter name instead of position (named), and parameters with default values can be omitted (optional).

```csharp
void UpdateProfile(string name, int age, string job)
{
    // do
}

void Spawn(string name, int count = 1, float delay = 0f)
{
    // do
}

void Start()
{
    // Normal call
    UpdateProfile("Kim", 32, "Programmer");

    // Any order
    UpdateProfile(age: 32, job: "Programmer", name: "Kim");
    UpdateProfile(job: "Programmer", name: "Kim", age: 32);

    // Mixing them like this is a compile error
    // UpdateProfile(job: "Programmer", 32, "Kim");
    // UpdateProfile(32, name: "Kim", "Programmer");

    // Parameters with default values can be omitted
    Spawn("Slime");            // count = 1, delay = 0
    Spawn("Slime", 3);         // delay = 0
    Spawn("Slime", delay: 2f); // skip a middle parameter by name
}
```

## Generic covariant and contravariant
Adding `out` (covariance) or `in` (contravariance) to the type parameters of generic interfaces and delegates allows more flexible conversions.

```csharp
// Covariance (out): more specific type -> more general type
// IEnumerable is declared as IEnumerable<out T>
IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings;

// Contravariance (in): more general type -> more specific type
// Action is declared as Action<in T>
Action<Component> logName = component => Debug.Log(component.name);
Action<Transform> logTransform = logName;

// Declaring your own
public interface ISpawner<out T> where T : Component
{
    T Spawn();
}
```

`out` can only be used for return types and `in` only for parameter types. Variance applies only to interfaces and delegates (not classes) and does not work with value types such as `int`.

## Embedded interop types
Embeds type information from COM interop assemblies (PIAs) into the calling assembly, so the interop assembly does not need to be deployed. It is mainly used for Windows COM work such as Office automation and is rarely needed in Unity game development, so no example here.

---

# C#5

## New keyword async await
Enables asynchronous operations with `async` and `await` keywords.

```csharp
// Unity Coroutine
using System.Collections;
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
using System;
using System.Threading.Tasks;
using UnityEngine;
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

### Notes for async programming in Unity
- Async functions should return `Task` or `Task<TResult>`.
- Async functions that return a task should always be marked `async`.
- Use `async void` only when starting an async function from synchronous code.
- Unity uses UnitySynchronizationContext, so async functions run on the main thread by default.
- The Unity API cannot be accessed outside the main thread.
- Unity WebGL does not currently support work that uses threads.

### Key differences between coroutines and async-await
- Coroutines cannot return values, but `Task<TResult>` can.
- You cannot put `yield` inside try-catch, which makes error handling in coroutines difficult. async-await supports try-catch.
- Coroutines only work in MonoBehaviour-derived classes.
- async-await is not recommended as a complete replacement for Unity coroutines. Profile and decide.

## Caller info attributes
Gets the calling member name, file path, and line number without reflection. Handy for logging helpers.

```csharp
void Start()
{
    ShowCallerInfo("Something happened.");
}
void ShowCallerInfo(string message,
        [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
        [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "",
        [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0)
{
    Debug.Log("message: " + message);
    Debug.Log("member name: " + memberName);
    Debug.Log("source file path: " + sourceFilePath);
    Debug.Log("source line number: " + sourceLineNumber);
}
// Output:
// message: Something happened.
// member name: Start
// source file path: D:\Documents\unity-scripting-upgrade\Unity Project\Assets\CallerInfoTest.cs
// source line number: 10
```

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

Assigning it anywhere other than the constructor is a compile error.

```csharp
public class NPC
{
    public int health { get; }

    public void SetHealth(int health)
    {
        // Error
        this.health = health;
    }
}
```

## Auto-property initializers
Auto-properties can be given an initial value where they are declared.

```csharp
public ICollection<double> Grades { get; } = new List<double>();
public int Health { get; set; } = 100;
```

## Index initializers
Collections can be initialized through the indexer `[]`, which makes the key/value relationship easy to read.

```csharp
// .NET 3.5
private Dictionary<int, string> messages = new Dictionary<int, string>
{
    { 404, "Page not Found"},
    { 302, "Page moved, but left a forwarding address."},
    { 500, "The web server can't come out to play today."}
};

// .NET 4.x
private Dictionary<int, string> webErrors = new Dictionary<int, string>
{
    [404] = "Page not Found",
    [302] = "Page moved, but left a forwarding address.",
    [500] = "The web server can't come out to play today."
};
```

## String interpolation
Prefix a string with `$` to put variables or expressions directly inside `{}`. No need to line up `{0}`, `{1}` like `String.Format`.

```csharp
// .NET 3.5
Debug.Log(String.Format("{0} health: {1}", playerName, health));

// .NET 4.x
Debug.Log($"{playerName} health: {health}");
Debug.Log($"HP: {health / (float)maxHealth:P0}"); // format specifiers work too (e.g. HP: 75%)
```

## Expression-bodied function members
Single-line methods and read-only properties can be written with `=>`.

```csharp
// .NET 3.5
public override string ToString()
{
    return $"{name} : {health * 0.5}";
}

// .NET 4.x
public override string ToString() => $"{name} : {health * 0.5}";
public string Info => $"{name} : {(hpRatio < 0.1 ? "Dead" : "Live")}";
```

## using static
With `using static`, the static members of a class can be used without the class name.

```csharp
// .NET 3.5
using UnityEngine;
public class Example : MonoBehaviour
{
    private void Start()
    {
        Debug.Log(Mathf.RoundToInt(Mathf.PI));
        // Output: 3
    }
}

// .NET 4.x
using UnityEngine;
using static UnityEngine.Mathf;
public class UsingStaticExample : MonoBehaviour
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
```

If `person` is null, `first` gets null instead of throwing `NullReferenceException`; otherwise it gets `FirstName`. For arrays and indexers, change `[]` to `?[]`.

```csharp
first = person?.FirstName ?? "Unspecified";
```

Combine with `??` to provide a default value.

```csharp
A?.B?.Do(C);
A?.B?[C];
```

If an earlier operator returns null, the rest of the chain is skipped. In the example above, if A or B is null, C is not evaluated.

**Unity caveat**: `UnityEngine.Object` types such as `GameObject` and `Component` override `==`, so a destroyed object compares `== null` as `true`. `?.` and `??` bypass that override, so they do not treat destroyed objects as null. Use `if (target != null)` instead of `?.` with Unity objects.

```csharp
Destroy(enemy.gameObject);
// a frame later
Debug.Log(enemy == null);  // true
enemy?.TakeDamage(10);     // not filtered out; touching transform etc. inside throws MissingReferenceException
```

## nameof expressions
`nameof` returns the name of a variable, type, or member as a string. Unlike a string literal, the compiler checks it when you rename things.

```csharp
Debug.Log(nameof(health)); // "health"

if (target == null)
    throw new ArgumentNullException(nameof(target));

// Instead of Invoke("Respawn", 3f), safe to rename
Invoke(nameof(Respawn), 3f);
```

## Exception filters
Add a `when` condition after `catch` to catch an exception only when the condition holds. If it is `false`, the catch block is skipped and the exception keeps propagating, so the stack trace is not lost by rethrowing.

```csharp
try
{
    LoadSaveFile(path);
}
catch (IOException e) when (retryCount < 3)
{
    retryCount++;
    Debug.LogWarning($"Retry {retryCount} : {e.Message}");
}
```

## Await in catch and finally blocks
C# 5 did not allow `await` inside `catch` and `finally` blocks. C# 6 does.

```csharp
async Task SaveAsync()
{
    try
    {
        await WriteFileAsync();
    }
    catch (Exception e)
    {
        await SendErrorLogAsync(e);
    }
    finally
    {
        await CloseConnectionAsync();
    }
}
```

## Extension Add methods in collection initializers
Collection initializers can use an `Add` method defined as an extension method.

```csharp
var dict = new Dictionary<int, string> { 1, 2, 4 };

foreach (var pair in dict)
    Debug.Log($"[{pair.Key}] : {pair.Value}");
// [1] : 1
// [2] : 2
// [4] : 4

public static class DictionaryExtension
{
    public static void Add(this Dictionary<int, string> dict, int index)
    {
        dict.Add(index, index.ToString());
    }
}
```

---

# C#7.0

## out variables
`out` variables can now be declared inline where the method is called.

```csharp
// .NET 3.5
bool error;
string text = StringTable.GetString("SOME_TEXT", out error);

// .NET 4.x
string text = StringTable.GetString("SOME_TEXT", out var error);
```

## Tuples
Group several values together without writing a class or struct. Especially useful for returning multiple values from a method.
`System.Tuple` existed before C# 7.0, but its elements were fixed as `Item1`, `Item2`, and it had no language support.

```csharp
// Named elements
(string Alpha, string Beta) letter = ("a", "b");
Debug.Log($"{letter.Alpha}, {letter.Beta}");

var letter2 = (Alpha: "a", Beta: "b");
Debug.Log($"{letter2.Alpha}, {letter2.Beta}");

// Returning multiple values
(int min, int max) GetRange(int[] values) => (values.Min(), values.Max());

var (min, max) = GetRange(new[] { 3, 1, 5 });
Debug.Log($"{min} ~ {max}"); // 1 ~ 5

// A Deconstruct method lets a class be deconstructed like a tuple
public class Point
{
    public Point(double x, double y)
        => (X, Y) = (x, y);

    public double X { get; }
    public double Y { get; }

    public void Deconstruct(out double x, out double y) =>
        (x, y) = (X, Y);
}

var p = new Point(3.14, 2.71);
var (x, y) = p;
```

## Discards
A discard is a write-only variable written as `_`. Use it when you must receive a value but don't need it, to make that intent explicit.

Use discards when:

- Deconstructing tuples or user-defined types
- Receiving `out` arguments you don't need
- Pattern matching with `is` or `switch` where the value is unused
- Intentionally ignoring a return value (e.g. `_ = Task.Run(Work);`)

```csharp
// Deconstruct a tuple, keeping only what you need
var (_, _, _, pop1, _, pop2) = QueryCityDataForYears("New York City", 1960, 2010);
Debug.Log($"Population change, 1960 to 2010: {pop2 - pop1:N0}");

// out argument: only check whether parsing succeeded
if (int.TryParse(input, out _))
    Debug.Log("It's a number");

private (string, double, int, int, int, int) QueryCityDataForYears(string name, int year1, int year2)
{
    int population1 = 0, population2 = 0;
    double area = 0;

    if (name == "New York City")
    {
        area = 468.48;
        if (year1 == 1960)
            population1 = 7781984;
        if (year2 == 2010)
            population2 = 8175133;
        return (name, area, year1, population1, year2, population2);
    }

    return ("", 0, 0, 0, 0, 0);
}
```

## Pattern Matching
Pattern matching checks a value's type or condition and, if it matches, gives it to you as a variable right away. It works with `is` expressions and `switch` statements, and `when` adds extra conditions.

1. An `is` expression does the type check, cast, and assignment in one step.

```csharp
// .NET 3.5
if (input is int)
    sum += (int)input;

// C#7.0
if (input is int count)
    sum += count;
```

2. `switch` statements got several additions:

- Any type can be switched on.
- A `case` can check a type and assign it to a new variable, just like `is`.
- A `when` clause adds extra conditions.
- `case` order now matters. The first matching case runs.

```csharp
public static int SumPositiveNumbers(IEnumerable<object> sequence)
{
    int sum = 0;
    foreach (var i in sequence)
    {
        switch (i)
        {
            // constant pattern
            case 0:
                break;
            // type pattern
            case IEnumerable<int> childSequence:
            {
                foreach (var item in childSequence)
                    sum += (item > 0) ? item : 0;
                break;
            }
            // pattern with a when clause
            case int n when n > 0:
                sum += n;
                break;
            // null pattern
            case null:
                throw new NullReferenceException("Null found in sequence");
            default:
                throw new InvalidOperationException("Unrecognized type");
        }
    }
    return sum;
}
```

## ref locals and returns
Work with value types by reference instead of copying them. Useful for modifying elements of large arrays or structs directly.

```csharp
int number = 0;
ref int copyNumber = ref number;
copyNumber = 1;

Debug.Log($"number : {number}"); // 1
Debug.Log($"copyNumber : {copyNumber}"); // 1

// Return an array element by reference
public static ref int Find(int[,] matrix, Func<int, bool> predicate)
{
    for (int i = 0; i < matrix.GetLength(0); i++)
        for (int j = 0; j < matrix.GetLength(1); j++)
            if (predicate(matrix[i, j]))
                return ref matrix[i, j];
    throw new InvalidOperationException("Not found");
}

int[,] matrix = new int[5, 5];
matrix[4, 2] = 42;

ref var item = ref Find(matrix, val => val == 42);
item = 24;
Debug.Log(matrix[4, 2]); // 24
```

Rules for ref locals and returns:

- The method declaration, the `return` statement, and the receiving variable all need `ref`.
- Receiving a ref return in a normal variable (without `ref`) copies the value.
- A method's local variables disappear when it returns, so they cannot be returned by ref.
- ref locals cannot be used in async methods.

## Local Functions
A method can be declared inside another method. Helpers used only by that method stay out of the class, and unlike lambdas there is no delegate allocation.

```csharp
public int Fibonacci(int n)
{
    if (n < 0)
        throw new ArgumentException("Must not be negative", nameof(n));

    return Fib(n);

    // local function used only inside Fibonacci
    int Fib(int x) => x < 2 ? x : Fib(x - 1) + Fib(x - 2);
}
```

See [Local functions vs. lambda expressions](https://docs.microsoft.com/en-us/dotnet/csharp/local-functions-vs-lambdas) for how they compare to lambdas.

## More expression-bodied members
C# 6 expression bodies now also work for constructors, finalizers, and getters/setters.

```csharp
// Constructor
public ExpressionMembersExample(string label) => this.Label = label;

// Finalizer
~ExpressionMembersExample() => Debug.Log("Finalized!");

private string label;

// getter / setter
public string Label
{
    get => label;
    set => this.label = value ?? "Default label";
}
```

## throw Expressions
`throw` can be used as an expression, not just a statement: inside `?:`, `??`, and expression-bodied members `=>`.

```csharp
private string name;

// with ??
public string Name
{
    get => name;
    set => name = value ?? throw new ArgumentNullException(nameof(value));
}

// with ?:
public NPC(int health)
    => this.health = health > 0 ? health : throw new ArgumentOutOfRangeException(nameof(health));

// in an expression-bodied member
public void Attack() => throw new NotImplementedException();
```

## Generalized async return types
async methods used to be limited to returning `Task`, `Task<T>`, or `void`. Now any type that follows the `GetAwaiter` pattern can be returned.

The typical example is `ValueTask<T>`. Because it is a struct, it avoids allocating a `Task` on the heap when the result is often already available and the method completes synchronously.

```csharp
private readonly Dictionary<string, Texture2D> cache = new Dictionary<string, Texture2D>();

public async ValueTask<Texture2D> LoadTextureAsync(string key)
{
    // return immediately from cache, no allocation
    if (cache.TryGetValue(key, out var texture))
        return texture;

    texture = await DownloadTextureAsync(key);
    cache[key] = texture;
    return texture;
}
```

Unity 2018.3 does not include `ValueTask` by default; add the `System.Threading.Tasks.Extensions` assembly. [UniTask](https://github.com/Cysharp/UniTask), an allocation-free async library for Unity, is built on this feature.

## Numeric literal syntax improvements
`0b` binary literals and the `_` digit separator make numeric constants easier to read.

```csharp
public const int Sixteen =   0b0001_0000;
public const int ThirtyTwo = 0b0010_0000;
public const int SixtyFour = 0b0100_0000;
public const int OneHundredTwentyEight = 0b1000_0000;
```

The `0b` prefix marks a binary number. Binary numbers get long quickly, so the `_` digit separator makes bit patterns easier to see. The separator can appear anywhere in the constant; for decimal numbers it is usually used as a thousands separator.

```csharp
public const long BillionsAndBillions = 100_000_000_000;
```

The digit separator also works with `decimal`, `float`, and `double`.

```csharp
public const double AvogadroConstant = 6.022_140_857_747_474e23;
public const decimal GoldenRatio = 1.618_033_988_749_894_848_204_586_834_365_638_117_720_309_179M;
```

---

# C#7.1

## async Main method
The program entry point `Main` can be marked `async`.

```csharp
// C#7.0
static int Main()
{
    return DoAsyncWork().GetAwaiter().GetResult();
}

// C#7.1
static async Task<int> Main()
{
    return await DoAsyncWork();
}
```

Unity scripts have no `Main` method, so you won't use this in Unity itself, but it is handy for standalone console tools such as asset converters or build automation.

## default literal expressions
When the target type can be inferred, `default` can be used instead of `default(T)`.

```csharp
// .NET 3.5
Func<string, bool> whereClause = default(Func<string, bool>);

// .NET 4.x
Func<string, bool> whereClause = default;
```

## Inferred tuple element names
When creating a tuple, variable names become the element names.

```csharp
// C#7.0
int count = 5;
string label = "Colors used in the map";
var pair = (count: count, label: label);

// C#7.1
int count = 5;
string label = "Colors used in the map";
var pair = (count, label); // element names are "count" and "label"
```

## Pattern matching on generic type parameters
In C# 7.0, using a type pattern on a value of generic type `T` could cause a compile error. From C# 7.1, `is` and `switch` pattern matching work with generic type parameters.

```csharp
public void Apply<T>(T value)
{
    switch (value)
    {
        case int number:
            Debug.Log($"int : {number}");
            break;
        case string text:
            Debug.Log($"string : {text}");
            break;
    }

    if (value is Component component)
        Debug.Log($"component : {component.name}");
}
```

---

# C#7.2

## Techniques for writing safe efficient code
Syntax for handling value types by reference without copying, while guaranteeing they are not modified. Reduces copy cost in code that passes large structs around.

- `in` parameter - passed by reference but cannot be modified inside the method
- `ref readonly` return - returned by reference but the caller cannot modify it
- `readonly struct` - an immutable struct whose fields are all read-only; the compiler doesn't need defensive copies when it is passed as `in`
- `ref struct` - a struct that is always allocated on the stack; it cannot be used anywhere that ends up on the heap, such as class fields or boxing

```csharp
// readonly struct: immutable struct
public readonly struct Damage
{
    public readonly int Amount;
    public readonly float Critical;

    public Damage(int amount, float critical)
    {
        Amount = amount;
        Critical = critical;
    }
}

public class Unit
{
    private int health = 100;
    private Damage lastDamage;

    // in: received by reference without copying, cannot be modified
    public void Apply(in Damage damage)
    {
        // damage = default; // compile error
        health -= damage.Amount;
        lastDamage = damage;
    }

    // ref readonly: returned by reference, cannot be modified
    public ref readonly Damage LastDamage => ref lastDamage;
}

// ref struct: stack-only
public ref struct StackOnlyCounter
{
    public int Count;
}
```

## Non-trailing named arguments
If a named argument is in its correct position, positional arguments can follow it.

```csharp
UpdateProfile(name: "Kim", 32, job: "Programmer");
UpdateProfile("Kim", age: 32, "Programmer");
```

## Leading underscores in numeric literals
The `_` separator can now appear right after `0b` or `0x`, before the first digit.

```csharp
int binaryValue = 0b_0101_0101;
```

## private protected access modifier
A `private protected` member is accessible only from **derived classes in the same assembly**. In Unity this matters when you split code into assemblies with Assembly Definitions (asmdef). Structs cannot use it because they can't be inherited.

```csharp
// Game.asmdef
public class Unit
{
    private protected int hp;
}

public class Player : Unit
{
    void Heal() => hp += 10;   // same assembly + derived: OK
}

// Mod.asmdef (another assembly)
public class Boss : Unit
{
    void Heal() => hp += 10;   // compile error
}
```

## Conditional ref expressions
The conditional operator `?:` can produce a reference instead of a value.

```csharp
ref var r = ref (arr != null ? ref arr[0] : ref otherArr[0]);
```

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
When choosing among overloads, the compiler now drops candidates whose generic constraints don't match or whose static/instance usage doesn't match before picking one. This removes many unnecessary "ambiguous call" errors. Your code doesn't change, so no example here.

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
