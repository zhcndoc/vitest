---
title: experimental | 配置
outline: deep
---

# experimental

## experimental.fsModuleCache <Version type="experimental">4.0.11</Version> {#experimental-fsmodulecache}

::: tip 反馈
请在 [GitHub 讨论](https://github.com/vitest-dev/vitest/discussions/9221) 中留下关于此功能的反馈。
:::

- **Type:** `boolean`
- **Default:** `false`

启用此选项允许 Vitest 将缓存模块保留在文件系统上，使测试在重运行之间运行得更快。

你可以通过运行 [`vitest --clearCache`](/guide/cli#clearcache) 来删除旧缓存。

::: warning 浏览器支持
目前，此选项不影响 [浏览器模式](/guide/browser/)。
:::

你可以通过带有 `DEBUG=vitest:cache:fs` 环境变量运行 vitest 来调试你的模块是否被缓存：

```shell
DEBUG=vitest:cache:fs vitest --experimental.fsModuleCache
```

### 已知问题

Vitest 基于文件内容、其 id、Vite 的环境配置和覆盖率状态创建持久文件哈希。Vitest 尝试使用尽可能多的配置信息，但它仍然不完整。目前，无法跟踪你的插件选项，因为没有标准接口。

如果你的插件依赖于文件内容或公共配置之外的事物（如读取另一个文件或文件夹），缓存可能会过时。为解决这个问题，你可以定义一个 [缓存键生成器](/api/advanced/plugin#definecachekeygenerator) 来指定动态选项或为该模块选择退出缓存：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    {
      name: 'vitest-cache',
      configureVitest({ experimental_defineCacheKeyGenerator }) {
        experimental_defineCacheKeyGenerator(({ id, sourceCode }) => {
          // 永不缓存此 id
          if (id.includes('do-not-cache')) {
            return false
          }

          // 根据动态变量的值缓存此文件
          if (sourceCode.includes('myDynamicVar')) {
            return process.env.DYNAMIC_VAR_VALUE
          }
        })
      }
    }
  ],
  test: {
    experimental: {
      fsModuleCache: true,
    },
  },
})
```

如果你是插件作者，如果你的插件可以使用影响转换结果的不同选项进行注册，请考虑在你的插件中定义一个 [缓存键生成器](/api/advanced/plugin#definecachekeygenerator)。

另一方面，如果你的插件不应影响缓存键，你可以通过将 `api.vitest.experimental.ignoreFsModuleCache` 设置为 `true` 来选择退出：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    {
      name: 'vitest-cache',
      api: {
        vitest: {
          experimental: {
            ignoreFsModuleCache: true,
          },
        },
      },
    },
  ],
  test: {
    experimental: {
      fsModuleCache: true,
    },
  },
})
```

注意，即使插件选择退出模块缓存，你仍然可以定义缓存键生成器。

## experimental.fsModuleCachePath <Version type="experimental">4.0.11</Version> {#experimental-fsmodulecachepath}

- **Type:** `string`
- **Default:** `'node_modules/.experimental-vitest-cache'`

文件系统缓存所在的目录。

默认情况下，Vitest 将尝试找到工作区根目录并将缓存存储在 `node_modules` 文件夹内。根目录基于你的包管理器的锁文件（例如，`.package-lock.json`、`.yarn-state.yml`、`.pnpm/lock.yaml` 等）。

