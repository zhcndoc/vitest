---
title: 迁移指南 | 指南
outline: deep
---

# 迁移到 Vitest 5.0 {#vitest-5}

[迁移到 Vitest 4.0](https://v4.vitest.dev/guide/migration) | [迁移到 Vitest 3.0](https://v3.vitest.dev/guide/migration)

<div class="migration-actions">
  <ChangelogButton href="https://github.com/vitest-dev/vitest/releases/tag/v5.0.0" />
  <CopyPrompt prompt="迁移到 Vitest 5。请从 https://vitest.dev/guide/migration.md 获取迁移指南并应用相应更改。只修改迁移所必需的文件。如果当前版本低于 Vitest 4，请先应用之前迁移指南中的更改。" />
</div>

::: warning 前置条件
Vitest 5.0 需要 Vite >= 6.4.0 和 Node.js >= 22.12.0。进行其他迁移步骤前，请确认环境符合这些要求。不支持在旧版本的 Vite 或 Node.js 上运行 Vitest 5.0，否则可能出现意外错误。
:::

## Yarn 用户必须显式安装 `vite`

`vite` 不再是 `vitest` 的直接依赖，现在是必需的 peer dependency，因此 Vitest 会使用项目中安装的 Vite 版本。npm、pnpm、Bun 和 Deno 会自动安装 peer dependencies，Yarn 则不会。因此升级后，除非在 `package.json` 中列出 `vite`，否则 Vitest 无法解析它：

```bash
yarn add -D vite
```

## `clearMocks` 默认启用

[`clearMocks`](/config/clearmocks) 现在默认为 `true`：Vitest 会在每个测试前调用 [`vi.clearAllMocks()`](/api/vi#vi-clearallmocks)，清除每个 mock 的调用历史，同时保留其实现。

这意味着一个 mock 不会再把某个测试中的调用记录带到下一个测试中：

```ts
import { expect, test, vi } from 'vitest'

const fn = vi.fn()

test('first', () => {
  fn()
  expect(fn).toHaveBeenCalledTimes(1)
})

test('second', () => {
  fn()
  // v4: the call from "first" was kept, so this was 2 // [!code --]
  expect(fn).toHaveBeenCalledTimes(2) // [!code --]
  // v5: history is cleared before each test, so only this test's call counts // [!code ++]
  expect(fn).toHaveBeenCalledTimes(1) // [!code ++]
})
```

在测试主体之外记录调用的测试受影响最大，例如在 setup 文件、模块顶层或 `beforeAll` 钩子中记录的调用，因为在断言它们的测试运行前，这些历史记录就会被清除。

如需恢复之前的行为，将 `clearMocks` 重新设为 `false`：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: false, // [!code ++]
  },
})
```

## `testNamePattern` 匹配以 `>` 连接的完整名称

[`testNamePattern`](/config/testnamepattern)（`-t` CLI 标志）现在会匹配测试的完整名称，其中套件层级与测试名称通过 `' > '` 连接，与报告器输出中显示的字符串相同。此前各段之间使用单个空格连接，与 Jest 保持一致。

只有跨越两个名称段边界的模式会受到影响：

```ts
describe('math', () => {
  test('adds', () => {})
})
```

```bash
vitest -t 'math adds' # [!code --]
vitest -t 'math > adds' # [!code ++]
```

要让模式不受分隔符影响，可以匹配单个名称段（`-t adds`），或在各段之间使用通配符（`-t 'math.*adds'`）。

## 内联项目默认继承根配置

[`extends`](/guide/projects#configuration) 选项现在默认为 `true`：在 [`test.projects`](/guide/projects) 中以内联配置定义的每个项目都会继承根配置中的所有选项，包括 `plugins` 或 `resolve.alias` 等 Vite 选项。选项合并规则与 Vitest 4 中显式设置 `extends: true` 时相同：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        // v4: this project didn't apply the react plugin
        // v5: the plugin is inherited from the root config
        test: {
          name: 'unit',
          include: ['**/*.unit.test.ts'],
        },
      },
    ],
  },
})
```

作为配置文件或目录引用的项目不受影响；它们仍不会继承根配置中的任何选项。

