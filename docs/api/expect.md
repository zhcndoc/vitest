# expect

以下类型用于下面的类型签名中

```ts
type Awaitable<T> = T | PromiseLike<T>
```

`expect` 用于创建断言。在此上下文中，`assertions` 是可以被调用来断言语句的函数。Vitest 默认提供 `chai` 断言，同时也提供基于 `chai` 构建的 `Jest` 兼容断言。自 Vitest 4.1 起，对于 spy/mock 测试，Vitest 还提供 Chai 风格的断言（例如，[`expect(spy).to.have.been.called()`](#called)）以及 Jest 风格的断言（例如，`expect(spy).toHaveBeenCalled()`）。与 `Jest` 不同，Vitest 支持将消息作为第二个参数 - 如果断言失败，错误消息将等于该参数。

```ts
export interface ExpectStatic extends Chai.ExpectStatic, AsymmetricMatchersContaining {
  <T>(actual: T, message?: string): Assertion<T>
  extend: (expects: MatchersObject) => void
  anything: () => any
  any: (constructor: unknown) => any
  getState: () => MatcherState
  setState: (state: Partial<MatcherState>) => void
  not: AsymmetricMatchersContaining
}
```

例如，这段代码断言 `input` 值等于 `2`。如果不等于，断言将抛出错误，测试将失败。

```ts twoslash
import { expect } from 'vitest'

const input = Math.sqrt(4)

expect(input).to.equal(2) // chai 接口
expect(input).toBe(2) // jest 接口
```

严格来说，这个示例没有使用 [`test`](/api/test) 函数，所以在控制台中你会看到 Node.js 错误而不是 Vitest 输出。要了解有关 `test` 的更多信息，请阅读 [测试 API 参考](/api/test)。

此外，`expect` 也可以静态使用以访问匹配器函数，稍后会描述，以及更多功能。

::: warning
`expect` 对测试类型没有影响，如果表达式没有类型错误。如果你想使用 Vitest 作为 [类型检查器](/guide/testing-types)，请使用 [`expectTypeOf`](/api/expect-typeof) 或 [`assertType`](/api/assert-type)。
:::

## assert

- **类型：** `Chai.AssertStatic`

Vitest 重新导出 chai 的 [`assert` API](https://www.chaijs.com/api/assert/) 作为 `expect.assert` 以方便使用。你可以在 [Assert API 页面](/api/assert) 上看到支持的方法。

这特别有用，如果你需要缩小类型范围，因为 `expect.to*` 方法不支持这一点：

```ts
interface Cat {
  __type: 'Cat'
  mew(): void
}
interface Dog {
  __type: 'Dog'
  bark(): void
}
type Animal = Cat | Dog

const animal: Animal = { __type: 'Dog', bark: () => {} }

expect.assert(animal.__type === 'Dog')
// 不会显示类型错误！
expect(animal.bark()).toBeUndefined()
```

::: tip
注意 `expect.assert` 也支持其他类型缩小方法（如 `assert.isDefined`、`assert.exists` 等）。
:::

## soft

- **类型：** `ExpectStatic & (actual: any) => Assertions`

`expect.soft` 的功能类似于 `expect`，但在断言失败时不会终止测试执行，而是继续运行并将失败标记为测试失败。测试期间遇到的所有错误都将显示，直到测试完成。

```ts
import { expect, test } from 'vitest'

test('expect.soft test', () => {
  expect.soft(1 + 1).toBe(3) // 标记测试为失败并继续
  expect.soft(1 + 2).toBe(4) // 标记测试为失败并继续
})
// 报告器将在运行结束时报告这两个错误
```

它也可以与 `expect` 一起使用。如果 `expect` 断言失败，测试将终止并显示所有错误。

```ts
import { expect, test } from 'vitest'

test('expect.soft test', () => {
  expect.soft(1 + 1).toBe(3) // 标记测试为失败并继续
  expect(1 + 2).toBe(4) // 失败并终止测试，所有之前的错误将被输出
  expect.soft(1 + 3).toBe(5) // 不会运行
})
```

::: warning
`expect.soft` 只能在 [`test`](/api/test) 函数内部使用。
:::

## poll

```ts
interface ExpectPoll extends ExpectStatic {
  (actual: () => T, options?: { interval?: number; timeout?: number; message?: string }): Promise<Assertions<T>>
}
```

`expect.poll` 会重新运行 _断言_ 直到成功。你可以通过设置 `interval` 和 `timeout` 选项来配置 Vitest 应该重新运行 `expect.poll` 回调多少次。

如果在 `expect.poll` 回调内部抛出错误，Vitest 将重试直到超时。

```ts
import { expect, test } from 'vitest'

test('element exists', async () => {
  asyncInjectElement()

  await expect.poll(() => document.querySelector('.element')).toBeTruthy()
})
```

::: warning
`expect.poll` 使每个断言都变为异步，所以你需要 await 它。自 Vitest 3 起，如果你忘记 await 它，测试将失败并发出警告。

`expect.poll` 不适用于几个匹配器：

- 快照匹配器不受支持，因为它们总是会成功。如果你的条件不稳定，考虑使用 [`vi.waitFor`](/api/vi#vi-waitfor) 来先解决它：

```ts
import { expect, vi } from 'vitest'

const flakyValue = await vi.waitFor(() => getFlakyValue())
expect(flakyValue).toMatchSnapshot()
```

- `.resolves` 和 `.rejects` 不受支持。`expect.poll` 如果条件是异步的，已经会 await 它。
- `toThrow` 及其别名不受支持，因为 `expect.poll` 条件总是在匹配器获取值之前解析
:::

## not

使用 `not` 将否定断言。例如，这段代码断言 `input` 值不等于 `2`。如果相等，断言将抛出错误，测试将失败。

```ts
import { expect, test } from 'vitest'

const input = Math.sqrt(16)

expect(input).not.to.equal(2) // chai 接口
expect(input).not.toBe(2) // jest 接口
```

## toBe

- **类型：** `(value: any) => Awaitable<void>`

`toBe` 可用于断言原始值是否相等或对象是否共享同一引用。它等同于调用 `expect(Object.is(3, 3)).toBe(true)`。如果对象不相同，但你想检查它们的结构是否相同，你可以使用 [`toEqual`](#toequal)。

例如，下面的代码检查交易者是否有 13 个苹果。

```ts
import { expect, test } from 'vitest'

const stock = {
  type: 'apples',
  count: 13,
}

test('stock has 13 apples', () => {
  expect(stock.type).toBe('apples')
  expect(stock.count).toBe(13)
})

test('stocks are the same', () => {
  const refStock = stock // 同一引用

  expect(stock).toBe(refStock)
})
```

尽量不要对浮点数使用 `toBe`。由于 JavaScript 会对它们进行舍入，`0.1 + 0.2` 并不严格等于 `0.3`。要可靠地断言浮点数，请使用 [`toBeCloseTo`](#tobecloseto) 断言。

## toBeCloseTo

- **类型：** `(value: number, numDigits?: number) => Awaitable<void>`

使用 `toBeCloseTo` 来比较浮点数。可选的 `numDigits` 参数限制检查小数点 _后_ 的位数。`numDigits` 的默认值为 2。例如：

```ts
import { expect, test } from 'vitest'

test.fails('decimals are not equal in javascript', () => {
  expect(0.2 + 0.1).toBe(0.3) // 0.2 + 0.1 是 0.30000000000000004
})

test('decimals are rounded to 5 after the point', () => {
  // 0.2 + 0.1 是 0.30000 | "000000000004" 被移除
  expect(0.2 + 0.1).toBeCloseTo(0.3, 5)
  // 0.30000000000000004 中没有任何内容被移除
  expect(0.2 + 0.1).not.toBeCloseTo(0.3, 50)
})
```

## toBeDefined

- **类型：** `() => Awaitable<void>`

`toBeDefined` 断言值不等于 `undefined`。有用的用例是检查函数是否 _返回_ 了任何内容。

```ts
import { expect, test } from 'vitest'

function getApples() {
  return 3
}

test('function returned something', () => {
  expect(getApples()).toBeDefined()
})
```

## toBeUndefined

- **类型：** `() => Awaitable<void>`

与 `toBeDefined` 相反，`toBeUndefined` 断言值 _等于_ `undefined`。有用的用例是检查函数是否没有 _返回_ 任何内容。

```ts
import { expect, test } from 'vitest'

function getApplesFromStock(stock: string) {
  if (stock === 'Bill') {
    return 13
  }
}

test('mary doesn\'t have a stock', () => {
  expect(getApplesFromStock('Mary')).toBeUndefined()
})
```

## toBeTruthy

- **类型：** `() => Awaitable<void>`

`toBeTruthy` 断言值转换为布尔值时为 true。如果你不关心值，只想知道它可以转换为 `true`，这很有用。

例如，有了这段代码，你不关心 `stocks.getInfo` 的返回值——它可能是一个复杂的对象、一个字符串或其他任何东西。代码仍然可以工作。

```ts
import { Stocks } from './stocks.js'

const stocks = new Stocks()
stocks.sync('Bill')
if (stocks.getInfo('Bill')) {
  stocks.sell('apples', 'Bill')
}
```

所以如果你想测试 `stocks.getInfo` 将为 truthy，你可以写：

```ts
import { expect, test } from 'vitest'
import { Stocks } from './stocks.js'

const stocks = new Stocks()

test('if we know Bill stock, sell apples to him', () => {
  stocks.sync('Bill')
  expect(stocks.getInfo('Bill')).toBeTruthy()
})
```

JavaScript 中的所有内容都是 truthy，除了 `false`、`null`、`undefined`、`NaN`、`0`、`-0`、`0n`、`""` 和 `document.all`。

## toBeFalsy

- **类型：** `() => Awaitable<void>`

`toBeFalsy` 断言值转换为布尔值时为 false。如果你不关心值，只想知道它是否可以转换为 `false`，这很有用。

例如，有了这段代码，你不关心 `stocks.stockFailed` 的返回值——它可能返回任何 falsy 值，但代码仍然可以工作。

```ts
import { Stocks } from './stocks.js'

const stocks = new Stocks()
stocks.sync('Bill')
if (!stocks.stockFailed('Bill')) {
  stocks.sell('apples', 'Bill')
}
```

所以如果你想测试 `stocks.stockFailed` 将为 falsy，你可以写：

```ts
import { expect, test } from 'vitest'
import { Stocks } from './stocks.js'

const stocks = new Stocks()

test('if Bill stock hasn\'t failed, sell apples to him', () => {
  stocks.syncStocks('Bill')
  expect(stocks.stockFailed('Bill')).toBeFalsy()
})
```

JavaScript 中的所有内容都是 truthy，除了 `false`、`null`、`undefined`、`NaN`、`0`、`-0`、`0n`、`""` 和 `document.all`。

## toBeNull

- **类型：** `() => Awaitable<void>`

`toBeNull` 简单地断言某物是否为 `null`。`.toBe(null)` 的别名。

```ts
import { expect, test } from 'vitest'

function apples() {
  return null
}

test('we don\'t have apples', () => {
  expect(apples()).toBeNull()
})
```

## toBeNullable

- **类型：** `() => Awaitable<void>`

`toBeNullable` 简单地断言某物是否可空（`null` 或 `undefined`）。

```ts
import { expect, test } from 'vitest'

function apples() {
  return null
}

function bananas() {
  return undefined
}

test('we don\'t have apples', () => {
  expect(apples()).toBeNullable()
})

test('we don\'t have bananas', () => {
  expect(bananas()).toBeNullable()
})
```

## toBeNaN

- **类型：** `() => Awaitable<void>`

`toBeNaN` 简单地断言某物是否为 `NaN`。`.toBe(NaN)` 的别名。

```ts
import { expect, test } from 'vitest'

let i = 0

function getApplesCount() {
  i++
  return i > 1 ? Number.NaN : i
}

test('getApplesCount has some unusual side effects...', () => {
  expect(getApplesCount()).not.toBeNaN()
  expect(getApplesCount()).toBeNaN()
})
```

## toBeOneOf

- **类型：** `(sample: Array<any> | Set<any>) => any`

`toBeOneOf` 断言一个值是否匹配提供的数组或集合中的任何值。

::: warning 实验性
提供 `Set` 是一个实验性功能，可能会在未来的版本中更改。
:::

```ts
import { expect, test } from 'vitest'

test('fruit is one of the allowed values', () => {
  expect(fruit).toBeOneOf(['apple', 'banana', 'orange'])
})
```

非对称匹配器在测试可选属性（可能是 `null` 或 `undefined`）时特别有用：

```ts
test('optional properties can be null or undefined', () => {
  const user = {
    firstName: 'John',
    middleName: undefined,
    lastName: 'Doe'
  }

  expect(user).toEqual({
    firstName: expect.any(String),
    middleName: expect.toBeOneOf([expect.any(String), undefined]),
    lastName: expect.any(String),
  })
})
```

:::tip
你可以在此匹配器中使用 `expect.not` 以确保值不匹配任何提供的选项。
:::

## toBeTypeOf

- **类型：** `(c: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined') => Awaitable<void>`

`toBeTypeOf` 断言实际值是否为接收到的类型。

```ts
import { expect, test } from 'vitest'

const actual = 'stock'

test('stock is type of string', () => {
  expect(actual).toBeTypeOf('string')
})
```

:::warning
`toBeTypeOf` 在底层使用原生的 `typeof` 运算符及其所有怪癖，最值得注意的是值 `null` 的类型为 `object`。

```ts
test('toBeTypeOf cannot check for null or array', () => {
  expect(null).toBeTypeOf('object')
  expect([]).toBeTypeOf('object')
})
```
:::

## toBeInstanceOf

- **类型：** `(c: any) => Awaitable<void>`

`toBeInstanceOf` 断言实际值是否为接收到的类的实例。

```ts
import { expect, test } from 'vitest'
import { Stocks } from './stocks.js'

const stocks = new Stocks()

test('stocks are instance of Stocks', () => {
  expect(stocks).toBeInstanceOf(Stocks)
})
```

## toBeGreaterThan

- **类型：** `(n: number | bigint) => Awaitable<void>`

`toBeGreaterThan` 断言实际值是否大于接收到的值。相等的值将使测试失败。

```ts
import { expect, test } from 'vitest'
import { getApples } from './stocks.js'

test('have more then 10 apples', () => {
  expect(getApples()).toBeGreaterThan(10)
})
```

## toBeGreaterThanOrEqual

- **类型：** `(n: number | bigint) => Awaitable<void>`

`toBeGreaterThanOrEqual` 断言实际值是否大于或等于接收到的值。

```ts
import { expect, test } from 'vitest'
import { getApples } from './stocks.js'

test('有 11 个或更多苹果', () => {
  expect(getApples()).toBeGreaterThanOrEqual(11)
})
```

## toBeLessThan

- **类型：** `(n: number | bigint) => Awaitable<void>`

`toBeLessThan` 断言实际值是否小于接收到的值。相等的值将使测试失败。

```ts
import { expect, test } from 'vitest'
import { getApples } from './stocks.js'

test('少于 20 个苹果', () => {
  expect(getApples()).toBeLessThan(20)
})
```

## toBeLessThanOrEqual

- **类型：** `(n: number | bigint) => Awaitable<void>`

`toBeLessThanOrEqual` 断言实际值是否小于或等于接收到的值。

```ts
import { expect, test } from 'vitest'
import { getApples } from './stocks.js'

test('有 11 个或更少苹果', () => {
  expect(getApples()).toBeLessThanOrEqual(11)
})
```

## toEqual

- **类型：** `(received: any) => Awaitable<void>`

`toEqual` 断言实际值是否等于接收到的值，或者如果是对象则具有相同的结构（递归比较它们）。你可以在本例中看到 `toEqual` 和 [`toBe`](#tobe) 之间的区别：

```ts
import { expect, test } from 'vitest'

const stockBill = {
  type: 'apples',
  count: 13,
}

const stockMary = {
  type: 'apples',
  count: 13,
}

test('库存具有相同的属性', () => {
  expect(stockBill).toEqual(stockMary)
})

test('库存并不相同', () => {
  expect(stockBill).not.toBe(stockMary)
})
```

:::warning
对于 `Error` 对象，不可枚举的属性如 `name`、`message`、`cause` 和 `AggregateError.errors` 也会被比较。对于 `Error.cause`，比较是非对称进行的：

```ts
// 成功
expect(new Error('hi', { cause: 'x' })).toEqual(new Error('hi'))

// 失败
expect(new Error('hi')).toEqual(new Error('hi', { cause: 'x' }))
```

要测试是否抛出了某些内容，请使用 [`toThrow`](#tothrow) 断言。
:::

## toStrictEqual

- **类型：** `(received: any) => Awaitable<void>`

`toStrictEqual` 断言实际值是否等于接收到的值，或者如果是对象则具有相同的结构（递归比较它们），并且类型相同。

与 [`.toEqual`](#toequal) 的区别：

-  检查具有 `undefined` 属性的键。例如，使用 `.toStrictEqual` 时，`{a: undefined, b: 2}` 不匹配 `{b: 2}`。
-  检查数组稀疏性。例如，使用 `.toStrictEqual` 时，`[, 1]` 不匹配 `[undefined, 1]`。
-  检查对象类型是否相等。例如，具有字段 `a` 和 `b` 的类实例不等于具有字段 `a` 和 `b` 的字面量对象。

```ts
import { expect, test } from 'vitest'

class Stock {
  constructor(type) {
    this.type = type
  }
}

test('结构相同，但语义不同', () => {
  expect(new Stock('apples')).toEqual({ type: 'apples' })
  expect(new Stock('apples')).not.toStrictEqual({ type: 'apples' })
})
```

## toContain

- **类型：** `(received: string) => Awaitable<void>`

`toContain` 断言实际值是否在数组中。`toContain` 还可以检查一个字符串是否是另一个字符串的子串。如果你在类浏览器环境中运行测试，此断言还可以检查类是否包含在 `classList` 中，或一个元素是否在另一个元素内部。

```ts
import { expect, test } from 'vitest'
import { getAllFruits } from './stocks.js'

test('水果列表包含橙子', () => {
  expect(getAllFruits()).toContain('orange')
})

test('pineapple 包含 apple', () => {
  expect('pineapple').toContain('apple')
})

test('元素包含一个类并且被包含在内', () => {
  const element = document.querySelector('#el')
  // 元素有一个类
  expect(element.classList).toContain('flex')
  // 元素位于另一个元素内部
  expect(document.querySelector('#wrapper')).toContain(element)
})
```

## toContainEqual

- **类型：** `(received: any) => Awaitable<void>`

`toContainEqual` 断言具有特定结构和值的项是否包含在数组中。
它对每个元素内部的工作方式类似于 [`toEqual`](#toequal)。

```ts
import { expect, test } from 'vitest'
import { getFruitStock } from './stocks.js'

test('苹果可用', () => {
  expect(getFruitStock()).toContainEqual({ fruit: 'apple', count: 5 })
})
```

## toHaveLength

- **类型：** `(received: number) => Awaitable<void>`

`toHaveLength` 断言对象是否具有 `.length` 属性且其设置为特定数值。

```ts
import { expect, test } from 'vitest'

test('toHaveLength', () => {
  expect('abc').toHaveLength(3)
  expect([1, 2, 3]).toHaveLength(3)

  expect('').not.toHaveLength(3) // 没有 .length 为 3
  expect({ length: 3 }).toHaveLength(3)
})
```

## toHaveProperty

- **类型：** `(key: any, received?: any) => Awaitable<void>`

`toHaveProperty` 断言对象是否存在提供的引用键处的属性。

你可以提供一个可选的值参数（也称为深度相等），类似于 `toEqual` 匹配器，以比较接收到的属性值。

```ts
import { expect, test } from 'vitest'

const invoice = {
  'isActive': true,
  'P.O': '12345',
  'customer': {
    first_name: 'John',
    last_name: 'Doe',
    location: 'China',
  },
  'total_amount': 5000,
  'items': [
    {
      type: 'apples',
      quantity: 10,
    },
    {
      type: 'oranges',
      quantity: 5,
    },
  ],
}

test('John Doe 发票', () => {
  expect(invoice).toHaveProperty('isActive') // 断言键存在
  expect(invoice).toHaveProperty('total_amount', 5000) // 断言键存在且值相等

  expect(invoice).not.toHaveProperty('account') // 断言此键不存在

  // 使用点表示法进行深度引用
  expect(invoice).toHaveProperty('customer.first_name')
  expect(invoice).toHaveProperty('customer.last_name', 'Doe')
  expect(invoice).not.toHaveProperty('customer.location', 'India')

  // 使用包含键的数组进行深度引用
  expect(invoice).toHaveProperty('items[0].type', 'apples')
  expect(invoice).toHaveProperty('items.0.type', 'apples') // 点表示法也有效

  // 使用包含键路径的数组进行深度引用
  expect(invoice).toHaveProperty(['items', 0, 'type'], 'apples')
  expect(invoice).toHaveProperty(['items', '0', 'type'], 'apples') // 字符串表示法也有效

  // 将键包装在数组中以避免键被解析为深度引用
  expect(invoice).toHaveProperty(['P.O'], '12345')

  // 对象属性的深度相等
  expect(invoice).toHaveProperty('items[0]', { type: 'apples', quantity: 10 })
})
```

## toMatch

- **类型:** `(received: string | regexp) => Awaitable<void>`

`toMatch` 断言字符串是否匹配正则表达式或字符串。

```ts
import { expect, test } from 'vitest'

test('顶部水果', () => {
  expect('top fruits include apple, orange and grape').toMatch(/apple/)
  expect('applefruits').toMatch('fruit') // toMatch 也接受字符串
})
```

## toMatchObject

- **类型:** `(received: object | array) => Awaitable<void>`

`toMatchObject` 断言对象是否匹配对象的属性子集。

你也可以传递对象数组。如果你想检查两个数组的元素数量和顺序是否匹配（而不是像 `arrayContaining` 那样允许接收数组中存在额外元素），这很有用。

```ts
import { expect, test } from 'vitest'

const johnInvoice = {
  isActive: true,
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    location: 'China',
  },
  total_amount: 5000,
  items: [
    {
      type: 'apples',
      quantity: 10,
    },
    {
      type: 'oranges',
      quantity: 5,
    },
  ],
}

const johnDetails = {
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    location: 'China',
  },
}

test('发票包含 John 的个人信息', () => {
  expect(johnInvoice).toMatchObject(johnDetails)
})

test('元素数量必须完全匹配', () => {
  // 断言对象数组匹配
  expect([{ foo: 'bar' }, { baz: 1 }]).toMatchObject([
    { foo: 'bar' },
    { baz: 1 },
  ])
})
```

## toThrow

- **类型:** `(expected?: any) => Awaitable<void>`

- **别名:** `toThrowError` <Deprecated />

`toThrow` 断言函数在被调用时是否抛出错误。

你可以提供一个可选参数来测试是否抛出了特定错误：

- `RegExp`：错误消息匹配模式
- `string`：错误消息包含子字符串
- 任何其他值：使用深度相等性比较抛出的值（类似于 `toEqual`）

:::tip
你必须将代码包装在函数中，否则错误将被捕获不到，测试将失败。

这不适用于异步调用，因为 [rejects](#rejects) 会正确地解包 promise：
```ts
test('expect rejects toThrow', async ({ expect }) => {
  const promise = Promise.reject(new Error('Test'))
  await expect(promise).rejects.toThrow()
})
```
:::

例如，如果我们想测试 `getFruitStock('pineapples')` 抛出错误，我们可以写：

```ts
import { expect, test } from 'vitest'

function getFruitStock(type: string) {
  if (type === 'pineapples') {
    throw new Error('Pineapples are not in stock')
  }

  // 做一些其他事情
}

test('菠萝时抛出错误', () => {
  // 测试错误消息在某处包含 "stock"：这些是等效的
  expect(() => getFruitStock('pineapples')).toThrow(/stock/)
  expect(() => getFruitStock('pineapples')).toThrow('stock')

  // 测试确切的错误消息
  expect(() => getFruitStock('pineapples')).toThrow(
    /^Pineapples are not in stock$/,
  )

  expect(() => getFruitStock('pineapples')).toThrow(
    new Error('Pineapples are not in stock'),
  )
  expect(() => getFruitStock('pineapples')).toThrow(expect.objectContaining({
    message: 'Pineapples are not in stock',
  }))
})
```

:::tip
要测试异步函数，请与 [rejects](#rejects) 结合使用。

```js
function getAsyncFruitStock() {
  return Promise.reject(new Error('empty'))
}

test('菠萝时抛出错误', async () => {
  await expect(() => getAsyncFruitStock()).rejects.toThrow('empty')
})
```
:::

:::tip
你也可以测试抛出的非 Error 值：

```ts
test('抛出非 Error 值', () => {
  expect(() => { throw 42 }).toThrow(42)
  expect(() => { throw { message: 'error' } }).toThrow({ message: 'error' })
})
```
:::

:::warning 使用假定时器时的未处理拒绝
当使用假定时器时，在 `vi.advanceTimersByTimeAsync` 调用期间拒绝的异步函数将触发 [未处理拒绝](https://nodejs.org/api/process.html#event-unhandledrejection) — 即使你稍后使用 `.rejects.toThrow()` 断言它。这是因为错误在 `expect` 链有机会捕获它之前就被抛出了。

```ts
async function foo() {
  await new Promise(resolve => setTimeout(resolve, 100))
  throw new Error('boom')
}

test('rejects', async () => {
  const result = foo()

  await vi.advanceTimersByTimeAsync(100)

  // 断言通过，但错误在 advanceTimersByTimeAsync 期间已经“未处理”
  await expect(result).rejects.toThrow()
})
```

为了避免这种情况，建议使用 [`vi.setTimerTickMode('nextTimerAsync')`](/api/vi#vi-settimertickmode)，这样定时器会在 promise 结算时自动触发，无需手动推进：

```ts
beforeEach(() => {
  vi.useFakeTimers()
  vi.setTimerTickMode('nextTimerAsync')
})

test('rejects', async () => {
  // 不需要 advanceTimersByTimeAsync — 错误被 rejects.toThrow() 捕获
  await expect(foo()).rejects.toThrow('boom')
})
```

或者，在推进定时器之前设置 `.rejects.toThrow()` 断言，以便立即处理拒绝：

```ts
test('rejects', async () => {
  const result = foo()
  const assertion = expect(result).rejects.toThrow('boom')

  await vi.advanceTimersByTimeAsync(100)
  await assertion
})
```
:::

## toMatchSnapshot

- **类型:** `<T>(shape?: Partial<T> | string, hint?: string) => void`

这确保值匹配最近的快照。

你可以提供一个可选的 `hint` 字符串参数，它会附加到测试名称后面。虽然 Vitest 总是在快照名称末尾附加一个数字，但简短的描述性提示可能比数字更有用，以便在单个 it 或 test 块中区分多个快照。Vitest 在相应的 `.snap` 文件中按名称对快照进行排序。

:::tip
  当快照不匹配导致测试失败时，如果预期不匹配，你可以按 `u` 键更新快照一次。或者你可以传递 `-u` 或 `--update` CLI 选项让 Vitest 始终更新测试。
:::

```ts
import { expect, test } from 'vitest'

test('匹配快照', () => {
  const data = { foo: new Set(['bar', 'snapshot']) }
  expect(data).toMatchSnapshot()
})
```

如果你只测试对象的形状，而不需要 100% 兼容，你也可以提供对象的形状：

```ts
import { expect, test } from 'vitest'

test('匹配快照', () => {
  const data = { foo: new Set(['bar', 'snapshot']) }
  expect(data).toMatchSnapshot({ foo: expect.any(Set) })
})
```

## toMatchInlineSnapshot

- **类型:** `<T>(shape?: Partial<T> | string, snapshot?: string, hint?: string) => void`

这确保值匹配最近的快照。

Vitest 会在测试文件中向 matcher 添加和更新 inlineSnapshot 字符串参数（而不是外部 `.snap` 文件）。

```ts
import { expect, test } from 'vitest'

test('matches inline snapshot', () => {
  const data = { foo: new Set(['bar', 'snapshot']) }
  // 更新快照时 Vitest 将更新以下内容
  expect(data).toMatchInlineSnapshot(`
    {
      "foo": Set {
        "bar",
        "snapshot",
      },
    }
  `)
})
```

如果你只测试对象的形状，而不需要 100% 兼容，你也可以提供对象的形状：

```ts
import { expect, test } from 'vitest'

test('matches snapshot', () => {
  const data = { foo: new Set(['bar', 'snapshot']) }
  expect(data).toMatchInlineSnapshot(
    { foo: expect.any(Set) },
    `
    {
      "foo": Any<Set>,
    }
  `
  )
})
```

## toMatchFileSnapshot {#tomatchfilesnapshot}

- **类型:** `<T>(filepath: string, hint?: string) => Promise<void>`

比较或更新快照与显式指定的文件内容（而不是 `.snap` 文件）。

```ts
import { expect, it } from 'vitest'

it('render basic', async () => {
  const result = renderHTML(h('div', { class: 'foo' }))
  await expect(result).toMatchFileSnapshot('./test/basic.output.html')
})
```

请注意，由于文件系统操作是异步的，你需要对 `toMatchFileSnapshot()` 使用 `await`。如果未使用 `await`，Vitest 会将其视为 `expect.soft`，这意味着即使快照不匹配，语句后的代码也会继续运行。测试结束后，Vitest 将检查快照，如果不匹配则失败。

## toThrowErrorMatchingSnapshot

- **类型:** `(hint?: string) => void`

与 [`toMatchSnapshot`](#tomatchsnapshot) 相同，但期望值与 [`toThrow`](#tothrow) 相同。

## toThrowErrorMatchingInlineSnapshot

- **类型:** `(snapshot?: string, hint?: string) => void`

与 [`toMatchInlineSnapshot`](#toMatchInlineSnapshot) 相同，但期望值与 [`toThrow`](#tothrow) 相同。

## toMatchAriaSnapshot <Version type="experimental">4.1.4</Version> <Experimental /> {#tomatcharisnapshot}

- **Type:** `() => void`

捕获 DOM 元素的可访问性树，并生成快照文件或将其与已存储的快照进行比较。更多详情请参见 [ARIA Snapshots 指南](/guide/browser/aria-snapshots)。

```ts
import { expect, test } from 'vitest'

test('navigation accessibility', () => {
  document.body.innerHTML = `
    <nav aria-label="Actions">
      <button>Save</button>
      <button>Cancel</button>
    </nav>
  `
  expect(document.querySelector('nav')).toMatchAriaSnapshot()
})
```

## toMatchAriaInlineSnapshot <Version type="experimental">4.1.4</Version> <Experimental /> {#tomatchariainlinesnapshot}

- **Type:** `(snapshot?: string) => void`

与 [`toMatchAriaSnapshot`](#tomatcharisnapshot) 相同，但会将快照以内联形式存储在测试文件中。更多详情请参见 [ARIA Snapshots 指南](/guide/browser/aria-snapshots)。

```ts
import { expect, test } from 'vitest'

test('user profile', () => {
  expect(document.body).toMatchAriaInlineSnapshot(`
    - heading "Dashboard" [level=1]
    - button /User \\d+/: Profile
  `)
})
```

## toHaveBeenCalled

- **类型:** `() => Awaitable<void>`

此断言对于测试函数是否被调用很有用。需要将间谍函数传递给 `expect`。

```ts
import { expect, test, vi } from 'vitest'

const market = {
  buy(subject: string, amount: number) {
    // ...
  },
}

test('spy function', () => {
  const buySpy = vi.spyOn(market, 'buy')

  expect(buySpy).not.toHaveBeenCalled()

  market.buy('apples', 10)

  expect(buySpy).toHaveBeenCalled()
})
```

## toHaveBeenCalledTimes

- **Type:** `(amount: number) => Awaitable<void>`

此断言检查函数是否被调用了特定次数。需要将间谍函数传递给 `expect`。

```ts
import { expect, test, vi } from 'vitest'

const market = {
  buy(subject: string, amount: number) {
    // ...
  },
}

test('spy function called two times', () => {
  const buySpy = vi.spyOn(market, 'buy')

  market.buy('apples', 10)
  market.buy('apples', 20)

  expect(buySpy).toHaveBeenCalledTimes(2)
})
```

## toHaveBeenCalledWith

- **Type:** `(...args: any[]) => Awaitable<void>`

此断言检查函数是否至少使用特定参数被调用过一次。需要将间谍函数传递给 `expect`。

```ts
import { expect, test, vi } from 'vitest'

const market = {
  buy(subject: string, amount: number) {
    // ...
  },
}

test('spy function', () => {
  const buySpy = vi.spyOn(market, 'buy')

  market.buy('apples', 10)
  market.buy('apples', 20)

  expect(buySpy).toHaveBeenCalledWith('apples', 10)
  expect(buySpy).toHaveBeenCalledWith('apples', 20)
})
```

## toHaveBeenCalledBefore

- **Type:** `(mock: MockInstance, failIfNoFirstInvocation?: boolean) => Awaitable<void>`

此断言检查一个 `Mock` 是否在另一个 `Mock` 之前被调用。

```ts
test('calls mock1 before mock2', () => {
  const mock1 = vi.fn()
  const mock2 = vi.fn()

  mock1()
  mock2()
  mock1()

  expect(mock1).toHaveBeenCalledBefore(mock2)
})
```

## toHaveBeenCalledAfter

- **Type:** `(mock: MockInstance, failIfNoFirstInvocation?: boolean) => Awaitable<void>`

此断言检查一个 `Mock` 是否在另一个 `Mock` 之后被调用。

```ts
test('calls mock1 after mock2', () => {
  const mock1 = vi.fn()
  const mock2 = vi.fn()

  mock2()
  mock1()
  mock2()

  expect(mock1).toHaveBeenCalledAfter(mock2)
})
```

## toHaveBeenCalledExactlyOnceWith

- **Type:** `(...args: any[]) => Awaitable<void>`

此断言检查一个函数是否恰好被调用了一次且带有特定参数。需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

const market = {
  buy(subject: string, amount: number) {
    // ...
  },
}

test('spy function', () => {
  const buySpy = vi.spyOn(market, 'buy')

  market.buy('apples', 10)

  expect(buySpy).toHaveBeenCalledExactlyOnceWith('apples', 10)
})
```

## toHaveBeenLastCalledWith

- **Type:** `(...args: any[]) => Awaitable<void>`

此断言检查一个函数在其最后一次调用时是否带有特定参数。需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

const market = {
  buy(subject: string, amount: number) {
    // ...
  },
}

test('spy function', () => {
  const buySpy = vi.spyOn(market, 'buy')

  market.buy('apples', 10)
  market.buy('apples', 20)

  expect(buySpy).not.toHaveBeenLastCalledWith('apples', 10)
  expect(buySpy).toHaveBeenLastCalledWith('apples', 20)
})
```

## toHaveBeenNthCalledWith

- **Type:** `(time: number, ...args: any[]) => Awaitable<void>`

此断言检查一个函数在第几次调用时是否带有特定参数。计数从 1 开始。因此，要检查第二次条目，你应该写 `.toHaveBeenNthCalledWith(2, ...)`。

需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

const market = {
  buy(subject: string, amount: number) {
    // ...
  },
}

test('first call of spy function called with right params', () => {
  const buySpy = vi.spyOn(market, 'buy')

  market.buy('apples', 10)
  market.buy('apples', 20)

  expect(buySpy).toHaveBeenNthCalledWith(1, 'apples', 10)
})
```

## toHaveReturned

- **Type:** `() => Awaitable<void>`

此断言检查一个函数是否至少成功返回过一次值（即没有抛出错误）。需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

function getApplesPrice(amount: number) {
  const PRICE = 10
  return amount * PRICE
}

test('spy function returned a value', () => {
  const getPriceSpy = vi.fn(getApplesPrice)

  const price = getPriceSpy(10)

  expect(price).toBe(100)
  expect(getPriceSpy).toHaveReturned()
})
```

## toHaveReturnedTimes

- **Type:** `(amount: number) => Awaitable<void>`

此断言检查一个函数是否成功返回了确切次数的值（即没有抛出错误）。需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

test('spy function returns a value two times', () => {
  const sell = vi.fn((product: string) => ({ product }))

  sell('apples')
  sell('bananas')

  expect(sell).toHaveReturnedTimes(2)
})
```

## toHaveReturnedWith

- **Type:** `(returnValue: any) => Awaitable<void>`

你可以调用此断言来检查一个函数是否至少成功返回过一次带有特定参数的值。需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

test('spy function returns a product', () => {
  const sell = vi.fn((product: string) => ({ product }))

  sell('apples')

  expect(sell).toHaveReturnedWith({ product: 'apples' })
})
```

## toHaveLastReturnedWith

- **Type:** `(returnValue: any) => Awaitable<void>`

你可以调用此断言来检查一个函数在最后一次被调用时是否成功返回了特定值。需要向 `expect` 传递一个 spy 函数。

```ts
import { expect, test, vi } from 'vitest'

test('spy function returns bananas on a last call', () => {
  const sell = vi.fn((product: string) => ({ product }))

  sell('apples')
  sell('bananas')

  expect(sell).toHaveLastReturnedWith({ product: 'bananas' })
})
```

## toHaveNthReturnedWith

- **Type:** `(time: number, returnValue: any) => Awaitable<void>`

你可以调用此断言来检查一个函数在某次调用时是否成功返回了带有特定参数的值。需要向 `expect` 传递一个 spy 函数。

计数从 1 开始。因此，要检查第二次条目，你应该写 `.toHaveNthReturnedWith(2, ...)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy function returns bananas on second call', () => {
  const sell = vi.fn((product: string) => ({ product }))

  sell('apples')
  sell('bananas')

  expect(sell).toHaveNthReturnedWith(2, { product: 'bananas' })
})
```

## toHaveResolved

- **Type:** `() => Awaitable<void>`

此断言检查一个函数是否至少成功解析过一个值（即没有发生拒绝）。需要向 `expect` 传递一个 spy 函数。

如果函数返回了一个 promise，但尚未解析，这将失败。

```ts
import { expect, test, vi } from 'vitest'
import db from './db/apples.js'

async function getApplesPrice(amount: number) {
  return amount * await db.get('price')
}

test('spy function resolved a value', async () => {
  const getPriceSpy = vi.fn(getApplesPrice)

  const price = await getPriceSpy(10)

  expect(price).toBe(100)
  expect(getPriceSpy).toHaveResolved()
})
```

## toHaveResolvedTimes

- **Type:** `(amount: number) => Awaitable<void>`

此断言检查一个函数是否成功解析了确切次数的值（即没有发生拒绝）。需要向 `expect` 传递一个 spy 函数。

这只会计数已解析的 promise。如果函数返回了一个 promise，但尚未解析，它将不会被计数。

```ts
import { expect, test, vi } from 'vitest'

test('spy function resolved a value two times', async () => {
  const sell = vi.fn((product: string) => Promise.resolve({ product }))

  await sell('apples')
  await sell('bananas')

  expect(sell).toHaveResolvedTimes(2)
})
```

## toHaveResolvedWith

- **Type:** `(returnValue: any) => Awaitable<void>`

你可以调用此断言来检查一个函数是否至少成功解析过某个特定值。需要向 `expect` 传递一个 spy 函数。

如果函数返回了一个 promise，但尚未解析，这将失败。

```ts
import { expect, test, vi } from 'vitest'

test('spy function resolved a product', async () => {
  const sell = vi.fn((product: string) => Promise.resolve({ product }))

  await sell('apples')

  expect(sell).toHaveResolvedWith({ product: 'apples' })
})
```

## toHaveLastResolvedWith

- **Type:** `(returnValue: any) => Awaitable<void>`

你可以调用此断言来检查一个函数在最后一次被调用时是否成功解析了某个特定值。需要向 `expect` 传递一个 spy 函数。

如果函数返回了一个 promise，但尚未解析，这将失败。

```ts
import { expect, test, vi } from 'vitest'

test('spy function resolves bananas on a last call', async () => {
  const sell = vi.fn((product: string) => Promise.resolve({ product }))

  await sell('apples')
  await sell('bananas')

  expect(sell).toHaveLastResolvedWith({ product: 'bananas' })
})

## toHaveNthResolvedWith

- **Type:** `(time: number, returnValue: any) => Awaitable<void>`

你可以调用此断言来检查一个函数在特定调用时是否成功解析了某个特定值。需要向 `expect` 传递一个 spy 函数。

如果函数返回了一个 promise，但尚未解析，这将失败。

计数从 1 开始。因此，要检查第二次条目，你应该写 `.toHaveNthResolvedWith(2, ...)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy function returns bananas on second call', async () => {
  const sell = vi.fn((product: string) => Promise.resolve({ product }))

  await sell('apples')
  await sell('bananas')

  expect(sell).toHaveNthResolvedWith(2, { product: 'bananas' })
})
```

## called <Version>4.1.0</Version> {#called}

- **类型:** `Assertion`（属性，而非方法）

Chai 风格的断言，检查 spy 是否至少被调用过一次。这等同于 `toHaveBeenCalled()`。

::: tip
这是一个属性断言，遵循 sinon-chai 约定。访问时不要加括号：`expect(spy).to.have.been.called`
:::

```ts
import { expect, test, vi } from 'vitest'

test('spy was called', () => {
  const spy = vi.fn()

  spy()

  expect(spy).to.have.been.called
  expect(spy).to.not.have.been.called // 否定
})
```

## callCount <Version>4.1.0</Version> {#callcount}

- **类型:** `(count: number) => void`

Chai 风格的断言，检查 spy 是否被调用了特定次数。这等同于 `toHaveBeenCalledTimes(count)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy call count', () => {
  const spy = vi.fn()

  spy()
  spy()
  spy()

  expect(spy).to.have.callCount(3)
})
```

## calledWith <Version>4.1.0</Version> {#calledwith}

- **类型:** `(...args: any[]) => void`

Chai 风格的断言，检查 spy 是否至少有一次使用特定参数被调用。这等同于 `toHaveBeenCalledWith(...args)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy called with arguments', () => {
  const spy = vi.fn()

  spy('apple', 10)
  spy('banana', 20)

  expect(spy).to.have.been.calledWith('apple', 10)
  expect(spy).to.have.been.calledWith('banana', 20)
})
```

## calledOnce <Version>4.1.0</Version> {#calledonce}

- **Type:** `Assertion`（属性，而非方法）

检查 spy 是否恰好被调用一次的 Chai 风格断言。这等同于 `toHaveBeenCalledOnce()`。

::: tip
这是遵循 sinon-chai 约定的属性断言。访问时不要加括号：`expect(spy).to.have.been.calledOnce`
:::

```ts
import { expect, test, vi } from 'vitest'

test('spy called once', () => {
  const spy = vi.fn()

  spy()

  expect(spy).to.have.been.calledOnce
})
```

## calledOnceWith <Version>4.1.0</Version> {#calledoncewith}

- **Type:** `(...args: any[]) => void`

检查 spy 是否恰好使用特定参数被调用一次的 Chai 风格断言。这等同于 `toHaveBeenCalledExactlyOnceWith(...args)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy called once with arguments', () => {
  const spy = vi.fn()

  spy('apple', 10)

  expect(spy).to.have.been.calledOnceWith('apple', 10)
})
```

## calledTwice <Version>4.1.0</Version> {#calledtwice}

- **Type:** `Assertion`（属性，而非方法）

检查 spy 是否恰好被调用两次的 Chai 风格断言。这等同于 `toHaveBeenCalledTimes(2)`。

::: tip
这是遵循 sinon-chai 约定的属性断言。访问时不要加括号：`expect(spy).to.have.been.calledTwice`
:::

```ts
import { expect, test, vi } from 'vitest'

test('spy called twice', () => {
  const spy = vi.fn()

  spy()
  spy()

  expect(spy).to.have.been.calledTwice
})
```

## calledThrice <Version>4.1.0</Version> {#calledthrice}

- **Type:** `Assertion`（属性，而非方法）

检查 spy 是否恰好被调用三次的 Chai 风格断言。这等同于 `toHaveBeenCalledTimes(3)`。

::: tip
这是遵循 sinon-chai 约定的属性断言。访问时不要加括号：`expect(spy).to.have.been.calledThrice`
:::

```ts
import { expect, test, vi } from 'vitest'

test('spy called thrice', () => {
  const spy = vi.fn()

  spy()
  spy()
  spy()

  expect(spy).to.have.been.calledThrice
})
```

## lastCalledWith

- **Type:** `(...args: any[]) => void`

检查对 spy 的最后一次调用是否使用特定参数的 Chai 风格断言。这等同于 `toHaveBeenLastCalledWith(...args)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy last called with', () => {
  const spy = vi.fn()

  spy('apple', 10)
  spy('banana', 20)

  expect(spy).to.have.been.lastCalledWith('banana', 20)
})
```

## nthCalledWith

- **Type:** `(n: number, ...args: any[]) => void`

检查对 spy 的第 n 次调用是否使用特定参数的 Chai 风格断言。这等同于 `toHaveBeenNthCalledWith(n, ...args)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy nth called with', () => {
  const spy = vi.fn()

  spy('apple', 10)
  spy('banana', 20)
  spy('cherry', 30)

  expect(spy).to.have.been.nthCalledWith(2, 'banana', 20)
})
```

## returned <Version>4.1.0</Version> {#returned}

- **Type:** `(value: any) => void`

检查 spy 是否至少一次返回了特定值的 Chai 风格断言。这等同于 `toHaveReturnedWith(value)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy returned', () => {
  const spy = vi.fn(() => 'value')

  spy()

  expect(spy).to.have.returned('value')
})
```

## returnedWith <Version>4.1.0</Version> {#returnedwith}

- **Type:** `(value: any) => void`

检查 spy 是否至少一次返回了特定值的 Chai 风格断言。这等同于 `toHaveReturnedWith(value)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy returned with value', () => {
  const spy = vi.fn()
    .mockReturnValueOnce('apple')
    .mockReturnValueOnce('banana')

  spy()
  spy()

  expect(spy).to.have.returnedWith('apple')
  expect(spy).to.have.returnedWith('banana')
})
```

## returnedTimes <Version>4.1.0</Version> {#returnedtimes}

- **Type:** `(count: number) => void`

检查 spy 是否成功返回了特定次数的 Chai 风格断言。这等同于 `toHaveReturnedTimes(count)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy returned times', () => {
  const spy = vi.fn(() => 'result')

  spy()
  spy()
  spy()

  expect(spy).to.have.returnedTimes(3)
})
```

## lastReturnedWith

- **Type:** `(value: any) => void`

检查 spy 的最后一次返回值是否与预期值匹配的 Chai 风格断言。这等同于 `toHaveLastReturnedWith(value)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy last returned with', () => {
  const spy = vi.fn()
    .mockReturnValueOnce('apple')
    .mockReturnValueOnce('banana')

  spy()
  spy()

  expect(spy).to.have.lastReturnedWith('banana')
})
```

## nthReturnedWith

- **Type:** `(n: number, value: any) => void`

检查 spy 的第 n 次返回值是否与预期值匹配的 Chai 风格断言。这等同于 `toHaveNthReturnedWith(n, value)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy nth returned with', () => {
  const spy = vi.fn()
    .mockReturnValueOnce('apple')
    .mockReturnValueOnce('banana')
    .mockReturnValueOnce('cherry')

  spy()
  spy()
  spy()

  expect(spy).to.have.nthReturnedWith(2, 'banana')
})
```

## calledBefore <Version>4.1.0</Version> {#calledbefore}

- **Type:** `(mock: MockInstance, failIfNoFirstInvocation?: boolean) => void`

检查一个 spy 是否在另一个 spy 之前被调用的 Chai 风格断言。这等同于 `toHaveBeenCalledBefore(mock, failIfNoFirstInvocation)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy called before another', () => {
  const spy1 = vi.fn()
  const spy2 = vi.fn()

  spy1()
  spy2()

  expect(spy1).to.have.been.calledBefore(spy2)
})
```

## calledAfter <Version>4.1.0</Version> {#calledafter}

- **Type:** `(mock: MockInstance, failIfNoFirstInvocation?: boolean) => void`

检查一个 spy 是否在另一个 spy 之后被调用的 Chai 风格断言。这等同于 `toHaveBeenCalledAfter(mock, failIfNoFirstInvocation)`。

```ts
import { expect, test, vi } from 'vitest'

