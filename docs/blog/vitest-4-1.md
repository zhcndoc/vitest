---
title: Vitest 4.1 发布
author:
  name: Vitest 团队
date: 2026-03-12
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Vitest 4.1 发布
  - - meta
    - property: og:image
      content: https://vitest.zhcndoc.com/og-vitest-4-1.jpg
  - - meta
    - property: og:url
      content: https://vitest.zhcndoc.com/blog/vitest-4-1
  - - meta
    - property: og:description
      content: Vitest 4.1 发布！这个版本带来了许多新功能和改进，包括对 Vite 8 的支持、测试标签、实验性 `viteModuleRunner`、增强的浏览器 Trace 视图、GitHub Actions 任务摘要和更多。
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vitest 4.1 发布

_2026 年 3 月 12 日_

![Vitest 4.1 发布封面图](/og-vitest-4-1.jpg)

## 下一个 Vitest 小版本来了

今天，我们很高兴地宣布 Vitest 4.1 发布，包含许多令人兴奋的新功能！

快速链接：

- [文档](/)
- 翻译：[简体中文](https://cn.vitest.dev/)
- [GitHub 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v4.1.0)

如果你之前没有使用过 Vitest，我们建议先阅读 [入门指南](/guide/) 和 [功能](/guide/features) 指南。

我们向 [713 位 Vitest Core 贡献者](https://github.com/vitest-dev/vitest/graphs/contributors) 以及帮助我们开发此新版本的 Vitest 集成、工具和翻译的维护者和贡献者表示感谢。我们鼓励你参与进来，帮助我们为整个生态系统改进 Vitest。在我们的 [贡献指南](https://github.com/vitest-dev/vitest/blob/main/CONTRIBUTING.md) 中了解更多。

为了开始，我们建议帮助 [分类 issue](https://github.com/vitest-dev/vitest/issues)，[审查 PR](https://github.com/vitest-dev/vitest/pulls)，基于开放问题发送失败测试的 PR，并在 [讨论区](https://github.com/vitest-dev/vitest/discussions) 和 Vitest Land 的 [帮助论坛](https://discord.com/channels/917386801235247114/1057959614160851024) 中支持他人。如果你想与我们交谈，加入我们的 [Discord 社区](http://chat.vitest.dev/) 并在 [#contributing 频道](https://discord.com/channels/917386801235247114/1057959614160851024) 打招呼。

有关 Vitest 生态系统和 Vitest core 的最新消息，请在 [Bluesky](https://bsky.app/profile/vitest.dev) 或 [Mastodon](https://webtoo.ls/@vitest) 上关注我们。

为了保持更新，请关注 [VoidZero 博客](https://voidzero.dev/blog) 并订阅 [新闻通讯](https://voidzero.dev/newsletter)。

## Vite 8 支持

此版本添加了对新 Vite 8 版本的支持。此外，如果可能，Vitest 现在使用安装的 `vite` 版本，而不是下载单独的依赖。这使得配置文件中的类型不一致等问题不再出现。

## 测试标签

[标签](/guide/test-tags) 允许你标记测试以将它们组织成组。一旦标记，你可以按标签过滤测试或对具有给定标签的每个测试应用共享选项——如更长的超时或自动重试。

要使用标签，请在配置文件中定义它们。每个标签需要一个 `name`，并且可以可选地包含适用于标记了该标签的每个测试的测试选项。有关可用选项的完整列表，请参阅 [`tags`](/config/tags)。

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    tags: [
      {
        name: 'db',
        description: '数据库查询测试。',
        timeout: 60_000,
      },
      {
        name: 'flaky',
        description: '不稳定的 CI 测试。',
        retry: process.env.CI ? 3 : 0,
      },
    ],
  },
})
```

使用此配置，你可以将 `flaky` 和 `db` 标签应用于你的测试：

```ts
test('flaky database test', { tags: ['flaky', 'db'] }, () => {
  // ...
})
```

该测试的超时时间为 60 秒，并且在 CI 上将重试 3 次，因为这些选项是在配置文件中为 `db` 和 `flaky` 标签指定的。

受 [pytest](https://docs.pytest.org/en/stable/reference/reference.html#cmdoption-m) 启发，Vitest 支持用于过滤标签的自定义语法：

- `and` 或 `&&` 包含两个表达式
- `or` 或 `||` 包含至少一个表达式
- `not` 或 `!` 排除表达式
- `*` 匹配任意数量的字符（0 个或多个）
- `()` 分组表达式并覆盖优先级

以下是一些常见的过滤模式：

```shell
# 仅运行单元测试
vitest --tags-filter="unit"

# 运行既是前端又是快速的测试
vitest --tags-filter="frontend and fast"

# 运行非不稳定的前端测试
vitest --tags-filter="frontend && !flaky"

# 运行匹配通配符模式的测试
vitest --tags-filter="api/*"
```

## 实验性 `viteModuleRunner: false`

默认情况下，Vitest 在 Vite 的 [模块运行器](https://vite.dev/guide/api-environment-runtimes#modulerunner) 内部运行所有代码——这是一个宽松的沙箱，提供 `import.meta.env`、`require`、`__dirname`、`__filename`，并应用 Vite 插件和别名。虽然这使得入门变得容易，但它可能会隐藏真实问题：你的测试可能在沙箱中通过，但在生产环境中失败，因为运行时行为与原生 Node.js 不同。

Vitest 4.1 引入了 [`experimental.viteModuleRunner`](/config/experimental#experimental-vitemodulerunner)，它允许你完全禁用模块运行器，而是使用原生 `import` 运行测试：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    experimental: {
      viteModuleRunner: false,
    },
  },
})
```

使用此标志，**不应用任何文件转换**——你的测试文件、源代码和设置文件由 Node.js 直接执行。这意味着更快的启动，更接近生产环境的行为，并且像不正确的 `__dirname` 注入或静默通过的不存在导出导入等问题会被早期捕获。

如果你使用的是 Node.js 22.18+ 或 23.6+，TypeScript 会被 [原生剥离](https://nodejs.org/en/learn/typescript/run-natively)——不需要额外配置。

支持通过 Node.js [Module Loader API](https://nodejs.org/api/module.html#customization-hooks) 使用 `vi.mock` 和 `vi.hoisted` 进行 Mock（需要 Node.js 22.15+）。注意，`import.meta.env`、Vite 插件、别名和 `istanbul` 覆盖率提供程序在此模式下不可用。

如果你运行不需要 Vite 转换的服务器端或脚本类测试，请考虑此选项。对于 `jsdom`/`happy-dom` 测试，我们仍然推荐默认模块运行器或 [浏览器模式](/guide/browser/)。

在 [`experimental.viteModuleRunner` 文档](/config/experimental#experimental-vitemodulerunner) 中阅读更多。

## 配置 UI 浏览器窗口

Vitest 4.1 引入了 [`browser.detailsPanelPosition`](/config/browser/detailspanelposition)，让你选择详情面板在浏览器 UI 中出现的位置。

<center>
  <img alt="底部显示详情面板的 Vitest UI" img-light src="/ui/light-ui-details-bottom.png">
  <img alt="底部显示详情面板的 Vitest UI" img-dark src="/ui/dark-ui-details-bottom.png">

  <sup>底部显示详情面板的 UI 示例。</sup>
</center>

这在较小屏幕上特别有用，切换到底部面板可以为你的应用留下更多水平空间：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      detailsPanelPosition: 'bottom', // 或 'right'
    },
  },
})
```

你也可以通过新的布局切换按钮直接从 UI 切换此设置。

## 增强的浏览器 Trace 视图

Vitest 4.1 为浏览器模式中的 [Playwright Trace 查看器](/guide/browser/trace-view) 集成带来了重大改进。像 `click`、`fill` 和 `expect.element` 这样的浏览器交互现在会在 trace 时间线中自动分组，并链接回测试文件中的确切行。

<center>
  <img alt="显示追踪时间线和渲染组件的 Trace 查看器" img-light src="/trace-viewer-light.png">
  <img alt="显示追踪时间线和渲染组件的 Trace 查看器" img-dark src="/trace-viewer-dark.png">

  <sup>高亮显示 `expect.element` 断言失败的 trace 视图示例。</sup>
</center>

框架库也在集成 trace。例如，[`vitest-browser-react`](https://github.com/vitest-community/vitest-browser-react) 的 `render()` 工具现在会自动出现在 trace 中，并高亮显示渲染元素。

对于自定义注解，新的 [`page.mark`](/api/browser/context#mark) 和 [`locator.mark`](/api/browser/locators#mark) API 让你将自己的标记添加到 trace 中：

```ts
import { page } from 'vitest/browser'

await page.mark('before sign in')
await page.getByRole('button', { name: 'Sign in' }).click()
await page.mark('after sign in')
```

你也可以将整个流程分组在一个命名条目下：

```ts
await page.mark('sign in flow', async () => {
  await page.getByRole('textbox', { name: 'Email' }).fill('john@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('secret')
  await page.getByRole('button', { name: 'Sign in' }).click()
})
```

在 [Trace 查看指南](/guide/browser/trace-view) 中阅读更多。

## `test.extend` 中的类型推断 - 新的构建器模式

Vitest 4.1 引入了一种新的 [`test.extend`](/guide/test-context) 模式，支持类型推断。你可以从工厂返回值，而不是调用 `use` 函数——TypeScript 从其返回值推断每个 fixture 的类型，所以你不需要手动声明类型。

```ts
import { test as baseTest } from 'vitest'

export const test = baseTest
  // 简单值 - 类型推断为 { port: number; host: string }
  .extend('config', { port: 3000, host: 'localhost' })
  // 函数 fixture - 类型从返回值推断
  .extend('server', async ({ config }) => {
    // TypeScript 知道 config 是 { port: number; host: string }
    return `http://${config.host}:${config.port}`
  })
```

对于需要设置或清理逻辑的 fixture，请使用函数。`onCleanup` 回调注册 teardown 逻辑，该逻辑在 fixture 的作用域结束后运行：

```ts
import { test as baseTest } from 'vitest'

export const test = baseTest
  .extend('tempFile', async ({}, { onCleanup }) => {
    const filePath = `/tmp/test-${Date.now()}.txt`
    await fs.writeFile(filePath, 'test data')

    // 注册清理 - 测试完成后运行
    onCleanup(() => fs.unlink(filePath))

    return filePath
  })
```

除此之外，Vitest 现在将 `file` 和 `worker` 上下文传递给 `beforeAll`、`afterAll` 和 `aroundAll` 钩子：

```ts
import { test as baseTest } from 'vitest'

const test = baseTest
  .extend('config', { scope: 'file' }, () => loadConfig())
  .extend('db', { scope: 'file' }, ({ config }) => createDatabase(config.port))

test.beforeAll(async ({ db }) => {
  await db.migrateUsers()
})

test.afterAll(async ({ db }) => {
  await db.deleteUsers()
})
```

::: warning
此更改可能被视为破坏性变更。此前 Vitest 将未文档化的 `Suite` 作为第一个参数传递。团队认为使用情况足够少，不会破坏生态系统。
:::

## 新的 `aroundAll` 和 `aroundEach` 钩子

新的 `aroundEach` 钩子注册一个回调函数，该函数包裹当前套件中的每个测试。回调接收一个 `runTest` 函数，**必须**调用该函数以运行测试。`aroundAll` 钩子的工作方式类似，但它针对每个套件调用，而不是每个测试。

当你的测试需要在**上下文中**运行时，你应该使用 `aroundEach`，例如：
- 将测试包裹在 [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) 上下文中
- 使用追踪 span 包裹测试
- 数据库事务

```ts
import { test as baseTest } from 'vitest'

const test = baseTest
  .extend('db', async ({}, { onCleanup }) => {
    // db 在 `aroundEach` 钩子之前创建
    const db = await createTestDatabase()
    onCleanup(() => db.close())
    return db
  })

test.aroundEach(async (runTest, { db }) => {
  await db.transaction(runTest)
})

test('insert user', async ({ db }) => {
  // 在事务内部调用
  await db.insert({ name: 'Alice' })
})
```

## 用于更好堆栈跟踪的辅助函数

当测试在共享工具函数内部失败时，堆栈跟踪通常指向该辅助函数内部的行——而不是调用它的地方。这使得很难找到实际失败的测试，尤其是当同一个辅助函数在许多测试中使用时。

[`vi.defineHelper`](/api/vi#vi-definehelper) 包装了一个函数，以便 Vitest 从其堆栈跟踪中移除其内部结构，并将错误指向调用站点：

```ts
import { expect, test, vi } from 'vitest'

const assertPair = vi.defineHelper((a, b) => {
  expect(a).toEqual(b) // 🙅‍♂️ 错误代码块不会指向这里
})

test('example', () => {
  assertPair('left', 'right') // 🙆 但会指向这里
})
```

这对于自定义断言库和可重用的测试工具特别有用，因为调用站点比实现更有意义。

## 使用 `--detect-async-leaks` 捕获泄漏

泄漏的计时器、句柄和未解决的异步资源会使测试套件变得不稳定且难以调试。Vitest 4.1 添加了 [`detectAsyncLeaks`](/config/detectasyncleaks) 以帮助跟踪这些问题。

你可以通过 CLI 启用它：

```sh
vitest --detect-async-leaks
```

或在配置中：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    detectAsyncLeaks: true,
  },
})
```

启用后，Vitest 使用 `node:async_hooks` 报告带有源位置的泄漏异步资源。由于这会增加运行时开销，最好在调试时使用。

## `vscode` 改进

官方 [vscode 扩展](https://vitest.dev/vscode) 收到了大量修复和新功能：

- 除非你手动启用连续运行或通过新配置选项 `watchOnStartup` 显式启用，否则扩展不再在后台保持运行进程。这减少了内存使用并消除了 `maximumConfigs` 配置选项。
- 新的 "Run Related Tests" 命令运行导入当前打开文件的测试。
- 点击沟槽图标时，现在可以使用新的 "Toggle Continuous Run" 操作。
- 扩展现在支持 [Deno 运行时](https://deno.com/)。
- 点击 "Stop" 后，扩展会尽可能更快地取消测试运行。
- 如果你使用 Vitest 4.1，扩展会在每个导入语句旁边内联显示模块加载时间。

<center>
  <img src="/vscode-import-breakdown.png" alt="vscode 中导入分解的示例">
  <sup>vscode 中导入分解的示例。</sup>
</center>

## GitHub Actions 任务摘要

内置的 [`github-actions` 报告器](/guide/reporters#github-actions-reporter) 现在会自动生成一个 [任务摘要](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/)，概述你的测试结果。摘要包括测试文件和测试用例统计信息，并突出显示需要重试的不稳定测试——带有永久链接 URL，将测试名称直接链接到 GitHub 上的相关源行。

<center>
  <img alt="GitHub Actions 任务摘要" img-dark src="/github-actions-job-summary-dark.png">
  <img alt="GitHub Actions 任务摘要" img-light src="/github-actions-job-summary-light.png">

  <sup>包含不稳定测试详情的任务摘要示例。</sup>
</center>

在 GitHub Actions 中运行时，默认启用摘要并写入 `$GITHUB_STEP_SUMMARY` 指定的路径。大多数情况下无需配置。要禁用它或自定义输出路径：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: [
      ['github-actions', {
        jobSummary: {
          enabled: false, // 或设置 `outputPath` 以自定义摘要写入的位置
        },
      }],
    ],
  },
})
```

## 新的 `agent` 报告器以减少 Token 使用量

随着 AI 编码代理成为运行测试的常见方式，Vitest 4.1 引入了 [`agent` 报告器](/guide/reporters#agent-reporter) —— 一种旨在减少 Token 使用量的最小输出模式。它仅显示失败的测试及其错误，抑制通过的测试输出和通过测试的控制台日志。

当 Vitest 检测到它在 AI 编码代理内部运行时，会自动启用此报告器。检测由 [`std-env`](https://github.com/unjs/std-env) 提供支持，它可以识别流行的代理环境。你也可以显式设置 `AI_AGENT=copilot`（或任何名称）环境变量。无需配置——只需像往常一样运行 Vitest：

```sh
AI_AGENT=copilot vitest
```

如果你配置了自定义报告器，自动检测将被跳过，因此如果你想要两者，请手动将 `'agent'` 添加到列表中。

## 新的 `mockThrow` API

以前，使 mock 抛出错误需要将错误包装在函数中：`mockImplementation(() => { throw new Error(...) })`。新的 [`mockThrow`](/api/mock#mockthrow) 和 [`mockThrowOnce`](/api/mock#mockthrowonce) 方法使这更简洁易读：

```ts
const myMockFn = vi.fn()
myMockFn.mockThrow(new Error('error message'))
myMockFn() // 抛出 Error<'error message'>
```

## WebdriverIO 和 Preview 中的严格模式

在 `webdriverio` 和 `preview` 中，定位元素现在默认是严格的，与 Playwright 行为匹配。

如果定位器解析为多个元素，Vitest 会抛出“严格模式违规”而不是静默选择一个。这有助于尽早捕获模糊查询：

```ts
const button = page.getByRole('button')

await button.click() // 如果匹配到多个按钮则抛出错误
await button.click({ strict: false }) // 退出严格模式并返回第一个匹配项
```

## Chai 风格的 Mock 断言

Vitest 已经支持 chai 风格的断言，如 `eql`、`throw` 和 `be`。此版本将该支持扩展到 mock 断言，使得从基于 Sinon 的测试套件迁移更容易，而无需重写每个期望：

```ts
import { expect, vi } from 'vitest'

const fn = vi.fn()

fn('example')

expect(fn).to.have.been.called // expect(fn).toHaveBeenCalled()
expect(fn).to.have.been.calledWith('example') // expect(fn).toHaveBeenCalledWith('example')
expect(fn).to.have.returned // expect(fn).toHaveReturned()
expect(fn).to.have.callCount(1) // expect(fn).toHaveBeenCalledTimes(1)
```

## 覆盖率 `ignore start/stop` 忽略提示

你现在可以使用 `ignore start/stop` 注释完全忽略代码覆盖率中的特定行。
在 Vitest v3 中，`v8` 提供者支持此功能，但由于底层依赖项更改，v4.0 中不支持。

由于社区的请求，我们现在自己实现了它，并将支持扩展到 `v8` 和 `istanbul` 提供者。

```ts
/* istanbul ignore start -- @preserve */
if (parameter) { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
else { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
/* istanbul ignore stop -- @preserve */

console.log('Included')

/* v8 ignore start -- @preserve */
if (parameter) { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
else { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
/* v8 ignore stop -- @preserve */

console.log('Included')
```

查看更多示例请参阅 [覆盖率 | 忽略代码](/guide/coverage.html#ignoring-code)。

## 仅针对变更文件的覆盖率

如果你只想获取修改文件的代码覆盖率，可以使用 [`coverage.changed`](/config/coverage.html#coverage-changed) 来限制文件包含。

与常规的 [`--changed`](/guide/cli.html#changed) 标志相比，`--coverage.changed` 允许你仍然运行所有测试文件，但将覆盖率报告限制为仅变更的文件。
这允许你从覆盖率中排除 `--changed` 否则会包含的未变更文件。

## HTML 报告器和子路径部署中的覆盖率

覆盖率 HTML 查看现在可以在 UI 模式、HTML 报告器和浏览器模式中可靠地工作——包括在子路径下部署时。对于自定义覆盖率报告器，可以使用新的 [`coverage.htmlDir`](/config/coverage#coverage-htmldir) 选项来集成他们的 HTML 输出。

## 致谢

Vitest 4.1 是 [Vitest 团队](/team) 和我们的贡献者无数小时工作的结果。我们感谢赞助 Vitest 开发的个人和公司。[Vladimir](https://github.com/sheremet-va) 和 [Hiroshi](https://github.com/hi-ogawa) 是 [VoidZero](https://voidzero.dev) 团队的一部分，能够全职从事 Vite 和 Vitest 工作，而 [Ari](https://github.com/ariperkkio) 得益于 [Chromatic](https://www.chromatic.com/) 的支持，可以投入更多时间在 Vitest 上。非常感谢 [Zammad](https://zammad.com)，以及 [Vitest 的 GitHub Sponsors](https://github.com/sponsors/vitest-dev) 和 [Vitest 的 Open Collective](https://opencollective.com/vitest) 上的赞助商。
