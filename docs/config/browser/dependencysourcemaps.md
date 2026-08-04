---
title: browser.dependencySourcemaps | 配置
outline: deep
---

# browser.dependencySourcemaps

- **类型：** `boolean`
- **默认值：** `true`

在无头测试运行期间向浏览器提供依赖项（`node_modules` 中的文件）的源映射。

浏览器开发者工具会使用这些源映射：当设置 `dependencySourcemaps: false` 时，在依赖项代码中暂停会显示浏览器实际运行的编译后代码，而不是依赖项的原始源码。如果你不需要以这种方式调试依赖项，禁用源映射可以加快测试运行速度：服务器无需生成并内联映射，并且每个浏览器标签页下载的字节数会减少数倍。

报告的测试错误不受影响：当预构建依赖项内部抛出错误时，即使禁用了此选项，Vitest 仍会使用存储在磁盘上的源映射来映射其堆栈帧。对于未经过预构建而直接提供的依赖项（例如[链接包](https://vite.dev/guide/dep-pre-bundling#monorepos-and-linked-dependencies)），如果它们没有自带源映射，则会回退到所提供代码中的位置，该位置通常与原始文件一致。

在无头运行中，Vitest 永远不会提供其自身预构建模块的源映射（除非使用了 [`--inspect`](/guide/cli#inspect)）——无论如何，这些模块的堆栈帧都会从堆栈跟踪中隐藏。你自己的源文件的源映射始终会被提供。

::: tip
如果工作区中的某些代码解析到了 `node_modules` 路径（例如使用了 `resolve.preserveSymlinks`），请将 [`server.sourcemapIgnoreList`](https://vite.dev/config/server-options#server-sourcemapignorelist) 设置为即使禁用此选项也保留其源映射。
:::
