---
title: 编写测试 | 指南
prev:
  text: 快速开始
  link: /guide/
next:
  text: 使用匹配器
  link: /guide/learn/matchers
---

# 编写测试

在 [快速开始](/guide/) 指南中，你已经安装了 Vitest 并运行了第一个测试。本页深入探讨如何在 Vitest 中编写和组织测试。

## 你的第一个测试

一个测试用于验证一段代码是否产生预期结果。在 Vitest 中，你使用 [`test`](/api/test) 函数来定义一个测试，并使用 [`expect`](/api/expect) 进行断言。每个测试都有一个名称（描述它检查内容的字符串）和一个包含一个或多个断言的函数。如果任何断言失败，测试就会失败。

```js
import { expect, test } from 'vitest'

test('Math.sqrt works for perfect squares', () => {
  expect(Math.sqrt(4)).toBe(2)
  expect(Math.sqrt(144)).toBe(12)
  expect(Math.sqrt(0)).toBe(0)
})
```

::: details 使用 `test` 还是 `it`？
你也可以看到使用 [`it`](/api/test) 而不是 `test` 编写的测试。它们的行为完全相同。`it` 只是一个别名，有些人更喜欢它，因为它在具有描述性名称时读起来更自然：

```js
import { expect, it } from 'vitest'

it('should compute square roots', () => {
  expect(Math.sqrt(4)).toBe(2)
})
```

