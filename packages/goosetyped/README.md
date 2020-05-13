# `@pebula/goosetyped`

[![Documentation](https://img.shields.io/badge/Documentation-9cf?style=for-the-badge)](https://shlomiassaf.github.io/pebula-node/goosetyped/)   ![npm (scoped)](https://img.shields.io/npm/v/@pebula/goosetyped?color=green&style=for-the-badge)


**GooseTyped** allows you to focus on building your models more clearly. Simplifying most of the domain
specific concepts of mongoose resulting in a modern ORM code which in turn, allows taking advantage of modern JS features and
design patterns.

## One Model One Schema

With **GooseTyped** you no longer need to define a schema and then create a model class from it, everything is streamlined
into one single class.

```ts
import { GtDocument, GtModel } from '@pebula/goosetyped';

@GtDocument()
export class Customer extends GtModel() {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;
}
```

This is very powerful when working in TypeScript as no sorcery is required to properly export your model class types.

## Not an ORM

**GooseTyped** is not an ORM by itself and **does not** provide additional functionality on-top of mongoose.  
It is a wrapper around mongoose which provide modern tools to define and and configure the DB schema which is
more adapted to TypeScript and modern ORM libraries.

