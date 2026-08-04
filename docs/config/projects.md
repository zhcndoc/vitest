---
title: 项目 | 配置
outline: deep
---

# 项目

- **类型:** `TestProjectConfiguration[]`
- **默认值:** `[]`

项目数组，参见[项目](/guide/projects)。

声明了 `projects` 的配置文件本身不会运行测试，它只提供实际运行测试的项目。这同样适用于项目配置文件：声明了 `projects` 的被引用配置会成为[嵌套项目](/guide/projects#nested-projects)的容器。此选项不支持在内联项目配置中使用。
