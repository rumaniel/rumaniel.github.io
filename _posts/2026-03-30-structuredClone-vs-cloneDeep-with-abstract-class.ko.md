---
layout: post
title: "structuredClone vs lodash.cloneDeep: Abstract Class 인스턴스 복사 시 주의할 점"
description: TypeScript에서 abstract class를 상속한 인스턴스를 deep copy할 때 structuredClone과 lodash.cloneDeep의 동작 차이 분석
image: /assets/coding.jpg
date: 2026-03-30 11:00:00 +0900
tags: [typescript, javascript, lodash, web-api]
categories: [frontend]
lang: ko
permalink: /structuredClone-vs-cloneDeep-with-abstract-class/
---

# structuredClone vs lodash.cloneDeep: Abstract Class 인스턴스 복사 시 주의할 점

TypeScript로 프로젝트를 하다 보면 abstract class를 상속한 인스턴스를 깊은 복사(deep copy)해야 할 때가 있다. 이때 네이티브 Web API인 `structuredClone`과 lodash의 `_.cloneDeep`을 비교해보았는데, **동작이 완전히 다르다**는 것을 발견했다.

---

## 문제 상황

```typescript
abstract class BaseEntity {
  constructor(public id: string) {}
  
  abstract getDescription(): string;
}

class User extends BaseEntity {
  constructor(
    id: string,
    public name: string,
    public email: string
  ) {
    super(id);
  }

  getDescription(): string {
    return `User: ${this.name} (${this.email})`;
  }
}

const originalUser = new User('1', 'Kim', 'kim@example.com');
```

이런 상황에서 `originalUser`를 깊은 복사하려고 한다.

---

## 실험 1: structuredClone

```typescript
const clonedWithStructured = structuredClone(originalUser);

console.log(clonedWithStructured instanceof User);  // false ❌
console.log(clonedWithStructured.constructor.name); // "Object" ❌
console.log(clonedWithStructured.getDescription);   // undefined ❌
```

**결과:** `structuredClone`은 class의 prototype을 잃어버리고 일반 `Object`로 변환된다.

---

## 실험 2: lodash.cloneDeep

```typescript
import _ from 'lodash';

const clonedWithLodash = _.cloneDeep(originalUser);

console.log(clonedWithLodash instanceof User);  // true ✅
console.log(clonedWithLodash.constructor.name); // "User" ✅
console.log(clonedWithLodash.getDescription()); // "User: Kim (kim@example.com)" ✅
```

**결과:** `_.cloneDeep`은 class의 prototype을 유지하며 정상적으로 복사된다.

---

## 왜 이런 차이가 발생할까?

### structuredClone의 제약

`structuredClone`은 [Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)을 따른다. 이 알고리즘은 **특정 타입만 지원**하며, 커스텀 class는 지원하지 않는다.

**지원하는 타입:**
- Array, Object (plain)
- Date, RegExp, Map, Set
- ArrayBuffer, TypedArray
- Blob, File, FileList
- ImageData 등

**지원하지 않는 타입:**
- Function
- DOM Nodes
- **커스텀 Class 인스턴스의 prototype 정보**

따라서 class 인스턴스를 복사하면 **prototype chain이 끊어지고** plain object가 된다.

### lodash.cloneDeep의 동작

lodash는 JavaScript 런타임에서 동작하며, **객체의 constructor를 참조**해서 새 인스턴스를 생성한다. 이때 prototype 정보가 유지된다.

```javascript
// lodash 내부 단순화 로직
function cloneDeep(value) {
  if (isObject(value)) {
    const Ctor = value.constructor;
    const result = new Ctor();
    // 프로퍼티 복사...
    return result;
  }
  return value;
}
```

---

## Copy Constructor 패턴

이전 프로젝트에서는 **copy constructor** 패턴을 사용해서 이 문제를 회피했다.

```typescript
class User extends BaseEntity {
  constructor(
    id: string,
    public name: string,
    public email: string
  ) {
    super(id);
  }

  // Copy constructor
  static from(other: User): User {
    return new User(other.id, other.name, other.email);
  }

  clone(): User {
    return User.from(this);
  }
}

const copied = originalUser.clone();
console.log(copied instanceof User); // true ✅
```

이 방식은 명시적이고 안전하지만, 모든 class에 구현해야 하는 번거로움이 있다.

---

## 권장사항

| 상황 | 권장 방법 |
|------|----------|
| Plain object 복사 | `structuredClone` ✅ |
| Class 인스턴스 복사 | `_.cloneDeep` 또는 copy constructor |
| Web Worker 간 데이터 전송 | `structuredClone` (직렬화 가능한 타입만) |
| 성능이 중요한 경우 | `structuredClone` (네이티브라 빠름) |

---

## 요약

- `structuredClone`은 **커스텀 class의 prototype을 보존하지 않는다**.
- `_.cloneDeep`은 **class 인스턴스를 올바르게 복사**한다.
- TypeScript abstract class를 다룰 때는 어떤 복사 방법을 쓸지 명확히 하자.
- 안전하게 가려면 **copy constructor** 패턴을 고려하자.

> 💡 **TL;DR**: Class 인스턴스 deep copy가 필요하면 `lodash.cloneDeep`을 쓰자. `structuredClone`은 prototype을 잃어버린다.

---

## 참고 자료
- [MDN - structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [MDN - Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [Lodash - cloneDeep](https://lodash.com/docs/4.17.15#cloneDeep)
- [Stack Overflow - Why does structuredClone lose class prototype?](https://stackoverflow.com/questions/73953087/why-does-structuredclone-lose-class-prototype)