使用你喜欢的任何一种方式。两者效果相同，并且可以在项目中混合使用。如果你想在整个代码库中强制执行一致的选择，[`consistent-test-it`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-it.md) ESLint 规则（也可在 [oxlint](https://oxc.rs/docs/guide/usage/linter/rules/jest/consistent-test-it.html) 中使用）可以有所帮助。
:::

## 使用 `describe` 分组测试

随着测试文件的增长，你希望将相关的测试组织在一起。[`describe`](/api/describe) 会创建一个测试套件，即一组命名的测试：

```js
import { describe, expect, test } from 'vitest'

describe('Math.sqrt', () => {
  test('returns the square root of perfect squares', () => {
    expect(Math.sqrt(4)).toBe(2)
    expect(Math.sqrt(9)).toBe(3)
  })

  test('returns NaN for negative numbers', () => {
    expect(Math.sqrt(-1)).toBeNaN()
  })

  test('returns 0 for 0', () => {
    expect(Math.sqrt(0)).toBe(0)
  })
})
```

你可以嵌套 `describe` 块以进一步组织，但请保持嵌套层级较浅。深度嵌套的测试更难阅读。扁平的测试列表通常足以满足简单模块的需求，而当文件测试多个函数或方法时，`describe` 会更有用，每个函数或方法都可以拥有自己的分组。

## 测试文件

默认情况下，Vitest 会查找任何文件名中包含 `.test.` 或 `.spec.` 的文件，例如 `utils.test.js`、`app.spec.js` 或 `math.test.jsx`。它会在所有子目录中搜索，因此你放置它们的位置并不重要。

确切的匹配模式如下：

- `**/*.test.{ts,js,mjs,cjs,tsx,jsx}`
- `**/*.spec.{ts,js,mjs,cjs,tsx,jsx}`

没有单一“正确”的方式来组织你的测试文件。有些团队更喜欢将测试直接放在被测试源代码旁边，而另一些团队则将它们放在专门的目录中。Vitest 都能找到它们：

```
src/
  utils.js
  utils.test.js       # 与源代码同目录
  __tests__/
    utils.test.js      # 在测试目录中
```

如果默认匹配模式不适合你的项目，你可以通过 [`include`](/config/include) 和 [`exclude`](/config/exclude) 配置选项自定义包含哪些文件。

## 测试 TypeScript

由于 Vitest 基于 Vite 运行，TypeScript 可开箱即用。你无需安装额外的编译器，无需配置 `ts-jest`，也无需为测试单独设置构建步骤。只需将测试文件命名为 `.test.ts` 而不是 `.test.js`，然后开始编写：

```ts
import { expect, test } from 'vitest'

interface User {
  name: string
  age: number
}

function createUser(name: string, age: number): User {
  return { name, age }
}

test('creates a user with the correct fields', () => {
  const user = createUser('Alice', 30)

  expect(user).toEqual({ name: 'Alice', age: 30 })
  expect(user.name).toBe('Alice')
})
```

你可以导入生产环境中的类型，使用泛型，并像在代码库的其他部分一样编写带类型的测试工具。Vite 会即时转换 TypeScript，因此即使在大型项目中，测试启动也很快。

::: tip
Vitest 会在执行时转换 TypeScript，但在测试运行期间**不会**对测试进行类型检查。这与 Vite 为了速度所做的取舍相同：你可以在终端中快速获得反馈，而需要完整类型检查时，再单独运行 `tsc` 或 `vitest typecheck`。有关更多详细信息，请参阅 [Testing Types](/guide/testing-types) 指南。
:::

## 阅读测试输出

当你运行 `vitest` 且只匹配单个测试文件时，输出会以树形结构展开，显示 `describe` 组以及每个测试及其持续时间：

<<< ./snippets/test-output-single.ansi

当运行多个测试文件时，Vitest 会将每个文件折叠成一行以保持输出可控：

<<< ./snippets/test-output-multiple.ansi

当测试失败时，Vitest 会向你展示具体出错信息。你会看到预期值、实际值、一个突出显示差异的差异视图，以及带有失败断言的高亮代码行。它还会包含文件和行号，这样你就可以直接跳转到源代码：

<<< ./snippets/test-output-fail.ansi

在差异视图和代码片段之间，你通常可以理解哪里出错了，而无需添加额外的 `console.log` 语句或手动打开文件。

## 跳过和聚焦测试

在开发过程中，你通常只想运行测试的一个子集。Vitest 提供了用于此的修饰符：

[`.only`](/api/test#only) 告诉 Vitest 仅运行这个测试（或套件），并跳过文件中的其他所有内容。这在你专注于某个特定测试且不想等待整个套件完成时非常有用：

```js
test.only('focus on this test', () => {
  // 只有这个测试会在文件中运行
})
```

[`.skip`](/api/test#skip) 正好相反。它会跳过测试但不会移除它，这在测试暂时损坏或你想在处理其他事情时忽略它时非常有用：

```js
test.skip('not ready yet', () => {
  // 这个测试被跳过
})
```

[`.todo`](/api/test#todo) 允许你标记一个尚未编写的测试占位符。Vitest 会在输出中列出它，这样你就不会忘记它：

```js
test.todo('implement validation later')
```

这些修饰符适合在开发过程中进行快速、局部的更改。如果需要更持久的测试过滤方式（按文件名、行号或标签），请参考 [测试过滤](/guide/filtering) 指南。

## 参数化测试

当你有多个仅在输入和预期输出上不同的测试用例时，为每个用例分别编写一个 `test` 会显得重复。[`test.for`](/api/test#test-for) 允许你将这些用例定义为数据，并对所有用例运行相同的测试逻辑：

```js
import { expect, test } from 'vitest'

test.for([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', ([a, b, expected]) => {
  expect(a + b).toBe(expected)
})
```

在上面的示例中，`%i` 占位符会被每一行数据中的整数值替换。Vitest 还支持其他占位符类型，例如用于字符串的 `%s` 和用于浮点数的 `%f`。因此，测试运行器会生成诸如 `add(1, 1) -> 2`、`add(1, 2) -> 3` 和 `add(2, 1) -> 3` 这样的测试名称。

如果你的用例包含超过两三个值，传入对象会更易读。在名称中使用 `$property` 来插入字段：

```js
test.for([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 1, expected: 3 },
])('add($a, $b) -> $expected', ({ a, b, expected }) => {
  expect(a + b).toBe(expected)
})
```

传递给测试函数的第二个参数是 [Test Context](/guide/test-context)，它让你可以访问 fixtures、每个测试的 `expect` 以及其他工具。这在 [`test.concurrent`](/api/test#concurrent) 中尤其有用，因为并发测试会并行运行，而全局 `expect` 无法可靠地将快照与正确的测试关联起来。上下文作用域中的 `expect` 解决了这个问题：

```js
test.concurrent.for([
  [1, 1],
  [1, 2],
  [2, 1],
])('add(%i, %i)', ([a, b], { expect }) => {
  expect(a + b).toMatchSnapshot()
})
```

[`describe.for`](/api/describe#describe-for) 的工作方式相同，但会为每组参数创建一个套件，这在多个测试共享相同参数化设置时非常有用。

::: tip
Vitest 也提供了 [`test.each`](/api/test#each)，你可能会从 Jest 中认出它。它的工作方式类似，但会展开数组参数而不是将其作为单个值传递，并且不提供对 Test Context 的访问。它主要是为了兼容 Jest 而存在。新代码中建议优先使用 `test.for`。
:::

## 使用全局导入

默认情况下，你需要在每个测试文件顶部从 `vitest` 导入 `test`、`expect`、`describe` 和其他函数。如果你更愿意像使用 Jest 一样将它们作为全局变量使用（无需导入），可以在配置中启用 [`globals`](/config/globals) 选项：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

启用后，你可以无需导入语句编写测试：

```js
test('no import needed', () => {
  expect(1 + 1).toBe(2)
})
```

::: tip
如果你使用 TypeScript，请在 `tsconfig.json` 的 `compilerOptions` 中添加 `"types": ["vitest/globals"]` 以获得正确的类型支持。
:::

## 运行测试

Vitest 默认**并行**运行所有测试文件，**使用 [子进程](/config/pool)**。每个测试文件都在其独立的上下文中运行，因此测试文件之间不会共享状态。这可以防止不同文件中的测试意外相互干扰。

单个文件**内部**的测试默认按顺序运行，这通常是你想要的，因为同一文件中的测试经常共享设置代码。如果你的测试确实彼此独立，你可以使用 [`test.concurrent`](/api/test#concurrent) 让它们并发运行，以加快速度。有关如何控制测试执行的更多细节，请参阅 [并行性](/guide/parallelism) 指南。
