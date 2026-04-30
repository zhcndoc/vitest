---
title: chaiConfig | 配置
outline: deep
---

# chaiConfig

- **类型:** `{ includeStack?, showDiff?, truncateThreshold? }`
- **默认值:** `{ includeStack: false, showDiff: true, truncateThreshold: 40 }`

等同于 [Chai 配置](https://github.com/chaijs/chai/blob/4.x.x/lib/chai/config.js)。

## chaiConfig.includeStack

- **类型:** `boolean`
- **默认值:** `false`

影响断言错误消息中是否包含堆栈跟踪。默认值 false 会在错误消息中抑制堆栈跟踪。

## chaiConfig.showDiff

- **类型:** `boolean`
- **默认值:** `true`

影响是否应在抛出的 AssertionErrors 中包含 `showDiff` 标志。`false` 将始终为 `false`；当断言请求显示差异时，`true` 将为 true。

## chaiConfig.truncateThreshold

- **类型:** `number`
- **默认值:** `40`

设置断言错误消息中实际值和期望值的长度阈值。如果超过此阈值，例如对于较大的数据结构，该值将被替换为类似 `[ Array(3) ]` 或 `{ Object (prop1, prop2) }` 的内容。如果你想完全禁用截断，请将其设置为 `0`。
