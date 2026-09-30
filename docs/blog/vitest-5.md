---
title: Vitest 5.0 发布！
author:
  name: Vitest 团队
date: 2026-09-03
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Vitest 5.0 发布公告
  - - meta
    - property: og:image
      content: https://vitest.dev/og-vitest-5.jpg
  - - meta
    - property: og:url
      content: https://vitest.dev/blog/vitest-5
  - - meta
    - property: og:description
      content: Vitest 5.0 发布公告
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vitest 5.0 发布！

_2026 年 9 月 3 日_

![Vitest 5 发布封面图](/og-vitest-5.jpg)

## 新一代 Vitest 正式发布

今天，我们很高兴地宣布 Vitest 5 正式发布！

快捷链接：

- [文档](/)
- Translations: [简体中文](https://cn.vitest.dev/)
- [迁移指南](/guide/migration/)
- [GitHub 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v5.0.0)

如果你还没有使用过 Vitest，建议先阅读[快速入门](/guide/)和[功能](/guide/features)指南。

我们衷心感谢超过 [790 位 Vitest 核心贡献者](https://github.com/vitest-dev/vitest/graphs/contributors)，以及帮助我们开发这一新大版本的 Vitest 集成、工具和翻译的维护者与贡献者。欢迎你参与其中，帮助我们为整个生态改进 Vitest。详情请参阅[贡献指南](https://github.com/vitest-dev/vitest/blob/main/CONTRIBUTING.md)。

刚开始参与时，可以帮助[分类处理 issues](https://github.com/vitest-dev/vitest/issues)、[审查 PR](https://github.com/vitest-dev/vitest/pulls)、根据开放的 issue 提交失败测试 PR，并在 [Discussions](https://github.com/vitest-dev/vitest/discussions) 和 Vitest Land 的[帮助论坛](https://discord.com/channels/917386801235247114/1057959614160851024)中帮助他人。如果你想和我们交流，欢迎加入 [Discord 社区](http://chat.vitest.dev/)，并在 [#contributing 频道](https://discord.com/channels/917386801235247114/1057959614160851024)打个招呼。

要获取 Vitest 生态和核心项目的最新消息，请关注我们的 [Bluesky](https://bsky.app/profile/vitest.dev) 或 [Mastodon](https://webtoo.ls/@vitest) 账号。

要及时了解最新动态，请关注 [VoidZero 博客](https://voidzero.dev/blog)并订阅[邮件简报](https://voidzero.dev/newsletter)。

## 性能改进

性能是本次发布的主要重点。为了测量性能，我们构建了 [vitest-dev/benchmarks](https://github.com/vitest-dev/benchmarks)：一组自动生成的参考应用，从只有 5 个文件的工具包，到包含 1,280 个模块的企业级单体应用，以及包含大量 barrel 文件、共 817 个模块的应用。每个应用都会在不同池（`forks`、`threads`、`vmForks`、`vmThreads`）和环境（`node`、`jsdom`、`happy-dom` 和浏览器模式）下运行，并分别启用和禁用隔离。这样我们就能在真实项目中观察每项改动的表现，而不是只看微基准测试。

以下是 Vitest 4.1.10 与 Vitest 5.0 对比中的部分数据（Apple M4、10 核、Node 24；`vitest run` 整个进程的墙钟时间；运行 3 次取中位数）：

| 应用                                | 配置                             | Vitest 4.1 | Vitest 5.0 | 变化 |
| ----------------------------------- | -------------------------------- | ---------: | ---------: | ---: |
| micro-utils（5 个测试文件）         | `vmThreads`、`jsdom`             |      0.61s |      0.56s |  −8% |
| node-library（40 个测试文件）       | `forks`、已隔离                  |      0.86s |      0.75s | −13% |
| deps-heavy                          | `vmThreads`                      |      1.59s |      0.74s | −53% |
| react-spa（92 个模块）              | `vmThreads`、`jsdom`             |      1.25s |      1.07s | −15% |
| react-spa（92 个模块）              | 浏览器模式、Chromium             |      2.40s |      2.01s | −16% |
| vue-spa（37 个组件）                | 浏览器模式、Chromium             |      1.94s |      1.58s | −18% |
| design-system（80 个组件）          | `vmThreads`、`jsdom`             |      2.09s |      1.72s | −18% |
| barrel-hell（817 个模块）           | `forks`、已隔离、`fsModuleCache` |      1.33s |      1.08s | −18% |
| enterprise-monolith（1,280 个模块） | `forks`、已隔离                  |      7.24s |      5.83s | −19% |
| long-haul（80 个 `jsdom` 文件）     | `vmForks`、`happy-dom`           |      5.43s |      4.06s | −25% |
| cpu-bound（30 个测试文件）          | `threads`、100% worker           |      0.91s |      0.83s |  −8% |

最大的性能提升出现在 VM 池、浏览器模式和大型隔离测试套件中。对于性能主要受环境初始化影响的场景，例如使用 `forks`、`jsdom` 和隔离的配置，结果仍在 Vitest 4.1 的 ±3% 范围内。所有场景的完整结果都在[基准测试仓库](https://github.com/vitest-dev/benchmarks)中。

这些性能提升来自以下改动：

- **内联项目共享 Vite 服务器。** 在 `test.projects` 中定义且不更改 Vite 配置的项目，现在会复用声明它们的配置所使用的 Vite 服务器，因此共享文件只需转换一次。详见 [`sharedViteServer`](/config/sharedviteserver)。
- **文件系统模块缓存保持稳定。** [`fsModuleCache`](/config/fsmodulecache) 选项（之前为 `experimental.fsModuleCache`）会将转换后的模块持久化到磁盘，以便在再次运行和不同 Vitest 进程间复用。插件可以通过 [`defineCacheKeyGenerator`](/api/advanced/plugin#definecachekeygenerator) 参与生成缓存键。
- **减少主进程与 worker 之间的往返。** 已预热的模块现在通过一次往返提供给 worker。
- **VM 池更快。** `vmThreads` 和 `vmForks` 会在不同上下文间复用编译后的代码，并预热模块图。它们现在也支持 `require(esm)`。
- **浏览器模式更快。** Vitest 会预打包自身运行时，在 Vite 服务器启动时预热浏览器，按需打开浏览器会话而不是预先启动 `maxWorkers` 个会话，并减少每个文件的往返次数。
- **安装体积更小。** Vitest 现在会打包自身依赖，从而减少 `node_modules` 中的包数量和依赖解析时间。
- **覆盖率更快。** `v8` 提供者使用有界内存和预编译 glob 合并报告；两个提供者通过 RPC 发送的数据都更少；`istanbul` 则改用受维护的 [`@vitest/istanbuljs`](https://github.com/vitest-dev/istanbuljs) 包。基准测试仓库中的[覆盖率数据表](https://github.com/vitest-dev/benchmarks#coverage-vitest-4110-vs-500)列出了所有应用。

报告器输出中的[耗时明细](/guide/profiling-test-performance)现在会显示百分比，更容易看出时间花在了哪里：

```
Duration  3.76s (environment 79%, import 13%, transform 6%, tests 1%, setup 1%)
```

当收集到的耗时信息表明更改配置可以显著加快运行时，Vitest 现在也会[默认打印性能提示](/config/experimental#experimental-diagnostics)。如需更全面的检查，Vitest 5 引入了 [`vitest doctor`](/guide/cli#vitest-doctor)，它会使用其他配置运行测试套件，并推荐可能提升速度的选项。

## Trace 查看器

Vitest 5 为浏览器模式内置了 [Trace 查看器](/guide/browser/trace-view)。启用 [`browser.traceView`](/config/browser/traceview) 后，Vitest 会将每次交互、断言和 `page.mark` 记录为 DOM 快照。即使浏览器已经继续运行，你仍可以逐步回放测试。查看器可在浏览器 UI、[Vitest UI](/guide/ui) 和 [HTML 报告器](/guide/reporters#html-reporter)中使用，因此适用于本地调试和 CI 失败排查。

<div class="flex align-center justify-center">
  <video controls muted>
    <source src="/trace-view.webm" type="video/webm">
  </video>
</div>

选择某个步骤可以查看当时重建的页面，被交互的元素会高亮显示，Vitest 也会在编辑器面板中打开对应的源码位置。失败的操作和断言会以红色高亮。Trace 查看器还支持键盘导航，并会在 watch 模式下实时更新。

::: code-group

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      traceView: true,
    },
  },
})
```

```bash [命令行]
vitest --browser.traceView
```

:::

与 [Playwright Traces](/guide/browser/playwright-traces) 不同，Trace 查看器不依赖特定 provider，也不需要单独的查看器。

## 嵌套项目和配置继承

内联项目现在默认[继承根配置](/guide/projects#configuration)，包括 `plugins` 和 `resolve.alias` 等 Vite 选项。在 Vitest 4 中，必须为每个项目设置 `extends: true` 才能获得此行为：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true, // [!code --]
        test: {
          name: 'unit',
          include: ['**/*.unit.test.ts'],
        },
      },
    ],
  },
})
```

`test.projects` 中引用的配置文件现在可以声明自己的 `projects`。这类配置会像根配置一样充当容器，并提供名为 `app (unit)`、`app (e2e)` 等[嵌套项目](/guide/projects#nested-projects)。因此，可以直接引用已经定义了自身项目的包，而无需在根配置中重复定义：

```ts [packages/app/vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['./packages/*/vitest.config.ts'],
  },
})
```

`--project` 过滤器现在支持项目层级，并新增了 `-p` 简写：

```bash
vitest -p app
```

## `vi.when`

以前，要根据不同参数返回不同值，必须手动使用 `mockImplementation` 检查参数。新的 [`vi.when`](/api/vi#vi-when) API 可以在 spy 上按参数定义行为。参数会使用深度相等进行匹配，也支持 `expect.any()` 之类的非对称匹配器：

```ts
import { expect, test, vi } from 'vitest'

test('returns user data', async () => {
  const findById = vi.fn()

  vi.when(findById)
    .calledWith(1)
    .thenResolve({ id: 1, name: 'Ella' })
    .calledWith(2)
    .thenResolve({ id: 2, name: 'Gracie' })
    .calledWith(expect.any(Number))
    .thenReject(new Error('not found'))

  await expect(findById(1)).resolves.toEqual({ id: 1, name: 'Ella' })
  await expect(findById(3)).rejects.toThrow('not found')
})
```

可以使用 `thenReturnOnce` 或 `times` 选项限制行为的调用次数。新的 [`toHaveBeenExhausted`](/api/expect#tohavebeenexhausted) 断言可以检查每项注册行为是否都已执行。更多信息请参阅[条件模拟](/guide/recipes/conditional-mocking)示例。

## 基准测试 API 重写

基准测试 API 已重写。`bench` 不再是顶层导入项，而是一个[测试上下文 fixture](/guide/test-context#bench)，可在基准测试文件的常规 `test()` 调用中使用。这样基准测试便可访问测试运行器提供的所有功能：fixtures、生命周期钩子、重试、过滤和断言。

```ts [parse.bench.ts]
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

可以使用 `writeResult` 保存结果，再通过 `bench.from()` 重放并与基线比较；也可以使用自定义[基准测试提供者](/config/benchmark#benchmark-provider)替换内置的 Tinybench 提供者。基准测试输出现在包含在 `default` 和 `json` 报告器中。完整 API 请参阅[基准测试指南](/guide/benchmarking)。

## 定位器错误现在会显示 ARIA 树

浏览器模式中的定位器找不到元素时，Vitest 现在会在 HTML 输出旁打印所搜索子树的 [ARIA 快照](/guide/browser/aria-snapshots)。无障碍树通常比原始 HTML 短得多，并会准确显示 `getByRole` 和 `getByLabelText` 匹配的角色和名称。可以通过新的 [`browser.locators.errorFormat`](/config/browser/locators#browser-locators-errorformat) 选项控制输出：

```ts
export default defineConfig({
  test: {
    browser: {
      locators: {
        errorFormat: 'aria', // 'html' | 'aria' | 'all'
      },
    },
  },
})
```

定位器现在也[默认使用严格匹配](/guide/migration/#locators-are-strict-by-default)：`locators.exact` 已启用，因此 `getByText('Item')` 不会再意外匹配 `Item 1`。

## 模拟 `Temporal`

得益于 `@sinonjs/fake-timers` v15.4 的更新，假计时器现在会像模拟 `Date` 一样模拟 [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) API。这既适用于 [`vi.useFakeTimers()`](/api/vi#vi-usefaketimers)，也适用于不配合假计时器使用的 [`vi.setSystemTime()`](/api/vi#vi-setsystemtime)：

```ts
vi.setSystemTime(0)
Temporal.Now.instant().epochMilliseconds // 0
```

`Temporal` 属于默认模拟的 API 集合。如需避免模拟它，请在[配置](/config/faketimers#faketimers-tonotfake)或调用 `vi.setSystemTime()` 时将它添加到 `toNotFake`。

## 更严格的断言

现在，`resolves`、`rejects` 和 `toMatchFileSnapshot` 等异步断言如果没有被 await，就会导致测试失败。此前 Vitest 会在测试结束时等待这些断言并仅打印警告，因此即使断言没有在书写的位置执行，测试仍然会通过。

```ts
test('unawaited assertion', async () => {
  expect(promise).resolves.toBe(1) // [!code --]
  await expect(promise).resolves.toBe(1) // [!code ++]
})
```

如果 [`expect.poll`](/api/expect#poll) 未能在 `timeout` 内完成，现在会以 reject 结束；其回调也会收到 `AbortSignal`，以便取消正在进行的工作：

```ts
await expect.poll(async ({ signal }) => {
  const response = await fetch('/api/status', { signal })
  return response.status
}, { timeout: 1000 }).toBe(200)
```

断言类型现在会公开返回类型和接收值类型。你在[扩展匹配器](/guide/extending-matchers)时，`Matchers` 接口现在会将返回类型作为第一个参数：

```ts
import 'vitest'

declare module 'vitest' {
  interface Matchers<T = any> { // [!code --]
    toBeFoo: () => void // [!code --]
  } // [!code --]
  interface Matchers<R, T> { // [!code ++]
    toBeFoo: () => R // [!code ++]
  } // [!code ++]
}
```

`R` 反映匹配器的使用方式：同步调用时为 `void`，通过 `.resolves`、`.rejects`、`expect.poll` 或 `expect.element` 调用时为 `Promise<void>`。`T` 是接收值的类型，因此预期参数可以与被测值使用相同类型：

```ts
declare module 'vitest' {
  interface Matchers<R, T> {
    toEqualTyped: (expected: T) => R
  }
}

expect(1).toEqualTyped(2) // ✅
expect(1).toEqualTyped('2') // ❌ type error
```

直接引用断言类型的代码也需要做相同更改：

```ts
Assertion<string> // [!code --]
Assertion<void, string> // [!code ++]
Assertion<Promise<void>, string> // asynchronous assertion // [!code ++]
```

自定义匹配器现在也可以访问底层的 Chai [`assertion`](/guide/extending-matchers#assertion) 对象。

## `clearMocks` 默认启用

[`clearMocks`](/config/clearmocks) 现在默认为 `true`。Vitest 会在每个测试前调用 `vi.clearAllMocks()`，因此 mock 不会再把一个测试的调用历史带到下一个测试中，同时保留其实现。这消除了最常见的测试顺序依赖来源之一。如需恢复之前的行为，请设置 `clearMocks: false`。

## 报告器更新

报告器和其他集成现在会将输出写入项目根目录下统一的 `.vitest` 目录：`html`、`json` 和 `junit` 报告器、`attachmentsDir`、失败截图和新的 trace 默认都会使用此目录。因此只需在 `.gitignore` 中添加一项。

第三方报告器可以通过新的 [`vitest.createReport(scope)`](/api/advanced/vitest#createreport) API 使用相同约定。该 API 返回一个仅限于其自身 `.vitest/<scope>` 目录的 `Report`。

HTML 报告器还可以通过 [`singleFile`](/guide/reporters#html-reporter) 选项生成自包含报告。Vitest 会将 UI 资源、元数据和测试附件内联到单个 `index.html` 中，方便作为 CI 产物上传：

```ts
export default defineConfig({
  test: {
    reporters: [
      ['html', { singleFile: true }],
    ],
  },
})
```

## 其他改进

- 新的 [`--repeats`](/config/repeats) CLI 选项会重复运行每个测试指定次数，不受结果影响，适合排查不稳定测试。
- [`injectCjsGlobals`](/config/injectcjsglobals) 现在可以禁用向 ES 模块注入 `module`、`exports`、`require`、`__filename` 和 `__dirname`。
- [`coverage.autoAttachSubprocess`](/config/coverage#coverage-autoattachsubprocess) 会通过 `v8` 提供者跟踪测试运行期间启动的 `node:child_process` 和 `node:worker_threads` 的覆盖率。
- [`coverage.thresholds.perFile`](/config/coverage#coverage-thresholds-perfile) 现在接受对象；`thresholds.autoUpdate` 会收到之前的阈值作为参数。
- `json` 报告器新增 `filterMeta` 选项，`junit` 报告器支持与 jest-junit 兼容的命名选项。
- [`TestCase.logs()`](/api/advanced/test-case#logs) 会向报告器和高级 API 暴露测试期间记录的控制台输出。
- 测试标题和检查值现在使用 `pretty-format`，`test.for`/`test.each` 的标题占位符也支持非 ASCII 字符。
- `vitest --merge-reports` 支持跨多个环境合并未分片的运行结果。
- 覆盖率改用受维护的 [`@vitest/istanbuljs`](https://github.com/vitest-dev/istanbuljs) 包，这是 `istanbul-lib-*` 系列的维护分支。

## 破坏性变更

Vitest 5 需要 Vite >= 6.4.0 和 Node.js >= 22.12.0。Vitest 5 包含多项可能影响你的破坏性变更，因此建议升级前查看详细的[迁移指南](/guide/migration/)。

完整变更列表请参阅 [Vitest 5 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v5.0.0)。

## 致谢

Vitest 5 凝聚了 [Vitest 团队](/team)和贡献者无数小时的工作。没有赞助 Vitest 的个人和公司，这一切都不可能实现。[Vladimir](https://github.com/sheremet-va) 和 [Hiroshi](https://github.com/hi-ogawa) 在 [VoidZero](https://voidzero.dev) 全职开发 Vite 和 Vitest；[Chromatic](https://www.chromatic.com/) 则为 [Ari](https://github.com/ariperkkio) 提供时间，让他持续推动 Vitest 发展。感谢所有通过 [GitHub Sponsors](https://github.com/sponsors/vitest-dev) 和 [Open Collective](https://opencollective.com/vitest) 支持我们的朋友。