test('spy called after another', () => {
  const spy1 = vi.fn()
  const spy2 = vi.fn()

  spy1()
  spy2()

  expect(spy2).to.have.been.calledAfter(spy1)
})
```

::: tip 迁移指南
有关从 Mocha+Chai+Sinon 迁移到 Vitest 的完整指南，请参阅 [迁移指南](/guide/migration#mocha-chai-sinon)。
:::

## toSatisfy

- **Type:** `(predicate: (value: any) => boolean) => Awaitable<void>`

此断言检查值是否满足特定谓词。

```ts
import { describe, expect, it } from 'vitest'

const isOdd = (value: number) => value % 2 !== 0

describe('toSatisfy()', () => {
  it('pass with 0', () => {
    expect(1).toSatisfy(isOdd)
  })

  it('pass with negation', () => {
    expect(2).not.toSatisfy(isOdd)
  })
})
```

## resolves

- **Type:** `Promisify<Assertions>`

`resolves` 旨在减少断言异步代码时的样板代码。使用它从待处理的 promise 中解包值，并使用常规断言对其值进行断言。如果 promise 拒绝，断言将失败。

它返回相同的 `Assertions` 对象，但现在所有匹配器都返回 `Promise`，所以你需要 `await` 它。也适用于 `chai` 断言。

例如，如果你有一个函数发起 API 调用并返回一些数据，你可以使用此代码断言其返回值：

```ts
import { expect, test } from 'vitest'

