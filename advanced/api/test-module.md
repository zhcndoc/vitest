# TestModule

`TestModule` 类表示项目中的单个模块。此类仅在主线程中可用。如果你正在处理运行时任务，请参阅 [“Runner API”](/advanced/runner#tasks)。

`TestModule` 实例始终具有一个 `type` 属性，其值为 `module`。你可以使用它来区分不同的任务类型：

```ts
if (task.type === 'module') {
  task // TestModule
}
```

`TestModule` 继承了 [`TestSuite`](/advanced/api/test-suite) 的所有方法和属性。本指南将仅列出 `TestModule` 独有的方法和属性。

::: warning
我们计划引入一个新的 Reporter API，默认将使用此 API。目前，Reporter API 使用 [runner tasks](/advanced/runner#tasks)，但你仍然可以通过 `vitest.state.getReportedEntity` 方法访问 `TestModule`：

```ts
import type { RunnerTestFile, TestModule, Vitest } from 'vitest/node'

class Reporter {
  private vitest!: Vitest

  onInit(vitest: Vitest) {
    this.vitest = vitest
  }

  onFinished(files: RunnerTestFile[]) {
    for (const file of files) {
      const testModule = this.vitest.state.getReportedEntity(file) as TestModule
      console.log(testModule) // TestModule
    }
  }
}
```
:::

## moduleId

这通常是一个绝对的 Unix 文件路径（即使在 Windows 上也是如此）。如果文件不在磁盘上，它可以是一个虚拟 ID。此值对应于 Vite 的 `ModuleGraph` ID。

## diagnostic

```ts
function diagnostic(): ModuleDiagnostic
```

关于模块的有用信息，例如持续时间、内存使用等。如果模块尚未执行，所有诊断值将返回 `0`。

```ts
interface ModuleDiagnostic {
  /**
   * The time it takes to import and initiate an environment.
   */
  environmentSetupDuration: number
  /**
   * The time it takes Vitest to setup test harness (runner, mocks, etc.).
   */
  prepareDuration: number
  /**
   * The time it takes to import the test module.
   * This includes importing everything in the module and executing suite callbacks.
   */
  collectDuration: number
  /**
   * The time it takes to import the setup module.
   */
  setupDuration: number
  /**
   * Accumulated duration of all tests and hooks in the module.
   */
  duration: number
}
```
