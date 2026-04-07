---
title: 迁移指南 | 指南
outline: deep
---

# 迁移指南

[迁移到 Vitest 3.0](https://v3.vitest.dev/guide/migration) | [迁移到 Vitest 2.0](https://v2.vitest.dev/guide/migration)

## 迁移到 Vitest 4.0 {#vitest-4}

::: warning 前提条件
Vitest 4.0 需要 **Vite >= 6.0.0** 和 **Node.js >= 20.0.0**。在进行
任何其他迁移步骤之前，请确保你的环境满足这些要求。
在旧版本的 Vite 或 Node.js 上运行 Vitest 4.0 不受支持，并且可能
导致意外错误。
:::

### V8 代码覆盖率重大变更

Vitest 的 V8 代码覆盖率提供者现在使用更准确的覆盖率结果重映射逻辑。
预计用户在从 Vitest v3 更新时会看到覆盖率报告的变化。

过去 Vitest 使用 [`v8-to-istanbul`](https://github.com/istanbuljs/v8-to-istanbul) 将 V8 覆盖率结果重映射到你的源文件中。
这种方法不太准确，并在覆盖率报告中提供了大量误报。
我们现在开发了一个新包，利用基于 AST 的分析来进行 V8 覆盖率分析。
这使得 V8 报告与 `@vitest/coverage-istanbul` 报告一样准确。

- 覆盖率忽略提示已更新。参见 [覆盖率 | 忽略代码](/guide/coverage.html#ignoring-code)。
- `coverage.ignoreEmptyLines` 已被移除。没有运行时代码的行不再包含在报告中。
- `coverage.experimentalAstAwareRemapping` 已被移除。此选项现在默认启用，并且是唯一支持的重映射方法。
- `coverage.ignoreClassMethods` 现在也受 V8 提供者支持。

### 移除选项 `coverage.all` 和 `coverage.extensions`

在以前的版本中，Vitest 默认在覆盖率报告中包含所有未覆盖的文件。
这是由于 `coverage.all` 默认为 `true`，且 `coverage.include` 默认为 `**`。
选择这些默认值是有充分理由的——测试工具不可能猜测用户将源文件存储在哪里。

这导致 Vitest 的覆盖率提供者处理了意外文件，如混淆后的 Javascript，导致覆盖率报告生成缓慢/卡住。
在 Vitest v4 中，我们完全移除了 `coverage.all` 并 <ins>**默认仅在报告中包含已覆盖的文件**</ins>。

升级到 v4 时，建议在配置中定义 `coverage.include`，然后在需要时开始应用简单的 `coverage.exclude` 模式。

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    coverage: {
      // 包含匹配此模式的已覆盖和未覆盖文件：
      include: ['packages/**/src/**.{js,jsx,ts,tsx}'], // [!code ++]

      // 排除适用于匹配上述包含模式的文件
      // 无需定义根级别的 *.config.ts 文件或 node_modules，因为我们没有在 include 中添加这些
      exclude: ['**/some-pattern/**'], // [!code ++]

      // 这些选项现在已移除
      all: true, // [!code --]
      extensions: ['js', 'ts'], // [!code --]
    }
  }
})
```

如果未定义 `coverage.include`，覆盖率报告将仅包含测试运行期间加载的文件：
```ts [vitest.config.ts]
export default defineConfig({
  test: {
    coverage: {
      // 未设置 Include，仅包含测试运行期间加载的文件
      include: undefined, // [!code ++]

      // 匹配此模式的加载文件将被排除：
      exclude: ['**/some-pattern/**'], // [!code ++]
    }
  }
})
```

另参见新指南：
- [在覆盖率报告中包含和排除文件](/guide/coverage.html#including-and-excluding-files-from-coverage-report) 获取示例
- [分析测试性能 | 代码覆盖率](/guide/profiling-test-performance.html#code-coverage) 获取关于调试覆盖率生成的提示

### 简化的 `exclude`

默认情况下，Vitest 现在仅排除 `node_modules` 和 `.git` 文件夹中的测试。这意味着 Vitest 不再排除：

- `dist` 和 `cypress` 文件夹
- `.idea`、`.cache`、`.output`、`.temp` 文件夹
- 配置文件，如 `rollup.config.js`、`prettier.config.js`、`ava.config.js` 等

如果你需要限制测试文件所在的目录，请使用 [`test.dir`](/config/dir) 选项，因为它比排除文件性能更高：

```ts
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    dir: './frontend/tests', // [!code ++]
  },
})
```

要恢复之前的行为，请手动指定旧的 `excludes`：

```ts
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      '**/dist/**', // [!code ++]
      '**/cypress/**', // [!code ++]
      '**/.{idea,git,cache,output,temp}/**', // [!code ++]
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*' // [!code ++]
    ],
  },
})
```

### `spyOn` 和 `fn` 支持构造函数

以前，如果你尝试使用 `vi.spyOn` 监视构造函数，你会收到类似 `Constructor <name> requires 'new'` 的错误。自 Vitest 4 以来，所有使用 `new` 关键字调用的模拟都会构造实例而不是调用 `mock.apply`。这意味着在这些情况下，模拟实现必须使用 `function` 或 `class` 关键字：

```ts {12-14,16-20}
const cart = {
  Apples: class Apples {
    getApples() {
      return 42
    }
  }
}