async function buyApples() {
  return fetch('/buy/apples').then(r => r.json())
}

test('buyApples returns new stock id', async () => {
  // toEqual 现在返回一个 promise，所以你必须 await 它
  await expect(buyApples()).resolves.toEqual({ id: 1 }) // jest 风格 API
  await expect(buyApples()).resolves.to.equal({ id: 1 }) // chai 风格 API
})
```

:::warning
如果断言未被 await，那么你将会得到一个每次都会通过的假阳性测试。为了确保断言确实被调用，你可以使用 [`expect.assertions(number)`](#expect-assertions)。

自 Vitest 3 起，如果方法未被 await，Vitest 将在测试结束时显示警告。在 Vitest 4 中，如果断言未被 await，测试将被标记为“失败”。
:::

## rejects

- **Type:** `Promisify<Assertions>`

`rejects` 旨在减少断言异步代码时的样板代码。使用它解包 promise 被拒绝的原因，并使用常规断言对其值进行断言。如果 promise 成功解决，断言将失败。

它返回相同的 `Assertions` 对象，但现在所有匹配器都返回 `Promise`，所以你需要 `await` 它。也适用于 `chai` 断言。

例如，如果你有一个调用时会失败的函数，你可以使用此代码断言原因：

```ts
import { expect, test } from 'vitest'

