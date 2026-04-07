---
outline: deep
---

# describe

- **别名：**`suite`

```ts
function describe(
  name: string | Function,
  body?: () => unknown,
  timeout?: number
): void
function describe(
  name: string | Function,
  options: SuiteOptions,
  body?: () => unknown,
): void
```

`describe` 用于将相关的测试和基准测试分组到一个套件中。套件通过创建逻辑块来帮助组织测试文件，使测试输出更易读，并通过 [生命周期钩子](/api/hooks) 启用共享设置/清理。

当你在文件顶层使用 `test` 时，它们会被收集为该文件的隐式套件的一部分。使用 `describe`，你可以在当前上下文中定义一个新的套件，作为一组相关的测试或基准测试以及其他嵌套套件。

```ts [basic.spec.ts]
import { describe, expect, test } from 'vitest'

const person = {
  isActive: true,
  age: 32,
}

describe('person', () => {
  test('person is defined', () => {
    expect(person).toBeDefined()
  })

  test('is active', () => {
    expect(person.isActive).toBeTruthy()
  })

  test('age limit', () => {
    expect(person.age).toBeLessThanOrEqual(32)
  })
})
```

如果你有测试层级，也可以嵌套 `describe` 块：

```ts
import { describe, expect, test } from 'vitest'

function numberToCurrency(value: number | string) {
  if (typeof value !== 'number') {
    throw new TypeError('Value must be a number')
  }

  return value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

describe('numberToCurrency', () => {
  describe('given an invalid number', () => {
    test('composed of non-numbers to throw error', () => {
      expect(() => numberToCurrency('abc')).toThrow()
    })
  })

  describe('given a valid number', () => {
    test('returns the correct currency format', () => {
      expect(numberToCurrency(10000)).toBe('10,000.00')
    })
  })
})
```

## 测试选项

