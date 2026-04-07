---
title: watch | 配置
outline: deep
---

# watch <CRoot /> {#watch}

- **类型:** `boolean`
- **默认值:** `!process.env.CI && process.stdin.isTTY`
- **命令行:** `-w`, `--watch`, `--watch=false`

启用监视模式

在交互式环境中，这是默认设置，除非显式指定 `--run`。

在 CI 中，或从非交互式 shell 运行时，“监视”模式不是默认设置，但可以通过此标志显式启用。
