---
title: include | 配置
---

# include

- **类型:** `string[]`
- **默认值:** `['**/*.{test,spec}.?(c|m)[jt]s?(x)']`
- **CLI:** `vitest [...include]`, `vitest **/*.test.js`

匹配测试文件的 [glob 模式](https://superchupu.dev/tinyglobby/comparison) 列表。这些模式相对于 [`root`](/config/root) 解析（默认为 [`process.cwd()`](https://nodejs.org/api/process.html#processcwd)）。

Vitest 使用 [`tinyglobby`](https://npmx.dev/package/tinyglobby) 包来解析 glob 模式。

::: tip 注意
使用覆盖率时，Vitest 会自动将测试文件的 `include` 模式添加到覆盖率的默认 `exclude` 模式中。参见 [`coverage.exclude`](/config/coverage#exclude)。
:::

## 示例

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      './test',
      './**/*.{test,spec}.tsx?',
    ],
  },
})
```

Vitest 提供了合理的默认值，因此通常你不需要覆盖它们。定义 `include` 的一个好例子是用于 [测试项目](/guide/projects)：

```js{8,12} [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['./test/unit/*.test.js'],
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['./test/e2e/*.test.js'],
        },
      },
    ],
  },
})
```

::: warning
此选项将覆盖 Vitest 默认值。如果你只是想扩展它们，请使用 `vitest/config` 中的 `configDefaults`：

```js{6}
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      ...configDefaults.include,
      './test',
      './**/*.{test,spec}.tsx?',
    ],
  },
})
```
:::