async function buyApples(id) {
  if (!id) {
    throw new Error('no id')
  }
}

test('buyApples throws an error when no id provided', async () => {
  // toThrow 现在返回一个 promise，所以你必须 await 它
  await expect(buyApples()).rejects.toThrow('no id')
})
```

:::warning
如果断言未被 await，那么你将会得到一个每次都会通过的假阳性测试。为了确保断言确实被调用，你可以使用 [`expect.assertions(number)`](#expect-assertions)。

自 Vitest 3 起，如果方法未被 await，Vitest 将在测试结束时显示警告。在 Vitest 4 中，如果断言未被 await，测试将被标记为“失败”。
:::

## expect.assertions

- **Type:** `(count: number) => void`

在测试通过或失败后，验证测试期间是否调用了特定数量的断言。一个有用的用例是检查异步代码是否被调用。

例如，如果我们有一个异步调用两个匹配器的函数，我们可以断言它们确实被调用了。

```ts
import { expect, test } from 'vitest'

async function doAsync(...cbs) {
  await Promise.all(
    cbs.map((cb, index) => cb({ index })),
  )
}

test('all assertions are called', async () => {
  expect.assertions(2)
  function callback1(data) {
    expect(data).toBeTruthy()
  }
  function callback2(data) {
    expect(data).toBeTruthy()
  }

  await doAsync(callback1, callback2)
})
```
::: warning
当在异步并发测试中使用 `assertions` 时，必须使用本地 [测试上下文](/api/test-context) 中的 `expect` 以确保检测到正确的测试。
:::

## expect.hasAssertions

- **类型：** `() => void`

在测试通过或失败后，验证测试期间是否至少调用了一次断言。一个有用的用例是检查是否调用了异步代码。

例如，如果你有一段调用回调的代码，我们可以在回调内部进行断言，但如果不检查是否调用了断言，测试将始终通过。

```ts
import { expect, test } from 'vitest'
import { db } from './db.js'

