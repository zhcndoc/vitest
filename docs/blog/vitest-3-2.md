---
title: Vitest 3.2 发布
author:
  name: Vitest 团队
date: 2025-06-02
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Vitest 3.2 发布
  - - meta
    - property: og:image
      content: https://vitest.zhcndoc.com/og-vitest-3-2.png
  - - meta
    - property: og:url
      content: https://vitest.zhcndoc.com/blog/vitest-3-2
  - - meta
    - property: og:description
      content: Vitest 3.2 发布！此版本专注于改进浏览器模式和 TypeScript 支持，并引入了新的有用方法和配置选项。
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vitest 3.2 发布

_2025 年 6 月 2 日_

![Vitest 3.2 发布封面图](/og-vitest-3-2.png)

Vitest 3.2 专注于改进浏览器模式和 TypeScript 支持。此版本还包括一些新的实用方法、配置选项，并弃用了 `workspace` 配置，推荐使用 `projects`。

## `workspace` 已弃用

为了简化配置，团队决定弃用单独的 `vitest.workspace` 文件，并建议仅在根配置中使用 `projects` 选项。这也简化了全局选项的配置方式（因为当你没有根配置时，不需要猜测如何添加报告器）。

我们还决定弃用 `workspace` 这个名称，因为它与其他通过此选项提供 monorepo 支持的工具（如 PNPM）发生冲突。Vitest 不会使用独立的 `CWD` 运行这些项目，而是将它们视为子 Vitest 实例。这也为我们提供了更多空间来为 monorepo 想出更好的解决方案，而不会破坏其他工具。

此选项将在未来的主版本中完全移除，由 `projects` 取代。在此之前，如果使用 workspace 功能，Vitest 将打印警告。

<!--@include: ../guide/examples/projects-workspace.md-->

## 注解 API

新的 [注解 API](/guide/test-annotations) 允许你用自定义消息和附件注解任何测试。这些注解在 UI、HTML、junit、tap 和 GitHub Actions 报告器中可见。如果测试失败，Vitest 还将在 CLI 中打印相关注解。

<img src="/annotation-api-cute-puppy-example.png" alt="一个带有可爱小狗的注解示例" />

## 作用域夹具

`test.extend` 夹具现在可以指定 `scope` 选项：`file` 或 `worker`。

```ts
const test = baseTest.extend({
  db: [
    async ({}, use) => {
      // ...设置
      await use(db)
      await db.close()
    },
    { scope: 'worker' },
  ],
})
```

文件夹具类似于在文件顶层使用 `beforeAll` 和 `afterAll`，但如果任何测试中未使用该夹具，则不会被调用。

`worker` 夹具每个 worker 初始化一次，但请注意，默认情况下 Vitest 为每个测试创建一个 worker，因此你需要禁用 [隔离](/config/isolate) 才能从中受益。

## 自定义项目名称颜色

现在可以在使用 `projects` 时设置自定义 [颜色](/config/name)：

::: details 配置示例
```ts{6-9,14-17}
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: {
            label: 'unit',
            color: 'red',
          },
        },
      },
      {
        test: {
          name: {
            label: 'browser',
            color: 'green',
          },
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
```
:::

<img src="/v3-2-custom-colors.png" alt="带有自定义背景的项目名称示例" />

## 自定义浏览器定位器 API

