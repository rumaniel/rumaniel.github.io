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
- [C#5](#c5)
- [C#6](#c6)
- [C#7.0](#c70)
- [C#7.1](#c71)
- [C#7.2](#c72)
- [C#7.3](#c73)

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

Enhanced generic constraints, tuple equality, and more pattern matching improvements.

---

## References
- [Unity Blog - Scripting Runtime Improvements](https://blogs.unity3d.com/2018/07/11/scripting-runtime-improvements-in-unity-2018-2/)
- [Visual Studio - Unity Scripting Upgrade](https://docs.microsoft.com/en-us/visualstudio/cross-platform/unity-scripting-upgrade?view=vs-2019)
- [Microsoft Docs - C# Version History](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history)
