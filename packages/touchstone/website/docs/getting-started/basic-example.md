---
id: basic-example
title: Basic Usage
sidebar_label: 3. Basic Usage
---

To run a benchmark you need

- At least one benchmark **Case**
- At least one **Suite**, grouping the case/s.
- At touchstone configuration container, used for configuration, composition, etc... (not mandatory)

We start with a **Suite** and 2 **Cases** benchmarks:

```typescript
import { Suite, Case } from '@pebula/touchstone';

@Suite({ name: 'My First Benchmark Suite' })
class MyFirstBenchmarkSuite {
 @Case({ name: 'my-first-benchmark' })
  firstBenchmark() {
    /* Benchmarking... */
  }

  @Case()
  async secondBenchmark() {
     // Will automatically detect that it's async. Name is taken from method name.
    /* Benchmarking... */
  }
}
```

We can add more suites with cases or add cases to the existing suite.

At this point we can call `await touchStone()` to execute the suites or we can
use a touchstone configuration container and let it execute automatically.

Now we add the configuration container:

```typescript
@TouchStone()
class MyPerformanceTest extends Mixin(SimpleConsoleReporter, VegaLiteReporter) {
  benchmarkOptions = {
    delay: 0.5,
    initCount: 5,
  };

  getVegaLiteReporterFilename() {
    return 'my-benchmarks';
  }

  getVegaLiteReporterFileOrientation() {
    return 'vertical' as 'vertical';
  }
}
```

The process will start benchmarking at the next tick automatically.

Note that we can define the default benchmark options (`benchmarkOptions`) which will apply to all cases.

:::tip
You can define the `benchmarkOptions` per **Suite** and per **Case**, at each level the options from the parent level are cloned and the new
options are merged into them (override).
:::

The mixins add methods to the class `MyPerformanceTest` which we can override thus enabling configuration for each reporter in a JS native way.

The method `getVegaLiteReporterFilename()` is called from `VegaLiteReporter` which also holds a default implementation for it, if we override it
we can control some of the configuration.

:::info
Note that the container `MyPerformanceTest` get instantiated and the instance is used as the context (`this`) for all life cycle events by default.
This is also true for classes decorated with **Suite**, i.e. life cycle events defined on the **Suite** share a context (`this`).
:::

:::warning
By default, **@Case()** methods are **NOT** invoked with a context, even though they are class members.  
This is done to prevent any impact on the benchmark results.

If you wish to provide the suite's instance to the case method, same as done for life cycle methods you need to set
the `caseInvokeType` property in the `@Suite()` metadata argument parameter.

```typescript
@Suite({ caseInvokeType: 'method' })
class MyCase {
  private myProp: number;

  @OnStart()
  start() {
    this.myProp = 99; // can also be done in the constructor
  }

  @Case()
  validate() {
    const oneHundred = this.myProp + 1;
    // oneHundred -> 100
  }
}
```

It is recommended to initialize suite's in the `@OnStart` life cycle event and not in the constructor.  
This way you will never define a constructor in a mixin class, which in the case of mixins never run!
:::
