---
title: 从 Jest 迁移 | 指南
outline: deep
---

# 从 Jest 迁移 {#jest}

Vitest 的 API 兼容 Jest，旨在尽可能简化从 Jest 迁移的过程。即便如此，你仍可能遇到以下差异：

## 默认情况下的全局 API

Jest 默认启用[全局 API](https://jestjs.io/docs/api)，而 Vitest 不会。你可以通过 [`globals` 配置项](/config/globals)启用全局 API，或改为从 `vitest` 模块导入所需 API。

如果选择不启用全局 API，请注意，像 [`testing-library`](https://testing-library.com/) 这样的常见库将不会自动执行 DOM [清理](https://testing-library.com/docs/svelte-testing-library/api/#cleanup)。

## `mock.mockReset`

Jest 的 [`mockReset`](https://jestjs.io/docs/mock-function-api#mockfnmockreset) 会将模拟实现替换为空函数，该函数返回 `undefined`。

Vitest 的 [`mockReset`](/api/mock#mockreset) 会将模拟实现恢复为原始实现。也就是说，重置通过 `vi.fn(impl)` 创建的模拟函数时，会将模拟实现恢复为 `impl`。

## `mock.mock` 状态会保持不变

调用 `.mockClear` 时，Jest 会重新创建模拟状态，因此你始终需要通过 getter 访问它。相反，Vitest 会一直保留该状态的引用，因此你可以重复使用它：

```ts
const mock = vi.fn()
const state = mock.mock
mock.mockClear()

expect(state).toBe(mock.mock) // fails in Jest
```

## 模块模拟

在 Jest 中模拟模块时，工厂函数的返回值会作为默认导出。在 Vitest 中，工厂函数必须返回一个对象，并在其中显式定义每个导出。例如，以下 `jest.mock` 需要改为：

```ts
jest.mock('./some-path', () => 'hello') // [!code --]
vi.mock('./some-path', () => ({ // [!code ++]
  default: 'hello', // [!code ++]
})) // [!code ++]
```

更多详情请参阅 [`vi.mock` API 部分](/api/vi#vi-mock)。

## 自动模拟行为

与 Jest 不同，除非调用 `vi.mock()`，否则不会加载 `<root>/__mocks__` 中的模拟模块。如果希望像 Jest 一样在每个测试中都使用这些模拟模块，可以在 [`setupFiles`](/config/setupfiles) 中模拟它们。

## 导入被模拟包的原始模块

如果只想部分模拟某个包，你可能曾使用 Jest 的 `requireActual` 函数。在 Vitest 中，应将这些调用替换为 `vi.importActual`。

```ts
const { cloneDeep } = jest.requireActual('lodash/cloneDeep') // [!code --]
const { cloneDeep } = await vi.importActual('lodash/cloneDeep') // [!code ++]
```

## 将模拟扩展到外部库

Jest 默认会将模块模拟应用于使用该模块的其他外部库。Vitest 中，如果你也需要此行为，就要通过 [server.deps.inline](/config/server#inline) 明确指定要模拟的第三方库，使其成为源码的一部分。

```
server.deps.inline: ["lib-name"]
```

## expect.getState().currentTestName

Vitest 使用 `>` 拼接 `test` 名称，以便区分测试和套件；Jest 则使用空格 (` `)。

```diff
- `${describeTitle} ${testTitle}`
+ `${describeTitle} > ${testTitle}`
```

[`testNamePattern`](/config/testnamepattern)（`-t` 标志）也是如此：Vitest 会匹配以 `>` 拼接的完整名称，而 Jest 会匹配以空格拼接的名称。请相应更新跨套件和测试名称的匹配模式，也可以只匹配一个片段（`-t adds`），或在片段之间使用通配符（`-t 'math.*adds'`）。

```diff
- vitest -t 'math adds'
+ vitest -t 'math > adds'
```

## 环境变量

与 Jest 一样，如果尚未设置 `NODE_ENV`，Vitest 会将其设为 `test`。Vitest 还提供了对应于 `JEST_WORKER_ID` 的 `VITEST_POOL_ID`（始终小于或等于 `maxWorkers`）；如果你的代码依赖该变量，请记得更改名称。Vitest 还提供 `VITEST_WORKER_ID`，这是当前 worker 的唯一 ID。该数字不受 `maxWorkers` 影响，并会随每个新建的 worker 递增。

## 替换对象属性

在 Jest 中，如果要修改对象，可以使用 [replaceProperty API](https://jestjs.io/docs/jest-object#jestreplacepropertyobject-propertykey-value)。在 Vitest 中，可以使用 [`vi.stubEnv`](/api/vi#vi-stubenv) 或 [`vi.spyOn`](/api/vi#vi-spyon) 实现相同效果。

## Done 回调

Vitest 不支持使用回调函数声明测试。你可以将其改写为 `async`/`await` 函数，或使用 Promise 模拟回调形式。

<!--@include: ../examples/promise-done.md-->

## 钩子

在 Vitest 中，`beforeAll`/`beforeEach` 钩子可以返回[清理函数](/api/hooks#beforeach)。因此，如果你的钩子返回的值既不是 `undefined` 也不是 `null`，可能需要改写钩子声明：

```ts
beforeEach(() => setActivePinia(createTestingPinia())) // [!code --]
beforeEach(() => { setActivePinia(createTestingPinia()) }) // [!code ++]
```

Jest 会按顺序依次调用钩子。Vitest 默认以栈的顺序运行钩子。要使用 Jest 的行为，请更新 [`sequence.hooks`](/config/sequence#sequence-hooks) 选项：

```ts
export default defineConfig({
  test: {
    sequence: { // [!code ++]
      hooks: 'list', // [!code ++]
    } // [!code ++]
  }
})
```

## 类型

Vitest 没有与 `jest` 命名空间对应的类型，因此你需要直接从 `vitest` 导入类型：

```ts
let fn: jest.Mock<(name: string) => number> // [!code --]
import type { Mock } from 'vitest' // [!code ++]
let fn: Mock<(name: string) => number> // [!code ++]
```

## 计时器

Vitest 不支持 Jest 的旧版计时器。

## 超时

如果你使用了 `jest.setTimeout`，需要迁移到 `vi.setConfig`：

```ts
jest.setTimeout(5_000) // [!code --]
vi.setConfig({ testTimeout: 5_000 }) // [!code ++]
```

## Vue 快照

这并非 Jest 专属功能，但如果你之前通过 vue-cli preset 使用 Jest，需要安装 [`jest-serializer-vue`](https://github.com/eddyerburgh/jest-serializer-vue) 包，并在 [`snapshotSerializers`](/config/snapshotserializers) 中指定它：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    snapshotSerializers: ['jest-serializer-vue']
  }
})
```

否则，快照中会包含许多转义后的 `"` 字符。

## 自定义快照匹配器 <Experimental /> <Version>4.1.3</Version> {#custom-snapshot-matcher}

Jest 从 `jest-snapshot` 导入快照工具。在 Vitest 中，请改用从 `vitest` 导入的 `Snapshots`：

```ts
const { toMatchSnapshot } = require('jest-snapshot') // [!code --]
import { Snapshots } from 'vitest' // [!code ++]
const { toMatchSnapshot } = Snapshots // [!code ++]

expect.extend({
  toMatchTrimmedSnapshot(received: string, length: number) {
    return toMatchSnapshot.call(this, received.slice(0, length))
  },
})
```

内联快照也同样如此：

```ts
const { toMatchInlineSnapshot } = require('jest-snapshot') // [!code --]
import { Snapshots } from 'vitest' // [!code ++]
const { toMatchInlineSnapshot } = Snapshots // [!code ++]

expect.extend({
  toMatchTrimmedInlineSnapshot(received: string, inlineSnapshot?: string) {
    return toMatchInlineSnapshot.call(this, received.slice(0, 10), inlineSnapshot)
  },
})
```

完整指南请参阅[自定义快照匹配器](/guide/snapshot#custom-snapshot-matchers)。
