---
title: 扩展匹配器 | 指南
---

# 扩展匹配器

由于 Vitest 兼容 Chai 和 Jest，你可以使用 [`chai.use`](https://www.chaijs.com/guide/plugins/) API 或 `expect.extend`，任选其一。

本指南将探讨如何使用 `expect.extend` 扩展匹配器。如果你对 Chai 的 API 感兴趣，请查看 [他们的指南](https://www.chaijs.com/guide/plugins/)。

要扩展默认匹配器，请使用包含你的匹配器的对象调用 `expect.extend`。

```ts
expect.extend({
  toBeFoo(received, expected) {
    const { isNot } = this
    return {
      // 不要根据 isNot 修改你的 "pass"。Vitest 会为你处理
      pass: received === 'foo',
      message: () => `${received} is${isNot ? ' not' : ''} foo`
    }
  }
})
```

如果你使用的是 TypeScript，你可以在环境声明文件（例如：`vitest.d.ts`）中使用以下代码扩展默认的 `Matchers` 接口：

```ts
import 'vitest'

declare module 'vitest' {
  interface Matchers<T = any> {
    toBeFoo: () => R
  }
}
```

::: tip
导入 `vitest` 会让 TypeScript 认为这是一个 ES 模块文件，没有它类型声明将无法工作。
:::

扩展 `Matchers` 接口将同时为 `expect.extend`、`expect().*` 和 `expect.*` 方法添加类型。

::: warning
别忘了在你的 `tsconfig.json` 中包含环境声明文件。
:::

匹配器的返回值应与以下接口兼容：

```ts
interface MatcherResult {
  pass: boolean
  message: () => string
  // 如果你传递这些，当匹配器未通过时，它们将自动出现在 diff 中
  // 所以你不需要自己打印 diff
  actual?: unknown
  expected?: unknown
}
```

::: warning
如果你创建了一个异步匹配器，别忘了在测试本身中 `await` 结果 (`await expect('foo').toBeFoo()`)：

```ts
expect.extend({
  async toBeAsyncAssertion() {
    // ...
  }
})

await expect().toBeAsyncAssertion()
```
:::

匹配器函数内的第一个参数是接收到的值（`expect(received)` 中的那个）。其余的是直接传递给匹配器的参数。自 4.1 版本以来，Vitest 暴露了几种可供自定义匹配器使用的类型：

```ts
import type {
  // 函数类型
  Matcher,
  // 返回值
  MatcherResult,
  // 作为 `this` 可用的状态
  MatcherState,
} from 'vitest'
import { expect } from 'vitest'

// 一个简单的匹配器，使用 "function" 以访问 "this"
const customMatcher: Matcher = function (received) {
  // ...
}

// 带参数的匹配器
const customMatcher: Matcher<MatcherState, [arg1: unknown, arg2: unknown]> = function (received, arg1, arg2) {
  // ...
}

// 带自定义注解的匹配器
function customMatcher(this: MatcherState, received: unknown, arg1: unknown, arg2: unknown): MatcherResult {
  // ...
  return {
    pass: false,
    message: () => 'something went wrong!',
  }
}

expect.extend({ customMatcher })
```

::: tip
要构建自定义 **快照匹配器**（`toMatchSnapshot()` / `toMatchInlineSnapshot()` / `toMatchFileSnapshot()` 的包装器），请使用从 `vitest` 导出的 `Snapshots`。参见 [自定义快照匹配器](/guide/snapshot#custom-snapshot-matchers)。
:::

匹配器函数可以访问具有以下属性的 `this` 上下文：

## `isNot`

如果匹配器是在 `not` 上调用的 (`expect(received).not.toBeFoo()`)，则返回 true。你不需要处理它，Vitest 会自动反转 `pass` 的值。

## `promise`

如果匹配器是在 `resolved/rejected` 上调用的，此值将包含修饰符的名称。否则，它将是一个空字符串。

## `equals`

这是一个允许你比较两个值的实用函数。如果值相等则返回 `true`，否则返回 `false`。此函数在内部几乎用于每个匹配器。默认情况下，它支持带有非对称匹配器的对象。

## `utils`

这包含一组可用于显示消息的实用函数。

`this` 上下文还包含有关当前测试的信息。你也可以通过调用 `expect.getState()` 获取它。最有用的属性是：

## `currentTestName`

当前测试的全名（包括 describe 块）。

## `task` <Advanced /> <Version>4.1.0</Version> {#task}

可用时包含对 [`Test` 运行器任务](/api/advanced/runner#tasks) 的引用。

::: warning
当在并发测试中使用全局 `expect` 时，`this.task` 为 `undefined`。请使用 `context.expect` 以确保 `task` 在自定义匹配器中可用。
:::

## `testPath`

当前测试的文件路径。

## `environment`

当前 [`environment`](/config/environment) 的名称（例如，`jsdom`）。

## `soft`

断言是否作为 [`soft`](/api/expect#soft) 调用。你不需要处理它，Vitest 总是会捕获错误。

## `assertion` <Advanced /> <Version type="experimental">4.1.4</Version> {#assertion}

The underlying [Chai assertion](https://www.chaijs.com/guide/plugins/) object. This is the same instance that Chai plugins receive, giving you access to Chai's flag system and chainable methods. This can be useful for building custom matchers that need to interact with Chai's internals.

::: tip
这些并不是所有可用的属性，只是最有用的那些。其他状态值由 Vitest 内部使用。
:::
