---
id: introduction
title: Introduction
sidebar_label: 1. Introduction
---
import ExtRelativeLink from '@site/src/theme/ExtRelativeLink';

**touchstone** is a metadata-driven benchmarking framework, built on top of [benchmark.js](https://benchmarkjs.com/)

## Declarative Benchmarks

With **touchstone** you define your benchmark like this:

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

## Life Cycle Events

All `benchmark.js` event are wrapped and delivered in a normalized manner:

```typescript
@Suite()
class TestSuite {
  @OnStart() start(event: SuiteStartEvent) { }

  @OnCaseComplete() caseComplete(event: CaseCompleteEvent) { }

  @OnComplete() complete(event: SuiteCompleteEvent) { }

  // @OnReset, @OnAbort, @OnError
}
```

:::info
There are additional, touchstone specific, events...
:::

## Composition & Re-use

**touchstone** is fully extensible through inheritance or composition (mixins):

```typescript
import { Suite, Case, Mixin, VegaLiteReporter, SimpleConsoleReporter } from '@pebula/touchstone';

@Suite({ name: 'My First Benchmark Suite' })
class MyFirstBenchmarkSuite extends Mixin(SimpleConsoleReporter, VegaLiteReporter) {
 @Case({ name: 'my-first-benchmark' })
  firstBenchmark() {
    /* Benchmarking... */
  }
}
```

In the example above we `Mixin` reporting behavior from 2 built-in reporters:

- `SimpleConsoleReporter` - Will log progress to the console
- `VegaLiteReporter` - Will output HTML, SVG and PNG charts using [vega-lite](https://vega.github.io/vega-lite/)

## TouchStone Events

There are 2 **touchstone** events:

- `@OnTouchStoneStart()` - Fired with the `TouchStoneStartEvent` event context parameter
- `@OnTouchStoneEnd()` - Fired with the `TouchStoneEndEvent` event context parameter (which contains the `SuiteResult[]` property)

Both events can be registered on any suite.

## Multiple Suites

You can declare multiple suite's, **touchstone** will execute them one after the other.

:::tip
Because multiple suites can be used for a single run it might not make sense to register mixins on the suite.
For suite events this might be ok but the **touchstone** start/end events will trigger multiple times, once for every suite.

For this scenario, and in general, we recommend using a container to manage all mixins, configuration, etc...
The container events will invoke once for all of the events in the system. (i.e. A case complete event, from any suite, will fire once on the container)
:::

## Execute

To execute the suite/s and start benchmarking you need to invoke the `touchStone()` function.

```typescript
import { Suite, Case, touchStone } from '@pebula/touchstone';

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

await touchStone();
```

:::tip
When using a touchstone configuration container you don't need to call `touchStone()`, the benchmark
will automatically execute.
:::

## Demo

The following is the output of the a demo benchmark application: <ExtRelativeLink to="demo/benchmark-chart.html">benchmark-chart</ExtRelativeLink>

