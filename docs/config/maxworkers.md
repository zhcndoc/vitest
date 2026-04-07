---
title: maxWorkers | 配置
outline: deep
---

# maxWorkers

- **类型：** `number | string`
- **默认值：**
  - 如果 [`watch`](/config/watch) 被禁用，使用所有可用的并行度
  - 如果 [`watch`](/config/watch) 被启用，使用所有可用并行度的一半

定义测试 worker 的最大并发数。接受数字或百分比字符串。

- 数字：生成最多指定数量的 worker。
- 百分比字符串（例如，"50%"）：根据机器可用并行度的给定百分比计算 worker 数量。

## 示例

### 数字

::: code-group
```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    maxWorkers: 4,
  },
})
```
```bash [CLI]
vitest --maxWorkers=4
```
:::

### 百分比

::: code-group
```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    maxWorkers: '50%',
  },
})
```
```bash [CLI]
vitest --maxWorkers=50%
```
:::

Vitest 使用 [`os.availableParallelism`](https://nodejs.org/api/os.html#osavailableparallelism) 来获取可用的最大并行度。
