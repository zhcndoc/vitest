---
title: restoreMocks | 配置
outline: deep
---

# restoreMocks

- **类型：** `boolean`
- **默认值：** `false`

Vitest 是否应该在每个测试之前自动调用 [`vi.restoreAllMocks()`](/api/vi#vi-restoreallmocks)。

这将恢复所有通过 [`vi.spyOn`](/api/vi#vi-spyon) 手动创建的 spy 的原始实现。

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
  },
})
```

::: warning
请注意，此选项可能会导致异步 [并发测试](/api/test#test-concurrent) 出现问题。如果启用，一个测试的完成将恢复所有 spy 的实现，包括那些当前正在被其他进行中的测试使用的 spy。
:::
