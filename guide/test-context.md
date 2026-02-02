---
title: 测试上下文 | 指南
outline: deep
---

# 测试上下文 {#test-context}

受 [Playwright Fixtures](https://playwright.dev/docs/test-fixtures) 的启发，Vitest 的测试上下文允许你定义可在测试中使用的工具(utils)、状态(states)和固定装置(fixtures)。

## 用法 {#usage}

在每个测试回调中，第一个参数表示测试上下文。

```ts
import { it } from 'vitest'

it('should work', ({ task }) => {
  // 打印测试的名称
  console.log(task.name)
})
```

## 内置测试上下文 {#built-in-test-context}

#### `task`

包含关于测试的元数据的只读对象。

#### `expect`

绑定到当前测试的 `expect` API:

```ts
import { it } from 'vitest'

it('math is easy', ({ expect }) => {
  expect(2 + 2).toBe(4)
})
```

此 API 对于同时运行快照测试非常有用，因为全局 Expect 无法跟踪它们:

```ts
import { it } from 'vitest'

it.concurrent('math is easy', ({ expect }) => {
  expect(2 + 2).toMatchInlineSnapshot()
})

it.concurrent('math is hard', ({ expect }) => {
  expect(2 * 2).toMatchInlineSnapshot()
})
```

#### `skip`

```ts
function skip(note?: string): never
function skip(condition: boolean, note?: string): void
```

跳过后续测试执行并将测试标记为已跳过：

```ts
import { expect, it } from 'vitest'

it('math is hard', ({ skip }) => {
  skip()
  expect(2 + 2).toBe(5)
})
```

从 Vitest 3.1 版本开始，你可以通过传入一个布尔值参数来按条件跳过某个测试：

```ts
it('math is hard', ({ skip, mind }) => {
  skip(mind === 'foggy')
  expect(2 + 2).toBe(5)
})
```

#### `annotate` <Version>3.2.0</Version> {#annotate}

```ts
function annotate(
  message: string,
  attachment?: TestAttachment,
): Promise<TestAnnotation>

function annotate(
  message: string,
  type?: string,
  attachment?: TestAttachment,
): Promise<TestAnnotation>
```

添加一个 [测试注释](/guide/test-annotations)，它将由你的 [报告器](/config/#reporters) 显示。

```ts
test('annotations API', async ({ annotate }) => {
  await annotate('https://github.com/vitest-dev/vitest/pull/7953', 'issues')
})
```

#### `signal` <Version>3.2.0</Version> {#signal}

一个由 Vitest 控制的 [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) ，在以下场景下会被触发中止：

- 测试用例超时
- 用户使用 Ctrl+C 手动终止了测试
- 代码中调用了 [`vitest.cancelCurrentRun`](/api/advanced/vitest#cancelcurrentrun) 方法
- 当并行测试中的其他用例失败，并且启用了 [`bail`](/config/#bail) 参数时

```ts
it('stop request when test times out', async ({ signal }) => {
  await fetch('/resource', { signal })
}, 2000)
```

#### `onTestFailed`

[`onTestFailed`](/api/hooks#ontestfailed) 与当前测试用例绑定。当你并发执行多个测试并希望只对某个具体测试进行特殊处理时，这个 API 会非常有用。

#### `onTestFinished`

[`onTestFinished`](/api/hooks#ontestfailed) 与当前测试用例绑定。当你并发执行多个测试并希望只对某个特定测试进行特殊处理时，这个 API 会非常有帮助。

## 扩展测试上下文 {#extend-test-context}

<<<<<<< HEAD
Vitest 提供了两种不同的方式来帮助你扩展测试上下文。
=======
Vitest allows you to extend the test context with custom fixtures using `test.extend`.
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

The `test.extend` method lets you create a custom test API with fixtures - reusable values that are automatically set up and torn down for your tests. Vitest supports two syntaxes: the builder pattern (recommended) and the object syntax (Playwright-compatible).

<<<<<<< HEAD
与 [Playwright](https://playwright.dev/docs/api/class-test#test-extend) 一样，你可以使用此方法通过自定义装置定义你自己的 `test` API，并在任何地方重复使用它。

比如说，我们先创建一个包含 `todos` 和 `archive` 两个夹具的 `test` 收集器。
=======
### Builder Pattern <Version>4.1.0</Version> {#builder-pattern}

The builder pattern is the recommended way to define fixtures because it provides automatic type inference. TypeScript infers the type of each fixture from its return value, so you don't need to declare types manually.
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts [my-test.ts]
import { test as baseTest } from 'vitest'

<<<<<<< HEAD
const todos = []
const archive = []

export const test = baseTest.extend({
  todos: async ({}, use) => {
    // 在每次测试函数运行之前设置固定装置
    todos.push(1, 2, 3)

    // 使用固定装置的值
    await use(todos)

    // 在每次测试函数运行之后清除固定装置
    todos.length = 0
  },
  archive,
})
```

然后我们就可以导入使用了。
=======
export const test = baseTest
  // Simple value - type is inferred as { port: number; host: string }
  .extend('config', { port: 3000, host: 'localhost' })
  // Function fixture - type is inferred from return value
  .extend('server', async ({ config }) => {
    // TypeScript knows config is { port: number; host: string }
    return `http://${config.host}:${config.port}`
  })
```

Then use it in your tests:
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts [my-test.test.ts]
import { expect } from 'vitest'
import { test } from './my-test.js'

test('server uses correct port', ({ config, server }) => {
  // TypeScript knows the types:
  // - config is { port: number; host: string }
  // - server is string
  expect(server).toBe('http://localhost:3000')
  expect(config.port).toBe(3000)
})
```

<<<<<<< HEAD
我们还可以通过对 `test` 进行扩展来新增夹具或覆盖已有的夹具配置。
=======
#### Setup and Cleanup with `onCleanup`

For fixtures that need setup or cleanup logic, use a function. The `onCleanup` callback registers teardown logic that runs after the fixture's scope ends:
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts
import { test as baseTest } from 'vitest'

<<<<<<< HEAD
export const test = todosTest.extend({
  settings: {
    // ...
  },
=======
export const test = baseTest
  .extend('tempFile', async ({}, { onCleanup }) => {
    const filePath = `/tmp/test-${Date.now()}.txt`
    await fs.writeFile(filePath, 'test data')

    // Register cleanup - runs after test completes
    onCleanup(async () => {
      await fs.unlink(filePath)
    })

    return filePath
  })
```

For more complex examples:

```ts
const test = baseTest
  .extend('database', { scope: 'file' }, async ({}, { onCleanup }) => {
    const db = await createDatabase()
    await db.connect()

    onCleanup(async () => {
      await db.disconnect()
    })

    return db
  })
  .extend('user', async ({ database }, { onCleanup }) => {
    const user = await database.createTestUser()

    onCleanup(async () => {
      await database.deleteUser(user.id)
    })

    return user
  })
```

::: warning
The `onCleanup` function can only be called **once per fixture**. If you need multiple cleanup operations, either combine them into a single cleanup function, or split your fixture into multiple smaller fixtures:

```ts
// ❌ This will throw an error
const test = baseTest
  .extend('resources', async ({}, { onCleanup }) => {
    const a = await acquireA()
    onCleanup(() => releaseA(a))

    const b = await acquireB()
    onCleanup(() => releaseB(b)) // Error: onCleanup can only be called once

    return { a, b }
  })

// ✅ Split into separate fixtures (recommended)
const test = baseTest
  .extend('resourceA', async ({}, { onCleanup }) => {
    const a = await acquireA()
    onCleanup(() => releaseA(a))
    return a
  })
  .extend('resourceB', async ({}, { onCleanup }) => {
    const b = await acquireB()
    onCleanup(() => releaseB(b))
    return b
  })
```

Splitting into separate fixtures is the recommended approach as it provides better isolation and makes dependencies explicit.
:::

#### Fixture Options

The second argument to `.extend()` accepts options:

```ts
const test = baseTest
  // Automatic fixture - runs for every test even if not used
  .extend('metrics', { auto: true }, ({}, { onCleanup }) => {
    const metrics = new MetricsCollector()
    metrics.start()
    onCleanup(() => metrics.stop())
    return metrics
  })
  // Worker-scoped fixture - initialized once per worker
  .extend('config', { scope: 'worker' }, () => {
    return loadConfig()
  })
  // File-scoped fixture - initialized once per file
  .extend('database', { scope: 'file' }, async ({ config }, { onCleanup }) => {
    const db = await createDatabase(config)
    onCleanup(() => db.close())
    return db
  })
  // Injected fixture - can be overridden via config
  .extend('baseUrl', { injected: true }, () => {
    return 'http://localhost:3000'
  })
```

For test-scoped fixtures (the default), you can omit the options:

```ts
const test = baseTest
  .extend('simple', () => 'value')
```

Non-function values only support the `injected` option:

```ts
const test = baseTest
  .extend('baseUrl', { injected: true }, 'http://localhost:3000')
  .extend('defaults', { port: 3000, host: 'localhost' })
```

#### Accessing Other Fixtures

Each fixture can access previously defined fixtures via its first parameter. This works for both function and non-function fixtures:

```ts
const test = baseTest
  .extend('config', { apiUrl: 'https://api.example.com', port: 3000 })
  .extend('client', ({ config }) => {
    // TypeScript knows config is { apiUrl: string; port: number }
    return new ApiClient(config.apiUrl)
  })
  .extend('user', async ({ client }) => {
    // TypeScript knows client is ApiClient
    return await client.getCurrentUser()
  })
```

#### Object Syntax (Playwright-Compatible)

Vitest also supports a Playwright-compatible object syntax. This is useful if you're migrating from Playwright or prefer defining all fixtures at once:

```ts [my-test.ts]
import { test as baseTest } from 'vitest'

export const test = baseTest.extend({
  page: async ({}, use) => {
    // setup the fixture before each test function
    const page = await browser.newPage()

    // use the fixture value
    await use(page)

    // cleanup the fixture after each test function
    await page.close()
  },
  baseUrl: 'http://localhost:3000'
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4
})
```
#### 初始化固定装置 {#fixture-initialization}

<<<<<<< HEAD
Vitest 运行器将智能地初始化你的固定装置并根据使用情况将它们注入到测试上下文中。
=======
The key difference from the builder pattern is the `use()` callback pattern for cleanup:

```ts
// Object syntax: cleanup code goes AFTER use()
const test = baseTest.extend({
  database: async ({}, use) => {
    const db = await createDatabase()
    await db.connect()

    await use(db) // Test runs here

    // Cleanup after the test
    await db.disconnect()
  }
})

// Builder pattern: cleanup is registered with onCleanup()
const test = baseTest
  .extend('database', async ({}, { onCleanup }) => {
    const db = await createDatabase()
    await db.connect()

    onCleanup(() => db.disconnect())

    return db // Test runs after this returns
  })
```

::: info
With the object syntax, you need to provide types manually as a generic parameter since TypeScript cannot infer them from the `use()` callback:

```ts
const test = baseTest.extend<{
  page: Page
  baseUrl: string
}>({
  page: async ({}, use) => {
    const page = await browser.newPage()
    await use(page)
    await page.close()
  },
  baseUrl: 'http://localhost:3000'
})
```
:::

#### Tuple Syntax for Options

With the object syntax, use a tuple to specify fixture options:

```ts
const test = baseTest.extend({
  // Auto fixture
  fixture: [
    async ({}, use) => {
      setup()
      await use()
      teardown()
    },
    { auto: true }
  ],
  // Scoped fixture
  database: [
    async ({}, use) => {
      const db = await createDatabase()
      await use(db)
      await db.close()
    },
    { scope: 'file' }
  ],
  // Injected fixture
  url: [
    '/default',
    { injected: true }
  ],
})
```

### Fixture Initialization

Vitest runner will smartly initialize your fixtures and inject them into the test context based on usage.
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts
import { test as baseTest } from 'vitest'

const test = baseTest
  .extend('database', async () => {
    console.log('database initializing')
    return createDatabase()
  })
  .extend('cache', async () => {
    return createCache()
  })

<<<<<<< HEAD
// todos 不会运行
test('skip', () => {})
test('skip', ({ archive }) => {})

// todos 将会运行
test('run', ({ todos }) => {})
```

::: warning
在固定装置中使用 `test.extend()` 时，需要始终使用对象解构模式 `{ todos }` 来访问固定装置函数和测试函数中的上下文。
=======
// database will not run
test('no fixtures needed', () => {})
test('only cache', ({ cache }) => {})

// database will run
test('needs database', ({ database }) => {})
```

::: warning
When using `test.extend()` with fixtures, you should always use the object destructuring pattern `{ database }` to access context both in fixture function and test function.
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts
test('context must be destructured', (context) => { // [!code --]
  expect(context.database).toBeDefined()
})

test('context must be destructured', ({ database }) => { // [!code ++]
  expect(database).toBeDefined()
})
```
:::

<<<<<<< HEAD
#### 自动化装置 {#automatic-fixture}

Vitest 还支持 fixture 的元组语法，允许你传递每个 fixture 的选项。例如，你可以使用它来显式初始化固定装置，即使它没有在测试中使用。
=======
### Extending Extended Tests

You can extend an already extended test to add more fixtures:
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts
import { test as dbTest } from './my-test.js'

<<<<<<< HEAD
const test = base.extend({
  fixture: [
    async ({}, use) => {
      // 这个函数将会运行
      setup()
      await use()
      teardown()
    },
    { auto: true }, // 标记为自动装置
  ],
})

test('works correctly')
```

#### 默认的装置 {#default-fixture}

从 Vitest 3 开始，你可以在不同的 [项目](/guide/projects) 中提供不同的值。要启用此功能，请在选项中传递 `{ injected: true }`。如果在 [项目配置](/config/#provide) 中未指定该键，则将使用默认值。
=======
export const test = dbTest
  .extend('user', ({ database }) => {
    return database.createUser()
  })
```

With the object syntax:

```ts
import { test as dbTest } from './my-test.js'

export const test = dbTest.extend({
  admin: async ({ database }, use) => {
    const admin = await database.createAdmin()
    await use(admin)
    await database.deleteUser(admin.id)
  }
})
```

### Mixing Both Syntaxes

You can combine both approaches. The builder pattern can be chained after object-based extensions:

```ts
const test = baseTest
  // Object syntax for simple fixtures
  .extend<{ apiKey: string }>({
    apiKey: 'test-key-123',
  })
  // Builder pattern for complex fixtures with inference
  .extend('client', ({ apiKey }) => {
    // TypeScript knows apiKey is string
    return new ApiClient(apiKey)
  })
```

### Fixture Scopes <Version>3.2.0</Version> {#fixture-scopes}

By default, fixtures are initialized for each test. You can change this with the `scope` option to share fixtures across tests.

::: warning
By default any fixture without a scope is treated as a `test` fixture. This means that you cannot use it inside `worker` and `file` scopes. If you wish to access it there, consider specifying a scope manually:

```ts
test
  .extend('port', { scope: 'worker' }, 5000)
  .extend('db', { scope: 'worker' }, async ({ port }) => {
    return createDb(port)
  })
```

Note that you cannot override non-test fixtures inside `describe` blocks:

```ts
test.describe('a nested suite', () => {
  test.override('port', 3000) // throws an error
})
```

Consider overriding it on the top level of the module, or by using [`injected`](#default-fixture-injected) option and providing the value in the project config.

Also note that in [non-isolate](/config/isolate) mode overriding a `worker` fixture will affect the fixture value in all test files running after it was overriden.

<!-- TODO(v5) should this be addressed? force a new worker if worker fixture is overriden? -->
:::

#### Test Scope (Default)

Test-scoped fixtures are created fresh for each test:

```ts
const test = baseTest
  .extend('counter', () => {
    return { value: 0 }
  })

test('first test', ({ counter }) => {
  counter.value++
  expect(counter.value).toBe(1)
})

test('second test', ({ counter }) => {
  // Fresh instance, value is 0 again
  expect(counter.value).toBe(0)
})
```

Test-scoped fixtures have access to the [built-in test context](#built-in-test-context) (`task`, `expect`, `skip`, etc.):

```ts
const test = baseTest
  .extend('testInfo', ({ task }) => {
    return { name: task.name }
  })
```

#### File Scope

File-scoped fixtures are initialized once per test file:

```ts
const test = baseTest
  .extend('database', { scope: 'file' }, async ({}, { onCleanup }) => {
    const db = await createDatabase()
    onCleanup(() => db.close())
    return db
  })

test('first test', ({ database }) => {
  // Uses the same database instance
})

test('second test', ({ database }) => {
  // Same database instance as first test
})
```

#### Worker Scope

Worker-scoped fixtures are initialized once per worker process:

```ts
const test = baseTest
  .extend('config', { scope: 'worker' }, () => {
    return await loadExpensiveConfig()
  })
```

::: info
By default, every file runs in a separate worker, so `file` and `worker` scopes work the same way. However, if you disable [isolation](/config/#isolate), then the number of workers is limited by [`maxWorkers`](/config/#maxworkers), and worker-scoped fixtures will be shared across files running in the same worker.

When running tests in `vmThreads` or `vmForks`, `scope: 'worker'` works the same way as `scope: 'file'` because each file has its own VM context.
:::

#### Scope Hierarchy

Fixtures can only access other fixtures from the same or higher (longer-lived) scopes:

| Fixture Scope | Can Access |
|---------------|------------|
| `worker` | Only other worker fixtures |
| `file` | Worker + file fixtures |
| `test` | Worker + file + test fixtures + [test context](#built-in-test-context) |

```ts
const test = baseTest
  .extend('config', { scope: 'worker' }, () => {
    return { apiUrl: 'https://api.example.com' }
  })
  .extend('database', { scope: 'file' }, async ({ config }, { onCleanup }) => {
    // ✅ File fixture can access worker fixture
    const db = await createDatabase(config.apiUrl)
    onCleanup(() => db.close())
    return db
  })
  .extend('user', async ({ database, task }) => {
    // ✅ Test fixture can access file fixture AND test context
    return await database.createUser(task.name)
  })
```

::: tip
Only test-scoped fixtures have access to the [built-in test context](#built-in-test-context) (`task`, `expect`, `skip`, etc.). Worker and file fixtures run outside of any specific test, so test-specific properties are not available to them.

If you need the file path in a file-scoped fixture, use `expect.getState().testPath` instead.
:::

#### Type-Safe Scope Access <Version>3.2.0</Version> {#type-safe-scope-access}

With the builder pattern, TypeScript automatically enforces scope-based access rules. If you try to access a test-scoped fixture from a file-scoped fixture, you'll get a compile-time error.

If you're using the object syntax and want the same type safety, you can use the `$worker`, `$file`, and `$test` keys to explicitly declare which fixtures belong to which scope:

```ts
const test = baseTest.extend<{
  $worker: { config: Config }
  $file: { database: Database }
  $test: { user: User }
}>({
  config: [async ({}, use) => {
    await use(loadConfig())
  }, { scope: 'worker' }],

  database: [async ({ config }, use) => {
    const db = await createDatabase(config)
    await use(db)
    await db.close()
  }, { scope: 'file' }],

  user: async ({ database }, use) => {
    const user = await database.createUser()
    await use(user)
    await database.deleteUser(user.id)
  },
})
```

This provides the same compile-time safety as the builder pattern, catching scope violations at build time rather than runtime.

### Default Fixture (Injected)

Since Vitest 3, you can provide different values in different [projects](/guide/projects). To enable this, pass `{ injected: true }` in the options. If the key is not specified in the [project configuration](/config/#provide), the default value will be used.
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

:::code-group
```ts [fixtures.test.ts]
import { test as baseTest } from 'vitest'

<<<<<<< HEAD
const test = base.extend({
  url: [
    // 如果配置中未定义"url"，则为默认值
    '/default',
    // 将夹具标记为"注入"以允许覆盖
    { injected: true },
  ],
})
=======
const test = baseTest
  .extend('url', { injected: true }, '/default')
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

test('works correctly', ({ url }) => {
  // 在"project-new"中，url是"/default"
  // 在"project-full"中，url是"/full"
  // 在"project-empty"中，url是"/empty"
})
```
```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'project-new',
        },
      },
      {
        test: {
          name: 'project-full',
          provide: {
            url: '/full',
          },
        },
      },
      {
        test: {
          name: 'project-empty',
          provide: {
            url: '/empty',
          },
        },
      },
    ],
  },
})
```
:::

<<<<<<< HEAD
#### 将值限定到套件范围 <Version>3.1.0</Version> {#scoping-values-to-suite}

从 Vitest 3.1 开始，你可以使用 `test.scoped` API 来按套件及其子项覆盖上下文值：
=======
### Overriding Fixture Values <Version>4.1.0</Version> {#overriding-fixture-values}

You can override fixture values for a specific suite and its children using `test.override`. This is useful when you need different fixture values for different test scenarios.

::: tip
Vitest will automatically inherit the options, if they are not provided when overriding. Note that you cannot override fixture's `scope` or `auto` options.
:::

#### Builder Pattern (Recommended)
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts
import { test as baseTest, describe, expect } from 'vitest'

const test = baseTest
  .extend('config', { port: 3000, host: 'localhost' })
  .extend('server', ({ config }) => `http://${config.host}:${config.port}`)

describe('production environment', () => {
  // Override with a new static value (chainable)
  test
    .override('config', { port: 8080, host: 'api.example.com' })

  test('uses production config', ({ server }) => {
    expect(server).toBe('http://api.example.com:8080')
  })
})

<<<<<<< HEAD
describe('use scoped values', () => {
  test.scoped({ dependency: 'new' })

  test('uses scoped value', ({ dependant }) => {
    // `dependant` 使用了新的被覆盖的值，该值是限定范围的
    // 到此套件中的所有测试
    expect(dependant).toEqual({ dependency: 'new' })
  })

  describe('keeps using scoped value', () => {
    test('uses scoped value', ({ dependant }) => {
      // 嵌套套件继承了该值
      expect(dependant).toEqual({ dependency: 'new' })
=======
describe('with custom server', () => {
  // Override with a function that can access other fixtures
  test.override('server', ({ config }) => {
    return `https://${config.host}:${config.port}/v2`
  })

  test('uses custom server', ({ server }) => {
    expect(server).toBe('https://localhost:3000/v2')
  })
})

test('uses default values', ({ server }) => {
  expect(server).toBe('http://localhost:3000')
})
```

#### Chaining Multiple Overrides

`test.override` returns the test API, so you can chain multiple calls:

```ts
describe('production environment', () => {
  test
    .override('environment', 'production')
    .override('port', 8080)
    .override('debug', false)

  test('uses production settings', ({ environment, port, debug }) => {
    expect(environment).toBe('production')
    expect(port).toBe(8080)
    expect(debug).toBe(false)
  })
})
```

#### Object Syntax

You can also use object syntax to override multiple fixtures at once:

```ts
describe('different configuration', () => {
  test.override({
    config: { port: 4000, host: 'test.local' },
  })

  test('uses overwritten config', ({ config }) => {
    expect(config.port).toBe(4000)
  })
})
```

#### With Cleanup

When overwriting with a function, you can use `onCleanup` just like in `test.extend`:

```ts
describe('with custom database', () => {
  test.override('database', async ({ config }, { onCleanup }) => {
    const db = await createTestDatabase(config)
    onCleanup(() => db.drop())
    return db
  })

  test('uses custom database', ({ database }) => {
    // Uses the overwritten database
  })
})
```

#### Nested Scopes

Overrides are inherited by nested suites and can be overwritten again:

```ts
describe('level 1', () => {
  test.override('value', 'one')

  test('uses level 1 value', ({ value }) => {
    expect(value).toBe('one')
  })

  describe('level 2', () => {
    test.override('value', 'two')

    test('uses level 2 value', ({ value }) => {
      expect(value).toBe('two')
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4
    })
  })

<<<<<<< HEAD
test('keep using the default values', ({ dependant }) => {
  // `dependency` 使用的是默认值
  // 在使用 `.scoped` 的套件外部的值
  expect(dependant).toEqual({ dependency: 'default' })
})
```

如果你有一个依赖于动态变量（如数据库连接）的上下文值，这个 API 特别有用：

```ts
const test = baseTest.extend<{
  db: Database
  schema: string
}>({
  db: async ({ schema }, use) => {
    const db = await createDb({ schema })
    await use(db)
    await cleanup(db)
  },
  schema: '',
})

describe('one type of schema', () => {
  test.scoped({ schema: 'schema-1' })

  // ... tests
})

describe('another type of schema', () => {
  test.scoped({ schema: 'schema-2' })

  // ... tests
})
```

#### 作用域上下文 <Version>3.2.0</Version> {#per-scope-context-3-2-0}

你可以定义每个文件或每个工作线程只初始化一次的上下文。它的初始化方式与带对象参数的常规夹具相同：

```ts
import { test as baseTest } from 'vitest'

export const test = baseTest.extend({
  perFile: [
    ({}, use) => use([]),
    { scope: 'file' },
  ],
  perWorker: [
    ({}, use) => use([]),
    { scope: 'worker' },
  ],
})
```

该值在任何测试第一次访问它时初始化，除非夹具选项设置了 `auto: true`， 在这种情况下，该值在任何测试运行之前就已初始化。

```ts
const test = baseTest.extend({
  perFile: [
    ({}, use) => use([]),
    {
      scope: 'file',
      // 在任何测试之前总是运行这个钩子
      auto: true
    },
  ],
=======
  test('still uses level 1 value', ({ value }) => {
    expect(value).toBe('one')
  })
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4
})
```

::: warning
<<<<<<< HEAD
内置的 [`task`](#task) 测试上下文在文件作用域或工作线程作用域的 fixtures 中 **不可用**。这些 fixtures 接收的是不同的上下文对象（文件或工作线程上下文），其中不包含 `task` 等测试特定属性。

如需访问文件路径等文件级元数据，请改用 `expect.getState().testPath`。
:::

`worker` 作用域将为每个工作线程运行一次 fixtures。运行的工作线程数量取决于多种因素。默认情况下，每个文件在独立的工作线程中运行，因此 `file` 和 `worker` 作用域的行为方式相同。

但是，如果你禁用 [隔离](/config/#isolate) 配置，则工作线程数量将受到 [`maxWorkers`](/config/#maxworkers) 配置限制。

请注意，在 `vmThreads` 或 `vmForks` 中运行测试时，指定 `scope: 'worker'` 的工作方式与 `scope: 'file'` 相同。这个限制存在是因为每个测试文件都有自己的 VM 上下文，所以如果 Vitest 只初始化一次，一个上下文可能会泄漏到另一个上下文中，并创建许多引用不一致的问题（例如，同一个类的实例会引用不同的构造函数）。

#### TypeScript

要为所有自定义上下文提供固定装置类型，你可以将固定装置类型作为泛型(generic)传递。

```ts
interface MyFixtures {
  todos: number[]
  archive: number[]
}

const test = baseTest.extend<MyFixtures>({
  todos: [],
  archive: [],
})

test('types are defined correctly', ({ todos, archive }) => {
  expectTypeOf(todos).toEqualTypeOf<number[]>()
  expectTypeOf(archive).toEqualTypeOf<number[]>()
})
```

::: info 类型推断
请注意，Vitest 不支持在调用 `use` 函数时推断类型。在调用 `test.extend` 时，最好将整个上下文类型作为泛型类型传递：

```ts
import { test as baseTest } from 'vitest'

const test = baseTest.extend<{
  todos: number[]
  schema: string
}>({
  todos: ({ schema }, use) => use([]),
  schema: 'test'
})

test('types are correct', ({
  todos, // number[]
  schema, // string
}) => {
  // ...
})
```

:::

当使用 `test.extend` 时，扩展的 `test` 对象提供了类型安全的 `beforeEach` 和 `afterEach` 钩子，这些钩子能够识别新的上下文：
=======
Note that you cannot introduce new fixtures inside `test.override`. Extend the test context with `test.extend` instead.
:::

::: info
`test.scoped` is deprecated in favor of `test.override`. The `test.scoped` API still works but will be removed in a future version.
:::

### Type-Safe Hooks

When using `test.extend`, the extended `test` object provides type-safe `beforeEach` and `afterEach` hooks that are aware of the new context:
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

```ts
const test = baseTest
  .extend('counter', { value: 0, increment() { this.value++ } })

<<<<<<< HEAD
// 与全局钩子不同，这些钩子能够识别扩展的上下文
test.beforeEach(({ todos }) => {
  todos.push(1)
=======
// Unlike global hooks, these hooks are aware of the extended context
test.beforeEach(({ counter }) => {
  counter.increment()
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4
})

test.afterEach(({ counter }) => {
  console.log('Final count:', counter.value)
})
```
