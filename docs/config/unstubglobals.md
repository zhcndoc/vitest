---
title: unstubGlobals | 配置
outline: deep
---

# unstubGlobals

- **类型：** `boolean`
- **默认值：** `false`

Vitest 是否应该在每个测试之前自动调用 [`vi.unstubAllGlobals()`](/api/vi#vi-unstuballglobals)。

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    unstubGlobals: true,
  },
})
```

::: warning
请注意，此选项可能会导致异步 [并发测试](/api/test#test-concurrent) 出现问题。如果启用，当一个测试完成时，将会恢复所有通过 [`vi.stubGlobal`](/api/vi#vi-stubglobal) 更改的全局值，包括那些当前正在被其他进行中的测试所使用的值。
:::