const cbs = []

function onSelect(cb) {
  cbs.push(cb)
}

// 从数据库选择后，我们调用所有回调
function select(id) {
  return db.select({ id }).then((data) => {
    return Promise.all(
      cbs.map(cb => cb(data)),
    )
  })
}

test('callback was called', async () => {
  expect.hasAssertions()
  onSelect((data) => {
    // 应该在选择时调用
    expect(data).toBeTruthy()
  })
  // 如果不等待，测试将失败
  // 如果没有 expect.hasAssertions()，测试将通过
  await select(3)
})
```

## expect.unreachable

- **类型：** `(message?: string) => never`

此方法用于断言某行代码永远不应该被执行到。

例如，如果我们想测试 `build()` 因为接收到的目录没有 `src` 文件夹而抛出错误，并且还要单独处理每个错误，我们可以这样做：

```ts
import { expect, test } from 'vitest'

async function build(dir) {
  if (dir.includes('no-src')) {
    throw new Error(`${dir}/src 不存在`)
  }
}

const errorDirs = [
  'no-src-folder',
  // ...
]

test.each(errorDirs)('build 因 "%s" 失败', async (dir) => {
  try {
    await build(dir)
    expect.unreachable('不应通过 build')
  }
  catch (err: any) {
    expect(err).toBeInstanceOf(Error)
    expect(err.stack).toContain('build')

    switch (dir) {
      case 'no-src-folder':
        expect(err.message).toBe(`${dir}/src 不存在`)
        break
      default:
        // 穷尽所有错误测试
        expect.unreachable('所有错误测试都必须被处理')
        break
    }
  }
})
```

## expect.anything

- **类型：** `() => any`

此非对称匹配器匹配除 `null` 或 `undefined` 之外的任何内容。如果你只想确保某个属性存在且其值不是 `null` 或 `undefined`，这很有用。

```ts
import { expect, test } from 'vitest'

