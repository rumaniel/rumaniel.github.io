---
layout: post
title: "Unity 2018.3 버전 이후 사용할 수 있는 C# 스크립팅 소개"
description: Unity 2018.3부터 사용 가능한 C# 7.3 기능들 - async/await, tuples, pattern matching 등
image: /assets/coding.jpg
date: 2019-12-07 22:24:34 +0900
tags: [C#]
categories: [unity]
lang: ko
permalink: /the-difference-of-scripting-on-the-unity-2018-3/
---

유니티 2017.1 버전부터 [로즐린 컴파일러](https://github.com/dotnet/roslyn)가 실험적으로 적용 되 .NET 4.x, C#6와 호환되는 스크립팅이 사용 가능합니다. 2018.1 부터는 .NET 3.5 런타임이 레거시가 되고, 2018.3 부터는 C#7.3 버전이 사용 가능합니다.

* 2017.1 .NET 4.6, C#6 Compatible version
* 2018.1 .NET 4.x Equivalent runtime is no longer considered experimental
* 2018.3 Support C#7.3
* 2019.2 Removed .NET 3.5 Equivalent

그간 유니티에서 최신 C#언어의 기능을 사용하는것은 제한적이었습니다. 그래서 이제 사용 가능한 C#기능들을 정리해 보았습니다.

| 버전 | 목차 |
|---|---|
| **[<span class="toc-num">1</span>&nbsp;C#4](#c4)** | [<span class="toc-num">1.1</span>&nbsp;Dynamic binding](#dynamic-binding)<br>[<span class="toc-num">1.2</span>&nbsp;Named/optional arguments](#namedoptional-arguments)<br>[<span class="toc-num">1.3</span>&nbsp;Generic covariant and contravariant](#generic-covariant-and-contravariant)<br>[<span class="toc-num">1.4</span>&nbsp;Embedded interop types](#embedded-interop-types) |
| **[<span class="toc-num">2</span>&nbsp;C#5](#c5)** | [<span class="toc-num">2.1</span>&nbsp;New keyword async await](#new-keyword-async-await)<br>&emsp;[<span class="toc-num">2.1.1</span>&nbsp;유니티에서 비동기 프로그래밍을 시작하기 위한 참고사항](#async-await-in-unity)<br>&emsp;[<span class="toc-num">2.1.2</span>&nbsp;코루틴과 async-await 중요 차이점](#coroutine-vs-async-await)<br>[<span class="toc-num">2.2</span>&nbsp;Caller info attributes](#caller-info-attributes) |
| **[<span class="toc-num">3</span>&nbsp;C#6](#c6)** | [<span class="toc-num">3.1</span>&nbsp;Read-only auto-properties](#read-only-auto-properties)<br>[<span class="toc-num">3.2</span>&nbsp;Auto-property initializers](#auto-property-initializers)<br>[<span class="toc-num">3.3</span>&nbsp;Index initializers](#index-initializers)<br>[<span class="toc-num">3.4</span>&nbsp;String interpolation](#string-interpolation)<br>[<span class="toc-num">3.5</span>&nbsp;Expression-bodied function members](#expression-bodied-function-members)<br>[<span class="toc-num">3.6</span>&nbsp;using static](#using-static)<br>[<span class="toc-num">3.7</span>&nbsp;Null-conditional operators](#null-conditional-operators)<br>[<span class="toc-num">3.8</span>&nbsp;nameof expressions](#nameof-expressions)<br>[<span class="toc-num">3.9</span>&nbsp;Exception filters](#exception-filters)<br>[<span class="toc-num">3.10</span>&nbsp;Await in catch and finally blocks](#await-in-catch-and-finally-blocks)<br>[<span class="toc-num">3.11</span>&nbsp;Extension Add methods in collection initializers](#extension-add-methods-in-collection-initializers) |
| **[<span class="toc-num">4</span>&nbsp;C#7.0](#c70)** | [<span class="toc-num">4.1</span>&nbsp;out variables](#out-variables)<br>[<span class="toc-num">4.2</span>&nbsp;Tuples](#tuples)<br>[<span class="toc-num">4.3</span>&nbsp;Discards](#discards)<br>[<span class="toc-num">4.4</span>&nbsp;Pattern Matching](#pattern-matching)<br>[<span class="toc-num">4.5</span>&nbsp;ref locals and returns](#ref-locals-and-returns)<br>[<span class="toc-num">4.6</span>&nbsp;Local Functions](#local-functions)<br>[<span class="toc-num">4.7</span>&nbsp;More expression-bodied members](#more-expression-bodied-members)<br>[<span class="toc-num">4.8</span>&nbsp;throw Expressions](#throw-expressions)<br>[<span class="toc-num">4.9</span>&nbsp;Generalized async return types](#generalized-async-return-types)<br>[<span class="toc-num">4.10</span>&nbsp;Numeric literal syntax improvements](#numeric-literal-syntax-improvements) |
| **[<span class="toc-num">5</span>&nbsp;C#7.1](#c71)** | [<span class="toc-num">5.1</span>&nbsp;async Main method](#async-main-method)<br>[<span class="toc-num">5.2</span>&nbsp;default literal expressions](#default-literal-expressions)<br>[<span class="toc-num">5.3</span>&nbsp;Inferred tuple element names](#inferred-tuple-element-names)<br>[<span class="toc-num">5.4</span>&nbsp;Pattern matching on generic type parameters](#pattern-matching-on-generic-type-parameters) |
| **[<span class="toc-num">6</span>&nbsp;C#7.2](#c72)** | [<span class="toc-num">6.1</span>&nbsp;Techniques for writing safe efficient code](#techniques-for-writing-safe-efficient-code)<br>[<span class="toc-num">6.2</span>&nbsp;Non-trailing named arguments](#non-trailing-named-arguments)<br>[<span class="toc-num">6.3</span>&nbsp;Leading underscores in numeric literals](#leading-underscores-in-numeric-literals)<br>[<span class="toc-num">6.4</span>&nbsp;private protected access modifier](#private-protected-access-modifier)<br>[<span class="toc-num">6.5</span>&nbsp;Conditional ref expressions](#conditional-ref-expressions) |
| **[<span class="toc-num">7</span>&nbsp;C#7.3](#c73)** | [<span class="toc-num">7.1</span>&nbsp;Indexing fixed fields without pinning](#indexing-fixed-fields-without-pinning)<br>[<span class="toc-num">7.2</span>&nbsp;Reassigning ref local variables](#reassigning-ref-local-variables)<br>[<span class="toc-num">7.3</span>&nbsp;stackalloc array initializers](#stackalloc-array-initializers)<br>[<span class="toc-num">7.4</span>&nbsp;More types support the fixed statement](#more-types-support-the-fixed-statement)<br>[<span class="toc-num">7.5</span>&nbsp;Enhanced generic constraints](#enhanced-generic-constraints)<br>[<span class="toc-num">7.6</span>&nbsp;Tuple equality](#tuple-equality)<br>[<span class="toc-num">7.7</span>&nbsp;Attributes on backing fields of auto-properties](#attributes-on-backing-fields-of-auto-properties)<br>[<span class="toc-num">7.8</span>&nbsp;Expression variables in initializers](#expression-variables-in-initializers)<br>[<span class="toc-num">7.9</span>&nbsp;Improved overload candidates](#improved-overload-candidates)<br>[<span class="toc-num">7.10</span>&nbsp;in method overload tiebreaker](#in-method-overload-tiebreaker) |
{: .toc-table #toc}

---
# C#4
## Dynamic binding
`dynamic` 은 `object`와 비슷하지만, 타입이 런타임에서 결정됩니다.

{% highlight c# %}

dynamic value = 10;
value = value + 5;      // 런타임에 int 연산으로 결정
value = "Hello";
Debug.Log(value.Length); // 런타임에 결정, 없는 멤버면 런타임 에러

{% endhighlight %}

`dynamic`은 내부적으로 런타임 코드 생성(Reflection.Emit)을 사용하기 때문에, IL2CPP 같은 AOT 플랫폼(iOS, 콘솔, WebGL 등)에서는 사용할 수 없습니다.

## Named/optional arguments
파라미터의 순서가 아닌 이름을 명시해 인자를 넘길 수 있고(named), 파라미터에 기본값을 주어 호출할 때 생략할 수 있습니다(optional).

{% highlight c# %}

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
    // 평범하게 호출하기
    UpdateProfile("Kim", 32, "Programmer");

    // 순서와 상관없이 호출 가능
    UpdateProfile(age: 32, job: "Programmer", name: "Kim");
    UpdateProfile(job: "Programmer", name: "Kim", age: 32);

    // 혼용 : 컴파일 에러
    // UpdateProfile(job: "Programmer", 32, "Kim");
    // UpdateProfile(32, name: "Kim", "Programmer");

    // 기본값 파라미터 생략
    Spawn("Slime");            // count = 1, delay = 0
    Spawn("Slime", 3);         // delay = 0
    Spawn("Slime", delay: 2f); // 이름으로 중간 건너뛰기
}

{% endhighlight %}

## Generic covariant and contravariant
제네릭 인터페이스와 델리게이트의 타입 파라미터에 `out`(공변성), `in`(반공변성) 키워드를 붙여 더 유연한 타입 변환을 허용합니다.

{% highlight c# %}

// 공변성(out) : 구체 -> 일반
// IEnumerable<out T>
IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings;

// 반공변성(in) : 일반 -> 구체
// Action<in T>
Action<Component> logName = component => Debug.Log(component.name);
Action<Transform> logTransform = logName;

// 직접 선언하기
public interface ISpawner<out T> where T : Component
{
    T Spawn();
}

{% endhighlight %}

`out`은 리턴 타입에만, `in`은 파라미터 타입에만 쓸 수 있습니다. 또 클래스가 아닌 인터페이스와 델리게이트에만 적용되고, `int` 같은 밸류 타입에는 동작하지 않습니다.

## Embedded interop types
COM interop 어셈블리(PIA)의 타입 정보를 호출하는 어셈블리에 직접 포함시켜, 배포 시 별도의 interop 어셈블리가 없어도 되게 해줍니다. 주로 Office 자동화 같은 Windows COM 작업에 사용되며, 유니티 게임 개발에서 쓸 일은 거의 없어 예제는 생략합니다.

---
# C#5
## New keyword async await
비동기 작업이 가능한 `async` `await` 키워드가 생겼습니다.

{% highlight c# %}

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

{% endhighlight %}

{% highlight c# %}

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

{% endhighlight %}


### 유니티에서 비동기 프로그래밍을 시작하기 위한 참고사항 {#async-await-in-unity}
* 비동기 함수는 `Task` 나 `Task<TResult>`의 리턴값을 가져야 합니다.
* task를 리턴하는 비동기 함수는 언제나 `async` 키워드를 붙여야 합니다.
* 동기식 코드에서 비동기 함수를 실행 할 때만 `async void` 형이여야 합니다.
* 유니티는 UnitySynchronizationContext 를 사용하여 기본적으로 메인 스레드에서 비동기 함수를 실행합니다.
* unity API 는 메인 스레드 외부에서 접근 불가능합니다.
* 현재 Unity WebGL 에서는 스레드를 사용하는 작업을 지원 하지 않습니다.

### 코루틴과 async-await 중요 차이점 {#coroutine-vs-async-await}
* 코루틴은 값을 리턴 할 수 없지만, `Task<TResult>` 는 가능합니다.
* try-catch 문에 `yield` 를 넣을 수 없어서 코루틴에서 에러 찾기는 어렵습니다. 하지만 async-await 에서는 try-catch 문이 가능합니다.
* 코루틴은 MonoBehaviour 에서 파생되지 않는 클래스에서는 사용 불가능합니다.
* async-await 가 유니티 coroutine을 완전히 대체하라고 권하지 않습니다. 프로파일링을 통해 결과를 확인하고 접근하세요.

## Caller info attributes
리플렉션 코드 없이 호출한 메서드 이름, 파일 경로, 줄 번호를 쉽게 가져 올 수 있습니다. 로그 함수를 만들 때 유용합니다.

{% highlight c# %}

void Start ()
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

{% endhighlight %}

---
# C#6
## Read-only auto-properties
읽기 전용 property는 간단히 `get` 만 선언함으로써 만들 수 있습니다.

{% highlight c# %}

public class NPC
{
    public int health { get; }

    public NPC(int health)
    {
        this.health = health;
    }
}

{% endhighlight %}

생성자가 아닌 곳에서 값을 할당하면 컴파일 에러가 발생합니다.
{% highlight c# %}

public class NPC
{
    public int health { get; }

    public void SetHealth(int health)
    {
        // 에러 발생
        this.health = health;
    }
}

{% endhighlight %}


## Auto-property initializers
자동 구현 property를 선언하면서 바로 초기값을 줄 수 있습니다.

{% highlight c# %}

public ICollection<double> Grades { get; } = new List<double>();

public int Health { get; set; } = 100;

{% endhighlight %}

## Index initializers
인덱서 `[]` 를 이용해 컬렉션을 초기화 할 수 있습니다. 키와 값의 관계가 한눈에 보입니다.

{% highlight c# %}

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

{% endhighlight %}


## String interpolation
문자열 앞에 `$` 를 붙이면 `{}` 안에 변수나 식을 바로 넣을 수 있습니다. `String.Format` 처럼 `{0}`, `{1}` 순서를 맞출 필요가 없습니다.

{% highlight c# %}

// .NET 3.5
Debug.Log(String.Format("{0} health: {1}", playerName, health));

// .NET 4.x
Debug.Log($"{playerName} health: {health}");
Debug.Log($"HP: {health / (float)maxHealth:P0}"); // 서식 지정 (예 : HP: 75%)

{% endhighlight %}


## Expression-bodied function members
본문이 한 줄인 메서드와 읽기 전용 property 를 `=>` 로 짧게 쓸 수 있습니다.

{% highlight c# %}

// .NET 3.5
public override string ToString()
{
    return $"{name} : {health * 0.5}";
}

// .NET 4.x
public override string ToString() => $"{name} : {health * 0.5}";
public string Info => $"{name} : {(hpRatio < 0.1 ? "Dead" : "Live")}";

{% endhighlight %}


## using static
`using static` 으로 클래스를 지정하면, 그 클래스의 static 멤버를 클래스 이름 없이 쓸 수 있습니다.
{% highlight c# %}

// .NET 3.5
using UnityEngine;
public class Example : MonoBehaviour
{
    private void Start ()
    {
        Debug.Log(Mathf.RoundToInt(Mathf.PI));
        // Output:
        // 3
    }
}

// .NET 4.x
using UnityEngine;
using static UnityEngine.Mathf;
public class UsingStaticExample: MonoBehaviour
{
    private void Start ()
    {
        Debug.Log(RoundToInt(PI));
        // Output:
        // 3
    }
}

{% endhighlight %}


## Null-conditional operators
널 조건 연산자는 Null 체크를 쉽고 부드럽게 만들어줍니다. 단순히 멤버 접근을 `.`에서 `?.` 로 바꾸세요.

{% highlight c# %}

var first = person?.FirstName;

{% endhighlight %}

person 객체가 null 이면 `NullReferenceException` 대신 first 변수에 null 이 할당되고, null 이 아니라면 FirstName 이 할당됩니다. 배열이나 인덱서에 접근할 때는 `[]` 를 `?[]`로 바꾸면 됩니다.

{% highlight c# %}

first = person?.FirstName ?? "Unspecified";

{% endhighlight %}

`??` 연산자와 함께 써서 기본값을 지정 할 수도 있습니다.

{% highlight c# %}

A?.B?.Do(C);
A?.B?[C];

{% endhighlight %}

앞의 연산자가 null 을 리턴하면 뒤의 나머지 체인은 실행되지 않습니다. 위 예제에서는 A나 B가 null 이면 C를 실행 하지 않습니다.

**유니티 주의사항** : `GameObject`, `Component` 같은 `UnityEngine.Object` 는 `==` 연산자를 재정의해서, `Destroy` 된 오브젝트도 `== null` 이 `true` 가 됩니다. 하지만 `?.` 와 `??` 는 이 재정의를 거치지 않기 때문에 파괴된 오브젝트를 null 로 보지 않습니다. 유니티 오브젝트에는 `?.` 대신 `if (target != null)` 을 쓰세요.

{% highlight c# %}

Destroy(enemy.gameObject);
// 다음 프레임 이후
Debug.Log(enemy == null);  // true
enemy?.TakeDamage(10);     // 호출됨 : 내부 접근 시 MissingReferenceException

{% endhighlight %}

## nameof expressions
`nameof` 는 변수, 타입, 멤버의 이름을 문자열로 돌려줍니다. 문자열을 직접 쓰는 것과 달리 이름을 바꾸면 컴파일러가 함께 체크해 줍니다.

{% highlight c# %}

Debug.Log(nameof(health)); // "health"

if (target == null)
    throw new ArgumentNullException(nameof(target));

// 문자열 대신 : 이름 변경에 안전
Invoke(nameof(Respawn), 3f);

{% endhighlight %}

## Exception filters
`catch` 뒤에 `when` 조건을 붙여 조건이 맞을 때만 예외를 잡을 수 있습니다. 조건이 `false` 면 catch 에 들어가지 않고 예외가 그대로 위로 전달되므로, 다시 던질 때 스택 정보가 사라지는 문제가 없습니다.

{% highlight c# %}

try
{
    LoadSaveFile(path);
}
catch (IOException e) when (retryCount < 3)
{
    retryCount++;
    Debug.LogWarning($"Retry {retryCount} : {e.Message}");
}

{% endhighlight %}

## Await in catch and finally blocks
C#5 에서는 `catch` 와 `finally` 블록 안에서 `await` 를 쓸 수 없었지만, C#6 부터 가능합니다.

{% highlight c# %}

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

{% endhighlight %}

## Extension Add methods in collection initializers
컬렉션 이니셜라이저에서 확장 메서드로 만든 `Add` 도 사용 할 수 있습니다.
{% highlight c# %}

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

{% endhighlight %}

---
# C#7.0
## out variables
이제 `out` 변수를 따로 선언하는게 아닌 메소드가 불리는 곳에서 arguments로 선언할 수 있습니다.

{% highlight c# %}

// .NET 3.5
bool error;
string text = StringTable.GetString("SOME_TEXT", out error);

// .NET 4.x
string text = StringTable.GetString("SOME_TEXT", out var error);

{% endhighlight %}


## Tuples
클래스나 구조체를 따로 만들지 않고 여러 값을 하나로 묶어 다룰 수 있습니다. 메서드에서 값을 여러 개 리턴할 때 특히 유용합니다.
튜플은 C#7.0 이전에도 `System.Tuple` 로 사용 가능했으나, 요소 이름이 `Item1`, `Item2` 로 고정되고 언어 차원의 지원도 없었습니다.

{% highlight c# %}

// 요소 이름 지정
(string Alpha, string Beta) letter = ("a", "b");
Debug.Log($"{letter.Alpha}, {letter.Beta}");

var letter2 = (Alpha: "a", Beta: "b");
Debug.Log($"{letter2.Alpha}, {letter2.Beta}");

// 여러 값 리턴
(int min, int max) GetRange(int[] values) => (values.Min(), values.Max());

var (min, max) = GetRange(new[] { 3, 1, 5 });
Debug.Log($"{min} ~ {max}"); // 1 ~ 5

// Deconstruct : 클래스도 튜플처럼 분해
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

{% endhighlight %}



## Discards
Discard는 `_` 로 쓰는 쓰기 전용 변수입니다. 값을 받긴 해야 하지만 쓰지 않을 때, 버린다는 의도를 명확히 보여줍니다.

Discard는 다음의 경우에 사용합니다.

* 튜플이나 사용자 정의 타입을 분해할 때
* 필요 없는 `out` 인자를 받을 때
* `is` 나 `switch` 패턴 매칭에서 값이 필요 없을 때
* 쓰지 않는 리턴값을 일부러 버릴 때 (예 : `_ = Task.Run(Work);`)

{% highlight c# %}

// 튜플 분해 : 필요한 값만 받기
var (_, _, _, pop1, _, pop2) = QueryCityDataForYears("New York City", 1960, 2010);
Debug.Log($"Population change, 1960 to 2010: {pop2 - pop1:N0}");

// out : 성공 여부만 확인
if (int.TryParse(input, out _))
    Debug.Log("숫자입니다");

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

{% endhighlight %}


## Pattern Matching
패턴 매칭은 값의 타입이나 조건을 검사하고, 맞으면 바로 변수로 꺼내 쓸 수 있게 해주는 기능입니다. `is` 식과 `switch` 문에서 사용할 수 있고, `when` 으로 추가 조건을 붙일 수 있습니다.

1. `is` 식은 타입 검사와 형변환, 변수 할당을 한 번에 처리합니다.

{% highlight c# %}

// .NET 3.5
if (input is int)
    sum += (int)input;

// C#7.0
if (input is int count)
    sum += count;

{% endhighlight %}


2. `switch` 문에 몇가지가 추가되었습니다.

* 모든 타입을 switch 할 수 있습니다.
* `case` 에서 타입을 검사하고, `is` 식과 마찬가지로 새 변수에 할당 할 수 있습니다.
* `when` 절로 추가 조건을 붙일 수 있습니다.
* 이제 `case` 순서가 중요합니다. 처음으로 일치하는 case 가 실행됩니다.

{% highlight c# %}

public static int SumPositiveNumbers(IEnumerable<object> sequence)
{
    int sum = 0;
    foreach (var i in sequence)
    {
        switch (i)
        {
            // 일반적인 상수 패턴
            case 0:
                break;
            // 타입 패턴
            case IEnumerable<int> childSequence:
            {
                foreach(var item in childSequence)
                    sum += (item > 0) ? item : 0;
                break;
            }
            // when 절 패턴
            case int n when n > 0:
                sum += n;
                break;
            // null 패턴
            case null:
                throw new NullReferenceException("Null found in sequence");
            default:
                throw new InvalidOperationException("Unrecognized type");
        }
    }
    return sum;
}

{% endhighlight %}


## ref locals and returns
밸류 타입을 복사하지 않고 참조(reference)로 다룰 수 있습니다. 큰 배열이나 구조체의 요소를 직접 수정할 때 유용합니다.

{% highlight c# %}

int number = 0;
ref int copyNumber = ref number;
copyNumber = 1;

Debug.Log($"number : {number}"); // 1
Debug.Log($"copyNumber : {copyNumber}"); // 1

// 배열 요소를 참조로 리턴
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

{% endhighlight %}

ref local 과 return 을 쓸 때의 규칙입니다.

* 메서드 선언, `return` 문, 받는 변수 모두에 `ref` 를 붙여야 합니다.
* ref 리턴을 `ref` 없이 일반 변수로 받으면 값이 복사됩니다.
* 메서드 안의 지역 변수는 메서드가 끝나면 사라지기 때문에 ref 로 리턴 할 수 없습니다.
* async 메서드에서는 ref local 을 사용 할 수 없습니다.

## Local Functions
메서드 안에 다른 메서드를 선언 할 수 있습니다. 그 메서드에서만 쓰는 헬퍼 함수를 클래스에 노출하지 않아도 되고, 람다와 달리 델리게이트 할당이 없습니다.

{% highlight c# %}

public int Fibonacci(int n)
{
    if (n < 0)
        throw new ArgumentException("음수는 안됩니다", nameof(n));

    return Fib(n);

    // Fibonacci 전용 로컬 함수
    int Fib(int x) => x < 2 ? x : Fib(x - 1) + Fib(x - 2);
}

{% endhighlight %}

람다와의 차이는 [Local functions vs. lambda expressions](https://docs.microsoft.com/en-us/dotnet/csharp/local-functions-vs-lambdas) 에서 확인 할 수 있습니다.

## More expression-bodied members
C#6 의 식 본문 멤버를 생성자, 소멸자, getter/setter 에도 쓸 수 있습니다.

{% highlight c# %}

// 생성자
public ExpressionMembersExample(string label) => this.Label = label;

// 소멸자
~ExpressionMembersExample() => Debug.Log("Finalized!");

private string label;

// getter setter
public string Label
{
    get => label;
    set => this.label = value ?? "Default label";
}

{% endhighlight %}


## throw Expressions
`throw`를 구문(statement)이 아닌 식(expression)으로 사용 할 수 있습니다. 조건 연산자 `?:`, null 병합 연산자 `??`, 그리고 식 본문 멤버 `=>` 에서 사용 가능합니다.

{% highlight c# %}

private string name;

// ?? 연산자와 함께
public string Name
{
    get => name;
    set => name = value ?? throw new ArgumentNullException(nameof(value));
}

// ?: 연산자와 함께
public NPC(int health)
    => this.health = health > 0 ? health : throw new ArgumentOutOfRangeException(nameof(health));

// 식 본문 멤버에서
public void Attack() => throw new NotImplementedException();

{% endhighlight %}

## Generalized async return types
이전에는 async 메서드의 리턴 타입이 `Task`, `Task<T>`, `void`로 한정되었지만, 이제 `GetAwaiter` 패턴을 만족하는 타입이면 리턴 타입으로 사용 할 수 있습니다.

대표적인 예가 `ValueTask<T>` 입니다. `ValueTask<T>`는 구조체라서, 결과가 이미 준비되어 있어 동기적으로 끝나는 경우가 많을 때 `Task` 객체의 힙 할당을 줄여 줍니다.

{% highlight c# %}

private readonly Dictionary<string, Texture2D> cache = new Dictionary<string, Texture2D>();

public async ValueTask<Texture2D> LoadTextureAsync(string key)
{
    // 캐시 히트 : 할당 없음
    if (cache.TryGetValue(key, out var texture))
        return texture;

    texture = await DownloadTextureAsync(key);
    cache[key] = texture;
    return texture;
}

{% endhighlight %}

유니티 2018.3 기본 환경에는 `ValueTask`가 포함되어 있지 않아 `System.Threading.Tasks.Extensions` 어셈블리를 따로 추가해야 합니다. 유니티에 최적화된 할당 없는 async 라이브러리인 [UniTask](https://github.com/Cysharp/UniTask)도 이 기능을 기반으로 만들어졌습니다.

## Numeric literal syntax improvements
숫자 상수에 `0b` 바이너리 리터럴과 `_` 자릿수 구분자를 쓸 수 있어 가독성이 좋아집니다.

{% highlight c# %}

public const int Sixteen =   0b0001_0000;
public const int ThirtyTwo = 0b0010_0000;
public const int SixtyFour = 0b0100_0000;
public const int OneHundredTwentyEight = 0b1000_0000;

{% endhighlight %}

상수의 시작부분에 있는 `0b`는 바이너리 넘버로 쓰여졌음을 나타냅니다. 바이너리 넘버는 길어지기 쉽기 때문에 digit separator `_`를 통해 비트 패턴을 더 쉽게 확인 할 수 있습니다. digit separator는 상수 어디에나 넣을 수 있고, 10진수에서는 보통 천 단위 구분자로 사용합니다.

{% highlight c# %}

public const long BillionsAndBillions = 100_000_000_000;

{% endhighlight %}

digit separator 는 `decimal`, `float`, 그리고 `double` 타입에서도 사용 할 수 있습니다.

{% highlight c# %}

public const double AvogadroConstant = 6.022_140_857_747_474e23;
public const decimal GoldenRatio = 1.618_033_988_749_894_848_204_586_834_365_638_117_720_309_179M;

{% endhighlight %}

---
# C#7.1
## async Main method
프로그램 진입점인 `Main` 메서드에 `async` 키워드를 붙일 수 있습니다.

{% highlight c# %}

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

{% endhighlight %}

유니티 스크립트에는 `Main` 메서드가 없으므로 직접 쓸 일은 없지만, 에셋 변환이나 빌드 자동화처럼 유니티와 별도로 동작하는 콘솔 툴을 만들 때 유용합니다.

## default literal expressions
대상의 타입을 유추 할 수 있으면 `default(T)` 대신 `default` 만 써도 됩니다.

{% highlight c# %}

// .NET 3.5
Func<string, bool> whereClause = default(Func<string, bool>);

// .NET 4.x
Func<string, bool> whereClause = default;

{% endhighlight %}


## Inferred tuple element names
튜플을 만들 때 변수 이름이 그대로 요소 이름이 됩니다.
{% highlight c# %}

// C#7.0
int count = 5;
string label = "Colors used in the map";
var pair = (count: count, label: label);

// C#7.1
int count = 5;
string label = "Colors used in the map";
var pair = (count, label); // element names are "count" and "label"

{% endhighlight %}


## Pattern matching on generic type parameters
C#7.0 에서는 제네릭 타입 파라미터 `T` 의 값에 타입 패턴을 사용하면 컴파일 에러가 나는 경우가 있었습니다. C#7.1 부터는 `is` 와 `switch` 의 패턴 매칭을 제네릭 타입 파라미터에도 사용 할 수 있습니다.

{% highlight c# %}

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

{% endhighlight %}

---
# C#7.2
## Techniques for writing safe efficient code
밸류 타입을 복사하지 않고 참조로 다루면서도, 값이 바뀌지 않도록 보장하는 문법들입니다. 큰 구조체를 자주 넘기는 코드에서 복사 비용을 줄여 줍니다.

* `in` 파라미터 : 참조로 넘기지만 메서드 안에서 수정 할 수 없습니다.
* `ref readonly` 리턴 : 참조로 리턴하지만 받는 쪽에서 수정 할 수 없습니다.
* `readonly struct` : 모든 필드가 읽기 전용인 불변 구조체입니다. `in` 으로 넘길 때 컴파일러가 방어적 복사를 하지 않아도 됩니다.
* `ref struct` : 항상 스택에만 할당되는 구조체입니다. 클래스의 필드나 박싱처럼 힙에 올라가는 곳에는 쓸 수 없습니다.

{% highlight c# %}

// readonly struct : 불변 구조체
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

    // in : 참조 전달, 수정 불가
    public void Apply(in Damage damage)
    {
        // damage = default; // 컴파일 에러
        health -= damage.Amount;
        lastDamage = damage;
    }

    // ref readonly : 참조 리턴, 수정 불가
    public ref readonly Damage LastDamage => ref lastDamage;
}

// ref struct : 스택에만 할당
public ref struct StackOnlyCounter
{
    public int Count;
}

{% endhighlight %}

## Non-trailing named arguments
이름을 지정한 인자가 원래 위치에 있다면, 그 뒤에 위치 인자를 이어서 쓸 수 있습니다.

{% highlight c# %}

UpdateProfile(name: "Kim", 32, job: "Programmer");
UpdateProfile("Kim", age: 32, "Programmer");

{% endhighlight %}


## Leading underscores in numeric literals
`0b`, `0x` 바로 뒤, 첫 숫자 앞에도 `_` 구분자를 쓸 수 있습니다.
{% highlight c# %}

int binaryValue = 0b_0101_0101;

{% endhighlight %}


## private protected access modifier
`private protected` 멤버는 **같은 어셈블리 안의 상속 클래스**에서만 접근 할 수 있습니다. 유니티에서는 Assembly Definition(asmdef) 으로 어셈블리를 나눌 때 의미가 있습니다. 구조체는 상속이 안 되므로 쓸 수 없습니다.

{% highlight c# %}

// Game.asmdef
public class Unit
{
    private protected int hp;
}

public class Player : Unit
{
    void Heal() => hp += 10;   // 같은 어셈블리 + 상속 : 가능
}

// Mod.asmdef (다른 어셈블리)
public class Boss : Unit
{
    void Heal() => hp += 10;   // 컴파일 에러
}

{% endhighlight %}

## Conditional ref expressions
삼항 연산자 `?:` 의 결과로 값 대신 참조를 받을 수 있습니다.
{% highlight c# %}

ref var r = ref (arr != null ? ref arr[0] : ref otherArr[0]);

{% endhighlight %}

---

# C#7.3
C#7.3 은 안전하고 효율적인 코드 작성을 위한 기능과 기존 기능의 개선에 집중한 버전입니다. 유니티 2018.3 부터 사용 가능합니다.

아래 예제 중 `unsafe` 코드는 Player Settings 의 **Allow 'unsafe' Code** 옵션을 켜야 컴파일됩니다.

## Indexing fixed fields without pinning
`fixed` 크기 버퍼 필드에 접근할 때 별도의 `fixed` 문으로 고정(pinning)하지 않아도 인덱싱 할 수 있습니다.

{% highlight c# %}

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

{% endhighlight %}

## Reassigning ref local variables
`ref` 지역 변수를 초기화한 이후에도 다른 변수를 참조하도록 다시 할당 할 수 있습니다.

{% highlight c# %}

int a = 1, b = 5;

ref int larger = ref a;
if (b > a)
    larger = ref b; // C#7.3 부터 가능

larger = 10;
Debug.Log(b); // 10

{% endhighlight %}

## stackalloc array initializers
`stackalloc` 으로 스택에 할당한 배열을 선언과 동시에 초기화 할 수 있습니다. 일반 배열처럼 힙에 할당되지 않아 GC 부담이 없습니다.

{% highlight c# %}

unsafe
{
    int* a = stackalloc int[3] { 1, 2, 3 };
    int* b = stackalloc int[] { 1, 2, 3 };
}

{% endhighlight %}

.NET Core 에서는 `Span<int> span = stackalloc int[] { 1, 2, 3 };` 처럼 `unsafe` 없이 사용 할 수 있지만, 유니티 2018.3 기본 환경에는 `Span<T>`(`System.Memory`)이 없기 때문에 포인터로 받아야 합니다.

## More types support the fixed statement
`fixed` 문은 이전에는 배열, `string`, 고정 크기 버퍼, 관리되지 않는 변수에만 사용 가능했습니다. 이제 `ref T GetPinnableReference()` 메서드를 가진 타입이라면 `fixed` 문에 사용 할 수 있습니다.

{% highlight c# %}

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

{% endhighlight %}

## Enhanced generic constraints
제네릭 타입 제약으로 `unmanaged`, `System.Enum`, `System.Delegate` 를 사용 할 수 있습니다.

* `unmanaged` : 참조 타입 필드가 없는 구조체(`int`, `float`, `Vector3` 등)만 허용합니다. 포인터나 `sizeof` 를 제네릭에서 사용 할 수 있습니다.
* `System.Enum` : enum 타입만 허용합니다.
* `System.Delegate` : 델리게이트 타입만 허용합니다.

{% highlight c# %}

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

{% endhighlight %}

## Tuple equality
튜플 타입에서 `==` 와 `!=` 연산자를 사용 할 수 있습니다. 각 요소를 순서대로 비교하며, 요소의 이름은 비교에 영향을 주지 않습니다.

{% highlight c# %}

var left = (a: 5, b: 10);
var right = (a: 5, b: 10);
Debug.Log(left == right); // true

// C#7.2 까지
Debug.Log(left.a == right.a && left.b == right.b);

// 이름이 달라도 값이 같으면 true
(int x, int y) point = (5, 10);
Debug.Log(left == point); // true

{% endhighlight %}

## Attributes on backing fields of auto-properties
자동 구현 프로퍼티의 컴파일러가 생성한 backing field 에 `field:` 를 붙여 어트리뷰트를 적용 할 수 있습니다. 유니티에서는 `SerializeField` 와 함께 쓰면 특히 유용합니다.

{% highlight c# %}

// C#7.2
[SerializeField] private int health;
public int Health => health;

// C#7.3
[field: SerializeField]
public int Health { get; private set; }

{% endhighlight %}

주의할 점은 실제로 직렬화되는 필드 이름이 `<Health>k__BackingField` 가 된다는 것입니다. 나중에 일반 필드로 바꾸면 기존 데이터가 사라지므로 `[FormerlySerializedAs("<Health>k__BackingField")]` 를 붙여야 합니다.

## Expression variables in initializers
`out var` 와 패턴 변수를 필드 이니셜라이저, 프로퍼티 이니셜라이저, 생성자 이니셜라이저, 그리고 LINQ 쿼리 절에서 사용 할 수 있습니다.

{% highlight c# %}

public class Base
{
    public Base(int i, out int j)
    {
        j = i;
    }
}

public class Derived : Base
{
    // 생성자 이니셜라이저의 out var
    public Derived(int i) : base(i, out var j)
    {
        Debug.Log($"The value of 'j' is {j}");
    }
}

{% endhighlight %}

## Improved overload candidates
오버로드된 메서드 중 하나를 고를 때, 컴파일러가 제네릭 제약 조건이 맞지 않거나 static/인스턴스 호출이 맞지 않는 후보를 먼저 제외합니다. 덕분에 불필요한 "호출이 모호합니다" 컴파일 에러가 줄었습니다. 코드를 다르게 쓸 필요는 없어 예제는 생략합니다.

## in method overload tiebreaker
값으로 넘기는 파라미터와 `in` 파라미터만 다른 오버로드가 있으면, C#7.2 에서는 호출이 모호하다는 에러가 났습니다. C#7.3 부터는 호출하는 쪽에서 `in` 을 쓰지 않으면 값 버전이 선택됩니다.

{% highlight c# %}

static void Move(Vector3 position) { }
static void Move(in Vector3 position) { }

Move(position);    // 값으로 넘기는 버전 호출
Move(in position); // in 버전 호출

{% endhighlight %}

---
참고사이트
* https://blogs.unity3d.com/2018/07/11/scripting-runtime-improvements-in-unity-2018-2/
* https://docs.microsoft.com/en-us/visualstudio/cross-platform/unity-scripting-upgrade?view=vs-2019
* https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history
* https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-7-3
