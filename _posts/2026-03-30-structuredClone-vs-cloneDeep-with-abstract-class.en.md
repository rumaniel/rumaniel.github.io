---
layout: post
title: "structuredClone vs lodash.cloneDeep: What Happens with Abstract Class Instances"
description: Analysis of behavioral differences between structuredClone and lodash.cloneDeep when deep copying TypeScript abstract class instances
image: /assets/coding.jpg
date: 2026-03-30 11:00:00 +0900
tags: [typescript, javascript, lodash, web-api]
categories: [frontend]
lang: en
permalink: /structuredClone-vs-cloneDeep-with-abstract-class/
---

# structuredClone vs lodash.cloneDeep: What Happens with Abstract Class Instances

When working with TypeScript, you often need to deep copy instances that extend abstract classes. I compared the native Web API `structuredClone` with lodash's `_.cloneDeep` and discovered they **behave completely differently**.

---

## The Problem

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

Now we need to deep copy `originalUser`.

---

## Experiment 1: structuredClone

```typescript
const clonedWithStructured = structuredClone(originalUser);

console.log(clonedWithStructured instanceof User);  // false ❌
console.log(clonedWithStructured.constructor.name); // "Object" ❌
console.log(clonedWithStructured.getDescription);   // undefined ❌
```

**Result:** `structuredClone` loses the class prototype and converts it to a plain `Object`.

---

## Experiment 2: lodash.cloneDeep

```typescript
import _ from 'lodash';

const clonedWithLodash = _.cloneDeep(originalUser);

console.log(clonedWithLodash instanceof User);  // true ✅
console.log(clonedWithLodash.constructor.name); // "User" ✅
console.log(clonedWithLodash.getDescription()); // "User: Kim (kim@example.com)" ✅
```

**Result:** `_.cloneDeep` preserves the class prototype and copies correctly.

---

## Why Does This Happen?

### structuredClone Limitations

`structuredClone` follows the [Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). This algorithm **only supports specific types** and does not support custom classes.

**Supported types:**
- Array, Object (plain)
- Date, RegExp, Map, Set
- ArrayBuffer, TypedArray
- Blob, File, FileList
- ImageData, etc.

**Unsupported types:**
- Function
- DOM Nodes
- **Custom class instance prototype information**

Therefore, when copying a class instance, the **prototype chain is broken** and it becomes a plain object.

### How lodash.cloneDeep Works

lodash operates at JavaScript runtime and **references the object's constructor** to create a new instance, preserving prototype information.

```javascript
// Simplified lodash internal logic
function cloneDeep(value) {
  if (isObject(value)) {
    const Ctor = value.constructor;
    const result = new Ctor();
    // Copy properties...
    return result;
  }
  return value;
}
```

---

## Copy Constructor Pattern

In previous projects, we used the **copy constructor** pattern to avoid this issue.

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

This approach is explicit and safe, but requires implementation in every class.

---

## Recommendations

| Situation | Recommended Method |
|-----------|-------------------|
| Plain object copying | `structuredClone` ✅ |
| Class instance copying | `_.cloneDeep` or copy constructor |
| Data transfer between Web Workers | `structuredClone` (serializable types only) |
| When performance matters | `structuredClone` (native, faster) |

---

## Summary

- `structuredClone` **does not preserve custom class prototypes**.
- `_.cloneDeep` **correctly copies class instances**.
- Be clear about which copy method to use when dealing with TypeScript abstract classes.
- Consider the **copy constructor pattern** for safety.

> 💡 **TL;DR**: Use `lodash.cloneDeep` when you need to deep copy class instances. `structuredClone` loses the prototype.

---

## References
- [MDN - structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [MDN - Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [Lodash - cloneDeep](https://lodash.com/docs/4.17.15#cloneDeep)
- [Stack Overflow - Why does structuredClone lose class prototype?](https://stackoverflow.com/questions/73953087/why-does-structuredclone-lose-class-prototype)
