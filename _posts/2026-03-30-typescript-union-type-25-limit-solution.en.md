---
layout: post
title: "TypeScript Union Type 25 Limit: Problem and Solutions"
description: Understanding TypeScript's 25 union member limit error and modern refactoring approaches using Classes
image: /assets/coding.jpg
date: 2026-03-30 12:00:00 +0900
tags: [typescript, refactoring, design-pattern]
categories: [frontend]
lang: en
permalink: /typescript-union-type-25-limit-solution/
---

# TypeScript Union Type 25 Limit: Problem and Solutions

When working with TypeScript projects, we often use **Union Types** to represent various states or types. However, putting too many types in a Union can lead to the error: **"Expression produces a variable with 25 union members. This component cannot be compiled due to performance degradation."**

In this article, we'll explore the cause of this problem and its solutions.

---

## The Problem

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
  | 'visible';  // 26!

function getStatusLabel(status: Status): string {
  // ...
}
```

**Error Message:**
```
Expression produces a variable with 25 union members. 
This component cannot be compiled due to performance degradation.
```

---

## Why the 25 Limit?

When the TypeScript compiler processes Union types, it **checks each member individually** to verify type compatibility. As Union members increase:

1. **Increased Compilation Time** - Type checking costs increase geometrically
2. **Increased Memory Usage** - The compiler keeps all combinations in memory
3. **IDE Performance Degradation** - Slower autocomplete and type inference

The TypeScript team set the default limit to 25 for **performance protection**.

---

## GitHub Issue Reference

This is tracked in [Microsoft/TypeScript#43246](https://github.com/microsoft/TypeScript/issues/43246), with many developers experiencing the same issue.

> **Note:** TypeScript 5.0+ allows more Unions with `--noErrorTruncation` option, but this is not a fundamental solution.

---

## Solution 1: Refactor to Class

The most recommended approach is to **convert Union to Class**.

### Before (Union Type)

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
  | 'move';  // 26!

function executeAction(action: ActionType): void {
  switch (action) {
    case 'create':
      // create logic
      break;
    case 'read':
      // read logic
      break;
    // ... 26 cases continue
  }
}
```

### After (Class-based)

```typescript
// Base Action class
abstract class Action {
  abstract execute(): void;
  abstract getDescription(): string;
}

// Concrete Actions
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

// Usage
function executeAction(action: Action): void {
  console.log(`Action: ${action.getDescription()}`);
  action.execute();
}

// Type-safe usage
const createAction = new CreateAction('user');
const readAction = new ReadAction('user', '123');
const updateAction = new UpdateAction('user', '123', { name: 'Kim' });

executeAction(createAction);
executeAction(readAction);
executeAction(updateAction);
```

---

## Solution 2: Use Enum

For simple value collections, **Enum** might be more appropriate.

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

Unlike Union types, the compiler can **optimize Enums**, so there's no limit.

---

## Solution 3: Grouping and Hierarchy

Group related types into **sub-Union** groups.

```typescript
// Group related types
type FileAction = 'create' | 'read' | 'update' | 'delete';
type QueryAction = 'list' | 'search' | 'filter' | 'sort';
type ExportAction = 'export' | 'import' | 'backup' | 'restore';
type TransformAction = 'validate' | 'transform' | 'parse' | 'format';

// Top-level Union (4 each = 16 total)
type ActionType = FileAction | QueryAction | ExportAction | TransformAction;

// Type guard
function isFileAction(action: string): action is FileAction {
  return ['create', 'read', 'update', 'delete'].includes(action);
}

function executeAction(action: ActionType): void {
  if (isFileAction(action)) {
    // Handle FileAction
    console.log(`File action: ${action}`);
  } else if (action === 'list' || action === 'search') {
    // Handle QueryAction
    console.log(`Query action: ${action}`);
  }
  // ...
}
```

---

## Recommendations

| Situation | Recommended Method |
|-----------|-------------------|
| Simple value list | **Enum** |
| Complex behavior/data | **Class** refactoring |
| Related types | **Grouping** with hierarchical structure |
| Temporary workaround | `--noErrorTruncation` (not recommended) |

---

## Summary

- TypeScript Union types are **limited to 25 members** by default
- This is for **compiler performance protection**
- Solutions:
  1. **Refactor to Class** - Most modern and extensible approach
  2. **Use Enum** - Suitable for simple value lists
  3. **Grouping** - Separate related types into sub-Unions

> 💡 **TL;DR**: If your Union exceeds 25, refactor to Class. It's more extensible and maintainable.

---

## References
- [Microsoft/TypeScript #43246 - Union types that exceed 25 elements break the TypeScript compiler](https://github.com/microsoft/TypeScript/issues/43246)
- [TypeScript Error: Expression produces a variable with 25 union members](https://github.com/microsoft/TypeScript/issues/38766)
- [Stack Overflow - TypeScript Union Type Limit](https://stackoverflow.com/questions/76091608/typescript-union-type-limit)
- [Stack Overflow - Union type with more than 25 members](https://stackoverflow.com/questions/76784188/union-type-with-more-than-25-members)
- [TypeScript Documentation - Union Types](https://www.typescriptlang.org/docs/handbook/2/types.html#union-types)
