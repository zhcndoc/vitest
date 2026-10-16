---
title: root | 配置
outline: deep
---

# root

- **类型:** `string`
- **CLI:** `-r <path>`, `--root=<path>`

项目根目录。相对路径会以当前工作目录为基准解析，但在[项目](/guide/projects)中例外：项目配置文件会以自身所在目录为基准解析，内联项目则会以声明它的配置文件的根目录为基准解析。
