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

## 浏览器模式

在[浏览器模式](/guide/browser/)中，每个浏览器实例（设置了 `browser.enabled` 的[项目](/guide/projects)，或 [`browser.instances`](/config/browser/instances) 中的一项）都是一个工作线程，因此同时运行的实例数最多为 `maxWorkers`。当另一个实例需要名额时，空闲的无头实例会关闭，并在下次运行时重新打开。非无头实例会在整个会话期间保持打开，因此窗口不会在两次运行之间关闭。这个数量也决定了打开的实例共享的页面配额：单个实例最多可在自己的页面中并行运行 `maxWorkers` 个测试文件；多个实例会分配这份配额，并确保每个实例至少有一个页面。

当浏览器不是无头模式，或 provider 不支持并行运行时，每个实例一次只运行一个测试文件。
