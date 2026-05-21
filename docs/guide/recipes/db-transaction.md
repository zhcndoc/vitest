---
title: 每个测试使用数据库事务 | 食谱
---

# 每个测试使用数据库事务

接触真实数据库的集成测试需要从干净状态开始。在每个测试之间截断表很慢，所以常见的变通方法是把每个测试包裹在一个事务中，并在测试结束时回滚。不会发生任何提交，也不需要编写逐个测试的清理代码。

Vitest 通过 [`aroundEach`](/api/hooks#aroundeach) <Version>4.1.0</Version> 和 [作用域 fixture](/guide/test-context#fixture-scopes) <Version>3.2.0</Version> 提供了这一能力。

## 模式

```ts
import { test as baseTest } from 'vitest'
import { createTestDatabase } from './db.ts'

export const test = baseTest
  .extend('db', { scope: 'file' }, async ({}, { onCleanup }) => {
    const db = await createTestDatabase()
    onCleanup(() => db.close())
    return db
  })

test.aroundEach(async (runTest, { db }) => {
  await db.transaction(runTest)
})

test('insert user', async ({ db }) => {
  await db.insert({ name: 'Alice' })
  // 测试结束时会自动回滚
})
```

## 工作原理

`db` fixture 通过 `scope: 'file'` 每个文件创建一次，因此连接设置只会执行一次，而不是每个测试都执行；文件结束时，`onCleanup` 会关闭连接。`aroundEach` 使用 `db.transaction(runTest)` 包裹每个测试，而测试写入的任何内容都会在 `runTest` 解析后回滚。测试通过其上下文接收到同一个 `db` 实例，并且并不知道自己运行在事务中。

只要你的数据库驱动支持嵌套事务或保存点，这种方式就可行，而这涵盖了大多数现代数据库。如果你希望在测试中连同事务一起传递租户 ID 或跟踪 ID 之类的信息，同一个 `aroundEach` 钩子也可以包裹一个 [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage) 上下文。

## 每个 worker 一个连接

如果测试套件有很多文件，那么在每个文件上都支付一次全新的数据库连接成本会累积起来。将 fixture 切换为 `scope: 'worker'` 并关闭隔离，就可以让多个文件在每个 worker 进程中共享一个连接：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    isolate: false,
  },
})
```

```ts
import { test as baseTest } from 'vitest'
import { createTestDatabase } from './db.ts'

export const test = baseTest
  .extend('db', { scope: 'worker' }, async ({}, { onCleanup }) => {
    const db = await createTestDatabase()
    onCleanup(() => db.close())
    return db
  })

test.aroundEach(async (runTest, { db }) => {
  await db.transaction(runTest)
})
```

默认情况下，每个测试文件都在各自的 worker 中运行，因此 `scope: 'file'` 和 `scope: 'worker'` 的行为完全相同。启用 `isolate: false` 后，Vitest 会在文件之间复用 worker（上限由 [`maxWorkers`](/config/maxworkers) 控制），因此 worker 作用域的 fixture 会变成每个 worker 创建一次，而不是每个文件一次。对于一个在 8 个 worker 上运行的 200 文件套件来说，这意味着只需要 8 个连接，而不是 200 个。

复用 worker 并不是免费的优化。关闭隔离后，文件会在 worker 内共享模块实例，而那些会修改顶层状态的测试（计数器、缓存、猴子补丁过的全局对象）可能会把这些状态泄漏给同一个 worker 中下一个运行的文件。每个测试的回滚可以处理数据库中的数据隔离，但无法保护 worker 里的模块状态。在整个套件范围内关闭隔离之前，请先阅读 [按文件隔离设置](/guide/recipes/disable-isolation) 这一配方中的权衡。

[`vmThreads` 和 `vmForks`](/config/pool) 无论 `isolate` 标志如何都始终在隔离环境中运行，因此在这些池中，worker 作用域的 fixture 会退化为按文件行为。

## 另请参阅

- [`aroundEach` 和 `aroundAll`](/api/hooks#aroundeach)
- [Fixture 作用域](/guide/test-context#fixture-scopes)
- [Builder 模式](/guide/test-context#builder-pattern)