const Spy = vi.spyOn(cart, 'Apples')
  .mockImplementation(() => ({ getApples: () => 0 })) // [!code --]
  // 使用 function 关键字
  .mockImplementation(function () {
    this.getApples = () => 0
  })
  // 使用自定义类
  .mockImplementation(class MockApples {
    getApples() {
      return 0
    }
  })

const mock = new Spy()
```

请注意，现在如果你提供箭头函数，当模拟被调用时，你会收到 [`<anonymous> is not a constructor` 错误](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_constructor)。

### 模拟的变更

除了支持构造函数等新功能外，Vitest 4 以不同方式创建模拟，以解决几年来我们收到的几个模块模拟问题。此版本试图使模块 spy 不那么令人困惑，尤其是在使用类时。

- `vi.fn().getMockName()` 现在默认返回 `vi.fn()` 而不是 `spy`。这可能会影响带有模拟的快照 - 名称将从 `[MockFunction spy]` 更改为 `[MockFunction]`。使用 `vi.spyOn` 创建的 spy 默认将继续使用原始名称以获得更好的调试体验
- `vi.restoreAllMocks` 不再重置 spy 的状态，仅恢复使用 `vi.spyOn` 手动创建的 spy，自动模拟不再受此函数影响（这也影响配置选项 [`restoreMocks`](/config/restoremocks)）。请注意，`.mockRestore` 仍将重置模拟实现并清除状态
- 在模拟上调用 `vi.spyOn` 现在返回相同的模拟
- `mock.settledResults` 现在在函数调用时立即填充，带有 `'incomplete'` 结果。当 promise 完成时，类型会根据结果更改。
- 自动模拟的实例方法现在已正确隔离，但与原型共享状态。覆盖原型实现将始终影响实例方法，除非方法有自己的自定义模拟实现。在模拟上调用 `.mockReset` 也不再破坏该继承。
```ts
import { AutoMockedClass } from './example.js'
const instance1 = new AutoMockedClass()
const instance2 = new AutoMockedClass()

instance1.method.mockReturnValue(42)

expect(instance1.method()).toBe(42)
expect(instance2.method()).toBe(undefined)

expect(AutoMockedClass.prototype.method).toHaveBeenCalledTimes(2)

instance1.method.mockReset()
AutoMockedClass.prototype.method.mockReturnValue(100)

expect(instance1.method()).toBe(100)
expect(instance2.method()).toBe(100)

