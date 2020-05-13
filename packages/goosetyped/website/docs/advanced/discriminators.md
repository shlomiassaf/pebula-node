---
id: discriminators
title: Discriminators
sidebar_label: 3. Discriminators
---

# WIP

## Creating Discriminators

```typescript
/* module: person.ts */
import { GtDocument, GtModel, GtColumn, GtDiscriminator } from '@pebula/goosetyped';

@GtDocument()
export class Person<T extends string> extends GtModel() {

  @GtColumn() name: string;

  @GtColumn() age: number;

  @GtDiscriminator()
  type: T;
}
```

```typescript
import { GtDocument, GtModel, GtColumn } from '@pebula/goosetyped';
import { Person } from './person';

@GtDocument()

export class BusinessMan extends Person<'BusinessMan'> {
   @GtColumn() businessTrips: number;
}

@GtDocument()
export class Soldier extends Person<'Soldier'> {
   @GtColumn() releaseDate: Date;
}

@GtDocument()
export class Athlete extends Person<'Athlete'> {
   @GtColumn() medals: number;
}

```

:::tip
Sub Documents are also valid discriminators.
:::

## Discriminators as Sub Documents

```typescript
import { GtDocument, GtModel, GtColumn } from '@pebula/goosetyped';
import { Person } from './person';

@GtDocument()
export class SalesLead extends GtModel() {

  @GtColumn() receivedAt: Date;

  @GtColumn({ type: () => Person })
  person: BusinessMan | Soldier | Athlete;
}
```

```typescript
import { GtDocument, GtModel, GtColumn, DocumentArray } from '@pebula/goosetyped';
import { Person } from './person';

@GtDocument()
export class Course extends GtModel() {

  @GtColumn() name: string;

  @GtColumn() startDate: Date;

  @GtColumn({ type: () => Person })
  students: DocumentArray<BusinessMan | Soldier | Athlete>;
}
```
