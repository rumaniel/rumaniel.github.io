---
layout: post
title: "Unity 버전별 C# 지원과 C# 8, 9 핵심 문법 정리"
description: Unity 2020.2부터 Unity 6까지 버전별 C# 언어 지원 범위와, Unity에서 쓸 수 있는 C# 8, 9 문법을 예제와 함께 정리합니다.
image: /assets/coding.jpg
date: 2026-10-26 12:00:00 +0900
tags: [C#]
categories: [unity]
lang: ko
permalink: /unity-csharp-8-and-9/
---

[Unity 2018.3 버전 이후 사용할 수 있는 C# 스크립팅 소개]({{ site.baseurl }}/the-difference-of-scripting-on-the-unity-2018-3/) 글에서 C# 7.3 까지 정리했었습니다. 그 뒤로 유니티는 2020.2 에서 C# 8, 2021.2 에서 C# 9 를 지원하기 시작했고, Unity 6 까지 C# 9 와 .NET Standard 2.1 을 유지하고 있습니다.

2026년에는 유니티 스크립팅 런타임이 Mono 에서 CoreCLR 로 바뀝니다. 하지만 [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279) 기준으로 **언어 버전은 여전히 C# 9 / .NET Standard 2.1** 입니다. 그래서 지금 시점에 유니티에서 쓸 수 있는 최신 문법은 C# 8, 9 이고, 이 글에서는 이 두 버전의 문법을 정리합니다. CoreCLR 전환에 따른 마이그레이션은 [Unity CoreCLR 전환 대비 마이그레이션 체크리스트]({{ site.baseurl }}/unity-coreclr-migration/) 에서 다룹니다.

| 구분 | 목차 |
|---|---|
| **[<span class="toc-num">1</span>&nbsp;Unity 버전별 C# 지원](#unity-csharp-versions)** | [<span class="toc-num">1.1</span>&nbsp;사용할 수 없는 기능](#unsupported-features) |
| **[<span class="toc-num">2</span>&nbsp;C#8.0](#c80)** | [<span class="toc-num">2.1</span>&nbsp;Readonly members](#readonly-members)<br>[<span class="toc-num">2.2</span>&nbsp;Default interface methods](#default-interface-methods)<br>[<span class="toc-num">2.3</span>&nbsp;Switch expressions](#switch-expressions)<br>[<span class="toc-num">2.4</span>&nbsp;Property patterns](#property-patterns)<br>[<span class="toc-num">2.5</span>&nbsp;Tuple patterns](#tuple-patterns)<br>[<span class="toc-num">2.6</span>&nbsp;Positional patterns](#positional-patterns)<br>[<span class="toc-num">2.7</span>&nbsp;Using declarations](#using-declarations)<br>[<span class="toc-num">2.8</span>&nbsp;Static local functions](#static-local-functions)<br>[<span class="toc-num">2.9</span>&nbsp;Disposable ref structs](#disposable-ref-structs)<br>[<span class="toc-num">2.10</span>&nbsp;Nullable reference types](#nullable-reference-types)<br>[<span class="toc-num">2.11</span>&nbsp;Asynchronous streams](#asynchronous-streams)<br>[<span class="toc-num">2.12</span>&nbsp;Asynchronous disposable](#asynchronous-disposable)<br>[<span class="toc-num">2.13</span>&nbsp;Indices and ranges](#indices-and-ranges)<br>[<span class="toc-num">2.14</span>&nbsp;Null-coalescing assignment](#null-coalescing-assignment)<br>[<span class="toc-num">2.15</span>&nbsp;Unmanaged constructed types](#unmanaged-constructed-types)<br>[<span class="toc-num">2.16</span>&nbsp;Stackalloc in nested expressions](#stackalloc-in-nested-expressions)<br>[<span class="toc-num">2.17</span>&nbsp;Enhancement of interpolated verbatim strings](#enhancement-of-interpolated-verbatim-strings) |
| **[<span class="toc-num">3</span>&nbsp;C#9.0](#c90)** | [<span class="toc-num">3.1</span>&nbsp;Records](#records)<br>[<span class="toc-num">3.2</span>&nbsp;Init only setters](#init-only-setters)<br>[<span class="toc-num">3.3</span>&nbsp;Top-level statements](#top-level-statements)<br>[<span class="toc-num">3.4</span>&nbsp;Pattern matching enhancements](#pattern-matching-enhancements)<br>[<span class="toc-num">3.5</span>&nbsp;Native sized integers](#native-sized-integers)<br>[<span class="toc-num">3.6</span>&nbsp;Function pointers](#function-pointers)<br>[<span class="toc-num">3.7</span>&nbsp;Suppress emitting localsinit flag](#suppress-emitting-localsinit-flag)<br>[<span class="toc-num">3.8</span>&nbsp;Target-typed new expressions](#target-typed-new-expressions)<br>[<span class="toc-num">3.9</span>&nbsp;Static anonymous functions](#static-anonymous-functions)<br>[<span class="toc-num">3.10</span>&nbsp;Target-typed conditional expressions](#target-typed-conditional-expressions)<br>[<span class="toc-num">3.11</span>&nbsp;Covariant return types](#covariant-return-types)<br>[<span class="toc-num">3.12</span>&nbsp;Extension GetEnumerator support for foreach loops](#extension-getenumerator-support-for-foreach-loops)<br>[<span class="toc-num">3.13</span>&nbsp;Lambda discard parameters](#lambda-discard-parameters)<br>[<span class="toc-num">3.14</span>&nbsp;Attributes on local functions](#attributes-on-local-functions)<br>[<span class="toc-num">3.15</span>&nbsp;Module initializers](#module-initializers)<br>[<span class="toc-num">3.16</span>&nbsp;New features for partial methods](#new-features-for-partial-methods) |
{: .toc-table #toc}

---
# Unity 버전별 C# 지원 {#unity-csharp-versions}

| Unity 버전 | C# 버전 | API 호환 수준 | 비고 |
|---|---|---|---|
| 2017.1 | C# 6 | .NET 4.x (실험적) | Roslyn 컴파일러 도입 |
| 2018.3 | C# 7.3 | .NET Standard 2.0 / .NET 4.x | [이전 글]({{ site.baseurl }}/the-difference-of-scripting-on-the-unity-2018-3/) |
| 2020.2 ~ 2021.1 | C# 8.0 | .NET Standard 2.0 / .NET 4.x | 일부 C# 8 기능 미지원 |
| 2021.2 ~ Unity 6 | C# 9.0 | .NET Standard 2.1 / .NET Framework 4.8 | C# 8 전체 지원, 일부 C# 9 기능 미지원 |
| Unity 6.8 / 7.0 (CoreCLR) | C# 9.0 | .NET Standard 2.1 | 런타임만 CoreCLR 로 교체, 7.0 에서 .NET 10 기반 BCL |

2021.2 에서 유니티에 포함된 Mono 가 업그레이드되고 .NET Standard 2.1 API 가 추가되면서, 그 전까지 막혀 있던 C# 8 기능들도 모두 사용 가능해졌습니다.

## 사용할 수 없는 기능 {#unsupported-features}
아래 기능은 사용하면 컴파일 에러가 납니다.

* **2020.2 ~ 2021.1 (C# 8)** : Default interface methods, Indices and ranges, Asynchronous streams, Asynchronous disposable. 런타임이나 .NET Standard 2.1 의 타입이 필요한 기능들입니다.
* **2021.2 이후 (C# 9)** : Init only setters, Covariant return types, Module initializers, Suppress emitting localsinit flag, 함수 포인터의 확장 호출 규약(extensible calling conventions).

Records 와 Init only setters 는 `IsExternalInit` 타입을 직접 선언하면 사용 할 수 있습니다. 자세한 내용은 [Records](#records) 에서 다룹니다.

---
# C#8.0
## Readonly members
구조체의 메서드나 프로퍼티에 `readonly` 를 붙여 구조체의 상태를 바꾸지 않는다고 표시 할 수 있습니다. 컴파일러가 수정 여부를 체크해 주고, `in` 파라미터나 `readonly` 필드에서 호출할 때 방어적 복사를 줄여 줍니다.

```csharp
public struct Stat
{
    public int Base;
    public int Bonus;

    // 상태를 바꾸지 않는 멤버
    public readonly int Total => Base + Bonus;

    public readonly override string ToString() => $"{Total} ({Base} + {Bonus})";

    public void AddBonus(int value) => Bonus += value;

    // public readonly void Reset() => Bonus = 0; // 컴파일 에러
}
```

## Default interface methods
인터페이스에 메서드의 기본 구현을 넣을 수 있습니다. 이미 여러 클래스가 구현한 인터페이스에 새 메서드를 추가해도, 기존 클래스를 고치지 않아도 됩니다. **2021.2 부터** 사용 가능합니다.

```csharp
public interface IDamageable
{
    int Health { get; }
    void TakeDamage(int amount);

    // 기본 구현
    bool IsDead => Health <= 0;
    void Kill() => TakeDamage(Health);
}

public class Enemy : MonoBehaviour, IDamageable
{
    public int Health { get; private set; } = 100;
    public void TakeDamage(int amount) => Health -= amount;
}

IDamageable target = enemy;
target.Kill();             // 인터페이스 타입으로만 호출
Debug.Log(target.IsDead);  // true
// enemy.Kill();           // 컴파일 에러 : 클래스에 Kill 없음
```

## Switch expressions
`switch` 를 문(statement)이 아닌 식(expression)으로 쓸 수 있습니다. `case`, `break` 없이 값을 바로 리턴해서 훨씬 짧아집니다.

```csharp
public enum Rarity { Common, Rare, Epic, Legendary }

// C#7.3
Color GetColor(Rarity rarity)
{
    switch (rarity)
    {
        case Rarity.Common: return Color.white;
        case Rarity.Rare: return Color.blue;
        case Rarity.Epic: return Color.magenta;
        default: return Color.yellow;
    }
}

// C#8.0
Color GetColor(Rarity rarity) => rarity switch
{
    Rarity.Common => Color.white,
    Rarity.Rare => Color.blue,
    Rarity.Epic => Color.magenta,
    _ => Color.yellow,
};
```

`_` 는 `default` 와 같습니다. 모든 경우를 처리하지 않으면 컴파일러가 경고를 줍니다.

## Property patterns
객체의 프로퍼티 값으로 패턴 매칭을 할 수 있습니다. `{ }` 는 "null 이 아님" 을 뜻합니다.

```csharp
string Describe(Collider other) => other switch
{
    { isTrigger: true } => "트리거",
    { attachedRigidbody: { isKinematic: true } } => "키네마틱 바디",
    { attachedRigidbody: { } } => "리지드바디",
    _ => "정적 콜라이더",
};
```

**유니티 주의사항** : 패턴의 null 검사(`{ }`, `null`)는 유니티가 재정의한 `== null` 을 거치지 않습니다. `Destroy` 된 오브젝트도 null 이 아닌 것으로 판단하므로, 파괴됐을 수 있는 오브젝트는 `!= null` 로 먼저 체크하세요.

## Tuple patterns
여러 값을 튜플로 묶어서 한 번에 매칭 할 수 있습니다. 두 개 이상의 상태 조합을 다룰 때 유용합니다.

```csharp
public enum Hand { Rock, Paper, Scissors }

string Play(Hand me, Hand other) => (me, other) switch
{
    (Hand.Rock, Hand.Scissors) => "Win",
    (Hand.Paper, Hand.Rock) => "Win",
    (Hand.Scissors, Hand.Paper) => "Win",
    _ when me == other => "Draw",
    _ => "Lose",
};
```

## Positional patterns
`Deconstruct` 메서드가 있는 타입은 위치(순서)로 분해해서 매칭 할 수 있습니다. 확장 메서드로 만든 `Deconstruct` 도 사용 할 수 있습니다.

```csharp
public static class VectorExtensions
{
    public static void Deconstruct(this Vector2 v, out float x, out float y)
    {
        x = v.x;
        y = v.y;
    }
}

string GetDirection(Vector2 input) => input switch
{
    (0, 0) => "Idle",
    (0, > 0) => "Up",
    (0, < 0) => "Down",
    (> 0, _) => "Right",
    _ => "Left",
};
```

`> 0` 같은 관계 패턴은 C# 9 문법입니다. 위 예제는 2021.2 이상에서 컴파일됩니다.

## Using declarations
`using` 뒤에 블록을 쓰지 않고 변수 선언으로 쓸 수 있습니다. 변수가 속한 스코프가 끝날 때 `Dispose` 가 호출되어 중첩이 줄어듭니다.

```csharp
// C#7.3
void Save(string path, string json)
{
    using (var stream = File.OpenWrite(path))
    {
        using (var writer = new StreamWriter(stream))
        {
            writer.Write(json);
        }
    }
}

// C#8.0
void Save(string path, string json)
{
    using var stream = File.OpenWrite(path);
    using var writer = new StreamWriter(stream);
    writer.Write(json);
} // writer, stream 순서로 Dispose
```

## Static local functions
로컬 함수에 `static` 을 붙이면 바깥 변수를 캡처 할 수 없습니다. 실수로 캡처해서 생기는 할당이나 버그를 컴파일 단계에서 막아 줍니다.

```csharp
int CalculateScore(int kills, int deaths)
{
    int bonus = 100;
    return Score(kills, deaths);

    static int Score(int k, int d) => k * 10 - d * 5;
    // static int Score2(int k) => k * bonus; // 컴파일 에러 : bonus 캡처 불가
}
```

## Disposable ref structs
`ref struct` 는 인터페이스를 구현 할 수 없어서 `IDisposable` 을 붙일 수 없었습니다. 이제 `public void Dispose()` 메서드만 있으면 `using` 에 쓸 수 있습니다.

```csharp
public ref struct ProfilerScope
{
    public ProfilerScope(string name) => UnityEngine.Profiling.Profiler.BeginSample(name);
    public void Dispose() => UnityEngine.Profiling.Profiler.EndSample();
}

void Update()
{
    using var scope = new ProfilerScope("Enemy.Update");
    // 측정할 코드
}
```

## Nullable reference types
참조 타입에도 null 이 될 수 있는지(`string?`) 없는지(`string`)를 표시하고, 컴파일러가 null 위험을 경고해 줍니다. 기본으로 꺼져 있고, 파일 맨 위에 `#nullable enable` 을 쓰거나 `csc.rsp` 에 `-nullable:enable` 을 넣어 켤 수 있습니다.

```csharp
#nullable enable
public class Inventory
{
    private readonly Dictionary<string, Item> items = new Dictionary<string, Item>();

    public Item? Find(string id) => items.TryGetValue(id, out var item) ? item : null;

    public void Use(string id)
    {
        var item = Find(id);
        // item.Use();      // 경고 : null 가능
        if (item != null)
            item.Use();     // OK
    }
}
```

**유니티 주의사항** : 유니티 API 는 nullable 주석이 없고, `[SerializeField]` 필드는 인스펙터에서 할당되기 때문에 컴파일러가 알 수 없어 경고가 많이 납니다. 또 `Destroy` 된 오브젝트는 컴파일러 입장에서 null 이 아닙니다. 유니티 오브젝트보다는 순수 C# 로직 코드에 적용하는 것을 추천합니다.

## Asynchronous streams
`IAsyncEnumerable<T>` 와 `await foreach` 로 값을 비동기로 하나씩 만들고 소비 할 수 있습니다. `async` 메서드 안에서 `yield return` 을 쓸 수 있습니다. **2021.2 부터** 사용 가능합니다.

```csharp
async IAsyncEnumerable<int> CountdownAsync(int from)
{
    for (int i = from; i > 0; i--)
    {
        await Task.Delay(1000);
        yield return i;
    }
}

async void Start()
{
    await foreach (var count in CountdownAsync(3))
        Debug.Log(count); // 3, 2, 1 (1초 간격)
    Debug.Log("Start!");
}
```

## Asynchronous disposable
`IAsyncDisposable` 과 `await using` 으로 비동기 정리 작업을 할 수 있습니다. 파일이나 네트워크 연결을 닫을 때 기다려야 하는 경우에 씁니다. **2021.2 부터** 사용 가능합니다.

```csharp
public class SaveSession : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        await FlushToDiskAsync(); // 남은 데이터 저장
    }
}

async Task SaveAsync()
{
    await using var session = new SaveSession();
    // 저장 작업
} // DisposeAsync 대기
```

## Indices and ranges
`^` 로 뒤에서부터 인덱스를 지정하고, `..` 로 범위를 잘라 낼 수 있습니다. **2021.2 부터** 사용 가능합니다.

```csharp
int[] scores = { 10, 20, 30, 40, 50 };

Debug.Log(scores[^1]);        // 50 (마지막)
Debug.Log(scores[^2]);        // 40

int[] top3 = scores[..3];     // 10, 20, 30
int[] middle = scores[1..^1]; // 20, 30, 40

string fileName = "player_save.json";
string ext = fileName[^4..];  // "json"
```

배열과 `string` 은 범위를 지원하지만, `List<T>` 는 `^1` 같은 인덱스만 되고 `[1..3]` 같은 범위는 컴파일 에러입니다. 배열 범위는 새 배열을 복사해서 만든다는 점도 기억하세요.

## Null-coalescing assignment
`??=` 는 변수가 null 일 때만 값을 할당합니다.

```csharp
private List<Enemy> enemies;

public List<Enemy> Enemies => enemies ??= new List<Enemy>();
```

**유니티 주의사항** : `??=` 도 유니티의 `== null` 재정의를 거치지 않습니다. 아래 코드는 캐시된 컴포넌트가 `Destroy` 된 뒤에도 다시 찾지 않습니다. 유니티 오브젝트는 `if (body == null)` 로 체크하세요.

```csharp
private Rigidbody body;

// 위험 : Destroy 후에도 재조회 안 함
public Rigidbody Body => body ??= GetComponent<Rigidbody>();
```

## Unmanaged constructed types
C# 7.3 의 `unmanaged` 제약에 제네릭 구조체도 들어갈 수 있습니다. 필드가 모두 unmanaged 라면 `Pair<int>` 같은 생성된 제네릭 타입도 unmanaged 로 취급됩니다. `NativeArray<T>` 같은 네이티브 컨테이너에 제네릭 구조체를 넣을 때 유용합니다.

```csharp
public struct Pair<T> where T : unmanaged
{
    public T First;
    public T Second;
}

public static unsafe int SizeOf<T>() where T : unmanaged => sizeof(T);

Debug.Log(SizeOf<Pair<int>>());      // 8
Debug.Log(SizeOf<Pair<Vector3>>());  // 24
```

## Stackalloc in nested expressions
`stackalloc` 의 결과가 `Span<T>` 이면 다른 식 안에서 바로 쓸 수 있습니다. 2021.2 부터는 .NET Standard 2.1 에 `Span<T>` 가 포함되어 `unsafe` 없이 사용 가능합니다.

```csharp
Span<int> numbers = stackalloc[] { 1, 2, 3, 4, 5, 6 };

// 인자 안에서 stackalloc
int index = numbers.IndexOfAny(stackalloc[] { 4, 6 });
Debug.Log(index); // 3
```

## Enhancement of interpolated verbatim strings
보간 문자열과 축자 문자열을 같이 쓸 때 `$@` 순서만 허용되던 것이 `@$` 도 허용됩니다.

```csharp
string path = $@"C:\Saves\{slot}.json"; // C#7.3 부터 가능
string path2 = @$"C:\Saves\{slot}.json"; // C#8.0 부터 가능
```

---
# C#9.0
## Records
`record` 는 값 기반의 동등성(equality)을 가진 불변 데이터 타입입니다. 생성자, 프로퍼티, `Equals`, `GetHashCode`, `ToString`, 분해(`Deconstruct`)를 컴파일러가 만들어 줍니다. `with` 식으로 일부 값만 바꾼 복사본을 만들 수 있습니다.

```csharp
public record ItemData(string Id, string Name, int Price);

var potion = new ItemData("potion", "Potion", 100);
var sale = potion with { Price = 50 };  // Price 만 바꾼 복사본

Debug.Log(potion == new ItemData("potion", "Potion", 100)); // true (값 비교)
Debug.Log(sale); // ItemData { Id = potion, Name = Potion, Price = 50 }
```

**유니티에서 쓰려면** : 레코드는 내부적으로 init 전용 setter 를 쓰는데, 여기에 필요한 `IsExternalInit` 타입이 .NET 5 이후에만 있어서 그대로 쓰면 컴파일 에러가 납니다. 프로젝트에 아래 코드를 추가하면 됩니다.

```csharp
namespace System.Runtime.CompilerServices
{
    internal static class IsExternalInit { }
}
```

레코드는 유니티 직렬화를 지원하지 않습니다. 인스펙터에 보여야 하는 데이터가 아니라, 이벤트 메시지나 서버 응답 같은 런타임 데이터에 쓰세요.

## Init only setters
`set` 대신 `init` 을 쓰면 객체 초기화 시점에만 값을 넣을 수 있고, 그 뒤로는 읽기 전용이 됩니다. 유니티 문서에는 미지원으로 되어 있지만, [Records](#records) 와 같은 `IsExternalInit` 선언을 추가하면 사용 할 수 있습니다.

```csharp
public class SpawnRequest
{
    public string PrefabId { get; init; }
    public Vector3 Position { get; init; }
}

var request = new SpawnRequest { PrefabId = "slime", Position = Vector3.zero };
// request.PrefabId = "bat"; // 컴파일 에러 : 초기화 이후 수정 불가
```

## Top-level statements
`Main` 메서드와 클래스 선언 없이 파일 맨 위에 바로 코드를 쓸 수 있습니다. 유니티 스크립트에는 진입점이 없으므로 쓸 일이 없지만, 유니티와 별도로 도는 콘솔 툴을 만들 때 편합니다.

```csharp
// Program.cs 전체
using System;

Console.WriteLine("Asset converter start");
foreach (var file in args)
    Console.WriteLine(file);
```

## Pattern matching enhancements
패턴에 관계 연산자(`<`, `>`, `<=`, `>=`)와 논리 연산자(`and`, `or`, `not`)를 쓸 수 있습니다. 괄호로 묶을 수도 있습니다.

```csharp
string GetGrade(int damage) => damage switch
{
    < 0 => throw new ArgumentOutOfRangeException(nameof(damage)),
    0 => "Miss",
    > 0 and < 50 => "Normal",
    >= 50 and < 100 => "Strong",
    _ => "Critical",
};

bool IsVowel(char c) => c is 'a' or 'e' or 'i' or 'o' or 'u';

if (item is not null)
    item.Use();
```

**유니티 주의사항** : `is not null` 과 `is null` 도 유니티의 `== null` 재정의를 거치지 않습니다. 유니티 오브젝트에는 `!= null` 을 쓰세요.

## Native sized integers
`nint`, `nuint` 는 플랫폼에 따라 32비트 또는 64비트가 되는 정수 타입입니다. 네이티브 플러그인과 포인터 크기 값을 주고받을 때 씁니다.

```csharp
nint size = IntPtr.Size;     // 64비트 플랫폼에서 8
nint offset = 16;
nint next = size + offset;   // IntPtr 과 달리 산술 연산 가능
```

## Function pointers
`delegate*` 로 함수 포인터를 선언하고 호출 할 수 있습니다. 델리게이트 객체를 만들지 않아 할당과 호출 비용이 적습니다. `unsafe` 코드가 필요하고, `unmanaged[Cdecl]` 같은 확장 호출 규약은 지원하지 않습니다.

```csharp
public static unsafe class MathOps
{
    static int Add(int a, int b) => a + b;

    public static void Run()
    {
        delegate*<int, int, int> op = &Add; // static 메서드만 가능
        Debug.Log(op(1, 2)); // 3
    }
}
```

## Suppress emitting localsinit flag
`[SkipLocalsInit]` 로 지역 변수를 0으로 초기화하는 작업을 생략해 성능을 높이는 기능입니다. **유니티에서는 지원하지 않습니다.**

```csharp
[System.Runtime.CompilerServices.SkipLocalsInit] // 유니티에서는 컴파일 에러
static void Fill() { /* ... */ }
```

## Target-typed new expressions
타입을 알 수 있으면 `new` 뒤의 타입 이름을 생략 할 수 있습니다. 긴 제네릭 타입 선언이 훨씬 짧아집니다.

```csharp
// C#8.0
private Dictionary<string, List<Enemy>> enemiesByZone = new Dictionary<string, List<Enemy>>();
Vector3 offset = new Vector3(0, 1, 0);

// C#9.0
private Dictionary<string, List<Enemy>> enemiesByZone = new();
Vector3 offset = new(0, 1, 0);
```

## Static anonymous functions
람다에 `static` 을 붙이면 바깥 변수를 캡처 할 수 없습니다. 캡처가 없는 람다는 델리게이트를 캐시해서 재사용하므로, `Update` 처럼 자주 불리는 곳에서 할당을 막는 데 유용합니다.

```csharp
int threshold = 10;

var weak = enemies.Where(static e => e.Health < 10);
// var weak2 = enemies.Where(static e => e.Health < threshold); // 컴파일 에러 : 캡처 불가
```

## Target-typed conditional expressions
조건 연산자 `?:` 의 두 결과 타입이 달라도, 받는 쪽 타입으로 변환 할 수 있으면 컴파일됩니다.

```csharp
// C#8.0 : (int?)null 캐스팅 필요
int? bonus = isCritical ? 100 : null;

IEnumerable<int> values = useDefault ? new List<int> { 1, 2 } : new int[0];
```

## Covariant return types
상속받은 메서드를 override 할 때 더 구체적인 타입을 리턴 할 수 있는 기능입니다. **유니티에서는 지원하지 않습니다.**

```csharp
public abstract class Weapon
{
    public abstract Weapon Clone();
}

public class Sword : Weapon
{
    public override Sword Clone() => new Sword(); // 유니티에서는 컴파일 에러
}
```

## Extension GetEnumerator support for foreach loops
`foreach` 가 확장 메서드로 만든 `GetEnumerator` 도 인식합니다. 직접 수정 할 수 없는 타입도 `foreach` 로 돌 수 있게 만들 수 있습니다.

```csharp
public static class RangeExtensions
{
    public static IEnumerator<int> GetEnumerator(this Range range)
    {
        for (int i = range.Start.Value; i < range.End.Value; i++)
            yield return i;
    }
}

foreach (var i in 0..5)
    Debug.Log(i); // 0, 1, 2, 3, 4
```

## Lambda discard parameters
쓰지 않는 람다 파라미터를 `_` 로 버릴 수 있습니다. 이벤트 핸들러에서 파라미터가 필요 없을 때 깔끔합니다.

```csharp
// C#8.0
SceneManager.sceneLoaded += (scene, mode) => Debug.Log("Loaded");

// C#9.0
SceneManager.sceneLoaded += (_, _) => Debug.Log("Loaded");
```

## Attributes on local functions
로컬 함수에도 어트리뷰트를 붙일 수 있습니다.

```csharp
float Evaluate(float t)
{
    return Ease(t) * 2f;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    static float Ease(float x) => x * x * (3f - 2f * x);
}
```

## Module initializers
`[ModuleInitializer]` 로 어셈블리가 로드될 때 한 번 실행되는 메서드를 만드는 기능입니다. **유니티에서는 지원하지 않습니다.** 대신 유니티의 초기화 어트리뷰트를 쓰세요.

```csharp
// 유니티에서는 컴파일 에러
[System.Runtime.CompilerServices.ModuleInitializer]
internal static void Init() { }

// 유니티 대안
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void InitRuntime() { }

#if UNITY_EDITOR
[UnityEditor.InitializeOnLoadMethod]
static void InitEditor() { }
#endif
```

## New features for partial methods
이전에는 `partial` 메서드가 `void` 리턴만 가능했고 접근 한정자를 쓸 수 없었습니다. 이제 리턴값, `out` 파라미터, 접근 한정자를 쓸 수 있습니다. 대신 이런 partial 메서드는 반드시 구현해야 합니다. 소스 제너레이터가 만든 코드와 직접 쓴 코드를 나눌 때 주로 쓰입니다.

```csharp
// PlayerStats.cs
public partial class PlayerStats
{
    public partial int GetMaxHealth();
}

// PlayerStats.Generated.cs (생성된 코드)
public partial class PlayerStats
{
    public partial int GetMaxHealth() => 100;
}
```

---
참고사이트
* [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279)
* [Unity Manual 6000.7 - C# compiler](https://docs.unity.com/en-us/engine/6000.7/manual/programming-environment/overview-of-dot-net-in-unity/csharp-compiler)
* [Unity Manual 2021.2 - C# compiler](https://docs.unity3d.com/2021.2/Documentation/Manual/CSharpCompiler.html)
* [Unity Manual 2021.1 - C# compiler](https://docs.unity3d.com/2021.1/Documentation/Manual/CSharpCompiler.html)
* [Unity 2021.2 programmer features](https://unity.com/releases/programmer-features/2021-2-tech-tier2-features)
* [What's new in C# 8.0](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-80)
* [What's new in C# 9.0](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
