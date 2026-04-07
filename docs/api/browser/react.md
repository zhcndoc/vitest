---
outline: deep
---

# vitest-browser-react

社区 [`vitest-browser-react`](https://npmx.dev/package/vitest-browser-react) 包在 [浏览器模式](/guide/browser/) 中渲染 [React](https://react.dev/) 组件。

```jsx
import { render } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import Component from './Component.jsx'

test('counter button increments the count', async () => {
  const screen = await render(<Component count={1} />)

  await screen.getByRole('button', { name: 'Increment' }).click()

  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})
```

::: warning
该库的灵感来自 [`@testing-library/react`](https://github.com/testing-library/react-testing-library)。

如果你之前曾在测试中使用过 `@testing-library/react`，你可以继续使用它，但是 `vitest-browser-react` 包提供了一些 [浏览器模式](/guide/browser/) 独有的优势，而 `@testing-library/react` 缺乏这些优势：

`vitest-browser-react` 返回的 API 能与内置的 [定位器](/api/browser/locators)、[用户事件](/api/browser/interactivity) 和 [断言](/api/browser/assertions) 很好地交互：例如，Vitest 会自动重试元素直到断言成功，即使它在断言之间被重新渲染。
:::

该包暴露了两个入口点：`vitest-browser-react` 和 `vitest-browser-react/pure`。它们暴露了几乎相同的 API（`pure` 还暴露了 `configure`），但 `pure` 入口点不会添加一个处理器来在下一个测试开始前移除组件。

## render

```ts
export function render(
  ui: React.ReactNode,
  options?: ComponentRenderOptions,
): Promise<RenderResult>
```

`render` 函数会记录一个 `react.render` 追踪标记，可在 [追踪视图](/guide/browser/trace-view) 中看到。

:::warning
请注意，`render` 是异步的，与其他包不同。这是为了正确支持 [`Suspense`](https://react.dev/reference/react/Suspense)。

```tsx
import { render } from 'vitest-browser-react'
const screen = render(<Component />) // [!code --]
const screen = await render(<Component />) // [!code ++]
```
:::

### 选项

#### container

默认情况下，Vitest 会创建一个 `div`，将其追加到 `document.body`，并将你的组件渲染在那里。如果你提供自己的 `HTMLElement` 容器，它不会被自动追加——你需要在 `render` 之前调用 `document.body.appendChild(container)`。

例如，如果你正在对 `tbody` 元素进行单元测试，它不能是 `div` 的子元素。在这种情况下，你可以指定一个 `table` 作为渲染容器。

```jsx
const table = document.createElement('table')

const { container } = await render(<TableBody {...props} />, {
  // ⚠️ 在渲染前手动将元素追加到 `body`
  container: document.body.appendChild(table),
})
```

#### baseElement

如果指定了 `container`，则默认为该值，否则默认为 `document.body`。它用作查询的基元素，也是当你使用 `debug()` 时打印的内容。

#### wrapper

传递一个 React 组件作为 `wrapper` 选项，使其渲染在内层元素周围。这对于为常见数据提供者创建可重用的自定义渲染函数最有用。例如：

```jsx
import React from 'react'
import { render } from 'vitest-browser-react'
import { ThemeProvider } from 'my-ui-lib'
import { TranslationProvider } from 'my-i18n-lib'

function AllTheProviders({ children }) {
  return (
    <ThemeProvider theme="light">
      <TranslationProvider>
        {children}
      </TranslationProvider>
    </ThemeProvider>
  )
}

export function customRender(ui, options) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}
```

### 渲染结果

除了文档化的返回值外，`render` 函数还返回所有可用的 [定位器](/api/browser/locators)，它们相对于 [`baseElement`](#baseelement)，包括 [自定义定位器](/api/browser/locators#custom-locators)。

```tsx
const screen = await render(<TableBody {...props} />)

await screen.getByRole('link', { name: 'Expand' }).click()
```

#### container

你渲染的 React 元素所在的包含 `div` DOM 节点（使用 `ReactDOM.render` 渲染）。这是一个普通的 DOM 节点，所以从技术上讲，你可以调用 `container.querySelector` 等来检查子元素。

:::danger
如果你发现自己使用 `container` 来查询渲染的元素，那么你应该重新考虑！[定位器](/api/browser/locators) 旨在对你测试的组件将要进行的更改更具弹性。避免使用 `container` 来查询元素！
:::

#### baseElement

你的 React 元素在 `container` 中渲染的包含 DOM 节点。如果你在渲染选项中没有指定 `baseElement`，它将默认为 `document.body`。

当你想要测试的组件在容器 `div` 之外渲染某些内容时，这很有用，例如，当你想要快照测试你的 Portal 组件（它直接将 HTML 渲染在 body 中）时。

:::tip
`render` 返回的查询会查找 `baseElement`，所以你可以使用查询来测试你的 Portal 组件，而无需（手动指定） `baseElement`。
:::

#### locator

你 `container` 的 [定位器](/api/browser/locators)。仅将查询限定在你的组件范围内，或将其传递给其他断言很有用：

```jsx
import { render } from 'vitest-browser-react'

const { locator } = await render(<NumberDisplay number={1} />)

await locator.getByRole('button').click()
await expect.element(locator).toHaveTextContent('Hello World')
```

#### debug

```ts
function debug(
  el?: HTMLElement | HTMLElement[] | Locator | Locator[],
  maxLength?: number,
  options?: PrettyDOMOptions,
): void
```

此方法是 `console.log(prettyDOM(baseElement))` 的快捷方式。它会将容器或指定元素的 DOM 内容打印到控制台。

#### rerender

```ts
function rerender(ui: React.ReactNode): Promise<void>
```

同样会在 [追踪视图](/guide/browser/trace-view) 中记录一个 `react.rerender` 追踪标记。

最好测试正在执行 prop 更新的组件，以确保 props 被正确更新，从而避免在测试中依赖实现细节。也就是说，如果你更喜欢在测试中更新已渲染组件的 props，此函数可用于更新已渲染组件的 props。

```jsx
import { render } from 'vitest-browser-react'

const { rerender } = await render(<NumberDisplay number={1} />)

// re-render the same component with different props
await rerender(<NumberDisplay number={2} />)
```

#### unmount

```ts
function unmount(): Promise<void>
```

同样会在 [追踪视图](/guide/browser/trace-view) 中记录一个 `react.unmount` 追踪标记。

这将导致渲染的组件被卸载。这对于测试当你的组件从页面移除时会发生什么很有用（例如测试你是否留下了悬空的事件处理器导致内存泄漏）。

```jsx
import { render } from 'vitest-browser-react'

const { container, unmount } = await render(<Login />)
await unmount()
// your component has been unmounted and now: container.innerHTML === ''
```

#### asFragment

```ts
function asFragment(): DocumentFragment
```

返回你渲染组件的 `DocumentFragment`。如果你需要避免实时绑定并查看组件如何响应事件，这可能很有用。

## cleanup

```ts
export function cleanup(): Promise<void>
```

移除所有通过 [`render`](#render) 渲染的组件。

## renderHook

```ts
export function renderHook<Props, Result>(
  renderCallback: (initialProps?: Props) => Result,
  options: RenderHookOptions<Props>,
): Promise<RenderHookResult<Result, Props>>
```

这是 `render` 的一个便利包装器，带有自定义测试组件。该 API 源于一种流行的测试模式，主要对发布 hooks 的库感兴趣。你应该优先使用 `render`，因为自定义测试组件会产生更具可读性和鲁棒性的测试，因为你想要测试的内容没有隐藏在抽象之后。

```jsx
import { renderHook } from 'vitest-browser-react'

test('returns logged in user', async () => {
  const { result } = await renderHook(() => useLoggedInUser())
  expect(result.current).toEqual({ name: 'Alice' })
})
```

### 选项

`renderHook` 接受与 [`render`](#render) 相同的选项，并增加了 `initialProps`：

它声明了首次调用时传递给渲染回调的 props。如果你调用 `rerender` 时不带 props，这些将不会被传递。

```jsx
import { renderHook } from 'vitest-browser-react'

test('returns logged in user', async () => {
  const { result, rerender } = await renderHook((props = {}) => props, {
    initialProps: { name: 'Alice' },
  })
  expect(result.current).toEqual({ name: 'Alice' })
  await rerender()
  expect(result.current).toEqual({ name: undefined })
})
```

:::warning
当结合使用 `renderHook` 与 `wrapper` 和 `initialProps` 选项时，`initialProps` 不会传递给 `wrapper` 组件。要为 `wrapper` 组件提供 props，请考虑如下解决方案：

```jsx
function createWrapper(Wrapper, props) {
  return function CreatedWrapper({ children }) {
    return <Wrapper {...props}>{children}</Wrapper>
  }
}

// ...

await renderHook(() => {}, {
  wrapper: createWrapper(Wrapper, { value: 'foo' }),
})
```
:::

`renderHook` 返回一些有用的方法和属性：

### 渲染 Hook 结果

#### result

持有渲染回调最近一次提交的返回值：

```jsx
import { useState } from 'react'
import { renderHook } from 'vitest-browser-react'
import { expect } from 'vitest'

const { result } = await renderHook(() => {
  const [name, setName] = useState('')
  React.useEffect(() => {
    setName('Alice')
  }, [])

  return name
})

expect(result.current).toBe('Alice')
```

请注意，值保存在 `result.current` 中。将 result 视为最近一次提交值的 [ref](https://react.dev/learn/referencing-values-with-refs)。

#### rerender {#renderhooks-rerender}

使用新的 props 渲染之前渲染过的渲染回调：

```jsx
import { renderHook } from 'vitest-browser-react'

const { rerender } = await renderHook(({ name = 'Alice' } = {}) => name)

// re-render the same hook with different props
await rerender({ name: 'Bob' })
```

#### unmount {#renderhooks-unmount}

卸载测试 hook。

```jsx
import { renderHook } from 'vitest-browser-react'

const { unmount } = await renderHook(({ name = 'Alice' } = {}) => name)

await unmount()
```

## 扩展查询

要扩展定位器查询，请参阅 [`"自定义定位器"`](/api/browser/locators#custom-locators)。例如，要使 `render` 返回一个新的自定义定位器，请使用 `locators.extend` API 定义它：

```jsx {5-7,12}
import { locators } from 'vitest/browser'
import { render } from 'vitest-browser-react'

locators.extend({
  getByArticleTitle(title) {
    return `[data-title="${title}"]`
  },
})

const screen = await render(<Component />)
await expect.element(
  screen.getByArticleTitle('Hello World')
).toBeVisible()
```

## 配置

你可以使用 `vitest-browser-react/pure` 中的 configure 方法来配置组件是否应该在严格模式下渲染：

```js
import { configure } from 'vitest-browser-react/pure'

configure({
  // 默认禁用
  reactStrictMode: true,
})
```

## 另请参阅

- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro)
