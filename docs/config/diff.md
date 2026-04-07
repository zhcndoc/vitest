---
title: diff | 配置
outline: deep
---

# diff

- **类型:** `string`
- **命令行:** `--diff=<path>`

`DiffOptions` 对象或导出 `DiffOptions` 的模块路径。如果你想自定义 diff 显示，这很有用。

Vitest diff 渲染在底层使用 [`@vitest/pretty-format`](https://npmx.dev/package/@vitest/pretty-format)，`DiffOptions` 的一部分被转发给 pretty-format 配置，而其余部分影响 diff 渲染本身。

例如，作为配置对象：

```ts
import { defineConfig } from 'vitest/config'
import c from 'picocolors'

export default defineConfig({
  test: {
    diff: {
      aIndicator: c.bold('--'),
      bIndicator: c.bold('++'),
      omitAnnotationLines: true,
    },
  },
})
```

或作为模块：

:::code-group
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    diff: './vitest.diff.ts',
  },
})
```

```ts [vitest.diff.ts]
import type { DiffOptions } from 'vitest'
import c from 'picocolors'

export default {
  aIndicator: c.bold('--'),
  bIndicator: c.bold('++'),
  omitAnnotationLines: true,
} satisfies DiffOptions
```
:::

## diff.expand

- **类型**: `boolean`
- **默认值**: `true`
- **命令行:** `--diff.expand=false`

展开所有公共行。

## diff.truncateThreshold

- **类型**: `number`
- **默认值**: `0`
- **命令行:** `--diff.truncateThreshold=<path>`

要显示的 diff 结果的最大长度。超过此阈值的 diff 将被截断。
默认值 0 时截断不会生效。

## diff.truncateAnnotation

- **类型**: `string`
- **默认值**: `'... Diff result is truncated'`
- **命令行:** `--diff.truncateAnnotation=<annotation>`

如果 diff 结果被截断，则在末尾输出的注释。

## diff.truncateAnnotationColor

- **类型**: `DiffOptionsColor = (arg: string) => string`
- **默认值**: `noColor = (string: string): string => string`

截断注释的颜色，默认输出不带颜色。

## diff.printBasicPrototype

- **类型**: `boolean`
- **默认值**: `false`

在 diff 输出中打印基本原型 `Object` 和 `Array`

## diff.maxDepth

- **类型**: `number`
- **默认值**: `20`（比较不同类型时为 `8`）

限制打印嵌套对象时的递归深度
