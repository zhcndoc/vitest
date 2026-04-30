---
title: 上下文 API | 浏览器模式
---

# 上下文 API

Vitest 通过 `vitest/browser` 入口点暴露了一个上下文模块。截至 2.0 版本，它暴露了一组可能在测试中有用的小工具。

## `userEvent`

::: tip
`userEvent` API 的详细说明见 [交互性 API](/api/browser/interactivity)。
:::

```ts
/**
 * 用户交互的处理程序。支持由浏览器提供者（`playwright` 或 `webdriverio`）实现。
 * 如果与 `preview` 提供者一起使用，则通过 `@testing-library/user-event` 回退到模拟事件。
 * @experimental
 */
export const userEvent: {
  setup: () => UserEvent
  cleanup: () => Promise<void>
  click: (element: Element, options?: UserEventClickOptions) => Promise<void>
  dblClick: (element: Element, options?: UserEventDoubleClickOptions) => Promise<void>
  tripleClick: (element: Element, options?: UserEventTripleClickOptions) => Promise<void>
  selectOptions: (
    element: Element,
    values: HTMLElement | HTMLElement[] | string | string[],
    options?: UserEventSelectOptions,
  ) => Promise<void>
  keyboard: (text: string) => Promise<void>
  type: (element: Element, text: string, options?: UserEventTypeOptions) => Promise<void>
  clear: (element: Element) => Promise<void>
  tab: (options?: UserEventTabOptions) => Promise<void>
  hover: (element: Element, options?: UserEventHoverOptions) => Promise<void>
  unhover: (element: Element, options?: UserEventHoverOptions) => Promise<void>
  fill: (element: Element, text: string, options?: UserEventFillOptions) => Promise<void>
  dragAndDrop: (source: Element, target: Element, options?: UserEventDragAndDropOptions) => Promise<void>
}
```

## `commands`

::: tip
此 API 的详细说明见 [命令 API](/api/browser/commands)。
:::

```ts
/**
 * 浏览器可用的命令。
 * `server.commands` 的快捷方式。
 */
export const commands: BrowserCommands
```

## `page`

`page` 导出提供了与当前 `page` 交互的工具。

::: warning 警告 <Version>3.2.0</Version>
虽然它暴露了 Playwright 的 `page` 中的一些工具，但它不是同一个对象。由于浏览器上下文是在浏览器中评估的，你的测试无法访问 Playwright 的 `page`，因为它运行在服务器上。

如果你需要访问 Playwright 的 `page` 对象，请使用 [命令 API](/api/browser/commands)。
:::

```ts
export const page: {
  /**
   * 更改 iframe 视口的大小。
   */
  viewport(width: number, height: number): Promise<void>
  /**
   * 拍摄测试 iframe 或特定元素的截图。
   * @returns 截图文件的路径或路径和 base64。
   */
  screenshot(options: Omit<ScreenshotOptions, 'base64'> & { base64: true }): Promise<{
    path: string
    base64: string
  }>
  screenshot(options?: ScreenshotOptions): Promise<string>
  /**
   * 当启用浏览器追踪时，添加追踪标记。
   */
  mark(name: string, options?: { stack?: string }): Promise<void>
  /**
   * 当启用浏览器追踪时，在追踪标记下分组多个操作。
   */
  mark<T>(name: string, body: () => T | Promise<T>, options?: { stack?: string }): Promise<T>
  /**
   * 使用自定义方法扩展默认 `page` 对象。
   */
  extend(methods: Partial<BrowserPage>): BrowserPage
  /**
   * 将 HTML 元素包装在 `Locator` 中。查询元素时，搜索将始终返回此元素。
   */
  elementLocator(element: Element): Locator
  /**
   * iframe 定位器。这是一个进入 iframe body 的文档定位器，
   * 工作方式类似于 `page` 对象。
   * **警告：** 目前，这仅由 `playwright` 提供者支持。
   */
  frameLocator(iframeElement: Locator): FrameLocator

  /**
   * Locator API。详见其文档获取更多详情。
   */
  getByRole(role: ARIARole | string, options?: LocatorByRoleOptions): Locator
  getByLabelText(text: string | RegExp, options?: LocatorOptions): Locator
  getByTestId(text: string | RegExp): Locator
  getByAltText(text: string | RegExp, options?: LocatorOptions): Locator
  getByPlaceholder(text: string | RegExp, options?: LocatorOptions): Locator
  getByText(text: string | RegExp, options?: LocatorOptions): Locator
  getByTitle(text: string | RegExp, options?: LocatorOptions): Locator
}
```

