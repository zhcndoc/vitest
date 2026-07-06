---
title: detectAsyncLeaks | 配置
outline: deep
---

# detectAsyncLeaks

- **类型：** `boolean`
- **CLI：** `--detectAsyncLeaks`, `--detect-async-leaks`
- **默认值：** `false`

::: warning
启用此选项会使测试运行速度变慢很多。仅在调试或开发测试时使用。
:::

检测从测试文件泄漏的异步资源。
使用 [`node:async_hooks`](https://nodejs.org/api/async_hooks.html) 来跟踪异步资源的创建。如果资源未被清理，它将在测试结束后被记录。

例如，如果你的代码中有 `setTimeout` 调用在测试结束后执行回调，你将看到以下错误：

```sh
⎯⎯⎯⎯⎯⎯⎯⎯ 异步泄漏 1 ⎯⎯⎯⎯⎯⎯⎯⎯

Timeout 泄漏于 test/checkout-screen.test.tsx
 26|
 27|   useEffect(() => {
 28|     setTimeout(() => setWindowWidth(window.innerWidth), 150)
   |     ^
 29|   })
 30|
```

要修复此问题，你需要确保代码正确地清理了 timeout：

```js
useEffect(() => {
  setTimeout(setWindowWidth, 150, window.innerWidth) // [!code --]
  const timeout = setTimeout(setWindowWidth, 150, window.innerWidth) // [!code ++]

  return function cleanup() { // [!code ++]
    clearTimeout(timeout) // [!code ++]
  } // [!code ++]
})
```
