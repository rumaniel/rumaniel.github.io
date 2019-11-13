---
layout: post
title: Unity 2018.3 버전 이후 사용할 수 있는 C# 기능들
image: /img/hello_world.jpeg
tags: [unity, c#, ]
categories: [unity, c#]
---

https://blogs.unity3d.com/kr/2018/12/13/introducing-unity-2018-3/

이제 Unity 프로젝트에서 기본으로 .NET 4.x Equivalent 스크립팅 런타임을 사용합니다.
c# 3.0
이전 버전의 스크립팅 런타임(.NET 3.5 Equivalent)은 제외될 예정이었으며 2019.x 버전에서 제거될 것입니다. LTS 2018에서는 두 스크립팅 런타임 버전 모두 계속해서 지원됩니다.

C# 7.2
CSHARP_7_3_OR_NEWER

With the release of Unity 2017.1, Unity introduced an experimental version of its scripting runtime upgraded to a .NET 4.6, C# 6 compatible


With the release of Unity 2017.1, Unity introduced an experimental version of its scripting runtime upgraded to a .NET 4.6, C# 6 compatible version. In Unity 2018.1, the .NET 4.x equivalent runtime is no longer considered experimental, while the older .NET 3.5 equivalent runtime is now considered to be the legacy version. And with the release of Unity 2018.3, Unity is projecting to make the upgraded scripting runtime the default selection, and to update even further to C# 7


https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history

2017.1 .NET 4.6, C# 6 compatible version
2018.1 .NET 4.x equivalent runtime is no longer considered experimental,
2018.3  C# 7.3


# c# 4
## Dynamic binding
The major feature was the introduction of the dynamic keyword. The dynamic keyword introduced into C# version 4.0 the ability to override the compiler on compile-time typing. By using the dynamic keyword, you can create constructs similar to dynamically typed languages like JavaScript. You can create a dynamic x = "a string" and then add six to it, leaving it up to the runtime to sort out what should happen next.

Dynamic binding gives you the potential for errors but also great power within the language.

The dynamic type indicates that use of the variable and references to its members bypass compile-time type checking. Instead, these operations are resolved at run time

Dynamic binding
Named/optional arguments
Generic covariant and contravariant
Embedded interop types


# c# 5
## New keyword async await
Async code can be used for both I/O-bound and CPU-bound code, but differently for each scenario.
Async code uses Task<T> and Task, which are constructs used to model work being done in the background.
The async keyword turns a method into an async method, which allows you to use the await keyword in its body.
When the await keyword is applied, it suspends the calling method and yields control back to its caller until the awaited task is complete.
await can only be used inside an async method.

https://docs.microsoft.com/en-us/dotnet/standard/async-in-depth
https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/index

## Caller info attributes
The caller info attribute lets you easily retrieve information about the context in which you're running without resorting to a ton of boilerplate reflection code. It has many uses in diagnostics and logging tasks.

# c# 6
https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-6
## Read-only auto-properties
Read-only auto-properties provide a more concise syntax to create immutable types. You declare the auto-property with only a get accessor:

public string FirstName { get; }
public string LastName { get;  }
The FirstName and LastName properties can be set only in the body of the constructor of the same class:

public Student(string firstName, string lastName)
{
    if (IsNullOrWhiteSpace(lastName))
        throw new ArgumentException(message: "Cannot be blank", paramName: nameof(lastName));
    FirstName = firstName;
    LastName = lastName;
}
Trying to set LastName in another method generates a CS0200 compilation error:

public class Student
{
    public string LastName { get;  }

    public void ChangeName(string newLastName)
    {
        // Generates CS0200: Property or indexer cannot be assigned to -- it is read only
        LastName = newLastName;
    }
}

## Auto-property initializers
Auto-property initializers let you declare the initial value for an auto-property as part of the property declaration.

public ICollection<double> Grades { get; } = new List<double>();
The Grades member is initialized where it's declared. That makes it easier to perform the initialization exactly once. The initialization is part of the property declaration, making it easier to equate the storage allocation with the public interface for Student objects


## Expression-bodied function members
Many members that you write are single statements that could be single expressions. Write an expression-bodied member instead. It works for methods and read-only properties. For example, an override of ToString() is often a great candidate:


public override string ToString() => $"{LastName}, {FirstName}";
You can also use this syntax for read-only properties:


public string FullName => $"{FirstName} {LastName}";

## using static
The using static enhancement enables you to import the static methods of a single class. You specify the class you're using:

using static System.Math;

Null-conditional operators
The null conditional operator makes null checks much easier and fluid. Replace the member access . with ?.:

var first = person?.FirstName;

## String interpolation
With C# 6, the new string interpolation feature enables you to embed expressions in a string. Simply preface the string with $and use expressions between { and } instead of ordinals:
public string FullName => $"{FirstName} {LastName}";

## Index initializers
private Dictionary<int, string> webErrors = new Dictionary<int, string>
{
    [404] = "Page not Found",
    [302] = "Page moved, but left a forwarding address.",
    [500] = "The web server can't come out to play today."
};


## Extension Add methods in collection initializers
Another feature that makes collection initialization easier is the ability to use an extension method for the Add method. This feature was added for parity with Visual Basic. The feature is most useful when you have a custom collection class that has a method with a different name to semantically add new items.


# c# 7.0
## out variables
You can declare out values inline as arguments to the method where they're used.

The existing syntax that supports out parameters has been improved in this version. You can now declare out variables in the argument list of a method call, rather than writing a separate declaration statement:


```c#
if (int.TryParse(input, out var answer))
    Console.WriteLine(answer);
else
    Console.WriteLine("Could not parse input");
```

## Tuples
You can create lightweight, unnamed types that contain multiple public fields. Compilers and IDE tools understand the semantics of these types.

Tuples were available before C# 7.0, but they were inefficient and had no language support.

```c#
(string Alpha, string Beta) namedLetters = ("a", "b");
Console.WriteLine($"{namedLetters.Alpha}, {namedLetters.Beta}");

var alphabetStart = (Alpha: "a", Beta: "b");
Console.WriteLine($"{alphabetStart.Alpha}, {alphabetStart.Beta}");

(int max, int min) = Range(numbers);
Console.WriteLine(max);
Console.WriteLine(min);

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
Discards are temporary, write-only variables used in assignments when you don't care about the value assigned. They're most useful when deconstructing tuples and user-defined types, as well as when calling methods with out parameters.


* When deconstructing tuples or user-defined types.
* When calling methods with out parameters.
* In a pattern matching operation with the is and switch statements.
* As a standalone identifier when you want to explicitly identify the value of an assignment as a discard.


```c#
using System;
using System.Collections.Generic;

public class Example
{
   public static void Main()
   {
       var (_, _, _, pop1, _, pop2) = QueryCityDataForYears("New York City", 1960, 2010);

       Console.WriteLine($"Population change, 1960 to 2010: {pop2 - pop1:N0}");
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
You can create branching logic based on arbitrary types and values of the members of those types.

When deconstructing tuples or user-defined types.
When calling methods with out parameters.
In a pattern matching operation with the is and switch statements.
As a standalone identifier when you want to explicitly identify the value of an assignment as a discard.

1. The is pattern expression extends the familiar is operator to query an object about its type and assign the result in one instruction. The following code checks if a variable is an int, and if so, adds it to the current sum:


```c#
if (input is int count)
    sum += count;
```

2. The switch match expression has a familiar syntax, based on the switch statement already part of the C# language. The updated switch statement has several new constructs:

* The governing type of a switch expression is no longer restricted to integral types, Enum types, string, or a nullable type corresponding to one of those types. Any type may be used.
* You can test the type of the switch expression in each case label. As with the is expression, you may assign a new variable to that type.
* You may add a when clause to further test conditions on that variable.
* The order of case labels is now important. The first branch to match is executed; others are skipped.

```c#
public static int SumPositiveNumbers(IEnumerable<object> sequence)
{
    int sum = 0;
    foreach (var i in sequence)
    {
        switch (i)
        {
            // is the familiar constant pattern.
            case 0:
                break;
            // childSequence: is a type pattern.
            case IEnumerable<int> childSequence:
            {
                foreach(var item in childSequence)
                    sum += (item > 0) ? item : 0;
                break;
            }
            // is a type pattern with an additional when condition.
            case int n when n > 0:
                sum += n;
                break;
            // is the null pattern.
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
Console.WriteLine(item);
item = 24;
Console.WriteLine(matrix[4, 2]);
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

// Named arguments can be supplied for the parameters in any order.
PrintOrderDetails(orderNum: 31, productName: "Red Mug", sellerName: "Gift Shop");
PrintOrderDetails(productName: "Red Mug", sellerName: "Gift Shop", orderNum: 31);

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

## Indexing `fixed` fields does not require pinning
## You can reassign ref local variables.
## You can use initializers on stackalloc arrays.
## You can use fixed statements with any type that supports a pattern.
## You can use additional generic constraints.

The following enhancements were made to existing features:

## You can test == and != with tuple types.
## You can use expression variables in more locations.
## You may attach attributes to the backing field of auto-implemented properties.
## Method resolution when arguments differ by in has been improved.
## Overload resolution now has fewer ambiguous cases.

