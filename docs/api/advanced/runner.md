# 运行器 API <Badge type="danger">高级</Badge>

::: warning
这是一个高级 API。如果你只是想 [运行测试](/guide/)，可能不需要它。它主要由库作者使用。
:::

你可以在配置文件中通过 `runner` 选项指定测试运行器的路径。该文件应当默认导出一个类构造函数，并实现以下方法：

```ts
export interface VitestRunner {
  /**
   * 在实际收集和运行测试之前首先被调用。
   */
  onBeforeCollect?: (paths: string[]) => unknown
  /**
   * 在收集测试之后且在 "onBeforeRun" 之前调用。
   */
  onCollected?: (files: File[]) => unknown

  /**
   * 当测试运行器应当取消下一次测试运行时调用。
   * 运行器应监听此方法，并在调用时在 "onBeforeRunSuite" 和 "onBeforeRunTask" 中将测试和套件标记为跳过。
   */
  onCancel?: (reason: CancelReason) => unknown

  /**
   * 在运行单个测试之前调用。此时还没有 "result"。
   */
  onBeforeRunTask?: (test: Test) => unknown
  /**
   * 在实际运行测试函数之前调用。此时已经有包含 "state" 和 "startTime" 的 "result"。
   */
  onBeforeTryTask?: (test: Test, options: { retry: number; repeats: number }) => unknown
  /**
   * 在设置结果和状态之后调用。
   */
  onAfterRunTask?: (test: Test) => unknown
  /**
   * 就在运行测试函数之后调用。此时还没有新状态。如果测试函数抛出错误，则不会被调用。
   */
  onAfterTryTask?: (test: Test, options: { retry: number; repeats: number }) => unknown
  /**
   * 在重试解析发生后调用。与 `onAfterTryTask` 不同，此时测试现在有了新状态。
   * 此时所有的 `after` 钩子也都已经被调用了。
   */
  onAfterRetryTask?: (test: Test, options: { retry: number; repeats: number }) => unknown

  /**
   * 在运行单个套件之前调用。此时还没有 "result"。
   */
  onBeforeRunSuite?: (suite: Suite) => unknown
  /**
   * 在运行单个套件之后调用。此时拥有状态和结果。
   */
  onAfterRunSuite?: (suite: Suite) => unknown

  /**
   * 如果定义了此方法，将代替通常的 Vitest 套件分区和处理被调用。
   * "before" 和 "after" 钩子不会被忽略。
   */
  runSuite?: (suite: Suite) => Promise<void>
  /**
   * 如果定义了此方法，将代替通常的 Vitest 处理被调用。如果你有自己的自定义测试函数，这很有用。
   * "before" 和 "after" 钩子不会被忽略。
   */
  runTask?: (test: TaskPopulated) => Promise<void>

  /**
   * 当任务更新时调用。与报告器中的 "onTaskUpdate" 相同，但这是在与测试相同的线程中运行。
   */
  onTaskUpdate?: (task: [string, TaskResult | undefined, TaskMeta | undefined][]) => Promise<void>

  /**
   * 在运行收集路径中的所有测试之前调用。
   */
  onBeforeRunFiles?: (files: File[]) => unknown
  /**
   * 就在运行收集路径中的所有测试之后调用。
   */
  onAfterRunFiles?: (files: File[]) => unknown
  /**
   * 当为测试定义新上下文时调用。如果你想向上下文添加自定义属性，这很有用。
   * 如果你只是想用运行器定义自定义上下文，考虑改用 "setupFiles" 中的 "beforeAll"。
   */
  extendTaskContext?: (context: TestContext) => TestContext
  /**
   * 当导入某些文件时调用。可以在两种情况下调用：收集测试和导入设置文件。
   */
  importFile: (filepath: string, source: VitestRunnerImportSource) => unknown
  /**
   * 当运行器尝试在 `test.extend` 中使用 `{ injected: true }` 获取值时调用的函数
   */
  injectValue?: (key: string) => unknown
  /**
   * 公开可用的配置。
   */
  config: SerializedConfig
  /**
   * 当前池的名称。它可能会影响服务器端堆栈跟踪的推断方式。
   */
  pool?: string
}
```

当初始化这个类时，Vitest 会传入 Vitest 配置，你应该将其作为 `config` 属性暴露：

```ts [runner.ts]
import type { RunnerTestFile, SerializedConfig, TestRunner, VitestTestRunner } from 'vitest'

class CustomRunner extends TestRunner implements VitestTestRunner {
  public config: SerializedConfig

  constructor(config: SerializedConfig) {
    this.config = config
  }

  onAfterRunFiles(files: RunnerTestFile[]) {
    console.log('finished running', files)
  }
}

export default CustomRunner
```

::: warning
Vitest 还会从 `vite/module-runner` 注入一个 `ModuleRunner` 实例作为 `moduleRunner` 属性。你可以在 `importFile` 方法中使用它来处理文件（这是 `TestRunner` 和 `BenchmarkRunner` 的默认行为）。

`ModuleRunner` 暴露了 `import` 方法，用于在对 Vite 友好的环境中导入测试文件。这意味着，它会在运行时解析导入并转换文件内容，以便 Node 能够理解它：

```ts
export default class Runner {
  async importFile(filepath: string) {
    await this.moduleRunner.import(filepath)
  }
}
```
:::

::: warning
如果你没有自定义运行器，或者未定义 `runTest` 方法，Vitest 将尝试自动检索任务。如果你没有使用 `setFn` 添加函数，它将失败。
:::

::: tip
快照支持和其他一些功能依赖于运行器。如果你不想失去它，可以从 `vitest` 中导入的 `TestRunner` 扩展你的运行器。如果你想扩展基准测试功能，它还暴露了 `NodeBenchmarkRunner`。
:::

## 任务

