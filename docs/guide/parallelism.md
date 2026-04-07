---
title: 并行性 | 指南
outline: deep
---

# 并行性

## 文件并行性

默认情况下，Vitest 会并行运行 _测试文件_。根据指定的 `pool`，Vitest 使用不同的机制来并行化测试文件：

- `forks`（默认）和 `vmForks` 在不同的 [子进程](https://nodejs.org/api/child_process.html) 中运行测试
- `threads` 和 `vmThreads` 在不同的 [工作线程](https://nodejs.org/api/worker_threads.html) 中运行测试

“子进程”和“工作线程”都被称为“工作器”。你可以使用 [`maxWorkers`](/config/maxworkers) 选项配置运行工作器的数量。

如果你有很多测试，通常并行运行它们会更快，但这也取决于项目、环境和 [隔离](/config/isolate) 状态。要禁用文件并行化，你可以将 [`fileParallelism`](/config/fileparallelism) 设置为 `false`。要了解有关可能的性能改进的更多信息，请阅读 [性能指南](/guide/improving-performance)。

## 测试并行性

与 _测试文件_ 不同，Vitest 按顺序运行 _测试_。这意味着单个测试文件内的测试将按定义顺序运行。

Vitest 支持 [`concurrent`](/api/test#test-concurrent) 选项来一起运行测试。如果设置了此选项，Vitest 会将同一 _文件_ 中的并发测试分组（同时运行的测试数量取决于 [`maxConcurrency`](/config/maxconcurrency) 选项），并使用 [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) 运行它们。

单个组内的钩子执行顺序也由 [`sequence.hooks`](/config/sequence#sequence-hooks) 控制。使用 `sequence.hooks: 'parallel'` 时，执行受相同的 [`maxConcurrency`](/config/maxconcurrency) 限制约束。

Vitest 不执行任何智能分析，也不会创建额外的工作器来运行这些测试。这意味着只有当你严重依赖异步操作时，测试性能才会提高。例如，即使指定了 `concurrent` 选项，这些测试仍将一个接一个地运行。这是因为它们是同步的：

```ts
test.concurrent('the first test', () => {
  expect(1).toBe(1)
})

test.concurrent('the second test', () => {
  expect(2).toBe(2)
})
```

如果你希望并发运行所有测试，可以将 [`sequence.concurrent`](/config/sequence#sequence-concurrent) 选项设置为 `true`。
