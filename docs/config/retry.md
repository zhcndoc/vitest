---
title: retry | 配置
outline: deep
---

# retry

如果测试失败，则重试特定次数。

- **类型：** `number | { count?: number, delay?: number, condition?: RegExp }`
- **默认值：** `0`
- **CLI：** `--retry <times>`, `--retry.count <times>`, `--retry.delay <ms>`, `--retry.condition <pattern>`

## 基本用法

指定一个数字来重试失败的测试：

```ts
export default defineConfig({
  test: {
    retry: 3,
  },
})
```

## CLI 用法

你也可以通过命令行配置重试选项：

```bash
# 简单重试次数
vitest --retry 3

# 使用点表示法的高级选项
vitest --retry.count 3 --retry.delay 500 --retry.condition 'ECONNREFUSED|timeout'
```

## 高级选项 <Version>4.1.0</Version> {#advanced-options}

使用对象来配置重试行为：

```ts
export default defineConfig({
  test: {
    retry: {
      count: 3, // 重试次数
      delay: 1000, // 重试之间的延迟（毫秒）
      condition: /ECONNREFUSED|timeout/i, // 匹配应触发重试的错误正则表达式
    },
  },
})
```

### count

测试失败时重试的次数。默认值为 `0`。

```ts
export default defineConfig({
  test: {
    retry: {
      count: 2,
    },
  },
})
```

### delay

重试尝试之间的延迟（毫秒）。适用于与速率限制 API 交互或需要时间恢复的测试。默认值为 `0`。

```ts
export default defineConfig({
  test: {
    retry: {
      count: 3,
      delay: 500, // 重试之间等待 500ms
    },
  },
})
```

### condition

一个正则表达式模式或一个函数，用于根据错误确定是否应重试测试。

- 当为 **RegExp** 时，它针对错误消息进行测试
- 当为 **function** 时，它接收错误并返回布尔值

::: warning
当将 `condition` 定义为函数时，必须直接在测试文件中完成，而不是在配置文件中（配置会被序列化用于工作线程）。
:::

#### RegExp 条件（在配置文件中）：

```ts
export default defineConfig({
  test: {
    retry: {
      count: 2,
      condition: /ECONNREFUSED|ETIMEDOUT/i, // 在连接/超时错误时重试
    },
  },
})
```

#### 函数条件（在测试文件中）：

```ts
import { describe, test } from 'vitest'

describe('tests with advanced retry condition', () => {
  test('with function condition', { retry: { count: 2, condition: error => error.message.includes('Network') } }, () => {
    // 测试代码
  })
})
```

## 测试文件覆盖

你也可以在测试文件中为每个测试或套件定义重试选项：

```ts
import { describe, test } from 'vitest'

describe('flaky tests', {
  retry: {
    count: 2,
    delay: 100,
  },
}, () => {
  test('network request', () => {
    // 测试代码
  })
})

test('another test', {
  retry: {
    count: 3,
    condition: error => error.message.includes('timeout'),
  },
}, () => {
  // 测试代码
})
```
