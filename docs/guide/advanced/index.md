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
  mode: VitestRunMode,
  cliFilters: string[] = [],
  options: CliOptions = {},
  viteOverrides?: ViteUserConfig,
  vitestOptions?: VitestOptions,
): Promise<Vitest>
```

你可以使用其 Node API 开始运行 Vitest 测试：

```js
import { startVitest } from 'vitest/node'

const vitest = await startVitest('test')

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

const vitest = await startVitest('test')

console.log(vitest.state.getTestModules()) // [TestModule]
```

::: tip
["运行测试"](/guide/advanced/tests#startvitest) 指南中有一个使用示例。
:::

## createVitest

```ts
function createVitest(
  mode: VitestRunMode,
  options: CliOptions,
  viteOverrides: ViteUserConfig = {},
  vitestOptions: VitestOptions = {},
): Promise<Vitest>
```

你可以使用 `createVitest` 函数创建 Vitest 实例。它返回与 `startVitest` 相同的 [`Vitest`](/api/advanced/vitest) 实例，但它不启动测试也不验证已安装的包。

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
): Promise<{
  vitestConfig: ResolvedConfig
  viteConfig: ResolvedViteConfig
}>
```

此方法使用自定义参数解析配置。如果未给出参数，`root` 将为 `process.cwd()`。

```ts
import { resolveConfig } from 'vitest/node'

// vitestConfig 仅包含已解析的 "test" 属性
const { vitestConfig, viteConfig } = await resolveConfig({
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
```

::: info
由于 Vite 的 `createServer` 的工作方式，Vitest 必须在插件的 `configResolve` 钩子期间解析配置。因此，此方法实际上并未在内部使用，而是仅作为公共 API 暴露。

如果你将配置传递给 `startVitest` 或 `createVitest` API，Vitest 仍将再次解析配置。
:::

::: warning
`resolveConfig` 不解析 `projects`。要解析项目配置，Vitest 需要已建立的 Vite 服务器。

另请注意，`viteConfig.test` 将不会完全解析。如果你需要 Vitest 配置，请改用 `vitestConfig`。
:::

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
