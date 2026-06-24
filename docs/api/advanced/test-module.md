# TestModule

`TestModule` 类代表单个项目中的单个模块。此类仅在主线程中可用。如果您正在处理运行时任务，请参阅 ["Runner API"](/api/advanced/runner#tasks)。

`TestModule` 实例始终具有值为 `module` 的 `type` 属性。您可以使用它来区分不同的任务类型：

```ts
if (task.type === 'module') {
  task // TestModule 实例
}
```

::: warning 扩展套件方法
`TestModule` 类继承自 [`TestSuite`](/api/advanced/test-suite) 的所有方法和属性。本指南仅列出 `TestModule` 独有的方法和属性。
:::

## moduleId

这通常是一个绝对的 Unix 文件路径（即使在 Windows 上）。如果文件不在磁盘上，它可能是一个虚拟 id。此值对应于 Vite 的 `ModuleGraph` id。

```ts
'C:/Users/Documents/project/example.test.ts' // ✅
'/Users/mac/project/example.test.ts' // ✅
'C:\\Users\\Documents\\project\\example.test.ts' // ❌
```

## relativeModuleId

相对于项目的模块 id。这与已弃用 API 中的 `task.name` 相同。

```ts
'project/example.test.ts' // ✅
'example.test.ts' // ✅
'project\\example.test.ts' // ❌
```

## viteEnvironment <Version>4.1.0</Version> {#viteenvironment}

这是一个 Vite 的 [`DevEnvironment`](https://vite.dev/guide/api-environment)，用于转换测试模块中的所有文件。

::: details 历史
- `v4.0.15`：作为实验性功能添加
:::

## state

```ts
function state(): TestModuleState
```

工作方式与 [`testSuite.state()`](/api/advanced/test-suite#state) 相同，但如果模块尚未执行，也可以返回 `queued`。

## meta <Version>3.1.0</Version> {#meta}

```ts
function meta(): TaskMeta
```

在模块执行或收集期间附加到模块的自定义 [元数据](/api/advanced/metadata)。可以通过在测试运行期间将属性分配给 `task.meta` 对象来附加元数据：

```ts {5,10}
import { test } from 'vitest'

describe('the validation works correctly', (task) => {
  // 在收集期间分配 "decorated"
  task.file.meta.decorated = false

  test('some test', ({ task }) => {
    // 在测试运行期间分配 "decorated"，它将可用
    // 仅在 onTestCaseReady 钩子中
    task.file.meta.decorated = false
  })
})
```

:::tip
如果元数据是在收集期间附加的（在 `test` 函数之外），那么它在自定义报告器中的 [`onTestModuleCollected`](./reporters#ontestmodulecollected) 钩子中将可用。
:::

## diagnostic

```ts
function diagnostic(): ModuleDiagnostic
```

关于模块的有用信息，如持续时间、内存使用情况等。如果模块尚未执行，所有诊断值将返回 `0`。

```ts
interface ModuleDiagnostic {
  /**
   * 导入和启动环境所需的时间。
   */
  readonly environmentSetupDuration: number
  /**
   * Vitest 设置测试 harness（运行器、模拟等）所需的时间。
   */
  readonly prepareDuration: number
  /**
   * 导入测试模块所需的时间。
   * 这包括导入模块中的所有内容并执行套件回调。
   */
  readonly collectDuration: number
  /**
   * 导入设置模块所需的时间。
   */
  readonly setupDuration: number
  /**
   * 模块中所有测试和钩子的累计持续时间。
   */
  readonly duration: number
  /**
   * 模块使用的内存量（以字节为单位）。
   * 仅当测试使用 `logHeapUsage` 标志执行时，此值才可用。
   */
  readonly heap: number | undefined
  /**
   * Vitest 处理的每个非外部化依赖项的导入耗时。
   */
  readonly importDurations: Record<string, ImportDuration>
  /**
   * The id of the worker that ran this file. This value cannot be higher than `maxWorkers`.
   * If file did not run yet, this will be 0.
   *
   * **Warning**: Node.js tests and browser tests run in different pools and do not share `concurrencyId`.
   * It is possible to have multiple modules with the same `concurrencyId` because of that.
   * Use `project.isBrowserEnabled()` to distinguish the concurrency.
   */
  readonly concurrencyId: number
  /**
   * Incremental number of the worker that ran this file. This number increases with each worker.
   * If file did not run yet, this will be 0.
   *
   * **Warning**: Node.js tests and browser tests run in different pools and do not share `workerId`.
   * It is possible to have multiple modules with the same `workerId` because of that.
   * Use `project.isBrowserEnabled()` to distinguish the concurrency.
   */
  readonly workerId: number
}

/** 导入和执行非外部化文件所花费的时间。 */
interface ImportDuration {
  /** 导入和执行文件本身所花费的时间，不计该文件执行的所有非外部化导入。 */
  selfTime: number

  /** 导入和执行文件及其所有导入所花费的时间。 */
  totalTime: number
}
```

## logs <Version>5.0.0</Version> {#logs}

```ts
function logs(): ReadonlyArray<UserConsoleLog>
```

在测试收集期间记录在模块顶层的 Console 日志。例如：

```ts
console.log('included') // [!code highlight]

describe('suite', () => {
  console.log('not included') // [!code error]

  test('test', () => {
    console.log('not included') // [!code error]
  })
})
```

## toTestSpecification <Version>4.1.0</Version> {#totestspecification}

```ts
function toTestSpecification(testCases?: TestCase[]): TestSpecification
```

返回一个新的 [测试规范](/api/advanced/test-specification)，可用于过滤或运行此特定测试模块。

它接受一个可选的测试用例数组进行过滤。
