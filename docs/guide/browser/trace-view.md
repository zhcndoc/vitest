# Trace View <Version>5.0.0</Version>

Trace View 会记录浏览器测试中的操作、断言和标记等步骤，以及页面的 DOM 快照。测试结束后，你可以在 Vitest 的 trace 查看器中回放记录，查看发生了什么以及页面当时的状态。

默认情况下，Vitest 只记录失败的测试，在终端中打印这些测试的步骤，并保留测试失败时的页面快照。

::: tip
关于通过 [`browser.trace`](/config/browser/trace) 录制的 Playwright trace，请参阅 [Playwright Traces](./playwright-traces)。
:::

## 录制模式 {#recording-modes}

[`browser.traceView`](/config/browser/traceview) 决定 Vitest 会记录哪些测试：

- `'failure-only'` 只记录失败的测试。这是默认值。每个 trace 都会保留所有步骤，以及测试失败时的页面快照。
- `true` 或 `'on'` 会记录每个测试，并为每个步骤保存快照。Vitest UI 也会在测试运行期间持续显示步骤，因此你可以在测试结束前检查记录。运行时间较长的操作、`expect.element(...)` 断言和回调形式的 `page.mark()` 条目会先显示为进行中，之后再更新为最终状态和耗时。
- `false` 或 `'off'` 会关闭 Trace View。

例如，要记录每个测试：

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

## 失败输出 {#failure-output}

测试失败时，终端中的错误信息后会附上已记录步骤的时间线：

<<< ./snippets/trace-failure.ansi [错误报告]

时间线列出与 trace 查看器相同的步骤；对于运行时间较长的测试，内容会被截断，且不包含 DOM 快照。trace 查看器会显示所有步骤以及测试失败时的页面状态。

## 打开 Trace {#opening-traces}

在查看测试结果的各个位置都可以打开 trace 查看器：

