---
title: execArgv | 配置
outline: deep
---

# execArgv

- **类型:** `string[]`
- **默认值:** `[]`

向运行器工作进程中的 `node` 传递额外的参数。请参阅 [命令行 API | Node.js](https://nodejs.org/docs/latest/api/cli.html) 以获取更多信息。

:::warning
使用时请小心，因为某些选项可能会导致工作进程崩溃，例如 `--prof`、`--title`。参见 https://github.com/nodejs/node/issues/41103。
:::
