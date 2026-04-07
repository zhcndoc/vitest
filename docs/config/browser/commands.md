---
title: browser.commands | 配置
outline: deep
---

# browser.commands

- **类型:** `Record<string, BrowserCommand>`
- **默认值:** `{ readFile, writeFile, ... }`

自定义 [命令](/api/browser/commands)，可以在浏览器测试期间从 `vitest/browser` 导入。
