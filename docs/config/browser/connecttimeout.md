---
title: browser.connectTimeout | 配置
outline: deep
---

# browser.connectTimeout

- **类型:** `number`
- **默认值:** `60_000`

超时时间（毫秒）。如果连接到浏览器的时间过长，测试套件将失败。

::: info
这是浏览器与 Vitest 服务器建立 WebSocket 连接所需的时间。在正常情况下，不应达到此超时时间。
:::
