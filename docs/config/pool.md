---
title: pool | 配置
outline: deep
---

# pool

- **类型:** `'threads' | 'forks' | 'vmThreads' | 'vmForks'`
- **默认值:** `'forks'`
- **CLI:** `--pool=threads`

用于运行测试的池。

## threads

启用多线程。使用 threads 时，无法使用与进程相关的 API，例如 `process.chdir()`。某些用原生语言编写的库，例如 Prisma、`bcrypt` 和 `canvas`，在多线程运行时会出现问题并导致段错误。在这些情况下，建议改用 `forks` 池。

## forks

类似于 `threads` 池，但使用 `child_process` 而不是 `worker_threads`。测试与主进程之间的通信不如 `threads` 池快。与进程相关的 API（如 `process.chdir()`）在 `forks` 池中可用。

## vmThreads

在 `threads` 池中使用 [VM 上下文](https://nodejs.org/api/vm.html)（在沙盒环境中）运行测试。

这使得测试运行更快，但 VM 模块在运行 [ESM 代码](https://github.com/nodejs/node/issues/37648) 时不稳定。你的测试将会 [内存泄漏](https://github.com/nodejs/node/issues/33439) —— 为解决这个问题，考虑手动编辑 [`vmMemoryLimit`](/config/vmmemorylimit) 值。

::: warning
在沙盒中运行代码有一些优势（更快的测试），但也带来了一些缺点。

- 原生模块内的全局变量，例如（`fs`、`path` 等），与测试环境中存在的全局变量不同。因此，这些原生模块抛出的任何错误所引用的 Error 构造函数将与代码中使用的不同：

```ts
try {
  fs.writeFileSync('/does-not-exist')
}
catch (err) {
  console.log(err instanceof Error) // false
}
```

- 导入 ES 模块会无限期缓存它们，如果你有很多上下文（测试文件），这会引入内存泄漏。Node.js 中没有 API 可以清除该缓存。
- 在沙盒环境中访问全局变量 [耗时更长](https://github.com/nodejs/node/issues/31658)。

使用此选项时，请注意这些问题。Vitest 团队无法在我们这边修复任何问题。
:::

## vmForks

类似于 `vmThreads` 池，但使用 `child_process` 而不是 `worker_threads`。测试与主进程之间的通信不如 `vmThreads` 池快。与进程相关的 API（如 `process.chdir()`）在 `vmForks` 池中可用。请注意，此池具有 `vmThreads` 中列出的相同陷阱。
