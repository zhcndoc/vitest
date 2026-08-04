---
title: api | 配置
outline: deep
---

# api

- **类型：** `boolean | number | object`
- **默认值：** `false`
- **CLI：** `--api`, `--api.port`, `--api.host`, `--api.strictPort`

监听端口并为[用户界面](/guide/ui)或[浏览器服务器](/guide/browser/)提供 API。设置为 `true` 时，默认端口为 `51204`；如果在浏览器模式下运行，则默认端口为 `63315`。

## api.allowWrite <Version>4.1.0</Version> {#api-allowwrite}

- **类型：** `boolean`
- **默认值：** 如果不暴露给网络则为 `true`，否则为 `false`

Vitest 服务器可以通过 API 保存测试文件或快照文件。这允许任何能连接到 API 的人在你的机器上运行任意代码。

在浏览器模式下，Vitest 通过接收来自浏览器的 WebSocket 连接来保存[注释附件](/guide/test-annotations)、[构建产物](/api/advanced/artifacts)和[快照](/guide/snapshot)。这允许任何能连接到 API 的人在项目根目录（由 [`fs.allow`](https://vite.dev/config/server-options#server-fs-allow) 配置）中向你的机器写入任意代码。此选项还控制可以间接写入文件的特权浏览器 API，例如通过 [`cdp()`](/api/browser/context#cdp) 访问原始 Chrome DevTools 协议。

::: danger 安全建议
Vitest 默认不会将 API 暴露到互联网，而只监听 `localhost`。但是，如果手动将 `host` 暴露到网络，任何连接到它的人都可以在你的机器上运行任意代码，除非将 `api.allowWrite` 和 `api.allowExec` 设置为 `false`。

如果 host 设置为 `localhost` 或 `127.0.0.1` 以外的任何值，Vitest 默认会将 `api.allowWrite` 和 `api.allowExec` 设置为 `false`。这意味着任何写入操作（如在 UI 中更改代码）都将无法工作。但是，如果你了解安全隐患，可以覆盖这些设置。
:::

## api.allowExec <Version>4.1.0</Version> {#api-allowexec}

- **类型：** `boolean`
- **默认值：** 如果不暴露给网络则为 `true`，否则为 `false`

允许通过 UI 运行任意测试文件。这适用于 [UI](/guide/ui) 中能够运行代码的交互元素（及其背后的服务器代码）。此选项还会限制能够间接执行代码的特权浏览器 API，例如通过 [`cdp()`](/api/browser/context#cdp) 访问原始 Chrome DevTools 协议。

