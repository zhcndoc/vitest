---
title: 类型测试 | 指南
---

# 类型测试

::: tip 示例项目

[GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/typecheck) - [在线运行](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/typecheck?initialPath=__vitest__/)

:::

Vitest 允许你使用 `expectTypeOf` 或 `assertType` 语法为类型编写测试。默认情况下，`*.test-d.ts` 文件内的所有测试都被视为类型测试，但你可以通过 [`typecheck.include`](/config/typecheck#typecheck-include) 配置选项来更改它。

在底层，Vitest 会根据你的配置调用 `tsc` 或 `vue-tsc`，并解析结果。如果 Vitest 发现源代码中有类型错误，也会将其打印出来。你可以使用 [`typecheck.ignoreSourceErrors`](/config/typecheck#typecheck-ignoresourceerrors) 配置选项禁用它。

请记住，Vitest 不会运行这些文件，它们仅由编译器进行静态分析。这意味着，如果你使用动态名称或 `test.each` 或 `test.for`，测试名称将不会被求值——它将按原样显示。

::: warning
在 Vitest 2.1 之前，你的 `typecheck.include` 会覆盖 `include` 模式，所以你的运行时测试实际上并没有运行；它们只进行了类型检查。

自 Vitest 2.1 以来，如果你的 `include` 和 `typecheck.include` 重叠，Vitest 会将类型测试和运行时测试报告为单独的条目。
:::

类型检查也支持使用 CLI 标志，如 `--allowOnly` 和 `-t`。

```ts [mount.test-d.ts]
import { assertType, expectTypeOf } from 'vitest'
import { mount } from './mount.js'

test('my types work properly', () => {
  expectTypeOf(mount).toBeFunction()
  expectTypeOf(mount).parameter(0).toExtend<{ name: string }>()

  // @ts-expect-error name 是一个字符串
  assertType(mount({ name: 42 }))
})
```

测试文件内触发的任何类型错误都将被视为测试错误，因此你可以使用任何想要的类型技巧来测试项目的类型。

你可以在 [API 部分](/api/expect-typeof) 查看可能的匹配器列表。

## 阅读错误

如果你使用的是 `expectTypeOf` API，请参阅 [expect-type 文档关于其错误消息的部分](https://github.com/mmkal/expect-type#error-messages)。

当类型不匹配时，`.toEqualTypeOf` 和 `.toExtend` 使用特殊的辅助类型来产生尽可能可操作的错误消息。但理解它们有一点细微差别。由于断言是“流畅”编写的，失败应该在于“预期”类型，而不是“实际”类型（`expect<Actual>().toEqualTypeOf<Expected>()`）。这意味着类型错误可能会有点令人困惑——所以这个库产生了一个 `MismatchInfo` 类型，试图明确期望是什么。例如：

```ts
expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: string }>()
```

这是一个会失败的断言，因为 `{a: 1}` 的类型是 `{a: number}` 而不是 `{a: string}`。这种情况下的错误消息将类似于以下内容：

```
test/test.ts:999:999 - error TS2344: Type '{ a: string; }' does not satisfy the constraint '{ a: \\"Expected: string, Actual: number\\"; }'.
  Types of property 'a' are incompatible.
    Type 'string' is not assignable to type '\\"Expected: string, Actual: number\\"'.

999 expectTypeOf({a: 1}).toEqualTypeOf<{a: string}>()
```

请注意，报告的类型约束是一条人类可读的消息，指定了“预期”和“实际”类型。不要字面理解句子 `Types of property 'a' are incompatible // Type 'string' is not assignable to type "Expected: string, Actual: number"`——只需查看属性名（`'a'`）和消息：`Expected: string, Actual: number`。这在大多数情况下会告诉你哪里出错了。极其复杂的类型当然需要更多的精力来调试，并且可能需要一些实验。如果错误消息确实具有误导性，请 [提出问题](https://github.com/mmkal/expect-type)。

`toBe...` 方法（如 `toBeString`、`toBeNumber`、`toBeVoid` 等）在被测试的 `Actual` 类型不匹配时，通过解析为不可调用类型来失败。例如，像 `expectTypeOf(1).toBeString()` 这样的断言失败看起来像这样：

```
test/test.ts:999:999 - error TS2349: This expression is not callable.
  Type 'ExpectString<number>' has no call signatures.

999 expectTypeOf(1).toBeString()
                    ~~~~~~~~~~
```

`This expression is not callable` 部分并不是很有帮助——有意义的错误是下一行，`Type 'ExpectString<number> has no call signatures`。这本质上意味着你传递了一个数字，但断言它应该是一个字符串。

如果 TypeScript 添加了对 ["throw" 类型](https://github.com/microsoft/TypeScript/pull/40468) 的支持，这些错误消息可以得到显著改善。在此之前，解读它们需要费些眼力。

### 具体的“预期”对象与类型参数

像这样的断言的错误消息：

```ts
expectTypeOf({ a: 1 }).toEqualTypeOf({ a: '' })
```

将不如像这样的断言有帮助：

```ts
expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: string }>()
```

这是因为 TypeScript 编译器需要推断 `.toEqualTypeOf({a: ''})` 风格的类型参数，而这个库只能通过将其与泛型 `Mismatch` 类型进行比较来将其标记为失败。因此，在可能的情况下，对 `.toEqualTypeOf` 和 `.toExtend` 使用类型参数而不是具体类型。如果比较两个具体类型更方便，你可以使用 `typeof`：

```ts
const one = valueFromFunctionOne({ some: { complex: inputs } })
const two = valueFromFunctionTwo({ some: { other: inputs } })

expectTypeOf(one).toEqualTypeOf<typeof two>()
```

如果你发现使用 `expectTypeOf` API 和处理错误很困难，你可以始终使用更简单的 `assertType` API：

```ts
const answer = 42

assertType<number>(answer)
// @ts-expect-error answer 不是一个字符串
assertType<string>(answer)
```

::: tip
使用 `@ts-expect-error` 语法时，你可能想要确保没有拼写错误。你可以通过将类型文件包含在 [`test.include`](/config/include) 配置选项中来做到这一点，这样 Vitest 也会实际*运行*这些测试，并在出现 `ReferenceError` 时失败。

这将通过，因为它期望一个错误，但单词"answer"有拼写错误，所以这是一个假阳性错误：

```ts
// @ts-expect-error answer 不是一个字符串
assertType<string>(answr)
```
:::

## 运行类型检查

要启用类型检查，只需在 `package.json` 中的 Vitest 命令中添加 [`--typecheck`](/config/typecheck) 标志：

```json [package.json]
{
  "scripts": {
    "test": "vitest --typecheck"
  }
}
```

现在你可以运行类型检查：

::: code-group
```bash [npm]
npm run test
```
```bash [yarn]
yarn test
```
```bash [pnpm]
pnpm run test
```
```bash [bun]
bun test
```
:::

Vitest 使用 `tsc --noEmit` 或 `vue-tsc --noEmit`，具体取决于你的配置，因此你可以从管道中删除这些脚本。
