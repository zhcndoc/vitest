---
title: onUnhandledError | 配置
outline: deep
---

# onUnhandledError <CRoot /> <Version>4.0.0</Version>

- **类型：**

```ts
function onUnhandledError(
  error: (TestError | Error) & { type: string }
): boolean | void
```

一个用于过滤不应报告的未处理错误的自定义回调。当错误被过滤掉时，它不再影响测试运行的结果。

若要报告未处理错误而不影响测试结果，请改用 [`dangerouslyIgnoreUnhandledErrors`](/config/dangerouslyignoreunhandlederrors) 选项。

::: tip
此回调在主线程上调用，它无法访问你的测试上下文。
:::

## 示例

```ts
import type { ParsedStack } from 'vitest'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    onUnhandledError(error): boolean | void {
      // 忽略所有名为 "MySpecialError" 的错误。
      if (error.name === 'MySpecialError') {
        return false
      }
    },
  },
})
```
