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


c# 4
Dynamic binding
The major feature was the introduction of the dynamic keyword. The dynamic keyword introduced into C# version 4.0 the ability to override the compiler on compile-time typing. By using the dynamic keyword, you can create constructs similar to dynamically typed languages like JavaScript. You can create a dynamic x = "a string" and then add six to it, leaving it up to the runtime to sort out what should happen next.

Dynamic binding gives you the potential for errors but also great power within the language.

The dynamic type indicates that use of the variable and references to its members bypass compile-time type checking. Instead, these operations are resolved at run time

Dynamic binding
Named/optional arguments
Generic covariant and contravariant
Embedded interop types


c# 5
New keyword async await
Async code can be used for both I/O-bound and CPU-bound code, but differently for each scenario.
Async code uses Task<T> and Task, which are constructs used to model work being done in the background.
The async keyword turns a method into an async method, which allows you to use the await keyword in its body.
When the await keyword is applied, it suspends the calling method and yields control back to its caller until the awaited task is complete.
await can only be used inside an async method.

https://docs.microsoft.com/en-us/dotnet/standard/async-in-depth
https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/index

Caller info attributes
The caller info attribute lets you easily retrieve information about the context in which you're running without resorting to a ton of boilerplate reflection code. It has many uses in diagnostics and logging tasks.

c# 6
https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-6
Read-only auto-properties
Read-only auto-properties provide a more concise syntax to create immutable types. You declare the auto-property with only a get accessor:

Copy
public string FirstName { get; }
public string LastName { get;  }
The FirstName and LastName properties can be set only in the body of the constructor of the same class:

Copy
public Student(string firstName, string lastName)
{
    if (IsNullOrWhiteSpace(lastName))
        throw new ArgumentException(message: "Cannot be blank", paramName: nameof(lastName));
    FirstName = firstName;
    LastName = lastName;
}
Trying to set LastName in another method generates a CS0200 compilation error:

C#

Copy
public class Student
{
    public string LastName { get;  }

    public void ChangeName(string newLastName)
    {
        // Generates CS0200: Property or indexer cannot be assigned to -- it is read only
        LastName = newLastName;
    }
}

Auto-property initializers
Auto-property initializers let you declare the initial value for an auto-property as part of the property declaration.

public ICollection<double> Grades { get; } = new List<double>();
The Grades member is initialized where it's declared. That makes it easier to perform the initialization exactly once. The initialization is part of the property declaration, making it easier to equate the storage allocation with the public interface for Student objects


Expression-bodied function members
Many members that you write are single statements that could be single expressions. Write an expression-bodied member instead. It works for methods and read-only properties. For example, an override of ToString() is often a great candidate:

C#

Copy
public override string ToString() => $"{LastName}, {FirstName}";
You can also use this syntax for read-only properties:

C#

Copy
public string FullName => $"{FirstName} {LastName}";

using static
The using static enhancement enables you to import the static methods of a single class. You specify the class you're using:

using static System.Math;

Null-conditional operators
The null conditional operator makes null checks much easier and fluid. Replace the member access . with ?.:

Copy
var first = person?.FirstName;

String interpolation
With C# 6, the new string interpolation feature enables you to embed expressions in a string. Simply preface the string with $and use expressions between { and } instead of ordinals:
public string FullName => $"{FirstName} {LastName}";

Index initializers
private Dictionary<int, string> webErrors = new Dictionary<int, string>
{
    [404] = "Page not Found",
    [302] = "Page moved, but left a forwarding address.",
    [500] = "The web server can't come out to play today."
};
