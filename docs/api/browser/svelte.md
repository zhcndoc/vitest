---
outline: deep
---

# vitest-browser-svelte

社区 [`vitest-browser-svelte`](https://npmx.dev/package/vitest-browser-svelte) 包在 [浏览器模式](/guide/browser/) 中渲染 [Svelte](https://svelte.dev/) 组件。

```ts
import { render } from 'vitest-browser-svelte'
import { expect, test } from 'vitest'
import Component from './Component.svelte'

test('counter button increments the count', async () => {
  const screen = await render(Component, {
    initialCount: 1,
  })

  await screen.getByRole('button', { name: 'Increment' }).click()

  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})
```

::: warning
这个库的灵感来源于 [`@testing-library/svelte`](https://github.com/testing-library/svelte-testing-library)。

如果你之前曾在测试中使用过 `@testing-library/svelte`，你可以继续使用它，但是 `vitest-browser-svelte` 包提供了一些 `@testing-library/svelte` 所缺乏的、浏览器模式独有的优势：

`vitest-browser-svelte` 返回的 API 能与内置的 [定位器](/api/browser/locators)、[用户事件](/api/browser/interactivity) 和 [断言](/api/browser/assertions) 很好地交互：例如，即使在断言之间组件被重新渲染，Vitest 也会自动重试元素直到断言成功。
:::

该包暴露了两个入口点：`vitest-browser-svelte` 和 `vitest-browser-svelte/pure`。它们暴露相同的 API，但 `pure` 入口点不会添加一个处理器来在下一个测试开始前移除组件。

## render

```ts
export function render<C extends Component>(
  Component: ComponentImport<C>,
  options?: ComponentOptions<C>,
  renderOptions?: SetupOptions
): Promise<RenderResult<C>>
```

`render` 函数记录一个 `svelte.render` 追踪标记，可在 [追踪视图](/guide/browser/trace-view) 中看到。

### 选项

`render` 函数支持你可以传递给 [`mount`](https://svelte.dev/docs/svelte/imperative-component-api#mount) 的选项，或者直接传递 props：

```ts
const screen = await render(Component, {
  props: { // [!code --]
    initialCount: 1, // [!code --]
  }, // [!code --]
  initialCount: 1, // [!code ++]
})
```

#### props

组件 props。

#### target

默认情况下，Vitest 会创建一个 `div`，将其附加到 `document.body`，并在那里渲染你的组件。如果你提供自己的 `HTMLElement` 容器，它不会被自动附加——你需要在 `render` 之前调用 `document.body.appendChild(container)`。

例如，如果你正在单元测试一个 `tbody` 元素，它不能是 `div` 的子元素。在这种情况下，你可以指定一个 `table` 作为渲染容器。

```ts
const table = document.createElement('table')

const screen = await render(TableBody, {
  props,
  // ⚠️ 在渲染前手动将元素附加到 `body`
  target: document.body.appendChild(table),
})
```

#### baseElement

这可以作为第三个参数传递。你应该很少，如果有的话，需要使用这个选项。

如果指定了 `target`，则默认为该值，否则默认为 `document.body`。它用作查询的基元素，以及当你使用 `debug()` 时打印的内容。

### 渲染结果

除了文档化的返回值外，`render` 函数还返回所有相对于 [`baseElement`](#baseelement) 可用的 [定位器](/api/browser/locators)，包括 [自定义的](/api/browser/locators#custom-locators)。

```ts
const screen = await render(TableBody, props)

await screen.getByRole('link', { name: 'Expand' }).click()
```

#### container

渲染你的 Svelte 组件的包含 DOM 节点。这是一个普通的 DOM 节点，所以从技术上讲你可以调用 `container.querySelector` 等来检查子元素。

:::danger
如果你发现自己使用 `container` 来查询渲染的元素，那么你应该重新考虑！[定位器](/api/browser/locators) 旨在对你正在测试的组件将要进行的更改更具弹性。避免使用 `container` 来查询元素！
:::

#### component

已挂载的 Svelte 组件实例。如果需要，你可以使用它来访问组件方法和属性。

```ts
const { component } = await render(Counter, {
  initialCount: 0,
})

// 如果需要访问组件导出
```

#### 定位器

你的 `container` 的 [定位器](/api/browser/locators)。它有助于仅范围内使用你的组件的查询，或将其传递给其他断言：

```ts
import { render } from 'vitest-browser-svelte'

const { locator } = await render(NumberDisplay, {
  number: 2,
})

await locator.getByRole('button').click()
await expect.element(locator).toHaveTextContent('Hello World')
```

#### debug

```ts
function debug(
  el?: HTMLElement | HTMLElement[] | Locator | Locator[],
): void
```

此方法是 `console.log(prettyDOM(baseElement))` 的快捷方式。它会将容器或指定元素的 DOM 内容打印到控制台。

#### rerender

```ts
function rerender(props: Partial<ComponentProps<T>>): Promise<void>
```

更新组件的 props 并等待 Svelte 应用更改。使用此方法测试你的组件如何响应 prop 更改。还会在 [追踪视图](/guide/browser/trace-view) 中记录一个 `svelte.rerender` 追踪标记。

```ts
import { render } from 'vitest-browser-svelte'

const { rerender } = await render(NumberDisplay, {
  number: 1,
})

// 使用不同的 props 重新渲染相同的组件
await rerender({ number: 2 })
```

#### unmount

```ts
function unmount(): Promise<void>
```

卸载并销毁 Svelte 组件。还会在 [追踪视图](/guide/browser/trace-view) 中记录一个 `svelte.unmount` 追踪标记。这对于测试当你的组件从页面移除时会发生什么很有用（例如测试你是否没有留下导致内存泄漏的事件处理程序）。

```ts
import { render } from 'vitest-browser-svelte'

const { container, unmount } = await render(Component)
await unmount()
// 你的组件已被卸载，现在：container.innerHTML === ''
```

## cleanup

```ts
export function cleanup(): void
```

移除所有通过 [`render`](#render) 渲染的组件。

## 扩展查询

要扩展 locator 查询，请参阅 [`"自定义定位器"`](/api/browser/locators#custom-locators)。例如，要使 `render` 返回一个新的自定义 locator，请使用 `locators.extend` API 定义它：

```ts {5-7,12}
import { locators } from 'vitest/browser'
import { render } from 'vitest-browser-svelte'

locators.extend({
  getByArticleTitle(title) {
    return `[data-title="${title}"]`
  },
})

const screen = await render(Component)
await expect.element(
  screen.getByArticleTitle('Hello World')
).toBeVisible()
```

## 片段

对于简单的片段，你可以使用包装组件和“虚拟”子元素来测试它们。在这种方式测试插槽时，设置 `data-testid` 属性可能会有所帮助。

::: code-group
```ts [basic.test.js]
import { render } from 'vitest-browser-svelte'
import { expect, test } from 'vitest'

import SubjectTest from './basic-snippet.test.svelte'

test('basic snippet', async () => {
  const screen = await render(SubjectTest)

  const heading = screen.getByRole('heading')
  const child = heading.getByTestId('child')

  await expect.element(child).toBeInTheDocument()
})
```
```svelte [basic-snippet.svelte]
<script>
  let { children } = $props()
</script>

<h1>
  {@render children?.()}
</h1>
```
```svelte [basic-snippet.test.svelte]
<script>
  import Subject from './basic-snippet.svelte'
</script>

<Subject>
  <span data-testid="child"></span>
</Subject>
```
:::

对于更复杂的片段，例如你想检查参数的情况，你可以使用 Svelte 的 [`createRawSnippet`](https://svelte.dev/docs/svelte/svelte#createRawSnippet) API。

::: code-group
```js [complex-snippet.test.js]
import { render } from 'vitest-browser-svelte'
import { createRawSnippet } from 'svelte'
import { expect, test } from 'vitest'

import Subject from './complex-snippet.svelte'

test('renders greeting in message snippet', async () => {
  const screen = await render(Subject, {
    name: 'Alice',
    message: createRawSnippet(greeting => ({
      render: () => `<span data-testid="message">${greeting()}</span>`,
    })),
  })

  const message = screen.getByTestId('message')

  await expect.element(message).toHaveTextContent('Hello, Alice!')
})
```
```svelte [complex-snippet.svelte]
<script>
  let { name, message } = $props()

  const greeting = $derived(`Hello, ${name}!`)
</script>

<p>
  {@render message?.(greeting)}
</p>
```
:::

## 另请参阅

- [Svelte Testing Library 文档](https://testing-library.com/docs/svelte-testing-library/intro)
- [Svelte Testing Library 示例](https://github.com/testing-library/svelte-testing-library/tree/main/examples)
