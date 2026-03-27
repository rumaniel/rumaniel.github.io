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

## 참고
- [Microsoft Docs - LINQ Enumerable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?redirectedfrom=MSDN&view=netframework-4.8#methods)
- [LINQ Methods](https://www.dotnetperls.com/linq)
