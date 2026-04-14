---
title: 使用匹配器 | 指南
prev:
  text: 编写测试
  link: /guide/learn/writing-tests
next:
  text: 测试异步代码
  link: /guide/learn/async
---

# 使用匹配器

Vitest 使用 `expect` 搭配「匹配器」来断言值是否符合特定条件。本页面涵盖了最常用的匹配器。完整列表请参考 [Expect API 参考](/api/expect)。

## 常用匹配器

测试值最简单的方式是使用严格相等。当编写 `expect(2 + 2).toBe(4)` 时，[`toBe`](/api/expect#tobe) 匹配器会使用 [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 检查该值是否**精确等于** `4`。

```js
import { expect, test } from 'vitest'

test('two plus two is four', () => {
  expect(2 + 2).toBe(4)
})
```

这对数字、字符串、布尔值等原始类型非常有效。但当你比较对象时，`toBe` 检查的是**引用**（它们是否是内存中完全相同的对象），而不是结构是否相同。这时就需要使用 [`toEqual`](/api/expect#toequal)：它会递归比较对象或数组的每一个字段，忽略对象引用：

```js
test('object assignment', () => {
  const data = { one: 1 }
  data.two = 2

  expect(data).toEqual({ one: 1, two: 2 })
})
```

下面是一个更清晰的例子，展示相同内容的两个对象在 `toBe` 和 `toEqual` 下的不同表现：

```js
test('toBe vs toEqual', () => {
  const a = { name: 'Alice' }
  const b = { name: 'Alice' }

  // 这是内存中不同的对象
  expect(a).not.toBe(b)

  // 但它们结构相同
  expect(a).toEqual(b)
})
```

::: tip
经验法则：使用 `toBe` 比较原始类型（数字、字符串、布尔值），使用 `toEqual` 比较对象和数组。
:::

你也可以通过在前面加上 `.not` 来否定任何匹配器。这在需要验证某件事**不成立**时很有用：

```js
test('adding positive numbers is not zero', () => {
  expect(1 + 2).not.toBe(0)
})
```

## 真值判断

在测试中，你有时需要区分 `undefined`、`null` 和 `false`。有时你并不关心具体值，只想知道某个值是真值还是假值。Vitest 提供了对应的匹配器：

- [`toBeNull`](/api/expect#tobenull) 只匹配 `null`
- [`toBeUndefined`](/api/expect#tobeundefined) 只匹配 `undefined`
- [`toBeDefined`](/api/expect#tobedefined) 是 `toBeUndefined` 的反义词。只要不是 `undefined` 就通过
- [`toBeTruthy`](/api/expect#tobetruthy) 匹配 `if` 语句中视为真的任何值
- [`toBeFalsy`](/api/expect#tobefalsy) 匹配 `if` 语句中视为假的任何值

你应该选择最能准确描述你检查内容的匹配器。在确实意味着 `toBeDefined` 时使用 `toBeTruthy` 可能会隐藏 bug，因为 `0` 和 `""` 都有定义但属于假值。

```js
test('null checks', () => {
  const n = null

  expect(n).toBeNull()
  expect(n).toBeDefined()
  expect(n).toBeFalsy()
  expect(n).not.toBeTruthy()
  expect(n).not.toBeUndefined()
})

test('zero', () => {
  const z = 0

  expect(z).toBeDefined() // 通过：0 是有定义的
  expect(z).toBeFalsy() // 通过：0 是假值
  expect(z).not.toBeNull() // 通过：0 不是 null
})
```

## 数字

大多数数字比较都很直接。Vitest 提供你期望的用于大于、小于和相等检查的匹配器：

```js
test('number comparisons', () => {
  const value = 2 + 2

  expect(value).toBeGreaterThan(3)
  expect(value).toBeGreaterThanOrEqual(3.5)
  expect(value).toBeLessThan(5)
  expect(value).toBeLessThanOrEqual(4.5)

  // 对于精确相等，toBe 和 toEqual 对数字效果相同
  expect(value).toBe(4)
  expect(value).toEqual(4)
})
```

有一个常见陷阱是关于浮点数运算的。在 JavaScript 中，`0.1 + 0.2` 不等于 `0.3`（实际上是 `0.30000000000000004`）。这意味着 `toBe(0.3)` 会失败。应该使用 [`toBeCloseTo`](/api/expect#tobecloseto) 来比较在微小舍入误差内的数字：

```js
test('adding floating point numbers', () => {
  const value = 0.1 + 0.2

  // 这不会生效，因为浮点数舍入
  // expect(value).toBe(0.3)

  // 这样可以
  expect(value).toBeCloseTo(0.3)
})
```

## 字符串

你可以使用 [`toMatch`](/api/expect#tomatch) 对字符串进行正则表达式匹配。这在你不关心精确值，而只关心某种模式时非常有用，例如检查错误消息是否包含某个单词，或 URL 是否符合特定格式：

```js
test('there is no I in team', () => {
  expect('team').not.toMatch(/I/)
})

test('version string matches semver format', () => {
  expect('vitest@1.0.0').toMatch(/vitest@\d+\.\d+\.\d+/)
})
```

## 数组与可迭代对象

[`toContain`](/api/expect#tocontain) 检查数组（或其他可迭代对象，如 `Set`）是否包含某个特定项。它使用 `===` 进行比较，因此对原始类型非常有效：

```js
test('the shopping list has milk in it', () => {
  const shoppingList = ['milk', 'bread', 'eggs', 'butter']

  expect(shoppingList).toContain('milk')
  expect(new Set(shoppingList)).toContain('milk')
})
```

如果需要检查数组是否包含具有特定结构的对象，应改用 [`toContainEqual`](/api/expect#tocontainequal)。它的工作方式类似于 `toEqual`，但用于数组中的单个项。

## 对象

测试对象时，通常只想检查几个关键字段，而无需指定每个属性。`toMatchObject` 可以做到这一点。它会验证对象至少包含你指定的属性，并忽略其他属性：

```js
test('user has expected fields', () => {
  const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: '2024-01-01'
  }

  // 我们只关心 name 和 email
  expect(user).toMatchObject({
    name: 'Alice',
    email: 'alice@example.com',
  })
})
```

对于检查单个属性，尤其是嵌套属性，`toHaveProperty` 更易读。你可以传入一个点分隔的路径，并可选地传入预期值：

```js
test('object has property', () => {
  const user = {
    name: 'Alice',
    address: { city: 'Paris', zip: '75001' }
  }

  expect(user).toHaveProperty('name')
  expect(user).toHaveProperty('name', 'Alice')
  expect(user).toHaveProperty('address.city', 'Paris')
  expect(user).toHaveProperty('address.zip')
})
```

## 异常

要验证函数是否抛出错误，请使用 [`toThrow`](/api/expect#tothrow)。你需要将调用包装在另一个函数中，以便 Vitest 能捕获错误，而不是让错误导致测试崩溃：

```js
function compileCode(code) {
  if (code === '') {
    throw new Error('Cannot compile empty string')
  }
  return code
}

test('compiling an empty string throws', () => {
  // 检查是否抛出错误
  expect(() => compileCode('')).toThrow()

  // 检查错误消息
  expect(() => compileCode('')).toThrow('Cannot compile empty string')

  // 使用正则表达式检查消息
  expect(() => compileCode('')).toThrow(/empty string/)
})
```

::: tip
包装函数 `() => compileCode('')` 非常重要。如果直接写 `expect(compileCode('')).toThrow()`，错误会在 `expect` 捕获之前抛出，导致测试因未处理的错误而失败。
:::

## 软断言

通常，一个失败的断言会立即停止测试。这在大多数情况下很有用，但有时你希望同时检查多个独立条件，并一次性看到所有失败，而不是逐个修复。

[`expect.soft`](/api/expect#soft) 正是为此而设计的。它记录失败但允许测试继续执行：

```js
test('check multiple fields', () => {
  const user = { name: 'Alice', age: 30, role: 'admin' }

  expect.soft(user.name).toBe('Alice')
  expect.soft(user.age).toBe(25) // 这里失败但继续执行
  expect.soft(user.role).toBe('admin')
  // 测试报告会显示 age 未匹配
})
```

这在验证 API 响应或复杂对象的结构时特别有用，因为多个字段可能同时出错。
