---
title: testTimeout | 配置
outline: deep
---

# testTimeout

- **类型:** `number`
- **默认值:** 在 Node.js 中为 `5_000`，如果 `browser.enabled` 为 `true` 则为 `15_000`
- **命令行:** `--test-timeout=5000`, `--testTimeout=5000`

测试的默认超时时间，单位为毫秒。使用 `0` 可完全禁用超时。