内置定位器可能不足以表达你的应用需求。与其回退到 CSS 并失去 Vitest 通过其定位器 API 提供的重试能力保护，我们现在推荐使用新的 [`locators.extend` API](/api/browser/locators#custom-locators) 扩展定位器。

```ts
import { locators } from '@vitest/browser/context'

locators.extend({
  getByCommentsCount(count: number) {
    return `.comments :text("${count} comments")`
  },
})
```

返回一个 Playwright [定位器字符串](https://playwright.dev/docs/other-locators) 以构造一个新的定位器。请注意，从此方法返回的字符串将限定于父定位器（如果有的话）。

现在你可以直接在 `page` 或任何其他定位器上调用 `getByCommentsCount`：

```ts
await expect.element(page.getByCommentsCount(1)).toBeVisible()
await expect.element(
  page.getByRole('article', { name: 'Hello World' })
    .getByCommentsCount(1)
).toBeVisible()
```

如果此方法返回字符串，则返回值将被转换为定位器，因此你可以继续链式调用：

```ts
page.getByRole('article', { name: 'Hello World' })
  .getByCommentsCount(1)
  .getByText('comments')
```

此方法可以访问当前的定位器上下文（如果有的话）（如果方法是在 `page` 上调用的，那么上下文将指向 `page`），因此你可以在内部链式调用所有定位器方法：

```ts
import { locators } from '@vitest/browser/context'
import type { Locator } from '@vitest/browser/context'

locators.extend({
  getByCommentsCount(this: Locator, count: number) {
    return this.getByRole('comment')
      .and(this.getByText(`${count} comments`))
  },
})
```

拥有上下文访问权限还允许你调用定位器的常规方法来定义自定义用户事件：

```ts
import { locators, page } from '@vitest/browser/context'
import type { Locator } from '@vitest/browser/context'

locators.extend({
  clickAndFill(this: Locator, text: string) {
    await this.click()
    await this.fill(text)
  },
})

await page.getByRole('textbox').clickAndFill('Hello World')
```

请参阅 [`locators.extend` API](/api/browser/locators#custom-locators) 以获取更多信息。

## `vi.spyOn` 和 `vi.fn` 中的显式资源管理

在支持 [显式资源管理](https://github.com/tc39/proposal-explicit-resource-management) 的环境中，你可以使用 `using` 代替 `const`，以便在退出包含块时自动在任何模拟函数上调用 `mockRestore`。这对于被监听的方法特别有用：

```ts
it('calls console.log', () => {
  using spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  debug('message')
  expect(spy).toHaveBeenCalled()
})

// console.log 在此处恢复
```

## 测试 `signal` API

Vitest 现在向测试主体提供 [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) 对象。你可以使用它来停止任何支持此 Web API 的资源。

当测试超时、另一个测试失败且 [`--bail` 标志](/config/bail) 设置为非零值，或用户在终端中按下 Ctrl+C 时，信号将被中止。

例如，当测试被中断时，你可以停止 `fetch` 请求：

```ts
it('stop request when test times out', async ({ signal }) => {
  await fetch('/heavy-resource', { signal })
}, 2000)
```

## 覆盖率 V8 AST 感知重映射

Vitest 现在使用由 Vitest 维护者之一 [AriPerkkio](https://github.com/AriPerkkio) 开发的 `ast-v8-to-istanbul` 包。这使得 v8 覆盖率报告与 istanbul 保持一致，但具有更好的性能！通过将 [`coverage.experimentalAstAwareRemapping`](/config/coverage#coverage-experimentalastawareremapping) 设置为 `true` 来启用此功能。

我们计划在下一个主版本中将其设为默认的重映射模式。旧的 `v8-to-istanbul` 将被完全移除。欢迎在 https://github.com/vitest-dev/vitest/issues/7928 加入讨论。

## `watchTriggerPatterns` 选项

当你编辑文件时，Vitest 足够智能，只会重新运行导入此文件的测试。不幸的是，Vitest 的静态分析只会尊重静态和动态 `import` 语句。如果你正在读取文件或启动单独的进程，Vitest 将忽略相关文件的变化。

使用 `watchTriggerPatterns` 选项，你可以根据更改的文件配置要重新运行哪些测试。例如，要在模板更改时始终重新运行 `mailers` 测试，请添加触发模式：

```ts
export default defineConfig({
  test: {
    watchTriggerPatterns: [
      {
        pattern: /src\/templates\/(.*)\.(ts|html|txt)$/,
        testsToRun: (file, match) => {
          return `api/tests/mailers/${match[2]}.test.ts`
        },
      },
    ],
  },
})
```

## 新的多用途 `Matchers` 类型

Vitest 现在有一个 `Matchers` 类型，你可以扩展它，以便在一个地方为所有自定义匹配器添加类型支持。此类型影响以下所有用例：

- `expect().to*`
- `expect.to*`
- `expect.extend({ to* })`

例如，要拥有类型安全的 `toBeFoo` 匹配器，你可以编写如下内容：

```ts twoslash
import { expect } from 'vitest'

interface CustomMatchers<R = unknown> {
  toBeFoo: (arg: string) => R
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}

expect.extend({
  toBeFoo(actual, arg) {
    //            ^?
    // ... 实现
    return {
      pass: true,
      message: () => '',
    }
  }
})

expect('foo').toBeFoo('foo')
expect.toBeFoo('foo')
```

## `sequence.groupOrder`

新的 [`sequence.groupOrder`](/config/sequence#sequence-grouporder) 选项控制在使用多个 [项目](/guide/projects) 时项目运行测试的顺序。

- 具有相同组顺序号的项目将一起运行，组从最低到最高运行。
- 如果你未设置此选项，所有项目将并行运行。
- 如果几个项目使用相同的组顺序，它们将同时运行。

::: details 示例
考虑此示例：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'slow',
          sequence: {
            groupOrder: 0,
          },
        },
      },
      {
        test: {
          name: 'fast',
          sequence: {
            groupOrder: 0,
          },
        },
      },
      {
        test: {
          name: 'flaky',
          sequence: {
            groupOrder: 1,
          },
        },
      },
    ],
  },
})
```

这些项目中的测试将按以下顺序运行：

```
 0. slow  |
          |> 一起运行
 0. fast  |

 1. flaky |> 在 slow 和 fast 之后单独运行
```
:::

----

完整的更改列表请参阅 [Vitest 3.2 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v3.2.0)。
