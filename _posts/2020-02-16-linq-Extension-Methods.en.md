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

# Average
Calculates the average of a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
double average = numbers.Average();
// 3

// With condition
double evenAverage = numbers.Where(n => n % 2 == 0).Average();
// 3 (average of 2, 4)
```

# Cast
Casts the elements of an IEnumerable to the specified type.

```csharp
ArrayList list = new ArrayList();
list.Add(1);
list.Add(2);
list.Add(3);

IEnumerable<int> numbers = list.Cast<int>();
// 1, 2, 3
```

# Concat
Concatenates two sequences.

```csharp
int[] first = { 1, 2, 3 };
int[] second = { 4, 5, 6 };

var combined = first.Concat(second);
// 1, 2, 3, 4, 5, 6
```

# Contains
Determines whether a sequence contains a specified element.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
bool hasThree = numbers.Contains(3);
// true

bool hasTen = numbers.Contains(10);
// false
```

# Count
Returns the number of elements in a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
int count = numbers.Count();
// 5

// With condition
int evenCount = numbers.Count(n => n % 2 == 0);
// 2 (2, 4)
```

# DefaultIfEmpty
Returns a collection with a default value if the sequence is empty.

```csharp
int[] empty = { };
var result = empty.DefaultIfEmpty(0);
// { 0 }

int[] numbers = { 1, 2, 3 };
var result2 = numbers.DefaultIfEmpty(0);
// { 1, 2, 3 }
```

# Distinct
Removes duplicate elements from a sequence.

```csharp
int[] numbers = { 1, 2, 2, 3, 3, 3, 4 };
var distinct = numbers.Distinct();
// 1, 2, 3, 4
```

# ElementAt
Returns the element at a specified index in a sequence.

```csharp
int[] numbers = { 10, 20, 30, 40, 50 };
int third = numbers.ElementAt(2);
// 30
```

# ElementAtOrDefault
Returns the element at a specified index or a default value if the index is out of range.

```csharp
int[] numbers = { 10, 20, 30 };
int value = numbers.ElementAtOrDefault(5);
// 0 (default for int)

string[] words = { "a", "b", "c" };
string word = words.ElementAtOrDefault(10);
// null (default for string)
```

# Except
Returns the set difference of two sequences.

```csharp
int[] first = { 1, 2, 3, 4, 5 };
int[] second = { 4, 5, 6, 7, 8 };

var difference = first.Except(second);
// 1, 2, 3
```

# First
Returns the first element of a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
int first = numbers.First();
// 1

// With condition
int firstEven = numbers.First(n => n % 2 == 0);
// 2
```

# FirstOrDefault
Returns the first element or a default value if no element is found.

```csharp
int[] empty = { };
int first = empty.FirstOrDefault();
// 0

int[] numbers = { 1, 2, 3 };
int firstEven = numbers.FirstOrDefault(n => n > 10);
// 0
```

# GroupBy
Groups elements of a sequence by a key selector function.

```csharp
string[] words = { "apple", "banana", "apricot", "blueberry", "cherry" };

var groups = words.GroupBy(w => w[0]);

foreach (var group in groups)
{
    Console.WriteLine($"Key: {group.Key}");
    foreach (var word in group)
    {
        Console.WriteLine($"  {word}");
    }
}
// Key: a
//   apple
//   apricot
// Key: b
//   banana
//   blueberry
// Key: c
//   cherry
```

# GroupJoin
Joins two sequences based on key equality and groups the results.

```csharp
var departments = new[] { new { Id = 1, Name = "IT" }, new { Id = 2, Name = "HR" } };
var employees = new[] { new { Id = 1, Name = "Kim", DeptId = 1 }, new { Id = 2, Name = "Lee", DeptId = 1 }, new { Id = 3, Name = "Park", DeptId = 2 } };

var result = departments.GroupJoin(
    employees,
    dept => dept.Id,
    emp => emp.DeptId,
    (dept, empGroup) => new { Department = dept.Name, Employees = empGroup }
);

// IT: Kim, Lee
// HR: Park
```

