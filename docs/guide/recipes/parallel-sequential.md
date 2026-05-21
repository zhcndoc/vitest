---
title: 并行与顺序测试文件 | 方案
---

# 并行与顺序测试文件

大多数测试文件彼此独立，并且可以更快地并行运行。例外的是少数会共享独占资源的文件，例如固定端口、可写的临时目录，或没有按测试隔离的数据库。当其他测试与它们同时运行时，这些文件会出现不稳定。

全局禁用并行会拖慢套件中的每一个测试。将套件拆分为两个 [`projects`](/guide/projects)，一个并行、一个顺序执行，只会让受影响的文件承担这部分代价。

## 模式

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

在项目级别使用 [`fileParallelism: false`](/config/fileparallelism) 可以让其余测试套件继续并发运行，而匹配到的文件则一次运行一个。它是 [`maxWorkers: 1`](/config/maxworkers) 的简写；这两个设置等价。

## 在并行之后运行顺序任务

默认情况下，各项目彼此并行运行，因此顺序项目的第一个文件可能会与仍然占用相同资源的并行文件重叠。使用 <Version>3.2.0</Version> 中的 [`sequence.groupOrder`](/config/sequence#sequence-grouporder) 可强制先完成并行批次：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'Parallel',
          exclude: ['**.sequential.test.ts'],
          sequence: { groupOrder: 0 },
        },
      },
      {
        test: {
          name: 'Sequential',
          include: ['**.sequential.test.ts'],
          fileParallelism: false,
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
})
```

并行批次会先完成，*然后* 顺序批次才开始。总墙钟时间仍然接近并行时间加上顺序测试运行时间之和。

## 文件作用域 vs. 测试作用域

Vitest 中有两个不同的“并行”开关。不要混淆它们：

| 作用域 | 开关 | 控制内容 |
| --- | --- | --- |
| 跨文件 | [`fileParallelism`](/config/fileparallelism) | 两个测试 *文件* 是否在并行 worker 中运行 |
| 文件内 | `describe.concurrent` / `test.concurrent` | 一个文件内部的测试是否并发运行 |

`fileParallelism: false` 并不会让文件内的测试变成并发；文件内的测试默认就是顺序执行。而 `describe` 或 `test` 上的 `concurrent` 不会影响文件的调度方式。

## 另请参阅

- [`fileParallelism`](/config/fileparallelism)
- [`maxWorkers`](/config/maxworkers)
- [`sequence.groupOrder`](/config/sequence#sequence-grouporder)
- [并行性](/guide/parallelism)
- [测试项目](/guide/projects)
- [按文件隔离设置](/guide/recipes/disable-isolation)
