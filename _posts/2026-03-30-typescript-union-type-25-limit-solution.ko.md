---
layout: post
title: "TypeScript Union 타입 25개 제한과 해결 방법"
description: TypeScript에서 Union 타입이 25개 이상일 때 발생하는 컴파일 에러와 Class를 활용한 모던한 리팩토링 방법
image: /assets/coding.jpg
date: 2025-03-30 12:00:00 +0900
tags: [typescript, refactoring, design-pattern]
categories: [frontend]
lang: ko
permalink: /typescript-union-type-25-limit-solution/
---

# TypeScript Union 타입 25개 제한과 해결 방법

TypeScript로 프로젝트를 진행하다 보면, 다양한 상태나 타입을 표현하기 위해 **Union 타입**을 자주 사용한다. 하지만 Union에 너무 많은 타입을 넣으면 **Expression produces a variable with 25 union members. The component cannot be compiled due to performance degradation.**라는 에러를 만나게 된다.

이 글에서는 이 문제의 원인과 해결 방법을 정리해본다.

---

## 문제 상황

```typescript
type Status = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused'
  | 'waiting'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'archived'
  | 'deleted'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'expired'
  | 'pending_review'
  | 'under_review'
  | 'reviewed'
  | 'published'
  | 'unpublished'
  | 'locked'
  | 'unlocked'
  | 'hidden'
  | 'visible';  // 26개!

function getStatusLabel(status: Status): string {
  // ...
}
```

**에러 메시지:**
```
Expression produces a variable with 25 union members. 
The component cannot be compiled due to performance degradation.
```

---

## 왜 25개 제한이 있을까?

TypeScript 컴파일러는 Union 타입을 처리할 때 **각 멤버를 하나씩 체크**하며 타입 호환성을 검증한다. Union 멤버가 많아지면:

1. **컴파일 시간 증가** - 타입 체크 비용이 기하급수적으로 증가
2. **메모리 사용량 증가** - 컴파일러가 모든 조합을 메모리에 유지
3. **IDE 성능 저하** - 자동완성, 타입 추론 속도 감소

TypeScript 팀은 이를 **성능 보호**를 위해 기본 제한을 25개로 설정했다.

---

## GitHub Issue 확인

