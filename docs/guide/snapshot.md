---
title: 快照 | 指南
---

# 快照

::: tip
对于想要了解快照测试的初学者，请参考 [快照测试](/guide/learn/snapshots) 教程。
:::

<CourseLink href="https://vueschool.io/lessons/snapshots-in-vitest?friend=vueuse">通过视频在 Vue School 学习快照</CourseLink>

快照测试是一个非常有用的工具，当你希望确保函数的输出不会意外更改时。

使用快照时，Vitest 会为给定值创建快照，然后将其与存储在测试旁边的参考快照文件进行比较。如果两个快照不匹配，测试将失败：要么是意外更改，要么是参考快照需要更新为结果的新版本。

## 使用快照

要对值进行快照，你可以使用 `expect()` API 中的 [`toMatchSnapshot()`](/api/expect#tomatchsnapshot)：

```ts
import { expect, it } from 'vitest'

it('toUpperCase', () => {
  const result = toUpperCase('foobar')
  expect(result).toMatchSnapshot()
})
```

首次运行此测试时，Vitest 会创建一个如下所示的快照文件：

```js
// Vitest 快照 v1, https://vitest.dev/guide/snapshot.html

exports['toUpperCase 1'] = '"FOOBAR"'
```

快照文件应该与代码更改一起提交，并作为代码审查过程的一部分进行审查。在后续的测试运行中，Vitest 会将渲染的输出与之前的快照进行比较。如果它们匹配，测试将通过。如果它们不匹配，要么是测试运行器发现了代码中应该修复的错误，要么是实现已更改并且需要更新快照。

Vitest 存储接收值的序列化表示。快照渲染由 [`@vitest/pretty-format`](https://npmx.dev/package/@vitest/pretty-format) 提供支持。[`snapshotFormat`](/config/snapshotformat) 允许配置 Vitest 中的常规快照格式化行为。为了进一步定制，你可以实现自己的 [自定义序列化器](#custom-serializer) 或 [自定义快照匹配器](#custom-snapshot-matchers)。

::: warning
当在异步并发测试中使用快照时，必须使用本地 [测试上下文](/guide/test-context) 中的 `expect` 以确保检测到正确的测试。
:::

## 内联快照

类似地，你可以使用 [`toMatchInlineSnapshot()`](/api/expect#tomatchinlinesnapshot) 将快照存储在测试文件内。

```ts
import { expect, it } from 'vitest'

it('toUpperCase', () => {
  const result = toUpperCase('foobar')
  expect(result).toMatchInlineSnapshot()
})
```

Vitest 不会创建快照文件，而是直接修改测试文件以将快照更新为字符串：

```ts
import { expect, it } from 'vitest'

it('toUpperCase', () => {
  const result = toUpperCase('foobar')
  expect(result).toMatchInlineSnapshot('"FOOBAR"')
})
```

这允许你直接看到预期输出，而无需在不同文件之间跳转。

::: warning
当在异步并发测试中使用快照时，必须使用本地 [测试上下文](/guide/test-context) 中的 `expect` 以确保检测到正确的测试。
:::

## 更新快照

当接收到的值与快照不匹配时，测试将失败并显示它们之间的差异。当快照更改是预期时，你可能想要从当前状态更新快照。

在监视模式下，你可以在终端中按 `u` 键直接更新失败的快照。

或者你可以在 CLI 中使用 `--update` 或 `-u` 标志使 Vitest 更新快照。

```bash
vitest -u
```

### CI 行为

默认情况下，Vitest 不会在 CI 中写入快照（`process.env.CI` 为真值），任何快照不匹配、缺少快照和过时快照都会导致运行失败。详见 [`update`](/config/update)。

**过时快照** 是指不再匹配任何收集到的测试的快照条目（或快照文件）。这通常发生在移除或重命名测试之后。

## 文件快照

当调用 `toMatchSnapshot()` 时，我们将所有快照存储在一个格式化的 snap 文件中。这意味着我们需要转义快照字符串中的某些字符（即双引号 `"` 和反引号 `` ` ``）。同时，你可能会丢失快照内容的语法高亮（如果它们是某种语言）。

鉴于此，我们引入了 [`toMatchFileSnapshot()`](/api/expect#tomatchfilesnapshot) 来显式匹配文件。这允许你为快照文件分配任何文件扩展名，并使它们更具可读性。

```ts
import { expect, it } from 'vitest'

it('render basic', async () => {
  const result = renderHTML(h('div', { class: 'foo' }))
  await expect(result).toMatchFileSnapshot('./test/basic.output.html')
})
```

它将与 `./test/basic.output.html` 的内容进行比较。并且可以通过 `--update` 标志写回。

## 视觉快照

对于 UI 组件和页面的视觉回归测试，Vitest 通过 [浏览器模式](/guide/browser/) 提供内置支持，并使用 [`toMatchScreenshot()`](/api/browser/assertions#tomatchscreenshot) 断言：

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('button looks correct', async () => {
  const button = page.getByRole('button')
  await expect(button).toMatchScreenshot('primary-button')
})
```

这会捕获截图并将其与参考图像进行比较以检测意外的视觉更改。在 [视觉回归测试指南](/guide/browser/visual-regression-testing) 中了解更多。

## ARIA 快照 <Experimental /> <Version>4.1.4</Version> {#aria-snapshots}

ARIA 快照捕获 DOM 元素的可访问性树，并将其与存储的模板进行比较。基于 [Playwright 的 ARIA 快照](https://playwright.dev/docs/aria-snapshots)，它们提供了一种语义化的替代方案，用于视觉回归测试——断言结构和语义而非像素。

例如，给定此 HTML：

```html
<nav aria-label="Main">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

你可以断言其可访问性树：

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('navigation structure', async () => {
  await expect.element(page.getByRole('navigation')).toMatchAriaInlineSnapshot(`
    - navigation "Main":
      - link "Home":
        - /url: /
      - link "About":
        - /url: /about
  `)
})
```

请参阅专用的 [ARIA 快照指南](/guide/browser/aria-snapshots) 以了解语法细节、浏览器模式下的重试行为以及文件与内联快照示例。请参阅 [`toMatchAriaSnapshot`](/api/expect#tomatcharisnapshot) 和 [`toMatchAriaInlineSnapshot`](/api/expect#tomatchariainlinesnapshot) 以获取完整的 API 参考。

## 自定义序列化器

你可以添加自己的逻辑来更改快照的序列化方式。与 Jest 类似，Vitest 拥有内置 JavaScript 类型、HTML 元素、ImmutableJS 和 React 元素的默认序列化器。

你可以使用 [`expect.addSnapshotSerializer`](/api/expect#expect-addsnapshotserializer) API 显式添加自定义序列化器。

```ts
expect.addSnapshotSerializer({
  serialize(val, config, indentation, depth, refs, printer) {
    // `printer` 是一个使用现有插件序列化值的函数。
    return `Pretty foo: ${printer(
      val.foo,
      config,
      indentation,
      depth,
      refs,
    )}`
  },
  test(val) {
    return val && Object.prototype.hasOwnProperty.call(val, 'foo')
  },
})
```

我们还支持 [snapshotSerializers](/config/snapshotserializers) 选项来隐式添加自定义序列化器。

```ts [path/to/custom-serializer.ts]
import { SnapshotSerializer } from 'vitest'

export default {
  serialize(val, config, indentation, depth, refs, printer) {
    // `printer` 是一个使用现有插件序列化值的函数。
    return `Pretty foo: ${printer(
      val.foo,
      config,
      indentation,
      depth,
      refs,
    )}`
  },
  test(val) {
    return val && Object.prototype.hasOwnProperty.call(val, 'foo')
  },
} satisfies SnapshotSerializer
```

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    snapshotSerializers: ['path/to/custom-serializer.ts'],
  },
})
```

添加如下测试后：

```ts
test('foo snapshot test', () => {
  const bar = {
    foo: {
      x: 1,
      y: 2,
    },
  }

  expect(bar).toMatchSnapshot()
})
```

你将获得以下快照：

```
Pretty foo: Object {
  "x": 1,
  "y": 2,
}
```

## 自定义快照匹配器 <Experimental /> <Version>4.1.3</Version> {#custom-snapshot-matchers}

你可以使用 `vitest` 中 `Snapshots` 暴露的组合函数构建自定义快照匹配器。这允许你在快照之前转换值，同时保留完整的快照生命周期支持（创建、更新、内联重写）。

```ts
import { expect, test, Snapshots } from 'vitest'

const { toMatchFileSnapshot, toMatchInlineSnapshot, toMatchSnapshot } = Snapshots

expect.extend({
  toMatchTrimmedSnapshot(received: string) {
    return toMatchSnapshot.call(this, received.slice(0, 10))
  },
  toMatchTrimmedInlineSnapshot(received: string, inlineSnapshot?: string) {
    return toMatchInlineSnapshot.call(this, received.slice(0, 10), inlineSnapshot)
  },
  async toMatchTrimmedFileSnapshot(received: string, file: string) {
    return toMatchFileSnapshot.call(this, received.slice(0, 10), file)
  },
})

test('file snapshot', () => {
  // 创建 __snapshots__/demo.test.ts，内容为
  // > exports[`file snapshot 1`] = `"extra long"`
  expect('extra long string oh my gerd').toMatchTrimmedSnapshot(10)
})

test('inline snapshot', () => {
  expect('super long string oh my gerd').toMatchTrimmedInlineSnapshot(`"super long"`)
})

test('raw file snapshot', async () => {
  // 创建 raw-file.txt，内容为：
  // > crazy long
  await expect('crazy long string oh my gerd').toMatchTrimmedFileSnapshot('./raw-file.txt')
})
```

组合函数返回 `{ pass, message }`，因此你可以进一步自定义错误：

```ts
import { Snapshots } from 'vitest'

const { toMatchSnapshot } = Snapshots

expect.extend({
  toMatchTrimmedSnapshot(received: string, length: number) {
    const result = toMatchSnapshot.call(this, received.slice(0, length))
    return { ...result, message: () => `Trimmed snapshot failed: ${result.message()}` }
  },
})
```

::: warning
对于内联快照匹配器，快照参数必须是最后一个参数（或者在使用属性匹配器时为倒数第二个）。Vitest 会重写源代码中的最后一个字符串参数，因此快照之前的自定义参数可以工作，但不支持之后的自定义参数。
:::

::: tip
文件快照匹配器必须是 `async` 的 — `toMatchFileSnapshot` 返回一个 `Promise`。记得在匹配器和测试中 `await` 结果。
:::

::: warning
当自定义内联快照匹配器是异步时，Vitest 无法自动推断内联快照重写的调用位置。你必须通过在 chai 断言对象上设置 `'error'` 标志来捕获调用点：

```ts
import { expect, chai, Snapshots } from 'vitest'

const { toMatchInlineSnapshot } = Snapshots

expect.extend({
  async toMatchTransformedInlineSnapshot(received: string, inlineSnapshot?: string) {
    // 在匹配器实现的顶部同步捕获调用位置
    chai.util.flag(this.assertion, 'error', new Error())
    const transformed = await transform(received)
    return toMatchInlineSnapshot.call(this, transformed, inlineSnapshot)
  },
})
```

:::

对于 TypeScript，扩展 `Assertion` 接口：

```ts
import 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> {
    toMatchTrimmedSnapshot: (length: number) => T
    toMatchTrimmedInlineSnapshot: (inlineSnapshot?: string) => T
    toMatchTrimmedFileSnapshot: (file: string) => Promise<T>
  }
}
```

::: tip
有关 `expect.extend` 和自定义匹配器约定的更多信息，请参阅 [扩展匹配器](/guide/extending-matchers)。
:::

## 自定义快照域 <Experimental /> <Version>4.1.4</Version> {#custom-snapshot-domain}

自定义序列化器控制值如何 _呈现_ 为快照字符串，但比较仍然是字符串相等性。**域快照适配器** 更进一步：它拥有整个比较管道，用于自定义匹配器，包括如何捕获值、呈现它、解析存储的快照以及语义匹配它们。

### 适配器接口

域适配器实现四个方法，并带有两个类型泛型 — `Captured`（值的实际类型）和 `Expected`（存储快照解析成的类型）：

```ts
import type { DomainMatchResult, DomainSnapshotAdapter } from 'vitest'

const myAdapter: DomainSnapshotAdapter<Captured, Expected> = {
  name: 'my-domain',

  // 从接收到的值中提取结构化数据
  capture(received: unknown): Captured { /* ... */ },

  // 将捕获的数据呈现为快照字符串（存储的内容）
  render(captured: Captured): string { /* ... */ },

  // 将存储的快照字符串解析为结构化的预期值
  parseExpected(input: string): Expected { /* ... */ },

  // 比较捕获的值与预期值，返回通过/失败以及解析后的输出
  match(captured: Captured, expected: Expected): DomainMatchResult { /* ... */ },
}
```

#### `DomainMatchResult`

`match` 方法返回一个 `DomainMatchResult`，包含两个可选的字符串字段（除了 `pass`）：

- **`resolved`** — 通过模板的视角查看捕获的值。如果模板使用模式（例如正则表达式）或省略了细节，则解析后的字符串采用这些模式。如果模板不匹配，则使用字面捕获值。这既作为差异的“实际”一侧，也是在 `--update` 时写入的值。省略时回退到 `render(capture(received))`。

- **`expected`** — 存储的模板重新渲染为字符串。用作差异的“预期”一侧。省略时回退到来自快照文件或内联快照的原始快照字符串。

:::details 为什么 `Captured` 和 `Expected` 是分开的类型？

当首次生成快照时，`render(captured)` 会产生一个普通字符串并存储。但存储后，用户可以**手动编辑**它——用正则模式替换字面量、放宽断言或添加领域特定的查询语法。编辑后，`parseExpected(input)` 会将这个修改后的字符串解析为一个比 `capture` 生成的类型**更丰富**的类型。

例如，在下面的 [键值适配器](#example-key-value-adapter) 中，`Captured` 值总是 `string`，但 `Expected` 值可以是 `string | RegExp`：

```ts
type KVCaptured = Record<string, string>
type KVExpected = Record<string, string | RegExp>
```

这种不对称性正是 `--update` 正确工作的关键：`match` 返回一个 `resolved` 字符串，更新变化的字面部分同时**保留**用户的编辑模式。如果两边是相同类型，就无法区分“这个值的实际是什么”和“用户选择断言什么”——每次更新都会覆盖用户的模式。

:::

### 从适配器构建匹配器

使用 `expect.extend(...)` 注册自定义匹配器，并从 `vitest` 调用快照组合函数：

```ts [setup.ts]
import { expect, Snaphsots } from 'vitest'

expect.extend({
  toMatchMyDomainSnapshot(received: unknown) {
    return Snaphsots.toMatchDomainSnapshot.call(this, myAdapter, received)
  },
  toMatchMyDomainInlineSnapshot(received: unknown, inlineSnapshot?: string) {
    return Snaphsots.toMatchDomainInlineSnapshot.call(
      this,
      myAdapter,
      received,
      inlineSnapshot,
    )
  },
})
```

然后在测试中使用你的匹配器：

```ts
expect(value).toMatchMyDomainSnapshot()
expect(value).toMatchMyDomainInlineSnapshot(`key=value`)
```

### 示例：键值适配器

一个最小的适配器，将对象存储为 `key=value` 行，并支持正则模式和子集键匹配（[完整源码](https://github.com/vitest-dev/vitest/blob/main/test/snapshots/test/fixtures/domain/basic.ts)）：

```ts [kv-adapter.ts]
import type { DomainMatchResult, DomainSnapshotAdapter } from 'vitest'

type KVCaptured = Record<string, string>
type KVExpected = Record<string, string | RegExp>

function renderKV(obj: Record<string, unknown>) {
  return `\n${Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('\n')}\n`
}

export const kvAdapter: DomainSnapshotAdapter<KVCaptured, KVExpected> = {
  name: 'kv',

  capture(received: unknown): KVCaptured {
    if (received && typeof received === 'object') {
      return Object.fromEntries(
        Object.entries(received).map(([k, v]) => [k, String(v)]),
      )
    }
    throw new TypeError('kv adapter expects a plain object')
  },

  render(captured: KVCaptured): string {
    return renderKV(captured)
  },

  parseExpected(input: string): KVExpected {
    const entries = input.trim().split('\n').map((line) => {
      const eq = line.indexOf('=')
      const key = line.slice(0, eq)
      const raw = line.slice(eq + 1)
      const value = (raw.startsWith('/') && raw.endsWith('/') && raw.length > 1)
        ? new RegExp(raw.slice(1, -1))
        : raw
      return [key, value]
    })
    return Object.fromEntries(entries)
  },

  match(captured: KVCaptured, expected: KVExpected): DomainMatchResult {
    const resolvedLines: string[] = []
    let pass = true

    for (const [key, actualValue] of Object.entries(captured)) {
      const expectedValue = expected[key]

      // 跳过未断言的键（作为子集匹配）
      if (typeof expectedValue === 'undefined') {
        continue
      }

      // 保留匹配到的通配符，以便规范化差异和部分更新
      if (expectedValue instanceof RegExp && expectedValue.test(actualValue)) {
        resolvedLines.push(`${key}=/${expectedValue.source}/`)
        continue
      }

      resolvedLines.push(`${key}=${actualValue}`)
      pass &&= actualValue === expectedValue
    }

    return {
      pass,
      message: pass ? undefined : 'KV 条目不匹配',
      resolved: `\n${resolvedLines.join('\n')}\n`,
      expected: `\n${renderKV(expected)}\n`,
    }
  },
}
```

```ts [setup.ts]
import { expect, Snapshots } from 'vitest'
import { kvAdapter } from './kv-adapter'

expect.extend({
  toMatchKvSnapshot(received: unknown) {
    return Snapshots.toMatchDomainSnapshot.call(this, kvAdapter, received)
  },
  toMatchKvInlineSnapshot(received: unknown, inlineSnapshot?: string) {
    return Snapshots.toMatchDomainInlineSnapshot.call(this, kvAdapter, received, inlineSnapshot)
  },
})
```

```ts [example.test.ts]
import { expect, test } from 'vitest'

test('user data', () => {
  const user = { name: 'Alice', score: '42' }
  expect(user).toMatchKvSnapshot()
})

test('user data inline', () => {
  const user = { name: 'Alice', age: 100, score: '42' }
  expect(user).toMatchKvInlineSnapshot(`
    name=Alice
    score=/\\d+/
  `)
})
```

## 与 Jest 的差异

Vitest 提供了与 [Jest](https://jestjs.io/docs/snapshot-testing) 几乎兼容的快照功能，但有一些例外：

### 1. 快照文件中的注释头不同

```diff
- // Jest 快照 v1, https://goo.gl/fbAQLP
+ // Vitest 快照 v1, https://vitest.dev/guide/snapshot.html
```

这实际上不影响功能，但在从 Jest 迁移时可能会影响你的提交差异。

### 2. `printBasicPrototype` 默认为 `false`

Jest 和 Vitest 快照都由 `pretty-format` 驱动，但 Vitest 在 [`@vitest/pretty-format`](https://npmx.dev/package/@vitest/pretty-format) 之上应用了自己的快照默认值。特别是，Vitest 将 `printBasicPrototype` 设置为 `false` 以提供更清晰的快照输出，而在 Jest <29.0.0 中默认为 `true`。

```ts
import { expect, test } from 'vitest'

test('snapshot', () => {
  const bar = [
    {
      foo: 'bar',
    },
  ]

  // 在 Jest 中
  expect(bar).toMatchInlineSnapshot(`
    Array [
      Object {
        "foo": "bar",
      },
    ]
  `)

  // 在 Vitest 中
  expect(bar).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)
})
```

我们认为这对于可读性和整体 DX 来说是更合理的默认值。如果你仍然更喜欢 Jest 的行为，你可以更改配置：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    snapshotFormat: {
      printBasicPrototype: true,
    },
  },
})
```

### 3. 使用尖括号 `>` 而不是冒号 `:` 作为自定义消息的分隔符

当在创建快照文件期间传递自定义消息时，Vitest 使用尖括号 `>` 而不是冒号 `:` 作为分隔符，以提高可读性。

对于以下示例测试代码：
```js
test('toThrowErrorMatchingSnapshot', () => {
  expect(() => {
    throw new Error('error')
  }).toThrowErrorMatchingSnapshot('hint')
})
```

在 Jest 中，快照将是：
```console
exports[`toThrowErrorMatchingSnapshot: hint 1`] = `"error"`;
```

在 Vitest 中，等效的快照将是：
```console
exports[`toThrowErrorMatchingSnapshot > hint 1`] = `[Error: error]`;
```

### 4. `toThrowErrorMatchingSnapshot` 和 `toThrowErrorMatchingInlineSnapshot` 的默认 `Error` 快照不同

```js
import { expect, test } from 'vitest'

test('snapshot', () => {
  // 在 Jest 和 Vitest 中
  expect(new Error('error')).toMatchInlineSnapshot(`[Error: error]`)

  // Jest 为 `Error` 实例快照 `Error.message`
  // Vitest 打印与 toMatchInlineSnapshot 相同的值
  expect(() => {
    throw new Error('error')
  }).toThrowErrorMatchingInlineSnapshot(`"error"`) // [!code --]
  }).toThrowErrorMatchingInlineSnapshot(`[Error: error]`) // [!code ++]
})
```
