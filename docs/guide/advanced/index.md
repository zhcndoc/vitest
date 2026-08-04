---
title: 高级 API
---

# 入门指南 <Badge type="danger">高级</Badge> {#getting-started}

::: warning
本指南列出了通过 Node.js 脚本运行测试的高级 API。如果你只是想 [运行测试](/guide/)，可能不需要这个。它主要由库作者使用。
:::

你可以从 `vitest/node` 入口点导入任何方法。

## startVitest

```ts
function startVitest(
  cliFilters: string[] = [],
  options: CliOptions = {},
  viteOverrides?: ViteUserConfig,
  vitestOptions?: VitestOptions,
): Promise<Vitest>
```

你可以使用其 Node API 开始运行 Vitest 测试：

```js
import { startVitest } from 'vitest/node'

const vitest = await startVitest()

await vitest.close()
```

如果测试可以启动，`startVitest` 函数会返回 [`Vitest`](/api/advanced/vitest) 实例。

如果未启用监视模式，Vitest 将自动调用 `close` 方法。

如果启用了监视模式且终端支持 TTY，Vitest 将注册控制台快捷键。

你可以将过滤器列表作为第二个参数传递。Vitest 将只运行文件路径中包含至少一个传递字符串的测试。

此外，你可以使用第三个参数传入 CLI 参数，这将覆盖任何测试配置选项。或者，你可以将完整的 Vite 配置作为第四个参数传入，这将优先于任何其他用户定义的选项。

运行测试后，你可以从 [`state.getTestModules`](/api/advanced/test-module) API 获取结果：

```ts
import type { TestModule } from 'vitest/node'

const vitest = await startVitest()

console.log(vitest.state.getTestModules()) // [TestModule]
```

