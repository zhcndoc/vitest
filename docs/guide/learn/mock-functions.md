---
title: 模拟函数 | 指南
prev:
  text: 安装与清理
  link: /guide/learn/setup-teardown
next:
  text: 快照测试
  link: /guide/learn/snapshots
---

# 模拟函数

在编写测试时，你经常需要用一个受控的版本替换真实的函数或模块。这被称为 **模拟（mocking）**。你可能希望这样做有几个原因：也许真实的函数会发起网络请求，从而拖慢测试速度；或者你需要模拟一个难以通过真实代码触发的错误。模拟函数允许你控制依赖项的返回值，观察其调用方式，并将待测试代码与副作用隔离开来。

Vitest 通过 [`vi`](/api/vi) 对象提供模拟工具。

## 创建模拟函数

创建模拟的最简单方式是使用 [`vi.fn()`](/api/vi#vi-fn)。这将给你一个默认不做任何事情（返回 `undefined`）的函数，但会跟踪每一次调用：

```js
import { expect, test, vi } from 'vitest'

test('mock function basics', () => {
  const getApples = vi.fn()

  // 调用它
  getApples()

  // 检查是否被调用
  expect(getApples).toHaveBeenCalled()
  expect(getApples).toHaveBeenCalledTimes(1)

  // 默认情况下，模拟函数返回 undefined
  expect(getApples()).toBeUndefined()
})
```

## 模拟返回值

一个始终返回 `undefined` 的模拟函数本身并不太有用。通常你希望控制它的返回值，以便测试代码对不同值的反应：

```js
import { expect, test, vi } from 'vitest'

test('mock return values', () => {
  const getApples = vi.fn()

  // 始终返回这个值
  getApples.mockReturnValue(10)
  expect(getApples()).toBe(10)

  // 仅这一次返回值，之后恢复默认
  getApples.mockReturnValueOnce(20)
  expect(getApples()).toBe(20) // 20（一次性）
  expect(getApples()).toBe(10) // 回到默认值
})
```

如果你模拟的是一个异步函数，请使用 [`mockResolvedValue`](/api/mock#mockresolvedvalue) 和 [`mockRejectedValue`](/api/mock#mockrejectedvalue) 来控制 Promise 的结果：

```js
test('mock async return values', async () => {
  const fetchUser = vi.fn()

  fetchUser.mockResolvedValue({ name: 'Alice' })
  const user = await fetchUser()
  expect(user.name).toBe('Alice')

  fetchUser.mockRejectedValue(new Error('Not found'))
  await expect(fetchUser()).rejects.toThrow('Not found')
})
```

## 模拟实现

有时你需要的不仅仅是固定的返回值。你希望模拟函数实际对其参数执行某些操作。这时可以使用 [`mockImplementation`](/api/mock#mockimplementation) 提供一个完整的替代函数：

```js
import { expect, test, vi } from 'vitest'

test('mock with custom implementation', () => {
  const add = vi.fn()
  add.mockImplementation((a, b) => a + b)

  expect(add(1, 2)).toBe(3)
  expect(add(10, 20)).toBe(30)
})
```

作为一种简写方式，你可以直接将实现函数传递给 `vi.fn()`：

```js
const add = vi.fn((a, b) => a + b)
```

## 检查调用情况

模拟函数的一大优势是它们会记住每一次调用。你可以对函数被调用的次数、接收到的参数以及返回值进行断言：

```js
import { expect, test, vi } from 'vitest'

test('inspecting mock calls', () => {
  const greet = vi.fn()

  greet('Alice')
  greet('Bob', 'Charlie')

  // 调用次数
  expect(greet).toHaveBeenCalledTimes(2)

  // 检查特定参数
  expect(greet).toHaveBeenCalledWith('Alice')
  expect(greet).toHaveBeenCalledWith('Bob', 'Charlie')

  // 访问原始调用数据
  expect(greet.mock.calls).toEqual([
    ['Alice'],
    ['Bob', 'Charlie'],
  ])
})
```

`.mock` 属性提供了对调用历史的完整访问。除了 `.mock.calls`，你还可以检查 `.mock.results` 来查看每次调用是返回了值还是抛出了异常：

```js
const double = vi.fn(x => x * 2)

double(5)
double(10)

expect(double.mock.results).toEqual([
  { type: 'return', value: 10 },
  { type: 'return', value: 20 },
])
```

::: warning
`.mock.calls` 存储的是参数的引用，而不是副本。如果你将一个对象传给模拟函数，随后又修改了该对象，记录的调用将反映修改后的状态，而不是调用时的状态：

```js
const fn = vi.fn()
const obj = { count: 1 }

fn(obj)
obj.count = 2

// ❌ 这会失败！mock.calls[0][0].count 现在是 2，而不是 1
expect(fn).toHaveBeenCalledWith({ count: 1 })
```

如果你需要在断言中使用原始值，可以使用 `mockImplementation` 在调用时捕获克隆：

```js
const calls = []
const fn = vi.fn((obj) => {
  calls.push(structuredClone(obj))
})

const obj = { count: 1 }
fn(obj)
obj.count = 2

expect(calls[0]).toEqual({ count: 1 }) // ✅ 通过
```

或者，你可以在变量被修改之前进行断言。
:::

## 监视方法

[`vi.spyOn`](/api/vi#vi-spyon) 与 `vi.fn()` 有一个重要区别。它不会创建一个全新的函数，而是包装一个对象上 *已存在* 的方法。原始实现默认仍然有效，但你可以观察每一次调用，并选择性地覆盖其行为：

```js
import { expect, test, vi } from 'vitest'

const calculator = {
  add(a, b) {
    return a + b
  },
}

test('spy on a method', () => {
  const spy = vi.spyOn(calculator, 'add')

  // 原始实现仍然有效
  expect(calculator.add(1, 2)).toBe(3)

  // 但我们可以观察调用
  expect(spy).toHaveBeenCalledWith(1, 2)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('spy can override implementation', () => {
  const spy = vi.spyOn(calculator, 'add')
  spy.mockReturnValue(42)

  expect(calculator.add(1, 2)).toBe(42)
})
```

这在你希望验证代码是否正确调用了某个方法，但又不想完全替换其行为时特别有用。

## 重置模拟函数

模拟函数会随着测试运行累积状态。它们会记住每一次调用、每一次返回值，以及你设置的任何自定义实现。如果不在测试之间重置它们，这些状态可能会泄露并导致令人困惑的失败。Vitest 提供了三种清理级别：

- **[`mockClear()`](/api/mock#mockclear)** 清除记录的调用历史和返回值，但保留你设置的任何自定义实现
- **[`mockReset()`](/api/mock#mockreset)** 执行 `mockClear` 的所有操作，并移除自定义实现，将模拟函数恢复到默认状态
- **[`mockRestore()`](/api/mock#mockrestore)** 专门用于 `vi.spyOn` 创建的间谍。它会恢复原始对象方法，实际上取消了间谍。对于 `vi.fn()` 模拟函数，其行为与 `mockReset` 相同

在实践中，最简单的方法是在每个测试后自动恢复所有模拟：

```js
import { afterEach, expect, test, vi } from 'vitest'

const calculator = {
  add: (a, b) => a + b,
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('spy is restored after the test', () => {
  const spy = vi.spyOn(calculator, 'add').mockReturnValue(42)
  expect(calculator.add(1, 2)).toBe(42)
  // afterEach 会将 calculator.add 恢复为原始实现
})
```

更好的方式是全局配置 [`restoreMocks`](/config/restoremocks) 选项，这样你就不需要手动添加 `afterEach` 了：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
  },
})
```

## 模拟模块

有时你需要替换整个 [模块](/guide/mocking/modules)，而不仅仅是单个函数。例如，一个数据库客户端或你不想在测试中运行的日志记录器。你可以使用 [`vi.mock`](/api/vi#vi-mock) 来用模拟实现替换模块的导出：

```js
import { expect, test, vi } from 'vitest'
import { getUser } from './db.js'

vi.mock(import('./db.js'), () => ({
  getUser: vi.fn(),
}))

test('mock a module', () => {
  vi.mocked(getUser).mockReturnValue({ name: 'Alice' })

  const user = getUser(1)
  expect(user.name).toBe('Alice')
  expect(getUser).toHaveBeenCalledWith(1)
})
```

::: warning
[`vi.mock`](/api/vi#vi-mock) 的调用会被提升到文件顶部。它们在导入之前运行。这意味着模拟版本在测试代码执行时已经就位。
:::

::: tip
请注意，我们传递的是 `import('./db.js')` 而不是一个简单的字符串 `'./db.js'`。当你使用 `import()` 时，TypeScript 可以推断模块的类型，因此工厂函数的返回值会进行类型检查，并且 `importOriginal` 会返回正确类型的模块。作为额外好处，如果你在 IDE 中重命名或移动文件，导入路径会自动更新。如果使用字符串，你将同时失去类型安全和自动重构功能。
:::

Vitest 提供了针对特定模拟场景的完整指南：

- [模拟函数](/guide/mocking/functions)
- [模拟模块](/guide/mocking/modules)
- [模拟定时器](/guide/mocking/timers)
- [模拟日期](/guide/mocking/dates)
- [模拟全局变量](/guide/mocking/globals)
- [模拟请求](/guide/mocking/requests)
- [模拟文件系统](/guide/mocking/file-system)
- [模拟类](/guide/mocking/classes)
