---
layout: post
title: "LINQ Extension Methods"
description: C# LINQ 확장 메소드 정리 - Aggregate, All, Any, AsEnumerable, AsParallel 등
image: /assets/sugar.jpg
date: 2020-02-16 22:24:34 +0900
tags: [linq, extension-methods]
categories: [C#]
lang: ko
permalink: /linq-extension-methods/
---

# LINQ Extension Methods

LINQ를 사용하면 코드를 더 읽기 쉽고 정리하기 좋은 확장 메소드들을 정리해보았습니다.

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
각 요소에 메서드를 적용합니다. 시퀀스를 하나의 값으로 집계합니다.

{% highlight c# %}
// 1. 기본 형태
public static TSource Aggregate<TSource>(this IEnumerable<TSource> source, Func<TSource, TSource, func)
int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate((sum, next) => sum + next);
// sum: 0, next: 1 => 1
// sum: 1, next: 2 => 3
// sum: 3, next: 3 => 6
// sum: 6, next: 4 => 10
// sum: 10, next: 5 => 15

// 2. 초기값이 있는 경우
public static TAccumulate Aggregate<TSource, TAccumulate>(this IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, TAccumulate> func)
int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate(5, (sum, next) => sum + next);
// sum: 5, next: 1 => 6
// sum: 6, next: 2 => 8
// sum: 8, next: 3 => 11
// sum: 11, next: 4 => 15
// sum: 15, next: 5 => 20

// 3. 결과 선택기가 있는 경우
public static TResult Aggregate<TSource, TAccumulate, TResult>(this IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, TAccumulate> func, Func<TAccumulate, TResult> resultSelector)
int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate(3, (sum, next) => next > 2 ? sum + next : sum, result => result);
// sum: 3, next: 1 => 3
// sum: 3, next: 2 => 3
// sum: 3, next: 3 => 6
// sum: 6, next: 4 => 10
// sum: 10, next: 5 => 15
// result = 10 % 2
{% endhighlight %}

# All
한 컬렉션 안의 모든 요소가 특정한 조건에 맞는지 알려줍니다.

{% highlight c# %}
public static bool All<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
int[] sumArray = { 1, 2, 3, 4, 5 };
bool isBiggerThanZero = sumArray.All(element => element > 0);
// true
bool isBiggerThanZeroOnEvens = (from number in sumArray
              where number%2 == 0
              select number).All(element => element > 0);
// IEnumerable return됨 with { 2, 4 }
{% endhighlight %}

# Any
한 컬렉션 안의 최소 하나 이상의 요소가 특정한 조건에 맞는지 알려줍니다.

{% highlight c# %}
public static bool Any<TSource>(this IEnumerable<TSource> source)
int[] sumArray = { 1, 2, 3, 4, 5 };
bool isBiggerThanFive = sumArray.Any(element => element > 5);
// false
bool isBiggerThanFour = sumArray.Any(element => element > 4);
// true
{% endhighlight %}

# AsEnumerable
IEnumerable에 상응하는 특별한 타입으로 캐스팅 할 수 있게 해줍니다.

{% highlight c# %}
public static IEnumerable<TSource> AsEnumerable<TSource>(this IEnumerable<TSource> source)
int[] sumArray = {1, 2, 3, 4, 5};
var query = sumArray.AsEnumerable();
foreach (var element in query)
{
    // ...
}
{% endhighlight %}

# AsParallel
병렬 연산으로 실행 할 수 있게 해줍니다.

{% highlight c# %}
int[] sumArray = {1, 2, 3, 4, 5};
int sum = sumArray.AsParallel().Sum();
{% endhighlight %}

# Average
시퀀스의 평균값을 계산합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
double average = numbers.Average();
// 3

// 조건과 함께 사용
double evenAverage = numbers.Where(n => n % 2 == 0).Average();
// 3 (2, 4의 평균)
{% endhighlight %}

# Cast
IEnumerable의 요소를 지정된 타입으로 캐스팅합니다.

{% highlight c# %}
ArrayList list = new ArrayList();
list.Add(1);
list.Add(2);
list.Add(3);

IEnumerable<int> numbers = list.Cast<int>();
// 1, 2, 3
{% endhighlight %}

# Concat
두 시퀀스를 연결합니다.

{% highlight c# %}
int[] first = { 1, 2, 3 };
int[] second = { 4, 5, 6 };

var combined = first.Concat(second);
// 1, 2, 3, 4, 5, 6
{% endhighlight %}

# Contains
시퀀스에 지정된 요소가 포함되어 있는지 확인합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
bool hasThree = numbers.Contains(3);
// true

bool hasTen = numbers.Contains(10);
// false
{% endhighlight %}

# Count
시퀀스의 요소 수를 반환합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
int count = numbers.Count();
// 5

// 조건과 함께 사용
int evenCount = numbers.Count(n => n % 2 == 0);
// 2 (2, 4)
{% endhighlight %}

# DefaultIfEmpty
시퀀스가 비어있으면 기본값을 가진 컬렉션을 반환합니다.

{% highlight c# %}
int[] empty = { };
var result = empty.DefaultIfEmpty(0);
// { 0 }

int[] numbers = { 1, 2, 3 };
var result2 = numbers.DefaultIfEmpty(0);
// { 1, 2, 3 }
{% endhighlight %}

# Distinct
시퀀스에서 중복 요소를 제거합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 2, 3, 3, 3, 4 };
var distinct = numbers.Distinct();
// 1, 2, 3, 4
{% endhighlight %}

# ElementAt
시퀀스에서 지정된 인덱스의 요소를 반환합니다.

{% highlight c# %}
int[] numbers = { 10, 20, 30, 40, 50 };
int third = numbers.ElementAt(2);
// 30
{% endhighlight %}

# ElementAtOrDefault
시퀀스에서 지정된 인덱스의 요소를 반환하거나, 인덱스가 범위를 벗어나면 기본값을 반환합니다.

{% highlight c# %}
int[] numbers = { 10, 20, 30 };
int value = numbers.ElementAtOrDefault(5);
// 0 (int의 기본값)

string[] words = { "a", "b", "c" };
string word = words.ElementAtOrDefault(10);
// null (string의 기본값)
{% endhighlight %}

# Except
두 시퀀스의 차집합을 반환합니다.

{% highlight c# %}
int[] first = { 1, 2, 3, 4, 5 };
int[] second = { 4, 5, 6, 7, 8 };

var difference = first.Except(second);
// 1, 2, 3
{% endhighlight %}

# First
시퀀스의 첫 번째 요소를 반환합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
int first = numbers.First();
// 1

// 조건과 함께 사용
int firstEven = numbers.First(n => n % 2 == 0);
// 2
{% endhighlight %}

# FirstOrDefault
시퀀스의 첫 번째 요소를 반환하거나, 요소가 없으면 기본값을 반환합니다.

{% highlight c# %}
int[] empty = { };
int first = empty.FirstOrDefault();
// 0

int[] numbers = { 1, 2, 3 };
int firstEven = numbers.FirstOrDefault(n => n > 10);
// 0
{% endhighlight %}

# GroupBy
시퀀스의 요소를 지정된 키 선택기 함수에 따라 그룹화합니다.

{% highlight c# %}
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
{% endhighlight %}

# GroupJoin
두 시퀀스를 키를 기준으로 그룹화하여 조인합니다.

{% highlight c# %}
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
{% endhighlight %}

# Intersect
두 시퀀스의 교집합을 반환합니다.

{% highlight c# %}
int[] first = { 1, 2, 3, 4, 5 };
int[] second = { 4, 5, 6, 7, 8 };

var intersection = first.Intersect(second);
// 4, 5
{% endhighlight %}

# Join
두 시퀀스를 키를 기준으로 조인합니다.

{% highlight c# %}
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
{% endhighlight %}

# Last
시퀀스의 마지막 요소를 반환합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
int last = numbers.Last();
// 5

// 조건과 함께 사용
int lastEven = numbers.Last(n => n % 2 == 0);
// 4
{% endhighlight %}

# LastOrDefault
시퀀스의 마지막 요소를 반환하거나, 요소가 없으면 기본값을 반환합니다.

{% highlight c# %}
int[] empty = { };
int last = empty.LastOrDefault();
// 0

int[] numbers = { 1, 2, 3 };
int lastEven = numbers.LastOrDefault(n => n > 10);
// 0
{% endhighlight %}

# Max
시퀀스의 최댓값을 반환합니다.

{% highlight c# %}
int[] numbers = { 1, 5, 3, 9, 2 };
int max = numbers.Max();
// 9

// 조건과 함께 사용
int maxEven = numbers.Where(n => n % 2 == 0).Max();
// 2
{% endhighlight %}

# Min
시퀀스의 최솟값을 반환합니다.

{% highlight c# %}
int[] numbers = { 5, 1, 3, 9, 2 };
int min = numbers.Min();
// 1

// 조건과 함께 사용
int minEven = numbers.Where(n => n % 2 == 0).Min();
// 2
{% endhighlight %}

# OfType
시퀀스에서 지정된 타입의 요소만 필터링합니다.

{% highlight c# %}
object[] values = { 1, "hello", 2.5, 3, "world" };

var numbers = values.OfType<int>();
// 1, 3

var strings = values.OfType<string>();
// "hello", "world"
{% endhighlight %}

# OrderBy
시퀀스를 오름차순으로 정렬합니다.

{% highlight c# %}
int[] numbers = { 5, 2, 8, 1, 9 };
var sorted = numbers.OrderBy(n => n);
// 1, 2, 5, 8, 9

// 문자열 정렬
string[] words = { "banana", "apple", "cherry" };
var sortedWords = words.OrderBy(w => w);
// "apple", "banana", "cherry"
{% endhighlight %}

# OrderByDescending
시퀀스를 내림차순으로 정렬합니다.

{% highlight c# %}
int[] numbers = { 5, 2, 8, 1, 9 };
var sorted = numbers.OrderByDescending(n => n);
// 9, 8, 5, 2, 1
{% endhighlight %}

# Reverse
시퀀스의 요소 순서를 반전합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
var reversed = numbers.Reverse();
// 5, 4, 3, 2, 1
{% endhighlight %}

# Select
시퀀스의 각 요소를 새로운 형식으로 변환합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
var squares = numbers.Select(n => n * n);
// 1, 4, 9, 16, 25

// 익명 타입으로 변환
var result = numbers.Select(n => new { Number = n, IsEven = n % 2 == 0 });
// { Number = 1, IsEven = false }
// { Number = 2, IsEven = true }
// ...
{% endhighlight %}

# SelectMany
시퀀스의 각 요소를 시퀀스로 변환하고 결과를 평면화합니다.

{% highlight c# %}
string[] sentences = { "Hello World", "How are you" };

var words = sentences.SelectMany(s => s.Split(' '));
// "Hello", "World", "How", "are", "you"

// 중첩 컬렉션 평면화
int[][] arrays = { new[] { 1, 2 }, new[] { 3, 4 }, new[] { 5, 6 } };
var flattened = arrays.SelectMany(a => a);
// 1, 2, 3, 4, 5, 6
{% endhighlight %}

# SequenceEqual
두 시퀀스가 요소별로 같은지 확인합니다.

{% highlight c# %}
int[] first = { 1, 2, 3 };
int[] second = { 1, 2, 3 };
int[] third = { 3, 2, 1 };

bool equal1 = first.SequenceEqual(second);
// true

bool equal2 = first.SequenceEqual(third);
// false
{% endhighlight %}

# Single
시퀀스에서 유일한 요소를 반환합니다. 요소가 없거나 두 개 이상이면 예외가 발생합니다.

{% highlight c# %}
int[] oneElement = { 42 };
int single = oneElement.Single();
// 42

int[] numbers = { 1, 2, 3, 4, 5 };
int singleEven = numbers.Single(n => n % 2 == 0 && n < 3);
// 2
{% endhighlight %}

# SingleOrDefault
시퀀스에서 유일한 요소를 반환하거나, 요소가 없으면 기본값을 반환합니다.

{% highlight c# %}
int[] empty = { };
int single = empty.SingleOrDefault();
// 0

int[] numbers = { 1, 3, 5 };
int singleEven = numbers.SingleOrDefault(n => n % 2 == 0);
// 0 (일치하는 요소 없음)
{% endhighlight %}

# Skip
시퀀스에서 지정된 수의 요소를 건너뜁니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
var skipped = numbers.Skip(2);
// 3, 4, 5
{% endhighlight %}

# SkipWhile
지정된 조건이 true인 동안 요소를 건너뜁니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5, 1, 2 };
var result = numbers.SkipWhile(n => n < 3);
// 3, 4, 5, 1, 2 (조건이 false가 되면 멈춤)
{% endhighlight %}

# Sum
시퀀스의 합계를 계산합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
int sum = numbers.Sum();
// 15

// 조건과 함께 사용
int evenSum = numbers.Where(n => n % 2 == 0).Sum();
// 6 (2 + 4)
{% endhighlight %}

# Take
시퀀스의 시작부터 지정된 수의 요소를 가져옵니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5 };
var taken = numbers.Take(3);
// 1, 2, 3
{% endhighlight %}

# TakeWhile
지정된 조건이 true인 동안 요소를 가져옵니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5, 1, 2 };
var result = numbers.TakeWhile(n => n < 4);
// 1, 2, 3 (조건이 false가 되면 멈춤)
{% endhighlight %}

# ToArray
시퀀스를 배열로 변환합니다.

{% highlight c# %}
var numbers = Enumerable.Range(1, 5);
int[] array = numbers.ToArray();
// int[] { 1, 2, 3, 4, 5 }
{% endhighlight %}

# ToDictionary
시퀀스를 Dictionary로 변환합니다.

{% highlight c# %}
var people = new[] { new { Id = 1, Name = "Kim" }, new { Id = 2, Name = "Lee" } };

var dict = people.ToDictionary(p => p.Id, p => p.Name);
// Dictionary<int, string> { {1, "Kim"}, {2, "Lee"} }
{% endhighlight %}

# ToList
시퀀스를 List로 변환합니다.

{% highlight c# %}
var numbers = Enumerable.Range(1, 5);
List<int> list = numbers.ToList();
// List<int> { 1, 2, 3, 4, 5 }
{% endhighlight %}

# ToLookup
시퀀스를 Lookup으로 변환합니다 (일대다 매핑).

{% highlight c# %}
string[] words = { "apple", "banana", "apricot", "blueberry", "cherry" };

var lookup = words.ToLookup(w => w[0]);

foreach (var group in lookup['a'])
{
    Console.WriteLine(group);
}
// apple
// apricot
{% endhighlight %}

# Union
두 시퀀스의 합집합을 반환합니다.

{% highlight c# %}
int[] first = { 1, 2, 3, 4 };
int[] second = { 3, 4, 5, 6 };

var union = first.Union(second);
// 1, 2, 3, 4, 5, 6 (중복 제거)
{% endhighlight %}

# Where
시퀀스에서 조건에 맞는 요소만 필터링합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evens = numbers.Where(n => n % 2 == 0);
// 2, 4, 6, 8, 10

var biggerThanFive = numbers.Where(n => n > 5);
// 6, 7, 8, 9, 10
{% endhighlight %}

# Zip
두 시퀀스를 지정된 함수를 사용하여 병합합니다.

{% highlight c# %}
int[] numbers = { 1, 2, 3 };
string[] words = { "one", "two", "three" };

var result = numbers.Zip(words, (n, w) => $"{n} = {w}");
// "1 = one", "2 = two", "3 = three"

// 더 긴 시퀀스는 잘림
int[] more = { 1, 2, 3, 4, 5 };
string[] less = { "a", "b" };
var zipped = more.Zip(less, (n, w) => $"{n}-{w}");
// "1-a", "2-b"
{% endhighlight %}

---

## 참고
- [Microsoft Docs - LINQ Enumerable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?redirectedfrom=MSDN&view=netframework-4.8#methods)
- [LINQ Methods](https://www.dotnetperls.com/linq)
