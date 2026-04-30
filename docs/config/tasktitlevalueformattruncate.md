---
title: taskTitleValueFormatTruncate | Config
outline: deep
---

# taskTitleValueFormatTruncate <CRoot /> {#tasktitlevalueformattruncate}

- **类型** `number`
- **默认值：** `40`

设置插入到生成的任务标题中的格式化值的长度限制。

这会影响由 `test.each` 和 `test.for` 等 API 插入的值，包括 `$value` 和 `%` 占位符格式化。

将其设置为 `0` 可禁用截断。
