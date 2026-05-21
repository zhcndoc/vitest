---
title: 可取消的测试资源 | 配方
---

# 可取消的测试资源

测试可能会持有一些资源，即使测试停止了它们也不会停止。`fetch`、子进程、文件流、轮询循环：当 Vitest 取消测试时，这些都不会察觉，而工作线程只能在那里等待它们自行完成。当测试超过其 `timeout`，当另一个测试在 `--bail` 下失败，或者当有人在终端中按下 <kbd>Ctrl</kbd>+<kbd>C</kbd> 时，Vitest 会取消测试。

测试上下文提供了一个 [`signal`](/guide/test-context#signal) <Version>3.2.0</Version>，它会在上述所有情况下触发。将它传递给任何接受 `AbortSignal` 的内容，当 Vitest 取消时，资源就会被释放。

## 模式

```ts
import { test } from 'vitest'

test('当测试超时时停止请求', async ({ signal }) => {
  await fetch('/heavy-resource', { signal })
}, 2000)
```

如果请求在 2 秒内还未完成，`fetch` 会以 `AbortError` 拒绝，而不是让测试一直挂起直到操作结束。

## 其他接受 `AbortSignal` 的 Web API

- [`fetch`](https://developer.mozilla.org/docs/Web/API/fetch)
- [`addEventListener`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener)，传入 `{ signal }` 时，会在中止时移除监听器
- [`ReadableStream.pipeTo`](https://developer.mozilla.org/docs/Web/API/ReadableStream/pipeTo)
- Node.js API，例如 [`fs.readFile`](https://nodejs.org/api/fs.html#fspromisesreadfilepath-options)、[`child_process.spawn`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) 和 [`setTimeout` 或 `setInterval`](https://nodejs.org/api/timers.html)，它们都接受 `{ signal }`
- 任何调用 `signal.throwIfAborted()` 或监听 `'abort'` 的自定义代码

## 传递信号

将测试的信号接入你自己的辅助函数，让取消一路向下传播：

```ts
async function pollUntilReady(url: string, signal: AbortSignal) {
  while (!signal.aborted) {
    const res = await fetch(url, { signal })
    if (res.ok) {
      return
    }
    await new Promise(r => setTimeout(r, 200))
  }
  signal.throwIfAborted()
}

test('worker becomes ready', async ({ signal }) => {
  await pollUntilReady('http://localhost:4000/health', signal)
}, 5000)
```

## 另见

- [`signal` 在测试上下文中](/guide/test-context#signal)
- [`bail`](/config/bail)
- [`testTimeout`](/config/testtimeout)
