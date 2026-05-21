---
title: 使用 `using` 自动清理 | 配方
---

# 使用 `using` 自动清理

Spy 和 mock 需要在安装它们的测试结束后恢复，否则状态会在测试之间泄漏。通常的做法是在测试套件级别使用 `afterEach(() => vi.restoreAllMocks())`，或者在每个测试中内联使用 [`onTestFinished(() => spy.mockRestore())`](/api/hooks#ontestfinished)。

如果你的运行时支持 [显式资源管理](https://github.com/tc39/proposal-explicit-resource-management)（Node.js 24+，或者在现代打包器中通过 TypeScript 5.2+），还有一个更简洁的选择：用 `using` 而不是 `const` 来声明 spy，当代码块退出时会自动恢复。

这适用于 [`vi.spyOn`](/api/vi#vi-spyon)、[`vi.fn`](/api/vi#vi-fn) 和 [`vi.doMock`](/api/vi#vi-domock)。<Version>3.2.0</Version>

## 模式

```ts
import { expect, it, vi } from 'vitest'

function debug(message: string) {
  console.log(message)
}

it('calls console.log', () => {
  using spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  debug('message')
  expect(spy).toHaveBeenCalled()
})

// console.log 会在这里恢复，无需 afterEach
```

同样的模式也适用于 `vi.doMock`，它会返回一个可释放对象，在作用域退出时排队执行取消 mock：

```ts
import { expect, it, vi } from 'vitest'

it('uses the mocked module, then the real one', async () => {
  {
    using _mock = vi.doMock('./users', () => ({
      loadUser: () => ({ id: '1', name: 'Alice' }),
    }))
    const { loadUser } = await import('./users')
    expect(loadUser('alice').name).toBe('Alice')
  }

  // 从这里开始，./users 将取消 mock
})
```

## 作用域可限定到任意代码块

`using` 具有块级作用域，因此你可以只在测试的一部分中安装 spy。这种情况 `afterEach` 和 `onTestFinished` 都无法覆盖，因为它们都会在测试结束后运行：

```ts
import { expect, it, vi } from 'vitest'

it('only mocks fetch for the auth call', async () => {
  // 这里使用真实的 fetch
  await preloadConfig()

  {
    using fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{"ok":true}'))

    await login('alice', 'secret')
    expect(fetchSpy).toHaveBeenCalledOnce()
  }

  // 真实的 fetch 已恢复
  await reportSuccess()
})
```

这也是一种避免启用全局 `restoreMocks: true` 配置的方法，尤其是在只有少数调用实际上需要恢复时。

## 兼容性

`using` 需要支持 TC39 显式资源管理提案：

- TypeScript ≥ 5.2（需要 `target: 'es2022'` 或更高，并且默认包含 `disposable` 库）。
- Node.js ≥ 24（或在 Node 22+ 中使用 `--harmony` 风格标志）用于原生运行时支持。

如果你的环境目前还不支持它，那么用于整个测试清理的最接近等价物是 [`onTestFinished`](/api/hooks#ontestfinished)，它会在代码中内联注册清理，并在测试完成后运行，不论通过还是失败：

```ts
import { expect, it, onTestFinished, vi } from 'vitest'

it('calls console.log', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  onTestFinished(() => spy.mockRestore())

  debug('message')
  expect(spy).toHaveBeenCalled()
})
```

`onTestFinished` 不能像 `using` 那样在测试中途拆除 spy，因此上面的块级作用域模式仍然是 ERM 特有的。

## 另请参阅

- [`vi.spyOn`](/api/vi#vi-spyon)
- [`vi.fn`](/api/vi#vi-fn)
- [`vi.doMock`](/api/vi#vi-domock)
- [`onTestFinished`](/api/hooks#ontestfinished)
- [`restoreMocks`](/config/restoremocks)
- [TC39 显式资源管理提案](https://github.com/tc39/proposal-explicit-resource-management)
