---
title: isolate | 配置
outline: deep
---

# isolate

- **类型：** `boolean`
- **默认值：** `true`
- **CLI：** `--no-isolate`, `--isolate=false`

在隔离环境中运行测试。此选项对 `vmThreads` 和 `vmForks` 池没有影响。

如果你的代码不依赖副作用（对于 `node` 环境的项目通常是这样），禁用此选项可能会 [提高性能](/guide/improving-performance)。

::: tip
你可以通过使用 Vitest 工作空间并按项目禁用隔离，来为特定测试文件禁用隔离。
:::
