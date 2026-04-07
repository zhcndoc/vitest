---
outline: deep
---

# 钩子

这些函数允许你钩入测试的生命周期，以避免重复设置和清理代码。它们应用于当前上下文：如果在顶层使用，则应用于文件；如果在 `describe` 块内使用，则应用于当前套件。当你将 Vitest 作为 [类型检查器](/guide/testing-types) 运行时，不会调用这些钩子。

默认情况下，测试钩子按栈顺序调用（"after" 钩子是反向的），但你可以通过 [`sequence.hooks`](/config/sequence#sequence-hooks) 选项进行配置。

## beforeEach

```ts
function beforeEach(
  body: (context: TestContext) => unknown,
  timeout?: number,
): void
```

注册一个回调函数，在当前套件中的每个测试运行之前调用。
如果函数返回一个 Promise，Vitest 会等待 Promise resolve 后再运行测试。

你可以选择传递一个超时时间（毫秒），定义在终止前等待多长时间。默认值为 10 秒，可以通过 [`hookTimeout`](/config/hooktimeout) 全局配置。

```ts
import { beforeEach } from 'vitest'

beforeEach(async () => {
  // 在每次测试运行前清除模拟并添加一些测试数据
  await stopMocking()
  await addUser({ name: 'John' })
})
```

这里，`beforeEach` 确保为每个测试添加用户。

`beforeEach` 还可以返回一个可选的清理函数（等同于 [`afterEach`](#aftereach)）：

```ts
import { beforeEach } from 'vitest'

beforeEach(async () => {
  // 在每次测试运行前调用一次
  await prepareSomething()

  // 清理函数，在每次测试运行后调用一次
  return async () => {
    await resetSomething()
  }
})
```

## afterEach

```ts
function afterEach(
  body: (context: TestContext) => unknown,
  timeout?: number,
): void
```

注册一个回调函数，在当前套件中的每个测试完成后调用。
如果函数返回一个 Promise，Vitest 会等待 Promise resolve 后再继续。

你可以选择传递一个超时时间（毫秒），指定在终止前等待多长时间。默认值为 10 秒，可以通过 [`hookTimeout`](/config/hooktimeout) 全局配置。

```ts
import { afterEach } from 'vitest'

afterEach(async () => {
  await clearTestingData() // 在每次测试运行后清除测试数据
})
```

这里，`afterEach` 确保在每次测试运行后清除测试数据。

::: tip
你还可以在测试执行期间使用 [`onTestFinished`](#ontestfinished) 来清理测试运行结束后的任何状态。
:::

## beforeAll

```ts
function beforeAll(
  body: (context: ModuleContext) => unknown,
  timeout?: number,
): void
```

注册一个回调函数，在当前套件中开始运行所有测试之前调用一次。
如果函数返回一个 Promise，Vitest 会等待 Promise resolve 后再运行测试。

你可以选择传递一个超时时间（毫秒），指定在终止前等待多长时间。默认值为 10 秒，可以通过 [`hookTimeout`](/config/hooktimeout) 全局配置。

```ts
import { beforeAll } from 'vitest'

beforeAll(async () => {
  await startMocking() // 在所有测试运行前调用一次
})
```

这里，`beforeAll` 确保在测试运行前设置好模拟数据。

`beforeAll` 还可以返回一个可选的清理函数（等同于 [`afterAll`](#afterall)）：

```ts
import { beforeAll } from 'vitest'

beforeAll(async () => {
  // 在所有测试运行前调用一次
  await startMocking()

  // 清理函数，在所有测试运行后调用一次
  return async () => {
    await stopMocking()
  }
})
```

## afterAll

```ts
function afterAll(
  body: (context: ModuleContext) => unknown,
  timeout?: number,
): void
```

注册一个回调函数，在当前套件中所有测试运行完成后调用一次。
如果函数返回一个 Promise，Vitest 会等待 Promise resolve 后再继续。

你可以选择传递一个超时时间（毫秒），指定在终止前等待多长时间。默认值为 10 秒，可以通过 [`hookTimeout`](/config/hooktimeout) 全局配置。

```ts
import { afterAll } from 'vitest'

afterAll(async () => {
  await stopMocking() // 此方法在所有测试运行后调用
})
```

这里，`afterAll` 确保在所有测试运行后调用 `stopMocking` 方法。

## aroundEach

```ts
function aroundEach(
  body: (
    runTest: () => Promise<void>,
    context: TestContext,
  ) => Promise<void>,
  timeout?: number,
): void
```

注册一个回调函数，包裹当前套件中的每个测试。回调接收一个 `runTest` 函数，**必须** 调用该函数来运行测试。

`runTest()` 函数运行 `beforeEach` 钩子、测试本身、测试中访问的测试夹具以及 `afterEach` 钩子。在 `aroundEach` 回调中访问的测试夹具会在调用 `runTest()` 之前初始化，并在 aroundEach 清理代码完成后销毁，允许你在设置和清理阶段安全地使用它们。

::: warning
你 **必须** 在回调中调用 `runTest()`。如果未调用 `runTest()`，测试将失败并报错。
:::

你可以选择传递一个超时时间（毫秒），指定在终止前等待多长时间。超时时间独立应用于设置阶段（`runTest()` 之前）和清理阶段（`runTest()` 之后）。默认值为 10 秒，可以通过 [`hookTimeout`](/config/hooktimeout) 全局配置。

```ts
import { aroundEach, test } from 'vitest'

aroundEach(async (runTest) => {
  await db.transaction(runTest)
})

test('insert user', async () => {
  await db.insert({ name: 'Alice' })
  // 测试后事务自动回滚
})
```

::: tip 何时使用 `aroundEach`
当你的测试需要运行在 **包裹它的上下文中** 时，使用 `aroundEach`，例如：
- 将测试包裹在 [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) 上下文中
- 使用追踪跨度包裹测试
- 数据库事务

如果你只需要在测试前后运行代码，建议使用带有清理返回函数的 [`beforeEach`](#beforeeach)：
```ts
beforeEach(async () => {
  await database.connect()
  return async () => {
    await database.disconnect()
  }
})
```
:::

### 多个钩子

当注册多个 `aroundEach` 钩子时，它们会相互嵌套。第一个注册的钩子是最外层的包裹器：

```ts
aroundEach(async (runTest) => {
  console.log('outer before')
  await runTest()
  console.log('outer after')
})

aroundEach(async (runTest) => {
  console.log('inner before')
  await runTest()
  console.log('inner after')
})

// 输出顺序：
//  outer before
//    inner before
//      test
//    inner after
//  outer after
```

### 上下文和测试夹具

回调接收测试上下文作为第二个参数，这意味着你可以在 `aroundEach` 中使用测试夹具：

```ts
import { aroundEach, test as base } from 'vitest'

const test = base.extend<{ db: Database; user: User }>({
  db: async ({}, use) => {
    // db 在 `aroundEach` 钩子之前创建
    const db = await createTestDatabase()
    await use(db)
    await db.close()
  },
  user: async ({ db }, use) => {
    // `user` 作为事务的一部分运行
    // 因为它在 `test` 内部被访问
    const user = await db.createUser()
    await use(user)
  },
})

// 注意 `aroundEach` 在 test 上可用
// 以获得更好的测试夹具 TypeScript 支持
test.aroundEach(async (runTest, { db }) => {
  await db.transaction(runTest)
})

test('insert user', async ({ db, user }) => {
  await db.insert(user)
})
```

## aroundAll

```ts
function aroundAll(
  body: (
    runSuite: () => Promise<void>,
    context: ModuleContext,
  ) => Promise<void>,
  timeout?: number,
): void
```

注册一个回调函数，包裹当前套件中的所有测试。回调接收一个 `runSuite` 函数，**必须** 调用该函数来运行套件的测试。

`runSuite()` 函数运行套件中的所有测试，包括 `beforeAll`/`afterAll`/`beforeEach`/`afterEach` 钩子、`aroundEach` 钩子和测试夹具。

::: warning
你 **必须** 在回调中调用 `runSuite()`。如果未调用 `runSuite()`，钩子将失败并报错，套件中的所有测试将被跳过。
:::

你可以选择传递一个超时时间（毫秒），指定在终止前等待多长时间。超时时间独立应用于设置阶段（`runSuite()` 之前）和清理阶段（`runSuite()` 之后）。默认值为 10 秒，可以通过 [`hookTimeout`](/config/hooktimeout) 全局配置。

```ts
import { aroundAll, test } from 'vitest'

aroundAll(async (runSuite) => {
  await tracer.trace('test-suite', runSuite)
})

test('test 1', () => {
  // 在追踪跨度内运行
})

test('test 2', () => {
  // 也在同一个追踪跨度内运行
})
```

::: tip 何时使用 `aroundAll`
当你的套件需要运行在 **包裹所有测试的上下文中** 时，使用 `aroundAll`，例如：
- 将整个套件包裹在 [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) 上下文中
- 使用追踪跨度包裹套件
- 数据库事务

如果你只需要在所有测试前后运行一次代码，建议使用带有清理返回函数的 [`beforeAll`](#beforeall)：
```ts
beforeAll(async () => {
  await server.start()
  return async () => {
    await server.stop()
  }
})
```
:::

### 多个钩子

当注册多个 `aroundAll` 钩子时，它们会相互嵌套。第一个注册的钩子是最外层的包裹器：

```ts
aroundAll(async (runSuite) => {
  console.log('outer before')
  await runSuite()
  console.log('outer after')
})

aroundAll(async (runSuite) => {
  console.log('inner before')
  await runSuite()
  console.log('inner after')
})

// 输出顺序：outer before → inner before → tests → inner after → outer after
```

每个套件都有自己独立的 `aroundAll` 钩子。父套件的 `aroundAll` 会包裹子套件的执行：

```ts
import { AsyncLocalStorage } from 'node:async_hooks'
import { aroundAll, describe, test } from 'vitest'

const context = new AsyncLocalStorage<{ suiteId: string }>()

aroundAll(async (runSuite) => {
  await context.run({ suiteId: 'root' }, runSuite)
})

test('root test', () => {
  // context.getStore() 返回 { suiteId: 'root' }
})

describe('nested', () => {
  aroundAll(async (runSuite) => {
    // 父级上下文在这里可用
    await context.run({ suiteId: 'nested' }, runSuite)
  })

  test('nested test', () => {
    // context.getStore() 返回 { suiteId: 'nested' }
  })
})
```

## 测试钩子

Vitest 提供了一些钩子，你可以在测试执行_期间_调用它们，以便在测试运行结束时清理状态。

::: warning
如果在测试体之外调用这些钩子，它们将抛出错误。
:::

### onTestFinished {#ontestfinished}

这个钩子总是在测试运行结束后被调用。它在 `afterEach` 钩子之后被调用，因为它们可能会影响测试结果。它接收一个 `TestContext` 对象，就像 `beforeEach` 和 `afterEach` 一样。

```ts {1,5}
import { onTestFinished, test } from 'vitest'

test('performs a query', () => {
  const db = connectDb()
  onTestFinished(() => db.close())
  db.query('SELECT * FROM users')
})
```

::: warning
如果你并发运行测试，你应该始终使用测试上下文中的 `onTestFinished` 钩子，因为 Vitest 不会在全局钩子中跟踪并发测试：

```ts {3,5}
import { test } from 'vitest'

test.concurrent('performs a query', ({ onTestFinished }) => {
  const db = connectDb()
  onTestFinished(() => db.close())
  db.query('SELECT * FROM users')
})
```
:::

这个钩子在创建可复用逻辑时特别有用：

```ts
// 这可以在一个单独的文件中
function getTestDb() {
  const db = connectMockedDb()
  onTestFinished(() => db.close())
  return db
}

test('performs a user query', async () => {
  const db = getTestDb()
  expect(
    await db.query('SELECT * from users').perform()
  ).toEqual([])
})

test('performs an organization query', async () => {
  const db = getTestDb()
  expect(
    await db.query('SELECT * from organizations').perform()
  ).toEqual([])
})
```

在每个测试后清理你的 spies 也是一个好习惯，这样它们就不会泄漏到其他测试中。你可以通过全局启用 [`restoreMocks`](/config/restoremocks) 配置，或者在 `onTestFinished` 内部恢复 spy 来实现（如果你试图在测试结束时恢复 mock，如果其中一个断言失败，它将不会被恢复 - 使用 `onTestFinished` 确保代码始终运行）：

```ts
import { onTestFinished, test } from 'vitest'

test('performs a query', () => {
  const spy = vi.spyOn(db, 'query')
  onTestFinished(() => spy.mockClear())

  db.query('SELECT * FROM users')
  expect(spy).toHaveBeenCalled()
})
```

::: tip
这个钩子总是以相反的顺序调用，并且不受 [`sequence.hooks`](/config/sequence#sequence-hooks) 选项的影响。
:::

### onTestFailed

这个钩子仅在测试失败后被调用。它在 `afterEach` 钩子之后被调用，因为它们可能会影响测试结果。它接收一个 `TestContext` 对象，就像 `beforeEach` 和 `afterEach` 一样。这个钩子对于调试很有用。

```ts {1,5-7}
import { onTestFailed, test } from 'vitest'

test('performs a query', () => {
  const db = connectDb()
  onTestFailed(({ task }) => {
    console.log(task.result.errors)
  })
  db.query('SELECT * FROM users')
})
```

::: warning
如果你并发运行测试，你应该始终使用测试上下文中的 `onTestFailed` 钩子，因为 Vitest 不会在全局钩子中跟踪并发测试：

```ts {3,5-7}
import { test } from 'vitest'

test.concurrent('performs a query', ({ onTestFailed }) => {
  const db = connectDb()
  onTestFailed(({ task }) => {
    console.log(task.result.errors)
  })
  db.query('SELECT * FROM users')
})
```
:::
