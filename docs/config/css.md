---
title: css | 配置
outline: deep
---

# css

- **Type:** `boolean | { include?, exclude?, modules? }`

配置是否处理 CSS。当被排除时，CSS 文件将被替换为空字符串以绕过后续处理。CSS Modules 将返回一个代理以避免影响运行时。

::: warning
此选项不适用于 [浏览器测试](/guide/browser/)。
:::

## css.include

- **Type:** `RegExp | RegExp[]`
- **Default:** `[]`

用于匹配应返回实际 CSS 并将由 Vite 管道处理的文件的 RegExp 模式。

::: tip
要处理所有 CSS 文件，请使用 `/.+/`。
:::

## css.exclude

- **Type:** `RegExp | RegExp[]`
- **Default:** `[]`

用于匹配将返回空 CSS 文件的文件的 RegExp 模式。

## css.modules

- **Type:** `{ classNameStrategy? }`
- **Default:** `{}`

### css.modules.classNameStrategy

- **Type:** `'stable' | 'scoped' | 'non-scoped'`
- **Default:** `'stable'`

如果你决定处理 CSS 文件，你可以配置 CSS modules 内部的类名是否应该被作用域化。你可以选择以下选项之一：

- `stable`: 类名将生成为 `_${name}_${hashedFilename}`，这意味着如果 CSS 内容发生变化，生成的类名将保持不变，但如果文件名被修改或文件被移动到另一个文件夹，类名将发生变化。如果你使用快照功能，此设置很有用。
- `scoped`: 类名将照常生成，遵循 `css.modules.generateScopedName` 方法（如果你配置了该方法且启用了 CSS 处理）。默认情况下，类名将生成为 `_${name}_${hash}`，其中 hash 包含文件名和文件内容。
- `non-scoped`: 类名将不会被哈希化。

::: warning
默认情况下，Vitest 导出一个代理，绕过 CSS Modules 处理。如果你依赖类上的 CSS 属性，你必须使用 `include` 选项启用 CSS 处理。
:::
