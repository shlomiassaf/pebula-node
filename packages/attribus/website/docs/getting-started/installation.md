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
$ yarn add @pebula/attribus
```

</TabItem>

<TabItem value="npm">

```bash
$ npm install @pebula/attribus
```

</TabItem>
</Tabs>

Now we need to configure the register the library and start binding to Service Bus entities...
