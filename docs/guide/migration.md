---
title: 迁移指南 | 指南
outline: deep
---

# 迁移指南

[迁移到 Vitest 4.0](https://v4.vitest.dev/guide/migration) | [迁移到 Vitest 3.0](https://v3.vitest.dev/guide/migration)。

## 迁移到 Vitest 5.0 {#vitest-5}

::: warning 正在进行中
Vitest 5.0 目前处于 beta 版。本节会跟踪合并中的破坏性变更，并且在稳定版发布前可能仍会更改。
:::

::: warning 前置条件
Vitest 5.0 需要 Vite >= 6.4.0 和 Node.js >= 22.12.0。在进行任何其他迁移步骤之前，请确保你的环境满足这些要求。在较旧版本的 Vite 或 Node.js 上运行 Vitest 5.0 不受支持，可能会导致意外错误。
:::

### `clearMocks` 默认已启用

[`clearMocks`](/config/#clearmocks) 现在默认值为 `true`。Vitest 会在每个测试之前调用 [`vi.clearAllMocks()`](/api/vi#vi-clearallmocks)，重置每个 mock 的 `mock.calls`、`mock.instances`、`mock.contexts` 和 `mock.results`。mock 的实现会保持不变，因此这只会影响已记录的历史。

实际上，这意味着一个 mock 不再会把一个测试中的调用带到下一个测试中：

```ts
import { expect, test, vi } from 'vitest'

const fn = vi.fn()

test('first', () => {
  fn()
  expect(fn).toHaveBeenCalledTimes(1)
})

test('second', () => {
  fn()
  // v4: 来自 "first" 的调用被保留了，所以这里是 2 // [!code --]
  expect(fn).toHaveBeenCalledTimes(2) // [!code --]
  // v5: 每个测试前都会清空历史，因此这里只计算这个测试中的调用 // [!code ++]
  expect(fn).toHaveBeenCalledTimes(1) // [!code ++]
})
```

在测试主体之外记录调用的测试（例如在 setup 文件中、模块顶层，或者在 `beforeAll` 钩子中）受影响最大，因为在执行断言的测试运行之前，这些历史会被清空。

如果要保持之前的行为，将 `clearMocks` 重新设置为 `false`：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: false, // [!code ++]
  },
})
```

### 内联项目默认继承根配置

[`extends`](/guide/projects#configuration) 选项现在默认为 `true`：在 [`test.projects`](/guide/projects) 中以内联配置定义的每个项目，都会继承根配置中的所有选项，包括 `plugins` 或 `resolve.alias` 等 Vite 选项。选项合并时遵循与 Vitest 4 中显式设置 `extends: true` 时相同的规则：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        // v4：此项目不会应用 react 插件
        // v5：此插件会从根配置继承
        test: {
          name: 'unit',
          include: ['**/*.unit.test.ts'],
        },
      },
    ],
  },
})
```

以下选项不会被继承，因为它们始终限定于单个项目或整个测试运行：

- `name` 和 `projects` 永远不会被继承。
- 根配置中的 `globalSetup` 不会被继承：根级别的 `globalSetup` 已经会在每次测试运行时执行一次，因此继承它会导致相同的文件在每个项目中再次执行。从非根配置文件扩展时，仍然会继承该选项。
- 项目自身的 `tags` 会替换继承的数组，而不是与其合并。

以配置文件或目录形式引用的项目不受影响；它们仍然不会从根配置继承任何选项。

请注意，数组会被合并，而不是被覆盖。例如，如果根配置定义了 `setupFiles`，项目自身的 `setupFiles` 会追加到继承的配置中。如果需要恢复之前的行为，请在项目配置中设置 `extends: false`：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./setup.global.ts'],
    projects: [
      {
        extends: false, // [!code ++]
        test: {
          name: 'unit',
          setupFiles: ['./setup.unit.ts'],
        },
      },
    ],
  },
})
```

### 被引用的配置文件可以定义自己的项目

在 [`test.projects`](/guide/projects) 中被引用且自身声明了 `projects` 的配置文件，现在会像根配置一样处理：它不会自行运行测试，而只会提供它所声明的[嵌套项目](/guide/projects#nested-projects)。这些项目的名称会以声明该配置的配置文件名称作为前缀，例如 `app (unit)`。

在 Vitest 4 中，被引用配置的 `projects` 字段会被静默忽略，该配置会作为单个项目运行。请检查你的项目配置是否在不知情的情况下包含 `projects` 字段。最常见的情况是合并了一个定义了该字段的配置：

```ts [packages/app/vitest.config.ts]
import { defineProject, mergeConfig } from 'vitest/config'
import rootConfig from '../../vitest.config' // [!code --]
import sharedConfig from '../../vitest.shared' // [!code ++]

