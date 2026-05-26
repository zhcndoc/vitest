---
title: browser.commands | 配置
outline: deep
---

# browser.commands

- **类型:** `Record<string, BrowserCommand>`
- **默认值:** `{ readFile, writeFile, ... }`

可在浏览器测试期间从 `vitest/browser` 导入的自定义 [命令](/api/browser/commands)。

::: warning Security
命令在 Vitest Node 进程中运行。如果某个命令会基于浏览器提供的输入暴露文件系统、进程、网络、数据库或 shell 访问权限，请在命令内部对该输入进行验证和限制。内置文件命令会应用 Vite `server.fs` 检查和写入权限检查，但自定义命令需要自行负责其保护措施。

请参阅 [自定义命令安全说明](/api/browser/commands#custom-commands)。
:::
