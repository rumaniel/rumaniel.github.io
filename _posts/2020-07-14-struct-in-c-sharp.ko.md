---
layout: post
title: "Struct in C#"
description: C++와 C#에서의 struct 차이점과 Unity Vector2 사례 분석
image: /assets/idewithnotebook.webp
date: 2020-07-14 18:20:11 +0900
tags: [c#, struct, unity]
categories: [unity]
lang: ko
permalink: /struct-in-c-sharp/
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
| 메모리 위치 | 힙 또는 스택 | 스택 (또는 인라인) |
| 기본 생성자 | 컴파일러 생성 | 명시적 정의 필요 |
| 소멸자 | 자동 호출 불가 | 명시적 정의 불가능 |

---

## 주요 차이점 상세 설명

### 1. 메모리 관리
**C++**: struct 인스턴스는 선언 위치에 따라 스택 또는 힙에 할당됩니다.

**C#**: struct는 항상 스택에 할당되며(참조 타입을 포함하는 경우 제외), 큰 struct는 스택 오버플로우를 유발할 수 있습니다.

### 2. 복사 동작
**C++**: 포인터나 참조를 통해 효율적으로 전달 가능합니다.

**C#**: struct를 함수에 전달하거나 변수에 할당할 때마다 **전체 복사**가 발생합니다.

```csharp
struct Point
{
    public int X, Y;
}

void ModifyPoint(Point p)
{
    p.X = 10;  // 원본에 영향 없음 (복사본 수정)
}

// 해결책: ref 사용
void ModifyPoint(ref Point p)
{
    p.X = 10;  // 원본 수정됨
}
```

### 3. 컬렉션 사용
**C++**: struct 포인터를 컬렉션에 저장 가능합니다.

**C#**: struct를 컬렉션에 넣을 때마다 boxing이 발생합니다.

```csharp
List<Point> points = new List<Point>();
points.Add(new Point { X = 1, Y = 2 });  // 복사 발생
```

---

## Unity에서의 Vector2 사례

Unity의 `Vector2`, `Vector3`, `Quaternion` 등은 모두 struct입니다.

```csharp
Vector2 position = transform.position;  // 복사 발생
position.x = 5;  // transform.position는 변경되지 않음!

// 올바른 방법
transform.position = new Vector2(5, position.y);
```

---

## 언제 struct를 사용해야 할까?

### ✅ 적합한 경우
- 작고 불변적인 데이터 (좌표, 색상, 시간 등)
- 짧은 수명을 가진 로컬 변수
- 성능이 중요한 계산 로직
- GC pressure를 줄이고 싶을 때

### ❌ 부적합한 경우
- 큰 데이터 구조 (플레이어, 아이템, 레벨 데이터)
- 자주 변경되는 데이터
- 컬렉션에 자주 추가/제거되는 객체
- 상속이 필요한 경우

---

## 성능 팁

1. **GC Pressure 감소**: struct는 GC heap이 아닌 스택에 할당되므로 가비지 컬렉션 부담을 줄입니다.
2. **배열 접근 최적화**: struct 배열은 메모리에 연속적으로 배치되어 캐시 효율이 좋습니다.
3. **복사 비용 주의**: 큰 struct를 자주 복사하면 성능이 저하될 수 있습니다.

```csharp
// 나쁜 예: 큰 struct를 계속 복사
struct LargeData { public int[] data; }  // 배열 자체는 참조!

// 좋은 예: class 사용
class LargeData { public int[] data; }  // 참조만 복사됨
```

---

## 결론
C++에서 넘어온 개발자라면 C#의 struct를 단순히 "작은 클래스"로 오해하기 쉽습니다. 하지만 실제로는 **값 타입**으로서의 의미가 명확하며, 복사 동작과 boxing을 항상 염두에 두고 사용해야 합니다.

Unity에서 Vector2를 다룰 때도 이러한 특성을 이해하고 있어야 예기치 못한 버그를 피하고 성능을 최적화할 수 있습니다.

🎯 요약: C#의 struct는 작고 불변인 데이터에 적합하며, 복사와 boxing 동작을 항상 염두에 두고 사용해야 합니다.

---

## 참고 자료
- [Microsoft Docs - Struct](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct)
- [Choosing between class and struct](https://learn.microsoft.com/ko-kr/dotnet/standard/design-guidelines/choosing-between-class-and-struct)
- [Unity Vector2 Source](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector2.cs)
- [Stack Overflow - Cannot modify return value](https://stackoverflow.com/questions/1747654/error-cannot-modify-the-return-value-c-sharp)
- [Stack Overflow - Is struct ever boxed?](https://stackoverflow.com/questions/3742922/is-a-c-sharp-struct-ever-boxed-when-declared-as-the-return-value-of-a-function)
