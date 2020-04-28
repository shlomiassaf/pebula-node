---
id: plugins
title: Plugins
sidebar_label: 6. Plugins
---

The way to declare and bind mongoose plugins to **GooseTyped** models.

```typescript
import * as mongooseAutopopulate from 'mongoose-autopopulate';
import { GtDocument, GtModel, GtColumn, GtPlugin } from '@pebula/goosetyped';

@GtDocument()
@GtPlugin({ plugin: mongooseAutopopulate })
export class Person<T extends string> extends GtModel() {

  @GtColumn() name: string;
  @GtColumn() age: number;
}
```
