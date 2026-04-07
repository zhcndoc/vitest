---
title: unstubEnvs | 配置
outline: deep
---

# unstubEnvs

- **类型：** `boolean`
- **默认值：** `false`

Vitest 是否应该在每个测试之前自动调用 [`vi.unstubAllEnvs()`](/api/vi#vi-unstuballenvs)。

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    unstubEnvs: true,
  },
})
```

::: warning
请注意，此选项可能会导致异步 [并发测试](/api/test#test-concurrent) 出现问题。如果启用，一个测试的完成将恢复所有通过 [`vi.stubEnv`](/api/vi#vi-stubenv) 更改的值，包括那些当前正在被其他进行中的测试使用的值。
:::