请注意，数组会合并而不是覆盖：如果根配置定义了 `setupFiles`，项目自己的 `setupFiles` 会追加到继承的值之后。有关合并规则和少数永远不会继承的选项，请参阅[项目指南](/guide/projects#configuration)。如需恢复之前的行为，请在项目配置中设置 `extends: false`：

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

## 被引用的配置文件可以定义自己的项目

在 [`test.projects`](/guide/projects) 中引用且自身声明了 `projects` 的配置文件，现在会提供它声明的[嵌套项目](/guide/projects#nested-projects)（例如 `app (unit)`、`app (e2e)`），而不是将测试作为单个项目运行。

在 Vitest 4 中，被引用配置的 `projects` 字段会被静默忽略。请检查项目配置中是否意外带有 `projects` 字段，最常见的情况是合并了一个定义该字段的配置：

```ts [packages/app/vitest.config.ts]
import { defineProject, mergeConfig } from 'vitest/config'
import rootConfig from '../../vitest.config' // [!code --]
import sharedConfig from '../../vitest.shared' // [!code ++]

export default mergeConfig(
  // the root config defines `test.projects`, so merging it
  // would turn this project into a container for those projects
  rootConfig, // [!code --]
  sharedConfig, // [!code ++]
  defineProject({
    test: {
      environment: 'jsdom',
    },
  }),
)
```

由于继承的 `projects` 路径会相对于被引用的配置进行解析，这种错误配置通常会在启动时明确报错，例如 `Projects definition references a non-existing file or a directory`、`No projects were found in "..."`，或循环定义 `projects`。

内联配置在运行时仍会忽略 `projects` 字段，但该字段现在也已从其 `ProjectConfig` 类型中排除。

## 内联项目默认共享 Vite 服务器

不修改 Vite 配置的内联项目现在会复用声明它们的配置所使用的 Vite 服务器，而不是为每个项目解析新的 Vite 配置并创建新服务器。这样共享文件只需转换一次，测试运行也更快。此行为由新的 [`sharedViteServer`](/config/sharedviteserver) 选项控制，该选项默认启用；相关文档列出了仍会让项目获得独立服务器的具体选项。

请注意，这_仅_适用于内联项目。作为配置文件或目录引用的项目始终会解析自己的 Vite 配置并创建自己的服务器，与之前完全相同。

可观察到的变化是：共享服务器时，声明配置文件只执行一次，而不是每个项目执行一次，因此其中的插件也只实例化一次，其 `config` 钩子不再为每个项目分别运行。如果插件依赖于为每个项目重新实例化，请禁用服务器共享：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    sharedViteServer: false, // [!code ++]
    projects: [
      { test: { name: 'unit' } },
      { test: { name: 'integration' } },
    ],
  },
})
```

## 提升的模拟调用必须位于顶层

[`vi.mock`](/api/vi#vi-mock)、[`vi.unmock`](/api/vi#vi-unmock) 和 [`vi.hoisted`](/api/vi#vi-hoisted) 会被提升到文件顶部，并在任何外围代码之前执行。此前在函数、代码块或 `describe`/`test` 回调中调用它们只会记录警告。Vitest 5.0 现在会抛出错误，因为这些调用并不会在其书写位置执行：

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
1 call in "calculator.test.ts" was defined outside of the module's top level scope:

- vi.mock("./calculator") at calculator.test.ts:2:3

Although it appears nested, it will be hoisted and executed before anything in this file. Move it to the top level to reflect its actual execution order.
```

