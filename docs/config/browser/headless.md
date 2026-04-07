---
title: browser.headless | 配置
outline: deep
---

# browser.headless

- **类型:** `boolean`
- **默认值:** `process.env.CI`
- **CLI:** `--browser.headless`, `--browser.headless=false`

以 `headless` 模式运行浏览器。如果在 CI 中运行 Vitest，它将默认启用。
