---
title: Vitest 4.0 发布
author:
  name: Vitest 团队
date: 2025-10-22
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Vitest 4.0 发布
  - - meta
    - property: og:image
      content: https://vitest.zhcndoc.com/og-vitest-4.jpg
  - - meta
    - property: og:url
      content: https://vitest.zhcndoc.com/blog/vitest-4
  - - meta
    - property: og:description
      content: Vitest 4.0 发布！这个版本带来了许多新功能和改进，包括稳定的浏览器模式、视觉回归测试、Playwright Traces 支持、改进的调试、类型感知 Hooks、新的 API 方法和更多。
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vitest 4.0 发布

_2025 年 10 月 22 日_

![Vitest 4 公告封面图](/og-vitest-4.jpg)

## 下一代 Vitest 主版本来了

今天，我们激动地宣布 Vitest 4！

快速链接：

- [文档](/)
- 翻译：[简体中文](https://cn.vitest.dev/)
- [迁移指南](/guide/migration#vitest-4)
- [GitHub 变更日志](https://github.com/vitest-dev/vitest/releases/tag/v4.0.0)

如果你之前没用过 Vitest，我们建议先阅读 [入门](/guide/) 和 [特性](/guide/features) 指南。

我们向 [640 多位 Vitest Core 贡献者](https://github.com/vitest-dev/vitest/graphs/contributors) 以及帮助我们开发这个新主版本的 Vitest 集成、工具和翻译的维护者和贡献者表示感谢。我们鼓励你参与进来，帮助我们在整个生态系统中改进 Vitest。了解更多请访问我们的 [贡献指南](https://github.com/vitest-dev/vitest/blob/main/CONTRIBUTING.md)。

为了开始，我们建议帮助 [分类问题](https://github.com/vitest-dev/vitest/issues)，[审查 PR](https://github.com/vitest-dev/vitest/pulls)，基于未解决的问题发送失败测试的 PR，并在 [讨论区](https://github.com/vitest-dev/vitest/discussions) 和 Vitest Land 的 [帮助论坛](https://discord.com/channels/917386801235247114/1057959614160851024) 中支持他人。如果你想与我们交流，加入我们的 [Discord 社区](http://chat.vitest.dev/) 并在 [#contributing 频道](https://discord.com/channels/917386801235247114/1057959614160851024) 打招呼。

有关 Vitest 生态系统和 Vitest core 的最新消息，请在 [Bluesky](https://bsky.app/profile/vitest.dev) 或 [Mastodon](https://webtoo.ls/@vitest) 上关注我们。

为了保持更新，请关注 [VoidZero 博客](https://voidzero.dev/blog) 并订阅 [通讯](https://voidzero.dev/newsletter)。

## 浏览器模式已稳定

随着此次发布，我们从 [浏览器模式](/guide/browser/) 中移除了 `experimental` 标签。为了实现这一点，我们必须对公共 API 引入一些变更。

要定义提供者，你现在需要安装一个独立的包：[`@vitest/browser-playwright`](https://npmx.dev/package/@vitest/browser-playwright)、[`@vitest/browser-webdriverio`](https://npmx.dev/package/@vitest/browser-webdriverio) 或 [`@vitest/browser-preview`](https://npmx.dev/package/@vitest/browser-preview)。这使得使用自定义选项更简单，并且不再需要添加 `/// <reference` 注释。

::: code-group
```ts [playwright]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright' // [!code ++]
/// <reference path="@vitest/browser/providers/playwright" /> // [!code --]

export default defineConfig({
  test: {
    browser: {
      provider: 'playwright', // [!code --]
      provider: playwright({ // [!code ++]
        launchOptions: { // [!code ++]
          slowMo: 100, // [!code ++]
        }, // [!code ++]
      }), // [!code ++]
      instances: [
        {
          browser: 'chromium',
          launch: { // [!code --]
            slowMo: 100, // [!code --]
          }, // [!code --]
        },
      ],
    },
  },
})
```
```ts [webdriverio]
import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio' // [!code ++]
/// <reference path="@vitest/browser/providers/webdriverio" /> // [!code --]

export default defineConfig({
  test: {
    browser: {
      provider: 'webdriverio', // [!code --]
      provider: webdriverio({ // [!code ++]
        capabilities: { // [!code ++]
          browserVersion: '82', // [!code ++]
        }, // [!code ++]
      }),
      instances: [
        {
          browser: 'chrome',
          capabilities: { // [!code --]
            browserVersion: '82', // [!code --]
          }, // [!code --]
        },
      ],
    },
  },
})
```
```ts [preview]
import { defineConfig } from 'vitest/config'
import { preview } from '@vitest/browser-preview' // [!code ++]

export default defineConfig({
  test: {
    browser: {
      provider: 'preview', // [!code --]
      provider: preview(), // [!code ++]
      instances: [
        { browser: 'chrome' },
      ],
    },
  },
})
```
:::

context 不再从 `@vitest/browser/context` 导入（但它将继续工作直到下一个主版本，以便与尚未更新的工具更好地兼容），现在只需从 `vitest/browser` 导入：

```ts
import { page } from '@vitest/browser/context' // [!code --]
import { page } from 'vitest/browser' // [!code ++]

test('example', async () => {
  await page.getByRole('button').click()
})
```

通过这些变更，`@vitest/browser` 包可以从你的依赖中移除。它现在会自动包含在每个提供者包中。

## 视觉回归测试

Vitest 4 在浏览器模式中添加了 [视觉回归测试](/guide/browser/visual-regression-testing.md) 支持。我们将继续迭代此功能以改进体验。

Vitest 中的视觉回归测试可以通过 [`toMatchScreenshot` 断言](/api/browser/assertions.html#tomatchscreenshot) 完成：

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('hero section looks correct', async () => {
  // ... 测试的其余部分

  // 捕获并比较截图
  await expect(page.getByTestId('hero')).toMatchScreenshot('hero-section')
})
```

Vitest 捕获你的 UI 组件和页面的截图，然后将它们与参考图像进行比较以检测意外的视觉变化。

除了此功能外，Vitest 还引入了 `toBeInViewport` 匹配器。它允许你使用 [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) 检查元素当前是否在视口中。

```ts
// 特定元素在视口中。
await expect.element(page.getByText('Welcome')).toBeInViewport()

// 特定元素的 50% 应该在视口中
await expect.element(page.getByText('To')).toBeInViewport({ ratio: 0.5 })
```

## Playwright Traces 支持

Vitest 4 支持生成 [Playwright Traces](/guide/browser/trace-view)。要启用追踪，你需要在 `test.browser` 配置中设置 [`trace`](/config/browser/trace) 选项，或传递 `--browser.trace=on` 选项（`off`、`on-first-retry`、`on-all-retries`、`retain-on-failure` 也可用）。

![Playwright Traces 界面](/traces.png)

追踪在报告器中作为 [注解](/guide/test-annotations) 可用。例如，在 HTML 报告器中，你可以在测试详情中找到追踪文件的链接。要打开追踪文件，你可以使用 [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)。

## Locator 改进

`frameLocator` 方法返回一个 `FrameLocator` 实例，可用于查找 iframe 内部的元素。
Vitest 现在支持一个新的 [`page.frameLocator`](/api/browser/context#framelocator) API（仅与 `playwright` 提供者一起使用）。

```ts
const frame = page.frameLocator(
  page.getByTestId('iframe')
)

await frame.getByText('Hello World').click() // ✅
await frame.click() // ❌ 不可用
```

每个 locator 现在都暴露一个 `length` 属性，允许它们与 `toHaveLength` 匹配器自动一起使用：

```ts
await expect.element(page.getByText('Item')).toHaveLength(3)
```

## 改进的调试

[vscode 扩展](https://vitest.dev/vscode) 现在在运行浏览器测试时支持 "调试测试" 按钮。

如果你更喜欢自己配置调试选项，你可以使用 `--inspect` 标志启动 Vitest（`playwright` 和 `webdriverio` 可用），并手动连接到 [DevTools](chrome://inspect/)。在这种情况下，Vitest 还将自动禁用新的 [`trackUnhandledErrors`](/config/browser/trackunhandlederrors) 选项。

## 类型感知 Hooks

当使用 `test.extend` 与生命周期 hooks（如 `beforeEach` 和 `afterEach`）时，你现在可以直接在返回的 `test` 对象上引用它们：

```ts
import { test as baseTest } from 'vitest'

const test = baseTest.extend<{
  todos: number[]
}>({
  todos: async ({}, use) => {
    await use([])
  },
})

// 与全局 hooks 不同，这些 hooks 感知扩展的 context
test.beforeEach(({ todos }) => {
  todos.push(1)
})

test.afterEach(({ todos }) => {
  console.log(todos)
})
```

## `expect.assert`

Vitest 一直导出 [Chai 的 `assert`](https://www.chaijs.com/api/assert/)，但有时使用它很不方便，因为许多模块都有相同的导出。

现在 Vitest 在 `expect` 上暴露了相同的方法以便于访问。如果你需要缩小类型范围，这尤其有用，因为 `expect.to*` 方法不支持这一点：

```ts
interface Cat {
  __type: 'Cat'
  mew(): void
}
interface Dog {
  __type: 'Dog'
  bark(): void
}
type Animal = Cat | Dog

const animal: Animal = { __type: 'Dog', bark: () => {} }

expect.assert(animal.__type === 'Dog')
// 不会显示类型错误！
expect(animal.bark()).toBeUndefined()
```

## `expect.schemaMatching`

Vitest 4 引入了一种新的非对称匹配器，称为 `expect.schemaMatching`。它接受一个 [Standard Schema v1](https://standardschema.dev/) 对象并针对它验证值，当值符合 schema 时通过断言。

提醒一下，非对称匹配器可用于所有检查相等性的 `expect` 匹配器中，包括 `toEqual`、`toStrictEqual`、`toMatchObject`、`toContainEqual`、`toThrow`、`toHaveBeenCalledWith`、`toHaveReturnedWith` 和 `toHaveBeenResolvedWith`。

```ts
import { expect, test } from 'vitest'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'

test('邮箱验证', () => {
  const user = { email: 'john@example.com' }

  // 使用 Zod
  expect(user).toEqual({
    email: expect.schemaMatching(z.string().email()),
  })

  // 使用 Valibot
  expect(user).toEqual({
    email: expect.schemaMatching(v.pipe(v.string(), v.email()))
  })

  // 使用 ArkType
  expect(user).toEqual({
    email: expect.schemaMatching(type('string.email')),
  })
})
```

## 报告器更新

移除了 `basic` 报告器。你可以改用 `summary: false` 的 `default` 报告器：

```ts
export default defineConfig({
  test: {
    reporters: [
      ['default', { summary: false }],
    ],
  },
})
```

[`default`](/guide/reporters#default-reporter) 报告器现在仅在只有一个测试文件运行时才以树形结构打印测试。如果你希望始终看到测试以树形结构打印，可以使用新的 [`tree`](/guide/reporters#tree-reporter) 报告器。

[`verbose`](/guide/reporters#verbose-reporter) 报告器现在总是在测试完成时逐个打印。此前，这仅在 CI 中完成，而在本地 `verbose` 的行为大多类似于 `default` 报告器。如果你希望保留旧的行为，可以通过更新配置，仅在 CI 中条件性地使用 `verbose` 报告器：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporter: process.env.CI ? 'verbose' : 'default',
  },
})
```

## 新的 API 方法

Vitest 4 带来了新的高级公共 [API 方法](/api/advanced/vitest)：

- [`experimental_parseSpecifications`](/api/advanced/vitest#parsespecification) 允许你解析测试文件而不运行它。
- [`watcher`](/api/advanced/vitest#watcher) 暴露了一些方法，可在你禁用默认 Vitest 监视器时使用。
- [`enableCoverage`](/api/advanced/vitest#enablecoverage) 和 [`disableCoverage`](/api/advanced/vitest#disablecoverage) 允许你动态启用和禁用覆盖率。
- [`getSeed`](/api/advanced/vitest#enablecoverage) 返回种子值（如果测试是随机运行的）。
- [`getGlobalTestNamePattern`](/api/advanced/vitest#getglobaltestnamepattern) 返回当前的测试名称模式。
- [`waitForTestRunEnd`](/api/advanced/vitest#waitfortestrunend) 返回一个 Promise，在所有测试运行完毕时解决。

## 破坏性变更

Vitest 4 有一些可能会影响你的破坏性变更，因此我们建议在升级前查阅详细的 [迁移指南](/guide/migration#vitest-4)。

完整的变更列表位于 [Vitest 4 变更日志](https://github.com/vitest-dev/vitest/releases/tag/v4.0.0)。

## 致谢

Vitest 4 是 [Vitest 团队](/team) 和我们的贡献者无数小时工作的成果。我们感谢赞助 Vitest 开发的个人和公司。[Vladimir](https://github.com/sheremet-va) 和 [Hiroshi](https://github.com/hi-ogawa) 是 [VoidZero](https://voidzero.dev) 团队的一部分，能够全职从事 Vite 和 Vitest 的工作，而 [Ari](https://github.com/ariperkkio) 得益于 [StackBlitz](https://stackblitz.com/) 可以在 Vitest 上投入更多时间。特别感谢 [NuxtLabs](https://nuxtlabs.com)、[Zammad](https://zammad.com) 以及 [Vitest 的 GitHub Sponsors](https://github.com/sponsors/vitest-dev) 和 [Vitest 的 Open Collective](https://opencollective.com/vitest) 上的赞助商。
