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
$ yarn add @pebula/nesbus
```

</TabItem>

<TabItem value="npm">

```bash
$ npm install @pebula/nesbus
```

</TabItem>
</Tabs>

Now we need to configure the register the library with **NestJS** and start binding to Service Bus entities...
