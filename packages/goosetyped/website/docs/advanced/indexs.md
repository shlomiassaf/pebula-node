---
id: indexes
title: Indexes
sidebar_label: 1. Indexes
---
import ApiDocsLink from '@site/src/theme/ApiDocsLink';

# WIP

## Single Index

```typescript
import { GtDocument, GtModel } from '@pebula/goosetyped';

@GtDocument()
export class Person extends GtModel() {

  @GtIndex({ sort: 'asc' })
  @GtColumn()
  name: string;

  @GtIndex({ sort: 'desc' })
  @GtColumn()
  age: number;

  @GtIndex() // defaults to 'asc'
  @GtColumn()
  nickname: string;
```

Metadata: <ApiDocsLink type="interface" symbol="GtSingleIndexMetadataArgs"></ApiDocsLink>

## Compound Index

```typescript
import { GtDocument, GtModel } from '@pebula/goosetyped';

@GtIndex({
  indices: {
    name: 'asc';
    nickname: 'desc';
  },
  options: {
    test: true,
  }
})
@GtDocument()
export class Person extends GtModel() {

  @GtColumn()
  name: string;

  @GtColumn()
  age: number;

  @GtColumn()
  nickname: string;
```

Metadta: <ApiDocsLink type="interface" symbol="GtCompoundIndexMetadataArgs"></ApiDocsLink>