export default mergeConfig(
  // 根配置定义了 `test.projects`，因此合并它会
  // 使此项目变成这些项目的容器
  rootConfig, // [!code --]
  sharedConfig, // [!code ++]
  defineProject({
    test: {
      environment: 'jsdom',
    },
  }),
)
```

由于继承的 `projects` 路径会相对于被引用的配置进行解析，因此这种错误配置通常会在启动时明确失败，并显示 `Projects definition references a non-existing file or a directory`、`No projects were found in "..."` 或循环 `projects` 定义错误。

内联配置在运行时仍会忽略 `projects` 字段，但现在该字段也会从其 `ProjectConfig` 类型中排除。

### 提升的模拟调用必须位于顶层

[`vi.mock`](/api/vi#vi-mock)、[`vi.unmock`](/api/vi#vi-unmock) 和 [`vi.hoisted`](/api/vi#vi-hoisted) 会被提升到文件顶部，并在任何外围代码之前执行。之前在函数、代码块或 `describe`/`test` 回调中调用它们只会记录警告。Vitest 5.0 现在会抛出错误，因为该调用并不会在其书写位置执行：

```ts
describe('calculator', () => {
  vi.mock('./calculator') // [!code --]
})

vi.mock('./calculator') // [!code ++]

describe('calculator', () => {
  // ...
})
```

错误会报告每个违规调用及其位置：

```
"calculator.test.ts" 中有 1 个调用定义在模块顶层作用域之外：

- vi.mock("./calculator") 位于 calculator.test.ts:2:3

尽管它看起来是嵌套的，但它会被提升并在本文件中的任何内容之前执行。请将其移至顶层，以反映其实际执行顺序。
```

动态变体 [`vi.doMock`](/api/vi#vi-domock) 和 [`vi.doUnmock`](/api/vi#vi-dounmock) 不会被提升，仍然可以在任何位置调用。

### 自动 mock 模块在浏览器中仍保持自动 mock

在浏览器模式下，mock 元数据会在 Vitest 和测试 iframe 之间进行序列化。一个自动 mock 模块（即不带 factory 的 [`vi.mock`](/api/vi#vi-mock) 调用）在另一侧被错误地恢复为 spy，因此它的导出会继续调用真实实现，而不是自动生成的 stub。

现在，automock 会被还原为 automock。如果某个浏览器测试依赖于通过自动 mock 模块运行原始实现，那么它的导出现在默认会返回 `undefined`。请传入 [`{ spy: true }`](/api/vi#vi-mock) 以在继续调用真实实现的同时跟踪调用，或者提供一个符合你所需行为的 factory。

### 基准测试 API 重写

基准测试 API 已经重写。`bench` 不再是从 `vitest` 顶层导入的内容；它现在是一个 [测试上下文 fixture](/guide/test-context#bench)，需要在普通的 `test()` 内部访问。有关新 API，请参见 [基准测试指南](/guide/benchmarking)。

已移除，并在适用时提供替代方案：

- **模块作用域下的 `bench(name, fn)`**：请改为从测试上下文中解构出 `bench`。

```ts
// v4
import { bench } from 'vitest' // [!code --]

bench('sort', () => { // [!code --]
  [3, 1, 2].sort() // [!code --]
}) // [!code --]

// v5
import { test } from 'vitest' // [!code ++]

test('sort', async ({ bench }) => { // [!code ++]
  await bench('sort', () => { [3, 1, 2].sort() }).run() // [!code ++]
}) // [!code ++]
```

- **`bench.skip`、`bench.only`、`bench.todo`** 已被移除。请改为在外层的 `test()` 上使用常规的 `test.skip`、`test.only`、`test.todo`。
- **`benchmark.reporters` / `benchmark.outputFile`** 已被移除。基准测试输出现在是默认报告器和 `json` 报告器的一部分；请改为通过顶层的 `test.reporters` 进行配置。
- **`benchmark.compare` 配置和 `--compare` CLI 标志** 已被移除。请将 [`writeResult`](/guide/benchmarking#storing-and-replaying-results) 作为每个基准测试的选项来持久化结果，并在 `bench.compare()` 中通过 [`bench.from()`](/guide/benchmarking#bench-from) 读取。
- **`benchmark.outputJson` 配置和 `--outputJson` CLI 标志** 已被移除。请使用 `--reporter=json --outputFile=<path>` 来捕获基准测试结果；`JSON` 报告器现在会在每个测试用例上包含一个 `benchmarks` 字段。
- **`Vitest` 实例的 `mode` 属性** 现在始终为 `'test'`。之前的 `'benchmark'` 值不再使用；基准测试会在同一个 `Vitest` 实例的专用项目中运行。

### Vitest UI 需要经过身份验证的 URL

Vitest UI 现在要求对 HTML 页面和 API 访问进行令牌认证。`/__vitest__/` URL 在浏览器完成认证之前会显示错误。要进行认证，请使用 Vitest 打印的令牌打开该 URL，如下所示。认证完成后，直接访问 `/__vitest__/` URL 将正常工作。

```bash
vitest --ui
# UI started at http://localhost:51204/__vitest__/?token=...
```

### 现在假时间器会模拟 `Temporal`

Vitest 现在在启用假时间器时，会与 `Date` 一起模拟 [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) API，遵循 [`@sinonjs/fake-timers` v15.4 更新](https://github.com/sinonjs/fake-timers/blob/main/CHANGELOG.md#1540--2026-05-05)。这只有在全局对象上可用 `Temporal` 时才会生效——要么是原生支持（Node.js >= 26 默认支持，在旧版本中可通过 `--harmony-temporal` 启用，且受支持的浏览器也支持），要么是通过全局安装的 polyfill，例如 `import 'temporal-polyfill/global'`。

之前即使 [`vi.useFakeTimers()`](/api/vi#vi-usefaketimers) 处于激活状态，`Temporal.Now` 仍会返回真实的墙钟时间。现在它会跟随被模拟的时钟：

```ts
vi.useFakeTimers({ now: 0 })