test('对象有 "apples" 键', () => {
  expect({ apples: 22 }).toEqual({ apples: expect.anything() })
})
```

## expect.any

- **类型：** `(constructor: unknown) => any`

此非对称匹配器在与相等性检查一起使用时，仅当值是指定构造函数的实例时才返回 `true`。如果你有一个每次生成的值，并且只想知道它是否存在且具有正确的类型，这很有用。

```ts
import { expect, test } from 'vitest'
import { generateId } from './generators.js'

test('"id" 是一个数字', () => {
  expect({ id: generateId() }).toEqual({ id: expect.any(Number) })
})
```

## expect.closeTo {#expect-closeto}

- **类型：** `(expected: any, precision?: number) => any`

`expect.closeTo` 在比较对象属性或数组项中的浮点数时很有用。如果你需要比较一个数字，请改用 `.toBeCloseTo`。

可选的 `precision` 参数限制了对小数点**后**要检查的位数。对于默认值 `2`，测试标准是 `Math.abs(expected - received) < 0.005`（即 `10 ** -2 / 2`）。

例如，此测试在精度为 5 位小数时通过：

```js
test('在对象属性中比较浮点数', () => {
  expect({
    title: '0.1 + 0.2',
    sum: 0.1 + 0.2,
  }).toEqual({
    title: '0.1 + 0.2',
    sum: expect.closeTo(0.3, 5),
  })
})
```

## expect.arrayContaining

- **类型：** `<T>(expected: T[]) => any`

当与相等性检查一起使用时，如果值是数组且包含指定项，此非对称匹配器将返回 `true`。

```ts
import { expect, test } from 'vitest'

