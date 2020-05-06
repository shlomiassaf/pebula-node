---
id: back-off
title: Backoff And Retry
sidebar_label: 2. Backoff And Retry
---
import ApiDocsLink from '@site/src/theme/ApiDocsLink';

Performs a retry of service bus messages that threw when handled over a pseudo-random, incremental intervals.

## Why

Sometimes the server might be overwhelmed by a large number of message being processed at the same time.
This can cause processing errors in various areas such as database, file system, network connection, etc...

Once a message fails, it will go back to service bus which will re-emit it immediately or throw it to a dead-letter pool.

Re-emitting the message is not good because our server is still stressed out, it is best to retry it laster, but how much later?

If we delay 5 seconds and we have multiple failed message we will hit the same scenario again, if we delay with the same
static interval on every failed attempt we might sync our retries with another process running in cycle.

What we need is chaos, re-emitting the messages at an increasing interval with each level getting a little distortion so it becomes a bit unpredictable.

## SbBackoffRetry

This is where the **SbBackoffRetry plugin** comes in.

It wraps the the incoming bus message handling and wait's for errors.
When error is thrown it will re-emit the message but with a certain delay, calculated based on your configuration.

### Backoff Algorithm

The calculated delay is effected by 2 values:

1. The current retry iteration (e.g. 1st try, 2nd try, 3rd try, nth try);
2. The plugin configuration

The configuration is defined in <ApiDocsLink type="interface" symbol="SbBackoffRetryOptions"></ApiDocsLink>:

- delay: the baseline interval(ms) to wait between each attempt
- delayType: 'linear' for linear increments in the delay between each retry. 'exponential' for exponential increments in the delay between each retry
- factor: a multiplier for the delay (mostly effective in exponential delay)
- distortFactor: how much randomness to introduce into the interval (higher value === more randomness).
For example, with a distortFactor of 10, the final delay will be multiplied by a value between 0.9 to 1.1

:::warning
Because [Transactions](https://github.com/Azure/azure-sdk-for-js/issues/8252) are not yet supported by `@azure/service-bus` using
`SbBackoffRetry` comes with a little risk.

`SbBackoffRetry` will emit a clone the original message and emit the cloned message upon retry, after then it will complete the failed message.

If emitting the closed message succeed but completing the failed message fails there will be 2 messages (with the same id) in the system.

This can be solved by enabling duplication checks but in any case once Transactions are out they will be used to eliminate this issue
:::