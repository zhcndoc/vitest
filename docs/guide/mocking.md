---
title: 模拟 | 指南
outline: false
---

# 模拟

::: tip
刚接触模拟？先从 [模拟函数](/guide/learn/mock-functions) 教程开始，了解 `vi.fn`、`vi.spyOn` 和 `vi.mock` 的实际操作。
:::

在编写测试时，总会有需要为内部或外部服务创建“伪造”版本的时候。这通常被称为 **模拟**。Vitest 提供了实用函数，通过其 `vi` 工具帮助你完成这项工作。你可以从 `vitest` 导入它，或者在启用 [`global` 配置](/config/globals) 时全局访问。

::: warning
务必记得在每次测试运行前后清除或恢复 mock，以撤销运行之间的 mock 状态更改！请参阅 [`mockReset`](/api/mock#mockreset) 文档了解更多信息。
:::

如果你不熟悉 `vi.fn`、`vi.mock` 或 `vi.spyOn` 方法，请先查看 [API 部分](/api/vi)。

Vitest 有一份关于模拟的综合指南列表：

- [模拟类](/guide/mocking/classes.md)
- [模拟日期](/guide/mocking/dates.md)
- [模拟文件系统](/guide/mocking/file-system.md)
- [模拟函数](/guide/mocking/functions.md)
- [模拟全局变量](/guide/mocking/globals.md)
- [模拟模块](/guide/mocking/modules.md)
- [模拟请求](/guide/mocking/requests.md)
- [模拟定时器](/guide/mocking/timers.md)

若想更简单快速地开始模拟，你可以查看下面的速查表。

## 速查表

我想要…

### 模拟导出的变量
```js [example.js]
export const getter = 'variable'
```
```ts [example.test.ts]
import * as exports from './example.js'

vi.spyOn(exports, 'getter', 'get').mockReturnValue('mocked')
```

::: warning
这在浏览器模式（Browser Mode）下不起作用。有关解决方法，请参阅 [限制](/guide/browser/#spying-on-module-exports)。
:::

### 模拟导出的函数

1. 使用 `vi.mock` 的示例：

::: warning
别忘了 `vi.mock` 调用会被提升到文件顶部。它总是在所有导入之前执行。
:::

```ts [example.js]
export function method() {}
```
```ts
import { method } from './example.js'

vi.mock('./example.js', () => ({
  method: vi.fn()
}))
```

2. 使用 `vi.spyOn` 的示例：
```ts
import * as exports from './example.js'

vi.spyOn(exports, 'method').mockImplementation(() => {})
```

::: warning
`vi.spyOn` 示例在浏览器模式（Browser Mode）下不起作用。有关解决方法，请参阅 [限制](/guide/browser/#spying-on-module-exports)。
:::

### 模拟导出的类实现

1. 使用伪造 `class` 的示例：
```ts [example.js]
export class SomeClass {}
```
```ts
import { SomeClass } from './example.js'

vi.mock(import('./example.js'), () => {
  const SomeClass = vi.fn(class FakeClass {
    someMethod = vi.fn()
  })
  return { SomeClass }
})
```

2. 使用 `vi.spyOn` 的示例：

```ts
import * as mod from './example.js'

vi.spyOn(mod, 'SomeClass').mockImplementation(class FakeClass {
  someMethod = vi.fn()
})
```

::: warning
`vi.spyOn` 示例在浏览器模式（Browser Mode）下不起作用。有关解决方法，请参阅 [限制](/guide/browser/#spying-on-module-exports)。
:::

### 监听函数返回的对象

1. 使用缓存的示例：

```ts [example.js]
export function useObject() {
  return { method: () => true }
}
```

```ts [useObject.js]
import { useObject } from './example.js'

const obj = useObject()
obj.method()
```

```ts [useObject.test.js]
import { useObject } from './example.js'

vi.mock(import('./example.js'), () => {
  let _cache
  const useObject = () => {
    if (!_cache) {
      _cache = {
        method: vi.fn(),
      }
    }
    // 现在每次调用 useObject() 时
    // 都会返回相同的对象引用
    return _cache
  }
  return { useObject }
})

const obj = useObject()
// obj.method 在 some-path 中被调用
expect(obj.method).toHaveBeenCalled()
```

### 模拟模块的一部分

```ts
import { mocked, original } from './some-path.js'

vi.mock(import('./some-path.js'), async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    mocked: vi.fn()
  }
})
original() // 具有原始行为
mocked() // 是一个 spy 函数
```

::: warning
别忘了这仅 [模拟 _外部_ 访问](/guide/mocking/modules#mocking-modules-pitfalls)。在此示例中，如果 `original` 在内部调用 `mocked`，它将始终调用模块中定义的函数，而不是 mock 工厂中的函数。
:::

### 模拟当前日期

要模拟 `Date` 的时间，你可以使用 `vi.setSystemTime` 辅助函数。此值在不同测试之间 **不会** 自动重置。

请注意，使用 `vi.useFakeTimers` 也会更改 `Date` 的时间。

```ts
const mockDate = new Date(2022, 0, 1)
vi.setSystemTime(mockDate)
const now = new Date()
expect(now.valueOf()).toBe(mockDate.valueOf())
// 重置模拟时间
vi.useRealTimers()
```

### 模拟全局变量

你可以通过给 `globalThis` 赋值或使用 [`vi.stubGlobal`](/api/vi#vi-stubglobal) 辅助工具来设置全局变量。使用 `vi.stubGlobal` 时，它在不同测试之间 **不会** 自动重置，除非你启用 [`unstubGlobals`](/config/unstubglobals) 配置选项或调用 [`vi.unstubAllGlobals`](/api/vi#vi-unstuballglobals)。

```ts
vi.stubGlobal('__VERSION__', '1.0.0')
expect(__VERSION__).toBe('1.0.0')
```

### 模拟 `import.meta.env`

1. 要更改环境变量，你可以直接为其赋予新值。

::: warning
环境变量值在不同测试之间 **_不会_** 自动重置。
:::

```ts
import { beforeEach, expect, it } from 'vitest'

// 你可以在 beforeEach 钩子中手动重置它
const originalViteEnv = import.meta.env.VITE_ENV

beforeEach(() => {
  import.meta.env.VITE_ENV = originalViteEnv
})

it('changes value', () => {
  import.meta.env.VITE_ENV = 'staging'
  expect(import.meta.env.VITE_ENV).toBe('staging')
})
```

2. 如果你想自动重置值，可以使用 `vi.stubEnv` 辅助工具并启用 [`unstubEnvs`](/config/unstubenvs) 配置选项（或在 `beforeEach` 钩子中手动调用 [`vi.unstubAllEnvs`](/api/vi#vi-unstuballenvs)）：

```ts
import { expect, it, vi } from 'vitest'

// 运行测试前 "VITE_ENV" 为 "test"
import.meta.env.VITE_ENV === 'test'

it('changes value', () => {
  vi.stubEnv('VITE_ENV', 'staging')
  expect(import.meta.env.VITE_ENV).toBe('staging')
})

it('the value is restored before running an other test', () => {
  expect(import.meta.env.VITE_ENV).toBe('test')
})
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    unstubEnvs: true,
  },
})
```