test('篮子里包含 fuji', () => {
  const basket = {
    varieties: [
      'Empire',
      'Fuji',
      'Gala',
    ],
    count: 3
  }
  expect(basket).toEqual({
    count: 3,
    varieties: expect.arrayContaining(['Fuji'])
  })
})
```

:::tip
你可以在此匹配器中使用 `expect.not` 来否定预期值。
:::

## expect.objectContaining

- **类型：** `(expected: any) => any`

当与相等性检查一起使用时，如果值具有相似的形状，此非对称匹配器将返回 `true`。

```ts
import { expect, test } from 'vitest'

test('篮子里有 empire 苹果', () => {
  const basket = {
    varieties: [
      {
        name: 'Empire',
        count: 1,
      }
    ],
  }
  expect(basket).toEqual({
    varieties: [
      expect.objectContaining({ name: 'Empire' }),
    ]
  })
})
```

:::tip
你可以在此匹配器中使用 `expect.not` 来否定预期值。
:::

## expect.stringContaining

- **类型：** `(expected: any) => any`

当与相等性检查一起使用时，如果值是字符串且包含指定的子字符串，此非对称匹配器将返回 `true`。

```ts
import { expect, test } from 'vitest'

test('variety 的名称中包含 "Emp"', () => {
  const variety = {
    name: 'Empire',
    count: 1,
  }
  expect(variety).toEqual({
    name: expect.stringContaining('Emp'),
    count: 1,
  })
})
```

:::tip
你可以在此匹配器中使用 `expect.not` 来否定预期值。
:::

## expect.stringMatching

- **类型：** `(expected: any) => any`

当与相等性检查一起使用时，如果值是字符串且包含指定的子字符串，或者字符串匹配正则表达式，此非对称匹配器将返回 `true`。

```ts
import { expect, test } from 'vitest'

