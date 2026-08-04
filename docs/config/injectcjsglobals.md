---
title: injectCjsGlobals | 配置
---

# injectCjsGlobals

- **类型：** `boolean`
- **默认值：** `true`
- **CLI：** `--no-inject-cjs-globals`、`--injectCjsGlobals=false`

将 CommonJS 模块变量（`module`、`exports`、`require`、`__filename`、`__dirname`）注入 Vitest 处理的每个模块中。

默认情况下，Vitest 转换的每个文件都可以访问这些变量，即使该文件使用 ESM 语法编写。这并不能反映实际环境中的模块工作方式：浏览器不支持 CommonJS 变量，而 Node.js 不会在 ES 模块中暴露这些变量。

要使模块环境更加严格，并更接近目标运行时，可以禁用此行为：

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    injectCjsGlobals: false,
  },
})
```

禁用此选项后，只有被检测为 CommonJS 的模块才会接收这些变量。CommonJS 模块始终保留这些变量，因为它们属于模块作用域；没有这些变量，模块根本无法完成求值。模块类型的检测方式与 Node.js 相同：

1. 文件扩展名：`.cjs` 和 `.cts` 文件始终是 CommonJS，`.mjs` 和 `.mts` 文件始终是 ES 模块。
2. 最近的 `package.json` 中的 `type` 字段：`"module"` 表示 ES 模块，`"commonjs"` 表示 CommonJS。与 Node.js 一样，查找会在遇到第一个 `package.json` 时停止，且不会跨越 `node_modules` 边界，因此依赖不会继承项目的 `type`。
3. 文件中是否存在 ESM 语法：如果文件没有静态的 `import`/`export` 声明，也没有引用 `import.meta`，则会被视为 CommonJS。注释和字符串中的语法不会影响检测。CommonJS 模块允许使用动态导入，因此动态导入不计为 ESM 语法；仅用于类型的 TypeScript 导入会在转换过程中被擦除，因此也不计为 ESM 语法。

语法检测始终启用：Vitest 不会遵循修改模块类型解析方式的 Node.js CLI 标志，例如 `--no-experimental-detect-module`、`--input-type`（在 Node.js 中它仅适用于字符串输入），或在 Node.js 23 中移除的 `--experimental-default-type` 标志。

在 ES 模块中引用 CommonJS 变量会抛出 `ReferenceError`，与 Vitest 外部的行为相同：

```
ReferenceError: __dirname is not defined

“__dirname” 是一个在 ES 模块中不可用的 CommonJS 变量，并且 “injectCjsGlobals” 已禁用。如果此模块应当是 ES 模块，请使用 “import.meta.dirname” 替代 “__dirname”。如果它应当是 CommonJS 模块，请使用 “.cjs” 文件扩展名，在最近的 package.json 中设置 “type”: “commonjs”，或通过 “server.deps.external” 将其外部化。
```

::: warning
此选项不会影响外部化模块，因为这些模块始终由原生运行时执行。Node.js 会自行向外部化的 CommonJS 模块提供 CommonJS 变量。

请注意，即使启用了此选项，内联的 CommonJS 模块也不会经过 Vite 插件处理：`require` 调用始终会离开模块运行器，因此模拟等功能不会对其生效。
:::
