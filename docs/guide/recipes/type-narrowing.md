---
title: 测试中的类型收窄 | 诀窍
---

# 测试中的类型收窄

测试中到处都会遇到可能为 null 的值。`document.querySelector` 返回 `Element | null`，`Map.get(key)` 返回 `T | undefined`，类似的可选结构也遍布各处。测试代码里常见的变通办法是使用 `as` 做不安全类型转换，在每次访问时都用 `!` 做非空断言，或者使用像 `expect(x).toBeTruthy()` 这样的运行时检查，在值缺失时抛出错误。这三种方式都会增加噪音，而且运行时检查实际上具有误导性，因为它并不会像看起来那样收窄类型。

[`expect.assert`](/api/expect#assert) <Version>4.0.0</Version> 会在运行时抛出错误，并收窄 TypeScript 类型。一次调用即可替代这三种方式。

## 模式

```ts
import { expect, test } from 'vitest'

test('读取已存储的用户', () => {
  const cache = new Map<string, { id: string; name: string }>()
  cache.set('alice', { id: '1', name: 'Alice' })

  const user = cache.get('alice') // 类型为 `{ id, name } | undefined`
  expect.assert(user) // 如果为 undefined 就抛出错误，并向下收窄
  expect(user.name).toBe('Alice') // 不需要 `!`，也不需要 `as`，类型为 `{ id, name }`
})
```

同样的模式也适用于任何“查找一个值，检查它是否存在，然后使用它”的流程：

```ts
const job = queue.find(j => j.id === 'build-42') // Job | undefined
expect.assert(job)
job.cancel() // 收窄为 Job
```

## 为什么 `toBeTruthy` 不会收窄

`expect(x).toBeTruthy()` 和 `expect(x).toBeDefined()` 会在值缺失时于运行时抛出错误，因此测试会按你期望的方式失败。不过它们不会收窄类型，因为它们的 TypeScript 签名返回的是 `void`，而不是特殊的 `asserts` 形式。

`expect.assert` 的类型是断言函数，因此同一次调用可以同时完成这两件事。

## 超出 null 的收窄

`expect.assert` 接受任意布尔表达式，并应用与 TypeScript 在 `if` 分支中相同的收窄方式。这也适用于 `typeof` 和 `instanceof` 检查：

```ts
expect.assert(typeof input === 'string')
input.toUpperCase() // input 是 `string`

expect.assert(error instanceof MyError)
expect(error.code).toBe('E_FOO') // error 是 `MyError`
```

对于常见结构，chai 的 [`assert` API](/api/assert) 提供了一些预置辅助方法，可通过同样的 `expect.assert` 命名空间访问：

```ts
expect.assert.isDefined(maybeUser) // 收窄掉 `undefined`
expect.assert.isString(input) // 收窄为 string
expect.assert.instanceOf(error, MyError) // 收窄为 MyError
```

## 另请参阅

- [`expect.assert`](/api/expect#assert)
- [Chai `assert` API](/api/assert)
- [等待异步条件](/guide/recipes/wait-for)