::: tip
`getBy*` API 的说明见 [定位器 API](/api/browser/locators)。
:::

::: warning 警告 <Version>3.2.0</Version>
注意，如果 `save` 设置为 `false`，`screenshot` 将始终返回 base64 字符串。
这种情况下 `path` 也会被忽略。
:::

### mark

```ts
function mark(name: string, options?: { stack?: string }): Promise<void>
function mark<T>(
  name: string,
  body: () => T | Promise<T>,
  options?: { stack?: string },
): Promise<T>
```

为当前测试的追踪时间线添加一个命名标记。

传递 `options.stack` 以覆盖追踪元数据中的调用站点位置。这对于需要保留最终用户源代码位置的包装库很有用。

如果传递回调，Vitest 会创建一个具有此名称的追踪组，运行回调，并自动关闭该组。

```ts
import { page } from 'vitest/browser'

await page.mark('before submit')
await page.getByRole('button', { name: 'Submit' }).click()
await page.mark('after submit')

await page.mark('submit flow', async () => {
  await page.getByRole('textbox', { name: 'Email' }).fill('john@example.com')
  await page.getByRole('button', { name: 'Submit' }).click()
})
```

::: tip
此方法仅在 [`browser.trace`](/config/browser/trace) 启用时有用。
:::

### frameLocator

```ts
function frameLocator(iframeElement: Locator): FrameLocator
```

`frameLocator` 方法返回一个 `FrameLocator` 实例，可用于查找 iframe 内部的元素。

框架定位器类似于 `page`。它不指代 Iframe HTML 元素，而是指代 iframe 的文档。

```ts
const frame = page.frameLocator(
  page.getByTestId('iframe')
)

await frame.getByText('Hello World').click() // ✅
await frame.click() // ❌ 不可用
```

::: danger 重要
目前，`frameLocator` 方法仅由 `playwright` 提供者支持。

交互方法（如 `click` 或 `fill`）在 iframe 内的元素上始终可用，但带有 `expect.element` 的断言要求 iframe 具有 [同源策略](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)。
:::

## `cdp`

```ts
function cdp(): CDPSession
```

`cdp` 导出返回当前的 Chrome DevTools Protocol 会话。它对库作者在此基础上构建工具最有用。

