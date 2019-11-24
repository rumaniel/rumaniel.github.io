---
layout: post
title: Unity 2018.3 버전 이후 사용할 수 있는 C# 기능들
image: /img/hello_world.jpeg
tags: [unity, c#, ]
categories: [unity, c#]
---

유니티 2017.1 버전부터 로즐린 컴파일러가 실험적으로 도입되 .NET 4.x 와 동등하고, C# 6와 호환되는 스크립팅 런타임이 사용 가능합니다. 2018.1 부터는 .NET 3.5 런타임이 레거시가 되고, 2018.3 부터는 c# 7.3 버전이 사용 가능합니다.

* 2017.1 .NET 4.6, C# 6 Compatible version
* 2018.1 .NET 4.x Equivalent runtime is no longer considered experimental,
* 2018.3 Support C# 7.3
* 2019.2 Removed .NET 3.5 Equivalent

그건 유니티에서 최신 C# 의 기능 사용이 제한적이었습니다. 그래서 이제 사용 가능한 쓸만한 C# 기능들을 정리하였습니다.

# c# 4
## Dynamic binding
`dynamic` 은 `object`와 대부분 상황에서 비슷하지만, 형이 런타임에서 결정됩니다.

## Named/optional arguments
파라미터의 포지션이 아닌 파라미터의 이름을 명시해 인자를 넘길 수 있게 해줍니다.

```c#
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
```
## Generic covariant and contravariant
## Embedded interop types


# c# 5
## New keyword async await
비동기 작업이 가능한 `async` `await` 키워드가 생겼습니다.

```C#
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
```
```c#
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
```

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


```c#
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
```


# c# 6
## Read-only auto-properties
읽기 전용 프로퍼티는 간단히 `get` 만 선언함으로써 만들 수 있습니다.

```c#
public class NPC
{
    public int health { get; }

    public NPC(int health)
    {
        this.health = health;
    }
}
```
생성자가 아닌 곳에서 접근 시 에러를 생성합니다.
```c#
public class NPC
{
    public int health { get; }

    public void SetHealth(int health)
    {
        // 에러 발생
        this.health = health;
    }
}
```

## Auto-property initializers
자동 프로퍼티 생성자는 프로퍼티 선언시 값을 초기화 할 수 있게 해줍니다.


```c#
public ICollection<double> Grades { get; } = new List<double>();

public int Health { get; set; } = 100;
```

## Index initializers
```c#
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
```

## String interpolation
```c#
// .NET 3.5
Debug.Log(String.Format("{0} health: {1}", playerName, health));

// .NET 4.x
Debug.Log($"{playerName} health: {health}");
```

## Expression-bodied function members
```c#
public override string ToString() => $"{name} : {health * 0.5}";
public string GetInfo => $"{name} : {(hpRatio < 0.1 ? "Dead" : "Live")}";
```

## using static
한 클래스의 스태틱 메소드를 가져오는 것이 향상되었습니다.
```c#
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
```

## Null-conditional operators
널 상태 오퍼레이터는 Null 체크를 쉽고 부드럽게 만들어줍니다. 단순히 멤버 접근을 `.`에서 `?.` 로 바꾸세요.

```c#
var first = person?.FirstName;
```
person 객체가 null 이면 first 변수에 null 이 할당됩니다. person 객체가 null 이 아니라면 FirstName 이 할당됩니다.
person 변수가 null 일 경우에 `NullRefferenceException` 을 생성하지 않고 null 을 반환합니다. 또 배열 혹은 인덱스에 접근할때 `[]` 를 `?[]`로 바꾸는걸로 사용가능합니다.

```c#
first = person?.FirstName ?? "Unspecified";
```
`??` 오퍼레이터와 함꼐 해서 Default 값을 셋팅 할 수도 있습니다.

```c#
A?.B?.Do(C);
A?.B?[C];
```
앞의 오퍼레이터가 널을 리턴한다면 뒤의 나머지 체인들을 실행되지 않습니다. 위 예제에서는 만약 A나 B가 널이라면 C를 실행 하지 않습니다.

## Extension Add methods in collection initializers
콜렉션 이니셜라이저에 Add 메소드 익스텐션이 적용됩니다.
```c#
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
```

# c# 7.0
## out variables
이제 `out` 변수를 따로 선언하는게 아닌 메소드가 불리는 곳에서 인자로 선언할 수 있습니다.

```c#
// .NET 3.5
bool error;
string text = StringTable.GetString("SOME_TEXT", out error);

// .NET 4.x
string text = StringTable.GetString("SOME_TEXT", out var error);
```

## Tuples
이제 가볍고 여러 공개 필드를 가지는 명시되지 않는 타입을 만들 수 있습니다. 컴파일러나 IDE는 이러한 타입의 시맨틱을 이해합니다.
튜플은 C# 7.0 이전에도 사용 가능했으나, 효과적이지 않고 언어적 도움도 없었습니다.

```c#
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
```


## Discards
디스카드는 `_`의 이름을 가진 쓰기 전용 변수입니다. 단순히 버리기를 의도하는 하나의 변수에 모두 할당 할 수 있습니다. 디스카드는 할당되지 안흔 변수와 같습니다.
디스카드는 다음의 경우에 도움을 줍니다.

* 튜플이나 유저정의 형식을 해체할때.
* `out` 인자 없이 함수가 호출될때.
* `is`나 `switch` 구문이 사용되는 패턴 매칭 연산때.
* 명백히 버리기 위해 할당한 단독 형식자일 경우에.


```c#
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
```

## Pattern Matching
패턴 매칭은 객체 뿐만 아니라 프로퍼티에 대해 메서드 디스패치를 구현 할 수 있게 해주는 기능입니다.
패턴 매칭은 `switch`와 `is` 구문을 지원합니다. 패턴에 대해 추가적인 특별한 룰을 지정하기 위해 `when` 키워드를 씁니다.
2가지 사용 방법을 소개하겠습니다.

1. `is` 패턴 표현식은 익숙한 `is` 연산자를 사용하여 해당 타입에 대한 객체를 질의하고 결과를 할당하는것을 하나의 명령어로 처리합니다.

```c#
if (input is int count)
    sum += count;
```

2. 기존 스위치 문에 몇가지가 추가되었습니다.

* 모든 타입이 다 사용가능합니다.
* 각각의 라벨에서 스위치 표현식을 체크 할 수 있습니다. `is` 표현식과 마찬가지로 새 변수를 할당 할 수 있습니다.
* 해당 변수에 대한 추가 체크 조건을 위해 `when` 절을 추가 할 수 있습니다.
* `case` 라벨 순서는 이제 중요합니다. 첫번째 일치하는 매칭 구문이 실행되고 나머진 지나갑니다.

```c#
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
            // childSequence: is a type pattern.
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
```

## ref locals and returns
Method local variables and return values can be references to other storage.
```c#
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
```
The C# language has several rules that protect you from misusing the ref locals and returns:

* You must add the ref keyword to the method signature and to all return statements in a method.
    * That makes it clear the method returns by reference throughout the method.
* A ref return may be assigned to a value variable, or a ref variable.
    * The caller controls whether the return value is copied or not. Omitting the ref modifier when assigning the return value indicates that the caller wants a copy of the value, not a reference to the storage.
* You can't assign a standard method return value to a ref local variable.
    * That disallows statements like ref int i = sequence.Count();
* You can't return a ref to a variable whose lifetime doesn't extend beyond the execution of the method.
    * That means you can't return a reference to a local variable or a variable with a similar scope.
* ref locals and returns can't be used with async methods.
   * The compiler can't know if the referenced variable has been set to its final value when the async method returns.

## Local Functions
You can nest functions inside other functions to limit their scope and visibility.
```c#
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
```
https://docs.microsoft.com/en-us/dotnet/csharp/local-functions-vs-lambdas

## More expression-bodied members
The list of members that can be authored using expressions has grown.
you can implement constructors, finalizers, and get and set accessors on properties and indexers.

```c#
// Expression-bodied constructor
public ExpressionMembersExample(string label) => this.Label = label;

// Expression-bodied finalizer
~ExpressionMembersExample() => Console.Error.WriteLine("Finalized!");

private string label;

// Expression-bodied get / set accessors.
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

```


## throw Expressions
You can throw exceptions in code constructs that previously weren't allowed because throw was a statement.
https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/throw#the-throw-expression

## Generalized async return types
Methods declared with the async modifier can return other types in addition to Task and Task<T>.


## Numeric literal syntax improvements
New tokens improve readability for numeric constants.

```c#
public const int Sixteen =   0b0001_0000;
public const int ThirtyTwo = 0b0010_0000;
public const int SixtyFour = 0b0100_0000;
public const int OneHundredTwentyEight = 0b1000_0000;
```
The 0b at the beginning of the constant indicates that the number is written as a binary number. Binary numbers can get long, so it's often easier to see the bit patterns by introducing the _ as a digit separator, as shown above in the binary constant. The digit separator can appear anywhere in the constant. For base 10 numbers, it is common to use it as a thousands separator:

```c#
public const long BillionsAndBillions = 100_000_000_000;
```

The digit separator can be used with decimal, float, and double types as well:

```c#
public const double AvogadroConstant = 6.022_140_857_747_474e23;
public const decimal GoldenRatio = 1.618_033_988_749_894_848_204_586_834_365_638_117_720_309_179M;
```
Taken together, you can declare numeric constants with much more readability.

# c# 7.1
## async Main method
The entry point for an application can have the async modifier.
An async main method enables you to use await in your Main method. Previously you would need to write:


## default literal expressions
You can use default literal expressions in default value expressions when the target type can be inferred.
Default literal expressions are an enhancement to default value expressions. These expressions initialize a variable to the default value. Where you previously would write:

```c#
Func<string, bool> whereClause = default(Func<string, bool>);
```
You can now omit the type on the right-hand side of the initialization:
```c#
Func<string, bool> whereClause = default;
```

## Inferred tuple element names
The names of tuple elements can be inferred from tuple initialization in many cases.
```c#
int count = 5;
string label = "Colors used in the map";
var pair = (count: count, label: label);
```
```c#
int count = 5;
string label = "Colors used in the map";
var pair = (count, label); // element names are "count" and "label"
```

## Pattern matching on generic type parameters
You can use pattern match expressions on variables whose type is a generic type parameter.

# c# 7.2
## Techniques for writing safe efficient code
A combination of syntax improvements that enable working with value types using reference semantics.
* The `in` modifier on parameters, to specify that an argument is passed by reference but not modified by the called method. Adding the `in` modifier to an argument is a source compatible change.
* The `ref readonly` modifier on method returns, to indicate that a method returns its value by reference but doesn't allow writes to that object. Adding the `ref readonly` modifier is a source compatible change, if the return is assigned to a value. Adding the `readonly` modifier to an existing `ref` return statement is an incompatible change. It requires callers to update the declaration of `ref` local variables to include the `readonly` modifier.
* The `readonly struct` declaration, to indicate that a struct is immutable and should be passed as an `in` parameter to its member methods. Adding the `readonly` modifier to an existing struct declaration is a binary compatible change.
* The `ref struct` declaration, to indicate that a struct type accesses managed memory directly and must always be stack allocated. Adding the `ref` modifier to an existing `struct` declaration is an incompatible change. A `ref struct` cannot be a member of a class or used in other locations where it may be allocated on the heap.
## Non-trailing named arguments
Named arguments can be followed by positional arguments.
Method calls may now use named arguments that precede positional arguments when those named arguments are in the correct positions.
```c#
// The method can be called in the normal way, by using positional arguments.
PrintOrderDetails("Gift Shop", 31, "Red Mug");

// Named arguments mixed with positional arguments are valid
// as long as they are used in their correct position.
PrintOrderDetails("Gift Shop", 31, productName: "Red Mug");
PrintOrderDetails(sellerName: "Gift Shop", 31, productName: "Red Mug");    // C# 7.2 onwards
PrintOrderDetails("Gift Shop", orderNum: 31, "Red Mug");                   // C# 7.2 onwards

// However, mixed arguments are invalid if used out-of-order.
// The following statements will cause a compiler error.
PrintOrderDetails(productName: "Red Mug", 31, "Gift Shop");
PrintOrderDetails(31, sellerName: "Gift Shop", "Red Mug");
PrintOrderDetails(31, "Red Mug", sellerName: "Gift Shop");
```

## Leading underscores in numeric literals
Numeric literals can now have leading underscores before any printed digits.
```c#
int binaryValue = 0b_0101_0101;
```

## private protected access modifier
The `private protected` access modifier enables access for derived classes in the same assembly.
Struct members cannot be `private protected` because the struct cannot be inherited.



## Conditional ref expressions
The result of a conditional expression (?:) can now be a reference.
```c#
ref var r = ref (arr != null ? ref arr[0] : ref otherArr[0]);
```
The variable r is a reference to the first value in either arr or otherArr.



# c# 7.3
The following new features support the theme of better performance for safe code:

* Indexing `fixed` fields does not require pinning
* You can reassign ref local variables.
* You can use initializers on stackalloc arrays.
* You can use fixed statements with any type that supports a pattern.
* You can use additional generic constraints.

The following enhancements were made to existing features:

* You can test == and != with tuple types.
* You can use expression variables in more locations.
* You may attach attributes to the backing field of auto-implemented properties.
* Method resolution when arguments differ by in has been improved.
* Overload resolution now has fewer ambiguous cases.