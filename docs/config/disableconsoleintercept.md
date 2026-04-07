---
title: disableConsoleIntercept | 配置
outline: deep
---

# disableConsoleIntercept

- **类型:** `boolean`
- **CLI:** `--disableConsoleIntercept`
- **默认值:** `false`

默认情况下，Vitest 会自动拦截测试期间的控制台日志，以便对测试文件、测试标题等进行额外格式化。

Vitest UI 上的控制台日志预览也需要此功能。

但是，当你想使用正常的同步终端控制台日志来调试代码时，禁用此类拦截可能会有所帮助。

::: warning
此选项对 [浏览器测试](/guide/browser/) 无效，因为 Vitest 会保留浏览器开发工具中的原始日志。
:::
