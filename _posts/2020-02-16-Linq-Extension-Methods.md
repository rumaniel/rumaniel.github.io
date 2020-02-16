---
layout: post
title: LINQ extension methods
image: /assets/sugar.jpg
date: 2020-02-16 22:24:34 +0900
tags: [unity, C#]
categories: [unity, C#]
---

LINQ 를 직접 코드에 쓸 수 있게 해주는 확장 메소드들을 정리해보았습니다.

- [Aggregate](#aggregate)
- [All](#all)
- [Any](#any)
- [AsEnumerable](#asEnumerable)
- [AsParallel](#asParallel)
- [AsQueryable](#asQueryable)
- [Average](#average)
- [Cast](#cast)
- [Concat](#concat)
- [Contains](#contains)
- [Count](#count)
- [DefaultIfEmpty](#defaultIfEmpty)
- [Distinct](#distinct)
- [ElementAt](#elementAt)
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

- 각 요소에 메서드를 적용합니다.
- 시퀀스동안 이전 요소들을 집계합니다.
- 지정된 시드값은 초기 누산기 값으로 사용됩니다
- 지정된 함수는 결과 값을 선택하는데 사용됩니다.
- 쉽게 sum 과 같은 특정한 메소드를 구현할 수 있습니다.

## example

{% highlight c# %}
// 1. Default form
public static TSource Aggregate<TSource> (this System.Collections.Generic.IEnumerable<TSource> source, Func<TSource,TSource,TSource> func);

int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate((sum, next) => sum + next);
// sum : 0, next : 1 => 1
// sum : 1, next : 2 => 3
// sum : 3, next : 3 => 6
// sum : 6, next : 4 => 10
// sum : 10, next : 5 => 15

// 2. With seed value
public static TAccumulate Aggregate<TSource,TAccumulate> (this System.Collections.Generic.IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate,TSource,TAccumulate> func);

int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate(5, (sum, next) => sum + next);
// sum : 5, next : 1 => 6
// sum : 6, next : 2 => 8
// sum : 8, next : 3 => 11
// sum : 11, next : 4 => 15
// sum : 15, next : 5 => 20

// 3. With result Selector
public static TResult Aggregate<TSource,TAccumulate,TResult> (this System.Collections.Generic.IEnumerable<TSource> source, TAccumulate seed, Func<TAccumulate,TSource,TAccumulate> func, Func<TAccumulate,TResult> resultSelector);

int[] sumArray = { 1, 2, 3, 4, 5 };
int result = sumArray.Aggregate(3, (sum, next) => next > 2 ? sum + next : sum, result => result%2);
// sum : 3, next : 1 => 3
// sum : 3, next : 2 => 3
// sum : 3, next : 3 => 6
// sum : 6, next : 4 => 10
// sum : 10, next : 5 => 15
// result = 10 % 2

{% endhighlight %}

https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?redirectedfrom=MSDN&view=netframework-4.8#methods
https://www.dotnetperls.com/linq