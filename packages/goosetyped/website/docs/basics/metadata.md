---
id: metadata
title: Metadata
sidebar_label: 1. Metadata
---
import MongooseDocsLink from '@site/src/theme/MongooseDocsLink';

Metadata is the information required to define a model and we can divide it to 2 parts:

1. Column of the model and metadata about them
2. Metadata about the model itself (compound index's, collation, versioning, etc...)

## Mongoose metadata

In mongoose we define all the metadata in the `Schema` class.

1. Column metadata is defined by providing a `SchemaDefinition` object.
2. Metadata about the model is defined by providing a `SchemaOptions`.

```typescript
import { SchemaDefinition, SchemaOptions, Schema } from 'mongoose';

const columnMetadata: SchemaDefinition = {
  name: Schema.Types.String,
};

const modelMetadata: SchemaOptions = {
  collection: 'data',
};

var dataSchema = new Schema(columnMetadata, modelMetadata);
```

## GooseTyped metadata

In **GooseTyped** metadata is defined as part of the class definition, as an additional parameter sent to decorators.

In most cases the decorators does not require additional metadata and provide a default behavior that will usually suffice, however
if you wish to change it you can.

You'll notice that some metadata options will match directly to mongoose options and some will not. **GooseTyped** goal is to simplify how
models are defined and it abstracts away some of the options to reduce the complexity.

For example, the <MongooseDocsLink type="schema" hash="skipVersioning"></MongooseDocsLink> option is set on the model options
in mongoose but in **GooseTyped** it is set per column and **GooseTyped** will created the proper definition for the entire model
from all of the column.
