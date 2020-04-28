---
id: async-model-compilation
title: Async Model Compilation
sidebar_label: 7. Async Model Compilation
---
import ApiDocsLink from '@site/src/theme/ApiDocsLink';

**GooseTyped** works in 2 modes:

- Immediate Model Compilation
- Async Model Compilation

To simplify the configuration the mode in which each model is compiled is determined by connection it is attached to.

When the default connection is used the compilation is immediate.  
When a specific connection is used the compilation is async.

## Sync VS Async

What does it means anyway?

Since decorators are not (yet) part of the JS spec, TypeScript converts them into simple functions that
invoke along with the creation of the class.

First, all of the member level decorators fire (i.e those on properties and methods) and at the end the class decorators
fire (e.g. `@GtDocument`).

Once `@GtDocument` fires it will check if there is a `connectionId` defined, if not it will compile the model before the module itself finish to initialize and export the model class.

This is a synchronous run which fits the default connection as it is also set immediately in mongoose.

## Async Compilation

The same process occurs in an async compilation except that now `@GtDocument` fires and detects that `connectionId` is defined.

```ts
import mongoose from 'mongoose';
import { GtDocument, GtModel, GtColumn, addConnection } from '@pebula/goosetyped';

@GtDocument({
  connectionId: 'myConnection',
})
export class Customer extends GtModel() {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;
}
```

At this point it will wait to see if the user has added this connection.

When no connection is found, nothing is done and the model will "wait" for the connection to be added.  
If the connection exists, the compilation will run at one of two options (user defined):

1. **immediate** [default] - Compile the model once a reference to the connection is obtained.
2. **connected** - Compile the model once the connection state changes to `connected`.

:::warning
Do not use the model before it is compiled using a connection.
:::

Now, let's register the connection so our model can compile:

```typescript
const connection = mongoose.createConnection('localhost',{ /* ...*/ });
const ready = addConnection('myConnection', () => connection, { compileAt: 'immediate' });
await ready;
```

Once `ready` **resolves** we have a guarantee that all models are compiled and bound to the connection.

The factory function (`() => connection`) return the connection or it can return a `Promise` for the connection.  
Once the factory function resolves (including promise, if returned) then the models compile and the process ends.

If we set `compileAt` to **connected** the model will wait for the connection state to change to **connected** and only then
all models will compile and the process will end.

:::caution
It is best to compile as early as possible, think before you use **connected**
:::

Watch out from the Promise Like connection object returned from `mongoose.createConnection`, when returned from the factory
function like done above it will actually treat it as a promise and will resolve the factory once the connection is connected.

Fix:

```typescript
const connection = await mongoose.createConnection('localhost',{ /* ...*/ });
const ready = addConnection('myConnection', () => connection, { compileAt: 'immediate' });
await ready;
```

 <ApiDocsLink type="interface" symbol="GtConnectOptions"></ApiDocsLink>