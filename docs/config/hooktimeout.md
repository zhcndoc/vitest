---
title: hookTimeout | 配置
outline: deep
---

# hookTimeout

- **类型:** `number`
- **默认值:** 在 Node.js 中为 `10_000`，如果 `browser.enabled` 为 `true` 则为 `30_000`
- **命令行:** `--hook-timeout=10000`, `--hookTimeout=10000`

钩子的默认超时时间（毫秒）。使用 `0` 完全禁用超时。