expect(AutoMockedClass.prototype.method).toHaveBeenCalledTimes(4)
```
- 自动模拟的方法不再能被恢复，即使手动使用 `.mockRestore`。带有 `spy: true` 的自动模拟模块将继续像以前一样工作
- 自动模拟的 getter 不再调用原始 getter。默认情况下，自动模拟的 getter 现在返回 `undefined`。你可以继续使用 `vi.spyOn(object, name, 'get')` 来监视 getter 并更改其实现
- 模拟 `vi.fn(implementation).mockReset()` 现在正确返回 `.getMockImplementation()` 中的模拟实现
- `vi.fn().mock.invocationCallOrder` 现在从 `1` 开始，像 Jest 一样，而不是 `0`

### 带文件名过滤器的独立模式

为了改善用户体验，当 [`--standalone`](/guide/cli#standalone) 与文件名过滤器一起使用时，Vitest 现在将开始运行匹配的文件。

```sh
# 在 Vitest v3 及以下版本中，此命令将忽略 "math.test.ts" 文件名过滤器。
# 在 Vitest v4 中，math.test.ts 将自动运行。
$ vitest --standalone math.test.ts
```

这允许用户为独立模式创建可复用的 `package.json` 脚本。

::: code-group
```json [package.json]
{
  "scripts": {
    "test:dev": "vitest --standalone"
  }
}
```
```bash [CLI]
# 以独立模式启动 Vitest，启动时不运行任何文件
$ pnpm run test:dev

# 立即运行 math.test.ts
$ pnpm run test:dev math.test.ts
```
:::

### 用 [Module Runner](https://vite.dev/guide/api-environment-runtimes.html#modulerunner) 替换 `vite-node`

Module Runner 是直接在 Vite 中实现的 `vite-node` 继任者。Vitest 现在直接使用它，而不是围绕 Vite SSR 处理器使用包装器。这意味着某些功能不再可用：

- `VITE_NODE_DEPS_MODULE_DIRECTORIES` 环境变量已被替换为 `VITEST_MODULE_DIRECTORIES`
- Vitest 不再将 `__vitest_executor` 注入到每个 [测试运行器](/api/advanced/runner) 中。相反，它注入 `moduleRunner`，它是 [`ModuleRunner`](https://vite.dev/guide/api-environment-runtimes.html#modulerunner) 的实例
- `vitest/execute` 入口点已被移除。它一直意为内部使用
- [自定义环境](/guide/environment) 不再需要提供 `transformMode` 属性。相反，提供 `viteEnvironment`。如果未提供，Vitest 将使用环境名称在服务器上转换文件（参见 [`server.environments`](https://vite.dev/guide/api-environment-instances.html)）
- `vite-node` 不再是 Vitest 的依赖
- `deps.optimizer.web` 已重命名为 [`deps.optimizer.client`](/config/deps#deps-client)。当使用其他服务器环境时，你也可以使用任何自定义名称来应用优化器配置

Vite 有其自己的外部化机制，但我们决定继续使用旧机制以减少破坏性变更的数量。你可以继续使用 [`server.deps`](/config/server#deps) 来内联或外部化包。

除非你依赖上述高级功能，否则此更新不应被注意到。

### `workspace` 被 `projects` 替换

`workspace` 配置选项在 Vitest 3.2 中重命名为 [`projects`](/guide/projects)。它们功能相同，除了你不能指定另一个文件作为工作区的来源（以前你可以指定一个导出项目数组的文件）。迁移到 `projects` 很容易，只需将代码从 `vitest.workspace.js` 移动到 `vitest.config.ts`：

::: code-group
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: './vitest.workspace.js', // [!code --]
    projects: [ // [!code ++]
      './packages/*', // [!code ++]
      { // [!code ++]
        test: { // [!code ++]
          name: 'unit', // [!code ++]
        }, // [!code ++]
      }, // [!code ++]
    ] // [!code ++]
  }
})
```
```ts [vitest.workspace.js]
import { defineWorkspace } from 'vitest/config' // [!code --]

export default defineWorkspace([ // [!code --]
  './packages/*', // [!code --]
  { // [!code --]
    test: { // [!code --]
      name: 'unit', // [!code --]
    }, // [!code --]
  } // [!code --]
]) // [!code --]
```
:::

