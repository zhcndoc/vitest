---
title: fakeTimers | 配置
outline: deep
---

# fakeTimers

- **类型：** `FakeTimerInstallOpts`

当使用 [`vi.useFakeTimers()`](/api/vi#vi-usefaketimers) 时，Vitest 将传递给 [`@sinon/fake-timers`](https://npmx.dev/package/@sinonjs/fake-timers) 的选项。

## fakeTimers.now

- **类型：** `number | Date`
- **默认值：** `Date.now()`

使用指定的 Unix 纪元时间安装假计时器。

## fakeTimers.toFake

- **类型：** `('setTimeout' | 'clearTimeout' | 'setImmediate' | 'clearImmediate' | 'setInterval' | 'clearInterval' | 'Date' | 'nextTick' | 'hrtime' | 'requestAnimationFrame' | 'cancelAnimationFrame' | 'requestIdleCallback' | 'cancelIdleCallback' | 'performance' | 'queueMicrotask')[]`
- **默认值：** 全局可用的所有内容，除了 `nextTick` 和 `queueMicrotask`

一个包含要伪造的全局方法和 API 名称的数组。

如果只模拟 `setTimeout()` 和 `nextTick()`，请将此属性指定为 `['setTimeout', 'nextTick']`。

当使用 `--pool=forks` 在 `node:child_process` 内部运行 Vitest 时，不支持模拟 `nextTick`。NodeJS 在 `node:child_process` 内部使用 `process.nextTick`，如果对其进行模拟会导致挂起。当使用 `--pool=threads` 运行 Vitest 时，支持模拟 `nextTick`。

## fakeTimers.loopLimit

- **类型：** `number`
- **默认值：** `10_000`

调用 [`vi.runAllTimers()`](/api/vi#vi-runalltimers) 时将运行的计时器最大数量。

## fakeTimers.shouldAdvanceTime

- **类型：** `boolean`
- **默认值：** `false`

告诉 @sinonjs/fake-timers 根据真实系统时间的变化自动增加模拟时间（例如，真实系统时间每变化 20ms，模拟时间将增加 20ms）。

## fakeTimers.advanceTimeDelta

- **类型：** `number`
- **默认值：** `20`

仅在与 `shouldAdvanceTime: true` 一起使用时相关。真实系统时间每变化 advanceTimeDelta 毫秒，模拟时间就增加 advanceTimeDelta 毫秒。

## fakeTimers.shouldClearNativeTimers

- **类型：** `boolean`
- **默认值：** `true`

告诉假计时器通过委托给各自的处理程序来清除“原生”（即非假）计时器。如果禁用，且在启动假计时器会话之前存在计时器，则可能导致潜在的意外行为。