::: warning
“运行器任务 API” 是实验性的，应该主要仅在测试运行时使用。Vitest 还暴露了 [“已报告任务 API”](/api/advanced/test-module)，在主线程中工作时（例如在报告器内部）应优先使用它。

团队目前正在讨论未来是否应该用 “已报告任务” 替换 “运行器任务”。
:::

套件和测试在内部被称为 `任务`。Vitest 运行器在收集任何测试之前会启动一个 `File` 任务——它是 `Suite` 的超集，并带有几个额外的属性。它在每个任务（包括 `File`）上都可作为 `file` 属性使用。

```ts
interface File extends Suite {
  /**
   * 文件所属池的名称。
   * @default 'forks'
   */
  pool?: string
  /**
   * UNIX 格式的文件路径。
   */
  filepath: string
  /**
   * 文件所属测试项目的名称。
   */
  projectName: string | undefined
  /**
   * 收集文件中所有测试所花费的时间。
   * 此时间还包括导入所有文件依赖项。
   */
  collectDuration?: number
  /**
   * 导入设置文件所花费的时间。
   */
  setupDuration?: number
}
```

每个套件都有一个 `tasks` 属性，该属性在收集阶段填充。这对于从上到下遍历任务树很有用。

```ts
interface Suite extends TaskBase {
  type: 'suite'
  /**
   * 文件任务。它是文件的根任务。
   */
  file: File
  /**
   * 作为套件一部分的任务数组。
   */
  tasks: Task[]
}
```

每个任务都有一个 `suite` 属性，引用它所在的套件。如果 `test` 或 `describe` 在顶层启动，它们将不会有 `suite` 属性（它**不**等于 `file`！）。`File` 也永远没有 `suite` 属性。这对于从上到下遍历任务很有用。

```ts
interface Test<ExtraContext = object> extends TaskBase {
  type: 'test'
  /**
   * 将传递给测试函数的测试上下文。
   */
  context: TestContext & ExtraContext
  /**
   * 文件任务。它是文件的根任务。
   */
  file: File
  /**
   * 任务是否通过调用 `context.skip()` 被跳过。
   */
  pending?: boolean
  /**
   * 如果任务失败，它是否应该成功。如果任务失败，它将被标记为通过。
   */
  fails?: boolean
  /**
   * 存储 Promise（来自异步 expects），以便在结束测试之前等待它们
   */
  promises?: Promise<any>[]
}
```

每个任务都可以有一个 `result` 字段。只有当套件回调或 `beforeAll`/`afterAll` 回调抛出错误，从而阻止它们收集测试时，套件才会有此字段。测试在回调被调用后总是有这个字段——`state` 和 `errors` 字段会根据结果存在。如果在 `beforeEach` 或 `afterEach` 回调中抛出错误，抛出的错误将出现在 `task.result.errors` 中。

```ts
export interface TaskResult {
  /**
   * 任务的状态。在收集期间继承 `task.mode`。
   * 当任务完成时，它将更改为 `pass` 或 `fail`。
   * - **pass**: 任务运行成功
   * - **fail**: 任务失败
   */
  state: TaskState
  /**
   * 任务执行期间发生的错误。如果 `expect.soft()` 多次失败，可能会有多个错误。
   */
  errors?: TestError[]
  /**
   * 任务运行花费了多少毫秒。
   */
  duration?: number
  /**
   * 任务开始运行时的毫秒时间。
   */
  startTime?: number
  /**
   * 任务结束后的堆大小（字节）。
   * 仅在设置了 `logHeapUsage` 选项且定义了 `process.memoryUsage` 时可用。
   */
  heap?: number
  /**
   * 与此任务相关的钩子的状态。在报告期间很有用。
   */
  hooks?: Partial<Record<'afterAll' | 'beforeAll' | 'beforeEach' | 'afterEach', TaskState>>
  /**
   * 任务重试的次数。仅当任务失败且设置了 `retry` 选项时才会重试任务。
   */
  retryCount?: number
  /**
   * 任务重复的次数。仅当设置了 `repeats` 选项时才会重复任务。此数字也包含 `retryCount`。
   */
  repeatCount?: number
}
```

## 你的任务函数

Vitest 暴露了 `createTaskCollector` 工具来创建你自己的 `test` 方法。它的行为与测试相同，但会在收集期间调用自定义方法。

任务是作为套件一部分的对象。它会通过 `suite.task` 方法自动添加到当前套件：

```js [custom.js]
export { afterAll, beforeAll, describe, TestRunner } from 'vitest'

// 这个函数会在收集阶段被调用：
// 不要在这里直接调用函数处理器；请将其添加到套件任务中
// 使用 "getCurrentSuite().task()" 方法
// 注意：createTaskCollector 提供对 "todo"/"each"/... 的支持
export const myCustomTask = TestRunner.createTaskCollector(
  function (name, fn, timeout) {
    TestRunner.getCurrentSuite().task(name, {
      ...this, // 这样 "todo"/"skip"/... 就能被正确跟踪
      meta: {
        customPropertyToDifferentiateTask: true
      },
      handler: fn,
      timeout,
    })
  }
)
```

```js [tasks.test.js]
import {
  afterAll,
  beforeAll,
  describe,
  myCustomTask
} from './custom.js'
import { gardener } from './gardener.js'

describe('照料花园', () => {
  beforeAll(() => {
    gardener.putWorkingClothes()
  })

  myCustomTask('除草', () => {
    gardener.weedTheGrass()
  })
  myCustomTask.todo('修剪草坪', () => {
    gardener.mowerTheLawn()
  })
  myCustomTask('给花浇水', () => {
    gardener.waterFlowers()
  })

  afterAll(() => {
    gardener.goHome()
  })
})
```

```bash
vitest ./garden/tasks.test.js
```