动态版本 [`vi.doMock`](/api/vi#vi-domock) 和 [`vi.doUnmock`](/api/vi#vi-dounmock) 不会被提升，仍可在任意位置调用。

## 浏览器中的模块仍会自动模拟

在浏览器模式下，自动模拟模块的导出（即不带工厂函数的 [`vi.mock`](/api/vi#vi-mock) 调用）此前错误地继续调用真实实现，而不是自动生成的存根。如果浏览器测试依赖此行为，现在其导出默认会返回 `undefined`。传入 [`{ spy: true }`](/api/vi#vi-mock) 可以在跟踪调用的同时继续调用真实实现，也可以提供包含所需行为的工厂函数。

## 类 Mock 会保留原型方法

此前，通过类 mock 创建的实例会继承 mock 自身的空 `prototype`。使用常规 class 语法定义的方法在实例上会是 `undefined`，即使是在构造函数内部也是如此；针对实现类的 `instanceof` 检查也会失败。这会影响 [`vi.fn(Dog)`](/api/vi#vi-fn)、带或不带 mock 实现的 `vi.spyOn(obj, 'Dog')`，以及 [`.mockImplementation(class ...)`](/api/mock#mockimplementation)。

现在，mock 的 `prototype` 会链接到实现类的原型，因此实例的行为与实现类的实例一致：

```ts
class Dog {
  speak() {
    return 'bark!'
  }
}

const MockedDog = vi.fn(Dog)
const dog = new MockedDog()

typeof dog.speak // was 'undefined', now 'function'
dog instanceof Dog // was false, now true
dog instanceof MockedDog // true, as before

// the chain is visible on the mock itself
Object.getPrototypeOf(MockedDog.prototype) // was Object.prototype, now Dog.prototype
```

仍然可以覆盖 mock `prototype` 上的方法，这些方法会遮蔽实现类中的对应方法；[`mockReset`](/api/mock#mockreset) 会连同实现一起恢复原型链。详情请参阅[模拟类](/guide/mocking/classes)。

## 基准测试 API 重写

基准测试 API 已重写。`bench` 不再是从 `vitest` 顶层导入的内容，而是一个[测试上下文 fixture](/guide/test-context#bench)，需要在普通的 `test()` 内访问。新 API 请参阅[基准测试指南](/guide/benchmarking)。

以下内容已移除，并在适用时提供替代方案：

- **模块作用域下的 `bench(name, fn)`**：改为从测试上下文中解构 `bench`。

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

- **`bench.skip`、`bench.only` 和 `bench.todo`** 已移除。请改为在外围的 `test()` 上使用常规的 `test.skip`、`test.only` 和 `test.todo`。
- **`benchmark.reporters` / `benchmark.outputFile`** 已移除。基准测试输出现在由默认报告器和 `json` 报告器提供；请通过顶层的 `test.reporters` 配置。
- **`benchmark.compare` 配置和 `--compare` CLI 标志** 已移除。将 [`writeResult`](/guide/benchmarking#storing-and-replaying-results) 作为单个基准测试的选项传入以保存结果，再通过 `bench.compare()` 中的 [`bench.from()`](/guide/benchmarking#bench-from) 读取。
- **`benchmark.outputJson` 配置和 `--outputJson` CLI 标志** 已移除。使用 `--reporter=json --outputFile=<path>` 捕获基准测试结果；JSON 报告器现在会在每个测试用例中包含 `benchmarks` 字段。
- **`Vitest` 实例的 `mode` 属性**现在始终为 `'test'`。不再使用之前的 `'benchmark'` 值；基准测试会在同一个 `Vitest` 实例的专用项目中运行。

## Vitest UI URL 需要身份验证

Vitest UI 现在要求通过 token 验证 HTML 页面和 API 访问权限。在浏览器完成身份验证前，访问 `/__vitest__/` 会显示错误。要进行身份验证，请像下面这样使用 Vitest 输出的 token 打开 URL。完成验证后，直接访问 `/__vitest__/` 即可正常使用。

```bash
vitest --ui
# UI started at http://localhost:51204/__vitest__/?token=...
```

## 假计时器和 `setSystemTime` 现在会模拟 `Temporal`

根据 [`@sinonjs/fake-timers` v15.4 更新](https://github.com/sinonjs/fake-timers/blob/main/CHANGELOG.md#1540--2026-05-05)，Vitest 现在会像模拟 `Date` 一样模拟 [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) API。只有当 `Temporal` 可通过原生实现或全局安装的 polyfill（例如 `import 'temporal-polyfill/global'`）存在于全局对象上时，此功能才会生效。

此前，即使启用了 [`vi.useFakeTimers()`](/api/vi#vi-usefaketimers)，`Temporal.Now` 仍会返回真实的当前时间。现在它会跟随模拟时钟：

```ts
vi.useFakeTimers({ now: 0 })

Temporal.Now.instant().epochMilliseconds // 0 (was the real time in v4)
```

[`vi.setSystemTime()`](/api/vi#vi-setsystemtime) 也是如此；此前不配合假计时器使用时，它只会模拟 `Date`：

```ts
vi.setSystemTime(0)
Temporal.Now.instant().epochMilliseconds // 0 (was the real time in v4)
```

`Temporal` 现在属于默认模拟的 API，因此受 [`fakeTimers.toFake`](/config/faketimers#faketimers-tofake) 和 [`fakeTimers.toNotFake`](/config/faketimers#faketimers-tonotfake) 控制。如需保留原生的 `Temporal`，请将它添加到 `toNotFake`：

```ts
vi.useFakeTimers({ toNotFake: ['Temporal'] })
```

## `toThrow("")` 匹配任意错误消息

[`toThrow`](/api/expect#tothrow)（及其别名 `toThrowError`）会将字符串参数视为错误消息的子字符串。在 Vitest 4 中，空字符串被特殊处理为 `/^$/` 模式，因此只匹配消息为空的错误。现在它与其他子字符串的行为一致，而空字符串包含于所有消息中：

```ts
expect(() => { throw new Error('boom') }).not.toThrow('') // [!code --]
expect(() => { throw new Error('boom') }).toThrow('') // [!code ++]
```

要断言抛出的错误消息为空，请显式匹配该模式：

```ts
expect(() => { throw new Error('boom') }).not.toThrow(/^$/)
```

## 断言类型会公开返回类型和接收值类型

断言接口现在使用两个类型参数：`R` 是匹配器的返回类型，`T` 是接收值的类型。同步断言使用 `void`，而通过 `.resolves`、`.rejects`、[`expect.poll`](/api/expect#poll) 或 [`expect.element`](/api/browser/assertions) 访问的断言使用 `Promise<void>`。

如果你声明了自定义匹配器，请像[扩展匹配器](/guide/extending-matchers)中那样扩展 `Matchers<R, T>` 接口。这样会将匹配器添加到实例断言、非对称匹配器和 `expect.extend` 接受的类型中。匹配器返回类型会反映其使用方式：同步调用时为 `void`，通过 `.resolves` 或 `.rejects` 调用时为 `Promise<void>`。

直接引用断言类型的代码也必须先提供返回类型：

```ts
Assertion<string> // [!code --]
Assertion<void, string> // [!code ++]
Assertion<Promise<void>, string> // asynchronous assertion
```

Vitest 不再从全局 `jest.Matchers` 接口读取自定义匹配器声明。若库同时支持 Jest 和 Vitest，应分别扩展 `jest.Matchers` 与 `vitest.Matchers`。这只影响 TypeScript 声明；使用 `expect.extend` 注册匹配器的方式不变。

## `expect.poll` 超时后会失败

如果 [`expect.poll`](/api/expect#poll) 的回调或轮询中的断言未能在 `timeout` 内完成，现在会以 reject 结束。此前，即使回调在截止时间后才解析，或断言只在较晚的一次尝试中通过，仍可能成功。现在回调还会收到一个 `AbortSignal`，并在超时时触发，以便取消正在进行的工作：

```ts
await expect.poll(async ({ signal }) => {
  const response = await fetch('/api/status', { signal })
  return response.status
}, { timeout: 1000 }).toBe(200)
```

如果轮询确实需要更多时间，应增大其 `timeout`。否则会以 `expect.poll() function didn't resolve in time.`（或 `expect.poll() assertion didn't resolve in time.`）错误失败。

## 未 await 的异步断言会导致测试失败

如果没有对异步断言执行 await，现在测试会失败。这类断言包括 `resolves`、`rejects` 和 `toMatchFileSnapshot`。此前 Vitest 会在测试结束时自动等待它们，并打印警告：

```ts
test('unawaited assertion', async () => {
  // v4: prints a warning, the test passes // [!code --]
  // v5: the test fails // [!code ++]
  expect(promise).resolves.toBe(1) // [!code --]
  await expect(promise).resolves.toBe(1) // [!code ++]
})
```

错误会指出未执行 await 的断言位置。

## 测试标题和检查值使用 `pretty-format`

Vitest 现在使用 [`pretty-format`](https://www.npmjs.com/package/pretty-format) 而不是 `loupe` 来格式化检查值，包括插入 [`test.each`](/api/test#test-each) 和 [`test.for`](/api/test#test-for) 标题中的值。部分值的呈现方式会改变，因此捕获检查结果的快照或断言可能需要更新。

测试标题生成方式有两项变化：

- 通过 `$` 占位符插入的字符串值不再带引号：

```ts
test.for([{ id: 'a1' }])('case $id', ({ id }) => { /* ... */ })
// v4 title: case 'a1' // [!code --]
// v5 title: case a1   // [!code ++]
```

- 插入值的长度限制现在由新的 [`taskTitleValueFormatTruncate`](/config/tasktitlevalueformattruncate) 选项控制（默认值为 `40`）。

## 移除了 `test.sequential`、`describe.sequential` 和 `sequential` 选项

Vitest 5.0 移除了已弃用的 `test.sequential`、`describe.sequential` 和 `sequential` 测试选项。如果需要让测试或套件退出继承或全局配置的并发模式，请使用 `concurrent: false`。

```ts
test.sequential('example', async () => { /* ... */ }) // [!code --]
test('example', { concurrent: false }, async () => { /* ... */ }) // [!code ++]
```

```ts
describe.sequential('suite', () => { /* ... */ }) // [!code --]
describe('suite', { concurrent: false }, () => { /* ... */ }) // [!code ++]
```

选项对象也需要进行相同的替换：

```ts
test('example', { sequential: true }, async () => { /* ... */ }) // [!code --]
test('example', { concurrent: false }, async () => { /* ... */ }) // [!code ++]
```

## 命令中的定位器会序列化为对象

传递给[浏览器命令](/api/browser/commands)的定位器现在会序列化为 `SerializedLocator` 对象，而不是单独的选择器字符串。该对象公开两个字段：

- `selector`：提供者专属的选择器字符串（与命令之前收到的值相同）。
- `locator`：定位器的可读表示形式（例如 `getByRole('button')`），用于错误消息和追踪。

如果自定义命令接收定位器，请更新代码，从新对象中解构 `selector`：

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

## 定位器默认使用严格匹配

浏览器定位器现在默认精确匹配文本，要求完整且区分大小写的匹配。如需保留之前的行为，可以将 [`browser.locators.exact`](/config/browser/locators#browser-locators-exact) 设为 `false`。

```ts
// With exact: true (default), this only matches the string "Hello, World" exactly.
// With exact: false, this matches "Hello, World!", "Say Hello, World", etc.
const locator = page.getByText('Hello, World', { exact: true })
await locator.click()
```

## `toHaveTextContent` 现在使用严格相等匹配

浏览器模式中的 [`toHaveTextContent`](/api/browser/assertions#tohavetextcontent) 匹配器现在会验证元素文本内容是否与预期字符串完全相等，而不是执行区分大小写的部分匹配。它不再接受正则表达式。此前的行为（包括 `RegExp` 支持）已移至新的 [`toMatchTextContent`](/api/browser/assertions#tomatchtextcontent) 匹配器。

```ts
// Partial or regex matches:
await expect.element(banner).toHaveTextContent('Error') // [!code --]
await expect.element(banner).toHaveTextContent(/error/i) // [!code --]
await expect.element(banner).toMatchTextContent('Error') // [!code ++]
await expect.element(banner).toMatchTextContent(/error/i) // [!code ++]

// Exact matches stay on `toHaveTextContent`:
await expect.element(banner).toHaveTextContent('Error!')
```

## `vitest-browser-vue` 和 `vitest-browser-svelte` 中的 `render` 是异步的

配套的组件测试包 [`vitest-browser-vue`](https://npmx.dev/package/vitest-browser-vue) 和 [`vitest-browser-svelte`](https://npmx.dev/package/vitest-browser-svelte) 现在会让 `render` 返回 promise，因此查询渲染结果之前必须等待该调用完成：

```ts
import { render } from 'vitest-browser-vue'
import Component from './Component.vue'

test('renders', async () => {
  const screen = render(Component) // [!code --]
  const screen = await render(Component) // [!code ++]

  await expect.element(screen.getByRole('heading')).toBeVisible()
})
```

## glob 覆盖率阈值不再继承 `perFile`

此前，[`coverage.thresholds.perFile`](/config/coverage#coverage-thresholds-perfile) 会应用到所有阈值设置，包括由 glob 模式阈值匹配的文件。现在 glob 模式会自行控制逐文件检查，不再继承顶层 `perFile`。需要逐文件检查时，请在对应的每个 glob 中设置 `perFile`。

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

## 覆盖率 `include` 和 `exclude` 匹配更精确

[`coverage.include`](/config/coverage#coverage-include) 和 [`coverage.exclude`](/config/coverage#coverage-exclude) 之前会使用 picomatch 的 `contains` 选项匹配绝对路径，因此匹配到的文件远多于预期。现在模式会在不使用 `contains` 的情况下，针对每个相对于项目根目录的文件路径进行匹配；不含 glob 通配符的模式会被视为目录，并匹配其中的所有内容：

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    coverage: {
      include: ['src'], // matches src/**, not every path that contains "src"
    },
  },
})
```

升级后请检查 `include` 和 `exclude` 模式，确认报告的文件集合符合预期。之前仅因匹配规则较宽松而被匹配的文件，现在可能不会再包含在内。

## 不再从父目录查找配置文件

Vitest 不再从父目录搜索配置文件。如果你之前依赖在子目录中运行 `vitest`、同时使用父目录中的配置文件，请显式传入配置文件，并通过 `--dir` 限定测试发现范围。例如：

```bash
$ cd subdir && vitest # [!code --]
$ cd subdir && vitest --config ../vitest.config.ts # [!code ++]
```

## DOM 环境中的全局赋值现在会更新底层 window

在 `jsdom` 和 `happy-dom` 环境中，对 `globalThis` 或 `window` 属性的赋值现在会传递到底层 DOM 实现。`innerWidth` 等可变属性可能会影响由 DOM 环境实现的 API，例如 `happy-dom` 的 `matchMedia`。

## `populateGlobal` 在 `originals` 中返回属性描述符

[`populateGlobal`](/guide/environment#custom-environment) 返回的 `originals` map 现在保存[属性描述符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor)，而非普通值。这样在捕获原始值时不会调用原生的惰性 getter（例如 Node 的 `localStorage`），并且能在 teardown 时准确恢复它们。

如果你在自定义环境中手动恢复它们，请使用 `Object.defineProperty`，而不是赋值：

```ts
originals.forEach((value, key) => (global[key] = value)) // [!code --]
originals.forEach((descriptor, key) => Object.defineProperty(global, key, descriptor)) // [!code ++]
```

## 浏览器编排器 URL 需要 session

Vitest 不再通过不带参数的 `/__vitest_test__/` URL 提供浏览器编排器 UI。浏览器运行器 URL 现在与 session 绑定，必须包含 Vitest 生成的 `sessionId`，例如 `/__vitest_test__/?sessionId=...`。

如果你之前通过复制 Vite 服务器 URL 或直接访问 `/__vitest_test__/` 手动打开浏览器预览，请改用 Vitest 打开或输出的 URL。

## `browser.api` 已被顶层 `api` 替代

浏览器模式现在运行在单个 Vite 服务器上，并由顶层 [`api`](/config/api) 选项配置；浏览器模式的默认端口仍为 `63315`。`browser.api` 选项已弃用且不再生效，请将其值移至 `api`：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    api: { port: 4444 }, // [!code ++]
    browser: {
      enabled: true,
      api: { port: 4444 }, // [!code --]
    },
  },
})
```

此前已弃用的 `browser.isolate` 选项现在也会在启动时打印警告；其值仍会应用到用于替代它的顶层 [`isolate`](/config/isolate) 选项。

## 生成的报告和产物使用 `.vitest` 目录

Vitest 现在使用项目根目录下的 `.vitest` 作为共享产物根目录，因此只需在 `.gitignore` 中添加一条 `.vitest`。本次大版本调整了以下默认路径：

- **附件** ([`attachmentsDir`](/config/attachmentsdir))：`.vitest-attachements/` → `.vitest/attachments/`
- **失败截图** ([`screenshotFailures`](/config/browser/screenshotfailures))：`__screenshots__/` → `.vitest/attachments/failure-screenshots/`，不再与 `toMatchScreenshot` 的参考截图混在一起
- **Blob 报告器**和 `--merge-reports`：`.vitest-reports/blob-*.json` → `.vitest/blob/blob-*.json`
- **HTML 报告器** ([`html`](/guide/reporters#html-reporter))：`html/index.html` → `.vitest/index.html`，其选项也从表示文件的 `outputFile` 改为表示目录的 `outputDir`
- **JSON 报告器** ([`json`](/guide/reporters#json-reporter))：stdout → `.vitest/json/output.json`
- **JUnit 报告器** ([`junit`](/guide/reporters#junit-reporter))：stdout → `.vitest/junit/output.xml`

`json` 和 `junit` 报告器现在默认写入文件，而不是打印到 stdout。如果你之前通过管道处理报告（例如 `vitest --reporter=json | jq`），请改为读取产物文件；也可以通过报告器的 [`stdout` 选项](/guide/reporters#reporter-output)恢复输出到 stdout（`reporters: [['json', { stdout: true }]]`）。显式设置的 `outputFile` 仍会保留且不变。

## `toMatchScreenshot` 现在使用专用的截图目录配置

此前，`toMatchScreenshot` 的参考截图不会正确遵循 [`browser.screenshotDirectory`](/config/browser/screenshotdirectory)。因此，配置自定义目录时，截图会保存到非预期的位置。

现在引入了专用选项以修复此问题：[`browser.expect.toMatchScreenshot.screenshotDirectory`](/config/browser/expect#browser-expect-tomatchscreenshot-screenshotdirectory)。其默认值为 `__screenshots__`。

- 如果你没有设置 `browser.screenshotDirectory`，则无需更改。
- 如果设置了 `browser.screenshotDirectory`，现在必须显式配置新选项：

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

  然后将现有参考截图移动到新位置，或重新生成它们。

## Worker 和并发 ID 从 1 开始

Worker 和池标识符现在从 `1` 而不是 `0` 开始。`VITEST_POOL_ID` 和 `VITEST_WORKER_ID` 环境变量的值也随之变化，现在范围为 `1` 到 worker 数量。请更新任何根据这些 ID 计算值的逻辑，例如每个 worker 使用的数据库名称或数组索引。

对于自定义报告器，[`TestModule`](/api/advanced/test-module#diagnostic) 的诊断信息现在会公开这两个 ID：现有的 `workerId`（现在从 1 开始）和新的 `concurrencyId`。

```ts
import type { Reporter, TestModule } from 'vitest/node'

class MyReporter implements Reporter {
  onTestModuleEnd(testModule: TestModule) {
    const { workerId, concurrencyId } = testModule.diagnostic()
  }
}
```

Node.js 和浏览器测试运行在不同的池中，不会共享这些 ID，因此两边可能出现相同的值。

## `resolveConfig` 返回解析后的 Vite 配置

`vitest/node` 中的 [`resolveConfig`](/guide/advanced/#resolveconfig) 辅助函数不再返回 `{ vitestConfig, viteConfig }` 对。它会在不创建 Vite 服务器的情况下解析配置并返回解析后的 Vite 配置；完整解析后的 Vitest 配置可通过其 `test` 属性获取：

```ts
import { resolveConfig } from 'vitest/node'

const { viteConfig, vitestConfig } = await resolveConfig(options) // [!code --]
const viteConfig = await resolveConfig(options) // [!code ++]
const vitestConfig = viteConfig.test // [!code ++]
```

Vitest 4 中的限制已解除：返回的配置现在包含完整解析后的 `projects`，并且 `viteConfig.test` 不再包含仅部分解析的选项。

## 包迁移

以下包从此版本起弃用。它们将不再接收功能更新，但仍会回移安全修复：

- [`@vitest/runner`](https://npmx.dev/package/@vitest/runner)
- [`@vitest/ws-client`](https://npmx.dev/package/@vitest/ws-client)

`vitest` 也不再依赖 [`@vitest/expect`](https://npmx.dev/package/@vitest/expect)：断言代码现已打包进 `vitest` 本身。该包仍会发布且可独立使用，但不再与 Vitest 的 `expect` 共享状态。请改为通过 `vitest` 入口（`expect`、`expect.extend`、`chai`）使用 Vitest 断言。

[`@vitest/browser-webdriverio`](https://npmx.dev/package/@vitest/browser-webdriverio) 提供者已迁移至 [vitest-community](https://github.com/vitest-community/vitest-webdriverio) 组织。今后 WebdriverIO 支持将由社区维护，并按具体问题逐一处理。如果你正在使用它，请将依赖更新为新包，并在新的代码仓库中报告问题。

## 移除已弃用的入口

Vitest 4.1 中有多个入口被标记为弃用，本版本将其完全移除。

- `vitest/coverage`：请改用 `vitest/node`
- `vitest/reporters`：请改用 `vitest/node`
- `vitest/environments`：请改用 `vitest/runtime`
- `vitest/snapshot`：请改用 `vitest/runtime`
- `vitest/runners`：请改为从 `vitest` 使用 `TestRunner`
- `vitest/suite`：请改为使用 `vitest` 中 `TestRunner` 的静态方法（例如 `TestRunner.getCurrentTest()`）
- `vitest/mocker` 已完全移除，请直接使用 `@vitest/mocker` 包（该包曾被意外发布，之后一直未被移除）
- `vitest/internal/module-runner` 已移除