你可以使用 [测试选项](/api/test#test-options) 将配置应用于套件内的每个测试，包括嵌套套件。当你想为一组相关的测试设置超时、重试或其他选项时，这很有用。

```ts
import { describe, test } from 'vitest'

describe('slow tests', { timeout: 10_000 }, () => {
  test('test 1', () => { /* ... */ })
  test('test 2', () => { /* ... */ })

  // 嵌套套件也继承超时
  describe('nested', () => {
    test('test 3', () => { /* ... */ })
  })
})
```

### `shuffle`

- **类型：**`boolean`
- **默认值：**`false`（由 [`sequence.shuffle`](/config/sequence#sequence-shuffle) 配置）
- **别名：**[`describe.shuffle`](#describe-shuffle)

以随机顺序运行套件内的测试。此选项由嵌套套件继承。

```ts
import { describe, test } from 'vitest'

describe('randomized tests', { shuffle: true }, () => {
  test('test 1', () => { /* ... */ })
  test('test 2', () => { /* ... */ })
  test('test 3', () => { /* ... */ })
})
```

## describe.skip

- **别名：**`suite.skip`

在套件中使用 `describe.skip` 以避免运行特定的 describe 块。

```ts
import { assert, describe, test } from 'vitest'

describe.skip('skipped suite', () => {
  test('sqrt', () => {
    // 套件已跳过，无错误
    assert.equal(Math.sqrt(4), 3)
  })
})
```

## describe.skipIf

- **别名：**`suite.skipIf`

在某些情况下，你可能会使用不同的环境多次运行套件，其中一些套件可能是特定于环境的。你可以使用 `describe.skipIf` 来在条件为真时跳过套件，而不是用 `if` 包裹套件。

```ts
import { describe, test } from 'vitest'

const isDev = process.env.NODE_ENV === 'development'

describe.skipIf(isDev)('prod only test suite', () => {
  // 此测试套件仅在生产环境中运行
})
```

## describe.runIf

- **别名：**`suite.runIf`

[describe.skipIf](#describe-skipif) 的反面。

```ts
import { assert, describe, test } from 'vitest'

const isDev = process.env.NODE_ENV === 'development'

describe.runIf(isDev)('dev only test suite', () => {
  // 此测试套件仅在开发环境中运行
})
```

## describe.only

- **别名：**`suite.only`

使用 `describe.only` 仅运行某些套件

```ts
import { assert, describe, test } from 'vitest'

// 仅运行此套件（以及其他标记为 only 的套件）
describe.only('suite', () => {
  test('sqrt', () => {
    assert.equal(Math.sqrt(4), 3)
  })
})

describe('other suite', () => {
  // ... 将被跳过
})
```

有时在特定文件中运行 `only` 测试非常有用，忽略整个测试套件中的所有其他测试，以免污染输出。

为此，使用包含相关测试的特定文件运行 `vitest`：

```shell
vitest interesting.test.ts
```

## describe.concurrent

- **别名：**`suite.concurrent`

`describe.concurrent` 并行运行所有内部套件和测试

```ts
import { describe, test } from 'vitest'

// 此套件内的所有套件和测试将并行运行
describe.concurrent('suite', () => {
  test('concurrent test 1', async () => { /* ... */ })
  describe('concurrent suite 2', async () => {
    test('concurrent test inner 1', async () => { /* ... */ })
    test('concurrent test inner 2', async () => { /* ... */ })
  })
  test.concurrent('concurrent test 3', async () => { /* ... */ })
})
```

`.skip`、`.only` 和 `.todo` 可与并发套件一起使用。以下所有组合均有效：

```ts
describe.concurrent(/* ... */)
describe.skip.concurrent(/* ... */) // 或 describe.concurrent.skip(/* ... */)
describe.only.concurrent(/* ... */) // 或 describe.concurrent.only(/* ... */)
describe.todo.concurrent(/* ... */) // 或 describe.concurrent.todo(/* ... */)
```

运行并发测试时，Snapshots 和 Assertions 必须使用本地 [测试上下文](/guide/test-context) 中的 `expect`，以确保检测到正确的测试。

```ts
describe.concurrent('suite', () => {
  test('concurrent test 1', async ({ expect }) => {
    expect(foo).toMatchSnapshot()
  })
  test('concurrent test 2', async ({ expect }) => {
    expect(foo).toMatchSnapshot()
  })
})
```

## describe.sequential

- **别名：**`suite.sequential`

套件中的 `describe.sequential` 将每个测试标记为顺序执行。如果你想在 `describe.concurrent` 内或使用 `--sequence.concurrent` 命令选项顺序运行测试，这很有用。

```ts
import { describe, test } from 'vitest'

describe.concurrent('suite', () => {
  test('concurrent test 1', async () => { /* ... */ })
  test('concurrent test 2', async () => { /* ... */ })

  describe.sequential('', () => {
    test('sequential test 1', async () => { /* ... */ })
    test('sequential test 2', async () => { /* ... */ })
  })
})
```

## describe.shuffle

- **别名：**`suite.shuffle`

Vitest 提供了一种通过 CLI 标志 [`--sequence.shuffle`](/guide/cli) 或配置选项 [`sequence.shuffle`](/config/sequence#sequence-shuffle) 以随机顺序运行所有测试的方法，但如果你只想让部分测试套件以随机顺序运行测试，可以使用此标志标记它。

```ts
import { describe, test } from 'vitest'

// 或 describe('suite', { shuffle: true }, ...)
describe.shuffle('suite', () => {
  test('random test 1', async () => { /* ... */ })
  test('random test 2', async () => { /* ... */ })
  test('random test 3', async () => { /* ... */ })

  // shuffle 被继承
  describe('still random', () => {
    test('random 4.1', async () => { /* ... */ })
    test('random 4.2', async () => { /* ... */ })
  })

  // 在内部禁用 shuffle
  describe('not random', { shuffle: false }, () => {
    test('in order 5.1', async () => { /* ... */ })
    test('in order 5.2', async () => { /* ... */ })
  })
})
// 顺序取决于配置中的 sequence.seed 选项（默认为 Date.now()）
```

`.skip`、`.only` 和 `.todo` 可与随机套件一起使用。

## describe.todo

- **别名：**`suite.todo`

使用 `describe.todo` 存桩稍后实现的套件。报告中将显示该测试的条目，以便你知道还需要实现多少测试。

```ts
// 报告中将显示此套件的条目
describe.todo('unimplemented suite')
```

## describe.each

- **别名：**`suite.each`

::: tip
虽然提供了 `describe.each` 以兼容 Jest，但 Vitest 也有 [`describe.for`](#describe-for)，它简化了参数类型并与 [`test.for`](/api/test#test-for) 保持一致。
:::

如果你有多个测试依赖于相同的数据，请使用 `describe.each`。

```ts
import { describe, expect, test } from 'vitest'

describe.each([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 1, expected: 3 },
])('describe object add($a, $b)', ({ a, b, expected }) => {
  test(`returns ${expected}`, () => {
    expect(a + b).toBe(expected)
  })

  test(`returned value not be greater than ${expected}`, () => {
    expect(a + b).not.toBeGreaterThan(expected)
  })

  test(`returned value not be less than ${expected}`, () => {
    expect(a + b).not.toBeLessThan(expected)
  })
})
```

* 第一行应为列名，用 `|` 分隔；
* 随后的一行或多行数据使用 `${value}` 语法作为模板字面量表达式提供。

```ts
import { describe, expect, test } from 'vitest'

describe.each`
  a               | b      | expected
  ${1}            | ${1}   | ${2}
  ${'a'}          | ${'b'} | ${'ab'}
  ${[]}           | ${'b'} | ${'b'}
  ${{}}           | ${'b'} | ${'[object Object]b'}
  ${{ asd: 1 }}   | ${'b'} | ${'[object Object]b'}
`('describe template string add($a, $b)', ({ a, b, expected }) => {
  test(`returns ${expected}`, () => {
    expect(a + b).toBe(expected)
  })
})
```

## describe.for

- **别名：**`suite.for`

与 `describe.each` 的区别在于参数中提供数组案例的方式。其他非数组案例（包括模板字符串用法）的工作方式完全相同。

```ts
// `each` 展开数组案例
describe.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', (a, b, expected) => { // [!code --]
  test('test', () => {
    expect(a + b).toBe(expected)
  })
})

// `for` 不展开数组案例
describe.for([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', ([a, b, expected]) => { // [!code ++]
  test('test', () => {
    expect(a + b).toBe(expected)
  })
})
```
