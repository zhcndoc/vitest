---
outline: deep
---

# Vi

Vitest 通过其 `vi` 辅助工具提供实用函数来帮助你。你可以全局访问它（当启用了 [globals 配置](/config/globals) 时），或者直接从 `vitest` 导入它：

```js
import { vi } from 'vitest'
```

## 模拟模块

本节描述了你在 [模拟模块](/guide/mocking/modules) 时可以使用的 API。请注意，Vitest 不支持模拟使用 `require()` 导入的模块。

### vi.mock

```ts
interface MockOptions {
  spy?: boolean
}

interface MockFactory<T> {
  (importOriginal: () => T): unknown
}

function mock(
  path: string,
  factory?: MockOptions | MockFactory<unknown>
): void
function mock<T>(
  module: Promise<T>,
  factory?: MockOptions | MockFactory<T>
): void
```

将提供的所有导入模块替换为另一个模块。你可以在路径中使用配置的 Vite 别名。对 `vi.mock` 的调用会被提升（hoisted），所以你在哪里调用它并不重要。它总是在所有导入之前执行。如果你需要引用其作用域之外的一些变量，你可以在 [`vi.hoisted`](#vi-hoisted) 中定义它们，并在 `vi.mock` 中引用它们。

建议仅在测试文件中使用 `vi.mock` 或 `vi.hoisted`。如果 Vite 的 [模块运行器](/config/experimental#experimental-vitemodulerunner) 被禁用，它们将不会被提升。这是一种性能优化，以避免读取不必要的文件。

::: warning
`vi.mock` 仅适用于使用 `import` 关键字导入的模块。它不适用于 `require`。

为了提升 `vi.mock`，Vitest 会静态分析你的文件。这表明没有直接从 `vitest` 包导入的 `vi`（例如，从某些工具文件导入）不能使用。请使用从 `vitest` 导入的 `vi` 来使用 `vi.mock`，或者启用 [`globals`](/config/globals) 配置选项。

Vitest 不会模拟在 [设置文件](/config/setupfiles) 中导入的模块，因为在测试文件运行时它们已经被缓存了。你可以在 [`vi.hoisted`](#vi-hoisted) 中调用 [`vi.resetModules()`](#vi-resetmodules) 来在运行测试文件之前清除所有模块缓存。
:::

如果定义了 `factory` 函数，所有导入将返回其结果。Vitest 仅调用一次工厂函数，并缓存结果以供所有后续导入使用，直到调用 [`vi.unmock`](#vi-unmock) 或 [`vi.doUnmock`](#vi-dounmock) 为止。

与 `jest` 不同，工厂函数可以是异步的。你可以使用 [`vi.importActual`](#vi-importactual) 或者使用作为第一个参数传入的工厂辅助函数，并在内部获取原始模块。

你也可以提供一个带有 `spy` 属性的对象来代替工厂函数。如果 `spy` 为 `true`，那么 Vitest 将像往常一样自动模拟模块，但不会覆盖导出的实现。如果你只想断言导出的方法是否被另一个方法正确调用，这很有用。

```ts
import { calculator } from './src/calculator.ts'

vi.mock('./src/calculator.ts', { spy: true })

// 调用原始实现，
// 但允许稍后断言行为
const result = calculator(1, 2)

expect(result).toBe(3)
expect(calculator).toHaveBeenCalledWith(1, 2)
expect(calculator).toHaveReturnedWith(3)
```

Vitest 还在 `vi.mock` 和 `vi.doMock` 方法中支持模块 Promise 而不是字符串，以提供更好的 IDE 支持。当文件移动时，路径将更新，并且 `importOriginal` 会自动继承类型。使用此签名还将强制工厂返回类型与原始模块兼容（保持导出可选）。

```ts twoslash
// @filename: ./path/to/module.js
export declare function total(...numbers: number[]): number
// @filename: test.js
import { vi } from 'vitest'
// ---cut---
vi.mock(import('./path/to/module.js'), async (importOriginal) => {
  const mod = await importOriginal() // 类型被推断
  //    ^?
  return {
    ...mod,
    // 替换一些导出
    total: vi.fn(),
  }
})
```

在底层，Vitest 仍然操作的是字符串而不是模块对象。

但是，如果你在使用 `tsconfig.json` 中配置了 `paths` 别名的 TypeScript，编译器将无法正确解析导入类型。
为了使其工作，请确保将所有别名导入替换为它们对应的相对路径。
例如，使用 `import('./path/to/module.js')` 而不是 `import('@/module')`。

::: warning
`vi.mock` 会被提升（换句话说，_移动_）到**文件顶部**。这意味着无论你写在哪里（无论是在 `beforeEach` 还是 `test` 内部），它实际上都会在那之前被调用。

这也意味着你不能在工厂函数内部使用在工厂外部定义的变量。

如果你需要在工厂内部使用变量，请尝试 [`vi.doMock`](#vi-domock)。它的工作方式相同，但不会被提升。请注意，它仅模拟后续导入。

如果 `vi.hoisted` 方法在 `vi.mock` 之前声明，你也可以引用由该方法定义的变量：

```ts
import { namedExport } from './path/to/module.js'

const mocks = vi.hoisted(() => {
  return {
    namedExport: vi.fn(),
  }
})

vi.mock('./path/to/module.js', () => {
  return {
    namedExport: mocks.namedExport,
  }
})

vi.mocked(namedExport).mockReturnValue(100)

expect(namedExport()).toBe(100)
expect(namedExport).toBe(mocks.namedExport)
```
:::

::: warning
如果你正在模拟一个带有默认导出的模块，你将需要在返回的工厂函数对象中提供一个 `default` 键。这是 ES 模块特定的注意事项；因此，`jest` 文档可能有所不同，因为 `jest` 使用 CommonJS 模块。例如，

```ts
vi.mock('./path/to/module.js', () => {
  return {
    default: { myDefaultKey: vi.fn() },
    namedExport: vi.fn(),
    // 等等...
  }
})
```
:::

如果你正在模拟的文件旁边有一个 `__mocks__` 文件夹，并且没有提供工厂函数，Vitest 将尝试在 `__mocks__` 子文件夹中查找具有相同名称的文件，并将其用作实际模块。如果你正在模拟依赖项，Vitest 将尝试在项目的 [根目录](/config/root) 中查找 `__mocks__` 文件夹（默认是 `process.cwd()`）。你可以通过 [`deps.moduleDirectories`](/config/deps#deps-moduledirectories) 配置选项告诉 Vitest 依赖项位于何处。

例如，你有这个文件结构：

```
- __mocks__
  - axios.js
- src
  __mocks__
    - increment.js
  - increment.js
- tests
  - increment.test.js
```

如果你在测试文件中调用 `vi.mock` 而没有提供工厂或选项，它将在 `__mocks__` 文件夹中查找文件以用作模块：

```ts [increment.test.js]
import { vi } from 'vitest'

// axios 是来自 `__mocks__/axios.js` 的默认导出
import axios from 'axios'

// increment 是来自 `src/__mocks__/increment.js` 的命名导出
import { increment } from '../increment.js'

vi.mock('axios')
vi.mock('../increment.js')

axios.get(`/apples/${increment(1)}`)
```

::: warning
请注意，如果你不调用 `vi.mock`，模块**不会**被自动模拟。要复制 Jest 的自动模拟行为，你可以在 [`setupFiles`](/config/setupfiles) 中为每个需要的模块调用 `vi.mock`。
:::

如果没有 `__mocks__` 文件夹或提供的工厂函数，Vitest 将导入原始模块并自动模拟其所有导出。有关应用的规则，请参阅 [算法](/guide/mocking/modules#automocking-algorithm)。

### vi.doMock

```ts
function doMock(
  path: string,
  factory?: MockOptions | MockFactory<unknown>
): Disposable
function doMock<T>(
  module: Promise<T>,
  factory?: MockOptions | MockFactory<T>
): Disposable
```

与 [`vi.mock`](#vi-mock) 相同，但它不会被提升到文件顶部，因此你可以在全局文件作用域中引用变量。模块的下一个 [动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) 将被模拟。

::: warning
这不会模拟在此调用之前导入的模块。不要忘记，ESM 中的所有静态导入总是被 [提升](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#hoisting) 的，所以将其放在静态导入之前不会强制它在导入之前被调用：

```ts
vi.doMock('./increment.js') // 这将在导入语句 _之后_ 被调用

import { increment } from './increment.js'
```
:::

```ts [increment.js]
export function increment(number) {
  return number + 1
}
```

```ts [increment.test.js]
import { beforeEach, test } from 'vitest'
import { increment } from './increment.js'

// 模块未被模拟，因为 vi.doMock 尚未被调用
increment(1) === 2

let mockedIncrement = 100

beforeEach(() => {
  // 你可以在工厂函数内部访问变量
  vi.doMock('./increment.js', () => ({ increment: () => ++mockedIncrement }))
})

test('导入下一个模块会导入模拟的模块', async () => {
  // 原始导入未被模拟，因为 vi.doMock 在导入之后求值
  expect(increment(1)).toBe(2)
  const { increment: mockedIncrement } = await import('./increment.js')
  // 新的动态导入返回模拟的模块
  expect(mockedIncrement(1)).toBe(101)
  expect(mockedIncrement(1)).toBe(102)
  expect(mockedIncrement(1)).toBe(103)
})
```

::: tip
在支持 [显式资源管理](https://github.com/tc39/proposal-explicit-resource-management) 的环境中，你可以对 `vi.doMock()` 返回的值使用 `using`，以便在退出包含块时自动在被模拟的模块上调用 [`vi.doUnmock()`](#vi-dounmock)。这在为单个测试用例模拟动态导入的模块时特别有用。

```ts
it('使用 my-module 的模拟版本', () => {
  using _mockDisposable = vi.doMock('my-module')

  const myModule = await import('my-module') // 已模拟

  // my-module 在此处恢复
})

it('再次使用 my-module 的正常版本', () => {
  const myModule = await import('my-module') // 未模拟
})
```
:::

### vi.mocked

```ts
function mocked<T>(
  object: T,
  deep?: boolean
): MaybeMockedDeep<T>
function mocked<T>(
  object: T,
  options?: { partial?: boolean; deep?: boolean }
): MaybePartiallyMockedDeep<T>
```

TypeScript 的类型辅助工具。仅返回传入的对象。

当 `partial` 为 `true` 时，它将期望返回值为 `Partial<T>`。默认情况下，这只会让 TypeScript 认为第一层值被模拟了。你可以将 `{ deep: true }` 作为第二个参数传入，以告诉 TypeScript 整个对象都被模拟了（如果确实是的话）。你可以传入 `{ partial: true, deep: true }` 以使嵌套对象也递归地变为部分模拟。

```ts [example.ts]
export function add(x: number, y: number): number {
  return x + y
}

export function fetchSomething(): Promise<Response> {
  return fetch('https://vitest.dev/')
}

export function getUser(): { name: string; address: { city: string; zip: string } } {
  return { name: 'John', address: { city: 'New York', zip: '10001' } }
}
```

```ts [example.test.ts]
import * as example from './example'

vi.mock('./example')

test('1 + 1 等于 10', async () => {
  vi.mocked(example.add).mockReturnValue(10)
  expect(example.add(1, 1)).toBe(10)
})

test('使用仅部分正确类型的模拟返回值', async () => {
  vi.mocked(example.fetchSomething).mockResolvedValue(new Response('hello'))
  vi.mocked(example.fetchSomething, { partial: true }).mockResolvedValue({ ok: false })
  // vi.mocked(example.someFn).mockResolvedValue({ ok: false }) // 这是一个类型错误
})

test('使用深度部分类型的模拟返回值', async () => {
  vi.mocked(example.getUser, { partial: true, deep: true }).mockReturnValue({
    address: { city: 'Los Angeles' },
  })
  expect(example.getUser().address.city).toBe('Los Angeles')
})
```

### vi.importActual

```ts
function importActual<T>(path: string): Promise<T>
```

导入模块，绕过所有是否应该被模拟的检查。如果你想部分模拟模块，这可能很有用。

```ts
vi.mock('./example.js', async () => {
  const originalModule = await vi.importActual('./example.js')

  return { ...originalModule, get: vi.fn() }
})
```

### vi.importMock

```ts
function importMock<T>(path: string): Promise<MaybeMockedDeep<T>>
```

导入一个模块，其所有属性（包括嵌套属性）都被模拟。遵循与 [`vi.mock`](#vi-mock) 相同的规则。有关应用的规则，请参阅 [算法](/guide/mocking/modules#automocking-algorithm)。

### vi.unmock

```ts
function unmock(path: string | Promise<Module>): void
```

从模拟注册表中移除模块。即使之前被模拟过，所有导入调用都将返回原始模块。此调用被提升到文件顶部，因此它只会取消模拟在 `setupFiles` 中定义的模块，例如。

### vi.doUnmock

```ts
function doUnmock(path: string | Promise<Module>): void
```

与 [`vi.unmock`](#vi-unmock) 相同，但不会提升到文件顶部。模块的下一次导入将导入原始模块而不是模拟模块。这不会取消模拟之前导入的模块。

```ts [increment.js]
export function increment(number) {
  return number + 1
}
```

```ts [increment.test.js]
import { increment } from './increment.js'

// increment 已经被模拟，因为 vi.mock 被提升了
increment(1) === 100

// 这被提升了，工厂函数在第 1 行的导入之前被调用
vi.mock('./increment.js', () => ({ increment: () => 100 }))

// 所有调用都被模拟，`increment` 总是返回 100
increment(1) === 100
increment(30) === 100

// 这未被提升，所以其他导入将返回未模拟的模块
vi.doUnmock('./increment.js')

// 这仍然返回 100，因为 `vi.doUnmock` 不会重新求值模块
increment(1) === 100
increment(30) === 100

// 下一个导入未被模拟，现在 `increment` 是返回 count + 1 的原始函数
const { increment: unmockedIncrement } = await import('./increment.js')

unmockedIncrement(1) === 2
unmockedIncrement(30) === 31
```

### vi.resetModules

```ts
function resetModules(): Vitest
```

通过清除所有模块的缓存来重置模块注册表。这允许模块在重新导入时被重新求值。顶层导入无法被重新求值。对于隔离测试之间本地状态冲突的模块可能很有用。

```ts
import { vi } from 'vitest'

import { data } from './data.js' // 在每次测试前不会被重新求值

beforeEach(() => {
  vi.resetModules()
})

test('改变状态', async () => {
  const mod = await import('./some/path.js') // 将被重新求值
  mod.changeLocalState('new value')
  expect(mod.getLocalState()).toBe('new value')
})

test('模块有旧状态', async () => {
  const mod = await import('./some/path.js') // 将被重新求值
  expect(mod.getLocalState()).toBe('old value')
})
```

::: warning
不会重置模拟注册表。要清除模拟注册表，请使用 [`vi.unmock`](#vi-unmock) 或 [`vi.doUnmock`](#vi-dounmock)。
:::

### vi.dynamicImportSettled

```ts
function dynamicImportSettled(): Promise<void>
```

等待所有导入加载完成。如果你有一个同步调用开始导入一个你无法以其他方式等待的模块，这很有用。

```ts
import { expect, test } from 'vitest'

// 无法跟踪导入，因为未返回 Promise
function renderComponent() {
  import('./component.js').then(({ render }) => {
    render()
  })
}

test('操作已解析', async () => {
  renderComponent()
  await vi.dynamicImportSettled()
  expect(document.querySelector('.component')).not.toBeNull()
})
```

::: tip
如果在动态导入期间发起了另一个动态导入，此方法将等待所有导入解析完成。

此方法还会在导入解析后等待下一个 `setTimeout` tick，因此所有同步操作应在解析完成时完成。
:::

## 模拟函数和对象

本节介绍如何使用 [方法模拟](/api/mock) 以及替换环境和全局变量。

### vi.fn

```ts
function fn(fn?: Procedure | Constructable): Mock
```

创建一个函数的间谍（spy），也可以在不提供函数的情况下初始化。每次调用函数时，它都会存储其调用参数、返回值和实例。此外，你可以使用 [方法](/api/mock) 操纵其行为。
如果没有提供函数，模拟在被调用时将返回 `undefined`。

```ts
const getApples = vi.fn(() => 0)

getApples()

expect(getApples).toHaveBeenCalled()
expect(getApples).toHaveReturnedWith(0)

getApples.mockReturnValueOnce(5)

const res = getApples()
expect(res).toBe(5)
expect(getApples).toHaveNthReturnedWith(2, 5)
```

你也可以将类传递给 `vi.fn`：

```ts
const Cart = vi.fn(class {
  get = () => 0
})

const cart = new Cart()
expect(Cart).toHaveBeenCalled()
```

### vi.mockObject <Version>3.2.0</Version>

```ts
function mockObject<T>(value: T, options?: MockOptions): MaybeMockedDeep<T>
```

以与 `vi.mock()` 模拟模块导出相同的方式深度模拟给定对象的属性和方法。详见 [自动模拟](/guide/mocking.html#automocking-algorithm)。

```ts
const original = {
  simple: () => 'value',
  nested: {
    method: () => 'real'
  },
  prop: 'foo',
}

const mocked = vi.mockObject(original)
expect(mocked.simple()).toBe(undefined)
expect(mocked.nested.method()).toBe(undefined)
expect(mocked.prop).toBe('foo')

mocked.simple.mockReturnValue('mocked')
mocked.nested.method.mockReturnValue('mocked nested')

expect(mocked.simple()).toBe('mocked')
expect(mocked.nested.method()).toBe('mocked nested')
```

就像 `vi.mock()` 一样，你可以传递 `{ spy: true }` 作为第二个参数来保留函数实现：

```ts
const spied = vi.mockObject(original, { spy: true })
expect(spied.simple()).toBe('value')
expect(spied.simple).toHaveBeenCalled()
expect(spied.simple.mock.results[0]).toEqual({ type: 'return', value: 'value' })
```

### vi.isMockFunction

```ts
function isMockFunction(fn: unknown): asserts fn is Mock
```

检查给定参数是否为模拟函数。如果你使用 TypeScript，它还会缩小其类型。

### vi.clearAllMocks

```ts
function clearAllMocks(): Vitest
```

在所有间谍上调用 [`.mockClear()`](/api/mock#mockclear)。
这将清除模拟历史而不影响模拟实现。

### vi.resetAllMocks

```ts
function resetAllMocks(): Vitest
```

在所有间谍上调用 [`.mockReset()`](/api/mock#mockreset)。
这将清除模拟历史并重置每个模拟的实现。

### vi.restoreAllMocks

```ts
function restoreAllMocks(): Vitest
```

这将恢复所有使用 [`vi.spyOn`](#vi-spyon) 创建的间谍上的原始实现。

模拟恢复后，你可以再次监听它。

::: warning
此方法也不影响在 [自动模拟](/guide/mocking/modules#mocking-a-module) 期间创建的模拟。

注意，与 [`mock.mockRestore`](/api/mock#mockrestore) 不同，`vi.restoreAllMocks` 不会清除模拟历史或重置模拟实现
:::

### vi.spyOn

```ts
function spyOn<T, K extends keyof T>(
  object: T,
  key: K,
  accessor?: 'get' | 'set'
): Mock<T[K]>
```

在对象的方法或 getter/setter 上创建间谍，类似于 [`vi.fn()`](#vi-fn)。它返回一个 [模拟函数](/api/mock)。

```ts
let apples = 0
const cart = {
  getApples: () => 42,
}

const spy = vi.spyOn(cart, 'getApples').mockImplementation(() => apples)
apples = 1

expect(cart.getApples()).toBe(1)

expect(spy).toHaveBeenCalled()
expect(spy).toHaveReturnedWith(1)
```

如果监听的方法是类定义，模拟实现必须使用 `function` 或 `class` 关键字：

```ts {12-14,16-20}
const cart = {
  Apples: class Apples {
    getApples() {
      return 42
    }
  }
}

const spy = vi.spyOn(cart, 'Apples')
  .mockImplementation(() => ({ getApples: () => 0 })) // [!code --]
  // 使用 function 关键字
  .mockImplementation(function () {
    this.getApples = () => 0
  })
  // 使用自定义类
  .mockImplementation(class MockApples {
    getApples() {
      return 0
    }
  })
```

如果你提供箭头函数，当调用模拟时，你将收到 [`<anonymous> is not a constructor` error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_constructor) 错误。

::: tip
在支持 [显式资源管理](https://github.com/tc39/proposal-explicit-resource-management) 的环境中，你可以使用 `using` 代替 `const`，以便在退出包含块时自动在任何模拟函数上调用 `mockRestore`。这对于监听的方法特别有用：

```ts
it('calls console.log', () => {
  using spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  debug('message')
  expect(spy).toHaveBeenCalled()
})
// console.log 在此处恢复
```
:::

::: tip
你可以在 [`afterEach`](/api/hooks#aftereach) 中调用 [`vi.restoreAllMocks`](#vi-restoreallmocks)（或启用 [`test.restoreMocks`](/config/restoremocks)），以便在每个测试后将所有方法恢复为其原始实现。这将恢复原始 [对象描述符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)，因此你将无法再更改方法的实现，除非再次监听：

```ts
const cart = {
  getApples: () => 42,
}

const spy = vi.spyOn(cart, 'getApples').mockReturnValue(10)

console.log(cart.getApples()) // 10
vi.restoreAllMocks()
console.log(cart.getApples()) // 42
spy.mockReturnValue(10)
console.log(cart.getApples()) // 仍然是 42！
```
:::

::: tip
在 [浏览器模式](/guide/browser/) 中无法监听导出的方法。相反，你可以通过调用 `vi.mock("./file-path.js", { spy: true })` 来监听每个导出的方法。这将模拟每个导出但保持其实现完整，允许你断言方法是否被正确调用。

```ts
import { calculator } from './src/calculator.ts'

vi.mock('./src/calculator.ts', { spy: true })

calculator(1, 2)

expect(calculator).toHaveBeenCalledWith(1, 2)
expect(calculator).toHaveReturned(3)
```

虽然在 `jsdom` 或其他 Node.js 环境中可以监听导出，但这在未来可能会改变。
:::

### vi.stubEnv {#vi-stubenv}

```ts
function stubEnv<T extends string>(
  name: T,
  value: T extends 'PROD' | 'DEV' | 'SSR' ? boolean : string | undefined
): Vitest
```

更改 `process.env` 和 `import.meta.env` 上环境变量的值。你可以通过调用 `vi.unstubAllEnvs` 恢复其值。

```ts
import { vi } from 'vitest'

// `process.env.NODE_ENV` 和 `import.meta.env.NODE_ENV`
// 在调用 "vi.stubEnv" 之前是 "development"

vi.stubEnv('NODE_ENV', 'production')

process.env.NODE_ENV === 'production'
import.meta.env.NODE_ENV === 'production'

vi.stubEnv('NODE_ENV', undefined)

process.env.NODE_ENV === undefined
import.meta.env.NODE_ENV === undefined

// 不改变其他环境变量
import.meta.env.MODE === 'development'
```

:::tip
你也可以通过直接赋值来更改值，但你将无法使用 `vi.unstubAllEnvs` 恢复之前的值：

```ts
import.meta.env.MODE = 'test'
```
:::

### vi.unstubAllEnvs {#vi-unstuballenvs}

```ts
function unstubAllEnvs(): Vitest
```

恢复所有被 `vi.stubEnv` 更改的 `import.meta.env` 和 `process.env` 值。当它第一次被调用时，Vitest 会记住原始值并存储它，直到再次调用 `unstubAllEnvs`。

```ts
import { vi } from 'vitest'

// `process.env.NODE_ENV` 和 `import.meta.env.NODE_ENV`
// 在调用 stubEnv 之前是 "development"

vi.stubEnv('NODE_ENV', 'production')

process.env.NODE_ENV === 'production'
import.meta.env.NODE_ENV === 'production'

vi.stubEnv('NODE_ENV', 'staging')

process.env.NODE_ENV === 'staging'
import.meta.env.NODE_ENV === 'staging'

vi.unstubAllEnvs()

// 恢复到第一次 "stubEnv" 调用之前存储的值
process.env.NODE_ENV === 'development'
import.meta.env.NODE_ENV === 'development'
```

### vi.stubGlobal

```ts
function stubGlobal(
  name: string | number | symbol,
  value: unknown
): Vitest
```

更改全局变量的值。你可以通过调用 `vi.unstubAllGlobals` 恢复其原始值。

```ts
import { vi } from 'vitest'

// 在调用 stubGlobal 之前 `innerWidth` 是 "0"

vi.stubGlobal('innerWidth', 100)

innerWidth === 100
globalThis.innerWidth === 100
// 如果你使用的是 jsdom 或 happy-dom
window.innerWidth === 100
```

:::tip
你也可以通过直接赋值给 `globalThis` 或 `window`（如果你使用的是 `jsdom` 或 `happy-dom` 环境）来更改值，但你将无法使用 `vi.unstubAllGlobals` 恢复原始值：

```ts
globalThis.innerWidth = 100
// 如果你使用的是 jsdom 或 happy-dom
window.innerWidth = 100
```
:::

### vi.unstubAllGlobals {#vi-unstuballglobals}

```ts
function unstubAllGlobals(): Vitest
```

恢复所有被 `vi.stubGlobal` 更改的 `globalThis`/`global`（以及 `window`/`top`/`self`/`parent`，如果你使用的是 `jsdom` 或 `happy-dom` 环境）上的全局值。当它第一次被调用时，Vitest 会记住原始值并存储它，直到再次调用 `unstubAllGlobals`。

```ts
import { vi } from 'vitest'

const Mock = vi.fn()

// 在调用 "stubGlobal" 之前 IntersectionObserver 是 "undefined"

vi.stubGlobal('IntersectionObserver', Mock)

IntersectionObserver === Mock
global.IntersectionObserver === Mock
globalThis.IntersectionObserver === Mock
// 如果你使用的是 jsdom 或 happy-dom
window.IntersectionObserver === Mock

vi.unstubAllGlobals()

globalThis.IntersectionObserver === undefined
'IntersectionObserver' in globalThis === false
// 抛出 ReferenceError，因为它未定义
IntersectionObserver === undefined
```

### vi.when <Version>5.0.0</Version> {#vi-when}

```ts
interface WhenOptions {
  onUnmatched?: 'throw' | 'passthrough' | ((...args: unknown[]) => unknown)
}

interface BehaviorOptions {
  times?: number
}

function when(spy: Mock, options?: WhenOptions): When
```

在间谍上按参数定义行为，在 `when` 链持续期间替换其实现。

在返回的对象上调用 `.calledWith(...args)` 来指定要匹配的调用参数，然后链式调用一个或多个 `then*` 方法，以声明当使用这些参数调用时，间谍应该返回、抛出或解析什么。参数按深度相等进行匹配，并支持诸如 `expect.any()` 之类的非对称匹配器。

```ts
const spy = vi.fn()

vi.when(spy)
  .calledWith(1)
  .thenReturn('one')
  .calledWith(2)
  .thenReturn('two')

expect(spy(1)).toBe('one')
expect(spy(2)).toBe('two')
```

可用的 `then*` 方法：

| 方法 | 描述 |
|--------|-------------|
| `thenReturn(value, options?)` | 返回 `value`。 |
| `thenReturnOnce(value)` | 返回一次 `value`，然后回退。 |
| `thenThrow(error, options?)` | 抛出 `error`。 |
| `thenThrowOnce(error)` | 只抛出一次 `error`，然后回退。 |
| `thenResolve(value, options?)` | 返回一个以 `value` 解析的 `Promise`。 |
| `thenResolveOnce(value)` | 只解析一次，然后回退。 |
| `thenReject(error, options?)` | 返回一个以 `error` 拒绝的 `Promise`。 |
| `thenRejectOnce(error)` | 只拒绝一次，然后回退。 |

可选的 `times` 选项限制某个行为在耗尽之前可应用的次数。针对相同参数注册的行为按后进先出方式消耗：最近注册的行为优先尝试，一旦耗尽，较早注册的行为作为回退。

```ts
const spy = vi.fn<(key: string) => string>()

vi.when(spy)
  .calledWith('theme')
  .thenReturn('light') // 回退，永久生效
  .thenReturn('dark', { times: 2 }) // 先应用于接下来的 2 次调用

expect(spy('theme')).toBe('dark')
expect(spy('theme')).toBe('dark')
expect(spy('theme')).toBe('light') // 回退
```

当使用未匹配任何已注册行为的参数调用时，间谍默认会回退到其原始实现。使用 `onUnmatched` 选项可更改此行为：

- `'passthrough'`（**默认**）：委托给间谍的原始实现
- `'throw'`：抛出一个列出未匹配参数的错误
- 一个函数：使用未匹配的参数调用；其返回值将被使用

```ts
const spy = vi.fn<(id: number) => string>()

vi.when(spy, { onUnmatched: 'throw' })
  .calledWith(1)
  .thenReturn('Alice')

expect(spy(1)).toBe('Alice')
expect(() => spy(99)).toThrow() // 未为 99 定义行为
```

`vi.when` 返回的 `When` 对象支持 [`toHaveBeenExhausted` 断言](/api/expect#tohavebeenexhausted)，当所有已注册行为都被消耗后，该断言通过。

```ts
const spy = vi.fn()
const w = vi.when(spy)
  .calledWith(1)
  .thenReturnOnce('once')
  .calledWith(2)
  .thenReturn('always')

expect(w).not.toHaveBeenExhausted()

spy(1) // 消耗 `thenReturnOnce` 行为
spy(2) // 满足 `thenReturn`（至少调用一次）

expect(w).toHaveBeenExhausted()
```

::: tip
在支持 [显式资源管理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management) 的环境中，你可以使用 `using` 代替 `const`，以便在包含块退出时自动恢复间谍的原始实现：

```ts
const spy = vi.fn(() => 'original')

{
  using w = vi.when(spy)
    .calledWith('hello')
    .thenReturn('mocked')

  expect(spy('hello')).toBe('mocked')
} // ← 间谍的原始实现在此处恢复

expect(spy('hello')).toBe('original')
```
:::

### vi.isWhenChain <Version>5.0.0</Version> {#vi-iswhenchain}

```ts
function isWhenChain(input: object): input is When
```

如果给定值是由 [`vi.when`](#vi-when) 创建的 `When` 链，则返回 `true`。如果你使用 TypeScript，它还会缩小其类型。

```ts
const spy = vi.fn()
const w = vi.when(spy).calledWith(1).thenReturn(0)

expect(vi.isWhenChain(w)).toBe(true)
expect(vi.isWhenChain(spy)).toBe(false)
```

## Fake Timers

本节介绍如何使用 [假计时器](/guide/mocking/timers)。

### vi.advanceTimersByTime

```ts
function advanceTimersByTime(ms: number): Vitest
```

此方法将调用每个已启动的计时器，直到指定的毫秒数过去或队列为空——以先发生者为准。

```ts
let i = 0
setInterval(() => console.log(++i), 50)

vi.advanceTimersByTime(150)

// 日志：1
// 日志：2
// 日志：3
```

### vi.advanceTimersByTimeAsync

```ts
function advanceTimersByTimeAsync(ms: number): Promise<Vitest>
```

此方法将调用每个已启动的计时器，直到指定的毫秒数过去或队列为空——以先发生者为准。这将包括异步设置的计时器。

```ts
let i = 0
setInterval(() => Promise.resolve().then(() => console.log(++i)), 50)

await vi.advanceTimersByTimeAsync(150)

// 日志：1
// 日志：2
// 日志：3
```

### vi.advanceTimersToNextTimer

```ts
function advanceTimersToNextTimer(): Vitest
```

将调用下一个可用的计时器。适用于在每次计时器调用之间进行断言。你可以链式调用它来自己管理计时器。

```ts
let i = 0
setInterval(() => console.log(++i), 50)

vi.advanceTimersToNextTimer() // 日志：1
  .advanceTimersToNextTimer() // 日志：2
  .advanceTimersToNextTimer() // 日志：3
```

### vi.advanceTimersToNextTimerAsync

```ts
function advanceTimersToNextTimerAsync(): Promise<Vitest>
```

将调用下一个可用的计时器，如果它是异步设置的，则等待直到它解析。适用于在每次计时器调用之间进行断言。

```ts
let i = 0
setInterval(() => Promise.resolve().then(() => console.log(++i)), 50)

await vi.advanceTimersToNextTimerAsync() // 日志：1
expect(console.log).toHaveBeenCalledWith(1)

await vi.advanceTimersToNextTimerAsync() // 日志：2
await vi.advanceTimersToNextTimerAsync() // 日志：3
```

### vi.advanceTimersToNextFrame {#vi-advancetimerstonextframe}

```ts
function advanceTimersToNextFrame(): Vitest
```

类似于 [`vi.advanceTimersByTime`](/api/vi#vi-advancetimersbytime)，但将通过执行当前使用 `requestAnimationFrame` 调度的回调所需的毫秒数来推进计时器。

```ts
let frameRendered = false

requestAnimationFrame(() => {
  frameRendered = true
})

vi.advanceTimersToNextFrame()

expect(frameRendered).toBe(true)
```

### vi.getTimerCount

```ts
function getTimerCount(): number
```

获取等待中的计时器数量。

### vi.clearAllTimers

```ts
function clearAllTimers(): void
```

移除所有计划运行的计时器。这些计时器将来永远不会运行。

### vi.getMockedSystemTime

```ts
function getMockedSystemTime(): Date | null
```

返回模拟的当前日期。如果日期未被模拟，该方法将返回 `null`。

### vi.getRealSystemTime

```ts
function getRealSystemTime(): number
```

当使用 `vi.useFakeTimers` 时，`Date.now` 调用会被模拟。如果你需要获取真实的毫秒时间，可以调用此函数。

### vi.runAllTicks

```ts
function runAllTicks(): Vitest
```

调用由 `process.nextTick` 排队的每个微任务。这也将运行由它们自己调度的所有微任务。

### vi.runAllTimers

```ts
function runAllTimers(): Vitest
```

此方法将调用每个已启动的计时器，直到计时器队列为空。这意味着在 `runAllTimers` 期间调用的每个计时器都会被触发。如果你有一个无限间隔，它将在 10,000 次尝试后抛出错误（可以使用 [`fakeTimers.loopLimit`](/config/faketimers#faketimers-looplimit) 配置）。

```ts
let i = 0
setTimeout(() => console.log(++i))
const interval = setInterval(() => {
  console.log(++i)
  if (i === 3) {
    clearInterval(interval)
  }
}, 50)

vi.runAllTimers()

// 日志：1
// 日志：2
// 日志：3
```

### vi.runAllTimersAsync

```ts
function runAllTimersAsync(): Promise<Vitest>
```

此方法将异步调用每个已启动的计时器，直到计时器队列为空。这意味着在 `runAllTimersAsync` 期间调用的每个计时器都会被触发，即使是异步计时器。如果你有一个无限间隔，它将在 10,000 次尝试后抛出错误（可以使用 [`fakeTimers.loopLimit`](/config/faketimers#faketimers-looplimit) 配置）。

```ts
setTimeout(async () => {
  console.log(await Promise.resolve('result'))
}, 100)

await vi.runAllTimersAsync()

// 日志：result
```

### vi.runOnlyPendingTimers

```ts
function runOnlyPendingTimers(): Vitest
```

此方法将调用在 [`vi.useFakeTimers`](#vi-usefaketimers) 调用之后启动的每个计时器。它不会触发在其调用期间启动的任何计时器。

```ts
let i = 0
setInterval(() => console.log(++i), 50)

vi.runOnlyPendingTimers()

// 日志：1
```

### vi.runOnlyPendingTimersAsync

```ts
function runOnlyPendingTimersAsync(): Promise<Vitest>
```

此方法将异步调用在 [`vi.useFakeTimers`](#vi-usefaketimers) 调用之后启动的每个计时器，即使是异步的。它不会触发在其调用期间启动的任何计时器。

```ts
setTimeout(() => {
  console.log(1)
}, 100)
setTimeout(() => {
  Promise.resolve().then(() => {
    console.log(2)
    setInterval(() => {
      console.log(3)
    }, 40)
  })
}, 10)

await vi.runOnlyPendingTimersAsync()

// 日志：2
// 日志：3
// 日志：3
// 日志：1
```

### vi.setSystemTime

```ts
function setSystemTime(date: string | number | Date): Vitest
```

如果启用了假计时器，此方法模拟用户更改系统时钟（将影响日期相关的 API，如 `hrtime`、`performance.now` 或 `new Date()`）——但是，它不会触发任何计时器。如果未启用假计时器，此方法将仅模拟 `Date.*` 调用。

如果你需要测试任何依赖于当前日期的内容，则很有用——例如代码中的 [Luxon](https://github.com/moment/luxon/) 调用。

接受与 `Date` 相同的字符串和数字参数。

```ts
const date = new Date(1998, 11, 19)

vi.useFakeTimers()
vi.setSystemTime(date)

expect(Date.now()).toBe(date.valueOf())

vi.useRealTimers()
```

### vi.useFakeTimers

```ts
function useFakeTimers(config?: FakeTimersConfig): Vitest
```

要启用计时器模拟，你需要调用此方法。它将包装所有后续的计时器调用（如 `setTimeout`、`setInterval`、`clearTimeout`、`clearInterval`、`setImmediate`、`clearImmediate` 和 `Date`），直到调用 [`vi.useRealTimers()`](#vi-userealtimers)。

当使用 `--pool=forks` 在 `node:child_process` 内部运行 Vitest 时，不支持模拟 `nextTick`。NodeJS 在 `node:child_process` 内部使用 `process.nextTick` 并在模拟时挂起。当使用 `--pool=threads` 运行 Vitest 时，支持模拟 `nextTick`。

实现内部基于 [`@sinonjs/fake-timers`](https://github.com/sinonjs/fake-timers)。

::: tip
`vi.useFakeTimers()` 不会自动模拟 `process.nextTick` 和 `queueMicrotask`。
但你可以通过在 `toFake` 参数中指定选项来启用它：`vi.useFakeTimers({ toFake: ['nextTick', 'queueMicrotask'] })`。
:::

你可以使用 `toFake` 指定要模拟哪些计时器，或者使用 `toNotFake` 指定要保持原生的计时器。请注意，`toFake` 和 `toNotFake` 不能同时指定。

```ts
// 只模拟 setTimeout 和 clearTimeout
vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

// 模拟除 setInterval 之外的所有计时器
vi.useFakeTimers({ toNotFake: ['setInterval'] })
```

### vi.setTimerTickMode <Version>4.1.0</Version> {#vi-settimertickmode}

- **类型：** `(mode: 'manual' | 'nextTimerAsync') => Vitest | (mode: 'interval', interval?: number) => Vitest`

控制如何推进假计时器。

- `manual`: 默认行为。只有当你调用 `vi.advanceTimers...()` 方法之一时，计时器才会推进。
- `nextTimerAsync`: 在每个宏任务之后，计时器将自动推进到下一个可用计时器。
- `interval`: 计时器按指定间隔自动推进。

当 `mode` 为 `'interval'` 时，你还可以提供毫秒为单位的 `interval`。

**示例：**

```ts
import { vi } from 'vitest'

vi.useFakeTimers()

// 手动模式（默认）
vi.setTimerTickMode('manual')

let i = 0
setInterval(() => console.log(++i), 50)

vi.advanceTimersByTime(150) // 日志 1, 2, 3

// nextTimerAsync 模式
vi.setTimerTickMode('nextTimerAsync')

// 计时器将在每个宏任务后自动推进
await new Promise(resolve => setTimeout(resolve, 150)) // 日志 4, 5, 6

// 间隔模式（当 'fakeTimers.shouldAdvanceTime' 为 `true` 时为默认）
vi.setTimerTickMode('interval', 50)

// 计时器将每 50ms 自动推进
await new Promise(resolve => setTimeout(resolve, 150)) // 日志 7, 8, 9
```

### vi.isFakeTimers {#vi-isfaketimers}

```ts
function isFakeTimers(): boolean
```

如果启用了假计时器，则返回 `true`。

### vi.useRealTimers

```ts
function useRealTimers(): Vitest
```

当计时器运行完后，你可以调用此方法将模拟的计时器返回到其原始实现。所有之前计划的计时器将被丢弃。

## 杂项

Vitest 提供的一组有用的辅助函数。

### vi.waitFor {#vi-waitfor}

```ts
function waitFor<T>(
  callback: WaitForCallback<T>,
  options?: number | WaitForOptions
): Promise<T>
```

等待回调成功执行。如果回调抛出错误或返回被拒绝的 promise，它将继续等待直到成功或超时。

如果 options 设置为数字，效果等同于设置 `{ timeout: options }`。

当你需要等待某些异步操作完成时，这非常有用，例如，当你启动一个服务器并需要等待它启动时。

```ts
import { expect, test, vi } from 'vitest'
import { createServer } from './server.js'

test('服务器成功启动', async () => {
  const server = createServer()

  await vi.waitFor(
    () => {
      if (!server.isReady) {
        throw new Error('服务器尚未启动')
      }

      console.log('服务器已启动')
    },
    {
      timeout: 500, // 默认是 1000
      interval: 20, // 默认是 50
    }
  )
  expect(server.isReady).toBe(true)
})
```

它也适用于异步回调

```ts
// @vitest-environment jsdom

import { expect, test, vi } from 'vitest'
import { getDOMElementAsync, populateDOMAsync } from './dom.js'

test('元素在 DOM 中存在', async () => {
  // 开始填充 DOM
  populateDOMAsync()

  const element = await vi.waitFor(async () => {
    // 尝试获取元素直到它存在
    const element = await getDOMElementAsync() as HTMLElement | null
    expect(element).toBeTruthy()
    expect(element.dataset.initialized).toBeTruthy()
    return element
  }, {
    timeout: 500, // 默认是 1000
    interval: 20, // 默认是 50
  })
  expect(element).toBeInstanceOf(HTMLElement)
})
```

如果使用了 `vi.useFakeTimers`，`vi.waitFor` 会在每个检查回调中自动调用 `vi.advanceTimersByTime(interval)`。

### vi.waitUntil {#vi-waituntil}

```ts
function waitUntil<T>(
  callback: WaitUntilCallback<T>,
  options?: number | WaitUntilOptions
): Promise<T>
```

这类似于 `vi.waitFor`，但如果回调抛出任何错误，执行会立即中断并收到错误消息。如果回调返回假值，下一次检查将继续直到返回真值。当你需要在进行下一步之前等待某物存在时，这很有用。

看下面的例子。我们可以使用 `vi.waitUntil` 等待元素出现在页面上，然后我们可以对该元素做一些操作。

```ts
import { expect, test, vi } from 'vitest'

test('元素渲染正确', async () => {
  const element = await vi.waitUntil(
    () => document.querySelector('.element'),
    {
      timeout: 500, // 默认是 1000
      interval: 20, // 默认是 50
    }
  )

  // 对元素做一些操作
  expect(element.querySelector('.element-child')).toBeTruthy()
})
```

### vi.hoisted {#vi-hoisted}

```ts
function hoisted<T>(factory: () => T): T
```

ES 模块中的所有静态 `import` 语句都会被提升（hoisted）到文件顶部，所以任何在导入之前定义的代码实际上会在导入评估之后执行。

然而，在导入模块之前调用一些副作用（如模拟日期）可能会很有用。

为了绕过这个限制，你可以将静态导入重写为动态导入，如下所示：

```diff
callFunctionWithSideEffect()
- import { value } from './some/module.js'
+ const { value } = await import('./some/module.js')
```

当运行 `vitest` 时，你可以使用 `vi.hoisted` 方法自动完成此操作。在底层，Vitest 会将静态导入转换为动态导入，同时保留实时绑定。

```diff
- callFunctionWithSideEffect()
import { value } from './some/module.js'
+ vi.hoisted(() => callFunctionWithSideEffect())
```

::: warning 导入不可用
在导入之前运行代码意味着你无法访问导入的变量，因为它们尚未定义：

```ts
import { value } from './some/module.js'

vi.hoisted(() => { value }) // 抛出错误 // [!code warning]
```

这段代码会产生一个错误：

```
Cannot access '__vi_import_0__' before initialization
```

如果你需要在 `vi.hoisted` 内部访问另一个模块的变量，请使用动态导入：

```ts
await vi.hoisted(async () => {
  const { value } = await import('./some/module.js')
})
```

然而，不建议在 `vi.hoisted` 内部导入任何内容，因为导入已经被提升了——如果你需要在测试运行之前执行某些操作，只需在导入的模块本身中执行即可。
:::

该方法返回工厂函数返回的值。如果你需要轻松访问本地定义的变量，可以在 `vi.mock` 工厂中使用该值：

```ts
import { expect, vi } from 'vitest'
import { originalMethod } from './path/to/module.js'

const { mockedMethod } = vi.hoisted(() => {
  return { mockedMethod: vi.fn() }
})

vi.mock('./path/to/module.js', () => {
  return { originalMethod: mockedMethod }
})

mockedMethod.mockReturnValue(100)
expect(originalMethod()).toBe(100)
```

请注意，即使你的环境不支持顶层 await，该方法也可以异步调用：

```ts
const json = await vi.hoisted(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  return response.json()
})
```

### vi.setConfig

```ts
function setConfig(config: RuntimeOptions): void
```

更新当前测试文件的配置。此方法仅支持会影响当前测试文件的配置选项：

```ts
vi.setConfig({
  allowOnly: true,
  testTimeout: 10_000,
  hookTimeout: 10_000,
  clearMocks: true,
  restoreMocks: true,
  fakeTimers: {
    now: new Date(2021, 11, 19),
    // 支持整个对象
  },
  maxConcurrency: 10,
  sequence: {
    hooks: 'stack'
    // 仅支持 "sequence.hooks"
  }
})
```

### vi.resetConfig

```ts
function resetConfig(): void
```

如果之前调用过 [`vi.setConfig`](#vi-setconfig)，这将把配置重置为原始状态。

### vi.defineHelper <Version>4.1.0</Version> {#vi-definehelper}

```ts
function defineHelper<F extends (...args: any) => any>(fn: F): F
```

包装一个函数以创建断言辅助函数。当辅助函数内部的断言失败时，错误堆栈跟踪将指向调用辅助函数的位置，而不是辅助函数内部。这使得在使用自定义断言函数时更容易识别测试失败的来源。

适用于同步和异步函数，并支持 `expect.soft()`。

```ts
import { expect, vi } from 'vitest'

const assertPair = vi.defineHelper((a, b) => {
  expect(a).toEqual(b)
})

test('example', () => {
  assertPair('left', 'right') // 错误指向此行
})
```

示例输出：

<!-- eslint-skip -->
```js
FAIL  example.test.ts > example
AssertionError: expected 'left' to deeply equal 'right'

Expected: "right"
Received: "left"

 ❯ example.test.ts:8:3
      7| test('example', () => {
      8|   assertPair('left', 'right')
       |   ^
      9| })
```
