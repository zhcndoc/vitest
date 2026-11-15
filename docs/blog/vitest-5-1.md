---
title: Vitest 5.1 发布！
author:
  name: Vitest 团队
date: 2026-11-02
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Vitest 5.1 发布公告
  - - meta
    - property: og:image
      content: https://vitest.dev/og-vitest-5-1.jpg
  - - meta
    - property: og:url
      content: https://vitest.dev/blog/vitest-5-1
  - - meta
    - property: og:description
      content: Vitest 5.1 发布公告
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vitest 5.1 发布了！

_2026 年 11 月 2 日_

![Vitest 5.1 发布封面图](/og-vitest-5-1.jpg)

## Vitest 下一个次版本已到来

今天，我们很高兴地宣布 Vitest 5.1 发布！

快捷链接：

- [文档](/)
- 翻译：[简体中文](https://cn.vitest.dev/)
- [GitHub 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v5.1.0)

如果你还没有使用过 Vitest，建议先阅读[快速入门](/guide/)和[功能](/guide/features)指南。

我们衷心感谢超过 [840 位 Vitest Core 贡献者](https://github.com/vitest-dev/vitest/graphs/contributors)，以及帮助我们开发此版本的 Vitest 集成、工具和翻译的维护者与贡献者。欢迎你参与其中，帮助我们为整个生态改进 Vitest。详情请参阅[贡献指南](https://github.com/vitest-dev/vitest/blob/main/CONTRIBUTING.md)。

刚开始参与时，可以帮助[分类处理 issue](https://github.com/vitest-dev/vitest/issues)、[审查 PR](https://github.com/vitest-dev/vitest/pulls)、根据开放的 issue 提交失败测试 PR，并在 [Discussions](https://github.com/vitest-dev/vitest/discussions) 和 Vitest Land 的[帮助论坛](https://discord.com/channels/917386801235247114/1057959614160851024)中帮助他人。如果你想和我们交流，欢迎加入 [Discord 社区](http://chat.vitest.dev/)，并在 [#contributing 频道](https://discord.com/channels/917386801235247114/1057959614160851024)打个招呼。

要获取 Vitest 生态和核心项目的最新消息，请关注我们的 [Bluesky](https://bsky.app/profile/vitest.dev) 或 [Mastodon](https://webtoo.ls/@vitest) 账号。

要及时了解最新动态，请关注 [VoidZero 博客](https://voidzero.dev/blog)并订阅[邮件简报](https://voidzero.dev/newsletter)。

## 使用 `--since-last-run` 仅运行受影响的测试

[`--changed`](/config/changed) 标志会将文件与 Git 参考提交进行比较。它需要 Git 仓库，而且更改一旦提交就不再属于“已更改”内容。新的实验性 [`--since-last-run`](/guide/cli#since-last-run) 标志则会将文件与每个测试的上次运行情况进行比较：

```sh
vitest run --since-last-run
```

首次使用此标志运行时，会运行所有测试，并记录每个测试加载过的文件，包括动态导入、模拟、设置文件和快照文件。之后的每次运行都会检查这些文件的修改时间，只运行自上次运行以来文件发生变化或已被删除的测试。上次运行失败的测试文件也会继续运行，直到通过。

每次运行都会更新记录，因此下一次运行只会选中期间编辑所影响的测试。此功能不依赖 Git，因此在全新的容器、临时工作树或非仓库目录中也能以相同方式工作。这很适合每次编辑后都会运行测试的 AI 编码代理：

```md [AGENTS.md]
- After a change, run `vitest run --since-last-run` to test only what the change affects.
- Before you finish, run `vitest run` once for the whole suite.
```

此标志基于 [`experimental.recordDependencies`](/config/experimental#experimental-recorddependencies) 和新的 `mtime` [VCS 提供者](/config/experimental#experimental-vcsprovider)实现。自定义 VCS 提供者现在也会收到一个 `resolver`，用于返回本次运行中测试文件依赖的所有文件。如何在 `--changed` 和 `--since-last-run` 之间选择，请参阅[仅运行受影响的测试](/guide/recipes/affected-tests)。

## 交互式快照审查

监听模式下快照失败时，按 `u` 可以一次性更新全部快照。Vitest 5.1 新增了受 [Insta 的 `review` 命令](https://insta.rs/docs/cli/#review)启发的交互式审查功能，让你在接受每个变更前先进行检查。按 `i`，Vitest 就会逐个显示失败的快照：

<<< ../guide/snippets/snapshot-review.ansi

按 `a` 接受新快照，按 `r` 保留旧快照。查看完最后一个快照后，Vitest 会写入已接受的快照，并重新运行包含这些快照的测试文件。此功能支持内联快照、`.snap` 文件和[文件快照](/guide/snapshot#file-snapshots)，也支持浏览器模式中的 [ARIA 快照](/guide/snapshot#aria-snapshots)。

## Trace View 默认记录失败测试

[Trace View](/guide/browser/trace-view) 在 Vitest 5.0 中以实验性功能推出，现在已稳定，并默认启用新的 [`'failure-only'`](/config/browser/traceview#traceview-mode) 模式。在此模式下，Vitest 只会为失败的测试保留 trace。通过的测试会在浏览器中记录步骤，但不会生成 DOM 快照，也不会向服务器发送任何内容，因此此模式不会给通过的测试带来可测量的额外开销。

浏览器测试失败时，错误报告现在会在末尾附上导致失败的步骤：

<<< ../guide/browser/snippets/trace-failure.ansi [错误报告]

同一份 trace 还包含失败时的页面快照，可以在浏览器 UI、Vitest UI 和 [HTML 报告器](/guide/reporters#html-reporter)中查看。要记录每个测试，并为每个步骤保存快照，请将模式设为 `'on'`：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      traceView: 'on', // 'failure-only' (default) | 'on' | 'off'
    },
  },
})
```

`browser.traceView.enabled` 已弃用，请改用 `browser.traceView.mode`。

trace 查看器也会在每个快照中捕获页面的[无障碍树](/guide/browser/trace-view#accessibility-tree)。查看器标题栏中的选择器可以在 **DOM** 和 **Aria** 视图之间切换。Aria 视图会以 [ARIA 快照](/guide/browser/aria-snapshots)相同的格式显示 `getByRole()` 等定位器所匹配的角色和可访问名称。

## Node 测试中的 Trace 时间线

步骤时间线不只适用于浏览器模式。启用新的实验性 [`experimental.traceTimeline`](/config/experimental#experimental-tracetimeline) 选项后，Vitest 会记录每个测试中的 `expect.poll`、`vi.waitFor` 和 `vi.waitUntil` 步骤，并在测试失败时将其显示在错误信息下方。这样可以查看测试等待了什么以及每次等待花了多长时间，有助于排查等待服务器、队列或文件监听器时出现的不稳定测试。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    experimental: {
      traceTimeline: true,
    },
  },
})
```

<<< ../config/snippets/trace-timeline-failure.ansi [错误报告]

Vitest 只保留失败尝试的步骤，因此此选项几乎不会给通过的测试带来额外开销。

`vi.waitFor` 和 `vi.waitUntil` 现在也接受 `message` 选项，`expect.poll` 原本就支持此选项。Vitest 会将消息添加到错误信息开头，并用它作为时间线中的步骤名称，例如上方报告中的 `user saved (vi.waitUntil)`：

```ts
await vi.waitFor(() => server.ping(), { message: 'server started' })
// Error: server started: connect ECONNREFUSED
```

## 使用 `--last-failed` 重新运行失败项

监听模式已经可以通过 `f` 键重新运行失败的测试。新的 [`--last-failed`](/guide/cli#last-failed) 标志可以在不同进程之间执行相同操作：它会从[结果缓存](/config/cache)中读取上次运行的失败信息，并且只运行这些测试。

```sh
vitest run --last-failed

# combine with other filters
vitest run --last-failed -t login
```

Vitest 根据测试的完整名称进行选择，因此在文件中添加或移动其他测试不会改变选择结果。如果文件在测试之外失败，例如 `beforeAll` 钩子或收集期间失败，就会运行整个文件。自定义集成可以通过新的 [`TestSpecification.testNames`](/api/advanced/test-specification#testnames) 属性使用相同的过滤条件。

## 浏览器模式中的模块模拟更快

在浏览器模式下模拟模块时，Vitest 之前会拦截页面的网络请求（通过 Playwright 的 `page.route`，或其他提供者使用的 Vite 插件），并提供模拟代码。页面中的每个请求都会产生拦截开销，测试文件导入的模块越多，开销就越大。

Vitest 5.1 改为通过[导入映射](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)提供模拟。测试文件调用 `vi.mock` 时，Vitest 会添加一条导入映射规则，将模块 URL 指向其模拟版本。浏览器会直接加载模拟模块，因此不会拦截请求，HTTP 缓存也能继续使用。

在一项[公开基准测试](https://github.com/ubugeeei-reproductions/js-test-runner-competition)中，每套测试包含 500 个测试文件、962 个模块和 1,883 个模拟（Chromium，9 个 worker，运行 3 次取中位数）：

| 套件     | Vitest 5.0.3 | Vitest 5.1 | 变化 |
| -------- | -----------: | ---------: | ---: |
| 无模拟   |        31.7s |      26.6s | −16% |
| 有模拟   |        56.4s |      27.2s | −52% |
| 混合     |        44.0s |      27.1s | −38% |

新的 [`browser.importMapMocks`](/config/browser/importmapmocks) 选项目前处于实验阶段。浏览器支持在同一文档中使用多个导入映射时会启用它（Chromium 133+、Safari 18.4+，以及使用 Playwright 提供者时的 Firefox 150+）。在其他浏览器中，以及禁用 [`isolate`](/config/isolate) 时，Vitest 会像之前一样拦截请求。

导入映射无法更改页面已经导入的模块，因此如果模块在 `vi.mock` 注册它之前就已导入，Vitest 现在会报告错误，而不会悄悄使用原始模块。模拟工厂也只能提供原始模块声明的导出。如果这会导致测试失败，请将 `browser.importMapMocks` 设为 `false`，并[告诉我们](https://github.com/vitest-dev/vitest/issues)。

## Pointer API

新的实验性 [`userEvent.pointer`](/api/browser/interactivity#userevent-pointer) 方法可以执行一系列底层 pointer 操作。它使用 [user-event 的 `pointer` 语法](https://testing-library.com/docs/user-event/pointer)，因此可以分别按下、移动和释放 pointer，例如将元素拖到精确位置：

```ts
import { test } from 'vitest'
import { page, userEvent } from 'vitest/browser'

test('drags the card into the column', async () => {
  const card = page.getByRole('listitem', { name: 'Fix the login form' })
  const column = page.getByRole('list', { name: 'Done' })

  await userEvent.pointer([
    { target: card, keys: '[MouseLeft>]' },
    { target: column, coords: { x: 10, y: 10 }, keys: '[/MouseLeft]' },
  ])
})
```

## 为 `node:timers` 启用假计时器

假计时器会替换全局的 `setTimeout` 等函数，但从 `node:timers` 或 `node:timers/promises` 导入这些函数的代码仍会使用真实计时器。启用新的 [`fakeNodeBuiltins`](/config/faketimers#faketimers-fakenodebuiltins) 选项后，Vitest 也会模拟这些模块，包括命名导入和 `require` 调用：

```ts
import { setTimeout as sleep } from 'node:timers/promises'
import { expect, test, vi } from 'vitest'

test('resolves after the delay', async () => {
  vi.useFakeTimers({ fakeNodeBuiltins: true })

  const resolved = vi.fn()
  sleep(1000).then(resolved)

  await vi.advanceTimersByTimeAsync(1000)
  expect(resolved).toHaveBeenCalled()
})
```

::: tip
`fakeNodeBuiltins` 默认禁用。我们计划在下一个大版本中默认启用它。你可以现在就在配置中将 [`fakeTimers.fakeNodeBuiltins`](/config/faketimers#faketimers-fakenodebuiltins) 设为 `true`，提前适配此变化。
:::

[`vi.setSystemTime`](/api/vi#vi-setsystemtime) 现在也接受 `Temporal.Instant` 或 `Temporal.ZonedDateTime`。`ZonedDateTime` 会设置模拟时间，但不会改变环境的时区：

```ts
vi.setSystemTime(Temporal.Instant.from('2026-11-02T09:00:00Z'))
```

在浏览器模式中，`click` 和 `fill` 等 locator 操作以及 `expect.element` 现在会在等待元素时推进假计时器，与 `expect.poll` 和 `vi.waitFor` 的行为相同。此前，如果元素只会在模拟的 `setTimeout` 后出现，操作就会超时。

## 每次尝试的结果

配置 [`retry`](/config/retry) 或 [`repeats`](/api/test#repeats) 后，测试可能会运行多次。此前，`TestCase.result()` 只会报告最终状态，并合并所有运行产生的错误。新的 [`TestCase.attempts()`](/api/advanced/test-case#attempts) 方法会分别返回每次运行的状态、错误和时序，因此报告器可以找出仅在重试后才通过的测试：

```ts [flaky-reporter.ts]
import type { Reporter } from 'vitest/node'

export default {
  onTestCaseResult(testCase) {
    const attempts = testCase.attempts()

    if (testCase.result().state === 'passed' && attempts.length > 1) {
      console.warn(`${testCase.fullName} passed after ${attempts.length} attempts`)
    }
  },
} satisfies Reporter
```

默认报告器也会使用这些信息。测试在多次尝试中失败时，现在会打印一个包含各次尝试的标题，而不是每次尝试都重复打印相同标题：

```
 FAIL  basic.test.js > always fails (initial run, 1st retry, 2nd retry)
AssertionError: expected 1 to be 2 // Object.is equality
```

## 覆盖率改进

HTML 覆盖率报告新增了符合 Vitest 风格的浅色和深色主题。报告会遵循操作系统的颜色偏好，主题选择器会记住你的选择。在 Vitest UI 中，报告会使用 UI 的主题。如需保留原始 Istanbul 风格，请在[报告器选项](/guide/coverage#html-report-theme)中设置 `theme: 'legacy'`：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: [['html', { theme: 'legacy' }]], // 'light' | 'dark' | 'legacy'
    },
  },
})
```

<center>
  <img alt="浅色主题的 HTML 覆盖率报告" img-light src="/coverage-report-theme-light.png">
  <img alt="深色主题的 HTML 覆盖率报告" img-dark src="/coverage-report-theme-dark.png">

<sup>使用新主题的 HTML 覆盖率报告。</sup>
</center>

`istanbul` 提供者现在快得多。[`@vitest/istanbuljs`](https://github.com/vitest-dev/vitest) 包不再使用 Babel，而是通过 Rolldown 使用 [Oxc](https://oxc.rs) 解析代码，并通过 `magic-string` 插入覆盖率计数器。这使插桩速度提升了 5 到 10 倍，内存占用也更低。例如，对 Vitest 仓库的 479 个源文件进行插桩，耗时从 3.7 秒降至 0.38 秒。插桩后的代码也不再包含输入源映射，发送给 worker 的代码量因此减少约 26%。

`v8` 提供者新增了 [`coverage.ignoreNode`](/config/coverage#coverage-ignorenode) 选项，可以根据 AST 节点忽略代码。这适用于编译器或插件生成、无法添加[忽略提示](/guide/coverage#ignoring-code)的代码，例如 React Compiler 为每个组件添加的缓存分支：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      ignoreNode: (node, type) =>
        type === 'statement'
        && node.type === 'ExpressionStatement'
        && node.expression.type === 'CallExpression'
        && node.expression.callee.type === 'Identifier'
        && node.expression.callee.name === '__generatedHelper',
    },
  },
})
```

## 性能改进

- **`isolate: false` 时复用 worker。** Worker 现在会缓存设置文件及其模拟项的解析结果，并且不再为每个测试文件请求一份已预热模块的新快照。在包含 800 个测试文件的[基准测试](https://github.com/vitest-dev/benchmarks)中，解析缓存带来约 10% 的提升；当每个测试文件都导入较大的共享模块树时，预热模块改动带来的提升最高可达 18%。
- **`toEqual` 支持类型化数组。** Vitest 会在一次循环中比较类型化数组。两个 2 MiB 数组的 `toEqual` 比较耗时从约 1.5 秒降至 125 毫秒。
- **Firefox 中的 Trace View。** Vitest 现在只解析每个步骤中第一个可用的堆栈帧。在 `'on'` 模式下，包含 200 个 `expect.element` 调用的测试在 Firefox 中耗时从 5.7 秒降至 0.33 秒。
- **高负载下的浏览器模式。** WebSocket 服务器现在会依次处理所有浏览器的消息，因此繁忙的浏览器不会再让其他浏览器的操作一直等到超时。

## 其他改动

- 浏览器模式的默认端口从 `63315` 改为 `23315`。Hyper-V、WSL2 或 Docker Desktop 运行时，Windows 可能会保留旧端口，导致 Vitest 无法启动。如果你的环境依赖旧端口，请设置 [`api.port`](/config/api)。
- [`api.port: 0`](/config/api) 现在会让操作系统选择空闲端口。此功能需要 Vite 8.2.1 或更新版本。
- 如果浏览器测试文件无法连接服务器，运行现在会报错，而不是无限等待。

完整变更列表请参阅 [Vitest 5.1 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v5.1.0)。

## 致谢

Vitest 5.1 凝聚了 [Vitest 团队](/team)和贡献者投入的无数时间与心血。这一切离不开赞助 Vitest 的个人和公司。[Vladimir](https://github.com/sheremet-va) 和 [Hiroshi](https://github.com/hi-ogawa) 在 [VoidZero](https://voidzero.dev) 全职开发 Vite 和 Vitest；[Chromatic](https://www.chromatic.com/) 为 [Ari](https://github.com/ariperkkio) 推进 Vitest 开发提供了时间。Vitest 也通过 [Cloudflare](https://opencollective.com/cloudflare) 基金赞助 Vitest 团队成员 [Raul](https://github.com/macarie) 的工作。感谢所有通过 [GitHub Sponsors](https://github.com/sponsors/vitest-dev) 和 [Open Collective](https://opencollective.com/vitest) 支持我们的朋友。
