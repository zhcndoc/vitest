---
title: 交互 API | 浏览器模式
---

# 交互 API

Vitest 使用 [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) 或 [webdriver](https://www.w3.org/TR/webdriver/) 实现了 [`@testing-library/user-event`](https://testing-library.com/docs/user-event/intro) API 的子集，而不是模拟事件，这使得浏览器行为更可靠，并与用户与页面交互的方式保持一致。

```ts
import { userEvent } from 'vitest/browser'

await userEvent.click(document.querySelector('.button'))
```

几乎每个 `userEvent` 方法都继承其提供者的选项。

## userEvent.setup

```ts
function setup(): UserEvent
```

创建一个新的用户事件实例。如果你需要保持键盘状态以便正确地按下和释放按钮，这很有用。

::: warning
与 `@testing-library/user-event` 不同，`vitest/browser` 的默认 `userEvent` 实例只创建一次，而不是每次调用其方法时都创建！你可以在此代码片段中看到它的工作方式差异：

```ts
import { userEvent as vitestUserEvent } from 'vitest/browser'
import { userEvent as originalUserEvent } from '@testing-library/user-event'

await vitestUserEvent.keyboard('{Shift}') // 按下 shift 而不释放
await vitestUserEvent.keyboard('{/Shift}') // 释放 shift

await originalUserEvent.keyboard('{Shift}') // 按下 shift 而不释放
await originalUserEvent.keyboard('{/Shift}') // 没有释放 shift，因为状态不同
```

这种行为更有用，因为我们不是模拟键盘，而是实际按下 Shift，所以保留原始行为会在字段中输入时导致意外问题。
:::

::: warning
使用 `playwright` 和 `webdriverio` 提供程序时，交互由底层浏览器驱动程序执行。这意味着某些交互状态（例如按下的按键或指针位置，以及由此产生的悬停状态）可能会在同一文件中的测试之间持续存在。

Vitest 会在每个测试用例开始前自动重置未释放的键盘状态，但不会自动重置指针位置及由此产生的悬停状态，因为重置指针位置可能会产生较高开销。

这既适用于 `userEvent.*` 调用，也适用于 `locator.click()` 或 `locator.hover()` 等定位器快捷方法，因为它们使用相同的底层交互状态。

如果你的测试依赖于中性的悬停状态，请显式重置它，例如在 `beforeEach` 中：

```ts
import { beforeEach } from 'vitest'
import { userEvent } from 'vitest/browser'

beforeEach(async () => {
  await userEvent.unhover(document.body)
})
```
:::

## userEvent.click

```ts
function click(
  element: Element | Locator,
  options?: UserEventClickOptions,
): Promise<void>
```

点击一个元素。继承提供者的选项。请参阅你的提供者文档以了解此方法如何工作的详细说明。

```ts
import { page, userEvent } from 'vitest/browser'

test('clicks on an element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.click(logo)
  // 或者你可以直接在 locator 上访问它
  await logo.click()

  // 使用 WebdriverIO 时，这将使用 ElementClick（无参数）或
  // actions（有参数）。使用空对象强制使用 actions。
  await logo.click({})
})
```

### 使用修饰键点击

使用 WebdriverIO 或 Playwright：

```ts
await userEvent.keyboard('{Shift>}')
// 通过使用空对象作为选项，这选择使用动作链
// 而不是 webdriver 中的 ElementClick。
// Firefox 有一个 bug 使得这成为必要。
// 关注 https://bugzilla.mozilla.org/show_bug.cgi?id=1456642 以了解何时
// 将被修复。
await userEvent.click(element, {})
await userEvent.keyboard('{/Shift}')
```

使用 Playwright：
```ts
await userEvent.click(element, { modifiers: ['Shift'] })
```

参考：

- [Playwright `locator.click` API](https://playwright.dev/docs/api/class-locator#locator-click)
- [WebdriverIO `element.click` API](https://webdriver.io/docs/api/element/click/)
- [testing-library `click` API](https://testing-library.com/docs/user-event/convenience/#click)。

## userEvent.dblClick

```ts
function dblClick(
  element: Element | Locator,
  options?: UserEventDoubleClickOptions,
): Promise<void>
```

在元素上触发双击事件。

请参阅你的提供者文档以了解此方法如何工作的详细说明。

```ts
import { page, userEvent } from 'vitest/browser'

test('triggers a double click on an element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.dblClick(logo)
  // 或者你可以直接在 locator 上访问它
  await logo.dblClick()
})
```

参考：

- [Playwright `locator.dblclick` API](https://playwright.dev/docs/api/class-locator#locator-dblclick)
- [WebdriverIO `element.doubleClick` API](https://webdriver.io/docs/api/element/doubleClick/)
- [testing-library `dblClick` API](https://testing-library.com/docs/user-event/convenience/#dblClick)。

## userEvent.tripleClick

```ts
function tripleClick(
  element: Element | Locator,
  options?: UserEventTripleClickOptions,
): Promise<void>
```

在元素上触发三击事件。由于浏览器 API 中没有 `tripleclick`，此方法将连续触发三次点击事件，因此你必须检查 [点击事件 detail](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event#usage_notes) 来过滤事件：`evt.detail === 3`。

请参阅你的提供者文档以了解此方法如何工作的详细说明。

```ts
import { page, userEvent } from 'vitest/browser'

test('triggers a triple click on an element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })
  let tripleClickFired = false
  logo.addEventListener('click', (evt) => {
    if (evt.detail === 3) {
      tripleClickFired = true
    }
  })

  await userEvent.tripleClick(logo)
  // 或者你可以直接在 locator 上访问它
  await logo.tripleClick()

  expect(tripleClickFired).toBe(true)
})
```

参考：

- [Playwright `locator.click` API](https://playwright.dev/docs/api/class-locator#locator-click)：通过 `click` 实现，带有 `clickCount: 3`。
- [WebdriverIO `browser.action` API](https://webdriver.io/docs/api/browser/action/)：通过 actions API 实现，带有 `move` 加上三个连续的 `down + up + pause` 事件。
- [testing-library `tripleClick` API](https://testing-library.com/docs/user-event/convenience/#tripleClick)。

## userEvent.wheel <Version>4.1.0</Version> {#userevent-wheel}

```ts
function wheel(
  element: Element | Locator,
  options: UserEventWheelOptions,
): Promise<void>
```

在元素上触发 [`wheel` 事件](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)。

你可以使用 `delta` 进行基于像素的精确控制，或使用 `direction` 进行更简单的方向滚动（`up`、`down`、`left`、`right`）来指定滚动量。当你需要触发多个 wheel 事件时，使用 `times` 选项而不是多次调用该方法以获得更好的性能。

```ts
import { page, userEvent } from 'vitest/browser'

test('scroll using delta values', async () => {
  const tablist = page.getByRole('tablist')

  // 向右滚动 100 像素
  await userEvent.wheel(tablist, { delta: { x: 100 } })

  // 向下滚动 50 像素
  await userEvent.wheel(tablist, { delta: { y: 50 } })

  // 对角线滚动 2 次
  await userEvent.wheel(tablist, { delta: { x: 50, y: 100 }, times: 2 })
})

test('scroll using direction', async () => {
  const tablist = page.getByRole('tablist')

  // 向右滚动 5 次
  await userEvent.wheel(tablist, { direction: 'right', times: 5 })

  // 向左滚动一次
  await userEvent.wheel(tablist, { direction: 'left' })
})
```

Wheel 事件也可以直接从 [locators](/api/browser/locators#wheel) 触发：

```ts
import { page } from 'vitest/browser'

await page.getByRole('tablist').wheel({ direction: 'right' })
```

::: warning
此方法旨在用于测试明确监听 `wheel` 事件的 UI（例如，自定义缩放控件、水平标签页滚动、画布交互）。如果你需要滚动页面以将元素带入视图，请依赖其他 `userEvent` 方法或 [locator 动作](/api/browser/locators#methods) 提供的内置自动滚动功能。
:::

## userEvent.fill

```ts
function fill(
  element: Element | Locator,
  text: string,
): Promise<void>
```

为 `input`/`textarea`/`contenteditable` 字段设置值。这将在设置新值之前移除输入中的任何现有文本。

```ts
import { page, userEvent } from 'vitest/browser'

test('update input', async () => {
  const input = page.getByRole('input')

  await userEvent.fill(input, 'foo') // input.value == foo
  await userEvent.fill(input, '{{a[[') // input.value == {{a[[
  await userEvent.fill(input, '{Shift}') // input.value == {Shift}

  // 或者你可以直接在 locator 上访问它
  await input.fill('foo') // input.value == foo
})
```

此方法聚焦元素，填充它并在填充后触发 `input` 事件。你可以使用空字符串来清除字段。

::: tip
此 API 比使用 [`userEvent.type`](#userevent-type) 或 [`userEvent.keyboard`](#userevent-keyboard) 更快，但它**不支持** [user-event `keyboard` 语法](https://testing-library.com/docs/user-event/keyboard)（例如，`{Shift}{selectall}`）。

我们建议在不需要输入特殊字符或对按键事件进行精细控制的情况下，使用此 API 而不是 [`userEvent.type`](#userevent-type)。
:::

参考：

- [Playwright `locator.fill` API](https://playwright.dev/docs/api/class-locator#locator-fill)
- [WebdriverIO `element.setValue` API](https://webdriver.io/docs/api/element/setValue)
- [testing-library `type` API](https://testing-library.com/docs/user-event/utility/#type)。

## userEvent.keyboard

```ts
function keyboard(text: string): Promise<void>
```

`userEvent.keyboard` 允许你触发键盘击键。如果任何输入获得焦点，它将字符输入到该输入中。否则，它将在当前聚焦的元素上触发键盘事件（如果没有聚焦的元素，则为 `document.body`）。

此 API 支持 [user-event `keyboard` 语法](https://testing-library.com/docs/user-event/keyboard)。可以在花括号内引用的常见特殊键包括：

- **修饰键：** `{Shift}`、`{Control}`、`{Alt}`、`{Meta}`
- **导航：** `{ArrowUp}`、`{ArrowDown}`、`{ArrowLeft}`、`{ArrowRight}`、`{Home}`、`{End}`、`{PageUp}`、`{PageDown}`
- **编辑：** `{Backspace}`、`{Delete}`、`{Insert}`、`{Tab}`、`{Enter}`、`{Escape}`
- **功能键：** `{F1}` 到 `{F12}`

注意：支持的确切键集合可能因底层浏览器提供程序（Playwright 与 WebdriverIO）而异。如果按键没有触发预期行为，请查阅提供程序的文档或提交 issue。

```ts
import { userEvent } from 'vitest/browser'

test('trigger keystrokes', async () => {
  await userEvent.keyboard('foo') // 转换为：f, o, o
  await userEvent.keyboard('{{a[[') // 转换为：{, a, [
  await userEvent.keyboard('{Shift}{f}{o}{o}') // 转换为：Shift, f, o, o
  await userEvent.keyboard('{a>5}') // 按下 a 而不释放它并触发 5 次 keydown
  await userEvent.keyboard('{a>5/}') // 按下 a 持续 5 次 keydown 然后释放它
})
```

参考：

- [Playwright `Keyboard` API](https://playwright.dev/docs/api/class-keyboard)
- [WebdriverIO `action('key')` API](https://webdriver.io/docs/api/browser/action#key-input-source)
- [testing-library `type` API](https://testing-library.com/docs/user-event/utility/#type)

## userEvent.tab

```ts
function tab(options?: UserEventTabOptions): Promise<void>
```

发送一个 `Tab` 键事件。这是 `userEvent.keyboard('{tab}')` 的简写。

```ts
import { page, userEvent } from 'vitest/browser'

test('tab works', async () => {
  const [input1, input2] = page.getByRole('input').elements()

  expect(input1).toHaveFocus()

  await userEvent.tab()

  expect(input2).toHaveFocus()

  await userEvent.tab({ shift: true })

  expect(input1).toHaveFocus()
})
```

参考：

- [Playwright `Keyboard` API](https://playwright.dev/docs/api/class-keyboard)
- [WebdriverIO `action('key')` API](https://webdriver.io/docs/api/browser/action#key-input-source)
- [testing-library `tab` API](https://testing-library.com/docs/user-event/convenience/#tab)

## userEvent.type

```ts
function type(
  element: Element | Locator,
  text: string,
  options?: UserEventTypeOptions,
): Promise<void>
```

::: warning
如果你不依赖 [特殊字符](https://testing-library.com/docs/user-event/keyboard)（例如 `{shift}` 或 `{selectall}`），建议使用 [`userEvent.fill`](#userevent-fill) 以获得更好的性能。
:::

`type` 方法实现了 `@testing-library/user-event` 的 [`type`](https://testing-library.com/docs/user-event/utility/#type) 工具，构建于 [`keyboard`](https://testing-library.com/docs/user-event/keyboard) API 之上。

此函数允许你在 `input`/`textarea`/`contenteditable` 元素中输入字符。它支持 [user-event `keyboard` 语法](https://testing-library.com/docs/user-event/keyboard)。

如果你只需要按下字符而不需要输入框，请使用 [`userEvent.keyboard`](#userevent-keyboard) API。

```ts
import { page, userEvent } from 'vitest/browser'

test('update input', async () => {
  const input = page.getByRole('input')

  await userEvent.type(input, 'foo') // input.value 等于 foo
  await userEvent.type(input, '{{a[[') // input.value 等于 foo{a[
  await userEvent.type(input, '{Shift}') // input.value 等于 foo{a[
})
```

::: info
Vitest 没有在 locator 上暴露 `.type` 方法（如 `input.type`），因为它仅为了与 `userEvent` 库兼容而存在。考虑使用 `.fill` 代替，因为它更快。
:::

参考：

- [Playwright `locator.press` API](https://playwright.dev/docs/api/class-locator#locator-press)
- [WebdriverIO `action('key')` API](https://webdriver.io/docs/api/browser/action#key-input-source)
- [testing-library `type` API](https://testing-library.com/docs/user-event/utility/#type)。

## userEvent.clear

```ts
function clear(element: Element | Locator, options?: UserEventClearOptions): Promise<void>
```

此方法清除输入元素的内容。

```ts
import { page, userEvent } from 'vitest/browser'

test('clears input', async () => {
  const input = page.getByRole('input')

  await userEvent.fill(input, 'foo')
  expect(input).toHaveValue('foo')

  await userEvent.clear(input)
  // 或者你可以直接在 locator 上访问它
  await input.clear()

  expect(input).toHaveValue('')
})
```

参考：

- [Playwright `locator.clear` API](https://playwright.dev/docs/api/class-locator#locator-clear)
- [WebdriverIO `element.clearValue` API](https://webdriver.io/docs/api/element/clearValue)
- [testing-library `clear` API](https://testing-library.com/docs/user-event/utility/#clear)

## userEvent.selectOptions

```ts
function selectOptions(
  element: Element | Locator,
  values:
    | HTMLElement
    | HTMLElement[]
    | Locator
    | Locator[]
    | string
    | string[],
  options?: UserEventSelectOptions,
): Promise<void>
```

`userEvent.selectOptions` 允许在 `<select>` 元素中选择值。

::: warning
如果 select 元素没有 [`multiple`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple) 属性，Vitest 将只选择数组中的第一个元素。

与 `@testing-library` 不同，Vitest 目前不支持 [listbox](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role)，但我们计划在未来添加支持。
:::

```ts
import { page, userEvent } from 'vitest/browser'

test('clears input', async () => {
  const select = page.getByRole('select')

  await userEvent.selectOptions(select, 'Option 1')
  // 或者你可以直接在 locator 上访问它
  await select.selectOptions('Option 1')

  expect(select).toHaveValue('option-1')

  await userEvent.selectOptions(select, 'option-1')
  expect(select).toHaveValue('option-1')

  await userEvent.selectOptions(select, [
    page.getByRole('option', { name: 'Option 1' }),
    page.getByRole('option', { name: 'Option 2' }),
  ])
  expect(select).toHaveValue(['option-1', 'option-2'])
})
```

::: warning
`webdriverio` 提供者不支持选择多个元素，因为它没有提供这样做的 API。
:::

参考：

- [Playwright `locator.selectOption` API](https://playwright.dev/docs/api/class-locator#locator-select-option)
- [WebdriverIO `element.selectByIndex` API](https://webdriver.io/docs/api/element/selectByIndex)
- [testing-library `selectOptions` API](https://testing-library.com/docs/user-event/utility/#-selectoptions-deselectoptions)。

## userEvent.hover

```ts
function hover(
  element: Element | Locator,
  options?: UserEventHoverOptions,
): Promise<void>
```

此方法将光标位置移动到选定的元素。请参阅你的提供者文档以了解此方法如何工作的详细说明。

::: warning
如果你使用 `webdriverio` 提供者，光标默认将移动到元素的中心。

如果你使用 `playwright` 提供者，光标将移动到元素的“某个”可见点。
:::

```ts
import { page, userEvent } from 'vitest/browser'

test('hovers logo element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.hover(logo)
  // 或者你可以直接在 locator 上访问它
  await logo.hover()
})
```

参考：

- [Playwright `locator.hover` API](https://playwright.dev/docs/api/class-locator#locator-hover)
- [WebdriverIO `element.moveTo` API](https://webdriver.io/docs/api/element/moveTo/)
- [testing-library `hover` API](https://testing-library.com/docs/user-event/convenience/#hover)。

## userEvent.unhover

```ts
function unhover(
  element: Element | Locator,
  options?: UserEventHoverOptions,
): Promise<void>
```

这与 [`userEvent.hover`](#userevent-hover) 的工作原理相同，但将光标移动到 `document.body` 元素。

::: warning
默认情况下，光标位置在“某个”可见位置（在 `playwright` 提供者中）或 body 元素的中心（在 `webdriverio` 提供者中），所以如果当前悬停的元素已经在同一位置，此方法将无效。
:::

```ts
import { page, userEvent } from 'vitest/browser'

test('unhover logo element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.unhover(logo)
  // 或者你可以直接在 locator 上访问它
  await logo.unhover()
})
```

参考：

- [Playwright `locator.hover` API](https://playwright.dev/docs/api/class-locator#locator-hover)
- [WebdriverIO `element.moveTo` API](https://webdriver.io/docs/api/element/moveTo/)
- [testing-library `hover` API](https://testing-library.com/docs/user-event/convenience/#hover)。

## userEvent.upload

```ts
function upload(
  element: Element | Locator,
  files: string[] | string | File[] | File,
  options?: UserEventUploadOptions,
): Promise<void>
```

更改文件输入元素以拥有指定的文件。

```ts
import { page, userEvent } from 'vitest/browser'

test('can upload a file', async () => {
  const input = page.getByRole('button', { name: /Upload files/ })

  const file = new File(['file'], 'file.png', { type: 'image/png' })

  await userEvent.upload(input, file)
  // 或者你可以直接在 locator 上访问它
  await input.upload(file)

  // 你也可以使用相对于项目根目录的文件路径
  await userEvent.upload(input, './fixtures/file.png')
})
```

::: warning
`webdriverio` 提供者仅在 `chrome` 和 `edge` 浏览器中支持此命令。目前也只支持字符串类型。
:::

参考：

- [Playwright `locator.setInputFiles` API](https://playwright.dev/docs/api/class-locator#locator-set-input-files)
- [WebdriverIO `browser.uploadFile` API](https://webdriver.io/docs/api/browser/uploadFile)
- [testing-library `upload` API](https://testing-library.com/docs/user-event/utility/#upload)。

## userEvent.dragAndDrop

```ts
function dragAndDrop(
  source: Element | Locator,
  target: Element | Locator,
  options?: UserEventDragAndDropOptions,
): Promise<void>
```

将源元素拖放到目标元素上方。别忘了 `source` 元素必须将 `draggable` 属性设置为 `true`。

```ts
import { page, userEvent } from 'vitest/browser'

test('drag and drop works', async () => {
  const source = page.getByRole('img', { name: /logo/ })
  const target = page.getByTestId('logo-target')

  await userEvent.dragAndDrop(source, target)
  // 或者你可以直接在 locator 上访问它
  await source.dropTo(target)

  await expect.element(target).toHaveTextContent('Logo is processed')
})
```

::: warning
默认的 `preview` 提供者不支持此 API。
:::

参考：

- [Playwright `frame.dragAndDrop` API](https://playwright.dev/docs/api/class-frame#frame-drag-and-drop)
- [WebdriverIO `element.dragAndDrop` API](https://webdriver.io/docs/api/element/dragAndDrop/)。

## userEvent.copy

```ts
function copy(): Promise<void>
```

将选中的文本复制到剪贴板。

```js
import { page, userEvent } from 'vitest/browser'

test('copy and paste', async () => {
  // 写入 'source'
  await userEvent.click(page.getByPlaceholder('source'))
  await userEvent.keyboard('hello')

  // 选择并复制 'source'
  await userEvent.dblClick(page.getByPlaceholder('source'))
  await userEvent.copy()

  // 粘贴到 'target'
  await userEvent.click(page.getByPlaceholder('target'))
  await userEvent.paste()

  await expect.element(page.getByPlaceholder('source')).toHaveTextContent('hello')
  await expect.element(page.getByPlaceholder('target')).toHaveTextContent('hello')
})
```

参考：

- [testing-library `copy` API](https://testing-library.com/docs/user-event/convenience/#copy)。

## userEvent.cut

```ts
function cut(): Promise<void>
```

将选中的文本剪切到剪贴板。

```js
import { page, userEvent } from 'vitest/browser'

test('copy and paste', async () => {
  // 写入到 'source'
  await userEvent.click(page.getByPlaceholder('source'))
  await userEvent.keyboard('hello')

  // 选中并剪切 'source'
  await userEvent.dblClick(page.getByPlaceholder('source'))
  await userEvent.cut()

  // 粘贴到 'target'
  await userEvent.click(page.getByPlaceholder('target'))
  await userEvent.paste()

  await expect.element(page.getByPlaceholder('source')).toHaveTextContent('')
  await expect.element(page.getByPlaceholder('target')).toHaveTextContent('hello')
})
```

参考：

- [testing-library `cut` 接口](https://testing-library.com/docs/user-event/clipboard#cut)。

## userEvent.paste

```ts
function paste(): Promise<void>
```

从剪贴板粘贴文本。有关使用示例，请参阅 [`userEvent.copy`](#userevent-copy) 和 [`userEvent.cut`](#userevent-cut)。

参考：

- [testing-library `paste` 接口](https://testing-library.com/docs/user-event/clipboard#paste)。