Temporal.Now.instant().epochMilliseconds // 0（在 v4 中这里是实际时间）
```

`Temporal` 是默认被模拟的 API 集合的一部分，因此它受 [`fakeTimers.toFake`](/config/#faketimers-tofake) 和 [`fakeTimers.toNotFake`](/config/#faketimers-tonotfake) 控制。若要保持 `Temporal` 使用原生实现，请将其添加到 `toNotFake`：

```ts
vi.useFakeTimers({ toNotFake: ['Temporal'] })
```

### `setSystemTime` 现在也会模拟 Temporal

之前，`vi.setSystemTime` 在没有使用虚假计时器时只会模拟 `Date`，但现在它也会模拟 `Temporal.Now` 的方法。

```ts
vi.setSystemTime(0)
Temporal.Now.instant().epochMilliseconds // 0（在 v4 中是实际时间）
```

### `toThrow("")` 匹配任意错误消息

[`toThrow`](/api/expect#tothrow)（及其别名 `toThrowError`）会将字符串参数视为错误消息的子字符串。在 Vitest 4 中，空字符串有特殊处理，会被当作 `/^$/` 模式，因此它只会匹配消息为空的错误。现在它的行为与其他子字符串一致，而空字符串会出现在每条消息中：

```ts
expect(() => { throw new Error('boom') }).not.toThrow('') // [!code --]
expect(() => { throw new Error('boom') }).toThrow('') // [!code ++]
```

如果要断言抛出的错误消息为空，请显式匹配该模式：

```ts
expect(() => { throw new Error('boom') }).not.toThrow(/^$/)
```

### 断言类型公开返回类型和接收类型

断言接口现在使用两个类型参数：`R` 是匹配器返回类型，`T` 是接收值类型。同步断言使用 `void`，而通过 `.resolves`、`.rejects`、[`expect.poll`](/api/expect#poll) 或 [`expect.element`](/api/browser/assertions) 访问的断言使用 `Promise<void>`。

如果你声明自定义匹配器，请扩展 `Matchers<R, T>` 接口。它会将匹配器添加到实例断言、非对称匹配器以及 `expect.extend` 接受的类型中：

```ts [vitest.d.ts]
import 'vitest'

interface CustomMatchers<R = unknown, T = unknown> {
  toBeFoo: () => R
  toEqualTyped: (expected: T) => R
}

declare module 'vitest' {
  interface Matchers<R, T> extends CustomMatchers<R, T> {}
}
```

这样，自定义匹配器的返回类型就会反映匹配器的使用方式：

```ts
const syncResult = expect('value').toEqualTyped('other') // void
const asyncResult = expect(Promise.resolve('value')).resolves.toEqualTyped('other') // Promise<void>
await asyncResult
```

直接引用断言类型的代码也必须首先提供返回类型：

```ts
Assertion<string> // [!code --]
Assertion<void, string> // [!code ++]
Assertion<Promise<void>, string> // 异步断言
```

Vitest 不再从全局 `jest.Matchers` 接口读取自定义匹配器声明。同时支持 Jest 和 Vitest 的库应分别扩展 `jest.Matchers` 和 `vitest.Matchers`。这只会影响 TypeScript 声明；使用 `expect.extend` 注册匹配器的方式保持不变。

### `expect.poll` 超时失败

[`expect.poll`](/api/expect#poll) 现在会在其回调或轮询断言未能在 `timeout` 内完成时拒绝。此前，超出截止时间后才解析的回调，或者只有在较晚一次尝试中才通过的断言，仍然可能成功。现在回调还会接收一个 `AbortSignal`，它会在超时时中止，因此你可以取消正在进行的工作：

```ts
await expect.poll(async ({ signal }) => {
  const response = await fetch('/api/status', { signal })
  return response.status
}, { timeout: 1000 }).toBe(200)
```

如果轮询确实需要更多时间，应当提高其 `timeout`。否则它会以 `expect.poll() function didn't resolve in time.`（或 `expect.poll() assertion didn't resolve in time.`）失败。

### 测试标题和被检查的值使用 `pretty-format`

Vitest 现在在检查值时使用 [`pretty-format`](https://www.npmjs.com/package/pretty-format) 而不是 `loupe` 来格式化这些值，包括插入到 [`test.each`](/api/test#test-each) 和 [`test.for`](/api/test#test-for) 标题中的值。某些值的渲染会发生变化，因此捕获检查输出的快照或断言可能需要更新。

有两项变更专门针对生成的测试标题：

- 通过 `$` 占位符插入的字符串值不再用引号包裹：

```ts
test.for([{ id: 'a1' }])('case $id', ({ id }) => { /* ... */ })
// v4 标题: case 'a1' // [!code --]
// v5 标题: case a1   // [!code ++]
```

- 插入值的长度限制现在由新的 [`taskTitleValueFormatTruncate`](/config/tasktitlevalueformattruncate) 选项控制（默认值为 `40`）。

### 已移除 `test.sequential`、`describe.sequential` 和 `sequential` 选项

Vitest 5.0 移除了已弃用的 `test.sequential`、`describe.sequential` 和 `sequential` 测试选项。在需要测试或测试套件退出继承的或全局配置的并发时，请使用 `concurrent: false`。

```ts
test.sequential('example', async () => { /* ... */ }) // [!code --]
test('example', { concurrent: false }, async () => { /* ... */ }) // [!code ++]
```

```ts
describe.sequential('suite', () => { /* ... */ }) // [!code --]
describe('suite', { concurrent: false }, () => { /* ... */ }) // [!code ++]
```

同样的替换也适用于选项对象：

```ts
test('example', { sequential: true }, async () => { /* ... */ }) // [!code --]
test('example', { concurrent: false }, async () => { /* ... */ }) // [!code ++]
```

### 命令中的定位器会被序列化为对象

传递给 [浏览器命令](/api/browser/commands) 的定位器现在会被序列化为 `SerializedLocator` 对象，而不是裸选择器字符串。该对象暴露两个字段：

- `selector`：特定提供者的选择器字符串（与命令之前接收的值相同）。
- `locator`：定位器的人类可读表示（例如 `getByRole('button')`），用于错误消息和追踪。

更新任何接受定位器的自定义命令，从新的对象中解构出 `selector`：

```ts
import type { SerializedLocator } from '@vitest/browser'
import type { BrowserCommandContext } from 'vitest/node'