실제로 [Microsoft/TypeScript#43246](https://github.com/microsoft/TypeScript/issues/43246) 이슈가 등록되어 있으며, 많은 개발자들이 같은 문제를 겪고 있다.

> **Note:** TypeScript 5.0부터 `--noErrorTruncation` 옵션으로 더 많은 Union을 허용할 수 있지만, 근본적인 해결책은 아니다.

---

## 해결 방법 1: Class로 리팩토링

가장 권장하는 방법은 **Union을 Class로 변환**하는 것이다.

### Before (Union 타입)

```typescript
type ActionType = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'search'
  | 'filter'
  | 'sort'
  | 'export'
  | 'import'
  | 'validate'
  | 'transform'
  | 'parse'
  | 'format'
  | 'render'
  | 'cache'
  | 'sync'
  | 'backup'
  | 'restore'
  | 'archive'
  | 'compress'
  | 'encrypt'
  | 'decrypt'
  | 'upload'
  | 'download'
  | 'copy'
  | 'move';  // 26개!

function executeAction(action: ActionType): void {
  switch (action) {
    case 'create':
      // create 로직
      break;
    case 'read':
      // read 로직
      break;
    // ... 26개 case 계속
  }
}
```

### After (Class 기반)

```typescript
// 기본 Action 클래스
abstract class Action {
  abstract execute(): void;
  abstract getDescription(): string;
}

// 구체적인 Action들
class CreateAction extends Action {
  constructor(public resource: string) {
    super();
  }

  execute(): void {
    console.log(`Creating resource: ${this.resource}`);
  }

  getDescription(): string {
    return 'Create a new resource';
  }
}

class ReadAction extends Action {
  constructor(public resource: string, public id: string) {
    super();
  }

  execute(): void {
    console.log(`Reading ${this.resource} with id: ${this.id}`);
  }

  getDescription(): string {
    return 'Read a resource by ID';
  }
}

class UpdateAction extends Action {
  constructor(
    public resource: string,
    public id: string,
    public data: unknown
  ) {
    super();
  }

  execute(): void {
    console.log(`Updating ${this.resource}(${this.id})`, this.data);
  }

  getDescription(): string {
    return 'Update an existing resource';
  }
}

class DeleteAction extends Action {
  constructor(public resource: string, public id: string) {
    super();
  }

  execute(): void {
    console.log(`Deleting ${this.resource}(${this.id})`);
  }

  getDescription(): string {
    return 'Delete a resource';
  }
}

// 사용 예시
function executeAction(action: Action): void {
  console.log(`Action: ${action.getDescription()}`);
  action.execute();
}

// 타입 안전한 사용
const createAction = new CreateAction('user');
const readAction = new ReadAction('user', '123');
const updateAction = new UpdateAction('user', '123', { name: 'Kim' });

executeAction(createAction);
executeAction(readAction);
executeAction(updateAction);
```

---

## 해결 방법 2: Enum 사용

단순한 값들의 집합이라면 **Enum**을 사용하는 것이 더 적절할 수 있다.

```typescript
enum Status {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  WAITING = 'waiting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  PENDING_REVIEW = 'pending_review',
  UNDER_REVIEW = 'under_review',
  REVIEWED = 'reviewed',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  HIDDEN = 'hidden',
  VISIBLE = 'visible'
}

function getStatusLabel(status: Status): string {
  return status.toString().replace('_', ' ').toLowerCase();
}
```

Enum은 Union 타입과 달리 **컴파일러가 최적화**할 수 있어 제한이 없다.

---

## 해결 방법 3: 그룹화 및 계층 구조
관련 있는 타입들을 **하위 Union**으로 그룹화한다.

```typescript
// 관련 있는 타입들을 그룹화
type FileAction = 'create' | 'read' | 'update' | 'delete';
type QueryAction = 'list' | 'search' | 'filter' | 'sort';
type ExportAction = 'export' | 'import' | 'backup' | 'restore';
type TransformAction = 'validate' | 'transform' | 'parse' | 'format';

// 상위 Union (각각 4개씩 = 16개)
type ActionType = FileAction | QueryAction | ExportAction | TransformAction;

// 타입 가드
function isFileAction(action: string): action is FileAction {
  return ['create', 'read', 'update', 'delete'].includes(action);
}

function executeAction(action: ActionType): void {
  if (isFileAction(action)) {
    // FileAction 처리
    console.log(`File action: ${action}`);
  } else if (action === 'list' || action === 'search') {
    // QueryAction 처리
    console.log(`Query action: ${action}`);
  }
  // ...
}
```

---

## 권장사항
| 상황 | 권장 방법 |
|------|----------|
| 단순한 값 목록 | **Enum** 사용 |
| 복잡한 동작/데이터 | **Class**로 리팩토링 |
| 관련 있는 타입들 | **그룹화** 후 계층 구조 |
| 임시 해결 | `--noErrorTruncation` (권장하지 않음) |

---

## 요약
- TypeScript Union 타입은 **기본적으로 25개 멤버**로 제한된다
- 이는 **컴파일러 성능 보호**를 위한 것이다
- 해결책:
  1. **Class로 리팩토링** - 가장 모던하고 확장 가능한 방법
  2. **Enum 사용** - 단순한 값 목록에 적합
  3. **그룹화** - 관련 타입들을 하위 Union으로 분리

> 💡 **TL;DR**: Union이 25개를 넘어간다면 Class로 리팩토링하자. 더 확장 가능하고 유지보수하기 좋다.

---

## 참고 자료
- [Microsoft/TypeScript #43246 - Union types that exceed 25 elements break the TypeScript compiler](https://github.com/microsoft/TypeScript/issues/43246)
- [TypeScript Error: Expression produces a variable with 25 union members](https://github.com/microsoft/TypeScript/issues/38766)
- [Stack Overflow - TypeScript Union Type Limit](https://stackoverflow.com/questions/76091608/typescript-union-type-limit)
- [Stack Overflow - Union type with more than 25 members](https://stackoverflow.com/questions/76784188/union-type-with-more-than-25-members)
- [TypeScript Documentation - Union Types](https://www.typescriptlang.org/docs/handbook/2/types.html#union-types)