| 位置                                             | 命令                             | 显示内容                                                                  |
| ------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------- |
| [浏览器 UI](/config/browser/ui)                  | `vitest`                         | trace 查看器显示在实时视图旁边；实时视图只显示当前页面                    |
| [Vitest UI](/guide/ui)                           | `vitest --ui --browser.headless` | 每个测试的报告中显示 trace 查看器，测试在无头浏览器中运行                  |
| [HTML 报告器](/guide/reporters#html-reporter)     | `vitest run --reporter=html`     | 生成的报告中包含 trace 查看器，适用于 CI                                  |
| 终端                                             | `vitest run`                     | 显示每个失败测试的步骤时间线，详见[失败输出](#failure-output)              |

如果想在可见的浏览器窗口中使用 Vitest UI，请参阅[无头模式与 UI](/guide/browser/#headless-mode-and-ui)。

启用 HTML 报告器后，[Vitest VS Code 扩展](https://github.com/vitest-dev/vscode#trace-view)会在 Testing 视图和编辑器装订线中的测试旁添加 **Open Trace View** 操作。

## Trace 查看器 {#trace-viewer}

查看器包含两个可调整大小的窗格：

- **步骤列表**（左侧）显示每个已记录的操作、断言、标记和生命周期条目，包括名称、时序、选择器和源位置。失败的操作和断言会以红色高亮。
- **DOM 快照**（右侧）显示所选步骤对应的页面状态，并以蓝色高亮与之交互的元素。只记录失败测试时，快照会在测试结束时获取。

如果有可用的源位置，选择步骤也会在 Code 标签页中打开对应位置。

<img alt="HTML 报告中的 trace 查看器，显示步骤列表和 DOM 快照" img-light src="/browser/trace-view-light.png">
<img alt="HTML 报告中的 trace 查看器，显示步骤列表和 DOM 快照" img-dark src="/browser/trace-view-dark.png">

## 记录的步骤 {#recorded-steps}

Vitest 会为以下内容记录步骤：

- `expect.element(...)` 断言
- 交互操作，例如 `click`、`dblClick`、`tripleClick`、`fill`、`clear`、`type`、`hover`、`selectOptions`、`upload`、`dragAndDrop`、`tab`、`keyboard`、`wheel` 和截图
- 测试运行器生命周期事件，例如每次测试和重试运行后的 `vitest:onAfterRetryTask`

每个步骤都会记录其时序、选择器以及触发它的源位置。

浏览器模式之外的测试可以通过 [`experimental.traceTimeline`](/config/experimental#experimental-tracetimeline) 打印相同的时间线，显示其中的 `expect.poll`、`vi.waitFor` 和 `vi.waitUntil` 步骤。

## 自定义 Trace 条目 {#custom-trace-entries}

你可以使用 `page.mark()` 和 `locator.mark()` 插入自定义名称的条目：

```ts
import { page } from 'vitest/browser'

await page.mark('content rendered')

await page.getByRole('button', { name: 'Sign in' }).mark('sign in button')
```

你也可以向 `page.mark()` 传入回调来分组步骤。标记条目覆盖整个回调，其中的操作会在步骤列表中嵌套显示在该标记下：

```ts
await page.mark('sign in flow', async () => {
  await page.getByRole('textbox', { name: 'Email' }).fill('john@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('secret')
  await page.getByRole('button', { name: 'Sign in' }).click()
})
```

使用 [`vi.defineHelper()`](/api/vi#vi-defineHelper)，可让可复用 helper 生成的条目指向调用处，而不是 helper 内部：

```ts
import { vi } from 'vitest'
import { page } from 'vitest/browser'

const renderContent = vi.defineHelper(async (html: string) => {
  document.body.innerHTML = html
  await page.elementLocator(document.body).mark('render')
})

test('shows button', async () => {
  await renderContent('<button>Hello</button>') // trace entry points here
})
```

## 重试与重复 {#retries-and-repeats}

测试的每次重试或重复都会单独记录为一个 trace。查看器默认打开最近一次尝试，你可以在 Report 标签页中切换不同尝试。

## 无障碍树 <Version>5.1.0</Version> {#accessibility-tree}

每个快照也会记录页面的无障碍树。trace 查看器标题栏中的视图选择器可以在快照窗格中切换 **DOM** 和 **Aria** 视图。Aria 视图会列出基于角色的定位器（例如 `getByRole()`）所能看到的角色、可访问名称和状态，格式与 [aria 快照](/guide/browser/aria-snapshots)相同。将 [`traceView.ariaSnapshot`](/config/browser/traceview#traceview-ariasnapshot) 设为 `false` 可关闭此功能。

<img alt="HTML 报告中的 trace 查看器，显示步骤列表和 Aria 快照" img-light src="/browser/trace-view-aria-light.png">
<img alt="HTML 报告中的 trace 查看器，显示步骤列表和 Aria 快照" img-dark src="/browser/trace-view-aria-dark.png">

## 快照包含的内容 {#what-snapshots-capture}

快照会捕获 DOM 树、属性、表单值、同源且可读取的 CSS、元素滚动位置、视口大小和窗口滚动位置。iframe 内容不会被捕获，因此同源和跨源 iframe 回放时都会显示为空框架。

样式表通过浏览器的 CSSOM 捕获。可读取的 `<style>` 标签和同源 `<link rel="stylesheet">` 文件会被序列化到快照中，并以内联样式的形式回放，因此组件样式在 trace 查看器和 HTML 报告中仍然有效。快照保存的是浏览器解析后的规则，而非原始样式表文件；注释、格式和无效规则会被去除，CSS 引用的背景图片、字体等文件不会被包含。

默认情况下，快照不会保存图片或 canvas 像素，因此图片会从原始 URL 加载，而 canvas 回放时为空白。要将它们保存到快照中，请启用以下选项：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      traceView: {
        inlineImages: true,
        recordCanvas: true,
      },
    },
  },
})
```

[`inlineImages`](/config/browser/traceview#traceview-inlineimages) 会将已加载 `<img>` 元素的像素存入快照，使 HTML 报告无需依赖原始 URL 也能渲染这些图片。它捕获的是像素而非原始文件，因此 SVG 会被栅格化，动画图片会变成静态图片。只有在像素可通过 CORS 读取时，跨源图片才会被内联；否则只要 URL 仍然可访问，图片就会继续通过该 URL 渲染。

[`recordCanvas`](/config/browser/traceview#traceview-recordcanvas) 会将每个 canvas 的像素存入快照，因此每个快照都会显示当时的 canvas 状态。除非 WebGL canvas 创建时设置了 `preserveDrawingBuffer: true`，否则回放时会显示空白。

::: warning Canvas 回放沙箱

rrweb 会通过图像加载处理器重绘 canvas 数据，因此对于启用了 `recordCanvas` 的 trace，trace 查看器允许在回放 iframe 中执行脚本。只有在 canvas 像素有助于调试时才启用此选项。

:::

### 外部资源限制 {#external-resource-limits}

Trace View 不提供资源存储，因此没有捕获到快照中的内容仍会从原始 URL 加载。这包括 CSS 背景图片、`@font-face` 文件、视频，以及 `inlineImages` 无法捕获的图片。在浏览器 UI 和 Vitest UI 中，Vitest 仍在提供项目文件，因此这些资源通常可以正常显示。但在测试运行后打开的 HTML 报告中，它们可能会缺失。

## 与 Playwright Traces 的关系 {#relation-to-playwright-traces}

`browser.traceView` 和 [`browser.trace`](/config/browser/trace) 是相互独立的功能，可以同时启用：

|                        | `browser.traceView`                                      | `browser.trace`                                |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| 提供者支持             | 所有提供者（playwright、webdriverio、preview）           | 仅 Playwright                                  |
| 查看器                 | Browser UI / Vitest UI / HTML 报告器                     | Playwright Trace Viewer / trace.playwright.dev |
| 格式                   | [rrweb](https://github.com/rrweb-io/rrweb) DOM 快照       | Playwright `.trace.zip`                        |
| 是否需要外部工具       | 否                                                       | 是（`npx playwright show-trace`）              |

关于 `browser.trace` 的使用方式，请参阅 [Playwright Traces](./playwright-traces)。
