---
layout: post
title: "Struct in C#"
description: Differences between struct in C++ and C#, and Unity Vector2 case study
image: /assets/idewithnotebook.webp
date: 2020-07-14 18:20:11 +0900
tags: [c#, struct, unity]
categories: [unity]
lang: en
permalink: /struct-in-c-sharp/
---

# Struct: Differences in C++ vs C#, and Unity Vector2 Case Study

## Introduction
In Unity development, I've seen C++ programmers use struct the way they used to in C++ out of habit. For example, I've seen cases where large data like `player` is made into `struct` and used in collections like `Queue` or `Dictionary`.
At that time, experiencing performance issues and unexpected behaviors, I want to summarize how `struct` differs between C++ and C#, and how Unity handles structs like `Vector2`.

---

## C++ Struct vs C# Struct

| Aspect | C++ Struct | C# Struct |
|--------|------------|-----------|
| Basic Meaning | Almost identical to class | Value Type |
| Inheritance | Possible | Not possible (only interface implementation) |
| Memory Location | Heap or Stack | Stack (or inline) |
| Default Constructor | Compiler generated | Must be explicitly defined |
| Destructor | Can be auto-called | Cannot be explicitly defined |

---

## Key Differences in Detail

### 1. Memory Management
**C++**: struct instances are allocated on stack or heap depending on declaration location.

**C#**: structs are always allocated on stack (except when containing reference types). Large structs can cause stack overflow.

### 2. Copy Behavior
**C++**: Can pass efficiently via pointers or references.

**C#**: Every time you pass a struct to a function or assign to a variable, a **full copy** occurs.

```csharp
struct Point
{
    public int X, Y;
}

void ModifyPoint(Point p)
{
    p.X = 10;  // Doesn't affect original (modifying copy)
}

// Solution: use ref
void ModifyPoint(ref Point p)
{
    p.X = 10;  // Original is modified
}
```

### 3. Collection Usage
**C++**: Can store struct pointers in collections.

**C#**: Boxing occurs every time you put a struct in a collection.

```csharp
List<Point> points = new List<Point>();
points.Add(new Point { X = 1, Y = 2 });  // Copy occurs
```

---

## Unity Vector2 Case

Unity's `Vector2`, `Vector3`, `Quaternion`, etc. are all structs.

```csharp
Vector2 position = transform.position;  // Copy occurs
position.x = 5;  // transform.position is NOT changed!

// Correct approach
transform.position = new Vector2(5, position.y);
```

---

## When Should You Use Struct?

### ✅ Suitable Cases
- Small, immutable data (coordinates, colors, time, etc.)
- Short-lived local variables
- Performance-critical calculation logic
- When you want to reduce GC pressure

### ❌ Unsuitable Cases
- Large data structures (player, items, level data)
- Frequently changing data
- Objects frequently added/removed from collections
- When inheritance is needed

---

## Performance Tips

1. **Reduced GC Pressure**: Since structs are allocated on stack, not GC heap, garbage collection burden is reduced.
2. **Array Access Optimization**: Struct arrays are contiguously placed in memory for good cache efficiency.
3. **Copy Cost Caution**: Frequently copying large structs can degrade performance.

```csharp
// Bad example: continuously copying large struct
struct LargeData { public int[] data; }  // Array itself is a reference!

// Good example: use class
class LargeData { public int[] data; }  // Only reference is copied
```

---

## Conclusion
For developers coming from C++, it's easy to misunderstand C# structs as simply "small classes". However, they clearly have **value type** semantics, and you should always consider copy behavior and boxing when using them.

The same applies when handling Vector2 in Unity - understanding these characteristics helps avoid unexpected bugs and optimize performance.

🎯 TL;DR: C# structs are suitable for small, immutable data, and should always be used with copy and boxing behavior in mind.

---

## References
- [Microsoft Docs - Struct](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct)
- [Choosing between class and struct](https://learn.microsoft.com/ko-kr/dotnet/standard/design-guidelines/choosing-between-class-and-struct)
- [Unity Vector2 Source](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector2.cs)
- [Stack Overflow - Cannot modify return value](https://stackoverflow.com/questions/1747654/error-cannot-modify-the-return-value-c-sharp)
- [Stack Overflow - Is struct ever boxed?](https://stackoverflow.com/questions/3742922/is-a-c-sharp-struct-ever-boxed-when-declared-as-the-return-value-of-a-function)
