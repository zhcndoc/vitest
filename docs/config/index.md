---
outline: deep
---

# 配置 Vitest

如果你正在使用 Vite 并且有一个 `vite.config` 文件，Vitest 会读取它以便与你的 Vite 应用的插件和设置相匹配。如果你想为测试使用不同的配置，或者你的主应用并不专门依赖 Vite，你可以：

- 创建 `vitest.config.ts`，它将具有更高的优先级并**覆盖** `vite.config.ts` 中的配置（Vitest 支持所有常规的 JS 和 TS 扩展，但不支持 `json`）——这意味着你 `vite.config` 中的所有选项都将被**忽略**
- 向 CLI 传递 `--config` 选项，例如 `vitest --config ./path/to/vitest.config.ts`
- 在 `defineConfig` 上使用 `process.env.VITEST` 或 `mode` 属性（如果没有被 `--mode` 覆盖，将被设置为 `test`/`benchmark`）以便在 `vite.config.ts` 中条件性地应用不同的配置。请注意，像任何其他环境变量一样，`VITEST` 也在你的测试中通过 `import.meta.env` 暴露

要配置 `vitest` 本身，请在你的 Vite 配置中添加 `test` 属性。如果你是从 `vite` 本身导入 `defineConfig`，你还需要在配置文件的顶部使用 [三斜杠指令](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) 添加对 Vitest 类型的引用。

如果你没有使用 `vite`，请将导入自 `vitest/config` 的 `defineConfig` 添加到你的配置文件中：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ... 在此处指定选项。
  },
})
```

如果你已经有了一个 `vite` 配置，你可以添加 `/// <reference types="vitest/config" />` 来包含 `test` 类型：

```js [vite.config.js]
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // ... 在此处指定选项。
  },
})
```

如果需要，你可以获取 Vitest 的默认选项来扩展它们：

```js [vitest.config.js]
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'packages/template/*'],
  },
})
```

当使用单独的 `vitest.config.js` 时，如果需要，你也可以从另一个配置文件扩展 Vite 的选项：

```js [vitest.config.js]
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    exclude: ['packages/template/*'],
  },
}))
```

如果你的 Vite 配置被定义为一个函数，你可以像这样定义配置：

```js [vitest.config.js]
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      exclude: ['packages/template/*'],
    },
  })
))
```

由于 Vitest 使用 Vite 配置，你也可以使用 [Vite](https://vitejs.dev/config/) 中的任何配置选项。例如，`define` 用于定义全局变量，或 `resolve.alias` 用于定义别名——这些选项应该在顶层定义，_而不是_ 在 `test` 属性内。

## Automatic Dependency Installation

如果尚未安装，Vitest 会提示你安装某些依赖项。你可以通过设置 `VITEST_SKIP_INSTALL_CHECKS=1` 环境变量来禁用此行为。

## Config Options

在 [项目](/guide/projects) 配置中不受支持的配置选项旁带有 <CRoot /> 图标。这意味着它们只能在根 Vitest 配置中设置。
