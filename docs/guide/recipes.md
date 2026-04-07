---
title: 示例 | 指南
---

# 示例

## 仅针对特定测试文件禁用隔离

你可以通过为每个 `projects` 条目指定 `isolate` 来禁用特定文件集的隔离，从而加快测试运行速度：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          // 非隔离的单元测试
          name: 'Unit tests',
          isolate: false,
          exclude: ['**.integration.test.ts'],
        },
      },
      {
        test: {
          // 隔离的集成测试
          name: 'Integration tests',
          include: ['**.integration.test.ts'],
        },
      },
    ],
  },
})
```

## 并行和串行测试文件

你可以使用 `projects` 选项将测试文件分为并行和串行组：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'Parallel',
          exclude: ['**.sequential.test.ts'],
        },
      },
      {
        test: {
          name: 'Sequential',
          include: ['**.sequential.test.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
})
```
