---
title: allowOnly | 配置
outline: deep
---

# allowOnly

- **类型**: `boolean`
- **默认值**: `!process.env.CI`
- **CLI:** `--allowOnly`, `--allowOnly=false`

默认情况下，Vitest 不允许在持续集成 (CI) 环境中运行标记了 [`only`](/api/test#test-only) 标志的测试。相反，在本地开发环境中，Vitest 允许运行这些测试。

::: info
Vitest 使用 [`std-env`](https://npmx.dev/package/std-env) 包来检测环境。
:::

你可以通过将 `allowOnly` 选项显式设置为 `true` 或 `false` 来自定义此行为。

::: code-group
```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    allowOnly: true,
  },
})
```
```bash [CLI]
vitest --allowOnly
```
:::

启用时，如果检测到标记了 [`only`](/api/test#test-only) 的测试，Vitest 不会导致测试套件失败，包括在 CI 环境中。

禁用时，如果检测到标记了 [`only`](/api/test#test-only) 的测试，Vitest 将导致测试套件失败，包括在本地开发环境中。
