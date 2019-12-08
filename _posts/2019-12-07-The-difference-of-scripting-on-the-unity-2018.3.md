---
layout: post
title: Unity 2018.3 버전 이후 사용할 수 있는 C# 스크립팅 소개
image: /assets/coding.jpg
date: 2019-12-07 22:24:34 +0900
tags: [unity, C#]
categories: [unity, C#]
---

유니티 2017.1 버전부터 [로즐린 컴파일러](https://github.com/dotnet/roslyn)가 실험적으로 적용 되 .NET 4.x, C#6와 호환되는 스크립팅이 사용 가능합니다. 2018.1 부터는 .NET 3.5 런타임이 레거시가 되고, 2018.3 부터는 C#7.3 버전이 사용 가능합니다.

* 2017.1 .NET 4.6, C#6 Compatible version
* 2018.1 .NET 4.x Equivalent runtime is no longer considered experimental,
* 2018.3 Support C#7.3
* 2019.2 Removed .NET 3.5 Equivalent

그간 유니티에서 최신 C#언어의 기능을 사용하는것은 제한적이었습니다. 그래서 이제 사용 가능한 C#기능들을 정리해 보았습니다.
* [C#4](#C4)
* [C#5](#C5)
* [C#6](#C6)
* [C#7.0](#C70)
* [C#7.1](#C71)
* [C#7.2](#C72)
* [C#7.3](#C73)

# C#4
## Dynamic binding
`dynamic` 은 `object`와 비슷하지만, 타입이 런타임에서 결정됩니다.

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
## Embedded interop types


# C#5
## New keyword async await
비동기 작업이 가능한 `async` `await` 키워드가 생겼습니다.

{% highlight c# %}

// Unity 코루틴 경우
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

// .NET 4.x async-await 경우
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


유니티에서 비동기 프로그래밍을 시작하기 위한 참고사항

* 비동기 함수는 `Task` 나 `Task<TResult>`의 리턴값을 가져야 합니다.
* task를 리턴하는 비동기 함수는 언제나 `async` 키워드를 붙여야 합니다.
* 동기식 코드에서 비동기 함수를 실행 할 때만 `async void` 형이여야 합니다.
* 유니티는 UnitySynchronizationContext 를 사용하여 기본적으로 메인 스레드에서 비동기 함수를 실행합니다.
* unity API 는 메인 스레드 외부에서 접근 불가능합니다.
* 현재 Unity WebGL 에서는 스레드를 사용하는 작업을 지원 하지 않습니다.

### 코루틴과 async-await 중요 차이점
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



# C#6
## Read-only auto-properties
읽기 전용 프로퍼티는 간단히 `get` 만 선언함으로써 만들 수 있습니다.

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
자동 프로퍼티 생성자는 프로퍼티 선언시 값을 초기화 할 수 있게 해줍니다.


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

var dic = new Dictionary<int, string> { 1, 2, 4 };

foreach (var a in dic)
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

(string Alpha, string Beta) namedLetters = ("a", "b");
Debug.Log($"{namedLetters.Alpha}, {namedLetters.Beta}");

var alphabetStart = (Alpha: "a", Beta: "b");
Debug.Log($"{alphabetStart.Alpha}, {alphabetStart.Beta}");

(int max, int min) = Range(numbers);
Debug.Log(max);
Debug.Log(min);

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
디스카드는 `_`의 이름을 가진 쓰기 전용 변수입니다. 단순히 버리기를 의도하는 하나의 변수에 모두 할당 할 수 있습니다. 디스카드는 할당되지 안흔 변수와 같습니다.
디스카드는 다음의 경우에 도움을 줍니다.

* 튜플이나 유저정의 형식을 해체할때.
* `out` arguments 없이 함수가 호출될때.
* `is`나 `switch` 구문이 사용되는 패턴 매칭 연산때.
* 명백히 버리기 위해 할당한 단독 형식자일 경우에.


{% highlight c# %}

using System;
using System.Collections.Generic;

public class Example
{
   public static void Main()
   {
       var (_, _, _, pop1, _, pop2) = QueryCityDataForYears("New York City", 1960, 2010);

       Debug.Log($"Population change, 1960 to 2010: {pop2 - pop1:N0}");
   }

   private static (string, double, int, int, int, int) QueryCityDataForYears(string name, int year1, int year2)
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
}
// The example displays the following output:
//      Population change, 1960 to 2010: 393,149

{% endhighlight %}


## Pattern Matching
패턴 매칭은 객체 뿐만 아니라 프로퍼티에 대해 메서드 디스패치를 구현 할 수 있게 해주는 기능입니다.
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

public static IEnumerable<char> AlphabetSubset3(char start, char end)
{
    if (start < 'a' || start > 'z')
        throw new ArgumentOutOfRangeException(paramName: nameof(start), message: "start must be a letter");
    if (end < 'a' || end > 'z')
        throw new ArgumentOutOfRangeException(paramName: nameof(end), message: "end must be a letter");

    if (end <= start)
        throw new ArgumentException($"{nameof(end)} must be greater than {nameof(start)}");

    return alphabetSubsetImplementation();

    IEnumerable<char> alphabetSubsetImplementation()
    {
        for (var c = start; c < end; c++)
            yield return c;
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
생성자에서 `throw` 구문을 사용 할 수 있습니다.

## Generalized async return types
async의 리턴 타입으로 `Task`와 `Task<T>`를 사용가능합니다.

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

# C#7.1
## async Main method
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



# C#7.3
TODO

---
참조

