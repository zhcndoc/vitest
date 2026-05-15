# Trace View <Badge type="warning" text="实验性" /> <Version>5.0.0</Version>

`browser.traceView` 会将浏览器交互记录为 DOM 快照，并允许你在 Vitest 内置的 trace 查看器中逐步回放。它在实时浏览器视图不够用时非常有用：即使浏览器已经继续运行，你仍然可以查看更早的测试、失败重试、截图、断言和用户操作。

Trace view 是对当前浏览器测试工作流的增量增强。启用它不会强制使用单一调试模式。你可以将它与普通的本地浏览器 UI、无头浏览器和 Vitest UI，或者 CI 中的 HTML 报告一起使用。

::: tip Trace view、浏览器 UI 和 HTML 报告

普通的本地浏览器模式会打开 [browser UI](/config/browser/ui)，测试会在一个可见的 iframe 中运行。这在开发时很有用，但 iframe 只能显示当前的浏览器状态。当另一个测试运行时，之前渲染的状态就会消失。

`browser.traceView` 会为每个测试保留可回放的记录。在本地浏览器 UI 模式下，trace 查看器会显示在现有实时视图旁边，这样你就可以在继续使用浏览器 UI 的同时查看记录的步骤。

对于静态输出，请添加 [HTML reporter](/guide/reporters#html-reporter)。随后可以从生成的报告中打开同一个 trace 查看器，这对 run mode 和 CI 失败很有用。

:::

::: details 在找 Playwright traces？

本页现在文档化的是 Vitest 内置的 `browser.traceView` 功能。之前关于 Playwright traces 的 `browser.trace` 指南已移至 [Playwright Traces](./playwright-traces)。

:::

## 快速开始

使用 [`browser.traceView`](/config/browser/traceview) 选项启用 trace view：

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

```bash [CLI]
vitest --browser.traceView
```

:::

启用 `browser.traceView` 后，带有已记录 trace 的测试可以从 [browser UI](/config/browser/ui)、[Vitest UI](/guide/ui) 和 [HTML reporter](/guide/reporters#html-reporter) 中打开 trace 查看器。该查看器有两个可调整大小的面板：

- **步骤列表**（左侧）—— 每个已记录的操作、断言、标记和生命周期条目，包含名称、时序、选择器和源位置。失败的操作和断言会以红色高亮。
- **DOM 快照**（右侧）—— 所选步骤下页面状态的重建。被交互的元素会以蓝色高亮。

当可用该位置时，选择某个步骤还会在 Editor 标签页中打开其源位置。

<img alt="Vitest UI trace 查看器显示步骤列表和 DOM 快照" img-light src="/browser/trace-view-light.png">
<img alt="Vitest UI trace 查看器显示步骤列表和 DOM 快照" img-dark src="/browser/trace-view-dark.png">

<small>示例回放使用了 [Vuetify](https://github.com/vuetifyjs/vuetify) 的 `VDateInput` 组件。</small>


## 常见配置

<!--
TODO: The browser UI / Vitest UI / browser driver combinations are not specific to trace view and might be better documented in the Browser Mode guide.  Something like:

  | top-level --ui | browser.ui | browser.headless | Result |
  | --- | --- | --- | --- |
  | off | true | false | browser UI/live iframe in headed browser |
  | on | false | true | pure Vitest UI, tests in headless browser |
  | on | false | false | pure Vitest UI, tests in separate headed browser window |

-->

`browser.traceView` 会记录 trace。浏览器模式、UI 和 reporter 选项决定了你在哪里查看它们。

| 目标 | 配置 | 结果 |
| --- | --- | --- |
| 为普通的本地浏览器 UI 添加 trace 回放 | `vitest --browser.traceView` | 使用默认的本地有头浏览器 UI，并为已记录的测试添加 trace 回放。 |
| 使用无头浏览器进行本地调试 | `vitest --browser.traceView --browser.headless --ui` | 浏览器无头运行，而 Vitest UI 显示已记录的 trace 步骤和快照。 |
| 使用可见的浏览器窗口和 Vitest UI 进行本地调试 | `vitest --browser.traceView --browser.headless=false --browser.ui=false --ui` | Vitest UI 显示已记录的 trace 步骤和快照，而测试在单独的有头浏览器窗口中运行。 |
| 为 CI 或 run mode 生成静态报告 | `vitest run --browser.traceView --reporter=html` | HTML 报告中包含已记录测试的 trace 查看器。 |

## 与 Playwright Traces 的关系

`browser.traceView` 和 [`browser.trace`](/config/browser/trace) 是相互独立的功能：

|                        | `browser.traceView`                                       | `browser.trace`                                |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Provider 支持          | 所有 provider（playwright、webdriverio、preview）          | 仅 Playwright                                |
| 查看器                 | Browser UI / Vitest UI / HTML reporter                    | Playwright Trace Viewer / trace.playwright.dev |
| 格式                   | [rrweb](https://github.com/rrweb-io/rrweb) DOM 快照        | Playwright `.trace.zip`                        |
| 需要外部工具           | 否                                                        | 是（`npx playwright show-trace`）              |

你可以同时启用二者。关于 `browser.trace` 工作流，请参见 [Playwright Traces](./playwright-traces)。

## 已记录步骤

以下内容会自动记录 trace 条目：

- `expect.element(...)` 断言
- 交互操作，例如 `click`、`dblClick`、`tripleClick`、`fill`、`clear`、`type`、`hover`、`selectOptions`、`upload`、`dragAndDrop`、`tab`、`keyboard`、`wheel` 和截图
- 测试运行器生命周期事件（例如，每次测试和重试运行后都会记录 `vitest:onAfterRetryTask`）

每个条目都会捕获该时刻的 DOM 状态，以及时间信息、选择器和触发它的源位置。

In Vitest UI, trace entries are streamed as the test runs, so you can inspect recorded steps before the test finishes. Long-running actions, `expect.element(...)` assertions, and callback `page.mark()` entries appear as in-progress steps first, then update with their final status and duration.

## 自定义 Trace 条目

你可以使用 `page.mark()` 和 `locator.mark()` 插入自己命名的条目：

```ts
import { page } from 'vitest/browser'

await page.mark('内容已渲染')

await page.getByRole('button', { name: 'Sign in' }).mark('登录按钮')
```

你也可以向 `page.mark()` 传入回调。请注意，目前不支持分组——每个内部操作都会单独记录，而 mark 条目会显示在末尾：

```ts
await page.mark('登录流程', async () => {
  await page.getByRole('textbox', { name: '电子邮件' }).fill('john@example.com')
  await page.getByRole('textbox', { name: '密码' }).fill('secret')
  await page.getByRole('button', { name: '登录' }).click()
})
```

使用 [`vi.defineHelper()`](/api/vi#vi-defineHelper) 可让可复用 helper 生成的条目指向调用处，而不是 helper 内部：

```ts
import { vi } from 'vitest'
import { page } from 'vitest/browser'

const renderContent = vi.defineHelper(async (html: string) => {
  document.body.innerHTML = html
  await page.elementLocator(document.body).mark('渲染')
})

test('显示按钮', async () => {
  await renderContent('<button>Hello</button>') // trace 条目指向这里
})
```

## 重试与重复

每次尝试——无论是重试还是重复——都会作为单独的 trace 记录。当一个测试有多个尝试时，查看器默认会打开最近的一次。你可以在 Report 标签页中切换不同尝试。

## 快照保真度

默认情况下，trace view 会捕获 DOM 树、属性、表单值、同源可读的 CSS、元素滚动位置、视口大小和窗口滚动位置。图片和 canvas 像素默认不会内联。

样式表通过浏览器的 CSSOM 捕获。可读取的 `<style>` 标签和同源的 `<link rel="stylesheet">` 文件会被序列化到快照中，并作为内联样式回放，因此普通组件样式在 trace 查看器和 HTML reporter 中仍可正常工作。这里捕获的是浏览器应用的已解析 CSS 规则，而不是原始样式表的精确字节：注释、格式、无效规则，以及 CSS 资源文件（例如背景图片或字体）都不会以这种方式打包。

使用对象形式可启用额外的保真度选项：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      traceView: {
        enabled: true,
        inlineImages: true,
        recordCanvas: true,
      },
    },
  },
})
```

`inlineImages` 会将已加载的 `<img>` 像素存储到 trace 快照中。这主要对 HTML reporter 有用，因为报告应当可以独立移植，而不依赖外部图片 URL。这里捕获的是像素，而不是原始资源：SVG 会被栅格化，动画图片不会保留动画，CSS 背景图片或字体也不会被涵盖。跨源图片需要可通过 CORS 读取的像素才能内联；否则，只要外部 URL 仍可访问，它们仍然可以从外部 URL 渲染。

`recordCanvas` 会将可读取的 canvas 像素存储到 trace 快照中。这对图表和简单的 2D canvas 输出很有用，但它不是完整的 canvas 绘制时间线，也不提供完整的 WebGL 回放。

### 外部资源限制

Trace view 目前不提供通用的资源存储。未被捕获进快照的资源仍然依赖 URL。

这意味着，序列化 CSS 中引用的 CSS 背景图片和 `@font-face` 文件仍然依赖其原始 URL。外部图片在浏览器能够加载该 URL 时仍可在查看器中渲染，但除非 `inlineImages` 能捕获其像素，否则它们在 HTML reporter 中不可移植。跨源图片需要可通过 CORS 读取的像素才能完成该捕获；否则浏览器可以显示它们，但 rrweb 无法安全地将它们绘制为 canvas data URL。

对于需要在 HTML reporter 中可移植的已加载 `<img>` 元素，请使用 `inlineImages`。CSS 子资源、字体、不可通过 CORS 读取的跨源图片、视频以及其他外部文件，仍是当前基于快照的 trace 格式的限制。

::: warning Canvas 回放沙箱

`recordCanvas` 会在 trace 查看器中启用一个限制更弱的 iframe 沙箱。rrweb 会通过图像加载处理器回放 canvas 数据，因此对于使用 `recordCanvas` 记录的 trace，Vitest 允许在回放 iframe 中执行脚本。仅在 canvas 像素对调试有帮助时启用此选项。

:::
