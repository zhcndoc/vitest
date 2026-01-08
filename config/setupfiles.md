---
title: setupFiles | Config
outline: deep
---

# setupFiles

- **类型:** `string | string[]`

<<<<<<< HEAD
setup 文件的路径。它们将在每个测试文件之前运行。
=======
Paths to setup files resolved relative to the [`root`](/config/root). They will run before each _test file_ in the same process. By default, all test files run in parallel, but you can configure it with [`sequence.setupFiles`](/config/sequence#sequence-setupfiles) option.

Vitest will ignore any exports from these files.

:::warning
Note that setup files are executed in the same process as tests, unlike [`globalSetup`](/config/globalsetup) that runs once in the main thread before any test worker is created.
:::
>>>>>>> b2d8febfad9f50536b8e8bd01ff1bc116497f6f5

:::info
编辑设置文件将自动触发所有测试的重新运行。
:::

<<<<<<< HEAD
你可以在全局设置文件中使用 `process.env.VITEST_POOL_ID`（类似整数的字符串）来区分不同的线程。

:::tip
请注意，如果运行 [`--isolate=false`](#isolate)，这个配置文件将在全局范围内多次运行。这意味着每次测试前都要访问同一个全局对象，因此请确保不要重复做同一件事。
:::
=======
If you have a heavy process running in the background, you can use `process.env.VITEST_POOL_ID` (integer-like string) inside to distinguish between workers and spread the workload.

:::warning
If [isolation](/config/isolate) is disabled, imported modules are cached, but the setup file itself is executed again before each test file, meaning that you are accessing the same global object before each test file. Make sure you are not doing the same thing more than necessary.
>>>>>>> b2d8febfad9f50536b8e8bd01ff1bc116497f6f5

比如，你可能依赖于一个全局变量：

```ts
import { config } from '@some-testing-lib'

if (!globalThis.setupInitialized) {
  config.plugins = [myCoolPlugin]
  computeHeavyThing()
  globalThis.setupInitialized = true
}

<<<<<<< HEAD
// 钩子函数会在每个测试套件前重置
=======
// hooks reset before each test file
>>>>>>> b2d8febfad9f50536b8e8bd01ff1bc116497f6f5
afterEach(() => {
  cleanup()
})

globalThis.resetBeforeEachTest = true
```
:::
