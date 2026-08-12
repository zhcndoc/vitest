---
title: 使用 vi.when 进行条件模拟 | 配方
---

# 使用 `vi.when` 进行条件模拟

::: tip 前置条件
本配方假定你已经对 Vitest 中的 [mocking](/guide/mocking) 有一定了解。
:::

当一个 mock 需要根据接收到的参数返回不同的值时，[`mockReturnValue`](/api/mock#mockreturnvalue) 就帮不上忙了，因为它总是返回相同的值。标准做法是使用带有 `switch` 或一系列 `if/else` 语句的 [`mockImplementation`](/api/mock#mockimplementation)：

```ts
db.findById.mockImplementation((id) => {
  if (id === 1) {
    return Promise.resolve({ id: 1, name: 'Ella' })
  }

  if (id === 2) {
    return Promise.resolve({ id: 2, name: 'Gracie' })
  }

  return Promise.resolve(undefined)
})
```

这能工作，但会变得繁琐，因为你必须自己编写参数匹配逻辑。在使用 [`vi.when`](/api/vi#vi-when) <Version>5.0.0</Version> API 时，Vitest 可以帮你处理这件事。

## 模式

`vi.when` 接受一个 spy，并允许你定义与参数相关的行为。

调用 `.calledWith(...args)` 来声明要匹配哪些参数。这会创建一个 _behavior_。

然后通过调用 `then*` 方法附加一个 _action_。该 action 决定当 behavior 匹配时会发生什么。

同一个 spy 上可以链式配置多个 behavior：

```ts
import { test, vi } from 'vitest'
import { getUserById } from './user.ts'

test('返回用户数据', async () => {
  const db = { findById: vi.fn<FindById>() }

  vi.when(db.findById)
    .calledWith(1)
    .thenResolve({ id: 1, name: 'Ella' })
    .calledWith(2)
    .thenResolve({ id: 2, name: 'Gracie' })

  await expect(getUserById(db, 1)).resolves.toEqual({ name: 'Ella' })
  await expect(getUserById(db, 2)).resolves.toEqual({ name: 'Gracie' })
})
```

这种方法适用于所有 mock 结果类型。以下是完整的 action 及其等价形式：

| Action | 等价于 | 等价代码 |
|---|---|---|
| `thenReturn(value)` | `mockReturnValue(value)` | `return value` |
| `thenThrow(error)` | `mockThrow(error)` | `throw error` |
| `thenResolve(value)` | `mockResolvedValue(value)` | `return Promise.resolve(value)` |
| `thenReject(error)` | `mockRejectedValue(error)` | `return Promise.reject(error)` |

## 叠加 actions

一个 behavior 可以附加多个 action。当 behavior 匹配时，actions 会按 **后进先出** 的顺序被 _consumed_：最近注册的 action 先执行。一旦该 action 被消耗，Vitest 就回退到前一个。使用 `times` 选项可以限制一个 action 在切换到下一个 action 之前处理多少次调用。没有 `times` 限制的 action 会无限期运行。

由于 actions 是按注册顺序的逆序进行评估的，因此应先注册无限期的 action，这样后面有限次的 action 才能暂时覆盖它们。

```ts
import { test, vi } from 'vitest'
import { readConfig } from './config.ts'

test('在初始失败后重试', async () => {
  const fetchInstance = vi.fn<() => Promise<unknown>>()

  vi.when(fetchInstance)
    .calledWith('/data/config.json')
    .thenResolve(new Response('{ debug: true }'))
    // ↳ 无限期回退
    .thenReject(new Error('network error'), { times: 1 })
    // ↳ 先应用，并在一次调用后被消耗

  await expect(readConfig(fetchInstance)).resolves.toEqual({ debug: true })

  expect(fetchInstance).toHaveBeenCalledTimes(2)
})
```

为方便起见，还提供了 `then*Once` 速记形式，它们等同于 `{ times: 1 }`：`thenReturnOnce`、`thenResolveOnce`、`thenThrowOnce`、`thenRejectOnce`。

## 非对称匹配器

`calledWith` 支持 [asymmetric matchers](/guide/learn/matchers#asymmetric-matchers)。当你关心参数的形状或类型而不是其精确值时，这很有用：

```ts
test('向每个收件人发送邮件', () => {
  vi.when(sendEmail)
    .calledWith(expect.stringContaining('@'))
    .thenReturn({ ok: true, message: 'sent via external relay' })
})
```

与 actions 不同，behaviors 按 **先进先出** 的顺序匹配。参数匹配调用的第一个 behavior 会获胜，就像一串 `if/else` 语句一样。因此，更具体的匹配器必须先注册，再注册范围更广的匹配器。

```ts
test('向每个收件人发送邮件', () => {
  vi.when(sendEmail)
    .calledWith(expect.stringContaining('@internal.example.com'))
    .thenReturn({ ok: true, message: 'sent via internal relay' })
    .calledWith(expect.stringContaining('@'))
    .thenReturn({ ok: true, message: 'sent via external relay' })
})
```

::: warning Behavior 合并
注册新的 behavior 时，Vitest 会按注册顺序检查已有的 behaviors。如果新的参数已经匹配到某个现有 behavior，则新的 action 会合并进该 behavior，而不是创建一个新的。

这对于范围很广的非对称匹配器尤其重要：

```ts
vi.when(getRole)
  .calledWith(expect.any(String))
  .thenReturn('user')
  .calledWith('admin@example.com')
  .thenReturnOnce('admin')
```

因为第二次注册会合并到已有的 behavior 中，所以 `'admin'` action 并不会仅作用于 `'admin@example.com'`。相反，它会成为整个 `expect.any(String)` behavior 的下一个 action。最终得到的 behavior 表现得就像下面这样：

```ts
vi.when(getRole)
  .calledWith(expect.any(String))
  .thenReturn('user')
  .thenReturnOnce('admin')
```

因此，第一次传入任意字符串时会返回 `'admin'`，而后续调用会返回 `'user'`：

```ts
expect(getRole('user@example.com')).toBe('admin')
expect(getRole('user@example.com')).toBe('user')
```
:::

## 处理未匹配的调用

默认情况下，当 spy 使用的参数没有匹配到任何已注册的 behavior 时，它会回退到 spy 的原始实现。如果 spy 没有原始实现，则返回 `undefined`。

有三种不同的处理方式：

1. [抛出错误](#onunmatched-throw)；
2. [运行自定义函数](#onunmatched-fn)；
3. [使用非对称匹配器作为兜底 behavior](#asymmetric-matcher-as-catch-all)。

### `onUnmatched: 'throw'`

传入 `{ onUnmatched: 'throw' }`，当 spy 使用未注册的参数被调用时就抛出错误：

```ts
vi.when(db.findById, { onUnmatched: 'throw' })
  .calledWith(1)
  .thenResolve({ id: 1, name: 'Ella' })

await expect(db.findById(1)).resolves.toMatchObject({ name: 'Ella' })
await expect(db.findById(3)).rejects.toThrow(
  'vi.when: no behavior defined when called with [3]',
)
```

错误消息中包含未匹配的参数。错误类型和消息是固定的，不能自定义。

### `onUnmatched: fn`

传入一个函数来处理未匹配的调用，并应用自定义逻辑，例如当共享 mock 需要针对每个测试提供不同的回退值时。

```ts
const db = { findById: vi.fn<FindById>() }

test('为未知 id 返回占位符', async () => {
  vi.when(
    db.findById,
    { onUnmatched: id => Promise.resolve({ id, name: `User ${id}` }) }
  )
    .calledWith(1)
    .thenResolve({ id: 1, name: 'Ella' })

  await expect(db.findById(1)).resolves.toMatchObject({ name: 'Ella' })
  await expect(db.findById(42)).resolves.toMatchObject({ name: 'User 42' })
})
```

该函数会以与 spy 相同的参数被调用，并且其返回值会直接作为 spy 的结果使用。如果它抛出错误或返回 rejected promise，则该错误会像任何 action 一样传播给调用方。

### 将非对称匹配器作为兜底

最后注册一个宽泛的 `calledWith` 会作为不匹配任何更早、更具体 behavior 的调用的回退。这个兜底 behavior 可以返回特定值、resolve 或 reject 一个 promise，或者抛出一个类型化错误。

```ts
vi.when(db.findById)
  .calledWith(1)
  .thenResolve({ id: 1, name: 'Ella' })
  .calledWith(2)
  .thenResolve({ id: 2, name: 'Gracie' })
  .calledWith(expect.any(Number))
  .thenReject(new Error('user not found'))
```

## 断言所有 behaviors 都已被调用

要检查所有已注册的 behaviors 是否都已实际匹配且其 actions 已被消耗，可以使用 `vi.when` 返回对象支持的 [`toHaveBeenExhausted`](/api/expect#tohavebeenexhausted) 断言：

```ts
test('加载两个用户', async () => {
  const db = { findById: vi.fn<FindById>() }

  const w = vi.when(db.findById)
    .calledWith(1)
    .thenResolveOnce({ id: 1, name: 'Ella' })
    .calledWith(2)
    .thenResolveOnce({ id: 2, name: 'Gracie' })

  await loadDashboard(db)

  expect(w).toHaveBeenExhausted()
})
```

在这个例子中，如果 `loadDashboard` 只调用了 `findById(1)`，测试会失败，并显示从未被匹配到的 behaviors 列表：

```
AssertionError: expected all behaviors to have been exhausted, but some remain:

  calledWith(2)
    ✗ thenReturn({ id: 2, name: 'Gracie' })  never called
```

::: warning 注意事项
没有 behaviors 的 `vi.when` 链永远不会被视为已耗尽。没有附加任何 `then*` action 的单独 `.calledWith()` 也是如此。两者都会始终导致 `toHaveBeenExhausted` 失败。

无限期 actions（没有 `times` 限制）在至少使用一次后即可满足耗尽检查。之后它们仍会继续响应，但断言会通过。
:::

## 使用 `using` 自动清理

`vi.when` 支持 [显式资源管理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management) 协议。

使用 `using` 声明该链，以将行为限定在当前块内，并在执行离开时自动恢复 spy。

```ts
const spy = vi.fn(() => 'original')

test('带有 mock 行为', () => {
  using w = vi.when(spy).calledWith('hello').thenReturn('mocked')
  expect(spy('hello')).toBe('mocked')
}) // ← 此处恢复

test('没有 mock 行为', () => {
  expect(spy('hello')).toBe('original')
})
```

## 另请参阅

- [`vi.when`](/api/vi#vi-when)
- [`toHaveBeenExhausted`](/api/expect#tohavebeenexhausted)
- [`vi.isWhenChain`](/api/vi#vi-iswhenchain)
- [`using 自动清理`](/guide/recipes/explicit-resources)。
