---
title: mockReset | 配置
outline: deep
---

# mockReset

- **类型：** `boolean`
- **默认值：** `false`

Vitest 是否应该在每个测试之前自动调用 [`vi.resetAllMocks()`](/api/vi#vi-resetallmocks)。

这将清除 mock 历史记录并重置每个实现。

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    mockReset: true,
  },
})
```

::: warning
请注意，此选项可能会导致异步 [并发测试](/api/test#test-concurrent) 出现问题。如果启用，一个测试的完成将清除所有 mock 的 mock 历史记录和实现，包括那些当前正在被其他进行中的测试使用的 mock。
:::
