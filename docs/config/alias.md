---
title: alias | 配置
outline: deep
---

# alias

- **类型：** `Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

定义在测试运行时使用的自定义别名。它们将与来自 `resolve.alias` 的别名合并。

::: warning
Vitest 使用 Vite SSR 原语来运行测试，这存在 [某些陷阱](https://vitejs.dev/guide/ssr.html#ssr-externals)。

1. 别名仅影响由 [内联](/config/server#server-deps-inline) 模块通过 `import` 关键字直接导入的模块（默认情况下所有源代码都是内联的）。
2. Vitest 不支持为 `require` 调用设置别名。
3. 如果你正在为外部依赖设置别名（例如，`react` -> `preact`），你可能想要改为为实际的 `node_modules` 包设置别名，以便使其对外部化的依赖生效。[Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) 和 [pnpm](https://pnpm.io/aliases/) 都支持通过 `npm:` 前缀进行别名化。
:::