# Intersect
Returns the set intersection of two sequences.

```csharp
int[] first = { 1, 2, 3, 4, 5 };
int[] second = { 4, 5, 6, 7, 8 };

var intersection = first.Intersect(second);
// 4, 5
```

# Join
Joins two sequences based on matching keys.

```csharp
var customers = new[] { new { Id = 1, Name = "Kim" }, new { Id = 2, Name = "Lee" } };
var orders = new[] { new { Id = 100, CustomerId = 1, Product = "Laptop" }, new { Id = 101, CustomerId = 2, Product = "Phone" }, new { Id = 102, CustomerId = 1, Product = "Tablet" } };

var result = customers.Join(
    orders,
    c => c.Id,
    o => o.CustomerId,
    (c, o) => new { CustomerName = c.Name, OrderProduct = o.Product }
);

// Kim - Laptop
// Kim - Tablet
// Lee - Phone
```

# Last
Returns the last element of a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
int last = numbers.Last();
// 5

// With condition
int lastEven = numbers.Last(n => n % 2 == 0);
// 4
```

# LastOrDefault
Returns the last element or a default value if no element is found.

```csharp
int[] empty = { };
int last = empty.LastOrDefault();
// 0

int[] numbers = { 1, 2, 3 };
int lastEven = numbers.LastOrDefault(n => n > 10);
// 0
```

# Max
Returns the maximum value in a sequence.

```csharp
int[] numbers = { 1, 5, 3, 9, 2 };
int max = numbers.Max();
// 9

// With condition
int maxEven = numbers.Where(n => n % 2 == 0).Max();
// 2
```

# Min
Returns the minimum value in a sequence.

```csharp
int[] numbers = { 5, 1, 3, 9, 2 };
int min = numbers.Min();
// 1

// With condition
int minEven = numbers.Where(n => n % 2 == 0).Min();
// 2
```

# OfType
Filters elements of a sequence based on a specified type.

```csharp
object[] values = { 1, "hello", 2.5, 3, "world" };

var numbers = values.OfType<int>();
// 1, 3

var strings = values.OfType<string>();
// "hello", "world"
```

# OrderBy
Sorts elements in ascending order.

```csharp
int[] numbers = { 5, 2, 8, 1, 9 };
var sorted = numbers.OrderBy(n => n);
// 1, 2, 5, 8, 9

// String sorting
string[] words = { "banana", "apple", "cherry" };
var sortedWords = words.OrderBy(w => w);
// "apple", "banana", "cherry"
```

# OrderByDescending
Sorts elements in descending order.

```csharp
int[] numbers = { 5, 2, 8, 1, 9 };
var sorted = numbers.OrderByDescending(n => n);
// 9, 8, 5, 2, 1
```

# Reverse
Reverses the order of elements in a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
var reversed = numbers.Reverse();
// 5, 4, 3, 2, 1
```

# Select
Projects each element of a sequence into a new form.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
var squares = numbers.Select(n => n * n);
// 1, 4, 9, 16, 25

// Transform to anonymous type
var result = numbers.Select(n => new { Number = n, IsEven = n % 2 == 0 });
// { Number = 1, IsEven = false }
// { Number = 2, IsEven = true }
// ...
```

# SelectMany
Projects each element to a sequence and flattens the result.

```csharp
string[] sentences = { "Hello World", "How are you" };

var words = sentences.SelectMany(s => s.Split(' '));
// "Hello", "World", "How", "are", "you"

// Flatten nested collections
int[][] arrays = { new[] { 1, 2 }, new[] { 3, 4 }, new[] { 5, 6 } };
var flattened = arrays.SelectMany(a => a);
// 1, 2, 3, 4, 5, 6
```

# SequenceEqual
Determines whether two sequences are equal by comparing elements.

```csharp
int[] first = { 1, 2, 3 };
int[] second = { 1, 2, 3 };
int[] third = { 3, 2, 1 };

bool equal1 = first.SequenceEqual(second);
// true

