# TestCase

`TestCase` 类代表单个测试。此类仅在主线程中可用。如果你正在处理运行时任务，请参阅 ["Runner API"](/api/advanced/runner#tasks)。

`TestCase` 实例始终具有值为 `test` 的 `type` 属性。你可以用它来区分不同的任务类型：

```ts
if (task.type === 'test') {
  task // TestCase
}
```

## project

这引用了测试所属的 [`TestProject`](/api/advanced/test-project)。

## module

这是对定义测试的 [`TestModule`](/api/advanced/test-module) 的直接引用。

## name

这是传递给 `test` 函数的测试名称。

```ts
import { test } from 'vitest'

// [!code word:'the validation works correctly']
test('the validation works correctly', () => {
  // ...
})
```

## fullName

测试名称，包括所有父级套件，用 `>` 符号分隔。此测试的全名为 "the validation logic > the validation works correctly"：

```ts
import { describe, test } from 'vitest'

// [!code word:'the validation works correctly']
// [!code word:'the validation logic']
describe('the validation logic', () => {
  test('the validation works correctly', () => {
    // ...
  })
})
```

## id

这是测试的唯一标识符。此 ID 是确定的，并且在多次运行中对于同一个测试将是相同的。该 ID 基于 [project](/api/advanced/test-project) 名称、模块 ID 和测试顺序。

ID 看起来像这样：

```
1223128da3_0_0
^^^^^^^^^^ 文件哈希
           ^ 套件索引
             ^ 测试索引
```

::: tip
你可以使用 `vitest/node` 中的 `generateFileHash` 函数生成文件哈希，该函数自 Vitest 3 起可用：

```ts
import { generateFileHash } from 'vitest/node'

const hash = generateFileHash(
  '/file/path.js', // 相对路径
  undefined, // 项目名称，或如果未设置则为 undefined
)
```
:::

::: danger
不要尝试解析 ID。它开头可能有一个减号：`-1223128da3_0_0_0`。
:::

## location

测试在模块中定义的位置。仅当配置中启用了 [`includeTaskLocation`](/config/includetasklocation) 时才会收集位置信息。注意，如果使用了 `--reporter=html`、`--ui` 或 `--browser` 标志，此选项会自动启用。

此测试的位置将等于 `{ line: 3, column: 1 }`：

```ts:line-numbers {3}
import { test } from 'vitest'

test('the validation works correctly', () => {
  // ...
})
```

## parent

父级 [suite](/api/advanced/test-suite)。如果测试直接在 [module](/api/advanced/test-module) 内调用，父级将是模块本身。

## options

```ts
interface TaskOptions {
  readonly each: boolean | undefined
  readonly fails: boolean | undefined
  readonly concurrent: boolean | undefined
  readonly shuffle: boolean | undefined
  readonly retry: number | undefined
  readonly repeats: number | undefined
  readonly tags: string[] | undefined
  readonly timeout: number | undefined
  readonly mode: 'run' | 'only' | 'skip' | 'todo'
}
```

测试收集时的选项。

## tags <Version>4.1.0</Version> {#tags}

隐式或显式分配给测试的 [Tags](/guide/test-tags)。

## ok

```ts
function ok(): boolean
```

检查测试是否未导致套件失败。如果测试尚未完成或被跳过，它将返回 `true`。

## meta

```ts
function meta(): TaskMeta
```

测试执行期间附加到测试的自定义 [metadata](/api/advanced/metadata)。可以通过在测试运行期间将属性赋值给 `ctx.task.meta` 对象来附加元数据：

```ts {3,6}
import { test } from 'vitest'

test('the validation works correctly', ({ task }) => {
  // ...

  task.meta.decorated = false
})
```

如果测试尚未运行完毕，元数据将是一个空对象，除非它有静态元数据：

```ts
test('the validation works correctly', { meta: { decorated: true } })
```

自 Vitest 4.1 起，Vitest 继承定义在 [suite](/api/advanced/test-suite) 上的 [`meta`](/api/advanced/test-suite#meta) 属性。

## result

```ts
function result(): TestResult
```

测试结果。如果测试尚未完成或刚被收集，它将等于 `TestResultPending`：

```ts
export interface TestResultPending {
  /**
   * 测试已收集，但尚未运行完毕。
   */
  readonly state: 'pending'
  /**
   * 挂起的测试没有错误。
   */
  readonly errors: undefined
}
```

如果测试被跳过，返回值将是 `TestResultSkipped`：

```ts
interface TestResultSkipped {
  /**
   * 测试被 `skip` 或 `todo` 标志跳过。
   * 你可以在 `options.mode` 选项中看到使用了哪一个。
   */
  readonly state: 'skipped'
  /**
   * 跳过的测试没有错误。
   */
  readonly errors: undefined
  /**
   * 传递给 `ctx.skip(note)` 的自定义备注。
   */
  readonly note: string | undefined
}
```

::: tip
如果测试因为另一个测试有 `only` 标志而被跳过，`options.mode` 将等于 `skip`。
:::

如果测试失败，返回值将是 `TestResultFailed`：

```ts
interface TestResultFailed {
  /**
   * 测试执行失败。
   */
  readonly state: 'failed'
  /**
   * 测试执行期间抛出的错误。
   */
  readonly errors: ReadonlyArray<TestError>
}
```

如果测试通过，返回值将是 `TestResultPassed`：

```ts
interface TestResultPassed {
  /**
   * 测试成功通过。
   */
  readonly state: 'passed'
  /**
   * 测试执行期间抛出的错误。
   */
  readonly errors: ReadonlyArray<TestError> | undefined
}
```

::: warning
注意，处于 `passed` 状态的测试仍然可能附有错误——如果 `retry` 至少被触发过一次，就会发生这种情况。
:::

## diagnostic

```ts
function diagnostic(): TestDiagnostic | undefined
```

关于测试的有用信息，如持续时间、内存使用情况等：

```ts
interface TestDiagnostic {
  /**
   * 如果测试持续时间超过 `slowTestThreshold`。
   */
  readonly slow: boolean
  /**
   * 测试使用的内存量（字节）。
   * 仅当测试使用 `logHeapUsage` 标志执行时，此值才可用。
   */
  readonly heap: number | undefined
  /**
   * 执行测试所需的时间（毫秒）。
   */
  readonly duration: number
  /**
   * 测试开始的时间（毫秒）。
   */
  readonly startTime: number
  /**
   * 测试重试的次数。
   */
  readonly retryCount: number
  /**
   * 根据 `repeats` 选项配置，测试重复的次数。
   * 如果测试在重复期间失败且未配置 `retry`，此值可能较低。
   */
  readonly repeatCount: number
  /**
   * 如果测试在第二次重试时通过。
   */
  readonly flaky: boolean
}
```

::: info
如果测试尚未计划运行，`diagnostic()` 将返回 `undefined`。
:::

## annotations

```ts
function annotations(): ReadonlyArray<TestAnnotation>
```

测试执行期间通过 [`task.annotate`](/guide/test-context#annotate) API 添加的 [Test annotations](/guide/test-annotations)。

## artifacts <Version type="experimental">4.0.11</Version> <Experimental /> {#artifacts}

```ts
function artifacts(): ReadonlyArray<TestArtifact>
```

测试执行期间通过 `recordArtifact` API 记录的 [Test artifacts](/api/advanced/artifacts)。

## toTestSpecification <Version>4.1.0</Version> {#totestspecification}

```ts
function toTestSpecification(): TestSpecification
```

返回一个新的 [test specification](/api/advanced/test-specification)，可用于过滤或运行此特定测试用例。
