---
title: clearMocks | 配置
outline: deep
---

# clearMocks

- **类型：** `boolean`
- **默认值：** `false`

Vitest 是否应该在每个测试之前自动调用 [`vi.clearAllMocks()`](/api/vi#vi-clearallmocks)。

这将清除 mock 历史记录，但不会影响 mock 实现。

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
  },
})
```

::: warning
请注意，此选项可能会导致异步 [并发测试](/api/test#test-concurrent) 出现问题。如果启用，当一个测试完成时，将清除所有 mock 的历史记录，包括那些当前正被其他进行中测试使用的 mock。
:::
