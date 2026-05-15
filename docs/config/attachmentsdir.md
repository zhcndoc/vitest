---
title: attachmentsDir | 配置
outline: deep
---

# attachmentsDir <CRoot />

- **类型:** `string`
- **默认值:** `'.vitest/attachments'`

用于存储由 [`context.annotate`](/guide/test-context#annotate) 创建的文件附件的目录路径。

此选项会相对于 Vitest 根配置进行解析。使用 [`projects`](/guide/projects) 时，所有项目共享同一个 `attachmentsDir`；它不能按项目单独配置。
