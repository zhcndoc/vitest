---
title: includeTaskLocation | 配置
outline: deep
---

# includeTaskLocation

- **类型：** `boolean`
- **默认值：** `false`

当 Vitest API 在 [报告器](/config/reporters) 中接收任务时，是否应包含 `location` 属性。如果你有大量测试，这可能会导致轻微的性能回归。

`location` 属性具有 `column` 和 `line` 值，对应于原始文件中 `test` 或 `describe` 的位置。

如果你没有显式禁用此选项，并且在以下情况下运行 Vitest，此选项将自动启用：
- [Vitest UI](/guide/ui)
- 或使用了 [浏览器模式](/guide/browser/) 且未启用 [无头](/guide/browser/#headless) 模式
- 或使用了 [HTML 报告器](/guide/reporters#html-reporter)

::: tip
如果你不使用依赖于此的自定义代码，此选项无效。
:::
