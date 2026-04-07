---
title: browser.trackUnhandledErrors | 配置
outline: deep
---

# browser.trackUnhandledErrors

- **类型:** `boolean`
- **默认值:** `true`

启用对未捕获错误和异常的跟踪，以便 Vitest 可以报告它们。

如果你需要隐藏某些错误，建议改用 [`onUnhandledError`](/config/onunhandlederror) 选项。

禁用此项将完全移除所有 Vitest 错误处理器，这有助于在开启“遇到异常时暂停”复选框的情况下进行调试。