bool equal2 = first.SequenceEqual(third);
// false
```

# Single
Returns the only element of a sequence. Throws exception if there's none or more than one.

```csharp
int[] oneElement = { 42 };
int single = oneElement.Single();
// 42

int[] numbers = { 1, 2, 3, 4, 5 };
int singleEven = numbers.Single(n => n % 2 == 0 && n < 3);
// 2
```

# SingleOrDefault
Returns the only element or default value if no element is found.

```csharp
int[] empty = { };
int single = empty.SingleOrDefault();
// 0

int[] numbers = { 1, 3, 5 };
int singleEven = numbers.SingleOrDefault(n => n % 2 == 0);
// 0 (no matching element)
```

# Skip
Bypasses a specified number of elements in a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
var skipped = numbers.Skip(2);
// 3, 4, 5
```

# SkipWhile
Bypasses elements as long as a condition is true.

```csharp
int[] numbers = { 1, 2, 3, 4, 5, 1, 2 };
var result = numbers.SkipWhile(n => n < 3);
// 3, 4, 5, 1, 2 (stops when condition becomes false)
```

# Sum
Calculates the sum of a sequence.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
int sum = numbers.Sum();
// 15

// With condition
int evenSum = numbers.Where(n => n % 2 == 0).Sum();
// 6 (2 + 4)
```

# Take
Returns a specified number of elements from the start.

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
var taken = numbers.Take(3);
// 1, 2, 3
```

# TakeWhile
Returns elements as long as a condition is true.

```csharp
int[] numbers = { 1, 2, 3, 4, 5, 1, 2 };
var result = numbers.TakeWhile(n => n < 4);
// 1, 2, 3 (stops when condition becomes false)
```

# ToArray
Converts a sequence to an array.

```csharp
var numbers = Enumerable.Range(1, 5);
int[] array = numbers.ToArray();
// int[] { 1, 2, 3, 4, 5 }
```

# ToDictionary
Converts a sequence to a Dictionary.

```csharp
var people = new[] { new { Id = 1, Name = "Kim" }, new { Id = 2, Name = "Lee" } };

var dict = people.ToDictionary(p => p.Id, p => p.Name);
// Dictionary<int, string> { {1, "Kim"}, {2, "Lee"} }
```

# ToList
Converts a sequence to a List.

```csharp
var numbers = Enumerable.Range(1, 5);
List<int> list = numbers.ToList();
// List<int> { 1, 2, 3, 4, 5 }
```

# ToLookup
Converts a sequence to a Lookup (one-to-many mapping).

```csharp
string[] words = { "apple", "banana", "apricot", "blueberry", "cherry" };

var lookup = words.ToLookup(w => w[0]);

foreach (var group in lookup['a'])
{
    Console.WriteLine(group);
}
// apple
// apricot
```

# Union
Returns the set union of two sequences.

```csharp
int[] first = { 1, 2, 3, 4 };
int[] second = { 3, 4, 5, 6 };

var union = first.Union(second);
// 1, 2, 3, 4, 5, 6 (duplicates removed)
```

# Where
Filters elements based on a predicate.

```csharp
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evens = numbers.Where(n => n % 2 == 0);
// 2, 4, 6, 8, 10

var biggerThanFive = numbers.Where(n => n > 5);
// 6, 7, 8, 9, 10
```

# Zip
Merges two sequences using a specified function.

```csharp
int[] numbers = { 1, 2, 3 };
string[] words = { "one", "two", "three" };

var result = numbers.Zip(words, (n, w) => $"{n} = {w}");
// "1 = one", "2 = two", "3 = three"

// Longer sequence is truncated
int[] more = { 1, 2, 3, 4, 5 };
string[] less = { "a", "b" };
var zipped = more.Zip(less, (n, w) => $"{n}-{w}");
// "1-a", "2-b"
```

---

## References
- [Microsoft Docs - LINQ Enumerable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?redirectedfrom=MSDN&view=netframework-4.8#methods)
- [LINQ Methods](https://www.dotnetperls.com/linq)