test('variety 以 "re" 结尾', () => {
  const variety = {
    name: 'Empire',
    count: 1,
  }
  expect(variety).toEqual({
    name: expect.stringMatching(/re$/),
    count: 1,
  })
})
```

:::tip
你可以在此匹配器中使用 `expect.not` 来否定预期值。
:::

## expect.schemaMatching

- **类型：** `(expected: StandardSchemaV1) => any`

当与相等性检查一起使用时，如果值匹配提供的模式，此非对称匹配器将返回 `true`。该模式必须实现 [Standard Schema v1](https://standardschema.dev/) 规范。

```ts
import { expect, test } from 'vitest'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'

test('email validation', () => {
  const user = { email: 'john@example.com' }

  // 使用 Zod
  expect(user).toEqual({
    email: expect.schemaMatching(z.string().email()),
  })

  // 使用 Valibot
  expect(user).toEqual({
    email: expect.schemaMatching(v.pipe(v.string(), v.email()))
  })

  // 使用 ArkType
  expect(user).toEqual({
    email: expect.schemaMatching(type('string.email')),
  })
})
```

:::tip
你可以在此匹配器中使用 `expect.not` 来否定预期值。
:::

## expect.addSnapshotSerializer

- **类型：** `(plugin: PrettyFormatPlugin) => void`

此方法添加在创建快照时调用的自定义序列化器。这是一个高级功能 - 如果你想了解更多，请阅读 [自定义序列化器指南](/guide/snapshot#custom-serializer)。

如果你正在添加自定义序列化器，应该在 [`setupFiles`](/config/setupfiles) 内部调用此方法。这将影响每个快照。

:::tip
如果你之前将 Vue CLI 与 Jest 一起使用，你可能想要安装 [jest-serializer-vue](https://npmx.dev/package/jest-serializer-vue)。否则，你的快照将被包裹在字符串中，导致 `"` 被转义。
:::

## expect.extend

- **类型：** `(matchers: MatchersObject) => void`

你可以用自己的匹配器扩展默认匹配器。此函数用于使用自定义匹配器扩展匹配器对象。

当你以这种方式定义匹配器时，你还会创建可以像 `expect.stringContaining` 一样使用的非对称匹配器。

```ts
import { expect, test } from 'vitest'

test('自定义匹配器', () => {
  expect.extend({
    toBeFoo: (received, expected) => {
      if (received !== 'foo') {
        return {
          message: () => `expected ${received} to be foo`,
          pass: false,
        }
      }
    },
  })

  expect('foo').toBeFoo()
  expect({ foo: 'foo' }).toEqual({ foo: expect.toBeFoo() })
})
```

::: tip
如果你希望匹配器出现在每个测试中，应该在 [`setupFiles`](/config/setupfiles) 内部调用此方法。
:::

此函数与 Jest 的 `expect.extend` 兼容，因此任何使用它创建自定义匹配器的库都将与 Vitest 一起工作。

如果你使用的是 TypeScript，自 Vitest 0.31.0 起，你可以在环境声明文件（例如：`vitest.d.ts`）中使用以下代码扩展默认 `Assertion` 接口：

```ts
interface CustomMatchers<R = unknown> {
  toBeFoo: () => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
```

::: warning
别忘了将环境声明文件包含在你的 `tsconfig.json` 中。
:::

:::tip
如果你想了解更多，请查看 [扩展匹配器指南](/guide/extending-matchers)。
:::

## expect.addEqualityTesters {#expect-addequalitytesters}

- **类型：** `(tester: Array<Tester>) => void`

你可以使用此方法定义自定义测试器，这些是匹配器使用的方法，用于测试两个对象是否相等。它与 Jest 的 `expect.addEqualityTesters` 兼容。

```ts
import { expect, test } from 'vitest'

class AnagramComparator {
  public word: string

  constructor(word: string) {
    this.word = word
  }

  equals(other: AnagramComparator): boolean {
    const cleanStr1 = this.word.replace(/ /g, '').toLowerCase()
    const cleanStr2 = other.word.replace(/ /g, '').toLowerCase()

    const sortedStr1 = cleanStr1.split('').sort().join('')
    const sortedStr2 = cleanStr2.split('').sort().join('')

    return sortedStr1 === sortedStr2
  }
}

function isAnagramComparator(a: unknown): a is AnagramComparator {
  return a instanceof AnagramComparator
}

function areAnagramsEqual(a: unknown, b: unknown): boolean | undefined {
  const isAAnagramComparator = isAnagramComparator(a)
  const isBAnagramComparator = isAnagramComparator(b)

  if (isAAnagramComparator && isBAnagramComparator) {
    return a.equals(b)
  }
  else if (isAAnagramComparator === isBAnagramComparator) {
    return undefined
  }
  else {
    return false
  }
}

expect.addEqualityTesters([areAnagramsEqual])

test('自定义相等性测试器', () => {
  expect(new AnagramComparator('listen')).toEqual(new AnagramComparator('silent'))
})
```
