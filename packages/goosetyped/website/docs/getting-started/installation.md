---
id: installation
title: Installation
sidebar_label: 2. Installation
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To get started install the package:

<Tabs defaultValue="yarn" values={[
  { label: 'Yarn', value: 'yarn', },
  { label: 'NPM', value: 'npm', },
]}>

<TabItem value="yarn">

```bash
$ yarn add @pebula/goosetyped
```

</TabItem>

<TabItem value="npm">

```bash
$ npm install @pebula/goosetyped
```

</TabItem>
</Tabs>

:::info
**GooseTyped** requires `mongoose` and it's pre-requisites installed, it does not install them for you.
:::

Now, just start defining models using the tools provided by **GooseTyped**.

By default, all models are attached to the default mongoose connection but you can assign models to a specific connection which
is also how you can implement deffered model compilation, more on this in future chapters...
