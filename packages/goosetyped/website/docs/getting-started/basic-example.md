---
id: basic-example
title: Basic Usage
sidebar_label: 3. Basic Usage
---

Let's start with a simple model:

```typescript
import { GtDocument, GtModel } from '@pebula/goosetyped';

@GtDocument()
export class Customer extends GtModel() {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;
}
```

Here we have a `Customer` class with a name and age columns.

- We decorate each column with the `@GtColumn` decorator to declare that the property is mapped to a column in the DB.
- We decorate each model with the `@GtDocument` decorator to declare that this is a model.
- We extend the `Customer` class with the expression `GtModel()` which is extending mongoose's `Model` class with a bit of **GooseTyped** flavor.

To qualify as a model a class must be decorated with `@GtDocument` and extend `GtModel()`.


**GooseTyped** distinguish between documents and sub-documents. This is 