### Browser Provider 重构

在 Vitest 4.0 中，browser provider 现在接受对象而不是字符串（`'playwright'`、`'webdriverio'`）。`preview` 不再是默认值。这使得使用自定义选项更简单，并且不再需要添加 `/// <reference` 注释。

```ts
import { playwright } from '@vitest/browser-playwright' // [!code ++]

export default defineConfig({
  test: {
    browser: {
      provider: 'playwright', // [!code --]
      provider: playwright({ // [!code ++]
        launchOptions: { // [!code ++]
          slowMo: 100, // [!code ++]
        }, // [!code ++]
      }), // [!code ++]
      instances: [
        {
          browser: 'chromium',
          launch: { // [!code --]
            slowMo: 100, // [!code --]
          }, // [!code --]
        },
      ],
    },
  },
})
```

`playwright` 工厂中的属性命名现在也与 [Playwright 文档](https://playwright.dev/docs/api/class-testoptions#test-options-launch-options) 保持一致，使其更容易查找。

随着此更改，不再需要 `@vitest/browser` 包，你可以从依赖中移除它。为了支持 context 导入，你应该将 `@vitest/browser/context` 更新为 `vitest/browser`：

```ts
import { page } from '@vitest/browser/context' // [!code --]
import { page } from 'vitest/browser' // [!code ++]

test('example', async () => {
  await page.getByRole('button').click()
})
```

模块是相同的，所以进行简单的“查找和替换”就足够了。

如果你之前使用 `@vitest/browser/utils` 模块，你现在也可以从 `vitest/browser` 导入这些工具函数：

```ts
import { getElementError } from '@vitest/browser/utils' // [!code --]
import { utils } from 'vitest/browser' // [!code ++]
const { getElementError } = utils // [!code ++]
```

::: warning
`@vitest/browser/context` 和 `@vitest/browser/utils` 在过渡期间在运行时都有效，但它们将在未来的版本中被移除。
:::

### Pool 重构

Vitest 一直使用 [`tinypool`](https://github.com/tinylibs/tinypool) 来协调测试文件在测试运行器 worker 中的运行方式。Tinypool 内部控制了并行、隔离和 IPC 通信等复杂任务的工作方式。然而我们发现 Tinypool 有一些缺陷阻碍了 Vitest 的开发。在 Vitest v4 中，我们完全移除了 Tinypool 并在没有新依赖的情况下重写了 pool 的工作方式。阅读更多关于理由的信息 [feat!: rewrite pools without tinypool #8705](https://github.com/vitest-dev/vitest/pull/8705)。

新的 pool 架构允许 Vitest 简化许多以前复杂的配置选项：

- `maxThreads` 和 `maxForks` 现在是 `maxWorkers`。
- 环境变量 `VITEST_MAX_THREADS` 和 `VITEST_MAX_FORKS` 现在是 `VITEST_MAX_WORKERS`。
- `singleThread` 和 `singleFork` 现在是 `maxWorkers: 1, isolate: false`。如果你的测试依赖测试之间的模块重置，你需要添加一个在 [`beforeAll` 测试钩子](/api/hooks#beforeall) 中调用 [`vi.resetModules()`](/api/vi.html#vi-resetmodules) 的 [setupFile](/config/setupfiles)。
- `poolOptions` 已移除。所有以前的 `poolOptions` 现在是顶层选项。VM pool 的 `memoryLimit` 重命名为 `vmMemoryLimit`。
- `threads.useAtomics` 已移除。如果你有这方面的用例，请随时提出新的功能请求。
- 自定义 pool 接口已重写，参见 [自定义 Pool](/guide/advanced/pool#custom-pool)

```ts
export default defineConfig({
  test: {
    poolOptions: { // [!code --]
      forks: { // [!code --]
        execArgv: ['--expose-gc'], // [!code --]
        isolate: false, // [!code --]
        singleFork: true, // [!code --]
      }, // [!code --]
      vmThreads: { // [!code --]
        memoryLimit: '300Mb' // [!code --]
      }, // [!code --]
    }, // [!code --]
    execArgv: ['--expose-gc'], // [!code ++]
    isolate: false, // [!code ++]
    maxWorkers: 1, // [!code ++]
    vmMemoryLimit: '300Mb', // [!code ++]
  }
})
```

以前在使用 [Vitest Projects](/guide/projects) 时，无法为每个项目指定一些池相关选项。使用新架构，这不再是障碍。

::: code-group
```ts [每个项目的隔离]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        // 非隔离的单元测试
        name: 'Unit tests',
        isolate: false,
        exclude: ['**.integration.test.ts'],
      },
      {
        // 隔离的集成测试
        name: 'Integration tests',
        include: ['**.integration.test.ts'],
      },
    ],
  },
})
```
```ts [并行和串行项目]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        name: 'Parallel',
        exclude: ['**.sequential.test.ts'],
      },
      {
        name: 'Sequential',
        include: ['**.sequential.test.ts'],
        fileParallelism: false,
      },
    ],
  },
})
```
```ts [每个项目的 Node CLI 选项]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        name: 'Production env',
        execArgv: ['--env-file=.env.prod']
      },
      {
        name: 'Staging env',
        execArgv: ['--env-file=.env.staging']
      },
    ],
  },
})
```
:::

参见 [食谱](/guide/recipes) 获取更多示例。

### 报告器更新

报告器 API `onCollected`、`onSpecsCollected`、`onPathsCollected`、`onTaskUpdate` 和 `onFinished` 已被移除。参见 [`报告器 API`](/api/advanced/reporters) 获取新替代方案。新 API 在 Vitest `v3.0.0` 中引入。

`basic` 报告器已被移除，因为它等同于：

```ts
export default defineConfig({
  test: {
    reporters: [
      ['default', { summary: false }]
    ]
  }
})
```

[`verbose`](/guide/reporters#verbose-reporter) 报告器现在将测试用例打印为扁平列表。要恢复之前的行为，使用 `--reporter=tree`：

```ts
export default defineConfig({
  test: {
    reporters: ['verbose'], // [!code --]
    reporters: ['tree'], // [!code ++]
  }
})
```

### 使用自定义元素的快照会打印阴影根

在 Vitest 4.0 中，包含自定义元素的快照将打印阴影根内容。要恢复之前的行为，将 [`printShadowRoot` 选项](/config/snapshotformat) 设置为 `false`。

```js{15-22}
// Vitest 4.0 之前
exports[`custom element with shadow root 1`] = `
"<body>
  <div>
    <custom-element />
  </div>
</body>"
`

// Vitest 4.0 之后
exports[`custom element with shadow root 1`] = `
"<body>
  <div>
    <custom-element>
      #shadow-root
        <span
          class="some-name"
          data-test-id="33"
          id="5"
        >
          hello
        </span>
    </custom-element>
  </div>
</body>"
`
```

### 已弃用的 API 被移除

Vitest 4.0 移除了一些已弃用的 API，包括：

- `poolMatchGlobs` 配置选项。改用 [`projects`](/guide/projects)。
- `environmentMatchGlobs` 配置选项。改用 [`projects`](/guide/projects)。
- `deps.external`、`deps.inline`、`deps.fallbackCJS` 配置选项。改用 `server.deps.external`、`server.deps.inline` 或 `server.deps.fallbackCJS`。
- `browser.testerScripts` 配置选项。改用 [`browser.testerHtmlPath`](/config/browser/testerhtmlpath)。
- `minWorkers` 配置选项。只有 `maxWorkers` 对测试运行方式有影响，所以我们移除了这个公共选项。
- Vitest 不再支持将测试选项对象作为第三个参数提供给 `test` 和 `describe`。改用第二个参数：

```ts
test('example', () => { /* ... */ }, { retry: 2 }) // [!code --]
test('example', { retry: 2 }, () => { /* ... */ }) // [!code ++]
```

请注意，仍然支持将超时数字作为最后一个参数提供：

```ts
test('example', () => { /* ... */ }, 1000) // ✅
```

此版本还移除了所有已弃用的类型。这最终修复了 Vitest 意外拉取 `@types/node` 的问题（参见 [#5481](https://github.com/vitest-dev/vitest/issues/5481) 和 [#6141](https://github.com/vitest-dev/vitest/issues/6141)）。

## 从 Jest 迁移 {#jest}

Vitest 的设计采用了与 Jest 兼容的 API，以使从 Jest 迁移尽可能简单。尽管做出了这些努力，您仍可能会遇到以下差异：

### 默认全局变量

Jest 默认启用了他们的 [globals API](https://jestjs.io/docs/api)。Vitest 没有。您可以通过 [`globals` 配置设置](/config/globals) 启用全局变量，或者更新代码以使用从 `vitest` 模块导入 instead。

如果您决定保持全局变量禁用，请注意像 [`testing-library`](https://testing-library.com/) 这样的常用库将不会运行自动 DOM [清理](https://testing-library.com/docs/svelte-testing-library/api/#cleanup)。

### `mock.mockReset`

Jest 的 [`mockReset`](https://jestjs.io/docs/mock-function-api#mockfnmockreset) 将 mock 实现替换为一个返回 `undefined` 的空函数。

Vitest 的 [`mockReset`](/api/mock#mockreset) 将 mock 实现重置为其原始状态。
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

Jest 默认这样做，当 Mock 一个模块并希望此 Mock 扩展到其他使用相同模块的外部库时，您应该明确告诉要 Mock 哪个第三方库，以便外部库成为源代码的一部分，通过使用 [server.deps.inline](/config/server#inline)。

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

如果您想修改对象，您在 Jest 中将使用 [replaceProperty API](https://jestjs.io/docs/jest-object#jestreplacepropertyobject-propertykey-value)，您可以在 Vitest 中使用 [`vi.stubEnv`](/api/vi#vi-stubenv) 或 [`vi.spyOn`](/api/vi#vi-spyon) 来做同样的事情。

### Done 回调

Vitest 不支持声明测试的回调风格。您可以重写它们以使用 `async`/`await` 函数，或使用 Promise 来模拟回调风格。

<!--@include: ./examples/promise-done.md-->

### 钩子

`beforeAll`/`beforeEach` 钩子在 Vitest 中可以返回 [清理函数](/api/hooks#beforeach)。因此，如果它们返回 `undefined` 或 `null` 以外的内容，您可能需要重写钩子声明：

```ts
beforeEach(() => setActivePinia(createTestingPinia())) // [!code --]
beforeEach(() => { setActivePinia(createTestingPinia()) }) // [!code ++]
```

在 Jest 中钩子是顺序调用的（一个接一个）。默认情况下，Vitest 以栈方式运行钩子。要使用 Jest 的行为，更新 [`sequence.hooks`](/config/sequence#sequence-hooks) 选项：

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

Vitest 不支持 Jest 的遗留计时器。

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

### 自定义快照匹配器 <Badge type="warning">实验性</Badge> <Version>4.1.3</Version>

Jest 从 `jest-snapshot` 导入快照组合器。在 Vitest 中，改用 `vitest` 中的 `Snapshots`：

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
