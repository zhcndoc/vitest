---
title: server | 配置
outline: deep
---

# server <Deprecated />

在 Vitest 4 之前，此选项用于定义 `vite-node` 服务器的配置。

目前，此选项允许你配置内联和外部化机制，以及模块运行器的调试配置。

::: warning
这些选项应仅作为最后的手段使用，以便通过外部化自动内联的依赖项来提高性能，或通过内联无效的外部依赖项来修复问题。

通常，Vitest 应该自动执行此操作。
:::

## server.deps

### server.deps.external

- **类型：** `(string | RegExp)[]`
- **默认：** [`moduleDirectories`](/config/deps#moduledirectories) 内的文件

指定不应由 Vite 转换而应直接由引擎处理的模块。这些模块通过原生动态 `import` 导入，并绕过转换和解析阶段。

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    server: {
      deps: {
        external: ['react'],
      },
    },
  },
})
```

外部模块及其依赖项不在模块图中，当它们更改时不会触发测试重启。

通常，`node_modules` 下的包会被外部化。

::: tip
如果提供的是字符串，它首先会通过添加 `/node_modules/` 或其他 [`moduleDirectories`](/config/deps#moduledirectories) 段前缀进行标准化（例如，`'react'` 变为 `/node_modules/react/`），然后将结果字符串与完整文件路径进行匹配。例如，位于 `packages/some-name` 内的包 `@company/some-name` 应指定为 `some-name`，并且 `packages` 应包含在 `deps.moduleDirectories` 中。

如果提供的是 `RegExp`，则它与完整文件路径进行匹配。
:::

### server.deps.inline

- **类型：** `(string | RegExp)[] | true`
- **默认：** 所有未外部化的内容

指定应由 Vite 转换和解析的模块。这些模块由 Vite 的 [module runner](https://vite.dev/guide/api-environment-runtimes#modulerunner) 运行。

通常，你的源文件会被内联。

::: tip
如果提供的是字符串，它首先会通过添加 `/node_modules/` 或其他 [`moduleDirectories`](/config/deps#moduledirectories) 段前缀进行标准化（例如，`'react'` 变为 `/node_modules/react/`），然后将结果字符串与完整文件路径进行匹配。例如，位于 `packages/some-name` 内的包 `@company/some-name` 应指定为 `some-name`，并且 `packages` 应包含在 `deps.moduleDirectories` 中。

如果提供的是 `RegExp`，则它与完整文件路径进行匹配。
:::

### server.deps.fallbackCJS

- **类型：** `boolean`
- **默认：** `false`

启用后，Vitest 将通过检查一些常见的 CJS/UMD 文件名和文件夹模式（如 `.mjs`、`.umd.js`、`.cjs.js`、`umd/`、`cjs/`、`lib/`）来尝试猜测 ESM 入口的 CommonJS 构建。

这是一种尽力而为的启发式方法，用于绕过混乱或不正确的 ESM/CJS 打包，可能不适用于所有依赖项。
