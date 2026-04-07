---
title: expect | 配置
outline: deep
---

# expect

- **类型：** `ExpectOptions`

## expect.requireAssertions

- **类型：** `boolean`
- **默认值：** `false`

等同于在每个测试开始时调用 [`expect.hasAssertions()`](/api/expect#expect-hasassertions)。这确保没有测试会意外通过。

::: tip
这仅适用于 Vitest 的 `expect`。如果你使用 `assert` 或 `.should` 断言，它们不会被计入，并且你的测试会因为缺少 expect 断言而失败。

你可以通过调用 `vi.setConfig({ expect: { requireAssertions: false } })` 来更改此值。该配置将应用于随后的每个 `expect` 调用，直到手动调用 `vi.resetConfig`。
:::

::: warning
当你使用 `sequence.concurrent` 运行测试并将 `expect.requireAssertions` 设置为 `true` 时，你应该使用 [局部 expect](/guide/test-context.html#expect) 而不是全局的。否则，这可能在 [某些情况下 (#8469)](https://github.com/vitest-dev/vitest/issues/8469) 导致假阴性。
:::

## expect.poll

[`expect.poll`](/api/expect#poll) 的全局配置选项。这些与你传递给 `expect.poll(condition, options)` 的选项相同。

### expect.poll.interval

- **类型：** `number`
- **默认值：** `50`

轮询间隔（毫秒）

### expect.poll.timeout

- **类型：** `number`
- **默认值：** `1000`

轮询超时时间（毫秒）
