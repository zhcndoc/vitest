---
title: browser.api | 配置
outline: deep
---

# browser.api

- **类型:** `number | object`
- **默认值:** `63315`
- **CLI:** `--browser.api=63315`, `--browser.api.port=1234, --browser.api.host=example.com`

配置用于在浏览器中提供代码的 Vite 服务器的选项。不会影响 [`test.api`](/config/api) 选项。默认情况下，Vitest 分配端口 `63315` 以避免与开发服务器冲突，允许你并行运行两者。

## api.allowWrite <Version>4.1.0</Version> {#api-allowwrite}

- **类型:** `boolean`
- **默认值:** 如果不暴露给网络则为 `true`，否则为 `false`

Vitest 通过接收来自浏览器的 WebSocket 连接来保存 [标注附件](/guide/test-annotations)、[产物](/api/advanced/artifacts) 和 [快照](/guide/snapshot)。这允许任何能够连接到 API 的人在你项目的根目录内（由 [`fs.allow`](https://vite.dev/config/server-options#server-fs-allow) 配置）在你的机器上写入任意代码。

如果浏览器服务器未暴露给互联网（主机为 `localhost`），这应该不是问题，因此这种情况下的默认值为 `true`。如果你覆盖了主机，Vitest 默认会将 `allowWrite` 设置为 `false` 以防止潜在有害的写入。

## api.allowExec <Version>4.1.0</Version> {#api-allowexec}

- **类型:** `boolean`
- **默认值:** 如果不暴露给网络则为 `true`，否则为 `false`

允许通过 UI 运行任何测试文件。这仅适用于 [UI](/guide/ui) 中可以运行代码的交互元素（及其背后的服务器代码）。如果 UI 被禁用，则此选项无效。请参阅 [`api.allowExec`](/config/api#api-allowexec) 获取更多信息。
