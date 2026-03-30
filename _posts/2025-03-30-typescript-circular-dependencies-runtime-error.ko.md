---
layout: post
title: "TypeScript 순환 의존성(Circular Dependencies) 런타임 에러 해결하기"
description: TypeScript에서 abstract class와 상속 클래스 간 순환 참조 시 발생하는 런타임 에러의 원인과 해결 방법
image: /assets/coding.jpg
date: 2025-03-30 20:00:00 +0900
tags: [typescript, design-pattern, troubleshooting]
categories: [frontend]
lang: ko
permalink: /typescript-circular-dependencies-runtime-error/
---

# TypeScript 순환 의존성(Circular Dependencies) 런타임 에러 해결하기

TypeScript 프로젝트에서 컴파일은 성공하는데 **런타임에서만 에러가 발생**하는 경우가 있다. 특히 abstract class와 이를 상속받은 클래스가 서로를 참조할 때 이런 문제가 자주 발생한다.

```
TypeError: Object prototype may only be an Object or null: undefined
```

이 글에서는 이 문제의 원인과 해결 방법을 정리한다.

---

## 문제 상황

### 시나리오: Base Entity와 Specialized Entity

```typescript
// entity.ts
import { SpecialEntity } from './special-entity';

export abstract class Entity {
  constructor(public id: string) {}

  // 다른 Entity로 변환하는 메서드
  abstract clone(): Entity;

  // 특수 Entity로 변환
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

### 컴파일은 성공, 런타임은 실패

```bash
$ tsc
# 성공! 에러 없음

$ node dist/index.js
TypeError: Object prototype may only be an Object or null: undefined
    at setPrototypeOf (<anonymous>)
    ...
```

---

## 왜 이런 문제가 발생할까?

### JavaScript 모듈 로딩 순서

1. `entity.ts`가 로드될 때 `SpecialEntity`를 import 시도
2. `special-entity.ts`가 로드될 때 `Entity`를 import 시도
3. 아직 `Entity` 클래스가 완전히 로드되지 않은 상태에서 `extends Entity` 실행
4. `Entity === undefined` 상태로 클래스 정의 실패

### 컴파일러는 왜 못 잡을까?

TypeScript 컴파일러는 **정적 타입 검사**만 수행한다. 실제 모듈 로딩 순서와 런타임 동작은 확인하지 않는다.

---

## 해결 방법 1: 지연 초기화 (Lazy Initialization)

클래스 참조를 실제 사용 시점으로 미룬다.

```typescript
// entity.ts
import type { SpecialEntity } from './special-entity';

export abstract class Entity {
  constructor(public id: string) {}

  abstract clone(): Entity;

  // 지연 초기화
  toSpecial(): SpecialEntity {
    // 동적 import 또는 지연 참조
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

**포인트:** `import type`은 타입만 가져오고 런타임 코드는 생성하지 않는다.

---

## 해결 방법 2: 팩토리 패턴 사용

객체 생성 로직을 별도 파일로 분리한다.

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

**장점:** 순환 참조 없이 깔끔한 구조

---

## 해결 방법 3: 인터페이스로 분리

구현과 타입 정의를 분리한다.

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
    // 런타임에 구현체 import
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

## 해결 방법 4: Dependency Injection

외부에서 의존성을 주입받도록 설계한다.

```typescript
// entity.ts
export abstract class Entity {
  // 변환 함수를 외부에서 주입
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
// main.ts - 초기화
import { Entity } from './entity';
import { SpecialEntity } from './special-entity';

// 의존성 설정
Entity.toSpecialFn = (entity) => new SpecialEntity(entity.id, 'default');

// 이제 정상 동작
const entity = new SpecialEntity('1', 'test');
const special = entity.toSpecial();
```

---

## 실제 사례: 데이터 분석 라이브러리

[GitHub Issue #20361](https://github.com/Microsoft/TypeScript/issues/20361)에서는 데이터 분석 라이브러리에서 발생한 유사한 문제가 보고되었다:

```typescript
// series.ts
import { DataFrame } from './dataframe';

export class Series extends DataFrame {
  // DataFrame을 상속
}
```

```typescript
// dataframe.ts
import { Series } from './series';

export class DataFrame {
  // Series로 변환하는 메서드
  deflate(): Series {
    return new Series(...);
  }
}
```

이 경우도 동일한 런타임 에러가 발생하며, 위의 해결 방법들로 해결할 수 있다.

---

## 권장사항

| 상황 | 권장 방법 |
|------|----------|
| 단순한 순환 참조 | **import type** + 지연 초기화 |
| 복잡한 객체 생성 | **팩토리 패턴** |
| 대규모 프로젝트 | **인터페이스 분리** + DI |
| 프레임워크 사용 | **Dependency Injection** 컨테이너 활용 |

---

## 요약

- TypeScript **컴파일은 성공하지만 런타임에서 실패**할 수 있다
- 순환 의존성은 **모듈 로딩 순서** 때문에 발생한다
- 해결책:
  1. **import type** + 지연 초기화
  2. **팩토리 패턴**으로 생성 로직 분리
  3. **인터페이스**로 타입과 구현 분리
  4. **Dependency Injection** 사용

> 💡 **TL;DR**: abstract class와 subclass 간 순환 참조 시 런타임 에러가 발생하면 `import type`과 지연 초기화를 사용하자.

---

## 참고 자료
- [Microsoft/TypeScript #20361 - Circular dependencies in classes](https://github.com/Microsoft/TypeScript/issues/20361)
- [TypeScript Handbook - Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [MDN - import() dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Node.js Modules - Cycles](https://nodejs.org/api/modules.html#modules_cycles)
