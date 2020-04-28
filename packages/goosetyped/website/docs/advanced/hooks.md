---
id: hooks
title: Middleware (Hooks)
sidebar_label: 2. Middleware (Hooks)
---

# WIP

## Document Hooks

### Init Hook

- Supports pre/post
- Must be an instance method
- Does not support async operation

```typescript
import { GtDocument, GtModel, GtInitHook } from '@pebula/goosetyped';

@GtDocument()
export class Person extends GtModel() {

  @GtColumn() name: string;

  @GtInitHook('pre') preInitHook() { /* Do stuff... */ }
  @GtInitHook('post') postInitHook() { /* Do stuff... */ }
}
```

### Validate, Save, Remove, DeleteOne, UpdateOne Hooks

- Supports pre/post
- Must be an instance method
- Support async operation

```typescript
import {
  GtDocument,
  GtModel,
  GtValidateHook,
  GtSaveHook,
  GtRemoveHook,
  GtDeleteOneHook,
  GtUpdateOneHook,
  } from '@pebula/goosetyped';

@GtDocument()
export class Person extends GtModel() {
  @GtColumn() name: string;

  @GtValidateHook('pre') async preValidateHook() { /* Do stuff... */ }
  @GtValidateHook('post') postValidateHook() { /* Do stuff... */ }

  @GtSaveHook('pre') preSaveHook() { /* Do stuff... */ }
  @GtSaveHook('post') async postSaveHook() { /* Do stuff... */ }

  @GtRemoveHook('pre') async preRemoveHook() { /* Do stuff... */ }
  @GtRemoveHook('post') postRemoveHook() { /* Do stuff... */ }

  @GtDeleteOneHook('pre') async preDeleteOneHook() { /* Do stuff... */ }
  @GtDeleteOneHook('post') postDeleteOneHook() { /* Do stuff... */ }

  @GtUpdateOneHook('pre') preUpdateOneHook() { /* Do stuff... */ }
  @GtUpdateOneHook('post') async postUpdateOneHook() { /* Do stuff... */ }
}
```

## Model Hooks

### InsertMany Hook

- Supports pre/post (different signatures)
- Must be a static method
- Support async operation

```typescript
import { GtDocument, GtModel, GtInsertManyHook } from '@pebula/goosetyped';

@GtDocument()
export class Person extends GtModel() {

  @GtColumn() name: string;

  @GtInsertManyHook('pre')
  static preInsertManyHook() { /* Do stuff... */ }

  @GtInsertManyHook('post')
  static postInsertManyHook(instances: Person[]) { /* Do stuff... */ }
}
```

## Aggregation Hooks

TBD

## Query Hooks

TBD
