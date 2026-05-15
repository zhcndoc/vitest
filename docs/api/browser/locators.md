---
title: 定位器 | 浏览器模式
outline: [2, 3]
---

# 定位器

定位器是元素或多个元素的表示。每个定位器都由一个称为选择器的字符串定义。Vitest 通过提供在幕后生成这些选择器的便捷方法，对此选择器进行了抽象。

定位器 API 使用了 [Playwright 的定位器](https://playwright.dev/docs/api/class-locator) 的一个分支，称为 [Ivya](https://npmx.dev/ivya)。然而，Vitest 向每个 [提供者](/config/browser/provider) 提供此 API，不仅仅是 playwright。

::: tip
本页涵盖 API 用法。为了更好地理解定位器及其用法，请阅读 [Playwright 的“定位器”文档](https://playwright.dev/docs/locators)。
:::

::: tip 与 testing-library 的区别
Vitest 的 `page.getBy*` 方法返回一个定位器对象，而不是 DOM 元素。这使得定位器查询可组合，并允许 Vitest 在需要时重试交互和断言。

与 testing-library 查询相比：

- 使用定位器链式调用（`.getBy*`、`.filter`、`.nth`）而不是 `within(...)`。
- 保留定位器并在稍后与它们交互（`await locator.click()`），而不是预先解析元素。
- 单元素逃生舱口如 `.element()` 和 `.query()` 是严格的，如果匹配多个元素则抛出错误。

```ts
import { expect } from 'vitest'
import { page } from 'vitest/browser'

const deleteButton = page
  .getByRole('row')
  .filter({ hasText: 'Vitest' })
  .getByRole('button', { name: /delete/i })

await deleteButton.click()
await expect.element(deleteButton).toBeEnabled()
```
:::

## getByRole

```ts
function getByRole(
  role: ARIARole | string,
  options?: LocatorByRoleOptions,
): Locator
```

创建一种通过其 [ARIA 角色](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)、[ARIA 属性](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes) 和 [可访问名称](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name) 来定位元素的方法。

::: tip
如果你只查询单个元素 `getByText('The name')`，通常最好使用 `getByRole(expectedRole, { name: 'The name' })`。可访问名称查询不会替换其他查询，如 `*ByAltText` 或 `*ByTitle`。虽然可访问名称可以等于这些属性，但它不会替换这些属性的功能。
:::

考虑以下 DOM 结构。

```html
<h3>注册</h3>
<label>
  登录
  <input type="text" />
</label>
<label>
  密码
  <input type="password" />
</label>
<br/>
<button>提交</button>
```

你可以通过其隐式角色定位每个元素：

```ts
await expect.element(
  page.getByRole('heading', { name: '注册' })
).toBeVisible()

await page.getByRole('textbox', { name: '登录' }).fill('admin')
await page.getByRole('textbox', { name: '密码' }).fill('admin')

await page.getByRole('button', { name: /提交/i }).click()
```

::: warning
角色通过字符串相等性匹配，不从 ARIA 角色层次结构继承。因此，查询超类角色（如 `checkbox`）不会包含具有子类角色（如 `switch`）的元素。

默认情况下，HTML 中的许多语义元素都有角色；例如，`<input type="radio">` 具有 "radio" 角色。HTML 中的非语义元素没有角色；没有添加语义的 `<div>` 和 `<span>` 返回 `null`。`role` 属性可以提供语义。

根据 ARIA 指南，通过 `role` 或 `aria-*` 属性为已经具有隐式角色的内置元素提供角色是 **强烈不推荐** 的。
:::

**选项**

- `exact: boolean`

  是否精确匹配 `name`：区分大小写且全字符串匹配。默认禁用。如果 `name` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白字符。

  ```tsx
  <button>Hello World</button>

  page.getByRole('button', { name: 'hello world' }) // ✅
  page.getByRole('button', { name: 'hello world', exact: true }) // ❌
  page.getByRole('button', { name: 'Hello World', exact: true }) // ✅
  ```

- `checked: boolean`

  是否应包含已选中的元素（由 `aria-checked` 或 `<input type="checkbox"/>` 设置）。默认情况下，不应用过滤器。

  参见 [`aria-checked`](https://www.w3.org/TR/wai-aria-1.2/#aria-checked) 获取更多信息

  ```tsx
  <>
    <button role="checkbox" aria-checked="true" />
    <input type="checkbox" checked />
  </>

  page.getByRole('checkbox', { checked: true }) // ✅
  page.getByRole('checkbox', { checked: false }) // ❌
  ```

- `disabled: boolean`

  是否应包含禁用的元素。默认情况下，不应用过滤器。注意，与其他属性不同，`disable` 状态是继承的。

  参见 [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled) 获取更多信息

  ```tsx
  <input type="text" disabled />

  page.getByRole('textbox', { disabled: true }) // ✅
  page.getByRole('textbox', { disabled: false }) // ❌
  ```

- `expanded: boolean`

  是否应包含展开的元素。默认情况下，不应用过滤器。

  参见 [`aria-expanded`](https://www.w3.org/TR/wai-aria-1.2/#aria-expanded) 获取更多信息

  ```tsx
  <a aria-expanded="true" href="example.com">链接</a>

  page.getByRole('link', { expanded: true }) // ✅
  page.getByRole('link', { expanded: false }) // ❌
  ```

- `includeHidden: boolean`

  是否应查询 [通常被排除](https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion) 在无障碍树之外的元素。默认情况下，只有非隐藏元素通过角色选择器匹配。

  注意，角色 `none` 和 `presentation` 始终包含在内。

  ```tsx
  <button style="display: none" />

  page.getByRole('button') // ❌
  page.getByRole('button', { includeHidden: false }) // ❌
  page.getByRole('button', { includeHidden: true }) // ✅
  ```

- `level: number`

  一个数字属性，通常存在于 `heading`、`listitem`、`row`、`treeitem` 角色中，`<h1>-<h6>` 元素有默认值。默认情况下，不应用过滤器。

  参见 [`aria-level`](https://www.w3.org/TR/wai-aria-1.2/#aria-level) 获取更多信息

  ```tsx
  <>
    <h1>标题级别一</h1>
    <div role="heading" aria-level="1">第二个标题级别一</div>
  </>

  page.getByRole('heading', { level: 1 }) // ✅
  page.getByRole('heading', { level: 2 }) // ❌
  ```

- `name: string | RegExp`

  [可访问名称](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name)。默认情况下，匹配不区分大小写并搜索子字符串。使用 `exact` 选项来控制此行为。

  ```tsx
  <button>点击我！</button>

  page.getByRole('button', { name: '点击我！' }) // ✅
  page.getByRole('button', { name: '点击我！' }) // ✅
  page.getByRole('button', { name: '点击我？' }) // ❌
  ```

- `pressed: boolean`

  是否应包含按下的元素。默认情况下，不应用过滤器。

  参见 [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.2/#aria-pressed) 获取更多信息

  ```tsx
  <button aria-pressed="true">👍</button>

  page.getByRole('button', { pressed: true }) // ✅
  page.getByRole('button', { pressed: false }) // ❌
  ```

- `selected: boolean`

  是否应包含选中的元素。默认情况下，不应用过滤器。

  参见 [`aria-selected`](https://www.w3.org/TR/wai-aria-1.2/#aria-selected) 获取更多信息

  ```tsx
  <button role="tab" aria-selected="true">Vue</button>

  page.getByRole('button', { selected: true }) // ✅
  page.getByRole('button', { selected: false }) // ❌
  ```

**另见**

- [MDN 上的 ARIA 角色列表](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [w3.org 上的 ARIA 角色列表](https://www.w3.org/TR/wai-aria-1.2/#role_definitions)
- [testing-library 的 `ByRole`](https://testing-library.com/docs/queries/byrole/)

## getByAltText

```ts
function getByAltText(
  text: string | RegExp,
  options?: LocatorOptions,
): Locator
```

创建能够查找具有匹配 `alt` 属性的元素的定位器。与 testing-library 的实现不同，Vitest 将匹配任何具有匹配 `alt` 属性的元素。

```tsx
<img alt="Incredibles 2 Poster" src="/incredibles-2.png" />

page.getByAltText(/incredibles.*? poster/i) // ✅
page.getByAltText('non existing alt text') // ❌
```

**选项**

- `exact: boolean`

  是否精确匹配 `text`：区分大小写且全字符串匹配。默认禁用。如果 `text` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白字符。

**另见**

- [testing-library 的 `ByAltText`](https://testing-library.com/docs/queries/byalttext/)

## getByLabelText

```ts
function getByLabelText(
  text: string | RegExp,
  options?: LocatorOptions,
): Locator
```

创建能够查找具有关联标签的元素的定位器。

`page.getByLabelText('Username')` 定位器将找到下面示例中的每个输入：

```html
// label 和表单元素 id 之间的 for/htmlFor 关系
<label for="username-input">用户名</label>
<input id="username-input" />

// 带有表单元素的 aria-labelledby 属性
<label id="username-label">用户名</label>
<input aria-labelledby="username-label" />

// 包装标签
<label>用户名 <input /></label>

// 标签文本在另一个子元素中的包装标签
<label>
  <span>用户名</span>
  <input />
</label>

// aria-label 属性
// 请注意，因为这不是用户在页面上可以看到的标签，
// 所以你的输入目的对于视觉用户来说必须是显而易见的。
<input aria-label="Username" />
```

**选项**

- `exact: boolean`

  是否精确匹配 `text`：区分大小写且全字符串匹配。默认禁用。如果 `text` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白字符。

**另见**

- [testing-library 的 `ByLabelText`](https://testing-library.com/docs/queries/bylabeltext/)

## getByPlaceholder

```ts
function getByPlaceholder(
  text: string | RegExp,
  options?: LocatorOptions,
): Locator
```

创建能够查找具有指定 `placeholder` 属性的元素的定位器。Vitest 将匹配任何具有匹配 `placeholder` 属性的元素，不仅仅是 `input`。

```tsx
<input placeholder="Username" />

page.getByPlaceholder('Username') // ✅
page.getByPlaceholder('not found') // ❌
```

::: warning
通常最好依赖使用 [`getByLabelText`](#getbylabeltext) 的标签而不是占位符。
:::

**选项**

- `exact: boolean`

  是否精确匹配 `text`：区分大小写且全字符串匹配。默认禁用。如果 `text` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白字符。

**另见**

- [testing-library 的 `ByPlaceholderText`](https://testing-library.com/docs/queries/byplaceholdertext/)

## getByText

```ts
function getByText(
  text: string | RegExp,
  options?: LocatorOptions,
): Locator
```

创建一个能够查找包含指定文本的元素的定位器。文本将与 TextNode 的 [`nodeValue`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue) 匹配，如果类型是 `button` 或 `reset`，则与 input 的 value 匹配。文本匹配总是会规范化空白字符，即使是精确匹配。例如，它将多个空格变为一个，将换行符变为空格，并忽略前导和尾随空白。

```tsx
<a href="/about">关于 ℹ️</a>

page.getByText(/about/i) // ✅
page.getByText('about', { exact: true }) // ❌
```

::: tip
此定位器适用于查找非交互元素。如果你需要查找交互元素，如按钮或输入框，建议使用 [`getByRole`](#getbyrole)。
:::

**选项**

- `exact: boolean`

  `text` 是否精确匹配：区分大小写且为整个字符串。默认禁用。如果 `text` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白。

**另见**

- [testing-library 的 `ByText`](https://testing-library.com/docs/queries/bytext/)

## getByTitle

```ts
function getByTitle(
  text: string | RegExp,
  options?: LocatorOptions,
): Locator
```

创建一个能够查找具有指定 `title` 属性的元素的定位器。与 testing-library 的 `getByTitle` 不同，Vitest 无法在 SVG 内查找 `title` 元素。

```tsx
<span title="Delete" id="2"></span>

page.getByTitle('Delete') // ✅
page.getByTitle('Create') // ❌
```

**选项**

- `exact: boolean`

  `text` 是否精确匹配：区分大小写且为整个字符串。默认禁用。如果 `text` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白。

**另见**

- [testing-library 的 `ByTitle`](https://testing-library.com/docs/queries/bytitle/)

## getByTestId

```ts
function getByTestId(text: string | RegExp): Locator
```

创建一个能够查找匹配指定测试 id 属性的元素的定位器。你可以使用 [`browser.locators.testIdAttribute`](/config/browser/locators#testidattribute) 配置属性名称。

```tsx
<div data-testid="custom-element" />

page.getByTestId('custom-element') // ✅
page.getByTestId('non-existing-element') // ❌
```

::: warning
建议仅在其他定位器不适用于你的用例时使用此方法。使用 `data-testid` 属性并不像你的软件被使用的方式，如果可能应避免使用。
:::

**选项**

- `exact: boolean`

  `text` 是否精确匹配：区分大小写且为整个字符串。默认禁用。如果 `text` 是正则表达式，则忽略此选项。注意，精确匹配仍然会修剪空白。

**另见**

- [testing-library 的 `ByTestId`](https://testing-library.com/docs/queries/bytestid/)

## nth

```ts
function nth(index: number): Locator
```

此方法返回一个新的定位器，仅匹配多元素查询结果中的特定索引。它是从零开始的，`nth(0)` 选择第一个元素。与 `elements()[n]` 不同，`nth` 定位器会重试直到元素出现。

```html
<div aria-label="one"><input/><input/><input/></div>
<div aria-label="two"><input/></div>
```

```tsx
page.getByRole('textbox').nth(0) // ✅
page.getByRole('textbox').nth(4) // ❌
```

::: tip
在使用 `nth` 之前，你可能会发现使用链式定位器来缩小搜索范围很有用。
有时除了元素位置外没有更好的区分方法；虽然这可能导致不稳定，但总比没有好。
:::

```tsx
page.getByLabel('two').getByRole('input') // ✅ page.getByRole('textbox').nth(3) 的更好替代方案
page.getByLabel('one').getByRole('input') // ❌ 太模糊
page.getByLabel('one').getByRole('input').nth(1) // ✅ 务实的妥协
```

## first

```ts
function first(): Locator
```

此方法返回一个新的定位器，仅匹配多元素查询结果的第一个索引。
它是 `nth(0)` 的语法糖。

```html
<input/> <input/> <input/>
```

```tsx
page.getByRole('textbox').first() // ✅
```

## last

```ts
function last(): Locator
```

此方法返回一个新的定位器，仅匹配多元素查询结果的最后一个索引。
它是 `nth(-1)` 的语法糖。

```html
<input/> <input/> <input/>
```

```tsx
page.getByRole('textbox').last() // ✅
```

## and

```ts
function and(locator: Locator): Locator
```

此方法创建一个新的定位器，同时匹配父级和提供的定位器。以下示例查找具有特定标题的按钮：

```ts
page.getByRole('button').and(page.getByTitle('Subscribe'))
```

## or

```ts
function or(locator: Locator): Locator
```

此方法创建一个新的定位器，匹配其中一个或两个定位器。

::: warning
注意，如果定位器匹配多个元素，调用另一个方法可能会抛出错误，如果它期望单个元素：

```tsx
<>
  <button>Click me</button>
  <a href="https://vitest.dev">发生错误！</a>
</>

page.getByRole('button')
  .or(page.getByRole('link'))
  .click() // ❌ 匹配多个元素
```
:::

## filter

```ts
function filter(options: LocatorOptions): Locator
```

此方法根据选项缩小定位器范围，例如按文本过滤。它可以链式调用以应用多个过滤器。

### has

- **类型:** `Locator`

此选项缩小选择器以匹配包含其他匹配所提供定位器的元素的元素。例如，使用此 HTML：

```html{1,3}
<article>
  <div>Vitest</div>
</article>
<article>
  <div>Rolldown</div>
</article>
```

我们可以缩小定位器范围以仅查找内部包含 `Vitest` 文本的 `article`：

```ts
page.getByRole('article').filter({ has: page.getByText('Vitest') }) // ✅
```

::: warning
提供的定位器（示例中的 `page.getByText('Vitest')`）必须相对于父级定位器（示例中的 `page.getByRole('article')`）。它将从父级定位器开始查询，而不是文档根节点。

意味着，你不能传递一个查询父级定位器外部元素的定位器：

```ts
page.getByText('Vitest').filter({ has: page.getByRole('article') }) // ❌
```

此示例将失败，因为 `article` 元素在包含 `Vitest` 文本的元素外部。
:::

::: tip
此方法可以链式调用以进一步缩小元素范围：

```ts
page.getByRole('article')
  .filter({ has: page.getByRole('button', { name: 'delete row' }) })
  .filter({ has: page.getByText('Vitest') })
```
:::

### hasNot

- **类型:** `Locator`

此选项缩小选择器以匹配不包含其他匹配所提供定位器的元素的元素。例如，使用此 HTML：

```html{1,3}
<article>
  <div>Vitest</div>
</article>
<article>
  <div>Rolldown</div>
</article>
```

我们可以缩小定位器范围以仅查找内部不包含 `Rolldown` 的 `article`。

```ts
page.getByRole('article')
  .filter({ hasNot: page.getByText('Rolldown') }) // ✅
page.getByRole('article')
  .filter({ hasNot: page.getByText('Vitest') }) // ❌
```

::: warning
注意，提供的定位器是针对父级查询的，而不是文档根节点，就像 [`has`](#has) 选项一样。
:::

### hasText

- **类型:** `string | RegExp`

此选项缩小选择器以仅匹配内部某处包含所提供文本的元素。当传递 `string` 时，匹配是不区分大小写的，并搜索子字符串。

```html{1,3}
<article>
  <div>Vitest</div>
</article>
<article>
  <div>Rolldown</div>
</article>
```

两个定位器都会找到相同的元素，因为搜索是不区分大小写的：

```ts
page.getByRole('article').filter({ hasText: 'Vitest' }) // ✅
page.getByRole('article').filter({ hasText: 'Vite' }) // ✅
```

### hasNotText

- **类型:** `string | RegExp`

此选项缩小选择器以仅匹配内部某处不包含所提供文本的元素。当传递 `string` 时，匹配是不区分大小写的，并搜索子字符串。

## 方法

所有方法都是异步的，必须被等待。自 Vitest 3 起，如果方法未被等待，测试将失败。

### click

```ts
function click(options?: UserEventClickOptions): Promise<void>
```

点击一个元素。你可以使用选项来设置光标位置。

```ts
import { page } from 'vitest/browser'

await page.getByRole('img', { name: 'Rose' }).click()
```

- [查看更多 `userEvent.click`](/api/browser/interactivity#userevent-click)

### dblClick

```ts
function dblClick(options?: UserEventDoubleClickOptions): Promise<void>
```

在元素上触发双击事件。你可以使用选项来设置光标位置。

```ts
import { page } from 'vitest/browser'

await page.getByRole('img', { name: 'Rose' }).dblClick()
```

- [查看更多 `userEvent.dblClick`](/api/browser/interactivity#userevent-dblclick)

### tripleClick

```ts
function tripleClick(options?: UserEventTripleClickOptions): Promise<void>
```

在元素上触发三击事件。由于浏览器 API 中没有 `tripleclick`，此方法将连续触发三次点击事件。

```ts
import { page } from 'vitest/browser'

await page.getByRole('img', { name: 'Rose' }).tripleClick()
```

- [查看更多 `userEvent.tripleClick`](/api/browser/interactivity#userevent-tripleclick)

### wheel <Version>4.1.0</Version> {#wheel}

```ts
function wheel(options: UserEventWheelOptions): Promise<void>
```

在元素上触发 [`wheel` 事件](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)。你可以使用选项来选择一般的滚动 `direction` 或精确的 `delta` 值。

```ts
import { page } from 'vitest/browser'

// 向右滚动
await page.getByRole('tablist').wheel({ direction: 'right' })
```

- [查看更多 `userEvent.wheel`](/api/browser/interactivity#userevent-wheel)

### clear

```ts
function clear(options?: UserEventClearOptions): Promise<void>
```

清除输入元素的内容。

```ts
import { page } from 'vitest/browser'

await page.getByRole('textbox', { name: 'Full Name' }).clear()
```

- [查看更多 `userEvent.clear`](/api/browser/interactivity#userevent-clear)

### hover

```ts
function hover(options?: UserEventHoverOptions): Promise<void>
```

将光标位置移动到选定的元素。

```ts
import { page } from 'vitest/browser'

await page.getByRole('img', { name: 'Rose' }).hover()
```

- [查看更多 `userEvent.hover`](/api/browser/interactivity#userevent-hover)

### unhover

```ts
function unhover(options?: UserEventHoverOptions): Promise<void>
```

这与 [`locator.hover`](#hover) 工作原理相同，但将光标移动到 `document.body` 元素。

```ts
import { page } from 'vitest/browser'

await page.getByRole('img', { name: 'Rose' }).unhover()
```

- [查看更多 `userEvent.unhover`](/api/browser/interactivity#userevent-unhover)

### fill

```ts
function fill(text: string, options?: UserEventFillOptions): Promise<void>
```

设置当前 `input`、`textarea` 或 `contenteditable` 元素的值。

```ts
import { page } from 'vitest/browser'

await page.getByRole('input', { name: 'Full Name' }).fill('Mr. Bean')
```

- [查看更多 `userEvent.fill`](/api/browser/interactivity#userevent-fill)

### dropTo

```ts
function dropTo(
  target: Locator,
  options?: UserEventDragAndDropOptions,
): Promise<void>
```

将当前元素拖动到目标位置。

```ts
import { page } from 'vitest/browser'

const paris = page.getByText('Paris')
const france = page.getByText('France')

await paris.dropTo(france)
```

- [查看更多 `userEvent.dragAndDrop`](/api/browser/interactivity#userevent-draganddrop)

### selectOptions

```ts
function selectOptions(
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

从 `<select>` 元素中选择一个或多个值。

```ts
import { page } from 'vitest/browser'

const languages = page.getByRole('select', { name: 'Languages' })

await languages.selectOptions('EN')
await languages.selectOptions(['ES', 'FR'])
await languages.selectOptions([
  languages.getByRole('option', { name: 'Spanish' }),
  languages.getByRole('option', { name: 'French' }),
])
```

- [查看更多 `userEvent.selectOptions`](/api/browser/interactivity#userevent-selectoptions)

### screenshot

```ts
function screenshot(options: LocatorScreenshotOptions & { save: false }): Promise<string>
function screenshot(options: LocatorScreenshotOptions & { base64: true }): Promise<{
  path: string
  base64: string
}>
function screenshot(options?: LocatorScreenshotOptions & { base64?: false }): Promise<string>
```

创建与定位器选择器匹配元素的截图。

你可以使用 `path` 选项指定截图的保存位置，该位置相对于当前测试文件。如果未设置 `path` 选项，Vitest 将默认使用 [`browser.screenshotDirectory`](/config/browser/screenshotdirectory)（默认为 `__screenshot__`），以及文件和测试的名称来确定截图的文件路径。

如果你还需要截图的内容，可以指定 `base64: true` 以同时返回截图保存的文件路径。

```ts
import { page } from 'vitest/browser'

const button = page.getByRole('button', { name: 'Click Me!' })

const path = await button.screenshot()

const { path, base64 } = await button.screenshot({
  path: './button-click-me.png',
  base64: true, // 同时返回 base64 字符串
})
// path - 截图的完整路径
// base64 - 截图的 base64 编码字符串
```

::: warning 警告 <Version>3.2.0</Version>
注意，如果 `save` 设置为 `false`，`screenshot` 将始终返回 base64 字符串。
在这种情况下，`path` 也会被忽略。
:::

### mark

```ts
function mark(name: string, options?: { stack?: string; kind?: BrowserTraceEntryKind }): Promise<void>
```

在跟踪时间线上添加一个命名标记，并使用当前定位器作为标记上下文。

传递 `options.stack` 以覆盖跟踪元数据中的调用站点位置。这对于需要保留最终用户源代码位置的包装库很有用。

传递 `options.kind` 以将标记归类为特定类型，例如 `'action'`。

```ts
import { page } from 'vitest/browser'

const submitButton = page.getByRole('button', { name: 'Submit' })

await submitButton.mark('before submit')
await submitButton.click()
await submitButton.mark('after submit')
```

::: tip
此方法仅在启用 [`browser.trace`](/config/browser/trace) 时有用。
:::

### query

```ts
function query(): Element | null
```

此方法返回与定位器选择器匹配的单个元素，如果未找到元素则返回 `null`。

如果多个元素匹配选择器，此方法将抛出错误。当你需要所有匹配的 DOM 元素时使用 [`.elements()`](#elements)，如果你需要匹配选择器的定位器数组时使用 [`.all()`](#all)。

::: danger
这是针对不支持定位器的外部 API 的应急方案。建议优先使用定位器方法。
:::

考虑以下 DOM 结构：

```html
<div>Hello <span>World</span></div>
<div>Hello</div>
```

这些定位器不会抛出错误：

```ts
page.getByText('Hello World').query() // ✅ HTMLDivElement
page.getByText('Hello Germany').query() // ✅ null
page.getByText('World').query() // ✅ HTMLSpanElement
page.getByText('Hello', { exact: true }).query() // ✅ HTMLSpanElement
```

这些定位器将抛出错误：

```ts
// 返回多个元素
page.getByText('Hello').query() // ❌
page.getByText(/^Hello/).query() // ❌
```

### element

```ts
function element(): Element
```

此方法返回与定位器选择器匹配的单个元素。

如果_没有元素_匹配选择器，则抛出错误。当你只需要检查元素是否存在时，考虑使用 [`.query()`](#query)。

如果_多个元素_匹配选择器，则抛出错误。当你需要所有匹配的 DOM 元素时使用 [`.elements()`](#elements)，如果你需要匹配选择器的定位器数组时使用 [`.all()`](#all)。

::: danger
这是针对不支持定位器的外部 API 的应急方案。建议优先使用定位器方法。

每当断言被 [重试](/api/browser/assertions) 时，当定位器与 `expect.element` 一起使用时会自动调用：

```ts
await expect.element(page.getByRole('button')).toBeDisabled()
```
:::

考虑以下 DOM 结构：

```html
<div>Hello <span>World</span></div>
<div>Hello Germany</div>
<div>Hello</div>
```

这些定位器不会抛出错误：

```ts
page.getByText('Hello World').element() // ✅
page.getByText('Hello Germany').element() // ✅
page.getByText('World').element() // ✅
page.getByText('Hello', { exact: true }).element() // ✅
```

这些定位器将抛出错误：

```ts
// 返回多个元素
page.getByText('Hello').element() // ❌
page.getByText(/^Hello/).element() // ❌

// 未返回元素
page.getByText('Hello USA').element() // ❌
```

### elements

```ts
function elements(): Element[]
```

此方法返回与定位器选择器匹配的元素数组。

此函数从不抛出错误。如果没有元素匹配选择器，此方法将返回一个空数组。

考虑以下 DOM 结构：

```html
<div>Hello <span>World</span></div>
<div>Hello</div>
```

这些定位器将始终成功：

```ts
page.getByText('Hello World').elements() // ✅ [HTMLElement]
page.getByText('World').elements() // ✅ [HTMLElement]
page.getByText('Hello', { exact: true }).elements() // ✅ [HTMLElement]
page.getByText('Hello').elements() // ✅ [HTMLElement, HTMLElement]
page.getByText('Hello USA').elements() // ✅ []
```

### findElement <Version>4.1.0</Version> {#findelement}

```ts
function findElement(
  options?: SelectorOptions
): Promise<HTMLElement | SVGElement>
```

::: danger 警告
这是针对你需要原始 DOM 元素的情况的应急方案——例如，将其传递给像 FormKit 这样不接受 Vitest 定位器的第三方库。如果你自己与元素交互，请使用其他 [内置方法](#methods)。
:::

此方法返回与定位器匹配的元素。与 [`.element()`](#element) 不同，此方法将等待并重试直到匹配的元素出现在 DOM 中，使用递增的间隔 (0, 20, 50, 100, 100, 500ms)。

如果在超时前_未找到元素_，则抛出错误。默认情况下，超时与测试超时匹配。

如果_多个元素_匹配选择器且 `strict` 为 `true`（默认），则立即抛出错误而不重试。将 `strict` 设置为 `false` 以改为返回第一个匹配的元素。

它接受选项：

- `timeout: number` - 等待多长时间（毫秒）直到找到至少一个元素。默认情况下，这与测试共享超时。
- `strict: boolean` - 当为 `true`（默认）时，如果多个元素匹配定位器则抛出错误。当为 `false` 时，返回第一个匹配的元素。

考虑以下 DOM 结构：

```html
<div>Hello <span>World</span></div>
<div>Hello Germany</div>
<div>Hello</div>
```

这些定位器将成功解析：

```ts
await page.getByText('Hello World').findElement() // ✅ HTMLDivElement
await page.getByText('World').findElement() // ✅ HTMLSpanElement
await page.getByText('Hello Germany').findElement() // ✅ HTMLDivElement
```

这些定位器将抛出错误：

```ts
// 多个元素匹配，严格模式拒绝
await page.getByText('Hello').findElement() // ❌
await page.getByText(/^Hello/).findElement() // ❌

// 超时前未找到匹配元素
await page.getByText('Hello USA').findElement() // ❌
```

使用 `strict: false` 允许多个匹配：

```ts
// 返回第一个匹配元素而不是抛出错误
await page.getByText('Hello').findElement({ strict: false }) // ✅ HTMLDivElement
```

### all

```ts
function all(): Locator[]
```

此方法返回一个匹配选择器的新定位器数组。

在内部，此方法调用 `.elements` 并使用 [`page.elementLocator`](/api/browser/context#page) 包装每个元素。

- [查看 `locator.elements()`](#elements)

### serialize

```ts
function serialize(): SerializedLocator
```

返回定位器的 JSON 可序列化表示。返回的对象有两个字段：

- [`selector`](#selector)：运行时用于查询元素的提供者特定选择器字符串。
- `locator`：用于错误消息和追踪的人类可读定位器描述（例如 `getByRole('button')`）。等同于调用 [`asLocator()`](#aslocator)。

这主要用于将定位器转发给 [browser command](/api/browser/commands)，该命令在 Node 中运行，无法接收活动的 `Locator` 实例：

```ts
import { commands, page } from 'vitest/browser'

await commands.myCommand(page.getByRole('button').serialize())
```

::: tip
Vitest 会自动序列化传递给命令的任何 `Locator` 参数，因此通常无需显式调用 `serialize()`。你也可以使用 `JSON.stringify(locator)`（它会在内部调用 [`toJSON`](#tojson)），效果相同。
:::

### toJSON

```ts
function toJSON(): SerializedLocator
```

[`serialize`](#serialize) 的别名。定义它是为了让 `JSON.stringify(locator)` 和基于结构化克隆的传输返回一个 `SerializedLocator` 对象。

### asLocator

```ts
function asLocator(): string
```

使用 JavaScript 定位器语法返回定位器的人类可读描述（例如 `getByRole('button', { name: 'Submit' })`）。这与 [`serialize()`](#serialize) 的 `locator` 字段所暴露的字符串相同，并用于错误消息和追踪。

```ts
import { page } from 'vitest/browser'

const button = page.getByRole('button', { name: 'Submit' })
button.asLocator() // "getByRole('button', { name: 'Submit' })"
```

::: tip
当你需要传递给 [browser command](/api/browser/commands) 的提供者特定字符串时，请使用 [`selector`](#selector)。仅将 `asLocator()` 用于诊断输出。返回的字符串不应被重新用于查询元素。
:::

## 属性

### selector

`selector` 是一个字符串，浏览器提供程序将使用它来定位元素。Playwright 将使用 `playwright` 定位器语法，而 `preview` 和 `webdriverio` 将使用 CSS。

::: danger
你不应该在测试代码中使用这个字符串。`selector` 字符串仅在使用 Commands API 时使用：

```ts [commands.ts]
import type { BrowserCommand } from 'vitest/node'
import type { SerializedLocator } from '@vitest/browser'

const test: BrowserCommand<SerializedLocator> = function test(context, { selector }) {
  // playwright
  await context.iframe.locator(selector).click()
  // 适用于 webdriverio
  await context.browser.$(selector).click()
}
```

```ts [example.test.ts]
import { test } from 'vitest'
import { commands, page } from 'vitest/browser'

test('works correctly', async () => {
  await commands.test(page.getByText('Hello').serialize()) // ✅
  // vitest 将自动将其展开为 SerializedLocator
  await commands.test(page.getByText('Hello')) // ✅
})
```
:::

### length

此 getter 返回此定位器匹配的元素数量。它等同于调用 `locator.elements().length`。

考虑以下 DOM 结构：

```html
<button>点击我！</button>
<button>不要点击我！</button>
```

此属性将始终成功：

```ts
page.getByRole('button').length // ✅ 2
page.getByRole('button', { title: '点击我！' }).length // ✅ 1
page.getByRole('alert').length // ✅ 0
```

## 自定义定位器 <Version>3.2.0</Version> <Badge type="danger">高级</Badge> {#custom-locators}

你可以通过定义定位器工厂对象来扩展内置的定位器 API。这些方法将作为 `page` 对象和任何创建的定位器上的方法存在。

如果内置定位器不够用，这些定位器会很有用。例如，当你为 UI 使用自定义框架时。

定位器工厂需要返回一个选择器字符串或定位器本身。

::: tip
选择器语法与 Playwright 定位器相同。请阅读 [他们的指南](https://playwright.dev/docs/other-locators) 以更好地了解如何使用它们。
:::

```ts
import { locators } from 'vitest/browser'

locators.extend({
  getByArticleTitle(title) {
    return `[data-title="${title}"]`
  },
  getByArticleCommentsCount(count) {
    return `.comments :text("${count} comments")`
  },
  async previewComments() {
    // 你可以通过 "this" 访问当前定位器
    // 注意，如果该方法是在 `page` 上调用的，`this` 将是 `page`，
    // 而不是定位器！
    if (this !== page) {
      await this.click()
    }
    // ...
  }
})

// 如果你使用的是 typescript，你可以扩展 LocatorSelectors 接口
// 以便在 locators.extend, page.* 和 locator.* 方法中获得自动补全
declare module 'vitest/browser' {
  interface LocatorSelectors {
    // 如果自定义方法返回字符串，它将被转换为定位器
    // 如果它返回其他任何内容，则将照常返回
    getByArticleTitle(title: string): Locator
    getByArticleCommentsCount(count: number): Locator

    // Vitest 将返回一个 promise，并且不会尝试将其转换为定位器
    previewComments(this: Locator): Promise<void>
  }
}
```

如果该方法是在全局 `page` 对象上调用的，那么选择器将应用于整个页面。在下面的示例中，`getByArticleTitle` 将找到所有具有属性 `data-title` 且值为 `title` 的元素。但是，如果该方法是在定位器上调用的，那么它将限定于该定位器范围。

```html
<article data-title="Hello, World!">
  Hello, World!
  <button id="comments">2 comments</button>
</article>

<article data-title="Hello, Vitest!">
  Hello, Vitest!
  <button id="comments">0 comments</button>
</article>
```

```ts
const articles = page.getByRole('article')
const worldArticle = page.getByArticleTitle('Hello, World!') // ✅
const commentsElement = worldArticle.getByArticleCommentsCount(2) // ✅
const wrongCommentsElement = worldArticle.getByArticleCommentsCount(0) // ❌
const wrongElement = page.getByArticleTitle('No Article!') // ❌

await commentsElement.previewComments() // ✅
await wrongCommentsElement.previewComments() // ❌
```