export async function customClick(
  context: BrowserCommandContext,
  selector: string, // [!code --]
  { selector }: SerializedLocator, // [!code ++]
) {
  await context.page.locator(selector).click()
}
```

### 选择器默认是严格匹配

现在浏览器定位器默认会精确匹配文本，要求完整且区分大小写的匹配。要保留之前的行为，你可以将 [`browser.locators.exact`](/config/browser/locators#browser-locators-exact) 设置为 `false`。

```ts
// exact: true（默认）时，这里只会精确匹配字符串 "Hello, World"。
// exact: false 时，这里会匹配 "Hello, World!"、"Say Hello, World" 等。
const locator = page.getByText('Hello, World', { exact: true })
await locator.click()
```

### `toHaveTextContent` 现在执行严格相等匹配

浏览器模式下的 [`toHaveTextContent`](/api/browser/assertions#tohavetextcontent) 匹配器现在会验证元素的文本内容是否与预期字符串完全相等，而不再执行部分、区分大小写的匹配。不再接受正则表达式。之前的行为，包括对 `RegExp` 的支持，已迁移到新的 [`toMatchTextContent`](/api/browser/assertions#tomatchtextcontent) 匹配器中。

```ts
// 部分匹配或正则匹配：
await expect.element(banner).toHaveTextContent('Error') // [!code --]
await expect.element(banner).toHaveTextContent(/error/i) // [!code --]
await expect.element(banner).toMatchTextContent('Error') // [!code ++]
await expect.element(banner).toMatchTextContent(/error/i) // [!code ++]

// 精确匹配仍然使用 `toHaveTextContent`：
await expect.element(banner).toHaveTextContent('Error!')
```

### `render` 在 `vitest-browser-vue` 和 `vitest-browser-svelte` 中是异步的

配套的组件测试包 [`vitest-browser-vue`](https://npmx.dev/package/vitest-browser-vue) 和 [`vitest-browser-svelte`](https://npmx.dev/package/vitest-browser-svelte) 现在会从 `render` 返回一个 promise，因此在查询渲染输出之前，必须先对该调用进行 `await`：

```ts
import { render } from 'vitest-browser-vue'
import Component from './Component.vue'

test('renders', async () => {
  const screen = render(Component) // [!code --]
  const screen = await render(Component) // [!code ++]

  await expect.element(screen.getByRole('heading')).toBeVisible()
})
```

### Glob 覆盖率阈值不再继承 `perFile`

`coverage.thresholds.perFile` 过去会应用于每个阈值集合，包括被 glob 模式阈值匹配的文件。现在 glob 模式会自行控制按文件检查，不再继承顶层的 `perFile` —— 请在每个需要的 glob 上设置 `perFile`。

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        'perFile': true,

        'src/utils/**': {
          lines: 80,
          perFile: true, // [!code ++]
        },
      },
    },
  },
})
```

### 覆盖率 `include` 和 `exclude` 匹配更加精确

`coverage.include` 和 `coverage.exclude` 之前是使用 picomatch 的 `contains` 选项与绝对路径进行匹配的，这会匹配到比预期更多的文件。例如，一个模式可能会因为其绝对路径中的某个父目录碰巧包含相同的片段而匹配到某个文件。现在，模式会针对每个文件相对于项目根目录的路径进行匹配，不再使用 `contains`。

