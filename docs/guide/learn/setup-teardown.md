---
title: Setup 和 Teardown | 指南
prev:
  text: 异步测试
  link: /guide/learn/async
next:
  text: 模拟函数
  link: /guide/learn/mock-functions
---

# Setup 和 Teardown

在编写测试时，通常需要在测试运行前执行一些工作（初始化数据、连接数据库、启动服务器）以及测试运行后进行清理。与在每个测试中重复这些代码不同，Vitest 提供了生命周期钩子，在合适的时间自动运行。

## 为每个测试重复 Setup

最常见的钩子是 [`beforeEach`](/api/hooks#beforeeach) 和 [`afterEach`](/api/hooks#aftereach)。顾名思义，`beforeEach` 在文件中的每个测试运行**之前**执行，`afterEach` 在每个测试运行**之后**执行，即使测试失败也会执行。这使得它们非常适合确保每个测试都从一个已知的状态开始。

```js
import { afterEach, beforeEach, expect, test } from 'vitest'

let items

beforeEach(() => {
  items = ['apple', 'banana', 'cherry']
})

afterEach(() => {
  items = []
})

test('items 初始包含 3 个水果', () => {
  expect(items).toHaveLength(3)
})

test('可以移除一个项目', () => {
  items.pop()
  expect(items).toHaveLength(2)
})

test('可以添加一个项目', () => {
  items.push('date')
  expect(items).toHaveLength(4)
  // beforeEach 在此测试运行前将数组重置为 3 个项目，
  // 证明前一个测试中的变更不会泄漏。
})
```

如果没有这些钩子，前面测试中的 `pop` 或 `push` 等变更会影响后续测试，这是不稳定测试的典型来源，而这些钩子能保证每个测试都有干净的状态。

## 一次性 Setup

有些 Setup 操作成本太高，不适合为每个测试重复执行。如果你需要连接数据库、启动服务器或加载大型文件，那么在每个测试前执行会显著拖慢测试套件的运行速度。这时就应该使用 [`beforeAll`](/api/hooks#beforeall) 和 [`afterAll`](/api/hooks#afterall)。它们在整个文件范围内**只运行一次**：

```js
import { afterAll, beforeAll, expect, test } from 'vitest'

let db

beforeAll(async () => {
  db = await connectToDatabase()
})

afterAll(async () => {
  await db.close()
})

test('可以查询用户', async () => {
  const users = await db.query('SELECT * FROM users')
  expect(users.length).toBeGreaterThan(0)
})

test('可以查询商品', async () => {
  const products = await db.query('SELECT * FROM products')
  expect(products.length).toBeGreaterThan(0)
})
```

数据库连接只创建一次，在所有测试之间共享，并在文件运行结束后关闭。

## 使用 `describe` 进行作用域划分

定义在 `describe` 块中的钩子**仅适用于该块内的测试**。顶级钩子则作用于文件中的**所有测试**。这允许你为不同的测试组设置不同的状态：

```js
import { beforeEach, describe, expect, test } from 'vitest'

describe('数学运算', () => {
  let value

  beforeEach(() => {
    value = 0
  })

  test('可以相加', () => {
    value += 5
    expect(value).toBe(5)
  })

  test('可以相减', () => {
    value -= 3
    expect(value).toBe(-3) // value 被 beforeEach 重置为 0
  })
})

describe('字符串运算', () => {
  let text

  beforeEach(() => {
    text = 'hello'
  })

  test('可以转大写', () => {
    expect(text.toUpperCase()).toBe('HELLO')
  })
})
```

每个 `describe` 块都有自己独立的 `beforeEach`，只影响其内部的测试。字符串测试不了解也不关心 `value` 变量，反之亦然。

## 执行顺序

当你设置了多层级的钩子时，了解它们的执行顺序会很有帮助。顶级钩子会**包裹**内部钩子，形成嵌套结构：

```js
import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from 'vitest'

beforeAll(() => console.log('1 - beforeAll'))
afterAll(() => console.log('8 - afterAll'))
beforeEach(() => console.log('2 - beforeEach'))
afterEach(() => console.log('5 - afterEach'))

describe('测试套件', () => {
  beforeEach(() => console.log('3 - inner beforeEach'))
  afterEach(() => console.log('4 - inner afterEach'))

  test('第一个测试', () => {
    console.log('  first test')
  })

  test('第二个测试', () => {
    console.log('  second test')
  })
})
```

输出结果如下：

```
1 - beforeAll
2 - beforeEach
3 - inner beforeEach
  first test
4 - inner afterEach
5 - afterEach
2 - beforeEach
3 - inner beforeEach
  second test
4 - inner afterEach
5 - afterEach
8 - afterAll
```

注意这个模式：`beforeAll` 和 `afterAll` 在整个测试套件中只运行一次，而 `beforeEach` 和 `afterEach` 会为每个测试重复执行。在每个测试内部，外层 `beforeEach` 先运行（设置最宽泛的上下文），然后内层 `beforeEach` 运行（收窄上下文）。在测试之后，顺序会反转：内层 `afterEach` 先清理较窄的上下文，然后外层 `afterEach` 处理更广泛的清理。

## 使用 `onTestFinished` 进行清理

有时你会在测试内部创建一个需要清理的资源。你可以使用 `afterEach`，但这样会让清理逻辑与设置逻辑分离，使测试更难阅读。[`onTestFinished`](/api/hooks#ontestfinished) 允许你在创建资源的地方直接注册清理函数：

```js
import { expect, onTestFinished, test } from 'vitest'

test('创建一个临时文件', () => {
  const file = createTempFile()
  onTestFinished(() => {
    deleteTempFile(file)
  })

  expect(file.exists()).toBe(true)
})
```

对于 `beforeEach` 也有类似模式。你可以返回一个清理函数，Vitest 会在每个测试后调用它。当设置和清理密切相关时，这种方式尤其方便：

```js
import { beforeEach } from 'vitest'

beforeEach(() => {
  const server = startServer()
  return () => {
    server.close()
  }
})
```

## 使用 `test.extend` 的 Fixtures

上述示例使用了 `let` 变量和 `beforeEach` 来设置共享状态。这种方法虽然可行，但存在一些缺点：变量声明与初始化分离、类型需要显式标注、容易忘记清理。

Vitest 提供了更好的模式，即通过 [`test.extend`](/guide/test-context#extend-test-context) 来定义可复用的 **fixtures**。它们会在每个测试中自动创建并随后清理：

```js [my-test.js]
import { test as baseTest } from 'vitest'

export const test = baseTest
  .extend('db', async ({}, { onCleanup }) => {
    const db = await createDatabase()
    onCleanup(() => db.close())
    return db
  })
  .extend('user', async ({ db }) => {
    return await db.createUser({ name: 'Alice' })
  })
```

```js [my-test.test.js]
import { expect } from 'vitest'
import { test } from './my-test.js'

test('用户已创建', ({ db, user }) => {
  expect(user.name).toBe('Alice')
})
```

只有当测试实际使用（通过解构上下文）fixture 时，它们才会被初始化，并且可以相互依赖。这使得它们成为大多数 Setup 和 Teardown 模式的绝佳替代方案，取代了 `beforeEach`/`afterEach`。

请查阅[测试上下文](/guide/test-context)指南，了解关于 fixtures、作用域和覆盖的完整细节。

## Setup 文件

如果你有一些应在每个测试文件运行前执行的 Setup 代码（例如 polyfills、全局配置或自定义匹配器），可以将它们放在一个 Setup 文件中，并通过 [`setupFiles`](/config/setupfiles) 配置选项指向它：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
  },
})
```

```js [test/setup.js]
// 这会在每个测试文件运行前执行
import { expect } from 'vitest'
import { customMatchers } from './custom-matchers.js'

expect.extend(customMatchers)
```

与每个文件只运行一次的 `beforeAll` 不同，Setup 文件会在测试文件**开始收集之前**的一个独立阶段运行。这使得它们成为扩展 `expect` API 或配置全局 polyfills 的合适位置。

::: tip
对于需要运行在包装上下文中的高级用例（例如数据库事务或跟踪 span），请参考 [`aroundEach`](/api/hooks#aroundeach) 和 [`aroundAll`](/api/hooks#aroundall) 钩子。如需了解完整的生命周期，请参阅[测试运行生命周期](/guide/lifecycle)。
:::
