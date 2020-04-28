---
id: columns
title: Columns
sidebar_label: 2. Columns
---
import ApiDocsLink from '@site/src/theme/ApiDocsLink';

Columns are the building blocks of every model.

Each column has a type and optionally additional metadata used to describe a behavior or property of that column.

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

## Column Options (metadata)

We can add additional metadata to columns:

```typescript
import { GtDocument, GtModel } from '@pebula/goosetyped';

@GtDocument()
export class Customer extends GtModel() {
  @GtColumn({
    required: true,
  })
  name: string;

  @GtColumn({
    validate: value => value > 0,
  })
  age: number;

  @GtColumn({
    enum: ['male', 'female', 'other'],
    default: 'other'
  })
  gender: 'male' | 'female' | 'other';
}
```

You can review all of the metadata options in the API docs for <ApiDocsLink type="interface" symbol="GtColumnMetadataArgs">GtColumnMetadataArgs<T\></ApiDocsLink>.

## Column Type

TypeScript emits the type used for every column so **GooseType** can use that to automatically define the proper type with mongoose.

```typescript
export class Customer {
  @GtColumn()
  age: number;
}
```

In the example above **GooseType** will identify that the type is a number and will use `mongoose.Schema.Types.Number` as the type for the column.

### Explicit type definition

There are some scenarios in which typescript's type system is not able to provide a type definition and an explicit type definition is required.

This usually happen when:

1. Generics is used to define the type (e.g. `Array<string>`, `Map<number>`, etc...)
2. The type is unknown at the time it is defined (usually due to cyclic reference)

:::warning
**GooseType** will throw an error when these scenarios occur and are not handled.
:::

Additionally, it might be that would want to customize the type defined.

To define a custom type we use <ApiDocsLink type="interface" symbol="GtColumnMetadataArgs" hash="type">GtColumnMetadataArgs.type</ApiDocsLink>
which accepts one of:

- Schema
- typeof SchemaType (e.g `mongoose.Schema.Types.Number`)
- A function that returns a **GooseTyped** model or resource (the classes of a document or sub-document).

We will not go into depth on the first two options, they are straight forward and we recommend not to use them
unless there is really no solution to your problem.

The last option is nothing but a simple arrow function that returns the type for this column, let's review some examples:

#### Array

This covers the 1st scenario which TS can not resolve the type for us:

```typescript
export class Person {
  @GtColumn({
    type: () => String,
  })
  friends: string[];

  @GtColumn({
    type: () => Date,
  })
  importantDates: Array<Date>;
}
```

:::tip
We return the actual generic type, `String` and not `Array<string>`. TypeScript already resolves the type to Array we only need the internal type.
:::

#### Map

Again, same as `Array` above, TS can not resolve the subject type of the Map, it will only resolve `Map`.

```typescript
export class Person {
  @GtColumn({
    type: () => Number,
  })
  map: Map<number>;
}
```

#### Circular or Undefined

```typescript
// module: person.ts
export class Person {

  @GtColumn({
    type: () => Address,
  })
  address: Address;
}

// module: address.ts
export class Address {

  @GtColumn({
    type: () => Person,
  })
  resident: Person;
}
```

At the time when the class is defined both modules (person & address) refer to each other.  
This means that the type will be undefined and will get populated later once both classes are exported.

TypeScript does not account for that and will mark the type for the property as undefined.
To solve this we use the function that returns the type. We will resolve the type after both classes are resolved so we will get the proper value.

:::note
Circular reference types requires deffered model initialization described in the advanced section.
:::
