---
id: query-methods
title: Query Methods / Helpers
sidebar_label: 4. Query Methods / Helpers
---
import MongooseDocsLink from '@site/src/theme/MongooseDocsLink';

# WIP

<MongooseDocsLink type="schema" hash="query-helpers">Query methods</MongooseDocsLink> (also called Query Helpers) is a simple but powerful
mechanism to compose custom queries.  

All query methods are added to the mongoose `Query` class and not the Model so they don't effect the type directly
however the `Query` type is used on the Model so there is an indirect effect which is why we register query methods
is a different way.

Let's define some query methods:

```typescript
import { Document, DocumentQuery } from 'mongoose';
import { GtDocument, GtModel, GtColumn, GtQuery } from '@pebula/goosetyped';

export class MyQueries {
  byName<T extends Document & { name: string }>(this: DocumentQuery<T[], T, MyQueries> & MyQueries, name: string): DocumentQuery<T[], T, MyQueries> & MyQueries {
    return this.where({ name: new RegExp(name, 'i') });
  }

  byAge<T extends Document & { age: number }>(this: DocumentQuery<T[], T, MyQueries> & MyQueries, age: number): DocumentQuery<T[], T, MyQueries> & MyQueries {
    return this.where({ age: age });
  }
}
```

```typescript
@GtDocument()
export class Person extends GtQuery(MyQueries)(GtModel()) {
  @GtColumn() name: string;

  @GtColumn() age: number;
}
```

```typescript
Person.find().byName('test').byAge(15);
```

The declaration might look a bit cumbersome but it enables use to apply the additional query methods type members
on the `Query` object returned by the Model's `find()` method.

:::info
Note that you can still add mixins through `GtModel()`
:::