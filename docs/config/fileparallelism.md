---
title: fileParallelism | 配置
outline: deep
---

# fileParallelism

- **类型:** `boolean`
- **默认值:** `true`
- **命令行:** `--no-file-parallelism`, `--fileParallelism=false`

是否所有测试文件都应并行运行。将此设置为 `false` 会将 `maxWorkers` 选项覆盖为 `1`。

::: tip
此选项不影响在同一文件中运行的测试。如果你想让它们并行运行，请在 [describe](/api/describe#describe-concurrent) 上使用 `concurrent` 选项，或通过 [配置](/config/sequence#sequence-concurrent) 设置。
:::
