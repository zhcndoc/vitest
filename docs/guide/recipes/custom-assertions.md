---
title: 自定义断言辅助函数 | 配方
---

# 自定义断言辅助函数

可复用的断言辅助函数能让测试更易读，但代价是堆栈跟踪信息会受影响。当某个辅助函数内部的断言失败时，跟踪信息会指向辅助函数内部的那一行，而不是调用它的测试。对于在许多测试中共用同一个辅助函数的情况，仅凭堆栈跟踪并不能识别到底是哪个调用点失败了。

[`vi.defineHelper`](/api/vi#vi-defineHelper) <Version>4.1.0</Version> 会包装一个函数，使 Vitest 将其内部实现从堆栈中剥离，并把错误指回到调用点。

## 模式

```ts
import { expect, test, vi } from 'vitest'

const assertPair = vi.defineHelper((a: unknown, b: unknown) => {
  expect(a).toEqual(b) // ❌ 失败不会指向这里
})

test('example', () => {
  assertPair('left', 'right') // ✅ 失败会指向这里
})
```

当 `assertPair` 失败时，差异和堆栈帧会显示测试中调用它的那一行。这与内置 matcher 提供的行为相同。

## 组合多个期望

同样的包装器也适用于封装多个断言的辅助函数：

```ts
import { expect, test, vi } from 'vitest'

const expectValidUser = vi.defineHelper((user: unknown) => {
  expect(user).toHaveProperty('id')
  expect(user).toHaveProperty('email')
  expect(user.email).toMatch(/@/)
})

test('返回一个有效用户', async () => {
  const user = await fetchUser('alice')
  expectValidUser(user)
})
```

任何一个内部 `expect` 调用失败，都会被报告到测试中的 `expectValidUser(user)` 那一行。

只要一个可复用的检查会多次调用 `expect`，就应该使用 `defineHelper`，无论它是像 `expectValidJWT` 这样的领域特定辅助函数，还是任何原本会直接内联到每个测试中的 `expect` 代码块。

关于附加到 `expect.extend` 的非对称 matcher 和自定义 matcher，请参见[扩展 Matcher](/guide/extending-matchers)。

## 另请参阅

- [`vi.defineHelper`](/api/vi#vi-defineHelper)
- [扩展 Matcher](/guide/extending-matchers)
