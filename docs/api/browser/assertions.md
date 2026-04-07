---
title: 断言 API | 浏览器模式
---

# 断言 API

Vitest 开箱即用提供了广泛的 DOM 断言，这些断言源自 [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom) 库，并增加了对定位器（locators）的支持和内置的重试能力。

::: tip TypeScript 支持
如果你正在使用 [TypeScript](/guide/browser/#typescript) 或者希望在 `expect` 中获得正确的类型提示，请确保你在某处引用了 `vitest/browser`。如果你从未从那里导入过，你可以在任何被 `tsconfig.json` 覆盖的文件中添加一个 `reference` 注释：

```ts
/// <reference types="vitest/browser" />
```
:::

浏览器中的测试可能会因其异步性质而不一致地失败。因此，重要的是要有一种方法来保证即使条件延迟（例如由于超时、网络请求或动画），断言也能成功。为此，Vitest 通过 [`expect.poll`](/api/expect#poll) 和 `expect.element` API 开箱即用地提供了可重试的断言：

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('error banner is rendered', async () => {
  triggerError()

  // 这将创建一个定位器，当调用其任何方法时，它将尝试查找元素
  // 此调用本身不会检查元素是否存在。
  const banner = page.getByRole('alert', {
    name: /error/i,
  })

  // Vitest 提供带有内置重试能力的 `expect.element`
  // 它将反复检查元素是否存在于 DOM 中，并且
  // `element.textContent` 的内容等于 "Error!"
  // 直到满足所有条件
  await expect.element(banner).toHaveTextContent('Error!')
})
```

我们建议在使用 `page.getBy*` 定位器时始终使用 `expect.element` 以减少测试的不稳定性。注意 `expect.element` 接受第二个选项：

```ts
interface ExpectPollOptions {
  // 重试断言的间隔时间（毫秒）
  // 默认为 "expect.poll.interval" 配置选项
  interval?: number
  // 重试断言的时间（毫秒）
  // 默认为 "expect.poll.timeout" 配置选项
  timeout?: number
  // 断言失败时打印的消息
  message?: string
}
```

::: tip
`expect.element` 是 `expect.poll(() => element)` 的简写，工作方式完全相同。

`toHaveTextContent` 和所有其他断言仍然可以在常规的 `expect` 上使用，但没有内置的重试机制：

```ts
// 如果 .textContent 不是 `'Error!'` 将立即失败
expect(banner).toHaveTextContent('Error!')
```
:::

## toBeDisabled

```ts
function toBeDisabled(): Promise<void>
```

允许你检查元素是否从用户的角度被禁用。

如果元素是表单控件且在此元素上指定了 `disabled` 属性，或者该元素是具有 `disabled` 属性的表单元素的后代，则匹配。

注意，只有原生控件元素（如 HTML `button`、`input`、`select`、`textarea`、`option`、`optgroup`）可以通过设置 "disabled" 属性来禁用。除非是自定义元素，否则其他元素上的 "disabled" 属性会被忽略。

```html
<button
  data-testid="button"
  type="submit"
  disabled
>
  提交
</button>
```

```ts
await expect.element(getByTestId('button')).toBeDisabled() // ✅
await expect.element(getByTestId('button')).not.toBeDisabled() // ❌
```

## toBeEnabled

```ts
function toBeEnabled(): Promise<void>
```

允许你检查元素是否未从用户的角度被禁用。

工作原理类似于 [`not.toBeDisabled()`](#tobedisabled)。使用此匹配器可以避免测试中的双重否定。

```html
<button
  data-testid="button"
  type="submit"
  disabled
>
  提交
</button>
```

```ts
await expect.element(getByTestId('button')).toBeEnabled() // ✅
await expect.element(getByTestId('button')).not.toBeEnabled() // ❌
```

## toBeEmptyDOMElement

```ts
function toBeEmptyDOMElement(): Promise<void>
```

这允许你断言元素是否没有对用户可见的内容。它会忽略注释，但如果元素包含空白字符则会失败。

```html
<span data-testid="not-empty"><span data-testid="empty"></span></span>
<span data-testid="with-whitespace"> </span>
<span data-testid="with-comment"><!-- comment --></span>
```

```ts
await expect.element(getByTestId('empty')).toBeEmptyDOMElement()
await expect.element(getByTestId('not-empty')).not.toBeEmptyDOMElement()
await expect.element(
  getByTestId('with-whitespace')
).not.toBeEmptyDOMElement()
```

## toBeInTheDocument

```ts
function toBeInTheDocument(): Promise<void>
```

断言元素是否存在于文档中。

```html
<svg data-testid="svg-element"></svg>
```

```ts
await expect.element(getByTestId('svg-element')).toBeInTheDocument()
await expect.element(getByTestId('does-not-exist')).not.toBeInTheDocument()
```

::: warning
此匹配器不会查找分离的元素。元素必须添加到文档中才能被 `toBeInTheDocument` 找到。如果你希望在分离的元素中搜索，请使用：[`toContainElement`](#tocontainelement)。
:::

## toBeInvalid

```ts
function toBeInvalid(): Promise<void>
```

这允许你检查元素当前是否无效。

如果元素具有 [`aria-invalid` 属性](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) 且无值或值为 `"true"`，或者 [`checkValidity()`](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation) 的结果为 `false`，则元素无效。

```html
<input data-testid="no-aria-invalid" />
<input data-testid="aria-invalid" aria-invalid />
<input data-testid="aria-invalid-value" aria-invalid="true" />
<input data-testid="aria-invalid-false" aria-invalid="false" />

<form data-testid="valid-form">
  <input />
</form>

<form data-testid="invalid-form">
  <input required />
</form>
```

```ts
await expect.element(getByTestId('no-aria-invalid')).not.toBeInvalid()
await expect.element(getByTestId('aria-invalid')).toBeInvalid()
await expect.element(getByTestId('aria-invalid-value')).toBeInvalid()
await expect.element(getByTestId('aria-invalid-false')).not.toBeInvalid()

await expect.element(getByTestId('valid-form')).not.toBeInvalid()
await expect.element(getByTestId('invalid-form')).toBeInvalid()
```

## toBeRequired

```ts
function toBeRequired(): Promise<void>
```

这允许你检查表单元素当前是否是必需的。

如果元素具有 `required` 或 `aria-required="true"` 属性，则该元素是必需的。

```html
<input data-testid="required-input" required />
<input data-testid="aria-required-input" aria-required="true" />
<input data-testid="conflicted-input" required aria-required="false" />
<input data-testid="aria-not-required-input" aria-required="false" />
<input data-testid="optional-input" />
<input data-testid="unsupported-type" type="image" required />
<select data-testid="select" required></select>
<textarea data-testid="textarea" required></textarea>
<div data-testid="supported-role" role="tree" required></div>
<div data-testid="supported-role-aria" role="tree" aria-required="true"></div>
```

```ts
await expect.element(getByTestId('required-input')).toBeRequired()
await expect.element(getByTestId('aria-required-input')).toBeRequired()
await expect.element(getByTestId('conflicted-input')).toBeRequired()
await expect.element(getByTestId('aria-not-required-input')).not.toBeRequired()
await expect.element(getByTestId('optional-input')).not.toBeRequired()
await expect.element(getByTestId('unsupported-type')).not.toBeRequired()
await expect.element(getByTestId('select')).toBeRequired()
await expect.element(getByTestId('textarea')).toBeRequired()
await expect.element(getByTestId('supported-role')).not.toBeRequired()
await expect.element(getByTestId('supported-role-aria')).toBeRequired()
```

## toBeValid

```ts
function toBeValid(): Promise<void>
```

这允许你检查元素的值当前是否有效。

如果元素没有 [`aria-invalid` 属性](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) 或属性值为 "false"，则元素有效。如果是表单元素，[`checkValidity()`](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation) 的结果也必须为 `true`。

```html
<input data-testid="no-aria-invalid" />
<input data-testid="aria-invalid" aria-invalid />
<input data-testid="aria-invalid-value" aria-invalid="true" />
<input data-testid="aria-invalid-false" aria-invalid="false" />

<form data-testid="valid-form">
  <input />
</form>

<form data-testid="invalid-form">
  <input required />
</form>
```

```ts
await expect.element(getByTestId('no-aria-invalid')).toBeValid()
await expect.element(getByTestId('aria-invalid')).not.toBeValid()
await expect.element(getByTestId('aria-invalid-value')).not.toBeValid()
await expect.element(getByTestId('aria-invalid-false')).toBeValid()

await expect.element(getByTestId('valid-form')).toBeValid()
await expect.element(getByTestId('invalid-form')).not.toBeValid()
```

## toBeVisible

```ts
function toBeVisible(): Promise<void>
```

这允许你检查元素当前是否对用户可见。

当元素具有非空的边界框且没有 `visibility:hidden` 计算样式时，被视为可见。

注意根据此定义：

- 大小为零的元素**不**被视为可见。
- 具有 `display:none` 的元素**不**被视为可见。
- 具有 `opacity:0` 的元素**被**视为可见。

要检查列表中至少有一个元素可见，请使用 `locator.first()`。

```ts
// 特定元素可见。
await expect.element(page.getByText('Welcome')).toBeVisible()

// 列表中至少有一项可见。
await expect.element(page.getByTestId('todo-item').first()).toBeVisible()

// 两个元素中至少有一个可见，也可能两个都可见。
await expect.element(
  page.getByRole('button', { name: 'Sign in' })
    .or(page.getByRole('button', { name: 'Sign up' }))
    .first()
).toBeVisible()
```

## toBeInViewport <Version>4.0.0</Version> {#tobeinviewport}

```ts
function toBeInViewport(options: { ratio?: number }): Promise<void>
```

这允许你使用 [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) 检查元素当前是否在视口内。

你可以传递 `ratio` 参数作为选项，这意味着元素在视口内的最小比例。`ratio` 应该在 0~1 之间。

```ts
// 特定元素在视口内。
await expect.element(page.getByText('Welcome')).toBeInViewport()

// 特定元素的 50% 应该在视口内
await expect.element(page.getByText('To')).toBeInViewport({ ratio: 0.5 })

// 特定元素的全部应该在视口内
await expect.element(page.getByText('Vitest')).toBeInViewport({ ratio: 1 })
```

## toContainElement

```ts
function toContainElement(element: HTMLElement | SVGElement | Locator | null): Promise<void>
```

这允许你断言一个元素是否包含另一个元素作为后代。

```html
<span data-testid="ancestor"><span data-testid="descendant"></span></span>
```

```ts
const ancestor = getByTestId('ancestor')
const descendant = getByTestId('descendant')
const nonExistingElement = getByTestId('does-not-exist')

await expect.element(ancestor).toContainElement(descendant)
await expect.element(descendant).not.toContainElement(ancestor)
await expect.element(ancestor).not.toContainElement(nonExistingElement)
```

## toContainHTML

```ts
function toContainHTML(htmlText: string): Promise<void>
```

断言表示 HTML 元素的字符串是否包含在另一个元素中。该字符串应包含有效的 html，而不是任何不完整的 html。

```html
<span data-testid="parent"><span data-testid="child"></span></span>
```

```ts
// 这些是有效的用法
await expect.element(getByTestId('parent')).toContainHTML('<span data-testid="child"></span>')
await expect.element(getByTestId('parent')).toContainHTML('<span data-testid="child" />')
await expect.element(getByTestId('parent')).not.toContainHTML('<br />')

// 这些不起作用
await expect.element(getByTestId('parent')).toContainHTML('data-testid="child"')
await expect.element(getByTestId('parent')).toContainHTML('data-testid')
await expect.element(getByTestId('parent')).toContainHTML('</span>')
```

::: warning
 chances are you probably do not need to use this matcher. We encourage testing from the perspective of how the user perceives the app in a browser. That's why testing against a specific DOM structure is not advised.

It could be useful in situations where the code being tested renders html that was obtained from an external source, and you want to validate that html code was used as intended.

It should not be used to check DOM structure that you control. Please, use [`toContainElement`](#tocontainelement) instead.
:::

::: warning
很可能你不需要使用这个匹配器。我们鼓励从用户在浏览器中感知应用程序的角度进行测试。这就是为什么不建议针对特定的 DOM 结构进行测试。

在被测试的代码渲染从外部源获取的 html，并且你想验证该 html 代码是否按预期使用时，它可能会很有用。

它不应用于检查你控制的 DOM 结构。请使用 [`toContainElement`](#tocontainelement) 代替。
:::

## toHaveAccessibleDescription

```ts
function toHaveAccessibleDescription(description?: string | RegExp): Promise<void>
```

这允许你断言元素具有预期的
[可访问描述](https://w3c.github.io/accname/)。

你可以传递预期的可访问描述的确切字符串，或者你可以通过传递正则表达式，或使用
[`expect.stringContaining`](/api/expect#expect-stringcontaining) 或 [`expect.stringMatching`](/api/expect#expect-stringmatching) 进行部分匹配。

```html
<a
  data-testid="link"
  href="/"
  aria-label="Home page"
  title="A link to start over"
  >Start</a
>
<a data-testid="extra-link" href="/about" aria-label="About page">About</a>
<img src="avatar.jpg" data-testid="avatar" alt="User profile pic" />
<img
  src="logo.jpg"
  data-testid="logo"
  alt="Company logo"
  aria-describedby="t1"
/>
<span id="t1" role="presentation">The logo of Our Company</span>
<img
  src="logo.jpg"
  data-testid="logo2"
  alt="Company logo"
  aria-description="The logo of Our Company"
/>
```

```ts
await expect.element(getByTestId('link')).toHaveAccessibleDescription()
await expect.element(getByTestId('link')).toHaveAccessibleDescription('A link to start over')
await expect.element(getByTestId('link')).not.toHaveAccessibleDescription('Home page')
await expect.element(getByTestId('extra-link')).not.toHaveAccessibleDescription()
await expect.element(getByTestId('avatar')).not.toHaveAccessibleDescription()
await expect.element(getByTestId('logo')).not.toHaveAccessibleDescription('Company logo')
await expect.element(getByTestId('logo')).toHaveAccessibleDescription(
  'The logo of Our Company',
)
await expect.element(getByTestId('logo2')).toHaveAccessibleDescription(
  'The logo of Our Company',
)
```

## toHaveAccessibleErrorMessage

```ts
function toHaveAccessibleErrorMessage(message?: string | RegExp): Promise<void>
```

这允许你断言元素具有预期的
[可访问错误消息](https://w3c.github.io/aria/#aria-errormessage)。

你可以传递预期的可访问错误消息的确切字符串。
或者，你可以通过传递正则表达式
或使用
[`expect.stringContaining`](/api/expect#expect-stringcontaining) 或 [`expect.stringMatching`](/api/expect#expect-stringmatching) 进行部分匹配。

```html
<input
  aria-label="Has Error"
  aria-invalid="true"
  aria-errormessage="error-message"
/>
<div id="error-message" role="alert">This field is invalid</div>

<input aria-label="No Error Attributes" />
<input
  aria-label="Not Invalid"
  aria-invalid="false"
  aria-errormessage="error-message"
/>
```

```ts
// 带有有效错误消息的输入框
await expect.element(getByRole('textbox', { name: 'Has Error' })).toHaveAccessibleErrorMessage()
await expect.element(getByRole('textbox', { name: 'Has Error' })).toHaveAccessibleErrorMessage(
  'This field is invalid',
)
await expect.element(getByRole('textbox', { name: 'Has Error' })).toHaveAccessibleErrorMessage(
  /invalid/i,
)
await expect.element(
  getByRole('textbox', { name: 'Has Error' }),
).not.toHaveAccessibleErrorMessage('This field is absolutely correct!')

// 没有有效错误消息的输入框
await expect.element(
  getByRole('textbox', { name: 'No Error Attributes' }),
).not.toHaveAccessibleErrorMessage()

await expect.element(
  getByRole('textbox', { name: 'Not Invalid' }),
).not.toHaveAccessibleErrorMessage()
```

## toHaveAccessibleName

```ts
function toHaveAccessibleName(name?: string | RegExp): Promise<void>
```

这允许你断言元素具有预期的
[可访问名称](https://w3c.github.io/accname/)。例如，这对于断言表单元素和按钮是否有适当的标签很有用。

你可以传递预期的可访问名称的确切字符串，或者你可以通过传递正则表达式，或使用
[`expect.stringContaining`](/api/expect#expect-stringcontaining) 或 [`expect.stringMatching`](/api/expect#expect-stringmatching) 进行部分匹配。

```html
<img data-testid="img-alt" src="" alt="Test alt" />
<img data-testid="img-empty-alt" src="" alt="" />
<svg data-testid="svg-title"><title>Test title</title></svg>
<button data-testid="button-img-alt"><img src="" alt="Test" /></button>
<p><img data-testid="img-paragraph" src="" alt="" /> Test content</p>
<button data-testid="svg-button"><svg><title>Test</title></svg></p>
<div><svg data-testid="svg-without-title"></svg></div>
<input data-testid="input-title" title="test" />
```

```javascript
await expect.element(getByTestId('img-alt')).toHaveAccessibleName('Test alt')
await expect.element(getByTestId('img-empty-alt')).not.toHaveAccessibleName()
await expect.element(getByTestId('svg-title')).toHaveAccessibleName('Test title')
await expect.element(getByTestId('button-img-alt')).toHaveAccessibleName()
await expect.element(getByTestId('img-paragraph')).not.toHaveAccessibleName()
await expect.element(getByTestId('svg-button')).toHaveAccessibleName()
await expect.element(getByTestId('svg-without-title')).not.toHaveAccessibleName()
await expect.element(getByTestId('input-title')).toHaveAccessibleName()
```

## toHaveAttribute

```ts
function toHaveAttribute(attribute: string, value?: unknown): Promise<void>
```

这允许你检查给定元素是否具有属性。你也可以选择检查属性是否具有特定的预期值或使用 [`expect.stringContaining`](/api/expect#expect-stringcontaining) 或 [`expect.stringMatching`](/api/expect#expect-stringmatching) 进行部分匹配。

```html
<button data-testid="ok-button" type="submit" disabled>ok</button>
```

```ts
const button = getByTestId('ok-button')

await expect.element(button).toHaveAttribute('disabled')
await expect.element(button).toHaveAttribute('type', 'submit')
await expect.element(button).not.toHaveAttribute('type', 'button')

await expect.element(button).toHaveAttribute(
  'type',
  expect.stringContaining('sub')
)
await expect.element(button).toHaveAttribute(
  'type',
  expect.not.stringContaining('but')
)
```

## toHaveClass

```ts
function toHaveClass(...classNames: string[], options?: { exact: boolean }): Promise<void>
function toHaveClass(...classNames: (string | RegExp)[]): Promise<void>
```

这允许你检查给定元素在其 `class` 属性中是否具有某些类。你必须提供至少一个类，除非你断言元素没有任何类。

类名列表可以包括字符串和正则表达式。正则表达式与目标元素中的每个单独类进行匹配，而不是与其完整的 `class` 属性值整体匹配。

::: warning
注意，当只提供正则表达式时，你不能使用 `exact: true` 选项。
:::

```html
<button data-testid="delete-button" class="btn extra btn-danger">
  Delete item
</button>
<button data-testid="no-classes">No Classes</button>
```

```ts
const deleteButton = getByTestId('delete-button')
const noClasses = getByTestId('no-classes')

await expect.element(deleteButton).toHaveClass('extra')
await expect.element(deleteButton).toHaveClass('btn-danger btn')
await expect.element(deleteButton).toHaveClass(/danger/, 'btn')
await expect.element(deleteButton).toHaveClass('btn-danger', 'btn')
await expect.element(deleteButton).not.toHaveClass('btn-link')
await expect.element(deleteButton).not.toHaveClass(/link/)

// ⚠️ 正则表达式匹配单个类，而不是整个类列表
await expect.element(deleteButton).not.toHaveClass(/btn extra/)

// 元素确切拥有一组类（顺序任意）
await expect.element(deleteButton).toHaveClass('btn-danger extra btn', {
  exact: true
})
// 如果它拥有的类多于预期，将会失败
await expect.element(deleteButton).not.toHaveClass('btn-danger extra', {
  exact: true
})

await expect.element(noClasses).not.toHaveClass()
```

## toHaveFocus

```ts
function toHaveFocus(): Promise<void>
```

这允许你断言一个元素是否具有焦点。

```html
<div><input type="text" data-testid="element-to-focus" /></div>
```

```ts
const input = page.getByTestId('element-to-focus')
input.element().focus()
await expect.element(input).toHaveFocus()
input.element().blur()
await expect.element(input).not.toHaveFocus()
```

## toHaveFormValues

```ts
function toHaveFormValues(expectedValues: Record<string, unknown>): Promise<void>
```

这允许你检查表单或字段集是否包含每个给定名称的表单控件，并具有指定的值。

::: tip
重要的是要强调，此匹配器只能在 [form](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement) 或 [fieldset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement) 元素上调用。

这使它能够利用 `form` 和 `fieldset` 中的 [`.elements`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements) 属性来可靠地获取其中的所有表单控件。

这也避免了用户提供一个包含多个 `form` 的容器，从而混合不相关甚至可能相互冲突的表单控件的可能性。
:::

此匹配器抽象了根据表单控件类型获取表单控件值的特殊性。例如，`<input>` 元素有一个 `value` 属性，但 `<select>` 元素没有。以下是涵盖的所有情况列表：

- `<input type="number">` 元素将值作为 **数字** 返回，而不是字符串。
- `<input type="checkbox">` 元素：
  - 如果具有给定 `name` 属性的只有一个，它被视为 **布尔值**，如果复选框被选中则返回 `true`，未选中则返回 `false`。
  - 如果有多个具有相同 `name` 属性的复选框，它们都被共同视为单个表单控件，其返回值是一个 **数组**，包含集合中所有选中复选框的值。
- `<input type="radio">` 元素都按 `name` 属性分组，此类组被视为单个表单控件。此表单控件返回的值是一个 **字符串**，对应于组内选中单选按钮的 `value` 属性。
- `<input type="text">` 元素将值作为 **字符串** 返回。这也适用于具有任何其它可能 `type` 属性的 `<input>` 元素，只要上述不同规则中未明确覆盖（例如 `search`、`email`、`date`、`password`、`hidden` 等）。
- 没有 `multiple` 属性的 `<select>` 元素将值作为 **字符串** 返回，对应于选中 `option` 的 `value` 属性，如果没有选中选项则为 `undefined`。
- `<select multiple>` 元素将值作为 **数组** 返回，包含 [选中选项](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions) 的所有值。
- `<textarea>` 元素将其值作为 **字符串** 返回。该值对应于它们的节点内容。

上述规则使得例如从使用单个选择控件切换到使用一组单选按钮变得容易。或者从多选控件切换到使用一组复选框。此匹配器用于比较的表单值结果集将是相同的。

```html
<form data-testid="login-form">
  <input type="text" name="username" value="jane.doe" />
  <input type="password" name="password" value="12345678" />
  <input type="checkbox" name="rememberMe" checked />
  <button type="submit">Sign in</button>
</form>
```

```ts
await expect.element(getByTestId('login-form')).toHaveFormValues({
  username: 'jane.doe',
  rememberMe: true,
})
```

## toHaveStyle

```ts
function toHaveStyle(css: string | Partial<CSSStyleDeclaration>): Promise<void>
```

这允许你检查某个元素是否应用了一些具有特定值的特定 CSS 属性。仅当元素应用了 _所有_ 预期属性时才匹配，而不仅仅是其中一些。

```html
<button
  data-testid="delete-button"
  style="display: none; background-color: red"
>
  Delete item
</button>
```

```ts
const button = getByTestId('delete-button')

await expect.element(button).toHaveStyle('display: none')
await expect.element(button).toHaveStyle({ display: 'none' })
await expect.element(button).toHaveStyle(`
  background-color: red;
  display: none;
`)
await expect.element(button).toHaveStyle({
  backgroundColor: 'red',
  display: 'none',
})
await expect.element(button).not.toHaveStyle(`
  background-color: blue;
  display: none;
`)
await expect.element(button).not.toHaveStyle({
  backgroundColor: 'blue',
  display: 'none',
})
```

这也适用于通过类名应用于元素的规则，这些规则在文档中当前活动的样式表中定义。通常的 CSS 优先级规则适用。

## toHaveTextContent

```ts
function toHaveTextContent(
  text: string | RegExp,
  options?: { normalizeWhitespace: boolean }
): Promise<void>
```

这允许你检查给定节点是否具有文本内容。这支持元素，也支持文本节点和片段。

当传入 `string` 参数时，它将对节点内容执行部分区分大小写的匹配。

要执行不区分大小写的匹配，你可以使用带有 `/i` 修饰符的 `RegExp`。

如果你想匹配全部内容，可以使用 `RegExp` 来实现。

```html
<span data-testid="text-content">Text Content</span>
```

```ts
const element = getByTestId('text-content')

await expect.element(element).toHaveTextContent('Content')
// 匹配全部内容
await expect.element(element).toHaveTextContent(/^Text Content$/)
// 使用不区分大小写的匹配
await expect.element(element).toHaveTextContent(/content$/i)
await expect.element(element).not.toHaveTextContent('content')
```

## toHaveValue

```ts
function toHaveValue(value: string | string[] | number | null): Promise<void>
```

这允许你检查给定表单元素是否具有指定的值。它接受 `<input>`、`<select>` 和 `<textarea>` 元素，`<input type="checkbox">` 和 `<input type="radio">` 除外，它们只能使用 [`toBeChecked`](#tobechecked) 或 [`toHaveFormValues`](#tohaveformvalues) 进行有意义的匹配。

它还接受具有 `meter`、`progressbar`、`slider` 或 `spinbutton` 角色的元素，并检查它们的 `aria-valuenow` 属性（作为数字）。

对于所有其他表单元素，值的匹配使用与 [`toHaveFormValues`](#tohaveformvalues) 相同的算法。

```html
<input type="text" value="text" data-testid="input-text" />
<input type="number" value="5" data-testid="input-number" />
<input type="text" data-testid="input-empty" />
<select multiple data-testid="select-number">
  <option value="first">First Value</option>
  <option value="second" selected>Second Value</option>
  <option value="third" selected>Third Value</option>
</select>
```

```ts
const textInput = getByTestId('input-text')
const numberInput = getByTestId('input-number')
const emptyInput = getByTestId('input-empty')
const selectInput = getByTestId('select-number')

await expect.element(textInput).toHaveValue('text')
await expect.element(numberInput).toHaveValue(5)
await expect.element(emptyInput).not.toHaveValue()
await expect.element(selectInput).toHaveValue(['second', 'third'])
```

## toHaveDisplayValue

```typescript
function toHaveDisplayValue(
  value: string | RegExp | (string | RegExp)[]
): Promise<void>
```

这允许你检查给定表单元素是否具有指定的显示值（最终用户将看到的值）。它接受 `<input>`、`<select>` 和 `<textarea>` 元素，`<input type="checkbox">` 和 `<input type="radio">` 除外，它们只能使用 [`toBeChecked`](#tobechecked) 或 [`toHaveFormValues`](#tohaveformvalues) 进行有意义的匹配。

```html
<label for="input-example">First name</label>
<input type="text" id="input-example" value="Luca" />

<label for="textarea-example">Description</label>
<textarea id="textarea-example">An example description here.</textarea>

<label for="single-select-example">Fruit</label>
<select id="single-select-example">
  <option value="">Select a fruit...</option>
  <option value="banana">Banana</option>
  <option value="ananas">Ananas</option>
  <option value="avocado">Avocado</option>
</select>

<label for="multiple-select-example">Fruits</label>
<select id="multiple-select-example" multiple>
  <option value="">Select a fruit...</option>
  <option value="banana" selected>Banana</option>
  <option value="ananas">Ananas</option>
  <option value="avocado" selected>Avocado</option>
</select>
```

```ts
const input = page.getByLabelText('First name')
const textarea = page.getByLabelText('Description')
const selectSingle = page.getByLabelText('Fruit')
const selectMultiple = page.getByLabelText('Fruits')

await expect.element(input).toHaveDisplayValue('Luca')
await expect.element(input).toHaveDisplayValue(/Luc/)
await expect.element(textarea).toHaveDisplayValue('An example description here.')
await expect.element(textarea).toHaveDisplayValue(/example/)
await expect.element(selectSingle).toHaveDisplayValue('Select a fruit...')
await expect.element(selectSingle).toHaveDisplayValue(/Select/)
await expect.element(selectMultiple).toHaveDisplayValue([/Avocado/, 'Banana'])
```

## toBeChecked

```ts
function toBeChecked(): Promise<void>
```

这允许你检查给定元素是否被选中。它接受类型为 `checkbox` 或 `radio` 的 `input`，以及具有 `checkbox`、`radio` 或 `switch` 角色且具有有效 `"true"` 或 `"false"` `aria-checked` 属性的元素。

```html
<input type="checkbox" checked data-testid="input-checkbox-checked" />
<input type="checkbox" data-testid="input-checkbox-unchecked" />
<div role="checkbox" aria-checked="true" data-testid="aria-checkbox-checked" />
<div
  role="checkbox"
  aria-checked="false"
  data-testid="aria-checkbox-unchecked"
/>

<input type="radio" checked value="foo" data-testid="input-radio-checked" />
<input type="radio" value="foo" data-testid="input-radio-unchecked" />
<div role="radio" aria-checked="true" data-testid="aria-radio-checked" />
<div role="radio" aria-checked="false" data-testid="aria-radio-unchecked" />
<div role="switch" aria-checked="true" data-testid="aria-switch-checked" />
<div role="switch" aria-checked="false" data-testid="aria-switch-unchecked" />
```

```ts
const inputCheckboxChecked = getByTestId('input-checkbox-checked')
const inputCheckboxUnchecked = getByTestId('input-checkbox-unchecked')
const ariaCheckboxChecked = getByTestId('aria-checkbox-checked')
const ariaCheckboxUnchecked = getByTestId('aria-checkbox-unchecked')
await expect.element(inputCheckboxChecked).toBeChecked()
await expect.element(inputCheckboxUnchecked).not.toBeChecked()
await expect.element(ariaCheckboxChecked).toBeChecked()
await expect.element(ariaCheckboxUnchecked).not.toBeChecked()

const inputRadioChecked = getByTestId('input-radio-checked')
const inputRadioUnchecked = getByTestId('input-radio-unchecked')
const ariaRadioChecked = getByTestId('aria-radio-checked')
const ariaRadioUnchecked = getByTestId('aria-radio-unchecked')
await expect.element(inputRadioChecked).toBeChecked()
await expect.element(inputRadioUnchecked).not.toBeChecked()
await expect.element(ariaRadioChecked).toBeChecked()
await expect.element(ariaRadioUnchecked).not.toBeChecked()

const ariaSwitchChecked = getByTestId('aria-switch-checked')
const ariaSwitchUnchecked = getByTestId('aria-switch-unchecked')
await expect.element(ariaSwitchChecked).toBeChecked()
await expect.element(ariaSwitchUnchecked).not.toBeChecked()
```

## toBePartiallyChecked

```typescript
function toBePartiallyChecked(): Promise<void>
```

这允许你检查给定元素是否处于部分选中状态。它接受类型为 `checkbox` 的 `input` 元素，以及具有 `role` 为 `checkbox` 且 `aria-checked="mixed"` 的元素，或者 `indeterminate` 设置为 `true` 的 `checkbox` 类型 `input`。

```html
<input type="checkbox" aria-checked="mixed" data-testid="aria-checkbox-mixed" />
<input type="checkbox" checked data-testid="input-checkbox-checked" />
<input type="checkbox" data-testid="input-checkbox-unchecked" />
<div role="checkbox" aria-checked="true" data-testid="aria-checkbox-checked" />
<div
  role="checkbox"
  aria-checked="false"
  data-testid="aria-checkbox-unchecked"
/>
<input type="checkbox" data-testid="input-checkbox-indeterminate" />
```

```ts
const ariaCheckboxMixed = getByTestId('aria-checkbox-mixed')
const inputCheckboxChecked = getByTestId('input-checkbox-checked')
const inputCheckboxUnchecked = getByTestId('input-checkbox-unchecked')
const ariaCheckboxChecked = getByTestId('aria-checkbox-checked')
const ariaCheckboxUnchecked = getByTestId('aria-checkbox-unchecked')
const inputCheckboxIndeterminate = getByTestId('input-checkbox-indeterminate')

await expect.element(ariaCheckboxMixed).toBePartiallyChecked()
await expect.element(inputCheckboxChecked).not.toBePartiallyChecked()
await expect.element(inputCheckboxUnchecked).not.toBePartiallyChecked()
await expect.element(ariaCheckboxChecked).not.toBePartiallyChecked()
await expect.element(ariaCheckboxUnchecked).not.toBePartiallyChecked()

inputCheckboxIndeterminate.element().indeterminate = true
await expect.element(inputCheckboxIndeterminate).toBePartiallyChecked()
```

## toHaveRole

```ts
function toHaveRole(role: ARIARole): Promise<void>
```

这允许你断言元素具有预期的 [role](https://www.w3.org/TR/html-aria/#docconformance)。

这在你已经通过角色以外的某些查询访问了元素，并希望对其可访问性进行额外断言的情况下很有用。

角色可以匹配显式角色（通过 `role` 属性），或通过 [隐式 ARIA 语义](https://www.w3.org/TR/html-aria/#docconformance) 匹配的隐式角色。

```html
<button data-testid="button">Continue</button>
<div role="button" data-testid="button-explicit">Continue</button>
<button role="switch button" data-testid="button-explicit-multiple">Continue</button>
<a href="/about" data-testid="link">About</a>
<a data-testid="link-invalid">Invalid link<a/>
```

```ts
await expect.element(getByTestId('button')).toHaveRole('button')
await expect.element(getByTestId('button-explicit')).toHaveRole('button')
await expect.element(getByTestId('button-explicit-multiple')).toHaveRole('button')
await expect.element(getByTestId('button-explicit-multiple')).toHaveRole('switch')
await expect.element(getByTestId('link')).toHaveRole('link')
await expect.element(getByTestId('link-invalid')).not.toHaveRole('link')
await expect.element(getByTestId('link-invalid')).toHaveRole('generic')
```

::: warning
角色是通过字符串相等性字面匹配的，不会从 ARIA 角色层次结构继承。因此，查询超类角色（如 `checkbox`）不会包含具有子类角色（如 `switch`）的元素。

另请注意，与 `testing-library` 不同，Vitest 会忽略所有自定义角色，只保留第一个有效角色，遵循 Playwright 的行为：

```jsx
<div data-testid="switch" role="switch alert"></div>

await expect.element(getByTestId('switch')).toHaveRole('switch') // ✅
await expect.element(getByTestId('switch')).toHaveRole('alert') // ❌
```
:::

## toHaveSelection

```ts
function toHaveSelection(selection?: string): Promise<void>
```

这允许断言元素具有 [文本选中](https://developer.mozilla.org/en-US/docs/Web/API/Selection)。

这对于检查元素内是否选中了文本或部分文本很有用。元素可以是文本类型的 input、textarea，或任何包含文本的其他元素，如段落、span、div 等。

::: warning
预期的选中内容是一个字符串，它不允许检查选中范围索引。
:::

```html
<div>
  <input type="text" value="text selected text" data-testid="text" />
  <textarea data-testid="textarea">text selected text</textarea>
  <p data-testid="prev">prev</p>
  <p data-testid="parent">
    text <span data-testid="child">selected</span> text
  </p>
  <p data-testid="next">next</p>
</div>
```

```ts
getByTestId('text').element().setSelectionRange(5, 13)
await expect.element(getByTestId('text')).toHaveSelection('selected')

getByTestId('textarea').element().setSelectionRange(0, 5)
await expect.element('textarea').toHaveSelection('text ')

const selection = document.getSelection()
const range = document.createRange()
selection.removeAllRanges()
selection.empty()
selection.addRange(range)

// selection of child applies to the parent as well
range.selectNodeContents(getByTestId('child').element())
await expect.element(getByTestId('child')).toHaveSelection('selected')
await expect.element(getByTestId('parent')).toHaveSelection('selected')

// selection that applies from prev all, parent text before child, and part child.
range.setStart(getByTestId('prev').element(), 0)
range.setEnd(getByTestId('child').element().childNodes[0], 3)
await expect.element(queryByTestId('prev')).toHaveSelection('prev')
await expect.element(queryByTestId('child')).toHaveSelection('sel')
await expect.element(queryByTestId('parent')).toHaveSelection('text sel')
await expect.element(queryByTestId('next')).not.toHaveSelection()

// selection that applies from part child, parent text after child and part next.
range.setStart(getByTestId('child').element().childNodes[0], 3)
range.setEnd(getByTestId('next').element().childNodes[0], 2)
await expect.element(queryByTestId('child')).toHaveSelection('ected')
await expect.element(queryByTestId('parent')).toHaveSelection('ected text')
await expect.element(queryByTestId('prev')).not.toHaveSelection()
await expect.element(queryByTestId('next')).toHaveSelection('ne')
```

## toMatchScreenshot <Badge type="warning">实验性</Badge> {#tomatchscreenshot}

```ts
function toMatchScreenshot(
  options?: ScreenshotMatcherOptions,
): Promise<void>
function toMatchScreenshot(
  name?: string,
  options?: ScreenshotMatcherOptions,
): Promise<void>
```

::: tip
`toMatchScreenshot` 断言可以在你的 [Vitest 配置](/config/browser/expect#tomatchscreenshot) 中进行全局配置。
:::

此断言允许你通过比较元素或页面的截图与存储的参考图像来执行视觉回归测试。

当检测到的差异超出配置的阈值时，测试将失败。为了帮助识别变化，该断言会生成：

- 测试期间捕获的实际截图
- 预期的参考截图
- 突出显示差异的差异图像（如果可能）

::: warning 截图稳定性
断言会自动重试截取截图，直到连续两次捕获产生相同的结果。这有助于减少由动画、加载状态或其他动态内容引起的不稳定性。你可以使用 `timeout` 选项控制此行为。

但是，浏览器渲染可能会因以下因素而异：

- 不同的浏览器和浏览器版本
- 操作系统（Windows、macOS、Linux）
- 屏幕分辨率和像素密度
- GPU 驱动程序和硬件加速
- 字体渲染和系统字体

建议阅读 [视觉回归测试指南](/guide/browser/visual-regression-testing) 以有效地实施此测试策略。
:::

::: tip
当截图比较因 **有意更改** 而失败时，你可以通过在监视模式下按 `u` 键，或使用 `-u` 或 `--update` 标志运行测试来更新参考截图。
:::

```html
<button data-testid="button">Fancy Button</button>
```

```ts
// basic usage, auto-generates screenshot name
await expect.element(getByTestId('button')).toMatchScreenshot()

// with custom name
await expect.element(getByTestId('button')).toMatchScreenshot('fancy-button')

// with options
await expect.element(getByTestId('button')).toMatchScreenshot({
  comparatorName: 'pixelmatch',
  comparatorOptions: {
    allowedMismatchedPixelRatio: 0.01,
  },
})

// with both name and options
await expect.element(getByTestId('button')).toMatchScreenshot('fancy-button', {
  comparatorName: 'pixelmatch',
  comparatorOptions: {
    allowedMismatchedPixelRatio: 0.01,
  },
})
```

### 选项

- `comparatorName: "pixelmatch" = "pixelmatch"`

  用于比较图像的算法/库。

  `"pixelmatch"` 是唯一内置的比较器，但你可以通过 [在配置文件中注册它们](/config/browser/expect#browser-expect-tomatchscreenshot-comparators) 来使用自定义比较器。

- `comparatorOptions: object`

  这些选项允许更改比较器的行为。可设置的属性取决于所选的比较器算法。

  Vitest 默认设置了默认值，但它们可以被覆盖。

  - [`"pixelmatch"` 选项](#pixelmatch-comparator-options)

  ::: warning
  **始终显式设置 `comparatorName` 以获得 `comparatorOptions` 的正确类型推断**。

  如果不这样做，TypeScript 将无法知道哪些选项是有效的：

  ```ts
  // ❌ TypeScript 无法推断正确的选项
  await expect.element(button).toMatchScreenshot({
    comparatorOptions: {
      // might error when new comparators are added
      allowedMismatchedPixelRatio: 0.01,
    },
  })

  // ✅ TypeScript 知道这些是 pixelmatch 选项
  await expect.element(button).toMatchScreenshot({
    comparatorName: 'pixelmatch',
    comparatorOptions: {
      allowedMismatchedPixelRatio: 0.01,
    },
  })
  ```
  :::

- `screenshotOptions: object`

  与 [`locator.screenshot()`](/api/browser/locators.html#screenshot) 允许的选项相同，除了：

  - `'base64'`
  - `'path'`
  - `'save'`
  - `'type'`

- `timeout: number = 5_000`

  等待直到找到稳定截图的时间。

  将此值设置为 `0` 将禁用超时，但如果无法确定稳定的截图，进程将不会结束。

#### `"pixelmatch"` 比较器选项

`"pixelmatch"` 比较器在底层使用 [`@blazediff/core`](https://blazediff.dev/docs/core)。使用它时可以使用以下选项：

- `allowedMismatchedPixelRatio: number | undefined = undefined`

  捕获的截图与参考图像之间允许的最大差异像素比例。

  必须是 `0` 到 `1` 之间的值。

  例如，`allowedMismatchedPixelRatio: 0.02` 意味着如果最多 2% 的像素不同，测试将通过，但如果超过 2% 不同，则失败。

- `allowedMismatchedPixels: number | undefined = undefined`

  捕获的截图与存储的参考图像之间允许不同的最大像素数。

  如果设置为 `undefined`，任何非零差异都将导致测试失败。

  例如，`allowedMismatchedPixels: 10` 意味着如果 10 个或更少的像素不同，测试将通过，但如果 11 个或更多不同，则失败。

- `threshold: number = 0.1`

  两张图像中同一像素之间可接受的感知颜色差异。

  值范围从 `0`（严格）到 `1`（非常宽松）。较低的值意味着将检测到微小的差异。

  比较使用 [YIQ 颜色空间](https://en.wikipedia.org/wiki/YIQ)。

- `includeAA: boolean = false`

  如果为 `true`，则禁用抗锯齿像素的检测和忽略。

- `alpha: number = 0.1`

  差异图像中未更改像素的混合级别。

  范围从 `0`（白色）到 `1`（原始亮度）。

- `aaColor: [r: number, g: number, b: number] = [255, 255, 0]`

  差异图像中用于抗锯齿像素的颜色。

- `diffColor: [r: number, g: number, b: number] = [255, 0, 0]`

  差异图像中用于差异像素的颜色。

- `diffColorAlt: [r: number, g: number, b: number] | undefined = undefined`

  可选的替代颜色，用于明暗差异，以帮助显示添加与删除的内容。

  如果未设置，`diffColor` 将用于所有差异。

- `diffMask: boolean = false`

  如果为 `true`，则仅在透明背景上将差异显示为蒙版，而不是将其叠加在原始图像上。

  抗锯齿像素将不会显示（如果检测到）。

::: warning
当同时设置了 `allowedMismatchedPixels` 和 `allowedMismatchedPixelRatio` 时，将使用更严格的值。

例如，如果你允许 100 个像素或 2% 的比例，并且你的图像有 10,000 个像素，则有效限制将是 100 个像素而不是 200 个。
:::