没有 glob 通配符的模式会被视为目录，并扩展为匹配其中的所有内容：

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    coverage: {
      include: ['src'], // 匹配 src/**，而不是所有包含 "src" 的路径
    },
  },
})
```

升级后请检查你的 `include` 和 `exclude` 模式，并确认报告出来的文件集合符合预期。以前仅因较宽松的匹配行为而被匹配到的文件，现在可能不会再被包含。

### 配置文件不会从父目录中查找

Vitest 不再向上搜索父目录中的配置文件。如果你之前依赖于在子目录中运行 `vitest`，同时使用父目录中的配置文件，请显式传入配置，并使用 `--dir` 限定测试发现范围。例如：

```bash
$ cd subdir && vitest # [!code --]
$ cd subdir && vitest --config ../vitest.config.ts # [!code ++]
```

### DOM 环境中的全局赋值现在会更新底层窗口

在 `jsdom` 和 `happy-dom` 环境中，对 `globalThis` 或 `window` 上属性的赋值现在会传播到底层 DOM 实现。诸如 `innerWidth` 之类的可变属性会影响由 DOM 环境实现的 API，例如 `happy-dom` 的 `matchMedia`。

### `populateGlobal` 在 `originals` 中返回描述符

[`populateGlobal`](/guide/environment#custom-environment) 返回的 `originals` 映射现在保存的是 [属性描述符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor)，而不是普通值。这样可以在捕获原始值时避免调用原生的延迟 getter（例如 Node 的 `localStorage`），并在清理时准确地恢复它们。

如果你在自定义环境中手动恢复它们，请使用 `Object.defineProperty`，而不是赋值：

```ts
originals.forEach((value, key) => (global[key] = value)) // [!code --]
originals.forEach((descriptor, key) => Object.defineProperty(global, key, descriptor)) // [!code ++]
```

### 浏览器协调器 URL 需要会话

Vitest 不再通过一个裸的 `/__vitest_test__/` URL 提供浏览器协调器 UI。浏览器运行器 URL 现在绑定到会话，并且必须包含 Vitest 生成的 `sessionId`，例如 `/__vitest_test__/?sessionId=...`。

如果你之前是通过复制 Vite 服务器 URL 或直接访问 `/__vitest_test__/` 来手动打开浏览器预览，请改用 Vitest 打开或打印的 URL。

### 生成的报告和工件使用 `.vitest` 目录

Vitest 现在在项目根目录下使用单一的 `.vitest` 目录作为共享工件根目录，因此 `.gitignore` 中只需要一条 `.vitest` 规则即可。本次主要版本迁移的默认位置变更如下：

- **附件** ([`attachmentsDir`](/config/attachmentsdir)): `.vitest-attachements/` → `.vitest/attachments/`
- **Blob 报告器** 和 `--merge-reports`: `.vitest-reports/blob-*.json` → `.vitest/blob/blob-*.json`
- **HTML 报告器** ([`html`](/guide/reporters#html-reporter)): `html/index.html` → `.vitest/index.html`，并且其选项已从 `outputFile`（文件）改为 `outputDir`（目录）
- **JSON 报告器** ([`json`](/guide/reporters#json-reporter)): stdout → `.vitest/json/output.json`
- **JUnit 报告器** ([`junit`](/guide/reporters#junit-reporter)): stdout → `.vitest/junit/output.xml`

`json` 和 `junit` 报告器现在默认写入文件，而不是打印到 stdout。如果你之前依赖报告输出到 stdout（例如 `vitest --reporter=json > out.json` 或 `vitest --reporter=json | jq`），可以改为直接读取生成的工件文件（例如 `jq . .vitest/json/output.json`），或者通过报告器的 `stdout` 选项重新启用 stdout（`reporters: [['json', { stdout: true }]]`）。显式指定的 `outputFile` 仍然有效，且保持不变。

### `toMatchScreenshot` 现在使用专用的截图目录配置

此前，`toMatchScreenshot` 的参考截图没有正确遵循 `browser.screenshotDirectory`。因此，当配置了自定义目录时，截图会被保存到意外的位置。

现在已通过引入一个专用选项来修复此问题：`browser.expect.toMatchScreenshot.screenshotDirectory`。其默认值为 `__screenshots__`。

- 如果你没有设置 `browser.screenshotDirectory`，则无需进行任何更改。
- 如果你设置了 `browser.screenshotDirectory`，则现在必须显式配置新选项：

    ```ts [vitest.config.ts]
    export default defineConfig({
      test: {
        browser: {
          screenshotDirectory: 'my-screenshots',
          expect: { // [!code ++]
            toMatchScreenshot: { // [!code ++]
              screenshotDirectory: 'my-screenshots', // [!code ++]
            }, // [!code ++]
          }, // [!code ++]
        },
      },
    })
    ```

    然后，将现有的参考截图移动到新位置，或者重新生成它们。

### Worker 和并发 ID 改为从 1 开始

Worker 和 pool 标识符现在从 `1` 开始，而不是 `0`。这会影响 `VITEST_POOL_ID` 和 `VITEST_WORKER_ID` 环境变量的值，它们现在的范围是从 `1` 到 worker 数量。请更新任何基于这些 id 推导值的逻辑，例如每个 worker 的数据库名称或数组索引。

对于自定义 reporter，[`TestModule`](/api/advanced/test-module#diagnostic) 的诊断信息现在同时暴露这两个 id：现有的 `workerId`（现在从 1 开始）以及一个新的 `concurrencyId`。

```ts
import type { Reporter, TestModule } from 'vitest/node'

