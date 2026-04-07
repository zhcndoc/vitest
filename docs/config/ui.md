---
title: ui | 配置
outline: deep
---

# ui <CRoot />

- **类型:** `boolean`
- **默认值:** `false`
- **CLI:** `--ui`, `--ui=false`

启用 [Vitest UI](/guide/ui)。

::: warning
此功能需要安装 [`@vitest/ui`](https://npmx.dev/package/@vitest/ui) 包。如果您尚未安装，Vitest 将在您首次运行测试命令时为您安装。
:::

::: danger 安全建议
确保您的 UI 服务器未暴露给网络。自 Vitest 4.1 起，出于安全原因，将 [`api.host`](/config/api) 设置为 `localhost` 以外的任何值都将禁用保存代码或运行任何测试的按钮，实际上使 UI 成为只读报告器。
:::
