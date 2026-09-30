---
title: 从 Mocha + Chai + Sinon 迁移 | 指南
outline: deep
---

# 从 Mocha + Chai + Sinon 迁移 {#mocha-chai-sinon}

Vitest 为从 Mocha+Chai+Sinon 测试套件迁移提供了良好支持。虽然 Vitest 默认使用兼容 Jest 的 API，但也提供 Chai 风格的 spy/mock 断言，让迁移更容易。

## 测试结构

Mocha 和 Vitest 的测试结构相似，但也有一些差异：

```ts
// Mocha
describe('suite', () => {
  before(() => { /* setup */ })
  after(() => { /* teardown */ })
  beforeEach(() => { /* setup */ })
  afterEach(() => { /* teardown */ })

  it('test', () => {
    // test code
  })
})

// Vitest - same structure works!
import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'vitest'

describe('suite', () => {
  beforeAll(() => { /* setup */ })
  afterAll(() => { /* teardown */ })
  beforeEach(() => { /* setup */ })
  afterEach(() => { /* teardown */ })

  it('test', () => {
    // test code
  })
})
```

## 断言

Vitest 默认包含 Chai 断言，因此无需修改即可使用 Chai 断言：

```ts
// Both Mocha+Chai and Vitest
import { expect } from 'vitest' // or 'chai' in Mocha

expect(value).to.equal(42)
expect(value).to.be.true
expect(array).to.have.lengthOf(3)
expect(obj).to.have.property('key')
```

## Spy/Mock 断言

Vitest 为 spy 和 mock 提供 **Chai 风格的断言**，因此从 Sinon 迁移时无需重写断言：

```ts
// Before (Mocha + Chai + Sinon)
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

const spy = sinon.spy(obj, 'method')
obj.method('arg1', 'arg2')

expect(spy).to.have.been.called
expect(spy).to.have.been.calledOnce
expect(spy).to.have.been.calledWith('arg1', 'arg2')

// After (Vitest) - same assertion syntax!
import { expect, vi } from 'vitest'

const spy = vi.spyOn(obj, 'method')
obj.method('arg1', 'arg2')

expect(spy).to.have.been.called
expect(spy).to.have.been.calledOnce
expect(spy).to.have.been.calledWith('arg1', 'arg2')
```

### 完整支持 Chai 风格断言

Vitest 支持所有常见的 sinon-chai 断言：

| Sinon-Chai                | Vitest                | 描述                       |
| ------------------------- | --------------------- | -------------------------- |
| `spy.called`              | `called`              | Spy 至少被调用一次         |
| `spy.calledOnce`          | `calledOnce`          | Spy 恰好被调用一次         |
| `spy.calledTwice`         | `calledTwice`         | Spy 恰好被调用两次         |
| `spy.calledThrice`        | `calledThrice`        | Spy 恰好被调用三次         |
| `spy.callCount(n)`        | `callCount(n)`        | Spy 被调用 n 次            |
| `spy.calledWith(...)`     | `calledWith(...)`     | Spy 使用指定参数被调用     |
| `spy.calledOnceWith(...)` | `calledOnceWith(...)` | Spy 使用指定参数被调用一次 |
| `spy.returned(value)`     | `returned`            | Spy 返回了指定值           |

完整列表请参阅 [Chai 风格的 Spy 断言](/api/expect#chai-style-spy-assertions)文档。

## 创建 Spy 和 Mock

将 Sinon 创建 spy/stub/mock 的方式替换为 Vitest 的 `vi` 工具：

```ts
// Sinon
const sinon = require('sinon')
const spy = sinon.spy()
const stub = sinon.stub(obj, 'method')
const mock = sinon.mock(obj)

// Vitest
import { vi } from 'vitest'
const spy = vi.fn()
const stub = vi.spyOn(obj, 'method')
// Vitest doesn't have "mocks" - use spies instead
```

## 设置返回值

```ts
// Sinon
stub.returns(42)
stub.onFirstCall().returns(1)
stub.onSecondCall().returns(2)

// Vitest
stub.mockReturnValue(42)
stub.mockReturnValueOnce(1)
stub.mockReturnValueOnce(2)
```

## 设置实现

```ts
// Sinon
stub.callsFake(arg => arg * 2)

// Vitest
stub.mockImplementation(arg => arg * 2)
```

## 还原 Spy

```ts
// Sinon
spy.restore()
sinon.restore() // restore all

// Vitest
spy.mockRestore()
vi.restoreAllMocks() // restore all
```

## 计时器

Sinon 和 Vitest 内部都使用 `@sinonjs/fake-timers`：

```ts
// Sinon
const clock = sinon.useFakeTimers()
clock.tick(1000)
clock.restore()

// Vitest
import { vi } from 'vitest'
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()
```

## 主要差异

1. **全局 API**：Mocha 默认提供全局 API。在 Vitest 中，可以从 `vitest` 导入，或启用 [`globals`](/config/globals) 配置。
2. **断言风格**：你可以使用 Chai 风格（`expect(spy).to.have.been.called`）和 Jest 风格（`expect(spy).toHaveBeenCalled()`）断言。
3. **并行执行**：Vitest 默认并行运行测试，而 Mocha 按顺序运行。

更多信息：

- [Chai 风格的 Spy 断言](/api/expect#chai-style-spy-assertions)
- [模拟指南](/guide/mocking)
- [Vi API](/api/vi)
