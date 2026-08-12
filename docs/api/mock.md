# 模拟

你可以使用 `vi.fn` 方法创建一个模拟函数或类来跟踪其执行情况。如果你想跟踪已创建对象上的属性，可以使用 `vi.spyOn` 方法：

```js
import { vi } from 'vitest'

const fn = vi.fn()
fn('hello world')
fn.mock.calls[0] === ['hello world']

const market = {
  getApples: () => 100
}

const getApplesSpy = vi.spyOn(market, 'getApples')
market.getApples()
getApplesSpy.mock.calls.length === 1
```

你应该在 [`expect`](/api/expect) 上使用模拟断言（例如 [`toHaveBeenCalled`](/api/expect#tohavebeencalled)）来断言模拟结果。此 API 参考描述了可用于操纵模拟行为的可用属性和方法。

::: warning 重要
Vitest 监听器在初始化时会继承实现的 [`length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length) 属性，但如果之后更改了实现，它不会覆盖该属性：

::: code-group
```ts [vi.fn]
const fn = vi.fn((arg1) => {})
fn.length // == 1

fn.mockImplementation(() => {})
fn.length // == 1
```
```ts [vi.spyOn]
const example = {
  fn(arg1, arg2) {
    // ...
  }
}

const fn = vi.spyOn(example, 'fn')
fn.length // == 2

fn.mockImplementation(() => {})
fn.length // == 2
```
:::

::: tip
下面类型中的自定义函数实现用泛型 `<T>` 标记。
:::

::: warning 类支持 {#class-support}
简写方法如 `mockReturnValue`、`mockReturnValueOnce`、`mockResolvedValue` 等不能用于模拟类。类构造函数关于返回值具有 [反直觉的行为](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor)：

```ts {2,7}
const CorrectDogClass = vi.fn(class {
  constructor(public name: string) {}
})

const IncorrectDogClass = vi.fn(class {
  constructor(public name: string) {
    return { name }
  }
})

const Marti = new CorrectDogClass('Marti')
const Newt = new IncorrectDogClass('Newt')

Marti instanceof CorrectDogClass // ✅ true
Newt instanceof IncorrectDogClass // ❌ false!
```

即使形状相同，构造函数的 _返回值_ 也被赋值给了 `Newt`，它是一个普通对象，而不是模拟的实例。Vitest 会在简写方法中防止这种行为（但在 `mockImplementation` 中不会！）并抛出错误。

如果你需要模拟类的构造实例，考虑使用 `class` 语法配合 `mockImplementation`：

```ts
mock.mockReturnValue({ hello: () => 'world' }) // [!code --]
mock.mockImplementation(class { hello = () => 'world' }) // [!code ++]
```

如果你需要测试这是有效用例的行为，可以将 `mockImplementation` 与 `constructor` 一起使用：

```ts
mock.mockImplementation(class {
  constructor(name: string) {
    return { name }
  }
})
```
:::

## getMockImplementation

```ts
function getMockImplementation(): T | undefined
```

如果存在，返回当前的模拟实现。

如果模拟是使用 [`vi.fn`](/api/vi#vi-fn) 创建的，它将使用提供的方法作为模拟实现。

如果模拟是使用 [`vi.spyOn`](/api/vi#vi-spyon) 创建的，除非提供了自定义实现，否则它将返回 `undefined`。

## getMockName

```ts
function getMockName(): string
```

用于返回通过 `.mockName(name)` 方法分配给模拟的名称。默认情况下，`vi.fn()` 模拟将返回 `'vi.fn()'`，而使用 `vi.spyOn` 创建的监听器将保留原始名称。

## mockClear

```ts
function mockClear(): Mock<T>
```

清除有关每次调用的所有信息。调用后，`.mock` 上的所有属性将返回到初始状态。此方法不会重置实现。它对于在不同断言之间清理模拟很有用。

```ts
const person = {
  greet: (name: string) => `Hello ${name}`,
}
const spy = vi.spyOn(person, 'greet').mockImplementation(() => 'mocked')
expect(person.greet('Alice')).toBe('mocked')
expect(spy.mock.calls).toEqual([['Alice']])

// 清除调用历史但保留模拟实现
spy.mockClear()
expect(spy.mock.calls).toEqual([])
expect(person.greet('Bob')).toBe('mocked')
expect(spy.mock.calls).toEqual([['Bob']])
```

要在每个测试前自动调用此方法，请在配置中启用 [`clearMocks`](/config/clearmocks) 设置。

## mockName

```ts
function mockName(name: string): Mock<T>
```

设置内部模拟名称。这对于在断言失败时识别模拟很有用。

## mockImplementation

```ts
function mockImplementation(fn: T): Mock<T>
```

接受一个函数用作模拟实现。TypeScript 期望参数和返回类型与原始函数匹配。

```ts
const mockFn = vi.fn().mockImplementation((apples: number) => apples + 1)
// 或：vi.fn(apples => apples + 1);

const NelliesBucket = mockFn(0)
const BobsBucket = mockFn(1)

NelliesBucket === 1 // true
BobsBucket === 2 // true

mockFn.mock.calls[0][0] === 0 // true
mockFn.mock.calls[1][0] === 1 // true
```

如果实现是一个类，mock 的 `prototype` 会重新指向该实现的 `prototype`，因此构造出的实例可以访问其原型方法，并且能够通过针对该实现的 `instanceof` 检查。详情请参阅[模拟类](/guide/mocking/classes)。

## mockImplementationOnce

```ts
function mockImplementationOnce(fn: T): Mock<T>
```

接受一个函数用作模拟实现。TypeScript 期望参数和返回类型与原始函数匹配。此方法可以链式调用以产生多个函数调用的不同结果。

```ts
const myMockFn = vi
  .fn()
  .mockImplementationOnce(() => true) // 第 1 次调用
  .mockImplementationOnce(() => false) // 第 2 次调用

myMockFn() // 第 1 次调用：true
myMockFn() // 第 2 次调用：false
```

当模拟函数用完实现时，它将调用使用 `vi.fn(() => defaultValue)` 或 `.mockImplementation(() => defaultValue)` 设置的默认实现（如果它们被调用过）：

```ts
const myMockFn = vi
  .fn(() => 'default')
  .mockImplementationOnce(() => 'first call')
  .mockImplementationOnce(() => 'second call')

// '第 1 次调用', '第 2 次调用', '默认', '默认'
console.log(myMockFn(), myMockFn(), myMockFn(), myMockFn())
```

## withImplementation

```ts
function withImplementation(
  fn: T,
  cb: () => void
): Mock<T>
function withImplementation(
  fn: T,
  cb: () => Promise<void>
): Promise<Mock<T>>
```

在执行回调期间临时覆盖原始模拟实现。

```js
const myMockFn = vi.fn(() => 'original')

myMockFn.withImplementation(() => 'temp', () => {
  myMockFn() // 'temp'
})

myMockFn() // 'original'
```

可以与异步回调一起使用。之后必须等待该方法才能使用原始实现。

```ts
test('async callback', () => {
  const myMockFn = vi.fn(() => 'original')

  // 我们 await 这个调用因为回调是异步的
  await myMockFn.withImplementation(
    () => 'temp',
    async () => {
      myMockFn() // 'temp'
    },
  )

  myMockFn() // 'original'
})
```

请注意，此方法优先于 [`mockImplementationOnce`](#mockimplementationonce)。

## mockRejectedValue

```ts
function mockRejectedValue(value: unknown): Mock<T>
```

接受一个错误，当调用异步函数时将拒绝该错误。

```ts
const asyncMock = vi.fn().mockRejectedValue(new Error('Async error'))

await asyncMock() // 抛出 Error<'Async error'>
```

## mockRejectedValueOnce

```ts
function mockRejectedValueOnce(value: unknown): Mock<T>
```

接受一个值，该值将在下一次函数调用期间被拒绝。如果链式调用，每个连续调用将拒绝指定的值。

```ts
const asyncMock = vi
  .fn()
  .mockResolvedValueOnce('first call')
  .mockRejectedValueOnce(new Error('Async error'))

await asyncMock() // '第 1 次调用'
await asyncMock() // 抛出 Error<'Async error'>
```

## mockReset

```ts
function mockReset(): Mock<T>
```

执行 [`mockClear`](#mockClear) 的操作并重置模拟实现。这也会重置所有 "once" 实现。

请注意，重置来自 `vi.fn()` 的模拟会将实现设置为返回 `undefined` 的空函数。重置来自 `vi.fn(impl)` 的模拟会将实现重置为 `impl`。

模拟的 `prototype` 链也会随之变化：对于 `vi.fn(impl)` 和 `vi.spyOn()`，它会恢复为原始类；对于 `vi.fn()`，它会恢复为普通对象，因此重置后构造的实例不再通过针对之前设置的类实现的 `instanceof` 检查。

当你想将模拟重置为其原始状态时，此方法很有用。

```ts
const person = {
  greet: (name: string) => `Hello ${name}`,
}
const spy = vi.spyOn(person, 'greet').mockImplementation(() => 'mocked')
expect(person.greet('Alice')).toBe('mocked')
expect(spy.mock.calls).toEqual([['Alice']])

// 清除调用历史并重置实现，但方法仍被监听
spy.mockReset()
expect(spy.mock.calls).toEqual([])
expect(person.greet).toBe(spy)
expect(person.greet('Bob')).toBe('Hello Bob')
expect(spy.mock.calls).toEqual([['Bob']])
```

要在每个测试前自动调用此方法，请在配置中启用 [`mockReset`](/config/mockreset) 设置。

## mockRestore

```ts
function mockRestore(): Mock<T>
```

执行 [`mockReset`](#mockreset) 的操作并恢复被监听对象的原始描述符，如果模拟是使用 [`vi.spyOn`](/api/vi#vi-spyon) 创建的。

`vi.fn()` 模拟上的 `mockRestore` 与 [`mockReset`](#mockreset) 相同。

```ts
const person = {
  greet: (name: string) => `Hello ${name}`,
}
const spy = vi.spyOn(person, 'greet').mockImplementation(() => 'mocked')
expect(person.greet('Alice')).toBe('mocked')
expect(spy.mock.calls).toEqual([['Alice']])

// 清除调用历史并恢复被监听对象的方法
spy.mockRestore()
expect(spy.mock.calls).toEqual([])
expect(person.greet).not.toBe(spy)
expect(person.greet('Bob')).toBe('Hello Bob')
expect(spy.mock.calls).toEqual([])
```

要在每个测试前自动调用此方法，请在配置中启用 [`restoreMocks`](/config/restoremocks) 设置。

## mockResolvedValue

```ts
function mockResolvedValue(value: Awaited<ReturnType<T>>): Mock<T>
```

接受一个值，当调用异步函数时将解析该值。TypeScript 将只接受与原始函数返回类型匹配的值。

```ts
const asyncMock = vi.fn().mockResolvedValue(42)

await asyncMock() // 42
```

## mockResolvedValueOnce

```ts
function mockResolvedValueOnce(value: Awaited<ReturnType<T>>): Mock<T>
```

接受一个值，该值将在下一次函数调用期间被解析。TypeScript 将只接受与原始函数返回类型匹配的值。如果链式调用，每个连续调用将解析指定的值。

```ts
const asyncMock = vi
  .fn()
  .mockResolvedValue('default')
  .mockResolvedValueOnce('first call')
  .mockResolvedValueOnce('second call')

await asyncMock() // 第 1 次调用
await asyncMock() // 第 2 次调用
await asyncMock() // 默认
await asyncMock() // 默认
```

## mockReturnThis

```ts
function mockReturnThis(): Mock<T>
```

如果你需要从方法返回 `this` 上下文而不调用实际实现，请使用此方法。这是以下内容的简写：

```ts
spy.mockImplementation(function () {
  return this
})
```

## mockReturnValue

```ts
function mockReturnValue(value: ReturnType<T>): Mock<T>
```

接受一个值，每当模拟函数被调用时将该值返回。TypeScript 只会接受与原函数返回类型匹配的值。

```ts
const mock = vi.fn()
mock.mockReturnValue(42)
mock() // 42
mock.mockReturnValue(43)
mock() // 43
```

## mockReturnValueOnce

```ts
function mockReturnValueOnce(value: ReturnType<T>): Mock<T>
```

接受一个值，每当模拟函数被调用时将该值返回。TypeScript 只会接受与原函数返回类型匹配的值。

当模拟函数用完实现时，如果曾调用过 `vi.fn(() => defaultValue)` 或 `.mockImplementation(() => defaultValue)`，它将调用设置的默认实现：

```ts
const myMockFn = vi
  .fn()
  .mockReturnValue('default')
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call')

// '第一次调用', '第二次调用', '默认', '默认'
console.log(myMockFn(), myMockFn(), myMockFn(), myMockFn())
```

## mockThrow <Version>4.1.0</Version> {#mockthrow}

```ts
function mockThrow(value: unknown): Mock<T>
```

接受一个值，每当模拟函数被调用时将该值抛出。

```ts
const myMockFn = vi.fn()
myMockFn.mockThrow(new Error('error message'))
myMockFn() // 抛出 Error<'error message'>
```

## mockThrowOnce <Version>4.1.0</Version> {#mockthrowonce}

```ts
function mockThrowOnce(value: unknown): Mock<T>
```

接受一个值，将在下一次函数调用期间抛出。如果链式调用，每个连续调用都将抛出指定的值。

```ts
const myMockFn = vi
  .fn()
  .mockReturnValue('default')
  .mockThrowOnce(new Error('first call error'))
  .mockThrowOnce('second call error')

expect(() => myMockFn()).toThrow('first call error')
expect(() => myMockFn()).toThrow('second call error')
expect(myMockFn()).toEqual('default')
```

## mock.calls

```ts
const calls: Parameters<T>[]
```

这是一个数组，包含每次调用的所有参数。数组的一项是该次调用的参数。

```js
const fn = vi.fn()

fn('arg1', 'arg2')
fn('arg3')

fn.mock.calls === [
  ['arg1', 'arg2'], // 第一次调用
  ['arg3'], // 第二次调用
]
```

:::warning 对象按引用存储
注意，Vitest 始终在 `mock` 状态的所有属性中通过引用存储对象。这意味着如果你的代码更改了这些属性，那么某些断言（如 [`.toHaveBeenCalledWith`](/api/expect#tohavebeencalledwith)）将无法通过：

```ts
const argument = {
  value: 0,
}
const fn = vi.fn()
fn(argument) // { value: 0 }

argument.value = 10

expect(fn).toHaveBeenCalledWith({ value: 0 }) // [!code --]

// 相等性检查是针对原始参数进行的，
// 但其属性在调用和断言之间被改变了
expect(fn).toHaveBeenCalledWith({ value: 10 }) // [!code ++]
```

在这种情况下，你可以自己克隆参数：

```ts{6}
const calledArguments = []
const fn = vi.fn((arg) => {
  calledArguments.push(structuredClone(arg))
})

expect(calledArguments[0]).toEqual({ value: 0 })
```
:::

## mock.lastCall

```ts
const lastCall: Parameters<T> | undefined
```

这包含最后一次调用的参数。如果模拟未被调用，它将返回 `undefined`。

## mock.results

```ts
interface MockResultReturn<T> {
  type: 'return'
  /**
   * 从函数返回的值。
   * 如果函数返回了一个 Promise，那么这将是已解析的值。
   */
  value: T
}

interface MockResultIncomplete {
  type: 'incomplete'
  value: undefined
}

interface MockResultThrow {
  type: 'throw'
  /**
   * 函数执行期间抛出的错误。
   */
  value: any
}

type MockResult<T>
  = | MockResultReturn<T>
    | MockResultThrow
    | MockResultIncomplete

const results: MockResult<ReturnType<T>>[]
```

这是一个数组，包含函数返回的所有值。数组中的每一项都是一个具有 `type` 和 `value` 属性的对象。可用的类型有：

- `'return'` - 函数返回而未抛出。
- `'throw'` - 函数抛出了一个值。
- `'incomplete'` - 函数尚未运行完毕。

`value` 属性包含返回值或抛出的错误。如果函数返回了一个 `Promise`，那么 `result` 将始终为 `'return'`，即使 `Promise` 被拒绝。

```js
const fn = vi.fn()
  .mockReturnValueOnce('result')
  .mockImplementationOnce(() => { throw new Error('thrown error') })

const result = fn() // 返回 'result'

try {
  fn() // 抛出 Error
}
catch {}

fn.mock.results === [
  // 第一个结果
  {
    type: 'return',
    value: 'result',
  },
  // 最后一个结果
  {
    type: 'throw',
    value: Error,
  },
]
```

## mock.settledResults

```ts
interface MockSettledResultIncomplete {
  type: 'incomplete'
  value: undefined
}

interface MockSettledResultFulfilled<T> {
  type: 'fulfilled'
  value: T
}

interface MockSettledResultRejected {
  type: 'rejected'
  value: any
}

export type MockSettledResult<T>
  = | MockSettledResultFulfilled<T>
    | MockSettledResultRejected
    | MockSettledResultIncomplete

const settledResults: MockSettledResult<Awaited<ReturnType<T>>>[]
```

一个数组，包含函数被解析或拒绝的所有值。

如果函数返回非 Promise 值，`value` 将保持不变，但 `type` 仍会显示为 `fulfilled` 或 `rejected`。

在值被解析或拒绝之前，`settledResult` 类型将为 `incomplete`。

```js
const fn = vi.fn().mockResolvedValueOnce('result')

const result = fn()

fn.mock.settledResults === [
  {
    type: 'incomplete',
    value: undefined,
  },
]

await result

fn.mock.settledResults === [
  {
    type: 'fulfilled',
    value: 'result',
  },
]
```

## mock.invocationCallOrder

```ts
const invocationCallOrder: number[]
```

此属性返回模拟函数的执行顺序。它是一个在所有已定义模拟之间共享的数字数组。

```js
const fn1 = vi.fn()
const fn2 = vi.fn()

fn1()
fn2()
fn1()

fn1.mock.invocationCallOrder === [1, 3]
fn2.mock.invocationCallOrder === [2]
```

## mock.contexts

```ts
const contexts: ThisParameterType<T>[]
```

此属性是一个数组，包含每次调用模拟函数时使用的 `this` 值。

```js
const fn = vi.fn()
const context = {}

fn.apply(context)
fn.call(context)

fn.mock.contexts[0] === context
fn.mock.contexts[1] === context
```

## mock.instances

```ts
const instances: ReturnType<T>[]
```

此属性是一个数组，包含使用 `new` 关键字调用模拟时创建的所有实例。注意，这里是函数的实际上下文（`this`），而不是返回值。

::: warning
如果使用 `new MyClass()` 实例化模拟，那么 `mock.instances` 将是一个只包含一个值的数组：

```js
const MyClass = vi.fn()
const a = new MyClass()

MyClass.mock.instances[0] === a
```

如果你从构造函数返回一个值，它不会出现在 `instances` 数组中，而是会出现在 `results` 中：

```js
const Spy = vi.fn(function () {
  return { method: vi.fn() }
})
const a = new Spy()

Spy.mock.instances[0] !== a
Spy.mock.results[0] === a
```
:::
