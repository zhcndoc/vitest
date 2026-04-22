---
title: onStackTrace | 配置
outline: deep
---

# onStackTrace <CRoot />

- **类型：** `(error: Error, frame: ParsedStack) => boolean | void`

在处理错误时，将过滤函数应用于每个堆栈跟踪的每一帧。这不适用于由 [`printConsoleTrace`](/config/printconsoletrace#printconsoletrace) 打印的堆栈跟踪。第一个参数 `error` 是一个 `TestError`。

可用于过滤掉来自第三方库的堆栈跟踪帧。

::: tip
堆栈跟踪的总大小通常也受 V8 的 [`Error.stackTraceLimit`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stackTraceLimit) 数量限制。你可以在测试设置函数中将其设置为较高的值，以防止堆栈被截断。
:::

```ts
import type { ParsedStack, TestError } from 'vitest'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    onStackTrace(error: TestError, { file }: ParsedStack): boolean | void {
      // 如果遇到 ReferenceError，则显示整个堆栈。
      if (error.name === 'ReferenceError') {
        return
      }

      // 拒绝来自第三方库的所有帧。
      if (file.includes('node_modules')) {
        return false
      }
    },
  },
})
```
