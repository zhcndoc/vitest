---
outline: deep
---

# vitest-browser-vue

社区 [`vitest-browser-vue`](https://npmx.dev/package/vitest-browser-vue) 包在 [浏览器模式](/guide/browser/) 中渲染 [Vue](https://vuejs.org/) 组件。

```ts
import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import Component from './Component.vue'

test('计数器按钮会增加计数', async () => {
  const screen = await render(Component, {
    props: {
      initialCount: 1,
    }
  })

  await screen.getByRole('button', { name: 'Increment' }).click()

  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})
```

::: warning
这个库的灵感来自 [`@testing-library/vue`](https://github.com/testing-library/vue-testing-library)。

如果你之前在测试中使用过 `@testing-library/vue`，你可以继续使用它，但是 `vitest-browser-vue` 包提供了一些 `@testing-library/vue` 所缺乏的、浏览器模式独有的优势：

`vitest-browser-vue` 返回的 API 能与内置的 [定位器](/api/browser/locators)、[用户事件](/api/browser/interactivity) 和 [断言](/api/browser/assertions) 很好地交互：例如，即使元素在断言之间被重新渲染，Vitest 也会自动重试该元素直到断言成功。
:::

该包暴露了两个入口点：`vitest-browser-vue` 和 `vitest-browser-vue/pure`。它们暴露相同的 API，但 `pure` 入口点不会添加一个在下一次测试开始前移除组件的处理程序。

## render

```ts
export function render(
  component: Component,
  options?: ComponentRenderOptions,
): Promise<RenderResult>
```

`render` 函数会记录一个 `vue.render` 追踪标记，可在 [追踪视图](/guide/browser/trace-view) 中看到。

### Options

`render` 函数支持来自 `@vue/test-utils` 的所有 [`mount` 选项](https://test-utils.vuejs.org/api/#mount)（除了 `attachTo` - 请使用 `container` 代替）。除此之外，还有 `container` 和 `baseElement`。

#### container

默认情况下，Vitest 会创建一个 `div`，将其附加到 `document.body`，并在那里渲染你的组件。如果你提供自己的 `HTMLElement` 容器，它不会被自动附加 —— 你需要在 `render` 之前调用 `document.body.appendChild(container)`。

例如，如果你正在对 `tbody` 元素进行单元测试，它不能是 `div` 的子元素。在这种情况下，你可以指定一个 `table` 作为渲染容器。

```js
const table = document.createElement('table')

const { container } = await render(TableBody, {
  props,
  // ⚠️ 在渲染前手动将元素附加到 `body`
  container: document.body.appendChild(table),
})
```

#### baseElement

如果指定了 `container`，则默认为该值，否则默认为 `document.body`。它用作查询的基础元素，以及在使用 `debug()` 时打印的内容。

### 渲染结果

除了文档化的返回值外，`render` 函数还返回相对于 [`baseElement`](#baseelement) 的所有可用 [定位器](/api/browser/locators)，包括 [自定义的](/api/browser/locators#custom-locators)。

```ts
const screen = await render(TableBody, { props })

await screen.getByRole('link', { name: '展开' }).click()
```

#### container

渲染你的 Vue 组件的包含 DOM 节点。这是一个普通的 DOM 节点，所以从技术上讲，你可以调用 `container.querySelector` 等来检查子元素。

:::danger
如果你发现自己使用 `container` 来查询渲染的元素，那么你应该重新考虑！[定位器](/api/browser/locators) 旨在对你测试的组件将要进行的更改更具弹性。避免使用 `container` 来查询元素！
:::

#### baseElement

你的 Vue 组件在 `container` 中渲染的包含 DOM 节点。如果你在 render 的选项中没有指定 `baseElement`，它将默认为 `document.body`。

当你想要测试的组件在容器 `div` 之外渲染某些内容时，这很有用，例如，当你想要对直接在 body 中渲染 HTML 的 portal 组件进行快照测试时。

:::tip
`render` 返回的查询会查找 `baseElement`，所以你可以使用查询来测试你的 portal 组件而无需 `baseElement`。
:::

#### locator

你的 `container` 的 [定位器](/api/browser/locators)。它对于仅限定于你的组件的查询很有用，或者将其传递给其他断言：

```js
import { render } from 'vitest-browser-vue'

const { locator } = await render(NumberDisplay, {
  props: { number: 2 }
})

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
function rerender(props: Partial<Props>): Promise<void>
```

同样会在 [追踪视图](/guide/browser/trace-view) 中记录一个 `vue.rerender` 追踪标记。

最好测试正在执行属性更新的组件，以确保属性被正确更新，从而避免在测试中依赖实现细节。也就是说，如果你更喜欢在测试中更新已渲染组件的属性，此函数可用于更新已渲染组件的属性。

```js
import { render } from 'vitest-browser-vue'

const { rerender } = await render(NumberDisplay, { props: { number: 1 } })

// 使用不同的属性重新渲染相同的组件
await rerender({ number: 2 })
```

#### unmount

```ts
function unmount(): Promise<void>
```

这将导致渲染的组件被卸载。同样会在 [追踪视图](/guide/browser/trace-view) 中记录一个 `vue.unmount` 追踪标记。这对于测试当你的组件从页面移除时会发生什么很有用（例如测试你是否留下了导致内存泄漏的事件处理程序）。

#### emitted

```ts
function emitted<T = unknown>(): Record<string, T[]>
function emitted<T = unknown[]>(eventName: string): undefined | T[]
```

返回组件发出的事件。

::: warning
发出的值是未直接暴露给用户的实现细节，所以最好使用 [定位器](/api/browser/locators) 来测试你的发出值如何改变显示的内容。
:::

## cleanup

```ts
export function cleanup(): void
```

移除所有使用 [`render`](#render) 渲染的组件。

## 扩展查询

要扩展 locator 查询，请参阅 [`"Custom Locators"`](/api/browser/locators#custom-locators)。例如，要使 `render` 返回一个新的自定义 locator，请使用 `locators.extend` API 定义它：

```js {5-7,12}
import { locators } from 'vitest/browser'
import { render } from 'vitest-browser-vue'

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

## 配置

你可以通过将属性赋值给 `config` 导出项来配置 [Vue Test Utils](https://test-utils.vuejs.org/api/#config) 选项（在 `vitest-browser-vue` 和 `vitest-browser-vue/pure` 中均可用）：

```js
import { config } from 'vitest-browser-vue/pure'

config.global.stubs.CustomComponent = {
  template: '<div></div>',
}
```

## 另请参阅

- [Vue Testing Library 文档](https://testing-library.com/docs/vue-testing-library/intro)
