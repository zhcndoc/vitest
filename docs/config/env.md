---
title: env | 配置
outline: deep
---

# env

- **类型:** `Partial<NodeJS.ProcessEnv>`

测试期间可在 `process.env` 和 `import.meta.env` 中使用的环境变量。这些变量在主进程中不可用（例如 `globalSetup` 中）。

::: warning
在此处设置 `TZ` 不会更改 `threads` 和 `vmThreads` 池中的时区。详见[工作线程中的时区不会改变](/guide/common-errors#time-zone-does-not-change-in-worker-threads)。
:::