class MyReporter implements Reporter {
  onTestModuleEnd(testModule: TestModule) {
    const { workerId, concurrencyId } = testModule.diagnostic()
  }
}
```

Node.js 和浏览器测试运行在不同的池中，不共享这些 id，因此相同的值可能会同时出现在两者中。

### 包迁移

以下包自本次发布起已被弃用。它们将不再接收功能更新，但安全修复仍将继续回移植：

- [`@vitest/runner`](https://npmx.dev/package/@vitest/runner)
- [`@vitest/ws-client`](https://npmx.dev/package/@vitest/ws-client)

[`@vitest/browser-webdriverio`](https://npmx.dev/package/@vitest/browser-webdriverio) 提供程序已迁移到 [vitest-community](https://github.com/vitest-community/vitest-webdriverio) 组织。从现在起，WebdriverIO 支持将由社区维护，并按具体问题逐一处理。如果你正在使用它，请将依赖更新到新包，并在新的仓库中报告任何问题。

### 移除已弃用的入口点

在 Vitest 4.1 中，一些入口点已被标记为弃用。此版本将它们完全移除。

- `vitest/coverage`：请改用 `vitest/node`
- `vitest/reporters`：请改用 `vitest/node`
- `vitest/environments`：请改用 `vitest/runtime`
- `vitest/snapshot`：请改用 `vitest/runtime`
- `vitest/runners`：请改用 `vitest` 中的 `TestRunner`
- `vitest/suite`：请改用 vitest 中 `TestRunner` 的静态方法（例如，`TestRunner.getCurrentTest()`）
- `vitest/mocker` 已被完全移除，请直接使用 `@vitest/mocker` 包（这个包曾一度被意外发布，但从未被移除）
- `vitest/internal/module-runner` 已被移除。

## 从 Jest 迁移 {#jest}

Vitest 的设计采用了与 Jest 兼容的 API，以使从 Jest 迁移尽可能简单。尽管做出了这些努力，您仍可能会遇到以下差异：

### 默认全局变量

Jest 默认启用了它们的 [全局 API](https://jestjs.io/docs/api)。Vitest 没有。您可以通过 [`globals` 配置设置](/config/globals) 启用全局变量，或者更新代码以使用从 `vitest` 模块导入的内容。

如果您决定保持全局变量禁用，请注意像 [`testing-library`](https://testing-library.com/) 这样的常用库将不会运行自动 DOM [清理](https://testing-library.com/docs/svelte-testing-library/api/#cleanup)。

### `mock.mockReset`

Jest 的 [`mockReset`](https://jestjs.io/docs/mock-function-api#mockfnmockreset) 会将 mock 实现替换为一个返回 `undefined` 的空函数。

Vitest 的 [`mockReset`](/api/mock#mockreset) 会将 mock 实现重置为其原始状态。
也就是说，重置由 `vi.fn(impl)` 创建的 mock 会将 mock 实现重置为 `impl`。

### `mock.mock` 是持久的

Jest 会在调用 `.mockClear` 时重新创建 mock 状态，这意味着您总是需要将其作为 getter 访问。另一方面，Vitest 持有状态的持久引用，这意味着您可以重用它：

```ts
const mock = vi.fn()
const state = mock.mock
mock.mockClear()

