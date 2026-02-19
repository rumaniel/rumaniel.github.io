---
layout: post
title: Struct in c#
image: /assets/idewithnotebook.webp
date: 2020-05-21 18:20:11 +0900
tags: [c#, struct, unity]
categories: [unity]
---

# Struct, C++와 C#에서의 차이 그리고 Unity Vector2 사례

## 시작하며
유니티 개발을 하다보면 기존에 C++ 기반의 프로그래머들이 struct를 기존에 사용하던 방법 대로 관성 적으로 사용 하는 사례를 본적이 있습니다. 예를들어 `player` 같은 큰 데이터를 `struct`로 만들어 `Queue`나 `Dictionary` 같은 자료형에 넣어 사용하는 경우를 본 적이 있습니다.  
그때 성능 문제와 예기치 못한 동작을 겪으면서, C++과 C#에서 `struct`가 어떻게 다른지, 그리고 Unity에서 `Vector2` 같은 구조체를 어떻게 다루는지 정리해보고자 합니다.

---

## C++ Struct vs C# Struct

| 항목 | C++ Struct | C# Struct |
|------|------------|-----------|
| 기본 의미 | 클래스와 거의 동일 | 값 타입 (Value Type) |
| 상속 | 가능 | 불가능 (인터페이스만 구현 가능) |
| 메모리 | 참조(포인터) 중심 | 값 자체 복사 |
| 생성자 | 자유롭게 정의 가능 | 모든 필드 초기화 필요, 기본 생성자 제한 |
| 복사 | 얕은 복사 | 깊은 복사 (값 전체 복사) |

> 📌 핵심: C#의 `struct`는 **값 타입**이며, 메서드 호출 시 복사본이 전달됩니다.

---

## UnityEngine.Vector2 예제

Unity의 `Vector2`는 다음과 같이 정의되어 있습니다 ([UnityCsReference](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector2.cs)):

```csharp
public struct Vector2 {
    public float x;
    public float y;

    public Vector2(float x, float y) {
        this.x = x;
        this.y = y;
    }

    public void Normalize() {
        float mag = magnitude;
        if (mag > kEpsilon)
            this = this / mag;
        else
            this = zero;
    }
}
```
### 포인트
struct라서 값 복사가 기본 동작입니다.

Normalize()에서 this = ... 할당이 가능한 이유는 복사본을 수정하는 방식이기 때문입니다.

readonly struct로 선언하면 내부 상태 변경이 불가능해지고, 성능 최적화에 유리합니다.

## 성능 관점에서 Struct 사용 시 주의할 점

1. GC Pressure
struct는 값 타입이라 힙 대신 스택에 저장됩니다.

작은 구조체는 GC 부담을 줄여 성능에 유리하지만, 큰 구조체를 컬렉션에 넣으면 복사 비용이 커져 오히려 성능 저하를 유발할 수 있습니다.

2. Boxing / Unboxing
struct를 object나 인터페이스 타입으로 변환할 때 boxing이 발생합니다.

이는 힙 할당을 유발하고, 이후 다시 값 타입으로 꺼낼 때 unboxing 비용이 추가됩니다.

따라서 struct를 제네릭 컬렉션이나 인터페이스 기반으로 다룰 때는 주의가 필요합니다.

```csharp
public interface IPrintable
{
    void Print();
}

public struct MyStruct : IPrintable
{
    public int value;
    public void Print()
    {
        Console.WriteLine($"Value: {value}");
    }
}

class Program
{
    static void Main()
    {
        IPrintable printable = new MyStruct { value = 42 }; // ⚠️ Boxing 발생
        printable.Print();
    }
}

List<IPrintable> list = new List<IPrintable>();
list.Add(new MyStruct { value = 1 }); // ⚠️ Boxing 발생

```

3. 불변성(Immutable) 권장
struct는 불변으로 설계하는 것이 좋습니다.

값 타입이기 때문에 변경 가능한 상태를 가지면 복사 시 혼란을 초래할 수 있습니다.

Unity의 Vector2처럼 연산 후 새로운 값을 반환하는 방식이 대표적인 패턴입니다.


## 언제 Struct를 써야 할까?
Microsoft의 디자인 가이드라인에 따르면 다음 조건을 만족할 때 struct를 사용하는 것이 적합합니다:

- 인스턴스 크기가 작다 (16바이트 이하)

- 불변(immutable)이다

- 값 의미가 명확하다 (좌표, 색상, 시간 등)

- 자주 생성되거나 컬렉션에 저장되지 않는다

Unity CS Reference의 Vector2, Color, Quaternion 등이 대표적인 예입니다.

## 결론
C++에서 넘어온 개발자라면 C#의 struct를 단순히 "작은 클래스"로 오해하기 쉽습니다.
하지만 실제로는 값 타입으로서의 의미, 복사 동작, 불변성, 성능 최적화 등 다양한 차이점이 존재합니다.

특히 GC pressure와 boxing/unboxing 문제를 이해하고 있어야, 실무에서 큰 데이터를 다룰 때 성능 저하를 피할 수 있습니다.
Unity에서 Vector2를 다룰 때도 이러한 특성을 이해하고 있어야, 예기치 못한 버그를 피하고 성능을 최적화할 수 있습니다.

🎯 요약: C#의 struct는 작고 불변이며 값 의미가 명확한 타입에 적합하며, 복사와 boxing 동작을 항상 염두에 두고 사용해야 합니다.

## 참고 자료
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct
- https://learn.microsoft.com/ko-kr/dotnet/standard/design-guidelines/choosing-between-class-and-struct
- https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector2.cs
