---
layout: post
title: "Solving TypeScript Circular Dependencies Runtime Errors"
description: Understanding and fixing runtime errors caused by circular references between abstract classes and subclasses in TypeScript
image: /assets/coding.jpg
date: 2025-03-30 20:00:00 +0900
tags: [typescript, design-pattern, troubleshooting]
categories: [frontend]
lang: en
permalink: /typescript-circular-dependencies-runtime-error/
---

# Solving TypeScript Circular Dependencies Runtime Errors

Sometimes TypeScript projects compile successfully but **fail at runtime**. This frequently happens when an abstract class and its subclass reference each other.

```
TypeError: Object prototype may only be an Object or null: undefined
```

This article explains the cause and solutions for this problem.

---

## The Problem

### Scenario: Base Entity and Specialized Entity

```typescript
// entity.ts
import { SpecialEntity } from './special-entity';

export abstract class Entity {
  constructor(public id: string) {}

  // Method to convert to another Entity
  abstract clone(): Entity;

  // Convert to specialized Entity
  toSpecial(): SpecialEntity {
    return new SpecialEntity(this.id, 'default');
  }
}
```

```typescript
// special-entity.ts
import { Entity } from './entity';

export class SpecialEntity extends Entity {
  constructor(
    id: string,
    public type: string
  ) {
    super(id);
  }

  clone(): Entity {
    return new SpecialEntity(this.id, this.type);
  }
}
```

### Compile Succeeds, Runtime Fails

```bash
$ tsc
# Success! No errors

$ node dist/index.js
TypeError: Object prototype may only be an Object or null: undefined
    at setPrototypeOf (<anonymous>)
    ...
```

---

## Why Does This Happen?

### JavaScript Module Loading Order

1. When `entity.ts` loads, it tries to import `SpecialEntity`
2. When `special-entity.ts` loads, it tries to import `Entity`
3. `extends Entity` executes before `Entity` class is fully loaded
4. Class definition fails with `Entity === undefined`

### Why Doesn't the Compiler Catch This?

The TypeScript compiler only performs **static type checking**. It doesn't verify actual module loading order and runtime behavior.

---

## Solution 1: Lazy Initialization

Defer class references until actual use.

```typescript
// entity.ts
import type { SpecialEntity } from './special-entity';

export abstract class Entity {
  constructor(public id: string) {}

  abstract clone(): Entity;

  // Lazy initialization
  toSpecial(): SpecialEntity {
    // Dynamic import or lazy reference
    const { SpecialEntity } = require('./special-entity');
    return new SpecialEntity(this.id, 'default');
  }
}
```

```typescript
// special-entity.ts
import { Entity } from './entity';

export class SpecialEntity extends Entity {
  constructor(
    id: string,
    public type: string
  ) {
    super(id);
  }

  clone(): Entity {
    return new SpecialEntity(this.id, this.type);
  }
}
```

**Key Point:** `import type` only imports types and doesn't generate runtime code.

---

## Solution 2: Factory Pattern

Separate object creation logic into a dedicated file.

```typescript
// entity.ts
export abstract class Entity {
  constructor(public id: string) {}
  abstract clone(): Entity;
}
```

```typescript
// special-entity.ts
import { Entity } from './entity';

export class SpecialEntity extends Entity {
  constructor(
    id: string,
    public type: string
  ) {
    super(id);
  }

  clone(): Entity {
    return new SpecialEntity(this.id, this.type);
  }
}
```

```typescript
// entity-factory.ts
import { Entity } from './entity';
import { SpecialEntity } from './special-entity';

export class EntityFactory {
  static createSpecial(id: string, type: string): SpecialEntity {
    return new SpecialEntity(id, type);
  }

  static toSpecial(entity: Entity): SpecialEntity {
    return new SpecialEntity(entity.id, 'default');
  }
}
```

**Advantage:** Clean structure without circular references

---

## Solution 3: Interface Segregation

Separate implementation from type definitions.

```typescript
// types.ts
export interface IEntity {
  id: string;
  clone(): IEntity;
  toSpecial(): ISpecialEntity;
}

export interface ISpecialEntity extends IEntity {
  type: string;
}
```

```typescript
// entity.ts
import type { ISpecialEntity } from './types';

export abstract class Entity implements IEntity {
  constructor(public id: string) {}

  abstract clone(): IEntity;

  toSpecial(): ISpecialEntity {
    // Import implementation at runtime
    const { SpecialEntity } = require('./special-entity');
    return new SpecialEntity(this.id, 'default');
  }
}
```

```typescript
// special-entity.ts
import { Entity } from './entity';
import type { ISpecialEntity } from './types';

export class SpecialEntity extends Entity implements ISpecialEntity {
  constructor(
    id: string,
    public type: string
  ) {
    super(id);
  }

  clone(): IEntity {
    return new SpecialEntity(this.id, this.type);
  }
}
```

---

## Solution 4: Dependency Injection

Design to receive dependencies from outside.

```typescript
// entity.ts
export abstract class Entity {
  // Inject conversion function from outside
  static toSpecialFn?: (entity: Entity) => any;

  constructor(public id: string) {}

  abstract clone(): Entity;

  toSpecial(): any {
    if (!Entity.toSpecialFn) {
      throw new Error('toSpecialFn not configured');
    }
    return Entity.toSpecialFn(this);
  }
}
```

```typescript
// special-entity.ts
import { Entity } from './entity';

export class SpecialEntity extends Entity {
  constructor(
    id: string,
    public type: string
  ) {
    super(id);
  }

  clone(): Entity {
    return new SpecialEntity(this.id, this.type);
  }
}
```

```typescript
// main.ts - Initialization
import { Entity } from './entity';
import { SpecialEntity } from './special-entity';

// Configure dependency
Entity.toSpecialFn = (entity) => new SpecialEntity(entity.id, 'default');

// Now works correctly
const entity = new SpecialEntity('1', 'test');
const special = entity.toSpecial();
```

---

## Real-World Example: Data Analysis Library

[GitHub Issue #20361](https://github.com/Microsoft/TypeScript/issues/20361) reports a similar problem in a data analysis library:

```typescript
// series.ts
import { DataFrame } from './dataframe';

export class Series extends DataFrame {
  // Extends DataFrame
}
```

```typescript
// dataframe.ts
import { Series } from './series';

export class DataFrame {
  // Method to convert to Series
  deflate(): Series {
    return new Series(...);
  }
}
```

This also causes the same runtime error, solvable with the methods above.

---

## Recommendations

| Situation | Recommended Method |
|-----------|-------------------|
| Simple circular reference | **import type** + lazy initialization |
| Complex object creation | **Factory Pattern** |
| Large-scale projects | **Interface segregation** + DI |
| Using a framework | Leverage **Dependency Injection** container |

---

## Summary

- TypeScript **can compile successfully but fail at runtime**
- Circular dependencies occur due to **module loading order**
- Solutions:
  1. **import type** + lazy initialization
  2. **Factory Pattern** to separate creation logic
  3. **Interfaces** to separate types from implementation
  4. **Dependency Injection**

> 💡 **TL;DR**: When circular references between abstract class and subclass cause runtime errors, use `import type` and lazy initialization.

---

## References
- [Microsoft/TypeScript #20361 - Circular dependencies in classes](https://github.com/Microsoft/TypeScript/issues/20361)
- [TypeScript Handbook - Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [MDN - import() dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Node.js Modules - Cycles](https://nodejs.org/api/modules.html#modules_cycles)
