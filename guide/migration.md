---
title: 迁移指南 | 指南
outline: deep
---

# 迁移指南

## 迁移到 Vitest 3.0 {#vitest-3}

### Test Options as a Third Argument

Vitest 3.0 如果我们将一个对象作为第三个参数传递给 `test` 或 `describe` 函数，会打印一条警告：

```ts
test('validation works', () => {
  // ...
}, { retry: 3 }) // [!code --]

test('validation works', { retry: 3 }, () => { // [!code ++]
  // ...
})
```

下一个主要版本将在第三个参数是对象时抛出错误。请注意，超时时间（timeout number）并没有被弃用：

```ts
test('validation works', () => {
  // ...
}, 1000) // Ok ✅
```

### `browser.name` 和 `browser.providerOptions` 已弃用

[`browser.name`](/guide/browser/config#browser-name) 和 [`browser.providerOptions`](/guide/browser/config#browser-provideroptions) 都将在 Vitest 4 中删除。请使用新的 [`browser.instances`](/guide/browser/config#browser-instances) 选项来代替它们：

```ts
export default defineConfig({
  test: {
    browser: {
      name: 'chromium', // [!code --]
      providerOptions: { // [!code --]
        launch: { devtools: true }, // [!code --]
      }, // [!code --]
      instances: [ // [!code ++]
        { // [!code ++]
          browser: 'chromium', // [!code ++]
          launch: { devtools: true }, // [!code ++]
        }, // [!code ++]
      ], // [!code ++]
    },
  },
})
```

使用新的 `browser.instances` 字段，我们还可以指定多个浏览器配置。

### `spy.mockReset` Now Restores the Original Implementation

之前没有好的方法在不重新应用 spy 的情况下将其重置为原始实现。现在，`spy.mockReset` 会将实现函数重置为原始函数，而不是假的 noop（空操作）。

```ts
const foo = {
  bar: () => 'Hello, world!'
}

vi.spyOn(foo, 'bar').mockImplementation(() => 'Hello, mock!')

foo.bar() // 'Hello, mock!'

foo.bar.mockReset()

foo.bar() // undefined [!code --]
foo.bar() // 'Hello, world!' [!code ++]
```

### `vi.spyOn` Reuses Mock if Method is Already Mocked

之前，Vitest 在监视对象时总会分配一个新的 spy。这会导致 `mockRestore` 出现错误，因为它会将 spy 恢复到之前的 spy，而不是原始函数：

```ts
vi.spyOn(fooService, 'foo').mockImplementation(() => 'bar')
vi.spyOn(fooService, 'foo').mockImplementation(() => 'bar')
vi.restoreAllMocks()
vi.isMockFunction(fooService.foo) // true [!code --]
vi.isMockFunction(fooService.foo) // false [!code ++]
```

### Fake Timers Defaults

Vitest 不再提供默认的 `fakeTimers.toFake` 选项。现在，如果存在任何与定时器相关的 API（除 `nextTick` 外），Vitest 都会对其进行模拟。具体来说，当调用 `vi.useFakeTimers` 时，`performance.now()` 也会被模拟。

```ts
vi.useFakeTimers()

performance.now() // original [!code --]
performance.now() // fake [!code ++]
```

你可以通过在调用 `vi.useFakeTimers` 时或在全局配置中指定定时器来恢复到之前的行为：

```ts
export default defineConfig({
  test: {
    fakeTimers: {
      toFake: [ // [!code ++]
        'setTimeout', // [!code ++]
        'clearTimeout', // [!code ++]
        'setInterval', // [!code ++]
        'clearInterval', // [!code ++]
        'setImmediate', // [!code ++]
        'clearImmediate', // [!code ++]
        'Date', // [!code ++]
      ] // [!code ++]
    },
  },
})
```

### More Strict Error Equality

现在，Vitest 在通过 `toEqual` 或 `toThrowError` 比较错误时会检查更多的属性。Vitest 会比较 `name`、`message`、`cause` 和 `AggregateError.errors`。对于 `Error.cause`，比较是不对称进行的：

```ts
expect(new Error('hi', { cause: 'x' })).toEqual(new Error('hi')) // ✅
expect(new Error('hi')).toEqual(new Error('hi', { cause: 'x' })) // ❌
```

除了检查更多的属性外，Vitest 现在还会比较错误原型。例如，如果抛出的是 `TypeError`，相等性检查应该引用 `TypeError`，而不是 `Error`：

```ts
expect(() => {
  throw new TypeError('type error')
})
  .toThrowError(new Error('type error')) // [!code --]
  .toThrowError(new TypeError('type error')) // [!code ++]
```

更多详情请参见 PR：[#5876](https://github.com/vitest-dev/vitest/pull/5876)。

### `module` condition export is not resolved by default on Vite 6

Vite 6 allows more flexible [`resolve.conditions`](https://vite.dev/config/shared-options#resolve-conditions) options and Vitest configures it to exclude `module` conditional export by default.
See also [Vite 6 migration guide](https://v6.vite.dev/guide/migration.html#default-value-for-resolve-conditions) for the detail of Vite side changes.

### `Custom` Type is Deprecated <Badge type="danger">API</Badge> {#custom-type-is-deprecated}

`Custom` 类型现在等同于 `Test` 类型。需要注意一下，Vitest 在 2.1 版本中更新了公共类型，并将导出的名称更改为 `RunnerCustomCase` 和 `RunnerTestCase`。

```ts
import {
  RunnerCustomCase, // [!code --]
  RunnerTestCase, // [!code ++]
} from 'vitest'
```

如果我们正在使用 `getCurrentSuite().custom()`，返回的任务的 `type` 现在等于 `'test'`。`Custom` 类型将在 Vitest 4 中被移除。

### The `WorkspaceSpec` Type is No Longer Used <Badge type="danger">API</Badge> {#the-workspacespec-type-is-no-longer-used}

在公共 API 中，此类型之前用于自定义 [sequencers](/config/#sequence-sequencer)。请迁移到 [`TestSpecification`](/advanced/api/test-specification)。

### `onTestFinished` and `onTestFailed` Now Receive a Context

[`onTestFinished`](/api/#ontestfinished) 和 [`onTestFailed`](/api/#ontestfailed) 钩子之前接收测试结果作为第一个参数。现在，它们像 `beforeEach` 和 `afterEach` 一样，接收一个测试上下文。

### Changes to the Snapshot API <Badge type="danger">API</Badge> {#changes-to-the-snapshot-api}

`@vitest/snapshot` 中的公共 Snapshot API 已更改，以支持在单次运行中处理多个状态。更多详情请参见 PR：[#6817](https://github.com/vitest-dev/vitest/pull/6817)。

请注意，这些更改仅影响直接使用 Snapshot API 的开发者。`.toMatchSnapshot` API 没有任何变化。

### Changes to `resolveConfig` Type Signature <Badge type="danger">API</Badge> {#changes-to-resolveconfig-type-signature}

[`resolveConfig`](/advanced/api/#resolveconfig) 现在更加有用。它不再接受已经解析的 Vite 配置，而是接受用户配置并返回解析后的配置。

此函数不用于内部，仅作为公共 API 暴露。

### Cleaned up `vitest/reporters` types <Badge type="danger">API</Badge> {#cleaned-up-vitest-reporters-types}

`vitest/reporters` 入口现在仅导出报告器实现和选项类型。如果您需要访问 `TestCase`、`TestSuite` 以及其他与任务相关的类型，请另外从 `vitest/node` 中导入它们。

### Coverage ignores test files even when `coverage.excludes` is overwritten.

不再可以通过覆盖 `coverage.excludes` 来将测试文件包含在覆盖率报告中。测试文件现在总是被排除。

## Migrating to Vitest 2.0 {#vitest-2}

### 默认数据池为 `forks`

为了提高稳定性，Vitest 2.0 将 `pool` 的默认配置改为 `'fork'`。您可以在 [PR](https://github.com/vitest-dev/vitest/pull/5047)中阅读完整的动机。

如果使用了 `poolOptions` 而未指定一个 `pool`，则可能需要更新配置：

```ts
export default defineConfig({
  test: {
    poolOptions: {
      threads: { // [!code --]
        singleThread: true, // [!code --]
      }, // [!code --]
      forks: { // [!code ++]
        singleFork: true, // [!code ++]
      }, // [!code ++]
    }
  }
})
```

### 钩子函数在堆栈中运行

在 Vitest 2.0 之前，所有钩子函数都是并行运行的。 在 2.0 中，所有钩子都是串行运行的。 除此之外，`afterAll`/`afterEach` 以相反的顺序运行。

要恢复钩子的并行执行，请将 [`sequence.hooks`](/config/#sequence-hooks) 改为 `'parallel'`：

```ts
export default defineConfig({
  test: {
    sequence: { // [!code ++]
      hooks: 'parallel', // [!code ++]
    }, // [!code ++]
  },
})
```

### `suite.concurrent` 同时运行所有测试

以前，在套件上指定 `concurrent` 时，并发测试仍会按套件分组并逐个运行。现在，它会遵循 jest 的行为，一次运行所有测试（仍受 [`maxConcurrency`](/config/#maxConcurrency)限制）。

### 默认启用 V8 覆盖的 `coverage.ignoreEmptyLines`

将 `coverage.ignoreEmptyLines` 的默认值改为 `true`。此更改将对用户的代码覆盖率报告产生重大影响。使用覆盖率阈值的项目很可能需要在此之后调整这些值。此更改仅影响 `coverage.provider` 为 `'v8'` 时的默认设置.

### 不再有`watchExclude`选项

Vitest 使用 Vite 的监视器。您可以将排除项添加到 `server.watch.ignored`：

```ts
export default defineConfig({
  server: { // [!code ++]
    watch: { // [!code ++]
      ignored: ['!node_modules/examplejs'] // [!code ++]
    } // [!code ++]
  } // [!code ++]
})
```

### `--segfault-retry` 删除

默认程序池更改后，不再需要此选项。如果遇到分离故障错误，请尝试切换到`'forks'`池。如果问题仍然存在，请重现问题并打开一个新问题。
### 删除套件任务中的空任务

这是对高级[task API](/advanced/runner#your-task-function)的更改。以前，遍历 `.suite`最终会导致使用空的内部套件，而不是文件任务。

这使得 `.suite`成为可选项；如果任务是在顶层定义的，则不会有 suite。您可以回退到 `.file`属性，该属性现在存在于所有任务中（包括文件任务本身，因此要小心不要陷入无休止的递归）。

这一更改还删除了 `expect.getState().currentTestName` 中的文件，并使 `expect.getState().testPath` 成为必填项。

### `task.meta` 已添加到 JSON 报告器中

JSON 报告器现在会为每个断言结果打印 `task.meta` 。

### 简化的模拟函数通用类型 (e.g. `vi.fn<T>`, `Mock<T>`)

以前 `vi.fn<TArgs, TReturn>` 分别接受参数和返回值的两个泛型。现在改为直接接受一个函数类型 `vi.fn<T>` 以简化用法。

```ts
import type { Mock } from 'vitest'
import { vi } from 'vitest'

const add = (x: number, y: number): number => x + y

// using vi.fn<T>
const mockAdd = vi.fn<Parameters<typeof add>, ReturnType<typeof add>>() // [!code --]
const mockAdd = vi.fn<typeof add>() // [!code ++]

// using Mock<T>
const mockAdd: Mock<Parameters<typeof add>, ReturnType<typeof add>> = vi.fn() // [!code --]
const mockAdd: Mock<typeof add> = vi.fn() // [!code ++]
```

### Accessing Resolved `mock.results`

之前，Vitest 会在函数返回 Promise 时解析 `mock.results` 的值。现在，增加了一个独立的 [`mock.settledResults`](/api/mock#mock-settledresults) 属性，仅在返回的 Promise 被解析或拒绝时填充。

```ts
const fn = vi.fn().mockResolvedValueOnce('result')
await fn()

const result = fn.mock.results[0] // 'result' [!code --]
const result = fn.mock.results[0] // 'Promise<result>' [!code ++]

const settledResult = fn.mock.settledResults[0] // 'result'
```

通过这一更改，我们还引入了新的 [`toHaveResolved*`](/api/expect#tohaveresolved) 匹配器，类似于 `toHaveReturned`，以便如果您之前使用过 `toHaveReturned`，迁移会更加容易：

```ts
const fn = vi.fn().mockResolvedValueOnce('result')
await fn()

expect(fn).toHaveReturned('result') // [!code --]
expect(fn).toHaveResolved('result') // [!code ++]
```

### 浏览器模式

Vitest 浏览器模式在测试周期内发生了很多变化。您可以在[GitHub discussion](https://github.com/vitest-dev/vitest/discussions/5828)上阅读我们关于浏览器模式的理念。

大多数改动都是附加的，但也有一些小的突破性改动：

- `none` provider 更名为 `preview` [#5842](https://github.com/vitest-dev/vitest/pull/5826)
- `preview` provider 现在是默认的 [#5842](https://github.com/vitest-dev/vitest/pull/5826)
- `indexScripts` 更名为 `orchestratorScripts` [#5842](https://github.com/vitest-dev/vitest/pull/5842)

### 删除过时的选项

删除了一些过时的选项：

- `vitest typecheck` 命令 - 使用 `vitest --typecheck` 代替
- `VITEST_JUNIT_CLASSNAME` 和 `VITEST_JUNIT_SUITE_NAME` 环境变量（改用 reporter 选项）
- 检查 `c8` 覆盖率（使用 coverage-v8 代替）
- 从 `vitest` 导出 `SnapshotEnvironment` - 改为从 `vitest/snapshot` 导入
- 删除 `SpyInstance` 改用 `MockInstance`

## 迁移到 Vitest 1.0

### 最低要求

Vitest 1.0 需要 Vite 5.0 和 Node.js 18 或更高版本。

所有 `@vitest/*` 子软件包都需要 Vitest 1.0 版本。

### Snapshots 更新 [#3961](https://github.com/vitest-dev/vitest/pull/3961)

快照中的引号不再转义，即使字符串只有一行，所有快照也都使用回车引号 (`)。

1. 引号不再转义：

```diff
expect({ foo: 'bar' }).toMatchInlineSnapshot(`
  Object {
-    \\"foo\\": \\"bar\\",
+    "foo": "bar",
  }
`)
```

2. 单行快照现在使用"`"引号，而不是"'"：

```diff
- expect('some string').toMatchInlineSnapshot('"some string"')
+ expect('some string').toMatchInlineSnapshot(`"some string"`)
```

对 `@vitest/snapshot` 也有[修改](https://github.com/vitest-dev/vitest/pull/4076)。如果不直接使用它，则无需做任何更改。

- 我们不再需要扩展 `SnapshotClient` 以覆盖 `equalityCheck` 方法：只需在启动实例时将其作为 `isEqual` 传递即可。
- `client.setTest` 更名为 `client.startCurrentRun`
- `client.resetCurrent` 更名为 `client.finishCurrentRun` 。

### Pools 标准化 [#4172](https://github.com/vitest-dev/vitest/pull/4172)

我们删除了大量配置选项，以便根据需要配置运行程序。如果你已经使用了 `--threads` 或其他相关标记，请查看迁移示例。

- `--threads` 现在是 `--pool=threads`
- `--no-threads` 现在是 `--pool=forks`
- `--single-thread` 现在是 `--poolOptions.threads.singleThread`
- `--experimental-vm-threads` 现在是 `--pool=vmThreads`
- `--experimental-vm-worker-memory-limit` 现在是 `--poolOptions.vmThreads.memoryLimit`
- `--isolate` 现在是 `--poolOptions.<pool-name>.isolate` 和 `browser.isolate`
- `test.maxThreads` 现在是 `test.poolOptions.<pool-name>.maxThreads`
- `test.minThreads` 现在是 `test.poolOptions.<pool-name>.minThreads`
- `test.useAtomics` 现在是 `test.poolOptions.<pool-name>.useAtomics`
- `test.poolMatchGlobs.child_process` 现在是 `test.poolMatchGlobs.forks`
- `test.poolMatchGlobs.experimentalVmThreads` 现在是 `test.poolMatchGlobs.vmThreads`

```diff
{
  scripts: {
-    "test": "vitest --no-threads"
     // For identical behaviour:
+    "test": "vitest --pool forks --poolOptions.forks.singleFork"
     // Or multi parallel forks:
+    "test": "vitest --pool forks"

  }
}
```

```diff
{
  scripts: {
-    "test": "vitest --experimental-vm-threads"
+    "test": "vitest --pool vmThreads"
  }
}
```

```diff
{
  scripts: {
-    "test": "vitest --isolate false"
+    "test": "vitest --poolOptions.threads.isolate false"
  }
}
```

```diff
{
  scripts: {
-    "test": "vitest --no-threads --isolate false"
+    "test": "vitest --pool forks --poolOptions.forks.isolate false"
  }
}
```

### Coverage 的变化 [#4265](https://github.com/vitest-dev/vitest/pull/4265), [#4442](https://github.com/vitest-dev/vitest/pull/4442)

选项 `coverage.all` 现在默认启用。这意味着，所有符合 `coverage.include` 模式的项目文件都将被处理，即使它们未被执行。

更改了覆盖阈值 API 的形状，现在它支持使用 glob 模式为特定文件指定阈值：

```diff
export default defineConfig({
  test: {
    coverage: {
-      perFile: true,
-      thresholdAutoUpdate: true,
-      100: true,
-      lines: 100,
-      functions: 100,
-      branches: 100,
-      statements: 100,
+      thresholds: {
+        perFile: true,
+        autoUpdate: true,
+        100: true,
+        lines: 100,
+        functions: 100,
+        branches: 100,
+        statements: 100,
+      }
    }
  }
})
```

### Mock 类型 [#4400](https://github.com/vitest-dev/vitest/pull/4400)

删除了一些类型，改用 Jest 风格的 "Mock "命名。

```diff
- import { EnhancedSpy, SpyInstance } from 'vitest'
+ import { MockInstance } from 'vitest'
```

::: warning
`SpyInstance` 已被弃用，取而代之的是 `MockInstance` ，并会在下一个主要版本中移除。
:::

### Timer mocks [#3925](https://github.com/vitest-dev/vitest/pull/3925)

`vi.useFakeTimers()` 不再自动模拟 [`process.nextTick`](https://nodejs.org/api/process.html#processnexttickcallback-args) 。
仍然可以通过使用 `vi.useFakeTimers({ toFake: ['nextTick'] })` 明确指定来模拟 `process.nextTick`。

但是，在使用 `--pool=forks` 时，无法模拟 `process.nextTick` 。如果需要模拟 `process.nextTick` ，请使用不同的 `--pool` 选项。

## 从 Jest 迁移 {#jest}

Vitest 设计了与 Jest 兼容的 API ，方便你从 Jest 的迁移尽可能简单。尽管做出了这些努力，你仍然可能会遇到以下差异：

### 全局变量作为默认值

Jest 默认启用[全局 API](https://jestjs.io/zh-Hans/docs/api)。然而 Vitest 没有。你既可以通过 [`globals` 配置选项](/config/#globals)启用全局 API，也可以通过更新你的代码以便使用来自 `vitest` 模块的导入。

如果你决定禁用全局 API，请注意像 [`testing-library`](https://testing-library.com/) 这样的通用库不会自动运行 DOM [cleanup](https://testing-library.com/docs/svelte-testing-library/api/#cleanup)。

### `spy.mockReset`

Jest 的 [`mockReset`](https://jestjs.io/docs/mock-function-api#mockfnmockreset) 方法会将模拟函数的实现替换为一个返回 `undefined` 的空函数。

而 Vitest 的 [`mockReset`](/api/mock#mockreset) 方法会将模拟函数的实现重置为其原始实现。
也就是说，通过 `vi.fn(impl)` 创建的模拟，使用 `mockReset` 将会把模拟的实现重置回 `impl`。

### 模拟模块

在 Jest 中模拟一个模块时，工厂参数的返回值是默认导出。在 Vitest 中，工厂参数必须返回一个明确定义了每个导出的对象。例如，下面的 `jest.mock` 必须更新如下：

```ts
jest.mock('./some-path', () => 'hello') // [!code --]
vi.mock('./some-path', () => ({
  // [!code ++]
  default: 'hello', // [!code ++]
})) // [!code ++]
```

有关更深入的详细描述，请参阅 [`vi.mock` api section](/api/#vi-mock)。

### 自动模拟行为

区别于 Jest，在 `<root>/__mocks__` 中的模拟模块只有在 `vi.mock()` 被调用时才会加载。如果你需要它们像在 Jest 中一样，在每个测试中都被模拟，你可以在 [`setupFiles`](/config/#setupfiles) 中模拟它们。

### 导入模拟包的原始版本

如果你只需要模拟一个 package 的部分功能，你可能之前使用了 Jest 的 `requireActual` 函数。在 Vitest 中，你应该将这些调用替换为 `vi.importActual`。

```ts
const { cloneDeep } = jest.requireActual('lodash/cloneDeep') // [!code --]
const { cloneDeep } = await vi.importActual('lodash/cloneDeep') // [!code ++]
```

### 将模拟扩展到外部库

在 Jest 的默认情况下，当模拟一个模块并希望将此模拟扩展到使用相同模块的其他外部库时，您应该明确告知您希望模拟哪个第三方库，这样外部库就会成为您源代码的一部分，方法是使用  [server.deps.inline](https://vitest.dev/config/#server-deps-inline).

```
server.deps.inline: ["lib-name"]
```

### expect.getState().currentTestName

Vitest 的 `test` 名称用 `>` 符号连接，以便于区分测试和套件，而 Jest 则使用空格 (` `)。

```diff
- `${describeTitle} ${testTitle}`
+ `${describeTitle} > ${testTitle}`
```

### Envs

Jest 导出各种 [`jasmine`](https://jasmine.github.io/) 全局 API (例如 `jasmine.any()` )。任何此类实例都需要迁移成 [Vitest 的对应 API ](/api/)。

### 测试环境

如果之前没有设置，Vitest 会像 Jest 一样，把 `NODE_ENV` 设置为 `test`。 Vitest 也有一个 `JEST_WORKER_ID` 的对应项，是 `VITEST_WORKER_ID`，所以如果你依赖它，不要忘记重命名它。

### 属性替换

如果你想修改测试环境，你会在 Jest 中使用 [replaceProperty API](https://jestjs.io/docs/jest-object#jestreplacepropertyobject-propertykey-value)，你可以使用 [vi.stubEnv](/api/vi#vi-stubenv) 或者 [`vi.spyOn`](/api/vi#vi-spyon) 也可以在 Vitest 中执行此操作。

从 Vitest v0.10.0 开始，声明测试的回调样式被弃用。 你可以重写它们以使用 `async`/`await` 函数，或者使用 Promise 来模仿回调样式。

<!--@include: ./examples/promise-done.md-->

### 钩子

`beforeAll`/`beforeEach` 钩子可能在 Vitest 的 [teardown 函数](/api/#setup-and-teardown)中返回。因此，如果它们返回的不是 `undefined` 或 `null`，你可能需要重写你的钩子声明：

```ts
beforeEach(() => setActivePinia(createTestingPinia())) // [!code --]
beforeEach(() => {
  setActivePinia(createTestingPinia())
}) // [!code ++]
```

在 Jest 中，钩子是按顺序调用的（一个接一个）。默认情况下，Vitest 并行运行钩子。要使用 Jest 的行为，请更新 [`sequence.hooks`](/config/#sequence-hooks) 选项：

```ts
export default defineConfig({
  test: {
    sequence: {
      // [!code ++]
      hooks: 'list', // [!code ++]
    }, // [!code ++]
  },
})
```

### 类型

Vitest 没有等效于 `jest` 的命名空间，因此你需要直接从 `Vitest` 导入类型：

```ts
// [!code --]
// [!code --]
import type { Mock } from 'vitest'
let fn: jest.Mock<(name: string) => number> // [!code ++]
let fn: Mock<(name: string) => number> // [!code ++]
```

### 定时器

如果你之前在测试中使用了 jest.setTimeout ，那么你需要迁移到 Vitest 中的`vi.setConfig` :

```ts
jest.setTimeout(5_000) // [!code --]
vi.setConfig({ testTimeout: 5_000 }) // [!code ++]
```

### Vue 快照

如果你以前在 vue-cli preset 中使用 Jest，那么这不是一个 Jest 独有的新特性。你可能需要安装 [`jest-serializer-vue`](https://github.com/eddyerburgh/jest-serializer-vue) 包，然后在 [setupFiles](/config/#setupfiles) 中配置：

:::code-group
```js [vite.config.js]
import { defineConfig } from 'vite'
export default defineConfig({
  test: {
    setupFiles: ['./tests/unit/setup.js'],
  },
})
```
```js [tests/unit/setup.js]
import vueSnapshotSerializer from 'jest-serializer-vue'
expect.addSnapshotSerializer(vueSnapshotSerializer)
```
:::

否则你的快照将出现大量的 `"` 字符。
