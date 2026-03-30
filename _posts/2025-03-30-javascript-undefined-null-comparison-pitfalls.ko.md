---
layout: post
title: "JavaScript undefined vs null: 빈 값 비교 시 주의할 점"
description: JavaScript에서 undefined와 null의 차이점과 비교 연산자 사용 시 발생할 수 있는 의도치 않은 동작
image: /assets/coding.jpg
date: 2025-03-30 21:00:00 +0900
tags: [javascript, types, best-practices]
categories: [frontend]
lang: ko
permalink: /javascript-undefined-null-comparison-pitfalls/
---

# JavaScript undefined vs null: 빈 값 비교 시 주의할 점

JavaScript에서 "빈 값"을 나타내는 두 가지 타입 `undefined`와 `null`. 비슷해 보이지만 **완전히 다르다**. 특히 비교 연산자를 사용할 때 의도치 않은 동작이 발생할 수 있어 주의가 필요하다.

---

## 기본 개념

### undefined
- **선언되었지만 값이 할당되지 않음**
- 변수가 존재하지만 초기화되지 않은 상태
- 함수가 값을 반환하지 않을 때 기본 반환값

```javascript
let x;
console.log(x);           // undefined
console.log(typeof x);    // 'undefined'

function foo() {}
console.log(foo());       // undefined
```

### null
- **의도적으로 "없음"을 나타내는 값**
- 개발자가 명시적으로 할당
- 객체가 없음을 표현

```javascript
let y = null;
console.log(y);           // null
console.log(typeof y);    // 'object' (⚠️ JavaScript의 유명한 버그)
```

---

## 핵심: typeof 연산자의 함정

```javascript
console.log(typeof undefined);  // 'undefined' ✅
console.log(typeof null);       // 'object' ❌ (버그지만 수정 불가)
```

`typeof null`이 `'object'`를 반환하는 것은 **JavaScript의 첫 번째 버전에서의 실수**다. 하위 호환성 때문에 수정할 수 없다.

### 실제 문제 상황

```javascript
function processData(data) {
  if (typeof data === 'object') {
    // data가 객체라고 가정하고 프로퍼티 접근
    console.log(data.name);  // TypeError: Cannot read property 'name' of null
  }
}

processData(null);  // 의도치 않은 동작!
```

**해결책:**

```javascript
function processData(data) {
  if (data && typeof data === 'object') {
    console.log(data.name);  // 안전
  }
}

processData(null);  // 문제 없음
```

---

## 동등 비교 연산자의 함정

### == (느슨한 비교)

```javascript
console.log(null == undefined);   // true ⚠️
console.log(null == 0);           // false
console.log(undefined == 0);      // false
console.log(null == '');          // false
console.log(undefined == '');     // false
```

`==`는 타입 변환을 수행하며, `null`과 `undefined`를 같다고 처리한다.

### === (엄격한 비교)

```javascript
console.log(null === undefined);  // false ✅
console.log(null === null);       // true
console.log(undefined === undefined);  // true
```

`===`는 타입까지 확인하므로 더 안전하다.

---

## 실제 문제 상황

### 1. API 응답 처리

```javascript
// ❌ 잘못된 방법
function getUserName(user) {
  if (user.name != null) {
    return user.name;
  }
  return 'Unknown';
}

// null과 undefined를 모두 체크하지만 의도가 불분명
```

```javascript
// ✅ 명확한 방법
function getUserName(user) {
  if (user.name !== undefined && user.name !== null) {
    return user.name;
  }
  return 'Unknown';
}

// 또는 더 간단하게
function getUserName(user) {
  return user.name ?? 'Unknown';  // nullish coalescing
}
```

### 2. 선택적 매개변수

```javascript
// ❌ 잘못된 방법
function greet(name) {
  if (name == undefined) {
    name = 'Guest';
  }
  return `Hello, ${name}!`;
}

greet(null);  // "Hello, null!" (의도치 않은 결과)
```

```javascript
// ✅ 올바른 방법
function greet(name = 'Guest') {
  return `Hello, ${name}!`;
}

greet();          // "Hello, Guest!"
greet(undefined); // "Hello, Guest!"
greet(null);      // "Hello, null!" (명시적 null은 유지됨)
```

### 3. 객체 프로퍼티 확인

```javascript
const obj = { a: null, b: undefined };

// ❌ 잘못된 방법
if (obj.a) {
  console.log('a exists');  // 실행되지 않음
}

if (obj.b) {
  console.log('b exists');  // 실행되지 않음
}

// ✅ 프로퍼티 존재 확인
if ('a' in obj) {
  console.log('a exists');  // 실행됨
}

if (obj.hasOwnProperty('b')) {
  console.log('b exists');  // 실행됨
}
```

---

## 빈 값 체크 패턴

### 1. null 또는 undefined 체크

```javascript
// 방법 1: 엄격한 비교
if (value === null || value === undefined) {
  // 빈 값 처리
}

// 방법 2: 느슨한 비교 (간단하지만 의도가 불분명)
if (value == null) {
  // null 또는 undefined
}

// 방법 3: nullish coalescing (ES2020+)
const result = value ?? 'default';
```

### 2. "falsy" 값 체크

```javascript
// 0, '', null, undefined, NaN, false 모두 포함
if (!value) {
  // 빈 값 처리
}

// 주의: 0과 ''도 빈 값으로 처리됨
```

### 3. 명시적 체크 함수

```javascript
function isEmpty(value) {
  return value === null || value === undefined;
}

function isNullOrBlank(value) {
  return value === null || value === undefined || value === '';
}

// 사용
if (isEmpty(user.name)) {
  console.log('Name is missing');
}
```

---

## 권장사항

| 상황 | 권장 방법 |
|------|----------|
| null/undefined 체크 | `===` 또는 `??` |
| 선택적 매개변수 | 기본 매개변수 `param = default` |
| 객체 프로퍼티 존재 확인 | `'key' in obj` 또는 `hasOwnProperty` |
| "falsy" 값 체크 | `!value` (0, '', NaN 주의) |
| 타입 확인 | `typeof` 후 null 체크 추가 |

---

## 요약

- `typeof null`은 `'object'`를 반환 (버그)
- `typeof undefined`은 `'undefined'`를 반환
- `null === undefined`는 `false` (서로 다른 타입)
- `null == undefined`는 `true` (느슨한 비교)
- **항상 `===`를 사용**하자
- 빈 값 체크는 명시적으로 하자

> 💡 **TL;DR**: `undefined`는 선언됨 + 할당 안됨, `null`은 의도적 빈 값. 비교 시 `===`를 사용하고, `typeof null === 'object'` 버그를 기억하자.

---

## 참고 자료
- [Stack Overflow - Standard function to check for null/undefined/blank](https://stackoverflow.com/questions/5515310/is-there-a-standard-function-to-check-for-null-undefined-or-blank-variables-in)
- [Stack Overflow - How to check for undefined in JavaScript](https://stackoverflow.com/questions/3390396/how-can-i-check-for-undefined-in-javascript)
- [MDN - null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)
- [MDN - undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
