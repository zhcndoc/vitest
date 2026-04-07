---
title: dangerouslyIgnoreUnhandledErrors | 配置
outline: deep
---

# dangerouslyIgnoreUnhandledErrors <CRoot />

- **类型**: `boolean`
- **默认值**: `false`
- **命令行:**
  - `--dangerouslyIgnoreUnhandledErrors`
  - `--dangerouslyIgnoreUnhandledErrors=false`

如果此选项设置为 `true`，即使存在未处理的错误，Vitest 也不会使测试运行失败。请注意，内置报告器仍然会报告它们。

如果你想条件性地过滤掉某些错误，请改用 [`onUnhandledError`](/config/onunhandlederror) 回调。

## 示例

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    dangerouslyIgnoreUnhandledErrors: true,
  },
})
```