expect(state).toBe(mock.mock) // 在 Jest 中失败
```

### 模块 Mock

在 Jest 中 Mock 模块时，工厂参数的返回值是默认导出。在 Vitest 中，工厂参数必须返回一个显式定义每个导出的对象。例如，以下 `jest.mock` 必须更新为：

```ts
jest.mock('./some-path', () => 'hello') // [!code --]
vi.mock('./some-path', () => ({ // [!code ++]
  default: 'hello', // [!code ++]
})) // [!code ++]
```

更多详情请参阅 [`vi.mock` API 部分](/api/vi#vi-mock)。

### 自动 Mock 行为

与 Jest 不同，`<root>/__mocks__` 中的 Mock 模块除非调用了 `vi.mock()`，否则不会加载。如果您需要像 Jest 一样在每个测试中 Mock 它们，可以在 [`setupFiles`](/config/setupfiles) 中 Mock 它们。

### 导入被 Mock 包的原始版本

如果您只是部分 Mock 一个包，您之前可能使用了 Jest 的函数 `requireActual`。在 Vitest 中，您应该将这些调用替换为 `vi.importActual`。

```ts
const { cloneDeep } = jest.requireActual('lodash/cloneDeep') // [!code --]
const { cloneDeep } = await vi.importActual('lodash/cloneDeep') // [!code ++]
```

### 将 Mock 扩展到外部库

Jest 默认会这样做：当 Mock 一个模块并希望此 Mock 扩展到其他使用相同模块的外部库时，您应该明确告诉要 Mock 哪个第三方库，以便外部库成为源代码的一部分，可通过使用 [server.deps.inline](/config/server#inline)。

```
server.deps.inline: ["lib-name"]
```

### expect.getState().currentTestName

Vitest 的 `test` 名称用 `>` 符号连接，以便更容易区分测试和套件，而 Jest 使用空格 (` `)。

```diff
- `${describeTitle} ${testTitle}`
+ `${describeTitle} > ${testTitle}`
```

### 环境变量

就像 Jest 一样，如果之前未设置，Vitest 会将 `NODE_ENV` 设置为 `test`。Vitest 还有一个对应于 `JEST_WORKER_ID` 的 `VITEST_POOL_ID`（总是小于或等于 `maxWorkers`），所以如果您依赖它，别忘了重命名它。Vitest 还暴露了 `VITEST_WORKER_ID`，这是运行 worker 的唯一 ID - 这个数字不受 `maxWorkers` 影响，并且会随着每个创建的 worker 增加。

### 替换属性

如果您想修改对象，在 Jest 中会使用 [replaceProperty API](https://jestjs.io/docs/jest-object#jestreplacepropertyobject-propertykey-value)，您可以在 Vitest 中使用 [`vi.stubEnv`](/api/vi#vi-stubenv) 或 [`vi.spyOn`](/api/vi#vi-spyon) 来做同样的事情。

### Done 回调

Vitest 不支持以回调风格声明测试。您可以重写它们以使用 `async`/`await` 函数，或使用 Promise 来模拟回调风格。

<!--@include: ./examples/promise-done.md-->

### 钩子

`beforeAll`/`beforeEach` 钩子在 Vitest 中可以返回 [清理函数](/api/hooks#beforeach)。因此，如果它们返回 `undefined` 或 `null` 以外的内容，您可能需要重写钩子声明：

```ts
beforeEach(() => setActivePinia(createTestingPinia())) // [!code --]
beforeEach(() => { setActivePinia(createTestingPinia()) }) // [!code ++]
```

在 Jest 中，钩子是顺序调用的（一个接一个）。默认情况下，Vitest 以栈方式运行钩子。要使用 Jest 的行为，请更新 [`sequence.hooks`](/config/sequence#sequence-hooks) 选项：

```ts
export default defineConfig({
  test: {
    sequence: { // [!code ++]
      hooks: 'list', // [!code ++]
    } // [!code ++]
  }
})
```

### 类型

Vitest 没有等同于 `jest` 命名空间的对象，所以您需要直接从 `vitest` 导入类型：

```ts
let fn: jest.Mock<(name: string) => number> // [!code --]
import type { Mock } from 'vitest' // [!code ++]
let fn: Mock<(name: string) => number> // [!code ++]
```

### 计时器

Vitest 不支持 Jest 的旧版计时器。

### 超时

如果您使用了 `jest.setTimeout`，您需要迁移到 `vi.setConfig`：

```ts
jest.setTimeout(5_000) // [!code --]
vi.setConfig({ testTimeout: 5_000 }) // [!code ++]
```

### Vue 快照

这不是 Jest 特有的功能，但如果您之前使用带有 vue-cli 预设的 Jest，您将需要安装 [`jest-serializer-vue`](https://github.com/eddyerburgh/jest-serializer-vue) 包，并在 [`snapshotSerializers`](/config/snapshotserializers) 中指定它：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    snapshotSerializers: ['jest-serializer-vue']
  }
})
```

否则您的快照将会有很多转义的 `"` 字符。

### 自定义快照匹配器 <Experimental /> <Version>4.1.3</Version> {#custom-snapshot-matcher}

Jest 从 `jest-snapshot` 导入快照组合器。在 Vitest 中，请改用 `vitest` 中的 `Snapshots`：

```ts
const { toMatchSnapshot } = require('jest-snapshot') // [!code --]
import { Snapshots } from 'vitest' // [!code ++]
const { toMatchSnapshot } = Snapshots // [!code ++]

expect.extend({
  toMatchTrimmedSnapshot(received: string, length: number) {
    return toMatchSnapshot.call(this, received.slice(0, length))
  },
})
```

对于内联快照，同样适用：

```ts
const { toMatchInlineSnapshot } = require('jest-snapshot') // [!code --]
import { Snapshots } from 'vitest' // [!code ++]
const { toMatchInlineSnapshot } = Snapshots // [!code ++]

expect.extend({
  toMatchTrimmedInlineSnapshot(received: string, inlineSnapshot?: string) {
    return toMatchInlineSnapshot.call(this, received.slice(0, 10), inlineSnapshot)
  },
})
```

