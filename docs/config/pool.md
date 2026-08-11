---
title: pool | 配置
outline: deep
---

# pool

- **类型:** `'threads' | 'forks' | 'vmThreads' | 'vmForks'`
- **默认值:** `'forks'`
- **CLI:** `--pool=threads`

用于运行测试的池。

## 线程

启用多线程。使用 `threads` 时，无法使用与进程相关的 API，例如 `process.chdir()`。一些用原生语言编写的库，例如 `Prisma`、`bcrypt` 和 `canvas`，在多线程环境下运行时会出现问题，并可能导致段错误（segfault）。在这些情况下，建议改用 `forks` 池。

## forks

类似于 `threads` 池，但使用 `child_process` 而不是 `worker_threads`。测试与主进程之间的通信不如 `threads` 池快。与进程相关的 API（如 `process.chdir()`）在 `forks` 池中可用。

## vmThreads

在 `threads` 池中使用 [VM 上下文](https://nodejs.org/api/vm.html)（在沙盒环境中）运行测试。

这会让测试运行得更快，但 VM 模块在运行 [ESM 代码](https://github.com/nodejs/node/issues/37648) 时并不稳定。你的测试会[泄漏内存](https://github.com/nodejs/node/issues/33439)——为了解决这个问题，当 Worker 超过 [`vmMemoryLimit`](/config/vmmemorylimit) 时会重启它们。

::: warning `vmThreads` 中的 Worker 回收代价高昂
重启 Worker 线程并不是没有代价的：在线程退出之前，Node.js 会对 Worker 累积的所有内容执行完整的垃圾回收，而这项工作由进程中所有 Worker 共享的少量后台线程执行。当大型测试套件反复触及 [`vmMemoryLimit`](/config/vmmemorylimit) 时，这些清理工作会堆积起来，并且还会拖慢仍在运行测试的 Worker。

`vmForks` 池通过让子进程退出来回收 Worker，由操作系统回收内存。如果你的测试套件足够大，需要回收 Worker，那么即使 `vmForks` 与主进程的通信速度较慢，它通常仍会明显快于 `vmThreads`。
:::

在 Node.js 24.9 及更高版本中，VM 池内支持对 ES 模块使用 `require()`，其行为与 [Node 自身的 `require(esm)`](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require) 一致。对模块图中包含顶层 `await` 的 ES 模块调用 `require()` 会抛出 `ERR_REQUIRE_ASYNC_MODULE`——对于这些文件，请使用 `await import()`。

::: warning
在沙盒中运行代码有一些优势（更快的测试），但也带来了一些缺点。

- 原生模块内的全局变量，例如（`fs`、`path` 等），与测试环境中存在的全局变量不同。因此，这些原生模块抛出的任何错误所引用的 Error 构造函数将与代码中使用的不同：

```ts
try {
  fs.writeFileSync('/does-not-exist')
}
catch (err) {
  console.log(err instanceof Error) // 假
}
```

- 导入 ES 模块会无限期缓存它们，如果你有很多上下文（测试文件），这会引入内存泄漏。Node.js 中没有 API 可以清除该缓存。
- 在沙盒环境中访问全局变量 [耗时更长](https://github.com/nodejs/node/issues/31658)。

使用此选项时，请注意这些问题。Vitest 团队无法在我们这边修复任何问题。
:::

## vmForks

与 `vmThreads` 池类似，但使用 `child_process` 而不是 `worker_threads`。测试与主进程之间的通信不如使用 `vmThreads` 池时快速。`process.chdir()` 等与进程相关的 API 在 `vmForks` 池中可用。请注意，此池存在 `vmThreads` 中列出的相同问题。

与 `vmThreads` 不同，回收超过 [`vmMemoryLimit`](/config/vmmemorylimit) 的工作线程只需要子进程退出，因此成本低得多。对于会定期回收工作线程的大型测试套件，优先选择 `vmForks` 而不是 `vmThreads`。
