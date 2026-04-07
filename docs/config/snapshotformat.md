---
title: snapshotFormat | 配置
outline: deep
---

# snapshotFormat <CRoot />

- **类型：** `Omit<PrettyFormatOptions, 'plugins' | 'compareKeys'> & { compareKeys?: null | undefined }`

快照测试的格式选项。这些选项配置了构建在 [`@vitest/pretty-format`](https://npmx.dev/package/@vitest/pretty-format) 之上的快照特定格式层。

关于 `PrettyFormatOptions` 的完整选项范围，请参阅 [`@vitest/pretty-format`](https://npmx.dev/package/@vitest/pretty-format)。本页重点介绍 Vitest 快照特定的默认值和约束。

Vitest 快照在应用你的 `snapshotFormat` 覆盖之前已经应用了这些默认值：

- `printBasicPrototype: false`
- `escapeString: false`
- `escapeRegex: true`
- `printFunctionName: false`

Vitest 还在 `snapshotFormat` 中支持格式器选项，例如 `printShadowRoot` 和 `maxOutputLength`。

`printShadowRoot` 控制是否在 DOM 快照中包含阴影根内容。

`maxOutputLength` 是一个近似每层深度的输出预算，而不是对最终渲染字符串的硬性限制。

默认情况下，快照键使用格式器的默认行为进行排序。将 `compareKeys` 设置为 `null` 以禁用键排序。`snapshotFormat` 中不支持自定义比较函数。

::: tip
请注意，此对象上的 `plugins` 将被忽略。

如果你需要通过 pretty-format 插件扩展快照序列化，请改用 [`expect.addSnapshotSerializer`](/api/expect#expect-addsnapshotserializer) 或 [`snapshotSerializers`](/config/snapshotserializers)。
:::
