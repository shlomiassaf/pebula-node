---
id: mixins
title: Mixins
sidebar_label: 4. Mixins
---
import MongooseDocsLink from '@site/src/theme/MongooseDocsLink';

Mixins are the perfect tools to apply functionality and are very similar to mongoose plugins.

Let's say we want to add `createDate` and `updateDate` columns to our `Customer` model:

The straight-forward approach would ne to use the `@GtTimestampCreated` & `@GtTimestampUpdated` decorators in the class:

```typescript
import { GtDocument, GtModel, GtTimestampCreated, GtTimestampUpdated } from '@pebula/goosetyped';

@GtDocument()
export class Customer extends GtModel() {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;

  @GtTimestampCreated()
  createDate: Date;

  @GtTimestampUpdated()
  updateDate: Date;
}
```

:::tip
`@GtTimestampCreated` & `@GtTimestampUpdated` are utility decorators that expose mongoose's built-in <MongooseDocsLink type="schema" hash="timestamps">timestamps</MongooseDocsLink>
:::

This is ok but we most probably want to add this capability to other models in our application but not all of them.
We can use inheritance but this will limit our possibility of composing capabilities together...

Instead, we define a class (does not have to be a document or sub-document...) with the capability we want:

```ts
export class TimestampMixin {
  @GtTimestampCreated()
  createDate: Date;

  @GtTimestampUpdated()
  updateDate: Date;
}
```

Now we can mix it into our models where needed:

```ts
@GtDocument()
export class Customer extends GtModel(TimestampMixin) {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;
  updateDate: Date;
}
```

Ohh, we forgot, the `Customer` model also needs an `Owner` mixin:

```ts
export class OwnerMixin {
  @GtColumn()
  owner: string;
}
```

Now we can mix it into our models where needed:

```ts
@GtDocument()
export class Customer extends GtModel(TimestampMixin, OwnerMixin) {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;
  updateDate: Date;
}
```
