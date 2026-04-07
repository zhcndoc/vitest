---
title: exclude | 配置
---

# exclude

- **类型：** `string[]`
- **默认值：** `['**/node_modules/**', '**/.git/**']`
- **CLI：** `vitest --exclude "**/excluded-file" --exclude "*/other-files/*.js"`

应从测试文件中排除的 [glob 模式](https://superchupu.dev/tinyglobby/comparison) 列表。这些模式是相对于 [`root`](/config/root) 解析的（默认为 [`process.cwd()`](https://nodejs.org/api/process.html#processcwd)）。

Vitest 使用 [`tinyglobby`](https://npmx.dev/package/tinyglobby) 包来解析 glob 模式。

::: warning
此选项不影响覆盖率。如果你需要从覆盖率报告中移除某些文件，请使用 [`coverage.exclude`](/config/coverage#exclude)。

这是唯一一个通过 CLI 标志提供时不会覆盖你的配置的选项。所有通过 `--exclude` 标志添加的 glob 模式都会被添加到配置的 `exclude` 中。
:::

## 示例

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      './temp/**',
    ],
  },
})
```

::: tip
虽然 CLI `exclude` 选项是累加的，但在配置中手动设置 `exclude` 将替换默认值。要扩展默认 `exclude` 模式，请使用 `vitest/config` 中的 `configDefaults`：

```js{6}
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      'packages/template/*',
      './temp/**',
    ],
  },
})
```
:::
