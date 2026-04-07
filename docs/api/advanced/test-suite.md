# TestSuite

`TestSuite` 类表示单个套件。此类仅在主线程中可用。如果您正在处理运行时任务，请参阅 ["Runner API"](/api/advanced/runner#tasks)。

`TestSuite` 实例始终具有值为 `suite` 的 `type` 属性。您可以使用它来区分不同的任务类型：

```ts
if (task.type === 'suite') {
  task // TestSuite
}
```

## project

这引用了测试所属的 [`TestProject`](/api/advanced/test-project)。

## module

这是对定义测试的 [`TestModule`](/api/advanced/test-module) 的直接引用。

## name

这是传递给 `describe` 函数的套件名称。

```ts
import { describe } from 'vitest'

// [!code word:'the validation logic']
describe('the validation logic', () => {
  // ...
})
```

## fullName

套件名称，包括所有父套件，用 `>` 符号分隔。此套件的全名为 "the validation logic > validating cities"：

```ts
import { describe, test } from 'vitest'

// [!code word:'the validation logic']
// [!code word:'validating cities']
describe('the validation logic', () => {
  describe('validating cities', () => {
    // ...
  })
})
```

## id

这是套件的唯一标识符。此 ID 是确定的，并且在多次运行中对于同一套件将保持不变。该 ID 基于 [项目](/api/advanced/test-project) 名称、模块 ID 和套件顺序。

ID 看起来像这样：

```
1223128da3_0_0_0
^^^^^^^^^^ 文件哈希
           ^ 套件索引
             ^ 嵌套套件索引
               ^ 测试索引
```

::: tip
您可以使用 `vitest/node` 中的 `generateFileHash` 函数生成文件哈希，该函数自 Vitest 3 起可用：

```ts
import { generateFileHash } from 'vitest/node'

const hash = generateFileHash(
  '/file/path.js', // 相对路径
  undefined, // 项目名称，如果未设置则为 `undefined`
)
```
:::

::: danger
不要尝试解析 ID。它在开头可能有一个减号：`-1223128da3_0_0_0`。
:::

## location

套件在模块中定义的位置。仅在配置中启用了 [`includeTaskLocation`](/config/includetasklocation) 时才会收集位置。请注意，如果使用了 `--reporter=html`、`--ui` 或 `--browser` 标志，此选项会自动启用。

此套件的位置将等于 `{ line: 3, column: 1 }`：

```ts:line-numbers {3}
import { describe } from 'vitest'

describe('the validation works correctly', () => {
  // ...
})
```

## parent

父套件。如果套件是直接在该 [模块](/api/advanced/test-module) 内部调用的，则父级将是模块本身。

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
  readonly mode: 'run' | 'only' | 'skip' | 'todo'
}
```

套件收集时所带的选项。

## children

这是当前套件内所有套件和测试的 [集合](/api/advanced/test-collection)。

```ts
for (const task of suite.children) {
  if (task.type === 'test') {
    console.log('test', task.fullName)
  }
  else {
    // task 是 TaskSuite
    console.log('suite', task.name)
  }
}
```

::: warning
请注意，`suite.children` 仅迭代第一层嵌套，不会更深。如果您需要迭代所有测试或套件，请使用 [`children.allTests()`](/api/advanced/test-collection#alltests) 或 [`children.allSuites()`](/api/advanced/test-collection#allsuites)。如果您需要迭代所有内容，请使用递归函数：

```ts
function visit(collection: TestCollection) {
  for (const task of collection) {
    if (task.type === 'suite') {
      // 报告一个套件
      visit(task.children)
    }
    else {
      // 报告一个测试
    }
  }
}
```
:::

## ok

```ts
function ok(): boolean
```

检查套件是否有任何失败的测试。如果套件在收集期间失败，这也将返回 `false`。在这种情况下，请检查 [`errors()`](#errors) 以获取抛出的错误。

## state

```ts
function state(): TestSuiteState
```

检查套件的运行状态。可能的返回值：

- **pending**：此套件中的测试尚未完成运行。
- **failed**：此套件有失败的测试或无法收集它们。如果 [`errors()`](#errors) 不为空，则表示套件未能收集测试。
- **passed**：此套件内的每个测试都已通过。
- **skipped**：此套件在收集期间被跳过。

::: warning
请注意，[测试模块](/api/advanced/test-module) 也有一个 `state` 方法返回相同的值，但如果模块尚未执行，它还可以返回额外的 `queued` 状态。
:::

## errors

```ts
function errors(): TestError[]
```

在收集期间测试运行之外发生的错误，例如语法错误。

```ts {4}
import { describe } from 'vitest'

describe('collection failed', () => {
  throw new Error('a custom error')
})
```

::: warning
请注意，错误被序列化为简单对象：`instanceof Error` 将始终返回 `false`。
:::

## meta <Version>3.1.0</Version> {#meta}

```ts
function meta(): TaskMeta
```

在套件执行或收集期间附加到套件的自定义 [元数据](/api/advanced/metadata)。自 Vitest 4.1 起，可以通过在测试收集期间提供 `meta` 对象来附加元数据：

```ts {7,10}
import { describe, test, TestRunner } from 'vitest'

describe('the validation works correctly', { meta: { decorated: true } }, () => {
  test('some test', ({ task }) => {
    // 在测试运行期间分配 "decorated"，它将可用
    // 仅在 onTestCaseReady 钩子中
    task.suite.meta.decorated = false

    // 测试继承套件的元数据
    task.meta.decorated === true
  })
})
```

请注意，自 Vitest 4.1 起，套件元数据将被测试继承。

:::tip
如果元数据是在收集期间附加的（在 `test` 函数之外），那么它将在自定义报告器中的 [`onTestModuleCollected`](./reporters#ontestmodulecollected) 钩子中可用。
:::

## toTestSpecification <Version>4.1.0</Version> {#totestspecification}

```ts
function toTestSpecification(): TestSpecification
```

返回一个新的 [测试规范](/api/advanced/test-specification)，可用于过滤或运行此特定测试套件。
