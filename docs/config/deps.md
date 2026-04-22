---
title: deps | 配置
outline: deep
---

# deps

- **类型：** `{ optimizer?, ... }`

依赖解析的处理。

## deps.optimizer {#deps-optimizer}

- **类型：** `{ ssr?, client? }`
- **另见：** [依赖优化选项](https://vitejs.dev/config/dep-optimization-options.html)

启用依赖优化。如果你有很多测试，这可能会提高它们的性能。

当 Vitest 遇到 `include` 中列出的外部库时，它将使用 esbuild 捆绑成单个文件并作为整个模块导入。这有几个好处：

- 导入具有大量导入的包开销很大。通过将它们捆绑到一个文件中，我们可以节省大量时间
- 导入 UI 库开销很大，因为它们不是为了在 Node.js 内部运行而设计的
- 你的 `alias` 配置现在在捆绑包内生效
- 测试中的代码运行方式更接近其在浏览器中的运行方式

请注意，只有 `deps.optimizer?.[mode].include` 选项中的包会被捆绑（某些插件会自动填充此项，例如 Svelte）。你可以在 [Vite](https://vitejs.dev/config/dep-optimization-options.html) 文档中阅读更多关于可用选项的信息（Vitest 不支持 `disable` 和 `noDiscovery` 选项）。默认情况下，Vitest 对 `jsdom` 和 `happy-dom` 环境使用 `optimizer.client`，对 `node` 和 `edge` 环境使用 `optimizer.ssr`。

此选项还会继承你的 `optimizeDeps` 配置（对于 web，Vitest 将扩展 `optimizeDeps`，对于 ssr - `ssr.optimizeDeps`）。如果你在 `deps.optimizer` 中重新定义 `include`/`exclude` 选项，它在运行测试时将扩展你的 `optimizeDeps`。如果 `include` 中列出的选项也在 `exclude` 中，Vitest 会自动将其从 `include` 中移除。

::: tip
你将无法编辑 `node_modules` 代码进行调试，因为代码实际上位于你的 `cacheDir` 或 `test.cache.dir` 目录中。如果你想通过 `console.log` 语句进行调试，请直接编辑它或使用 `deps.optimizer?.[mode].force` 选项强制重新捆绑。
:::

### deps.optimizer.{mode}.enabled

- **类型：** `boolean`
- **默认值：** `false`

启用依赖优化。

## deps.client  {#deps-client}

- **类型：** `{ transformAssets?, ... }`

当环境设置为 `client` 时应用于外部文件的选项。默认情况下，`jsdom` 和 `happy-dom` 使用 `client` 环境，而 `node` 和 `edge` 环境使用 `ssr`，因此这些选项不会影响这些环境内的文件。

通常，`node_modules` 内部的文件会被外部化，但这些选项也会影响 [`server.deps.external`](/config/server#server-deps-external) 中的文件。

### deps.client.transformAssets

- **类型：** `boolean`
- **默认值：** `true`

Vitest 是否应该处理资产（.png, .svg, .jpg 等）文件并像 Vite 在浏览器中那样解析它们。

如果没有指定查询，此模块将拥有一个等于资产路径的默认导出。

::: warning
目前，此选项仅适用于 [`vmThreads`](/config/pool#vmthreads) 和 [`vmForks`](/config/pool#vmforks) 池。
:::

### deps.client.transformCss

- **类型：** `boolean`
- **默认值：** `true`

Vitest 是否应该处理 CSS（.css, .scss, .sass 等）文件并像 Vite 在浏览器中那样解析它们。

如果 CSS 文件被 [`css`](/config/css) 选项禁用，此选项将仅静默 `ERR_UNKNOWN_FILE_EXTENSION` 错误。

::: warning
目前，此选项仅适用于 [`vmThreads`](/config/pool#vmthreads) 和 [`vmForks`](/config/pool#vmforks) 池。
:::

### deps.client.transformGlobPattern

- **类型：** `RegExp | RegExp[]`
- **默认值：** `[]`

用于匹配应转换的外部文件的正则表达式模式。

默认情况下，`node_modules` 内部的文件会被外部化且不转换，除非它是 CSS 或资产，且相应选项未被禁用。

::: warning
目前，此选项仅适用于 [`vmThreads`](/config/pool#vmthreads) 和 [`vmForks`](/config/pool#vmforks) 池。
:::

## deps.interopDefault

- **类型：** `boolean`
- **默认值：** `true`

将 CJS 模块的 default 解释为命名导出。某些依赖项仅捆绑 CJS 模块，并且当使用 `import` 语法而不是 `require` 导入包时，不使用 Node.js 可以静态分析的命名导出。在 Node 环境中使用命名导出导入此类依赖项时，你将看到此错误：

```
import { read } from 'fs-jetpack';
         ^^^^
SyntaxError: Named export 'read' not found. The requested module 'fs-jetpack' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export.
```

Vitest 不进行静态分析，并且无法在你的代码运行之前失败，因此如果禁用此功能，你在运行测试时最可能会看到此错误：

```
TypeError: createAsyncThunk is not a function
TypeError: default is not a function
```

默认情况下，Vitest 假设你正在使用捆绑器来绕过此问题并且不会失败，但如果你的代码未经处理，你可以手动禁用此行为。

## deps.moduleDirectories

- **Type:** `string[]`
- **Default:** `['node_modules']`

应被视为模块目录的目录列表。此配置选项会影响 [`vi.mock`](/api/vi#vi-mock) 的行为：当未提供工厂且你正在模拟的路径匹配 `moduleDirectories` 值之一时，Vitest 将尝试通过在项目的 [root](/config/root) 中查找 `__mocks__` 文件夹来解析模拟。

此选项还将影响在外部化依赖项时是否应将文件视为模块。默认情况下，Vitest 使用原生 Node.js 导入外部模块，绕过 Vite 转换步骤。

设置此选项将 _覆盖_ 默认值，如果你希望仍然搜索 `node_modules` 中的包，请将其与其他选项一起包含：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      moduleDirectories: ['node_modules', path.resolve('../../packages')],
    }
  },
})
```