目前，Vitest 完全忽略 [test.cache.dir](/config/cache) 或 [cacheDir](https://vite.dev/config/shared-options#cachedir) 选项，并创建一个单独的文件夹。

## experimental.openTelemetry <Version type="experimental">4.0.11</Version> {#experimental-opentelemetry}

::: tip 反馈
请在 [GitHub 讨论](https://github.com/vitest-dev/vitest/discussions/9222) 中留下关于此功能的反馈。
:::

- **Type:**

```ts
interface OpenTelemetryOptions {
  enabled: boolean
  /**
   * 指向暴露 Node.js OpenTelemetry SDK 的文件路径。
   */
  sdkPath?: string
  /**
   * 指向暴露浏览器 OpenTelemetry SDK 的文件路径。
   */
  browserSdkPath?: string
}
```

- **Default:** `{ enabled: false }`

此选项控制 [OpenTelemetry](https://opentelemetry.io/) 支持。如果 `enabled` 设置为 `true`，Vitest 会在主线程中以及每个测试文件之前导入 SDK 文件。

::: danger 性能顾虑
OpenTelemetry 可能会显著影响 Vitest 性能；仅在本机调试时启用它。
:::

你可以与 Vitest 一起使用 [自定义服务](/guide/open-telemetry) 来定位哪些测试或文件拖慢了你的测试套件。

对于浏览器模式，请参阅 OpenTelemetry 指南的 [浏览器模式](/guide/open-telemetry#browser-mode) 部分。

`sdkPath` 相对于项目的 [`root`](/config/root) 解析，并应指向一个将已启动的 SDK 实例作为默认导出暴露的模块。例如：

::: code-group
```js [otel.js]
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { NodeSDK } from '@opentelemetry/sdk-node'

const sdk = new NodeSDK({
  serviceName: 'vitest',
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
export default sdk
```
```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    experimental: {
      openTelemetry: {
        enabled: true,
        sdkPath: './otel.js',
      },
    },
  },
})
```
:::

::: warning
重要的是 Node 能够处理 `sdkPath` 内容，因为它不会被 Vitest 转换。请参阅 [指南](/guide/open-telemetry) 了解如何在 Vitest 内部使用 OpenTelemetry。
:::

## experimental.importDurations <Version type="experimental">4.1.0</Version> {#experimental-importdurations}

::: tip 反馈
请在 [GitHub 讨论](https://github.com/vitest-dev/vitest/discussions/9224) 中留下关于此功能的反馈。
:::

- **Type:**

```ts
interface ImportDurationsOptions {
  /**
   * 何时将导入细分打印到 CLI 终端。
   * - false：永不打印（默认）
   * - true：始终打印
   * - 'on-warn'：仅当任何导入超过警告阈值时打印
   */
  print?: boolean | 'on-warn'
  /**
   * 如果任何导入超过危险阈值，则失败测试运行。
   * 当启用且超过阈值时，始终打印细分。
   * @default false
   */
  failOnDanger?: boolean
  /**
   * 收集和显示的最大导入数。
   */
  limit?: number
  /**
   * 用于着色和警告的持续时间阈值（毫秒）。
   */
  thresholds?: {
    /** 黄色/警告颜色的阈值。@default 100 */
    warn?: number
    /** 红色/危险颜色和 failOnDanger 的阈值。@default 500 */
    danger?: number
  }
}
```

- **Default:** `{ print: false, failOnDanger: false, limit: 0, thresholds: { warn: 100, danger: 500 } }`（如果 `print` 或 UI 启用，`limit` 为 10）

配置导入持续时间收集和显示。

`print` 选项控制 CLI 终端输出。`limit` 选项控制收集和显示多少个导入。[Vitest UI](/guide/ui#import-breakdown) 始终可以切换细分显示，无论 `print` 设置如何。

- Self：导入模块所花费的时间，不包括静态导入；
- Total：导入模块所花费的时间，包括静态导入。注意，这不包括当前模块的 `transform` 时间。

<img alt="终端中导入细分的示例" src="/reporter-import-breakdown.png" img-dark />
<img alt="终端中导入细分的示例" src="/reporter-import-breakdown-light.png" img-light />

注意，如果文件路径太长，Vitest 将在开头截断它，直到符合 45 个字符的限制。

### experimental.importDurations.print {#experimental-importdurationsprint}

- **Type:** `boolean | 'on-warn'`
- **Default:** `false`

控制测试完成后何时将导入细分打印到 CLI 终端。这仅适用于 [`default`](/guide/reporters#default)、[`verbose`](/guide/reporters#verbose) 或 [`tree`](/guide/reporters#tree) 报告器。

- `false`：永不打印细分
- `true`：始终打印细分
- `'on-warn'`：仅当任何导入超过 `thresholds.warn` 值时打印

### experimental.importDurations.failOnDanger {#experimental-importdurationsfailondanger}

- **Type:** `boolean`
- **Default:** `false`

如果任何导入超过 `thresholds.danger` 值，则失败测试运行。当启用且超过阈值时，无论 `print` 设置如何，始终打印细分。

这对于在 CI 中强制实施导入性能预算很有用：

```bash
vitest --experimental.importDurations.failOnDanger
```

### experimental.importDurations.limit {#experimental-importdurationslimit}

- **Type:** `number`
- **Default:** `0`（如果 `print`、`failOnDanger` 或 UI 启用，则为 `10`）

在 CLI 输出、[Vitest UI](/guide/ui#import-breakdown) 和第三方报告器中收集和显示的最大导入数。

### experimental.importDurations.thresholds {#experimental-importdurationsthresholds}

- **Type:** `{ warn?: number; danger?: number }`
- **Default:** `{ warn: 100, danger: 500 }`

用于着色和警告的持续时间阈值（毫秒）：

- `warn`：黄色/警告颜色的阈值（默认：100ms）
- `danger`：红色/危险颜色和 `failOnDanger` 的阈值（默认：500ms）

::: info
如果至少有一个文件加载时间长于 `danger` 阈值，[Vitest UI](/guide/ui#import-breakdown) 会自动显示导入细分。
:::

## experimental.viteModuleRunner <Version type="experimental">4.1.0</Version> {#experimental-vitemodulerunner}

::: tip 反馈
请在 [GitHub 讨论](https://github.com/vitest-dev/vitest/discussions/9501) 中留下关于此功能的反馈。
:::

- **Type:** `boolean`
- **Default:** `true`

控制 Vitest 是否使用 Vite 的 [模块运行器](https://vite.dev/guide/api-environment-runtimes#modulerunner) 来运行代码或回退到原生 `import`。

如果此选项在根配置中定义，所有 [项目](/guide/projects) 将自动继承它。

如果你在与代码相同的环境中运行测试（例如服务器后端或简单脚本），请考虑禁用模块运行器。但是，我们仍然建议使用 Vite 的模块运行器或在 [浏览器](/guide/browser/) 中运行 `jsdom`/`happy-dom` 测试，因为它不需要任何额外配置。

禁用此标志将禁用 _所有_ 文件转换：

- 测试文件和你的源代码不会被 Vite 处理
- 你的全局设置文件不会被处理
- 你的自定义运行器/池/环境文件不会被处理
- 你的配置文件仍然由 Vite 处理（这发生在 Vitest 知道 `viteModuleRunner` 标志之前）

::: warning
目前，Vitest 仍然需要 Vite 来执行某些功能，如模块图或监视模式。

还要注意，此选项仅适用于 `forks` 或 `threads` [池](/config/pool)。
:::

### 模块运行器

默认情况下，Vitest 在由 Vite 的 [环境 API](https://vite.dev/guide/api-environment.html#environment-api) 支持的非常宽松的模块运行器沙箱中运行测试。每个文件被分类为“内联”模块或“外部”模块。

模块运行器运行所有“内联”模块。它提供 `import.meta.env`、`require`、`__dirname`、`__filename`、静态 `import`，并拥有自己的模块解析机制。这使得当你不想配置环境且只需要测试你编写的纯 JavaScript 逻辑按预期工作时，运行代码变得非常容易。

所有“外部”模块以原生模式运行，意味着它们在模块运行器沙箱之外执行。如果你在 Node.js 中运行测试，这些文件使用原生 `import` 关键字导入并由 Node.js 直接处理。

虽然在宽松的假环境中运行 JSDOM/happy-dom 测试可能是合理的，但在非 Node.js 环境中运行 Node.js 测试可能会隐藏和静默你在生产中可能遇到的潜在错误，特别是如果你的代码不需要 Vite 插件提供的任何额外转换。

### 已知限制

某些 Vitest 功能依赖于文件被转换。Vitest 使用同步 [Node.js Loaders API](https://nodejs.org/api/module.html#customization-hooks) 来转换测试文件和设置文件以支持这些功能：

- [`import.meta.vitest`](/guide/in-source)
- [`vi.mock`](/api/vi#vi-mock)
- [`vi.hoisted`](/api/vi#vi-hoisted)

::: warning
这意味着 Vitest 至少需要 Node 22.15 才能使这些功能正常工作。目前，它们在 Deno 或 Bun 中也不起作用。

Vitest 只会在测试文件内部检测 `vi.mock` 和 `vi.hoisted`，它们不会在导入的模块内部被提升。
:::

这可能会影响性能，因为 Vitest 需要读取文件并处理它。如果你不使用这些功能，你可以通过将 `experimental.nodeLoader` 设置为 `false` 来禁用转换。Vitest 只在寻找 `vi.mock` 或 `vi.hoisted` 时读取测试文件和设置文件。在其他文件中使用它们不会将它们提升到文件顶部，并可能导致意外行为。

由于 `viteModuleRunner` 的性质，某些功能将无法工作，包括：

- 无 `import.meta.env`：`import.meta.env` 是 Vite 功能，请使用 `process.env` 代替
- 无 `plugins`：插件不被应用，因为没有转换阶段，请通过 [`execArgv`](/config/execargv) 使用 [自定义钩子](https://nodejs.org/api/module.html#customization-hooks) 代替
- 无 `alias`：别名不被应用，因为没有转换阶段
- `istanbul` 覆盖率提供者不起作用，因为没有转换阶段，请使用 `v8` 代替

::: warning 覆盖率支持
目前 Vitest 支持通过 `v8` 提供者进行覆盖率统计，只要文件可以转换为 JavaScript。为了转换 TypeScript，Vitest 使用 [`module.stripTypeScriptTypes`](https://nodejs.org/api/module.html#modulestriptypescripttypescode-options)，它在 Node.js v22.13 以来可用。如果你使用自定义 [模块加载器](https://nodejs.org/api/module.html#customization-hooks)，Vitest 无法重用它来转换文件进行分析。
:::

关于模拟，同样重要的是指出 ES 模块不支持属性覆盖。这意味着像这样的代码将不再起作用：

```ts
import * as fs from 'node:fs'
import { vi } from 'vitest'

vi.spyOn(fs, 'readFileSync').mockImplementation(() => '42') // ❌
```

但是，Vitest 支持自动 spy 模块而不覆盖它们的实现。当 `vi.mock` 被带有 `spy: true` 参数调用时，模块被模拟的方式保留了原始实现，但所有导出函数都被包装在 `vi.fn()` spy 中：

```ts
import * as fs from 'node:fs'
import { vi } from 'vitest'

vi.mock('node:fs', { spy: true })

fs.readFileSync.mockImplementation(() => '42') // ✅
```

工厂模拟是使用顶层 await 实现的。这意味着模拟的模块不能在你的源代码中用 `require()` 加载：

```ts
vi.mock('node:fs', async (importOriginal) => {
  return {
    ...await importOriginal(),
    readFileSync: vi.fn(),
  }
})

const fs = require('node:fs') // 抛出错误
```

此限制存在是因为工厂可以是异步的。这不应该是个问题，因为 Vitest 不会模拟 `node_modules` 内的内置模块，这与 Vitest 默认工作方式类似。

### TypeScript

如果你使用的是 Node.js 22.18/23.6 或更高版本，TypeScript 将被 Node.js [原生转换](https://nodejs.org/en/learn/typescript/run-natively)。

::: warning 使用 Node.js 22.6-22.18 的 TypeScript
如果你使用的 Node.js 版本在 22.6 到 22.18 之间，你也可以通过 `--experimental-strip-types` 标志启用原生 TypeScript 支持：

```shell
NODE_OPTIONS="--experimental-strip-types" vitest
```

如果你使用的是 TypeScript 且 Node.js 版本低于 22.6，那么你需要：

- 构建你的测试文件和源代码并直接运行这些文件
- 通过 `execArgv` 标志导入 [自定义加载器](https://nodejs.org/api/module.html#customization-hooks)

```ts
import { defineConfig } from 'vitest/config'

const tsxApi = import.meta.resolve('tsx/esm/api')

export default defineConfig({
  test: {
    execArgv: [
      `--import=data:text/javascript,import * as tsx from "${tsxApi}";tsx.register()`,
    ],
    experimental: {
      viteModuleRunner: false,
    },
  },
})
```

如果你在 Deno 中运行测试，TypeScript 文件由运行时处理，无需任何额外配置。
:::

## experimental.vcsProvider <Version type="experimental">4.1.1</Version> {#experimental-vcsprovider}

- **类型：** `VCSProvider | string`

```ts
interface VCSProvider {
  findChangedFiles(options: VCSProviderOptions): Promise<string[]>
}

interface VCSProviderOptions {
  root: string
  changedSince?: string | boolean
}
```

- **默认值：** `'git'`

用于检测变更文件的自定义提供者。与 [`--changed`](/guide/cli#changed) 标志一起使用，以确定哪些文件已被修改。

默认情况下，Vitest 使用 Git 来检测变更文件。你可以提供 `VCSProvider` 接口的自定义实现来使用不同的版本控制系统：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    experimental: {
      vcsProvider: {
        async findChangedFiles({ root, changedSince }) {
          // 返回变更文件的路径
          return []
        },
      },
    },
  },
})
```

你也可以传递一个字符串路径到实现了 `VCSProvider` 接口的默认导出模块：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    experimental: {
      vcsProvider: './my-vcs-provider.js',
    },
  },
})
```

```js [my-vcs-provider.js]
export default {
  async findChangedFiles({ root, changedSince }) {
    // 返回变更文件的路径
    return []
  },
}
```

## experimental.nodeLoader <Version type="experimental">4.1.0</Version> {#experimental-nodeloader}

- **类型：** `boolean`
- **默认值：** `true`

如果模块运行器被禁用，Vitest 会使用原生的 [Node.js 模块加载器](https://nodejs.org/api/module.html#customization-hooks) 来转换文件，以支持 `import.meta.vitest`、`vi.mock` 和 `vi.hoisted`。

如果你不使用这些功能，你可以禁用它以提高性能。
