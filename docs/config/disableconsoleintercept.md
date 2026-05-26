---
title: disableConsoleIntercept | 配置
outline: deep
---

# disableConsoleIntercept

- **类型:** `boolean`
- **CLI:** `--disableConsoleIntercept`
- **默认值:** `false`

默认情况下，Vitest 会在测试期间拦截 console 输出，以添加诸如测试文件和测试标题之类的上下文信息。

在 [浏览器模式](/guide/browser/) 下，这种拦截是必需的，用于将来自浏览器 DevTools 的日志转发到终端。对于 Vitest UI 中的 console 日志预览，这同样是必需的。

当你希望使用正常的同步终端日志来调试代码时，禁用 console 拦截会很有用。
