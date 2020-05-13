---
id: local-column
title: Local Columns
sidebar_label: 5. Local Columns
---
import MongooseDocsLink from '@site/src/theme/MongooseDocsLink';

Up to this point we've only used class properties which we're decorated with `@GtColumn`.

What will happen if we use non-column properties, can we use initializers?

```typescript
import { GtDocument, GtModel, GtColumn } from '@pebula/goosetyped';

@GtDocument()
export class Person extends GtModel() {
  @GtColumn() name: string;
  @GtColumn() age: number;

  myLocalNumber: number = 99;
  private myPrivateString = 'STRING!';
}
```

Well, nothing special actually, it will just work, the instance will reflect these values but when saving the model
they will not update the database.

When we do

```typescript
const person = await Person.create({});
console.log(person.myLocalNumber) // Prints 99
```

The framework will create a new instance for us, which will run through the constructor and initialize the values.

Because we use native JS classes as our models they play along nicely!

## Sub Documents & Embedded Documents

<MongooseDocsLink type="subDocument">SubDocuments</MongooseDocsLink> are a bit different.

  
  
When mongoose detects a column that is an embedded document it will treat it differently. It will
not use the class defined for it but instead will use a new class it creates for every column that is an embedded document which mimic the behavior of the original class.

This how mongoose works for all embedded documents, including simple nested schema, complex discriminators and Array/Map of them.

```ts
import {
  GtSubDocument,
  GtResource,
  GtDocument,
  GtModel,
  GtColumn,
} from '@pebula/goosetyped';

@GtSubDocument({ noId: true })
export class Address extends GtResource() {
  @GtColumn()
  street: string;

  @GtColumn()
  country: string;
}

@GtDocument()
export class Customer extends GtModel() {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;

  @GtColumn()
  address: Address; // <- Embedded Column
}
```

:::info
`Address` is an embedded column, not because it is wrapped by `@GtSubDocument`, it is an embedded column because it is nested within the root document
:::

In the example above, `Customer.address` will point to class `SingleNested` but it does not really matter because **GooseTyped** takes care to synchronize and run what's needed.

It will make sure that the original constructor ran and will also adapt the class to support instanceOf so the expression `person.address instanceOf Address` is **true**.

The only issue we have is with local columns / properties.
**GooseTyped** maintains a sync between the original class and the new mongoose class but it can't track the members which are not declared.

To solve this issue you can use the `@GtLocalProp` decorator which will make the property so it will be synced.

:::caution
Using local column or private properties in general is not recommended, avoid them to prevent unfortunate bugs and errors.
:::