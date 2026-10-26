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
* 2018.1 .NET 4.x Equivalent runtime is no longer considered experimental,
* 2018.3 Support C#7.3
* 2019.2 Removed .NET 3.5 Equivalent

그간 유니티에서 최신 C#언어의 기능을 사용하는것은 제한적이었습니다. 그래서 이제 사용 가능한 C#기능들을 정리해 보았습니다.
* [C#4](#c4)
  * [Dynamic binding](#dynamic-binding)
  * [Named/optional arguments](#namedoptional-arguments)
  * [Generic covariant and contravariant](#generic-covariant-and-contravariant)
  * [Embedded interop types](#embedded-interop-types)
* [C#5](#c5)
  * [New keyword async await](#new-keyword-async-await)
    * [유니티에서 비동기 프로그래밍을 시작하기 위한 참고사항](#async-await-in-unity)
    * [코루틴과 async-await 중요 차이점](#coroutine-vs-async-await)
  * [Caller info attributes](#caller-info-attributes)
* [C#6](#c6)
  * [Read-only auto-properties](#read-only-auto-properties)
  * [Auto-property initializers](#auto-property-initializers)
  * [Index initializers](#index-initializers)
  * [String interpolation](#string-interpolation)
  * [Expression-bodied function members](#expression-bodied-function-members)
  * [using static](#using-static)
  * [Null-conditional operators](#null-conditional-operators)
  * [Extension Add methods in collection initializers](#extension-add-methods-in-collection-initializers)
* [C#7.0](#c70)
  * [out variables](#out-variables)
  * [Tuples](#tuples)
  * [Discards](#discards)
  * [Pattern Matching](#pattern-matching)
  * [ref locals and returns](#ref-locals-and-returns)
  * [Local Functions](#local-functions)
  * [More expression-bodied members](#more-expression-bodied-members)
  * [throw Expressions](#throw-expressions)
  * [Generalized async return types](#generalized-async-return-types)
  * [Numeric literal syntax improvements](#numeric-literal-syntax-improvements)
* [C#7.1](#c71)
  * [async Main method](#async-main-method)
  * [default literal expressions](#default-literal-expressions)
  * [Inferred tuple element names](#inferred-tuple-element-names)
  * [Pattern matching on generic type parameters](#pattern-matching-on-generic-type-parameters)
* [C#7.2](#c72)
  * [Techniques for writing safe efficient code](#techniques-for-writing-safe-efficient-code)
  * [Non-trailing named arguments](#non-trailing-named-arguments)
  * [Leading underscores in numeric literals](#leading-underscores-in-numeric-literals)
  * [private protected access modifier](#private-protected-access-modifier)
  * [Conditional ref expressions](#conditional-ref-expressions)
* [C#7.3](#c73)
  * [Indexing fixed fields without pinning](#indexing-fixed-fields-without-pinning)
  * [Reassigning ref local variables](#reassigning-ref-local-variables)
  * [stackalloc array initializers](#stackalloc-array-initializers)
  * [More types support the fixed statement](#more-types-support-the-fixed-statement)
  * [Enhanced generic constraints](#enhanced-generic-constraints)
  * [Tuple equality](#tuple-equality)
  * [Attributes on backing fields of auto-properties](#attributes-on-backing-fields-of-auto-properties)
  * [Expression variables in initializers](#expression-variables-in-initializers)
  * [Improved overload candidates](#improved-overload-candidates)
  * [in method overload tiebreaker](#in-method-overload-tiebreaker)

---
# C#4
## Dynamic binding
`dynamic` 은 `object`와 비슷하지만, 타입이 런타임에서 결정됩니다.

{% highlight c# %}

dynamic value = 10;
value = value + 5;      // 런타임에 int 연산으로 결정
value = "Hello";
Debug.Log(value.Length); // 런타임에 string.Length 로 결정, 없는 멤버면 런타임 에러

{% endhighlight %}

`dynamic`은 내부적으로 런타임 코드 생성(Reflection.Emit)을 사용하기 때문에, IL2CPP 같은 AOT 플랫폼(iOS, 콘솔, WebGL 등)에서는 사용할 수 없습니다.

## Named/optional arguments
Parameters의 포지션이 아닌 Parameters의 이름을 명시해 arguments를 넘길 수 있게 해줍니다.

{% highlight c# %}

void UpdateProfile(string name, int age, string job)
{
    // do
}

void Start()
{
    // 평범하게 호출하기
    UpdateProfile("Kim", 32, "Programmer");

    // 순서와 성관없이 호출 가능
    UpdateProfile(age: 32, job: "Programmer", name: "Kim");
    UpdateProfile(job: "Programmer", name: "Kim", age: 32);

    // 혼용해 사용시 컴파일 에러가 발생합니다.
    // UpdateProfile(job: "Programmer", 32, "Kim");
    // UpdateProfile(32, name: "Kim", "Programmer");
    // UpdateProfile(32, "Programmer", name: "Kim");
}

{% endhighlight %}

## Generic covariant and contravariant
제네릭 인터페이스와 델리게이트의 타입 파라미터에 `out`(공변성), `in`(반공변성) 키워드를 붙여 더 유연한 타입 변환을 허용합니다.

{% highlight c# %}

// 공변성(out) : 더 구체적인 타입 -> 더 일반적인 타입
// IEnumerable<out T> 로 선언되어 있습니다.
IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings;

// 반공변성(in) : 더 일반적인 타입 -> 더 구체적인 타입
// Action<in T> 로 선언되어 있습니다.
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
COM interop 어셈블리(PIA)의 타입 정보를 호출하는 어셈블리에 직접 포함시켜, 배포 시 별도의 interop 어셈블리가 없어도 되게 해줍니다. 주로 Office 자동화 같은 Windows COM 작업에 사용되며, 유니티 게임 개발에서 쓸 일은 거의 없습니다.

---
# C#5
## New keyword async await
비동기 작업이 가능한 `async` `await` 키워드가 생겼습니다.

{% highlight c# %}

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

{% endhighlight %}

{% highlight c# %}

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
리플렉션 코드 없이 많은 컨텍스트 정보를 쉽게 가져 오게끔 해줍니다.

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
// Something happened
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

생성자가 아닌 곳에서 접근 시 에러를 생성합니다.
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
자동 property 생성자는 property 선언시 값을 초기화 할 수 있게 해줍니다.

{% highlight c# %}

public ICollection<double> Grades { get; } = new List<double>();

public int Health { get; set; } = 100;

{% endhighlight %}

## Index initializers
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
{% highlight c# %}

// .NET 3.5
Debug.Log(String.Format("{0} health: {1}", playerName, health));

// .NET 4.x
Debug.Log($"{playerName} health: {health}");

{% endhighlight %}


## Expression-bodied function members
{% highlight c# %}

public override string ToString() => $"{name} : {health * 0.5}";
public string GetInfo => $"{name} : {(hpRatio < 0.1 ? "Dead" : "Live")}";

{% endhighlight %}


## using static
한 클래스의 스태틱 메소드를 가져오는 것이 향상되었습니다.
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
널 상태 오퍼레이터는 Null 체크를 쉽고 부드럽게 만들어줍니다. 단순히 멤버 접근을 `.`에서 `?.` 로 바꾸세요.

{% highlight c# %}

var first = person?.FirstName;

{% endhighlight %}

person 객체가 null 이면 first 변수에 null 이 할당됩니다. person 객체가 null 이 아니라면 FirstName 이 할당됩니다.
person 변수가 null 일 경우에 `NullRefferenceException` 을 생성하지 않고 null 을 반환합니다. 또 배열 혹은 인덱스에 접근할때 `[]` 를 `?[]`로 바꾸는걸로 사용가능합니다.

{% highlight c# %}

first = person?.FirstName ?? "Unspecified";

{% endhighlight %}

`??` 오퍼레이터와 함꼐 해서 Default 값을 셋팅 할 수도 있습니다.

{% highlight c# %}

A?.B?.Do(C);
A?.B?[C];

{% endhighlight %}

앞의 오퍼레이터가 널을 리턴한다면 뒤의 나머지 체인들을 실행되지 않습니다. 위 예제에서는 만약 A나 B가 널이라면 C를 실행 하지 않습니다.

## Extension Add methods in collection initializers
콜렉션 이니셜라이저에 Add 메소드 익스텐션이 적용됩니다.
{% highlight c# %}

var dict = new Dictionary<int, string> { 1, 2, 4 };

foreach (var a in dict)
	Console.WriteLine($"[{a.Key}] : {a.Value}");
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
이제 가볍고 여러 공개 필드를 가지는 명시되지 않는 타입을 만들 수 있습니다. 컴파일러나 IDE는 이러한 타입의 시맨틱을 이해합니다.
튜플은 C#7.0 이전에도 사용 가능했으나, 효과적이지 않고 언어적 도움도 없었습니다.

{% highlight c# %}

(string Alpha, string Beta) letter = ("a", "b");
Debug.Log($"{letter.Alpha}, {letter.Beta}");

var letter = (Alpha: "a", Beta: "b");
Debug.Log($"{letter.Alpha}, {letter.Beta}");

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
(double X, double Y) = p;

{% endhighlight %}



## Discards
Discard는 `_` 키워드로 사용하는 쓰기 전용 변수입니다. 단순히 버리기를 의도하는 하나의 변수나 모든 변수에 할당 할 수 있습니다.

Discard는 할당되지 않은 변수와 같습니다.

Discard는 다음의 경우에 도움을 줍니다.

* 튜플이나 유저정의 형식을 해체할때.
* `out` arguments 없이 함수가 호출될때.
* `is`나 `switch` 구문이 사용되는 패턴 매칭 연산때.
* 명백히 버리기 위해 할당한 단독 형식일 경우에.

{% highlight c# %}


var (_, _, _, pop1, _, pop2) = QueryCityDataForYears("New York City", 1960, 2010);

Debug.Log($"Population change, 1960 to 2010: {pop2 - pop1:N0}");


private (string, double, int, int, int, int) QueryCityDataForYears(string name, int year1, int year2)
{
  int population1 = 0, population2 = 0;
  double area = 0;

  if (name == "New York City") {
     area = 468.48;
     if (year1 == 1960) {
        population1 = 7781984;
     }
     if (year2 == 2010) {
        population2 = 8175133;
     }
  return (name, area, year1, population1, year2, population2);
  }

  return ("", 0, 0, 0, 0, 0);
}

{% endhighlight %}


## Pattern Matching
패턴 매칭은 객체 뿐만 아니라 property에 대해 메서드 디스패치를 구현 할 수 있게 해주는 기능입니다.
패턴 매칭은 `switch`와 `is` 구문을 지원합니다. 패턴에 대해 추가적인 특별한 룰을 지정하기 위해 `when` 키워드를 씁니다.
2가지 사용 방법을 소개하겠습니다.

1. `is` 패턴 표현식은 익숙한 `is` 연산자를 사용하여 해당 타입에 대한 객체를 질의하고 결과를 할당하는것을 하나의 명령어로 처리합니다.

{% highlight c# %}

if (input is int count)
    sum += count;

{% endhighlight %}


2. 기존 스위치 문에 몇가지가 추가되었습니다.

* 모든 타입이 다 사용가능합니다.
* 각각의 라벨에서 스위치 표현식을 체크 할 수 있습니다. `is` 표현식과 마찬가지로 새 변수를 할당 할 수 있습니다.
* 해당 변수에 대한 추가 체크 조건을 위해 `when` 절을 추가 할 수 있습니다.
* `case` 라벨 순서는 이제 중요합니다. 첫번째 일치하는 매칭 구문이 실행되고 나머진 지나갑니다.

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
            // 추가적인 when 절을 이용한 패턴
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
밸류 타입에 대한 Refference를 다룰 수 있습니다.

{% highlight c# %}

int number = 0;

ref int copyNumber = ref number;

copyNumber = 1;

Debug.Log($"number : {number}"); // 1
Debug.Log($"copyNumber : {copyNumber}"); // 1

public static ref int Find(int[,] matrix, Func<int, bool> predicate)
{
    for (int i = 0; i < matrix.GetLength(0); i++)
        for (int j = 0; j < matrix.GetLength(1); j++)
            if (predicate(matrix[i, j]))
                return ref matrix[i, j];
    throw new InvalidOperationException("Not found");
}

ref var item = ref MatrixSearch.Find(matrix, (val) => val == 42);
Debug.Log(item);
item = 24;
Debug.Log(matrix[4, 2]);

{% endhighlight %}

C#언어에서는 ref local과 return을 잘못 사용하는것을 막아 줄 몇 가지 규칙들이 있습니다.

* 모든 메소드의 호출과 리턴 구문에는 반드시 `ref` 키워드를 넣어야 합니다.
* ref 리턴은 밸류 변수나 ref 변수에 할당됩니다.
* 일반 메소드 리턴 값을 ref 로컬 변수에 할당 할 수 없습니다.
* 비슷한 스코프 혹은 로컬 변수에 레퍼런스를 리턴 할 수 없습니다.
* ref local 과 return 은 비동기 메소드와 함께 사용 할 수 없습니다.

## Local Functions
스코프와 가시성이 허락하는 아래에서 다른 함수 내에 함수를 끼워 넣을 수 있습니다.

{% highlight c# %}

public string GetA()
{
    return PrintA();

    string PrintA()
    {
        return "a";
    }
}

{% endhighlight %}

https://docs.microsoft.com/en-us/dotnet/csharp/local-functions-vs-lambdas

## More expression-bodied members
{% highlight c# %}

// 생성자
public ExpressionMembersExample(string label) => this.Label = label;

// 소멸자
~ExpressionMembersExample() => Console.Error.WriteLine("Finalized!");

private string label;

// getter setter
public string Label
{
    get => label;
    set => this.label = value ?? "Default label";
}

// .NET 3.5
private int TakeDamage(int amount)
{
    return Health -= amount;
}
// .NET 4.x
private int TakeDamage(int amount) => Health -= amount;

// .NET 4.x
public string PlayerHealthUiText => $"Player health: {Health}";


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
    // 캐시에 있으면 할당 없이 바로 반환
    if (cache.TryGetValue(key, out var texture))
        return texture;

    texture = await DownloadTextureAsync(key);
    cache[key] = texture;
    return texture;
}

{% endhighlight %}

유니티 2018.3 기본 환경에는 `ValueTask`가 포함되어 있지 않아 `System.Threading.Tasks.Extensions` 어셈블리를 따로 추가해야 합니다. 유니티에 최적화된 할당 없는 async 라이브러리인 [UniTask](https://github.com/Cysharp/UniTask)도 이 기능을 기반으로 만들어졌습니다.

## Numeric literal syntax improvements
새 토큰들로 상수를 읽는 가독성을 좋아집니다.

{% highlight c# %}

public const int Sixteen =   0b0001_0000;
public const int ThirtyTwo = 0b0010_0000;
public const int SixtyFour = 0b0100_0000;
public const int OneHundredTwentyEight = 0b1000_0000;

{% endhighlight %}

상수의 시작부분에 있는 `0b`는 바이너리 넘버로 쓰여졌음을 나타냅니다. 바이너리 넘버는 더 길어질 수 있기때문에 digit seperator `_`를 통해 비트 패턴을 더 쉽게 확인 할수 있습니다. digit seperator는 상수 어디에나 나타날 수 있습니다.  기본적인 10진수의 경우 일반적으로 천 단위 구분자로 사용됩니다.

{% highlight c# %}

public const long BillionsAndBillions = 100_000_000_000;

{% endhighlight %}

digit seperator 는 `decimal`, `float`, 그리고 `double` 타입에서도 사용 할 수 있습니다.

{% highlight c# %}

public const double AvogadroConstant = 6.022_140_857_747_474e23;
public const decimal GoldenRatio = 1.618_033_988_749_894_848_204_586_834_365_638_117_720_309_179M;

{% endhighlight %}

숫자 상수를 더욱 가독성 좋게 선언 할 수 있습니다.

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
대상의 타입이 유추 가능한 경우 `default` 값 식에서 [리터럴](https://ko.wikipedia.org/wiki/%EB%A6%AC%ED%84%B0%EB%9F%B4) 식을 사용 할 수 있습니다.

{% highlight c# %}

// .NET 3.5
Func<string, bool> whereClause = default(Func<string, bool>);

// .NET 4.x
Func<string, bool> whereClause = default;

{% endhighlight %}


## Inferred tuple element names
튜플 엘레멘츠의 이름은 대부분 초기화 할때 유추 가능합니다.
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
* `in`  Parameters에서 레퍼런스로 전달되지만 불린 함수에서 수정되지 않게 해줍니다.
* `ref readonly` 한정자는 레퍼런스 값을 반환하지만 해당 오브젝트에 값을 쓰는걸 허용하지 않는걸 나타냅니다. `ref readonly` 한정자를 추가하는것은 호환 가능한 변경이나, 이미 존재하는 `ref` 반환에 `readonly`를 추가하는 것은 호환 가능하지 않는 변경입니다. 호출자가 `ref` 지역 변수를 `readonly` 한정자가 포함되도록 선언을 변경해야 합니다.
* `readyonly struct` 선언은 구조체가 이뮤터블하고 멤버 변수로 `in` Parameters로서 넘겨져야 합니다. 기존의 구조체 선언에 `readonly` 한정자를 추가하는것은 [이진 호환 가능 변경](https://docs.microsoft.com/ko-kr/dotnet/csharp/whats-new/version-update-considerations#binary-compatible-changes) 입니다.
* `ref struct` 선언은 구조체 타입이 직접 매니지드 메모리에 접근 할 수 있고 언제나 스택에 할당 됨을 나타냅니다. 기존의 `stuct` 선언에 `ref` 한정자를 추가하는 것은 호환 가능하지 않는 변경입니다. `ref struct`는 구조체의 멤버가 될 수 없거나 힙에 할당되지 않는 다른 영역에서 사용이 불가능합니다.

## Non-trailing named arguments
명명된 아규먼트가 올바른 위치에 있을 시 위치 아규먼트 앞에 명명된 아규먼트를 사용 할 수 있습니다.

{% highlight c# %}

UpdateProfile(name: "Kim", 32, job: "Programmer");
UpdateProfile("Kim", age: 32, "Programmer");

{% endhighlight %}


## Leading underscores in numeric literals
digit이 나오기전에 `_` digit seperator 를 사용 할 수 있습니다.
{% highlight c# %}

int binaryValue = 0b_0101_0101;

{% endhighlight %}


## private protected access modifier
`private protected` 한정자는 같은 어셈블리 내에 선언된 상속된 클래스들에서 접근 가능합니다. 구조체는 상속 받을 수 없기 떄문에 선언 할 수 없습니다.

## Conditional ref expressions
삼항 연산자(?:) 의 결과는 레퍼런스가 될 수 있습니다.
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

// C#7.2 까지는 이렇게 비교해야 했습니다.
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
    // 생성자 이니셜라이저에서 out var 사용
    public Derived(int i) : base(i, out var j)
    {
        Debug.Log($"The value of 'j' is {j}");
    }
}

{% endhighlight %}

## Improved overload candidates
오버로드된 메서드 중 호출할 메서드를 고를 때, 명백히 맞지 않는 후보를 먼저 제외해서 불필요한 모호성(ambiguous) 컴파일 에러가 줄었습니다.

* 타입 인자가 제네릭 제약 조건을 만족하지 않는 후보는 제외됩니다.
* 인스턴스 없이 호출할 때 인스턴스 멤버는, 인스턴스로 호출할 때 static 멤버는 제외됩니다.
* 메서드 그룹을 넘길 때 리턴 타입이 델리게이트와 맞지 않는 후보는 제외됩니다.

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
