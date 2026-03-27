---
layout: post
title: "LINQ Extension Methods"
description: A comprehensive guide to C# LINQ extension methods - Aggregate, All, Any, AsEnumerable, AsParallel, and more
image: /assets/sugar.jpg
date: 2020-02-16 22:24:34 +0900
tags: [linq, extension-methods]
categories: [c#]
lang: en
permalink: /linq-extension-methods/
---

# LINQ Extension Methods

Using LINQ makes code more readable and organized. Here's a collection of useful extension methods:

- [Aggregate](#aggregate)
- [All](#all)
- [Any](#any)
- [AsEnumerable](#asEnumerable)
- [AsParallel](#asParallel)
- [Average](#average)
- [Cast](#cast)
- [Concat](#concat)
- [Contains](#contains)
- [Count](#count)
- [DefaultIfEmpty](#defaultIfEmpty)
- [Distinct](#distinct)
- [ElementAt](#elementat)
- [ElementAtOrDefault](#elementAtOrDefault)
- [Except](#except)
- [First](#first)
- [FirstOrDefault](#firstOrDefault)
- [GroupBy](#groupBy)
- [GroupJoin](#groupJoin)
- [Intersect](#intersect)
- [Join](#join)
- [Last](#last)
- [LastOrDefault](#lastOrDefault)
- [Max](#max)
- [Min](#min)
- [OfType](#ofType)
- [OrderBy](#orderBy)
- [OrderByDescending](#orderByDescending)
- [Reverse](#reverse)
- [Select](#select)
- [SelectMany](#selectMany)
- [SequenceEqual](#sequenceEqual)
- [Single](#single)
- [SingleOrDefault](#singleOrDefault)
- [Skip](#skip)
- [SkipWhile](#skipWhile)
- [Sum](#sum)
- [Take](#take)
- [TakeWhile](#takeWhile)
- [ToArray](#toArray)
- [ToDictionary](#toDictionary)
- [ToList](#toList)
- [ToLookup](#toLookup)
- [Union](#union)
- [Where](#where)
- [Zip](#zip)

# Aggregate
Applies a method to each element. aggregating the sequence into a single value.

```csharp
// 1. Basic form
public static TSource Aggregate<TSource>(this IEnumerable<TSource> source, Func<TSource, TSource> func)
int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate((sum, next) => sum + next);
// sum: 0, next: 1 => 1
// sum: 1, next: 2 => 3
// sum: 3, next: 3 => 6
// sum: 6, next: 4 => 10
// sum: 10, next: 5 => 15

// 2. With seed value
public static TAccumulate Aggregate<TSource, TAccumulate>(this IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, TAccumulate> func)
int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate(5, (sum, next) => sum + next);
// sum: 5, next: 1 => 6
// sum: 6, next: 2 => 8
// sum: 8, next: 3 => 11
// sum: 11, next: 4 => 15
// sum: 15, next: 5 => 20

// 3. With result selector
public static TResult Aggregate<TSource, TAccumulate, TResult>(this IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, TAccumulate> func, Func<TAccumulate, TResult> resultSelector)
int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate(3, (sum, next) => next > 2 ? sum + next : sum, result => result);
// sum: 3, next: 1 => 3
// sum: 3, next: 2 => 3
// sum: 3, next: 3 => 6
// sum: 6, next: 4 => 10
// sum: 10, next: 5 => 15
// result = 10 % 2
```

# All
Checks if all elements in a collection match a specific condition.

```csharp
public static bool All<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
int[] sumArray = { 1, 2, 3, 4, 5 };
bool isBiggerThanZero = sumArray.All(element => element > 0);
// true
bool isBiggerThanZeroOnEvens = (from number in sumArray
              where number%2 == 0
              select number).All(element => element > 0);
// IEnumerable returned with { 2, 4 }
```

# Any
Checks if at least one element in a collection matches a specific condition.

```csharp
public static bool Any<TSource>(this IEnumerable<TSource> source)
int[] sumArray = { 1, 2, 3, 4, 5 };
bool isBiggerThanFive = sumArray.Any(element => element > 5);
// false
bool isBiggerThanFour = sumArray.Any(element => element > 4);
// true
```

# AsEnumerable
Casts a type implementing IEnumerable to a more specific type for easier LINQ operations.

```csharp
public static IEnumerable<TSource> AsEnumerable<TSource>(this IEnumerable<TSource> source)
int[] sumArray = {1, 2, 3, 4, 5};
var query = sumArray.AsEnumerable();
foreach (var element in query)
{
    // ...
}
```

# AsParallel
Enables parallel processing for better performance.

```csharp
int[] sumArray = {1, 2, 3, 4, 5};
int sum = sumArray.AsParallel().Sum();
```

## References
- [Microsoft Docs - LINQ Enumerable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?redirectedfrom=MSDN&view=netframework-4.8#methods)
- [LINQ Methods](https://www.dotnetperls.com/linq)
