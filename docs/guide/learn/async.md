---
title: 异步代码测试 | 指南
prev:
  text: 使用匹配器
  link: /guide/learn/matchers
next:
  text: 设置与清理
  link: /guide/learn/setup-teardown
---

# 异步代码测试

JavaScript 代码经常异步运行。无论你是获取数据、读取文件还是等待计时器，Vitest 都需要在继续执行下一个测试之前知道被测试的代码何时完成。以下是你最常使用的模式。

## 异步/等待（Async/Await）

最直接的方法是将测试函数设为 `async`。Vitest 会自动等待返回的 Promise 解析完成，再认为测试结束。如果 Promise 被拒绝，测试会带着拒绝原因失败。

```js
import { expect, test } from 'vitest'

function fetchUser(id) {
  return Promise.resolve({ id, name: 'Alice' })
}

test('按 id 获取用户', async () => {
  const user = await fetchUser(1)
  expect(user.name).toBe('Alice')
})
```

这是你大多数时候会使用的模式。它的可读性就像同步代码一样，而且错误会通过 `await` 自然传递。

## Resolves 与 Rejects

有时你更愿意直接对 Promise 进行断言，而不是先 `await` 将其转为变量。[`.resolves`](/api/expect#resolves) 和 [`.rejects`](/api/expect#rejects) 助手允许你这样做。它们会解包 Promise，然后对解析或拒绝的值应用匹配器：

```js
test('解析为 Alice', async () => {
  await expect(fetchUser(1)).resolves.toMatchObject({ name: 'Alice' })
})

test('拒绝并抛出错误', async () => {
  await expect(fetchInvalidUser()).rejects.toThrow('User not found')
})
```

::: warning
不要忘记在 `expect` 前加上 `await`。Vitest 会检测到未被等待的断言并在测试结束时打印警告，但最好总是明确地包含 `await`。Vitest 也会在开始下一个测试前等待 `Promise.all` 中的所有挂起 Promise，但依赖这种行为会让测试更难理解。
:::

## 回调函数（Callbacks）

一些旧的 API 使用回调函数而不是 Promise。因为 Vitest 与 Promise 配合工作，最简单的方法是将回调包装在 `Promise` 中：

```js
function fetchData(callback) {
  setTimeout(() => callback('花生酱'), 100)
}

test('数据是花生酱', async () => {
  const data = await new Promise((resolve) => {
    fetchData(resolve)
  })
  expect(data).toBe('花生酱')
})
```

这种模式适用于任何基于回调的 API。将 `resolve` 作为成功回调传递，测试会等待直到回调被调用。

## 超时（Timeouts）

默认情况下，每个测试有 5 秒的超时时间。如果测试耗时更长（可能是因为 Promise 永远不解析，或者网络请求挂起），它会因超时错误而失败。这可以防止测试套件无限期卡住。

你可以为 `test` 设置第三个参数来自定义超时时间，这对确实需要更多时间的测试很有用：

```js
test('长时间运行的操作', async () => {
  await someSlowOperation()
}, 10_000) // 10 秒
```

如果你发现许多测试都需要更长的超时时间，可以通过 [`testTimeout`](/config/testtimeout) 配置选项更改所有测试的默认值：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 10_000,
  },
})
```

## 并发测试（Concurrent Tests）

默认情况下，文件内的测试按顺序运行。这通常是你想要的，特别是当测试共享设置代码时。但如果有许多相互独立的异步测试，每个测试大部分时间都在等待（网络、磁盘、计时器等），使用 [`test.concurrent`](/api/test#concurrent) 并发运行它们可以显著加快速度：

```js
test.concurrent('第一个异步测试', async () => {
  const result = await fetchUser(1)
  expect(result.name).toBe('Alice')
})

test.concurrent('第二个异步测试', async () => {
  const result = await fetchUser(2)
  expect(result.name).toBe('Bob')
})
```

请参阅 [并行性（Parallelism）](/guide/parallelism) 指南，了解 Vitest 如何并行运行测试的完整情况，包括跨文件和文件内。

## 未处理的拒绝（Unhandled Rejections）

默认情况下，Vitest 将未处理的 Promise 拒绝报告为测试运行中的错误。如果代码中某处的 Promise 被拒绝且未被捕获，测试运行会失败，即使所有断言都通过了。这是故意设计的：未处理的拒绝通常表示真实的 bug，比如忘记 `await` 或一个“发射后不管”的 Promise 默默失败。

```js
test('这会导致未处理的拒绝错误', () => {
  // 这个 Promise 被拒绝了，但从未被等待或捕获
  Promise.reject(new Error('oops'))
})
```

要修复这个问题，请确保你 `await` 所有 Promise 或捕获预期的拒绝：

```js
test('处理拒绝', async () => {
  // 要么等待 Promise
  await expect(Promise.reject(new Error('oops'))).rejects.toThrow('oops')

  // 要么如果不需要断言就显式捕获它
  Promise.reject(new Error('expected')).catch(() => {})
})
```

如果你的代码故意产生未处理的拒绝，可以使用 [`onUnhandledError`](/config/onunhandlederror) 过滤特定错误，或使用 [`dangerouslyIgnoreUnhandledErrors`](/config/dangerouslyignoreunhandlederrors) 完全禁用该检查。