::: warning
CDP 会话仅与 `playwright` 提供者配合使用，且仅在使用 `chromium` 浏览器时有效。你可以在 playwright 的 [`CDPSession`](https://playwright.dev/docs/api/class-cdpsession) 文档中阅读更多相关内容。
:::

```ts
export const cdp: () => CDPSession
```

## `server`

`server` 导出代表运行 Vitest 服务器的 Node.js 环境。它主要用于调试或基于环境限制测试。

```ts
export const server: {
  /**
   * Vitest 服务器运行的平台。
   * 与在服务器上调用 `process.platform` 相同。
   */
  platform: Platform
  /**
   * Vitest 服务器的运行时版本。
   * 与在服务器上调用 `process.version` 相同。
   */
  version: string
  /**
   * 浏览器提供者的名称。
   */
  provider: string
  /**
   * 当前浏览器的名称。
   */
  browser: string
  /**
   * 浏览器可用的命令。
   */
  commands: BrowserCommands
  /**
   * 序列化的测试配置。
   */
  config: SerializedConfig
}
```

## `utils`

对自定义渲染库有用的工具函数。

```ts
export const utils: {
  /**
   * 这类似于调用 `page.elementLocator`，但它只返回定位器选择器。
   */
  getElementLocatorSelectors(element: Element): LocatorSelectors
  /**
   * 打印元素的美化 HTML。
   */
  debug(
    el?: Element | Locator | null | (Element | Locator)[],
    maxLength?: number,
    options?: PrettyDOMOptions,
  ): void
  /**
   * 返回元素的美化 HTML。
   */
  prettyDOM(
    dom?: Element | Locator | undefined | null,
    maxLength?: number,
    prettyFormatOptions?: PrettyDOMOptions,
  ): string
  /**
   * 配置 `prettyDOM` 和 `debug` 函数的默认选项。
   * 这也会影响 `vitest-browser-{framework}` 包。
   */
  configurePrettyDOM(options: StringifyOptions): void
  /**
   * 创建 "Cannot find element" 错误。对自定义定位器有用。
   */
  getElementError(selector: string, container?: Element): Error
  /**
   * 用于生成和处理 ARIA 树及模板的实用工具。
   * @experimental
   */
  aria: {
    generateAriaTree(rootElement: Element): AriaNode
    renderAriaTree(root: AriaNode): string
    renderAriaTemplate(template: AriaTemplateNode): string
    parseAriaTemplate(text: string): AriaTemplateNode
    matchAriaTree(root: AriaNode, template: AriaTemplateNode): { pass: boolean; resolved: string }
  }
}
```

### configurePrettyDOM <Version>4.0.0</Version> {#configureprettydom}

`configurePrettyDOM` 函数允许你配置 `prettyDOM` 和 `debug` 函数的默认选项。这对于自定义测试失败消息中 HTML 的格式很有用。

```ts
import { utils } from 'vitest/browser'

utils.configurePrettyDOM({
  maxDepth: 3,
  filterNode: 'script, style, [data-test-hide]'
})
```

#### 选项

- **`maxDepth`** - 打印嵌套元素的最大深度（默认：`Infinity`）
- **`maxLength`** - 输出字符串的最大长度（默认：`7000`）
- **`filterNode`** - 一个 CSS 选择器字符串或函数，用于从输出中过滤掉节点。当提供字符串时，匹配选择器的元素将被排除。当提供函数时，它应返回 `false` 以排除节点。
- **`highlight`** - 启用语法高亮（默认：`true`）
- 以及来自 [`@vitest/pretty-format`](https://npmx.dev/package/@vitest/pretty-format) 的其他选项

#### 使用 CSS 选择器过滤 <Version>4.1.0</Version> {#filtering-with-css-selectors}

`filterNode` 选项允许你从测试失败消息中隐藏无关的标记（如脚本、样式或隐藏元素），使其更容易识别失败的实际原因。

```ts
import { utils } from 'vitest/browser'

// 过滤掉常见的噪音元素
utils.configurePrettyDOM({
  filterNode: 'script, style, [data-test-hide]'
})

// 或直接在 prettyDOM 中使用
const html = utils.prettyDOM(element, undefined, {
  filterNode: 'script, style'
})
```

**常见模式：**

过滤掉脚本和样式：
```ts
utils.configurePrettyDOM({ filterNode: 'script, style' })
```

隐藏具有数据属性的特定元素：
```ts
utils.configurePrettyDOM({ filterNode: '[data-test-hide]' })
```

隐藏元素内的嵌套内容：
```ts
// 隐藏具有 data-test-hide-content 元素的所有子元素
utils.configurePrettyDOM({ filterNode: '[data-test-hide-content] *' })
```

组合多个选择器：
```ts
utils.configurePrettyDOM({
  filterNode: 'script, style, [data-test-hide], svg'
})
```

::: tip
此功能灵感来自 Testing Library 的 [`defaultIgnore`](https://testing-library.com/docs/dom-testing-library/api-configuration/#defaultignore) 配置。
:::

### aria <Version type="experimental">5.0.0</Version> {#aria}

`aria` 命名空间暴露了 Vitest 的 ARIA 快照匹配器所使用的底层工具。

```ts
import { utils } from 'vitest/browser'

document.body.innerHTML = `
  <h1>Hello, World!</h1>
  <button aria-hidden="true">Hidden</button>
  <button>Visible</button>
`
const tree = utils.aria.generateAriaTree(document.body)
const yaml = utils.aria.renderAriaNode(tree)
console.log(yaml)
// - heading "Hello, World!" [level=1]
// - button "Visible""
```
