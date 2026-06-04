---
title: 测试上下文 | 指南
outline: deep
---

# 测试上下文

灵感来源于 [Playwright 夹具](https://playwright.dev/docs/test-fixtures)，Vitest 的测试上下文允许你定义可在测试中使用的工具、状态和夹具。

## 用法

每个测试回调的第一个参数是一个测试上下文。

```ts
import { it } from 'vitest'

it('should work', ({ task }) => {
  // 打印测试名称
  console.log(task.name)
})
```

## 内置测试上下文

### `task`

一个包含测试元数据的只读对象。

### `expect`

绑定到当前测试的 `expect` API：

```ts
import { it } from 'vitest'

it('math is easy', ({ expect }) => {
  expect(2 + 2).toBe(4)
})
```

此 API 对于并发运行快照测试很有用，因为全局 expect 无法跟踪它们：

```ts
import { it } from 'vitest'

it.concurrent('math is easy', ({ expect }) => {
  expect(2 + 2).toMatchInlineSnapshot()
})

it.concurrent('math is hard', ({ expect }) => {
  expect(2 * 2).toMatchInlineSnapshot()
})
```

### `skip`

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

自 Vitest 3.1 起，它接受一个布尔参数来有条件地跳过测试：

```ts
it('math is hard', ({ skip, mind }) => {
  skip(mind === 'foggy')
  expect(2 + 2).toBe(5)
})
```

### `annotate` <Version>3.2.0</Version> {#annotate}

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

添加一个将由你的 [报告器](/config/reporters) 显示的 [测试注解](/guide/test-annotations)。

```ts
test('annotations API', async ({ annotate }) => {
  await annotate('https://github.com/vitest-dev/vitest/pull/7953', 'issues')
})
```

### `signal` <Version>3.2.0</Version> {#signal}

一个 [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)，可由 Vitest 中止。在以下情况下信号会被中止：

- 测试超时
- 用户手动使用 Ctrl+C 取消了测试运行
- 以编程方式调用了 [`vitest.cancelCurrentRun`](/api/advanced/vitest#cancelcurrentrun)
- 另一个测试在并行中失败，并且设置了 [`bail`](/config/bail) 标志

```ts
it('stop request when test times out', async ({ signal }) => {
  await fetch('/resource', { signal })
}, 2000)
```

### `bench` <Version>5.0.0</Version> {#bench}

`bench` 夹具允许你在普通测试中定义并运行基准测试。你可以测量吞吐量、比较实现，并断言相对性能：

```ts
import { expect, test } from 'vitest'

test('compare parsers', async ({ bench }) => {
  const result = await bench.compare(
    bench('JSON.parse', () => {
      JSON.parse('{"key":"value"}')
    }),
    bench('custom parser', () => {
      customParse('{"key":"value"}')
    }),
  )

  expect(result.get('JSON.parse')).toBeFasterThan(result.get('custom parser'))
})
```

有关比较、基线和断言匹配器的完整文档，请参阅 [基准测试指南](/guide/benchmarking)。

### `onTestFailed`

绑定到当前测试的 [`onTestFailed`](/api/hooks#ontestfailed) 钩子。如果你并发运行测试并且需要仅针对此特定测试进行特殊处理，此 API 很有用。

### `onTestFinished`

绑定到当前测试的 [`onTestFinished`](/api/hooks#ontestfailed) 钩子。如果你并发运行测试并且需要仅针对此特定测试进行特殊处理，此 API 很有用。

## 扩展测试上下文

Vitest 允许你使用 `test.extend` 使用自定义夹具扩展测试上下文。

`test.extend` 方法让你创建一个带有夹具的自定义测试 API - 这些是可复用的值，会自动为你的测试设置和清理。Vitest 支持两种语法：构建器模式（推荐）和对象语法（兼容 Playwright）。

### 构建器模式 <Version>4.1.0</Version> {#builder-pattern}

构建器模式是定义夹具的推荐方式，因为它提供自动类型推断。TypeScript 会根据每个夹具的返回值推断其类型，因此你不需要手动声明类型。

```ts [my-test.ts]
import { test as baseTest } from 'vitest'

export const test = baseTest
  // 简单值 - 类型被推断为 { port: number; host: string }
  .extend('config', { port: 3000, host: 'localhost' })
  // 函数夹具 - 类型从返回值推断
  .extend('server', async ({ config }) => {
    // TypeScript 知道 config 是 { port: number; host: string }
    return `http://${config.host}:${config.port}`
  })
```

然后在你的测试中使用它：

```ts [my-test.test.ts]
import { expect } from 'vitest'
import { test } from './my-test.js'

test('server uses correct port', ({ config, server }) => {
  // TypeScript 知道类型：
  // - config 是 { port: number; host: string }
  // - server 是 string
  expect(server).toBe('http://localhost:3000')
  expect(config.port).toBe(3000)
})
```

#### 使用 `onCleanup` 进行设置和清理

对于需要设置或清理逻辑的夹具，请使用函数。`onCleanup` 回调注册了在夹具作用域结束后运行的清理逻辑：

```ts
import { test as baseTest } from 'vitest'

export const test = baseTest
  .extend('tempFile', async ({}, { onCleanup }) => {
    const filePath = `/tmp/test-${Date.now()}.txt`
    await fs.writeFile(filePath, 'test data')

    // 注册清理逻辑 - 在测试完成后运行
    onCleanup(async () => {
      await fs.unlink(filePath)
    })

    return filePath
  })
```

对于更复杂的示例：

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
`onCleanup` 函数每个夹具只能调用 **一次**。如果你需要多个清理操作，要么将它们合并到一个清理函数中，要么将你的夹具拆分为多个较小的夹具：

```ts
// ❌ 这将抛出错误
const test = baseTest
  .extend('resources', async ({}, { onCleanup }) => {
    const a = await acquireA()
    onCleanup(() => releaseA(a))

    const b = await acquireB()
    onCleanup(() => releaseB(b)) // Error: onCleanup can only be called once

    return { a, b }
  })

// ✅ 拆分为单独的夹具（推荐）
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

拆分为单独的夹具是推荐的方法，因为它提供了更好的隔离性并使依赖关系显式化。
:::

#### 夹具选项

`.extend()` 的第二个参数接受选项：

```ts
const test = baseTest
  // 自动夹具 - 即使未使用也会为每个测试运行
  .extend('metrics', { auto: true }, ({}, { onCleanup }) => {
    const metrics = new MetricsCollector()
    metrics.start()
    onCleanup(() => metrics.stop())
    return metrics
  })
  // Worker 作用域夹具 - 每个 worker 初始化一次
  .extend('config', { scope: 'worker' }, () => {
    return loadConfig()
  })
  // 文件作用域夹具 - 每个文件初始化一次
  .extend('database', { scope: 'file' }, async ({ config }, { onCleanup }) => {
    const db = await createDatabase(config)
    onCleanup(() => db.close())
    return db
  })
  // 注入夹具 - 可以通过配置覆盖
  .extend('baseUrl', { injected: true }, () => {
    return 'http://localhost:3000'
  })
```

对于测试作用域夹具（默认），你可以省略选项：

```ts
const test = baseTest
  .extend('simple', () => 'value')
```

#### 访问其他夹具

每个夹具可以通过其第一个参数访问之前定义的夹具。这适用于函数和非函数夹具：

```ts
const test = baseTest
  .extend('config', { apiUrl: 'https://api.example.com', port: 3000 })
  .extend('client', ({ config }) => {
    // TypeScript 知道 config 是 { apiUrl: string; port: number }
    return new ApiClient(config.apiUrl)
  })
  .extend('user', async ({ client }) => {
    // TypeScript 知道 client 是 ApiClient
    return await client.getCurrentUser()
  })
```

#### 对象语法（兼容 Playwright）

Vitest 还支持兼容 Playwright 的对象语法。如果你正在从 Playwright 迁移或偏好一次性定义所有夹具，这很有用：

```ts [my-test.ts]
import { test as baseTest } from 'vitest'

export const test = baseTest.extend({
  page: async ({}, use) => {
    // 在每个测试函数之前设置夹具
    const page = await browser.newPage()

    // 使用夹具值
    await use(page)

    // 在每个测试函数之后清理夹具
    await page.close()
  },
  baseUrl: 'http://localhost:3000'
})
```

与构建器模式的关键区别在于用于清理的 `use()` 回调模式：

```ts
// 对象语法：清理代码放在 use() 之后
const test = baseTest.extend({
  database: async ({}, use) => {
    const db = await createDatabase()
    await db.connect()

    await use(db) // 测试在此处运行

    // 测试后清理
    await db.disconnect()
  }
})

// 构建器模式：清理逻辑通过 onCleanup() 注册
const test = baseTest
  .extend('database', async ({}, { onCleanup }) => {
    const db = await createDatabase()
    await db.connect()

    onCleanup(() => db.disconnect())

    return db // 测试在此返回后运行
  })
```

::: info
使用对象语法时，你需要手动提供类型作为泛型参数，因为 TypeScript 无法从 `use()` 回调中推断它们：

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

#### 选项的元组语法

使用对象语法时，使用元组来指定夹具选项：

```ts
const test = baseTest.extend({
  // 自动夹具
  fixture: [
    async ({}, use) => {
      setup()
      await use()
      teardown()
    },
    { auto: true }
  ],
  // 作用域夹具
  database: [
    async ({}, use) => {
      const db = await createDatabase()
      await use(db)
      await db.close()
    },
    { scope: 'file' }
  ],
  // 注入夹具
  url: [
    '/default',
    { injected: true }
  ],
})
```

### 夹具初始化

Vitest 运行器会智能地初始化你的夹具并将它们注入到基于使用情况的测试上下文中。

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

// database 不会运行
test('no fixtures needed', () => {})
test('only cache', ({ cache }) => {})

// database 会运行
test('needs database', ({ database }) => {})
```

::: warning
当使用 `test.extend()` 搭配夹具时，你应该始终使用对象解构模式 `{ database }` 来在夹具函数和测试函数中访问上下文。

```ts
test('context must be destructured', (context) => { // [!code --]
  expect(context.database).toBeDefined()
})

test('context must be destructured', ({ database }) => { // [!code ++]
  expect(database).toBeDefined()
})
```
:::

### 扩展已扩展的测试

你可以扩展一个已经扩展过的测试以添加更多夹具：

```ts
import { test as dbTest } from './my-test.js'

export const test = dbTest
  .extend('user', ({ database }) => {
    return database.createUser()
  })
```

使用对象语法：

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

### 混合两种语法

你可以结合两种方法。构建器模式可以在基于对象的扩展之后链式调用：

```ts
const test = baseTest
  // 简单夹具的对象语法
  .extend<{ apiKey: string }>({
    apiKey: 'test-key-123',
  })
  // 带有推断的复杂夹具的构建器模式
  .extend('client', ({ apiKey }) => {
    // TypeScript 知道 apiKey 是 string
    return new ApiClient(apiKey)
  })
```

### 夹具作用域 <Version>3.2.0</Version> {#fixture-scopes}

默认情况下，夹具会为每个测试初始化。你可以使用 `scope` 选项更改此设置以在测试之间共享夹具。

::: warning
默认情况下，任何没有作用域的夹具都被视为 `test` 夹具。这意味着你不能在 `worker` 和 `file` 作用域内使用它。如果你希望在那里访问它，请考虑手动指定作用域：

```ts
test
  .extend('port', { scope: 'worker' }, 5000)
  .extend('db', { scope: 'worker' }, async ({ port }) => {
    return createDb(port)
  })
```

请注意，你不能在 `describe` 块内覆盖非测试夹具：

```ts
test.describe('a nested suite', () => {
  test.override('port', { scope: 'worker' }, 3000) // 抛出错误
})
```

考虑在模块的顶层覆盖它，或使用 [`injected`](#default-fixture-injected) 选项并在项目配置中提供值。

还要注意，在 [非隔离](/config/isolate) 模式下，覆盖 `worker` 夹具会影响在其被覆盖后运行的所有测试文件中的夹具值。
:::

#### 测试作用域（默认）

测试作用域夹具为每个测试新鲜创建：

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
  // 新鲜实例，值再次为 0
  expect(counter.value).toBe(0)
})
```

测试作用域夹具可以访问 [内置测试上下文](#built-in-test-context)（`task`、`expect`、`skip` 等）：

```ts
const test = baseTest
  .extend('testInfo', ({ task }) => {
    return { name: task.name }
  })
```

#### 文件作用域

文件作用域夹具每个测试文件初始化一次：

```ts
const test = baseTest
  .extend('database', { scope: 'file' }, async ({}, { onCleanup }) => {
    const db = await createDatabase()
    onCleanup(() => db.close())
    return db
  })

test('first test', ({ database }) => {
  // 使用相同的 database 实例
})

test('second test', ({ database }) => {
  // 与第一个测试相同的 database 实例
})
```

#### Worker 作用域

Worker 作用域夹具每个 worker 进程初始化一次：

```ts
const test = baseTest
  .extend('config', { scope: 'worker' }, () => {
    return await loadExpensiveConfig()
  })
```

::: info
默认情况下，每个文件在单独的 worker 中运行，因此 `file` 和 `worker` 作用域工作方式相同。但是，如果你禁用 [隔离](/config/isolate)，那么 worker 的数量受 [`maxWorkers`](/config/maxworkers) 限制，并且 worker 作用域夹具将在同一 worker 中运行的文件之间共享。

在 `vmThreads` 或 `vmForks` 中运行测试时，`scope: 'worker'` 的工作方式与 `scope: 'file'` 相同，因为每个文件都有自己的 VM 上下文。
:::

#### 作用域层次结构

夹具只能访问来自相同或更高（寿命更长）作用域的其他夹具：

| 夹具作用域 | 可以访问 |
|---------------|------------|
| `worker` | 仅其他 worker 夹具 |
| `file` | Worker + 文件夹具 |
| `test` | Worker + 文件 + 测试夹具 + [测试上下文](#built-in-test-context) |

```ts
const test = baseTest
  .extend('config', { scope: 'worker' }, () => {
    return { apiUrl: 'https://api.example.com' }
  })
  .extend('database', { scope: 'file' }, async ({ config }, { onCleanup }) => {
    // ✅ 文件夹具可以访问 worker 夹具
    const db = await createDatabase(config.apiUrl)
    onCleanup(() => db.close())
    return db
  })
  .extend('user', async ({ database, task }) => {
    // ✅ 测试夹具可以访问文件夹具和测试上下文
    return await database.createUser(task.name)
  })
```

::: tip
只有测试作用域夹具可以访问 [内置测试上下文](#built-in-test-context)（`task`、`expect`、`skip` 等）。Worker 和文件夹具在任何特定测试之外运行，因此测试特定的属性对它们不可用。

如果你需要在文件作用域夹具中获取文件路径，请使用 `expect.getState().testPath`。
:::

#### 类型安全的作用域访问 <Version>3.2.0</Version> {#type-safe-scope-access}

使用构建器模式，TypeScript 会自动强制实施基于作用域的访问规则。如果你尝试从文件作用域夹具访问测试作用域夹具，你将得到编译时错误。

如果你使用对象语法并想要相同的类型安全性，你可以使用 `$worker`、`$file` 和 `$test` 键来显式声明哪些夹具属于哪个作用域：

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

这提供了与构建器模式相同的编译时安全性，在构建时而不是运行时捕获作用域违规。

### 默认夹具（注入）

自 Vitest 3 起，你可以在不同的 [项目](/guide/projects) 中提供不同的值。要启用此功能，请在选项中传递 `{ injected: true }`。如果 [项目配置](/config/provide) 中未指定键，则将使用默认值。

:::code-group
```ts [fixtures.test.ts]
import { test as baseTest } from 'vitest'

const test = baseTest
  .extend('url', { injected: true }, '/default')

test('works correctly', ({ url }) => {
  // 在 "project-new" 中 url 是 "/default"
  // 在 "project-full" 中 url 是 "/full"
  // 在 "project-empty" 中 url 是 "/empty"
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

### 覆盖夹具值 <Version>4.1.0</Version> {#overriding-fixture-values}

你可以使用 `test.override` 覆盖特定套件及其子项的夹具值。当你需要为不同的测试场景使用不同的夹具值时，这很有用。

::: tip
如果覆盖时未提供选项，Vitest 将自动继承选项。请注意，你不能覆盖夹具的 `scope` 或 `auto` 选项。
:::

#### 构建器模式（推荐）

```ts
import { test as baseTest, describe, expect } from 'vitest'

const test = baseTest
  .extend('config', { port: 3000, host: 'localhost' })
  .extend('server', ({ config }) => `http://${config.host}:${config.port}`)

describe('production environment', () => {
  // 覆盖为新的静态值（可链式调用）
  test
    .override('config', { port: 8080, host: 'api.example.com' })

  test('uses production config', ({ server }) => {
    expect(server).toBe('http://api.example.com:8080')
  })
})

describe('with custom server', () => {
  // 覆盖为可以访问其他夹具的函数
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

#### 链式调用多个覆盖

`test.override` 返回测试 API，因此你可以链式调用多个调用：

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

#### 对象语法

你也可以使用对象语法一次性覆盖多个夹具：

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

#### 带清理

当使用函数覆盖时，你可以像在 `test.extend` 中一样使用 `onCleanup`：

```ts
describe('with custom database', () => {
  test.override('database', async ({ config }, { onCleanup }) => {
    const db = await createTestDatabase(config)
    onCleanup(() => db.drop())
    return db
  })

  test('uses custom database', ({ database }) => {
    // 使用被覆盖的 database
  })
})
```

#### 嵌套作用域

覆盖由嵌套套件继承，并且可以再次被覆盖：

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
    })
  })

  test('still uses level 1 value', ({ value }) => {
    expect(value).toBe('one')
  })
})
```

::: warning
请注意，你不能在 `test.override` 内引入新夹具。请改用 `test.extend` 扩展测试上下文。
:::

::: info
`test.scoped` 已弃用，推荐使用 `test.override`。`test.scoped` API 仍然有效，但将在未来版本中移除。
:::

### 类型安全钩子

使用 `test.extend` 时，扩展后的 `test` 对象提供感知扩展上下文的类型安全钩子：

```ts
const test = baseTest
  .extend('counter', { value: 0, increment() { this.value++ } })

// 与全局钩子不同，这些钩子感知扩展后的上下文
test.beforeEach(({ counter }) => {
  counter.increment()
})

test.afterEach(({ counter }) => {
  console.log('Final count:', counter.value)
})
```

#### 套件级钩子与夹具 <Version>4.1.0</Version> {#suite-level-hooks}

扩展后的 `test` 对象还提供 [`beforeAll`](/api/hooks#beforeall)、[`afterAll`](/api/hooks#afterall) 和 [`aroundAll`](/api/hooks#aroundall) 钩子，这些钩子可以访问文件作用域和 worker 作用域夹具：

```ts
const test = baseTest
  .extend('config', { scope: 'file' }, () => loadConfig())
  .extend('database', { scope: 'file' }, async ({ config }, { onCleanup }) => {
    const db = await createDatabase(config)
    onCleanup(() => db.close())
    return db
  })

// 在套件级钩子中访问文件作用域夹具
test.aroundAll(async (runSuite, { database }) => {
  await database.transaction(runSuite)
})

test.beforeAll(async ({ database }) => {
  await database.createUsers()
})

test.afterAll(async ({ database }) => {
  await database.removeUsers()
})
```

::: warning 重要
套件级钩子（`beforeAll`、`afterAll`、`aroundAll`）**必须在从 `test.extend()` 返回的 `test` 对象上调用** 才能访问扩展的夹具。使用全局 `beforeAll`/`afterAll`/`aroundAll` 函数将无法访问你的自定义夹具：

```ts
import { test as baseTest, beforeAll } from 'vitest'

const test = baseTest
  .extend('database', { scope: 'file' }, async ({}, { onCleanup }) => {
    const db = await createDatabase()
    onCleanup(() => db.close())
    return db
  })

// ❌ 错误：全局 beforeAll 无法访问 'database'
beforeAll(({ database }) => {
  // 错误：'database' 是 undefined
})

// ✅ 正确：使用 test.beforeAll 访问夹具
test.beforeAll(({ database }) => {
  // 'database' 可用
})
```

这适用于所有套件级钩子：`beforeAll`、`afterAll` 和 `aroundAll`。
:::

::: tip
套件级钩子只能访问 [**文件作用域** 和 **worker 作用域** 夹具](#fixture-scopes)，包括 `auto` 夹具。测试作用域夹具在这些钩子中不可用，因为它们在单个测试的上下文之外运行。如果你尝试在套件级钩子中访问测试作用域夹具，Vitest 将抛出错误。

```ts
const test = baseTest
  .extend('testFixture', () => 'test-scoped')
  .extend('fileFixture', { scope: 'file' }, () => 'file-scoped')

// ❌ 错误：beforeAll 中不可用测试作用域夹具
test.beforeAll(({ testFixture }) => {})

// ✅ 有效：文件作用域夹具可用
test.beforeAll(({ fileFixture }) => {})
```
:::
