---
title: api | 配置
outline: deep
---

# api

- **类型：** `boolean | number | object`
- **默认值：** `false`
- **CLI：** `--api`, `--api.port`, `--api.host`, `--api.strictPort`

监听端口并为 [UI](/guide/ui) 或 [浏览器服务器](/guide/browser/) 提供 API 服务。当设置为 `true` 时，默认端口为 `51204`。

## api.allowWrite <Version>4.1.0</Version> {#api-allowwrite}

- **类型：** `boolean`
- **默认值：** 如果不暴露给网络则为 `true`，否则为 `false`

Vitest 服务器可以通过 API 保存测试文件或快照文件。这允许任何能连接到 API 的人在你的机器上运行任意代码。

::: danger 安全建议
Vitest 默认不会将 API 暴露给互联网，仅监听 `localhost`。但是，如果手动将 `host` 暴露给网络，任何连接到它的人都可以在你的机器上运行任意代码，除非 `api.allowWrite` 和 `api.allowExec` 设置为 `false`。

如果 host 设置为 `localhost` 或 `127.0.0.1` 以外的任何值，Vitest 默认会将 `api.allowWrite` 和 `api.allowExec` 设置为 `false`。这意味着任何写入操作（如在 UI 中更改代码）都将无法工作。但是，如果你了解安全隐患，可以覆盖这些设置。
:::

## api.allowExec <Version>4.1.0</Version> {#api-allowexec}

- **类型：** `boolean`
- **默认值：** 如果不暴露给网络则为 `true`，否则为 `false`

允许通过 API 运行任何测试文件。请参阅 [`api.allowWrite`](#api-allowwrite) 中的安全建议。
