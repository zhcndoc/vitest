---
title: environmentOptions | 配置
---

# environmentOptions

- **类型：** `Record<'jsdom' | 'happyDOM' | string, unknown>`
- **默认值：** `{}`

这些选项会传递给当前 [环境](/config/environment) 的 setup 方法。默认情况下，当你使用 `jsdom` 和 `happyDOM` 作为测试环境时，你只能为它们配置选项。

## 示例

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
      happyDOM: {
        width: 300,
        height: 400,
      },
    },
  },
})
```

::: warning
选项的作用域限于其各自的环境。例如，将 jsdom 选项放在 `jsdom` 键下，将 happy-dom 选项放在 `happyDOM` 键下。这允许你在同一个项目中混合使用多个环境。
:::
