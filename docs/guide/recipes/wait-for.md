---
title: 等待异步条件 | Recipes
---

# 等待异步条件

测试中的很多事情不会同步发生。服务器启动需要一点时间，或者 DOM 元素会在一个微任务之后才渲染出来。使用 `setTimeout` 来等待，往往要么会因为等待不足而变得不稳定，要么会因为睡太久而浪费时间，而手写一个轮询循环又比你希望为每个测试编写的代码更多。

Vitest 提供了帮你轮询的辅助方法，会按固定间隔重试，直到条件成立或超时结束。

## `expect.poll`：重试断言

当等待条件是一个断言时，使用 [`expect.poll`](/api/expect#poll)。回调返回要断言的值，matcher 负责比较，Vitest 会在每个间隔重新执行整个表达式，直到 matcher 通过。

```ts
import { expect, test } from 'vitest'
import { createServer } from './server.ts'

test('server starts', async () => {
  const server = createServer()

  await expect.poll(() => server.isReady, {
    timeout: 500,
    interval: 20
  }).toBe(true)
})
```

失败信息就是标准的 `expect` diff，不需要手动维护 `throw new Error('Server not started')`。对于大多数“等待 X 变成 Y”的场景，这是正确的工具。

`expect.poll` 会让每个断言都变成异步的，所以调用时必须 `await`。有些 matcher 不适合和它搭配：snapshot matcher（在轮询下它们总会成功）、`.resolves` 和 `.rejects`（条件本身已经被 `await` 了），以及 `toThrow`（值在 matcher 看到它之前就已经被解析了）。对于这些情况，请改用 `vi.waitFor`。

## `vi.waitFor`：等待并捕获返回值

当等待条件本身是某段工作成功完成，而不是你写出的一个断言时，[`vi.waitFor`](/api/vi#vi-waitfor) 是合适的工具。它会在每个间隔执行回调；如果抛出错误，就会安排下一次尝试，而第一次不抛错的调用会用回调返回的内容来解析等待。

```ts
import { expect, test, vi } from 'vitest'
import { connect, DB_URL } from './db.ts'

test('database is reachable', async () => {
  // 在数据库接受连接之前，`connect` 会抛出 ECONNREFUSED
  const client = await vi.waitFor(() => connect(DB_URL), {
    timeout: 5000,
    interval: 100,
  })

  const rows = await client.query('SELECT 1 AS ok')
  expect(rows[0].ok).toBe(1)
})
```

驱动重试的抛错来自 `connect` 本身，而不是你在回调里写的某个 `expect`。`expect.poll` 不适合这种形式，因为它是围绕断言构建的，而“重试直到这个调用不再抛错并把结果交给我”并不是一个断言。把调用包进 `try`/`catch` 里假装成断言，要么会在等待后重复工作，要么就得手写整个重试循环。

## `vi.waitUntil`：轮询直到为真，出错则快速失败

当你要查找一个值，并且任何抛出的错误都应该立刻使测试失败，而不是被重试掩盖时，使用 [`vi.waitUntil`](/api/vi#vi-waituntil)。每个间隔都会再次调用回调。返回真值会解析等待；返回假值则等待下一个间隔。抛出的错误会立即使测试失败。

```ts
import { expect, test, vi } from 'vitest'
import { jobResults, startJob } from './worker.ts'

test('worker completes the job', async () => {
  startJob('build-42')

  const result = await vi.waitUntil(
    () => jobResults.get('build-42'),
    { timeout: 5000, interval: 100 },
  )

  expect(result.status).toBe('ok')
  expect(result.steps).toHaveLength(4)
})
```

`jobResults.get('build-42')` 返回 `JobResult | undefined`。`waitUntil` 会一直轮询，直到它返回真值，把解析后的类型缩窄为 `JobResult`，并将其返回以便继续断言。如果查找本身因为程序错误而抛出，例如导入里写错了拼写，`waitUntil` 会在第一次尝试时直接暴露该错误，而不是继续重试将其掩盖。

在浏览器模式下，对于 DOM 查询，优先使用 [`page.locator`](/api/browser/locators) 和 [`expect.element`](/api/browser/assertions)，而不是 `waitUntil`：locator 会自行重试，并且会提供更丰富的失败信息。

## 它们之间如何选择

|  | `expect.poll` | `vi.waitFor` | `vi.waitUntil` |
| --- | --- | --- | --- |
| 适合在何时使用 | 等待条件是一个断言 | 在准备好之前，工作本身可能会失败 | 查找结果可能是 falsy，这没关系 |
| 遇到抛错时是否重试 | 是 | 是 | 否，快速失败 |
| 返回结果 | 断言结果 | 回调的返回值 | 回调的返回值 |

这些方法都接受 `{ timeout, interval }` 选项，默认是 1000 ms 超时和 50 ms 间隔。`vi.waitFor` 和 `vi.waitUntil` 也接受一个数字来代替 options 对象，作为 timeout 的简写。

## Fake timers

如果 [`vi.useFakeTimers`](/api/vi#vi-usefaketimers) 处于激活状态，`vi.waitFor` 会在每次尝试之间自动调用 `vi.advanceTimersByTime(interval)`。这样可以让基于 `setTimeout` 的被测代码在测试中保持可达，而不会把真实时间泄漏进测试。

## 另请参阅

- [`expect.poll`](/api/expect#poll)
- [`vi.waitFor`](/api/vi#vi-waitfor)
- [`vi.waitUntil`](/api/vi#vi-waituntil)
- [`vi.useFakeTimers`](/api/vi#vi-usefaketimers)
