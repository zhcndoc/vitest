---
outline: deep
---

# 测试

- **别名:** `it`

```ts
function test(
  name: string | Function,
  body?: () => unknown,
  timeout?: number
): void
function test(
  name: string | Function,
  options: TestOptions,
  body?: () => unknown,
): void
```

`test` 或 `it` 定义了一组相关的期望。它接收测试名称和一个包含要测试的期望的函数。

可选地，你可以提供一个超时时间（毫秒）来指定等待多久后终止，或者提供一组 [其他选项](#test-options)。默认超时时间为 5 秒，可以通过 [`testTimeout`](/config/testtimeout) 全局配置。

```ts
import { expect, test } from 'vitest'

test('should work as expected', () => {
  expect(Math.sqrt(4)).toBe(2)
})
```

::: warning
如果第一个参数是一个函数，其 `name` 属性将被用作测试名称。该函数本身不会被调用。

如果未提供测试主体，则测试被标记为 `todo`。
:::

当测试函数返回一个 promise 时，运行器将等待其 resolved 以收集异步期望。如果 promise 被 rejected，测试将失败。

::: tip
在 Jest 中，`TestFunction` 也可以是 `(done: DoneCallback) => void` 类型。如果使用这种形式，测试直到调用 `done` 才会结束。你可以使用 `async` 函数实现相同的效果，请参阅 [迁移指南 Done Callback 部分](/guide/migration#done-callback)。
:::

## 测试选项

你可以通过在函数上链式调用属性来定义布尔选项：

```ts
import { test } from 'vitest'

test.skip('skipped test', () => {
  // 一些目前会失败的逻辑
})

test.concurrent.skip('skipped concurrent test', () => {
  // 一些目前会失败的逻辑
})
```

但你也可以提供一个对象作为第二个参数：

```ts
import { test } from 'vitest'

test('skipped test', { skip: true }, () => {
  // 一些目前会失败的逻辑
})

test('skipped concurrent test', { skip: true, concurrent: true }, () => {
  // 一些目前会失败的逻辑
})
```

它们的工作方式完全相同。使用哪一种纯粹是风格选择。

### timeout

- **类型:** `number`
- **默认值:** `5_000`（由 [`testTimeout`](/config/testtimeout) 配置）

测试超时时间（毫秒）。

::: warning
注意，如果你将超时时间作为最后一个参数提供，则不能再使用选项对象：

```ts
import { test } from 'vitest'

// ✅ 这样可以
test.skip('heavy test', () => {
  // ...
}, 10_000)

// ❌ 这样不行
test('heavy test', { skip: true }, () => {
  // ...
}, 10_000)
```

但是，你可以在对象内部提供超时时间：

```ts
import { test } from 'vitest'

// ✅ 这样可以
test('heavy test', { skip: true, timeout: 10_000 }, () => {
  // ...
})
```
:::

### retry

- **默认值:** `0`（由 [`retry`](/config/retry) 配置）
- **类型:**

```ts
type Retry = number | {
  /**
   * 如果测试失败，重试的次数。
   * @default 0
   */
  count?: number
  /**
   * 重试尝试之间的延迟（毫秒）。
   * @default 0
   */
  delay?: number
  /**
   * 根据错误确定是否应重试测试的条件。
   * - 如果是 RegExp，则针对错误消息进行测试
   * - 如果是函数，使用 TestError 对象调用；返回 true 以重试
   *
   * 注意：函数只能在测试文件中使用，不能在 vitest.config.ts 中使用，
   * 因为配置在传递给工作线程时会被序列化。
   *
   * @default undefined（对所有错误重试）
   */
  condition?: RegExp | ((error: TestError) => boolean)
}
```

测试的重试配置。如果是数字，指定重试次数。如果是对象，允许细粒度的重试控制。

注意，对象配置仅在 Vitest 4.1 及以上版本可用。

### repeats

- **类型:** `number`
- **默认值:** `0`

测试将再次运行的次数。如果设置为 `0`（默认值），测试将只运行一次。

这对于调试不稳定的测试很有用。

### tags <Version>4.1.0</Version> {#tags}

- **类型:** `string[]`
- **默认值:** `[]`

自定义用户 [标签](/guide/test-tags)。如果标签未在 [配置](/config/tags) 中指定，测试将在开始前失败，除非手动禁用 [`strictTags`](/config/stricttags)。

```ts
import { it } from 'vitest'

it('user returns data from db', { tags: ['db', 'flaky'] }, () => {
  // ...
})
```

### meta <Version>4.1.0</Version> {#meta}

- **类型:** `TaskMeta`

附加可在报告器中使用的自定义 [元数据](/api/advanced/metadata)。

::: warning
Vitest 会合并从套件或标签继承的顶层属性。但是，它不会对嵌套对象执行深度合并。

```ts
import { describe, test } from 'vitest'

describe(
  'nested meta',
  {
    meta: {
      nested: { object: true, array: false },
    },
  },
  () => {
    test(
      'overrides part of meta',
      {
        meta: {
          nested: { object: false }
        },
      },
      ({ task }) => {
        // task.meta === { nested: { object: false } }
        // 注意数组丢失了，因为 "nested" 对象被覆盖了
      }
    )
  }
)
```

如果可能，建议使用非嵌套的 meta。
:::

### concurrent

- **类型:** `boolean`
- **默认值:** `false`（由 [`sequence.concurrent`](/config/sequence#sequence-concurrent) 配置）
- **别名:** [`test.concurrent`](#test-concurrent)

此测试是否与套件中的其他并发测试并发运行。

### sequential

- **类型:** `boolean`
- **默认值:** `true`
- **别名:** [`test.sequential`](#test-sequential)

测试是否顺序运行。当同时指定 `concurrent` 和 `sequential` 时，`concurrent` 优先。

### skip

- **类型:** `boolean`
- **默认值:** `false`
- **别名:** [`test.skip`](#test-skip)

是否应跳过测试。

### only

- **类型:** `boolean`
- **默认值:** `false`
- **别名:** [`test.only`](#test-only)

此测试是否应该是套件中唯一运行的测试。

### todo

- **类型:** `boolean`
- **默认值:** `false`
- **别名:** [`test.todo`](#test-todo)

是否应跳过测试并标记为待办事项。

### fails

- **类型:** `boolean`
- **默认值:** `false`
- **别名:** [`test.fails`](#test-fails)

测试是否预期会失败。如果失败了，测试将通过，否则将失败。

## test.extend

- **别名:** `it.extend`

使用 `test.extend` 通过自定义夹具扩展测试上下文。这将返回一个新的 `test`，并且它也是可扩展的，因此你可以根据需要扩展它以组合更多夹具或覆盖现有夹具。请参阅 [扩展测试上下文](/guide/test-context#extend-test-context) 以获取更多信息。

```ts
import { test as baseTest, expect } from 'vitest'

export const test = baseTest
  // 简单值 - 类型推断为 { port: number; host: string }
  .extend('config', { port: 3000, host: 'localhost' })
  // 函数夹具 - 类型从返回值推断
  .extend('server', async ({ config }) => {
    // TypeScript 知道 config 是 { port: number; host: string }
    return `http://${config.host}:${config.port}`
  })

test('server uses correct port', ({ config, server }) => {
  // TypeScript 知道类型：
  // - config 是 { port: number; host: string }
  // - server 是 string
  expect(server).toBe('http://localhost:3000')
  expect(config.port).toBe(3000)
})
```

## test.override <Version>4.1.0</Version> {#test-override}

使用 `test.override` 覆盖当前套件及其嵌套套件中所有测试的夹具值。这必须在 `describe` 块的顶层调用。请参阅 [覆盖夹具值](/guide/test-context.html#overriding-fixture-values) 以获取更多信息。

```ts
import { test as baseTest, describe, expect } from 'vitest'

const test = baseTest
  .extend('dependency', 'default')
  .extend('dependant', ({ dependency }) => dependency)

describe('use scoped values', () => {
  test.override({ dependency: 'new' })

  test('uses scoped value', ({ dependant }) => {
    // `dependant` 使用新的覆盖值，该值作用于
    // 此套件中的所有测试
    expect(dependant).toEqual({ dependency: 'new' })
  })
})
```

## test.scoped <Version>3.1.0</Version> <Deprecated /> {#test-scoped}

- **别名:** `it.scoped`

::: danger 已弃用
`test.scoped` 已弃用，推荐使用 [`test.override`](#test-override)，并将在未来的主版本中移除。
:::

[`test.override`](#test-override) 的别名

## test.skip

- **别名:** `it.skip`

如果你想跳过运行某些测试，但由于任何原因不想删除代码，你可以使用 `test.skip` 来避免运行它们。

```ts
import { assert, test } from 'vitest'

test.skip('skipped test', () => {
  // 测试已跳过，无错误
  assert.equal(Math.sqrt(4), 3)
})
```

你还可以通过在其 [上下文](/guide/test-context) 上动态调用 `skip` 来跳过测试：

```ts
import { assert, test } from 'vitest'

test('skipped test', (context) => {
  context.skip()
  // 测试已跳过，无错误
  assert.equal(Math.sqrt(4), 3)
})
```

如果条件未知，你可以将其作为第一个参数提供给 `skip` 方法：

```ts
import { assert, test } from 'vitest'

test('skipped test', (context) => {
  context.skip(Math.random() < 0.5, 'optional message')
  // 测试已跳过，无错误
  assert.equal(Math.sqrt(4), 3)
})
```

## test.skipIf

- **别名:** `it.skipIf`

在某些情况下，你可能会在不同的环境中多次运行测试，其中一些测试可能是特定于环境的。你可以使用 `test.skipIf` 来在条件为真时跳过测试，而不是用 `if` 包裹测试代码。

```ts
import { assert, test } from 'vitest'

const isDev = process.env.NODE_ENV === 'development'

test.skipIf(isDev)('prod only test', () => {
  // 此测试仅在生产环境中运行
})
```

## test.runIf

- **别名:** `it.runIf`

[test.skipIf](#test-skipif) 的反面。

```ts
import { assert, test } from 'vitest'

const isDev = process.env.NODE_ENV === 'development'

test.runIf(isDev)('dev only test', () => {
  // 此测试仅在开发环境中运行
})
```

## test.only

- **别名：** `it.only`

使用 `test.only` 仅运行给定套件中的某些测试。这在调试时很有用。

```ts
import { assert, test } from 'vitest'

test.only('test', () => {
  // 只有这个测试（以及其他标记为 only 的测试）会被运行
  assert.equal(Math.sqrt(4), 2)
})
```

有时在特定文件中运行 `only` 测试非常有用，忽略整个测试套件中的所有其他测试，以免污染输出。

为此，使用包含相关测试的特定文件运行 `vitest`：

```shell
vitest interesting.test.ts
```

::: warning
Vitest 会检测测试是否在 CI 中运行，如果任何测试带有 `only` 标志，它将抛出错误。你可以通过 [`allowOnly`](/config/allowonly) 选项配置此行为。
:::

## test.concurrent

- **别名：** `it.concurrent`

`test.concurrent` 标记连续测试并行运行。它接收测试名称、一个包含要收集的测试的异步函数，以及一个可选的超时时间（毫秒）。

```ts
import { describe, test } from 'vitest'

// 标记为 concurrent 的两个测试将并行运行
describe('suite', () => {
  test('serial test', async () => { /* ... */ })
  test.concurrent('concurrent test 1', async () => { /* ... */ })
  test.concurrent('concurrent test 2', async () => { /* ... */ })
})
```

`test.skip`、`test.only` 和 `test.todo` 可与并发测试一起工作。以下所有组合均有效：

```ts
test.concurrent(/* ... */)
test.skip.concurrent(/* ... */) // 或 test.concurrent.skip(/* ... */)
test.only.concurrent(/* ... */) // 或 test.concurrent.only(/* ... */)
test.todo.concurrent(/* ... */) // 或 test.concurrent.todo(/* ... */)
```

运行并发测试时，快照和断言必须使用本地 [测试上下文](/guide/test-context.md) 中的 `expect`，以确保检测到正确的测试。

```ts
test.concurrent('test 1', async ({ expect }) => {
  expect(foo).toMatchSnapshot()
})
test.concurrent('test 2', async ({ expect }) => {
  expect(foo).toMatchSnapshot()
})
```

请注意，如果测试是同步的，Vitest 仍将按顺序运行它们。

## test.sequential

- **别名：** `it.sequential`

`test.sequential` 将测试标记为顺序。如果你想在 `describe.concurrent` 内或使用 `--sequence.concurrent` 命令选项按顺序运行测试，这很有用。

```ts
import { describe, test } from 'vitest'

// 使用配置选项 { sequence: { concurrent: true } }
test('concurrent test 1', async () => { /* ... */ })
test('concurrent test 2', async () => { /* ... */ })

test.sequential('sequential test 1', async () => { /* ... */ })
test.sequential('sequential test 2', async () => { /* ... */ })

// 在并发套件内
describe.concurrent('suite', () => {
  test('concurrent test 1', async () => { /* ... */ })
  test('concurrent test 2', async () => { /* ... */ })

  test.sequential('sequential test 1', async () => { /* ... */ })
  test.sequential('sequential test 2', async () => { /* ... */ })
})
```

## test.todo

- **别名：** `it.todo`

使用 `test.todo` 占位稍后实现的测试。报告中将显示该测试的条目，以便你知道还有多少测试需要实现。

```ts
// 报告中将显示此测试的条目
test.todo('unimplemented test', () => {
  // 失败的实现...
})
```

::: tip
如果测试没有主体，Vitest 会自动将测试标记为 `todo`。
:::

## test.fails

- **别名：** `it.fails`

使用 `test.fails` 指示断言将明确失败。

```ts
import { expect, test } from 'vitest'

test.fails('repro #1234', () => {
  expect(add(1, 2)).toBe(4)
})
```

此标志有助于跟踪库行为随时间的差异。例如，由于时间限制，你可以定义一个失败的测试而暂不修复问题。自 Vitest 4.1 起，标记为 `fails` 的测试会在测试摘要中跟踪。

## test.each

- **别名：** `it.each`

::: tip
虽然提供了 `test.each` 以兼容 Jest，
但 Vitest 还拥有 [`test.for`](#test-for)，它具有集成 [`测试上下文`](/guide/test-context) 的额外功能。
:::

当你需要使用不同变量运行相同测试时，请使用 `test.each`。
你可以按照测试函数参数的顺序，在测试名称中使用 [printf 格式化](https://nodejs.org/api/util.html#util_util_format_format_args) 注入参数。

- `%s`: 字符串
- `%d`: 数字
- `%i`: 整数
- `%f`: 浮点值
- `%j`: json
- `%o`: 对象
- `%#`: 测试用例的基于 0 的索引
- `%$`: 测试用例的基于 1 的索引
- `%%`: 单个百分号 ('%')

```ts
import { expect, test } from 'vitest'

test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', (a, b, expected) => {
  expect(a + b).toBe(expected)
})

// 这将返回
// ✓ add(1, 1) -> 2
// ✓ add(1, 2) -> 3
// ✓ add(2, 1) -> 3
```

你也可以使用 `$` 前缀访问对象属性和数组元素：

```ts
test.each([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 1, expected: 3 },
])('add($a, $b) -> $expected', ({ a, b, expected }) => {
  expect(a + b).toBe(expected)
})

// 这将返回
// ✓ add(1, 1) -> 2
// ✓ add(1, 2) -> 3
// ✓ add(2, 1) -> 3

test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add($0, $1) -> $2', (a, b, expected) => {
  expect(a + b).toBe(expected)
})

// 这将返回
// ✓ add(1, 1) -> 2
// ✓ add(1, 2) -> 3
// ✓ add(2, 1) -> 3
```

如果你使用对象作为参数，还可以使用 `.` 访问对象属性：

  ```ts
  test.each`
  a               | b      | expected
  ${{ val: 1 }}   | ${'b'} | ${'1b'}
  ${{ val: 2 }}   | ${'b'} | ${'2b'}
  ${{ val: 3 }}   | ${'b'} | ${'3b'}
  `('add($a.val, $b) -> $expected', ({ a, b, expected }) => {
    expect(a.val + b).toBe(expected)
  })

  // 这将返回
  // ✓ add(1, b) -> 1b
  // ✓ add(2, b) -> 2b
  // ✓ add(3, b) -> 3b
  ```

* 第一行应为列名，用 `|` 分隔；
* 随后的一行或多行数据使用 `${value}` 语法作为模板字符串表达式提供。

```ts
import { expect, test } from 'vitest'

test.each`
  a               | b      | expected
  ${1}            | ${1}   | ${2}
  ${'a'}          | ${'b'} | ${'ab'}
  ${[]}           | ${'b'} | ${'b'}
  ${{}}           | ${'b'} | ${'[object Object]b'}
  ${{ asd: 1 }}   | ${'b'} | ${'[object Object]b'}
`('returns $expected when $a is added $b', ({ a, b, expected }) => {
  expect(a + b).toBe(expected)
})
```

::: tip
Vitest 使用 Chai `format` 方法处理 `$values`。如果值被截断过多，你可以在配置文件中增加 [chaiConfig.truncateThreshold](/config/chaiconfig#chaiconfig-truncatethreshold)。
:::

## test.for

- **别名：** `it.for`

替代 `test.each` 以提供 [`测试上下文`](/guide/test-context)。

与 `test.each` 的区别在于参数中数组的提供方式。
`test.for` 的非数组参数（包括模板字符串用法）与 `test.each` 完全相同。

```ts
// `each` 展开数组
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', (a, b, expected) => { // [!code --]
  expect(a + b).toBe(expected)
})

// `for` 不展开数组（注意参数周围的方括号）
test.for([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', ([a, b, expected]) => { // [!code ++]
  expect(a + b).toBe(expected)
})
```

第二个参数是 [`测试上下文`](/guide/test-context)，可用于并发快照，例如：

```ts
test.concurrent.for([
  [1, 1],
  [1, 2],
  [2, 1],
])('add(%i, %i)', ([a, b], { expect }) => {
  expect(a + b).toMatchSnapshot()
})
```

## test.describe <Version>4.1.0</Version> {#test-describe}

作用域 `describe`。参见 [describe](/api/describe) 获取更多信息。

## test.suite <Version>4.1.0</Version> {#test-suite}

`suite` 的别名。参见 [describe](/api/describe) 获取更多信息。

## test.beforeEach

作用域 `beforeEach` 钩子，继承自 [`test.extend`](#test-extend) 的类型。参见 [beforeEach](/api/hooks#beforeeach) 获取更多信息。

## test.afterEach

作用域 `afterEach` 钩子，继承自 [`test.extend`](#test-extend) 的类型。参见 [afterEach](/api/hooks#aftereach) 获取更多信息。

## test.beforeAll

作用域 `beforeAll` 钩子，继承自 [`test.extend`](#test-extend) 的类型。参见 [beforeAll](/api/hooks#beforeall) 获取更多信息。

## test.afterAll

作用域 `afterAll` 钩子，继承自 [`test.extend`](#test-extend) 的类型。参见 [afterAll](/api/hooks#afterall) 获取更多信息。

## test.aroundEach <Version>4.1.0</Version> {#test-aroundeach}

作用域 `aroundEach` 钩子，继承自 [`test.extend`](#test-extend) 的类型。参见 [aroundEach](/api/hooks#aroundeach) 获取更多信息。

## test.aroundAll <Version>4.1.0</Version> {#test-aroundall}

作用域 `aroundAll` 钩子，继承自 [`test.extend`](#test-extend) 的类型。参见 [aroundAll](/api/hooks#aroundall) 获取更多信息。

## bench <Experimental /> {#bench}

- **类型：** `(name: string | Function, fn: BenchFunction, options?: BenchOptions) => void`

::: danger
基准测试是实验性的，不遵循 SemVer。
:::

`bench` 定义一个基准测试。在 Vitest 术语中，基准测试是一个定义一系列操作的函数。Vitest 多次运行此函数以显示不同的性能结果。

Vitest 在底层使用 [`tinybench`](https://github.com/tinylibs/tinybench) 库，继承其所有可用作第三个参数的选项。

```ts
import { bench } from 'vitest'

bench('normal sorting', () => {
  const x = [1, 5, 4, 2, 3]
  x.sort((a, b) => {
    return a - b
  })
}, { time: 1000 })
```

```ts
export interface Options {
  /**
   * 运行基准测试任务所需的时间（毫秒）
   * @default 500
   */
  time?: number

  /**
   * 即使时间选项结束，任务也应运行的次数
   * @default 10
   */
  iterations?: number

  /**
   * 获取当前时间戳（毫秒）的函数
   */
  now?: () => number

  /**
   * 用于中止基准测试的 AbortSignal
   */
  signal?: AbortSignal

  /**
   * 如果任务失败则抛出（如果为 true，事件将不起作用）
   */
  throws?: boolean

  /**
   * 预热时间（毫秒）
   * @default 100ms
   */
  warmupTime?: number

  /**
   * 预热迭代次数
   * @default 5
   */
  warmupIterations?: number

  /**
   * 在每个基准测试任务（周期）之前运行的设置函数
   */
  setup?: Hook

  /**
   * 在每个基准测试任务（周期）之后运行的清理函数
   */
  teardown?: Hook
}
```
测试用例运行后，输出结构信息如下：

```
  name                      hz     min     max    mean     p75     p99    p995    p999     rme  samples
· normal sorting  6,526,368.12  0.0001  0.3638  0.0002  0.0002  0.0002  0.0002  0.0004  ±1.41%   652638
```
```ts
export interface TaskResult {
  /*
   * 运行任务时抛出的最后一个错误
   */
  error?: unknown

  /**
   * 运行基准测试任务（周期）的时间量（毫秒）。
   */
  totalTime: number

  /**
   * 样本中的最小值
   */
  min: number
  /**
   * 样本中的最大值
   */
  max: number

  /**
   * 每秒操作数
   */
  hz: number

  /**
   * 每个操作花费多长时间（毫秒）
   */
  period: number

  /**
   * 每个任务迭代时间的任务样本（毫秒）
   */
  samples: number[]

  /**
   * 样本均值/平均数（总体均值的估计）
   */
  mean: number

  /**
   * 样本方差（总体方差的估计）
   */
  variance: number

  /**
   * 样本标准差（总体标准差的估计）
   */
  sd: number

  /**
   * 均值标准误（即样本均值抽样分布的标准差）
   */
  sem: number

  /**
   * 自由度
   */
  df: number

  /**
   * 样本的临界值
   */
  critical: number

  /**
   * 误差范围
   */
  moe: number

  /**
   * 相对误差范围
   */
  rme: number

  /**
   * 中位数绝对偏差
   */
  mad: number

  /**
   * p50/中位数百分位
   */
  p50: number

  /**
   * p75 百分位
   */
  p75: number

  /**
   * p99 百分位
   */
  p99: number

  /**
   * p995 百分位
   */
  p995: number

  /**
   * p999 百分位
   */
  p999: number
}
```

### bench.skip

- **类型：** `(name: string | Function, fn: BenchFunction, options?: BenchOptions) => void`

你可以使用 `bench.skip` 语法跳过运行某些基准测试。

```ts
import { bench } from 'vitest'

bench.skip('normal sorting', () => {
  const x = [1, 5, 4, 2, 3]
  x.sort((a, b) => {
    return a - b
  })
})
```

### bench.only

- **类型：** `(name: string | Function, fn: BenchFunction, options?: BenchOptions) => void`

使用 `bench.only` 仅运行给定套件中的某些基准测试。这在调试时很有用。

```ts
import { bench } from 'vitest'

bench.only('normal sorting', () => {
  const x = [1, 5, 4, 2, 3]
  x.sort((a, b) => {
    return a - b
  })
})
```

### bench.todo

- **类型：** `(name: string | Function) => void`

使用 `bench.todo` 占位稍后实现的基准测试。

```ts
import { bench } from 'vitest'

bench.todo('unimplemented test')
```
