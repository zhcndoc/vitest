---
title: setupFiles | 配置
outline: deep
---

# setupFiles

- **类型：** `string | string[]`

相对于 [`root`](/config/root) 解析的设置文件路径。它们将在同一进程中的每个 _测试文件_ 之前运行。默认情况下，所有测试文件并行运行，但你可以使用 [`sequence.setupFiles`](/config/sequence#sequence-setupfiles) 选项进行配置。

Vitest 将忽略这些文件中的任何导出。

:::warning
请注意，设置文件在与测试相同的进程中执行，这与 [`globalSetup`](/config/globalsetup) 不同，后者在任何测试工作器创建之前在主线程中运行一次。
:::

:::info
编辑设置文件将自动触发所有测试的重新运行。
:::

如果你在后台运行一个繁重的进程，你可以在内部使用 `process.env.VITEST_POOL_ID`（类似整数的字符串）来区分工作器并分散工作负载。

:::warning
如果禁用了 [隔离](/config/isolate)，导入的模块会被缓存，但设置文件本身会在每个测试文件之前再次执行，这意味着你在每个测试文件之前访问的是同一个全局对象。确保你没有做超过必要的重复操作。

例如，你可能依赖一个全局变量：

```ts
import { config } from '@some-testing-lib'

if (!globalThis.setupInitialized) {
  config.plugins = [myCoolPlugin]
  computeHeavyThing()
  globalThis.setupInitialized = true
}

// 每个测试文件之前的钩子重置
afterEach(() => {
  cleanup()
})

globalThis.resetBeforeEachTest = true
```
:::
