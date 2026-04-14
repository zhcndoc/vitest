---
title: 测试过滤 | 指南
---

# 测试过滤

随着测试套件不断增长，每次更改都运行所有测试会变得缓慢且分散注意力。如果你在修复某个模块的 bug，就不需要等待数百个不相关测试完成。测试过滤能让你缩小运行范围，从而专注于正在处理的代码。

Vitest 提供了多种过滤测试的方式：命令行、测试文件内部以及通过标签。根据不同场景选择合适的方法会更高效。

::: tip 性能提示
像 `-t`、`--tags-filter`、`.only` 和 `.skip` 这样的过滤是 *按测试文件* 应用的 —— Vitest 仍需运行每个测试文件才能发现匹配的测试。在大型项目中，即使只有少量测试实际执行，这种开销也会累积。

为了避免这种情况，始终在过滤时一并传入文件路径，这样 Vitest 只会加载你关心的文件：

```bash
vitest utils.test.ts -t "handles empty input"
```

或者，你可以使用 [`--experimental.preParse`](/config/experimental#experimental-preparse) 标志，它会在不完全执行测试文件的情况下解析测试名称：

```bash
vitest --experimental.preParse -t "handles empty input"
```
:::

## 按文件名过滤

运行部分测试的最简单方式是将文件名模式作为 CLI 参数传递。Vitest 只会运行路径中包含给定字符串的测试文件：

```bash
vitest basic
```

这会匹配路径中包含 `basic` 的任何测试文件：

```
basic.test.ts
basic-foo.test.ts
basic/foo.test.ts
```

当你明确知道要处理哪个文件并希望跳过其他内容时，这种方法非常有用。

## 按测试名称过滤

有时你关心的测试被埋在一份包含许多其他测试的文件中。此时可以使用 `-t`（或 `--testNamePattern`）按测试名称而非文件名过滤。它接受一个正则表达式模式，并匹配完整的测试名称（包括任何 `describe` 块名）：

```bash
vitest -t "handles empty input"
```

可以结合文件过滤进一步缩小范围：

```bash
vitest utils -t "handles empty input"
```

这只会运行在匹配 `utils` 的文件中，且测试名称匹配 `"handles empty input"` 的测试。

## 按行号过滤

当你在编辑器中查看某个特定测试时，往往只想运行 *那一个测试*。可以直接指定行号：

```bash
vitest basic/foo.test.ts:10
```

Vitest 会运行包含第 10 行的测试。这需要完整的文件名（相对或绝对路径）：

```bash
vitest basic/foo.test.ts:10 # ✅
vitest ./basic/foo.test.ts:10 # ✅
vitest /users/project/basic/foo.test.ts:10 # ✅
vitest foo:10 # ❌ 部分名称无法匹配
vitest ./basic/foo:10 # ❌ 缺少文件扩展名
```

要运行多个特定测试，请用空格分隔：

```bash
vitest basic/foo.test.ts:10 basic/foo.test.ts:25 # ✅
vitest basic/foo.test.ts:10-25 # ❌ 不支持范围
```

## 按标签过滤

对于大型项目，你可能希望将测试分类并按类别运行。[标签](/guide/test-tags) 允许你标记测试，并通过 CLI 按标签过滤：

```ts
test('renders a form', { tags: ['frontend'] }, () => {
  // ...
})

test('calls an external API', { tags: ['backend'] }, () => {
  // ...
})
```

```bash
vitest --tags-filter=frontend
```

这在 CI 流程中特别有用，例如你可能希望将前端和后端测试分开运行，或在快速检查时跳过慢速的集成测试。

## 使用 `.only` 聚焦特定测试

当你在调试一个失败的测试时，希望只运行该测试而不必每次修改 CLI 参数。添加 `.only` 到测试或测试套件会告诉 Vitest 跳过该文件中的其他所有测试：

```ts
import { describe, expect, it } from 'vitest'

describe.only('suite', () => {
  it('test', () => {
    // 因为该套件标记了 .only，所以会运行
    expect(Math.sqrt(4)).toBe(2)
  })
})

describe('another suite', () => {
  it('skipped test', () => {
    // 不会运行
    expect(Math.sqrt(4)).toBe(2)
  })

  it.only('focused test', () => {
    // 也会运行，因为它标记了 .only
    expect(Math.sqrt(4)).toBe(2)
  })
})
```

你可以在 `describe` 块和单个测试上都使用 `.only`。当文件中的任意测试或套件被标记为 `.only` 时，该文件中所有未标记的测试都会被跳过。

::: warning
记得在提交前移除 `.only`。默认情况下，如果 Vitest 在 CI 环境（`process.env.CI` 已设置）中遇到 `.only`，会终止整个测试运行，以防止你意外跳过测试。此行为由 [`allowOnly`](/config/allowonly) 选项控制。

要更早捕获 `.only`，[`no-focused-tests`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-focused-tests.md) ESLint 规则（也在 [oxlint](https://oxc.rs/docs/guide/usage/linter/rules/jest/no-focused-tests.html) 中可用）可以在你提交之前在编辑器中标记它。
:::

## 使用 `.skip` 跳过测试

与 `.only` 相反的是 `.skip`。用它可以临时禁用一个测试或测试套件而不删除它。跳过的测试仍会显示在报告中，这样你就不会忘记它们：

```ts
import { describe, expect, it } from 'vitest'

describe.skip('skipped suite', () => {
  it('test', () => {
    // 整个套件都会被跳过
    expect(Math.sqrt(4)).toBe(2)
  })
})

describe('suite', () => {
  it.skip('skipped test', () => {
    // 只有这一个测试被跳过
    expect(Math.sqrt(4)).toBe(2)
  })
})
```

这适用于测试暂时不稳定或依赖的外部服务暂时不可用的情况。它能让你保留测试作为提醒，同时不阻塞其余测试套件的执行。

## 使用 `.todo` 作为占位测试

在规划新功能时，你可能已经知道需要哪些测试，但尚未实现实际逻辑。`.todo` 可以将测试标记为计划中但尚未编写。它会在报告中显示为提醒：

```ts
import { describe, it } from 'vitest'

describe.todo('unimplemented suite')

describe('suite', () => {
  it.todo('unimplemented test')
})
```

与 `.skip` 不同，`.todo` 测试没有实际的测试体。它纯粹是一个未来工作的占位符。
