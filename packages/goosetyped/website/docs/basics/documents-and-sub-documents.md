---
id: documents-and-sub-documents
title: Documents And SubDocuments
sidebar_label: 3. Documents & SubDocuments
---
import DocLink from '@site/src/theme/DocLink';
import ApiDocsLink from '@site/src/theme/ApiDocsLink';
import MongooseDocsLink from '@site/src/theme/MongooseDocsLink';

**GooseType** provide support for mongoose's <MongooseDocsLink type="document">Document</MongooseDocsLink> & <MongooseDocsLink type="subDocument">Sub Document</MongooseDocsLink>

<div class="container">
  <div class="row">
    <div class="col col-6">
        A <strong>Document</strong> is a class:
        <ul>
             <li>Decorated with @GtDocument</li>
             <li>Extends GtModel()</li>
        </ul>
    </div>
    <div class="col col-6">
        A <strong>Subdocument</strong> is a class:
        <ul>
             <li>Decorated with @GtSubDocument</li>
             <li>Extends GtResource()</li>
        </ul>
    </div>
  </div>
</div>

```ts
import { GtSubDocument, GtResource, GtDocument, GtModel, GtColumn } from '@pebula/goosetyped';

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
  address: Address;
}
```

## Document Options (metadata)

Most of the metadata options are straight-forward and well documented in the Api Docs.

For depp inspection check <ApiDocsLink type="interface" symbol="GtDocumentMetadataArgs"></ApiDocsLink> & <ApiDocsLink type="interface" symbol="GtSubDocumentMetadataArgs"></ApiDocsLink>

We will cover some of them here:

#### GtSubDocumentMetadataArgs.noId

This will disable the automatic `_id` set for every sub document. <MongooseDocsLink type="schema" hash="_id">Read more here...</MongooseDocsLink>

:::caution
Since Document model must have an id, this is only valid for SubDocuments
:::

#### GtDocumentMetadataArgs.connectionId

The connection id to use when creating the model.

When not set, **GooseTyped** will use the default connection.
When set, **GooseTyped** will use the registered connection to compile the model at the defined stage in the connections life.

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

At this point the model class is available, but it **is not connect** to mongoose so no point of creating new instances of it...

```typescript
const connection = mongoose.createConnection('localhost',{ /* ...*/ });
const ready = addConnection('myConnection', () => connection);
await ready;
```

Once `ready` resolves we have a guarantee that all models are compiled and bound to the connection.

:::note
Deffered model compilation is explained in more detail in the <DocLink to="docs/advanced/async-model-compilation">Async Model Compilation</DocLink>.
:::
