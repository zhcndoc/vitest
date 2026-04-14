---
title: 并行性 | 指南
outline: deep
---

# 并行性

Vitest 在两个层面提供并行性：它可以同时运行多个 *测试文件*，并且在每个文件内可以同时运行多个 *测试*。理解两者之间的区别很重要，因为它们的工作方式不同，且各有取舍。

## 文件并行性

默认情况下，Vitest 在多个工作进程（workers）中并行运行测试文件。每个文件拥有独立的环境，因此不同文件中的测试不会相互干扰。

Vitest 用于创建工作进程的机制取决于配置的 [`pool`](/config/pool)：

- `forks`（默认）和 `vmForks` 在单独的 [子进程](https://nodejs.org/api/child_process.html) 中运行每个文件
- `threads` 和 `vmThreads` 在单独的 [工作线程](https://nodejs.org/api/worker_threads.html) 中运行每个文件

你可以通过 [`maxWorkers`](/config/maxworkers) 选项控制同时运行的工作进程数量。更多的线程意味着更多文件并行运行，但也会占用更多内存和 CPU 资源。合适的数量取决于你的机器以及测试的负载。

对于大多数项目，文件并行性是测试套件速度的最主要影响因素。但在某些情况下你可能希望禁用它——例如当测试共享一个无法处理并发访问的外部资源（如数据库）时。你可以将 [`fileParallelism`](/config/fileparallelism) 设置为 `false`，以逐个运行文件。

如需了解更多关于性能调优的内容，请参考 [性能指南](/guide/improving-performance)。

## 测试并行性

在单个文件内，Vitest 默认按顺序运行测试。测试按定义顺序依次执行。这是默认的最安全选择，因为文件中的测试通常会通过 `beforeEach` 等生命周期钩子共享设置和状态。

如果文件中的测试是相互独立的，你可以通过 [`concurrent`](/api/test#test-concurrent) 修饰符启用并发运行：

```ts
import { expect, test } from 'vitest'

test.concurrent('fetches user profile', async () => {
  const user = await fetchUser(1)
  expect(user.name).toBe('Alice')
})

test.concurrent('fetches user posts', async () => {
  const posts = await fetchPosts(1)
  expect(posts).toHaveLength(3)
})
```

当测试被标记为 `concurrent` 时，Vitest 会将它们分组成一组，并使用 [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) 并发运行。同时运行的测试数量受 [`maxConcurrency`](/config/maxconcurrency) 选项限制。

::: tip `concurrent` 何时真正有效？
Vitest 不会为并发测试创建额外的工作线程——它们都在所属文件的同一工作线程中运行。这意味着 `concurrent` 仅在测试花费大量时间 *等待*（如网络请求、定时器、文件 I/O 等）时才能加速执行。纯同步测试不会受益，因为它们仍然会阻塞唯一的 JavaScript 线程：

```ts
// 尽管使用了 `concurrent`，这些测试仍依次执行，
// 因为没有异步等待操作
test.concurrent('the first test', () => {
  expect(1).toBe(1)
})

test.concurrent('the second test', () => {
  expect(2).toBe(2)
})
```
:::

你也可以将 `concurrent` 应用到整个测试套件：

```ts
import { describe, expect, test } from 'vitest'

describe.concurrent('user API', () => {
  test('fetches profile', async () => {
    const user = await fetchUser(1)
    expect(user.name).toBe('Alice')
  })

  test('fetches posts', async () => {
    const posts = await fetchPosts(1)
    expect(posts).toHaveLength(3)
  })
})
```

如果你希望项目中的所有测试默认并发运行，可以在配置中将 [`sequence.concurrent`](/config/sequence#sequence-concurrent) 设为 `true`。

### 并发测试下的生命周期钩子

当测试并发运行时，生命周期钩子的行为会发生变化。`beforeAll` 和 `afterAll` 仍对测试组只运行一次，但 `beforeEach` 和 `afterEach` 会为每个测试执行——并且由于测试可能重叠，它们可能会同时执行。

钩子的执行顺序由 [`sequence.hooks`](/config/sequence#sequence-hooks) 控制。当 `sequence.hooks: 'parallel'` 时，钩子也受 [`maxConcurrency`](/config/maxconcurrency) 限制。