请参阅 [自定义快照匹配器](/guide/snapshot#custom-snapshot-matchers) 获取完整指南。

## 从 Mocha + Chai + Sinon 迁移 {#mocha-chai-sinon}

Vitest 为从 Mocha+Chai+Sinon 测试套件迁移提供了极好的支持。虽然 Vitest 默认使用与 Jest 兼容的 API，但它也为 spy/mock 测试提供了 Chai 风格的断言，使迁移更容易。

### 测试结构

Mocha 和 Vitest 有相似的测试结构，但有一些差异：

```ts
// Mocha
describe('suite', () => {
  before(() => { /* 设置 */ })
  after(() => { /* 清理 */ })
  beforeEach(() => { /* 设置 */ })
  afterEach(() => { /* 清理 */ })

  it('test', () => {
    // 测试代码
  })
})

// Vitest - 相同的结构也适用！
import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'vitest'

describe('suite', () => {
  beforeAll(() => { /* 设置 */ })
  afterAll(() => { /* 清理 */ })
  beforeEach(() => { /* 设置 */ })
  afterEach(() => { /* 清理 */ })

  it('test', () => {
    // 测试代码
  })
})
```

### 断言

Vitest 默认包含 Chai 断言，所以 Chai 断言无需更改即可工作：

```ts
// Mocha+Chai 和 Vitest 均适用
import { expect } from 'vitest' // 或在 Mocha 中使用 'chai'

expect(value).to.equal(42)
expect(value).to.be.true
expect(array).to.have.lengthOf(3)
expect(obj).to.have.property('key')
```

### Spy/Mock 断言

Vitest 为 spies 和 mocks 提供了 **Chai 风格断言**，允许您从 Sinon 迁移而无需重写断言：

```ts
// 之前 (Mocha + Chai + Sinon)
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

const spy = sinon.spy(obj, 'method')
obj.method('arg1', 'arg2')

expect(spy).to.have.been.called
expect(spy).to.have.been.calledOnce
expect(spy).to.have.been.calledWith('arg1', 'arg2')

// 之后 (Vitest) - 相同的断言语法！
import { expect, vi } from 'vitest'

const spy = vi.spyOn(obj, 'method')
obj.method('arg1', 'arg2')

expect(spy).to.have.been.called
expect(spy).to.have.been.calledOnce
expect(spy).to.have.been.calledWith('arg1', 'arg2')
```

#### 完整的 Chai 风格断言支持

Vitest 支持所有常见的 sinon-chai 断言：

| Sinon-Chai | Vitest | 描述 |
|------------|--------|-------------|
| `spy.called` | `called` | Spy 至少被调用了一次 |
| `spy.calledOnce` | `calledOnce` | Spy 恰好被调用了一次 |
| `spy.calledTwice` | `calledTwice` | Spy 恰好被调用了两次 |
| `spy.calledThrice` | `calledThrice` | Spy 恰好被调用了三次 |
| `spy.callCount(n)` | `callCount(n)` | Spy 被调用了 n 次 |
| `spy.calledWith(...)` | `calledWith(...)` | Spy 使用特定参数被调用 |
| `spy.calledOnceWith(...)` | `calledOnceWith(...)` | Spy 使用特定参数被调用了一次 |
| `spy.returned(value)` | `returned` | Spy 返回了特定值 |

请参阅 [Chai 风格 Spy 断言](/api/expect#chai-style-spy-assertions) 文档获取完整列表。

### 创建 Spies 和 Mocks

将 Sinon 的 spy/stub/mock 创建替换为 Vitest 的 `vi` 工具：

```ts
// Sinon
const sinon = require('sinon')
const spy = sinon.spy()
const stub = sinon.stub(obj, 'method')
const mock = sinon.mock(obj)

// Vitest
import { vi } from 'vitest'
const spy = vi.fn()
const stub = vi.spyOn(obj, 'method')
// Vitest 没有 "mocks" - 改用 spies
```

### Stub 返回值

```ts
// Sinon
stub.returns(42)
stub.onFirstCall().returns(1)
stub.onSecondCall().returns(2)

// Vitest
stub.mockReturnValue(42)
stub.mockReturnValueOnce(1)
stub.mockReturnValueOnce(2)
```

### Stub 实现

```ts
// Sinon
stub.callsFake(arg => arg * 2)

// Vitest
stub.mockImplementation(arg => arg * 2)
```

### 恢复 Spies

```ts
// Sinon
spy.restore()
sinon.restore() // 恢复所有

// Vitest
spy.mockRestore()
vi.restoreAllMocks() // 恢复所有
```

### 计时器

Sinon 和 Vitest 内部都使用 `@sinonjs/fake-timers`：

```ts
// Sinon
const clock = sinon.useFakeTimers()
clock.tick(1000)
clock.restore()

// Vitest
import { vi } from 'vitest'
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()
```

### 主要差异

1. **全局变量**：Mocha 默认提供全局变量。在 Vitest 中，要么从 `vitest` 导入，要么启用 [`globals`](/config/globals) 配置
2. **断言风格**：您可以同时使用 Chai 风格 (`expect(spy).to.have.been.called`) 和 Jest 风格 (`expect(spy).toHaveBeenCalled()`)
3. **并行执行**：Vitest 默认并行运行测试，Mocha 顺序运行

更多信息，请参阅：
- [Chai 风格 Spy 断言](/api/expect#chai-style-spy-assertions)
- [Mocking 指南](/guide/mocking)
- [Vi API](/api/vi)
