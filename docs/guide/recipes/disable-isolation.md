---
title: 按文件隔离设置 | 食谱
---

# 按文件隔离设置

默认情况下，每个测试文件都会在自己的独立模块图中运行，这可以防止一个文件的状态泄漏到另一个文件中。这样的隔离会为每个文件带来初始化时间开销，对于真正需要它的集成测试来说这是可以接受的，但对于不共享可变状态的纯单元测试来说则是浪费。

使用 [`projects`](/guide/projects) 将 [`isolate: false`](/config/isolate) 应用于单元测试套件，同时保持集成测试套件处于隔离状态。

## 模式

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

## 何时隔离很重要

当测试文件不满足以下情况时，可以安全地取消隔离：

- 修改模块级状态（计数器、缓存、顶层 `let` 绑定）
- 调用 [`vi.stubGlobal`](/api/vi#vi-stubglobal) 或 [`vi.stubEnv`](/api/vi#vi-stubenv)
- 对原型进行猴子补丁（`Date.prototype`、`Array.prototype` 等）
- 在 `process` 或其他长生命周期的事件发射器上注册监听器
- 在 `vi.mock` 工厂中依赖一个全新的模块实例

如果上述任意一条适用，那么隔离确实在发挥作用，应保持开启。

## 验证它是否安全

带上随机打乱顺序运行两次测试套件，以暴露文件间污染：

```sh
vitest --shuffle --run --project='Unit tests'
vitest --shuffle --run --project='Unit tests'
```

如果第二次运行产生了不同的结果，就说明你的测试存在依赖执行顺序的问题。要么修复罪魁祸首，要么为该文件保持启用隔离。

## 按池隔离

`isolate` 只控制 [`threads`](/config/pool) 和 [`forks`](/config/pool) 池。`vmThreads` 和 `vmForks` 池无论该标志如何，始终以隔离模式运行，因为它们用启动成本换取了更强的保证。

## 另请参阅

- [`isolate`](/config/isolate)
- [测试项目](/guide/projects)
- [提升性能](/guide/improving-performance)
- [并行与顺序测试文件](/guide/recipes/parallel-sequential)