::: tip
["运行测试"](/guide/advanced/tests#startvitest) 指南中有一个使用示例。
:::

## createVitest

```ts
function createVitest(
  options: CliOptions,
  viteOverrides: ViteUserConfig = {},
  vitestOptions: VitestOptions = {},
): Promise<Vitest>
```

你可以使用 `createVitest` 函数创建 Vitest 实例。它返回与 `startVitest` 相同的 [`Vitest`](/api/advanced/vitest) 实例，但它不会启动测试，也不会验证已安装的软件包。

```js
import { createVitest } from 'vitest/node'

const vitest = await createVitest('test', {
  watch: false,
})
```

::: tip
["运行测试"](/guide/advanced/tests#createvitest) 指南中有一个使用示例。
:::

## resolveConfig

```ts
function resolveConfig(
  options: UserConfig = {},
  viteOverrides: ViteUserConfig = {},
  harness?: PluginHarness,
): Promise<ResolvedViteConfig>
```

此方法使用自定义参数解析配置，但不会创建 Vite 服务器。如果未提供参数，`root` 将为 `process.cwd()`。

它会返回解析后的 Vite 配置。完全解析后的 Vitest 配置（包括每个项目）位于其 `test` 属性上。

```ts
import { resolveConfig } from 'vitest/node'

const viteConfig = await resolveConfig({
  mode: 'custom',
  configFile: false,
  resolve: {
    conditions: ['custom']
  },
  test: {
    setupFiles: ['/my-setup-file.js'],
    pool: 'threads',
  },
})

viteConfig.test.pool // 'threads'
```

::: info
这是 Vitest 在创建服务器前用于解析配置的同一个方法。如果将选项传递给 `startVitest` 或 `createVitest`，Vitest 会再次解析这些选项。

你可以将共享的 [`PluginHarness`](#pluginharness) 作为第三个参数传入，以便在多次调用之间复用日志记录器和包安装器。
:::

## 项目配置解析

本节介绍 `startVitest`、`createVitest` 和 `resolveConfig` 的参数如何与[测试项目](/guide/projects)交互。如果没有项目，所有解析后的选项都会应用于单个根项目，本节内容也就无关紧要了。

根配置按照优先级从低到高由以下三个输入解析而来：

1. 根配置文件
2. `viteOverrides`，在配置文件的值之上进行合并
3. CLI 选项（`options`），在其他所有内容之上应用

随后，每个项目都会独立解析自己的 Vite 配置：

- 作为配置文件或目录引用的项目只解析其自身的文件，不会继承根配置中的任何选项。
- 内联项目默认继承根配置（参见 [`extends`](/guide/projects#configuration)）：会为该项目重新执行根配置文件，在其上合并 `viteOverrides`，最后再合并项目自身的选项。即使不存在根配置文件，继承也依然有效，因为 `viteOverrides` 是有效根配置的一部分。
- 使用 `extends: false` 时，内联项目只解析自身的选项。使用 `extends: './path'` 时，会重新执行所引用的文件，而不是根配置文件，并且不会合并 `viteOverrides`。

以下选项不会被继承：

- `viteOverrides` 中的 `plugins` 永远不会被继承。配置文件会针对每个项目重新执行，从而创建全新的插件实例；但传入 `viteOverrides` 的插件实例属于根 Vite 服务器，无法与项目服务器共享。
- `viteOverrides` 中的 `test.browser` 和 `test.tagsFilter` 永远不会被继承：`browser` 描述单个项目的实例，而 `tagsFilter` 应用于整个运行过程。
- `name` 和 `projects` 永远不会被继承；根配置中的 `globalSetup` 也不会被继承，因为它已经在每次测试运行时执行一次。
- 项目自身的 `tags` 始终会替换从扩展配置中合并而来的 `tags` 数组，而不是与其拼接，因此可以重新定义相同的标签名称。

无论是否使用 `extends`，两组选项都会传递给每个项目：

- 一组固定的 CLI 选项用于配置测试的运行方式（`--testTimeout`、`--retry`、`--pool` 等），并以最高优先级应用于每个项目，与根配置的解析方式保持一致。
- 运行级选项只对整个测试运行过程有意义：每个项目都会接收根配置中已解析的 `coverage`、`attachmentsDir` 和 `mergeReportsLabel` 值。

## parseCLI

```ts
function parseCLI(argv: string | string[], config: CliParseOptions = {}): {
  filter: string[]
  options: CliOptions
}
```

你可以使用此方法解析 CLI 参数。它接受一个字符串（其中参数由单个空格分隔）或 Vitest CLI 使用的相同格式的 CLI 参数字符串数组。它返回一个过滤器和 `options`，你可以稍后将其传递给 `createVitest` 或 `startVitest` 方法。

```ts
import { parseCLI } from 'vitest/node'

const result = parseCLI('vitest ./files.ts --coverage --browser=chrome')

result.options
// {
//   coverage: { enabled: true },
//   browser: { name: 'chrome', enabled: true }
// }

result.filter
// ['./files.ts']
```

## createCLI

```ts
function createCLI(options?: CliParseOptions): CAC
```

创建 Vitest 命令行界面：一个已注册 Vitest 所有命令和选项的 [`cac`](https://github.com/cacjs/cac) 实例。[`parseCLI`](#parsecli) 基于它构建；如果需要原始解析器，请直接使用 `createCLI`。

```ts
import { createCLI } from 'vitest/node'

const cli = createCLI()
```

## 插件容器

```ts
class PluginHarness {
  vitest?: Vitest
  version: string
  logger: Logger
  packageInstaller: VitestPackageInstaller
  getVitest(): Vitest
}
```

Vitest 在解析配置期间、[`Vitest`](/api/advanced/vitest) 实例存在之前，传递给其内部插件的容器。它包含 [`Logger`](#logger)、包安装器和已解析的版本，并在 `Vitest` 实例创建后通过 `getVitest()` 提供该实例（提前调用会抛出异常）。

这是一个面向高级用户的插件 API。你很少会直接构造它，但可以将共享实例传递给 [`resolveConfig`](#resolveconfig)，以复用日志记录器和包安装器。

## 日志记录器

```ts
class Logger {
  constructor(
    outputStream?: Writable,
    errorStream?: Writable,
  )
}
```

Vitest 的终端日志记录器，通过 [`vitest.logger`](/api/advanced/vitest) 暴露。它负责处理格式化输出、错误摘要、运行横幅和清屏操作。使用自定义的 `stdout`/`stderr` 流构造一个实例，即可在以编程方式运行 Vitest 时捕获或重定向其输出。

```ts
import { Logger } from 'vitest/node'

const logger = new Logger(process.stdout, process.stderr)
```
