---
title: 浏览器模式 | 指南
outline: deep
---

# 浏览器模式 {#browser-mode}

本页提供有关 Vitest API 中浏览器模式功能的信息，该功能允许你原生地在浏览器中运行测试，从而可以访问诸如 window 和 document 等浏览器全局对象。

::: tip
如果你正在寻找 `expect`、`vi` 或任何通用 API（如测试项目或类型测试）的文档，请参阅 ["入门" 指南](/guide/)。
:::

<img alt="Vitest 界面" img-light src="/ui-browser-1-light.png">
<img alt="Vitest 界面" img-dark src="/ui-browser-1-dark.png">

## 安装

为了更轻松地设置，你可以使用 `vitest init browser` 命令来安装所需的依赖项并创建浏览器配置。

::: code-group
```bash [npm]
npx vitest init browser
```
```bash [yarn]
yarn exec vitest init browser
```
```bash [pnpm]
pnpx vitest init browser
```
```bash [bun]
bunx vitest init browser
```
:::

### 手动安装

你也可以手动安装包。Vitest 始终需要定义一个提供者。你可以选择 [`preview`](/config/browser/preview)、[`playwright`](/config/browser/playwright) 或 [`webdriverio`](/config/browser/webdriverio)。

如果你只想预览测试的样子，可以使用 `preview` 提供者：

::: code-group
```bash [npm]
npm install -D vitest @vitest/browser-preview
```
```bash [yarn]
yarn add -D vitest @vitest/browser-preview
```
```bash [pnpm]
pnpm add -D vitest @vitest/browser-preview
```
```bash [bun]
bun add -D vitest @vitest/browser-preview
```
:::

::: warning
但是，要在 CI 中运行测试，你需要安装 [`playwright`](https://npmx.dev/package/playwright) 或 [`webdriverio`](https://npmx.dev/package/webdriverio)。我们也建议切换到其中任何一个来进行本地测试，而不是使用默认的 `preview` 提供者，因为它依赖于模拟事件而不是使用 Chrome DevTools Protocol。

如果你还没有使用这些工具之一，我们建议从 Playwright 开始，因为它支持并行执行，这会使你的测试运行得更快。

::: tabs key:provider
== Playwright
[Playwright](https://npmx.dev/package/playwright) 是一个用于 Web 测试和自动化的框架。

::: code-group
```bash [npm]
npm install -D vitest @vitest/browser-playwright
```
```bash [yarn]
yarn add -D vitest @vitest/browser-playwright
```
```bash [pnpm]
pnpm add -D vitest @vitest/browser-playwright
```
```bash [bun]
bun add -D vitest @vitest/browser-playwright
```
== WebdriverIO

[WebdriverIO](https://npmx.dev/package/webdriverio) 允许你使用 WebDriver 协议在本地运行测试。

::: code-group
```bash [npm]
npm install -D vitest @vitest/browser-webdriverio
```
```bash [yarn]
yarn add -D vitest @vitest/browser-webdriverio
```
```bash [pnpm]
pnpm add -D vitest @vitest/browser-webdriverio
```
```bash [bun]
bun add -D vitest @vitest/browser-webdriverio
```
:::

## 配置

要在 Vitest 配置中激活浏览器模式，请在你的 Vitest 配置文件中将 `browser.enabled` 字段设置为 `true`。以下是使用 browser 字段的配置示例：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      // 至少需要一个实例
      instances: [
        { browser: 'chromium' },
      ],
    },
  }
})
```

::: info
Vitest 会分配端口 `63315` 以避免与开发服务器冲突，从而允许你并行运行两者。你可以通过 [`browser.api`](/config/browser/api) 选项更改这一点。
:::

如果你之前没有使用过 Vite，请确保已安装并在配置中指定了你的框架插件。某些框架可能需要额外配置才能工作 - 请查看它们的 Vite 相关文档以确保无误。

::: code-group
```ts [react]
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    }
  }
})
```
```ts [vue]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    }
  }
})
```
```ts [svelte]
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [svelte()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    }
  }
})
```
```ts [solid]
import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    }
  }
})
```
```ts [marko]
import { defineConfig } from 'vitest/config'
import marko from '@marko/vite'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [marko()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    }
  }
})
```
```ts [qwik]
import { defineConfig } from 'vitest/config'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { playwright } from '@vitest/browser-playwright'

// 可选，在 SSR 模式下运行测试
import { testSSR } from 'vitest-browser-qwik/ssr-plugin'

export default defineConfig({
  plugins: [testSSR(), qwikVite()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
    },
  },
})
```
:::

如果你需要使用基于 Node 的运行器运行某些测试，你可以定义一个 [`projects`](/guide/projects) 选项，为不同的测试策略提供单独的配置：

{#projects-config}

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          // 基于文件的约定示例，
          // 你不必遵循它
          include: [
            'tests/unit/**/*.{test,spec}.ts',
            'tests/**/*.unit.{test,spec}.ts',
          ],
          name: 'unit',
          environment: 'node',
        },
      },
      {
        test: {
          // 基于文件的约定示例，
          // 你不必遵循它
          include: [
            'tests/browser/**/*.{test,spec}.ts',
            'tests/**/*.browser.{test,spec}.ts',
          ],
          name: 'browser',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
    ],
  },
})
```

## 浏览器选项类型

Vitest 中的浏览器选项取决于提供者。如果你传递 `--browser` 但未在配置文件中指定其名称，Vitest 将失败。可用选项：

- `webdriverio` 支持这些浏览器：
  - `firefox`
  - `chrome`
  - `edge`
  - `safari`
- `playwright` 支持这些浏览器：
  - `firefox`
  - `webkit`
  - `chromium`

## 浏览器兼容性

Vitest 使用 [Vite 开发服务器](https://vitejs.dev/guide/#browser-support) 来运行测试，因此我们只支持 [`esbuild.target`](https://vitejs.dev/config/shared-options.html#esbuild) 选项中指定的功能（默认为 `esnext`）。

默认情况下，Vite 针对支持原生 [ES 模块](https://caniuse.com/es6-module)、原生 [ESM 动态导入](https://caniuse.com/es6-module-dynamic-import) 和 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) 的浏览器。除此之外，我们利用 [`BroadcastChannel`](https://caniuse.com/?search=BroadcastChannel) 在 iframe 之间通信：

- Chrome >=87
- Firefox >=78
- Safari >=15.4
- Edge >=88

## 运行测试

当你在浏览器选项中指定浏览器名称时，Vitest 将尝试默认使用 `preview` 运行指定的浏览器，然后在那里运行测试。如果你不想使用 `preview`，可以通过使用 `browser.provider` 选项配置自定义浏览器提供者。

要使用 CLI 指定浏览器，请使用 `--browser` 标志后跟浏览器名称，如下所示：

```sh
npx vitest --browser=chromium
```

或者你可以使用点表示法向 CLI 提供浏览器选项：

```sh
npx vitest --browser.headless
```

::: warning
自 Vitest 3.2 以来，如果你配置中没有 `browser` 选项但指定了 `--browser` 标志，Vitest 将失败，因为它无法假设该配置是用于浏览器测试而不是 Node.js 测试。
:::

默认情况下，Vitest 将自动打开浏览器 UI 进行开发。你的测试将在中心的 iframe 内运行。你可以通过选择首选尺寸、在测试中调用 `page.viewport` 或在 [配置](/config/browser/viewport) 中设置默认值来配置视口。

对于另一种调试模型——它会为每个测试捕获 DOM 快照，而不是显示实时 iframe——请参阅 [Trace View](/guide/browser/trace-view)。

## Headless

无头模式是浏览器模式中的另一个可用选项。在无头模式下，浏览器在没有用户界面的情况下在后台运行，这使得它对于运行自动化测试非常有用。Vitest 中的 headless 选项可以设置为布尔值以启用或禁用无头模式。

使用无头模式时，Vitest 不会自动打开 UI。如果你想继续使用 UI 但让测试无头运行，你可以安装 [`@vitest/ui`](/guide/ui) 包并在运行 Vitest 时传递 `--ui` 标志。

以下是启用无头模式的配置示例：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
    },
  }
})
```

你也可以使用 CLI 中的 `--browser.headless` 标志设置无头模式，如下所示：

```sh
npx vitest --browser.headless
```

在这种情况下，Vitest 将使用 Chrome 浏览器以无头模式运行。

::: warning
默认情况下不提供无头模式。你需要使用 [`playwright`](https://npmx.dev/package/playwright) 或 [`webdriverio`](https://npmx.dev/package/webdriverio) 提供者来启用此功能。
:::

## 示例

默认情况下，使用浏览器模式不需要任何外部包：

```js [example.test.js]
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { render } from './my-render-function.js'

test('properly handles form inputs', async () => {
  render() // 挂载 DOM 元素

  // 断言初始状态。
  await expect.element(page.getByText('Hi, my name is Alice')).toBeInTheDocument()

  // 通过查询关联的 label 获取 input DOM 节点。
  const usernameInput = page.getByLabelText(/username/i)

  // 将名称输入到 input 中。这已经验证了 input
  // 是否填写正确，无需手动检查值。
  await usernameInput.fill('Bob')

  await expect.element(page.getByText('Hi, my name is Bob')).toBeInTheDocument()
})
```

然而，Vitest 还提供了开箱即用的包来渲染几个流行框架的组件：

- [`vitest-browser-vue`](https://github.com/vitest-dev/vitest-browser-vue) 用于渲染 [vue](https://vuejs.org) 组件
- [`vitest-browser-svelte`](https://github.com/vitest-dev/vitest-browser-svelte) 用于渲染 [svelte](https://svelte.dev) 组件
- [`vitest-browser-react`](https://github.com/vitest-dev/vitest-browser-react) 用于渲染 [react](https://react.dev) 组件
- [`vitest-browser-angular`](https://github.com/vitest-community/vitest-browser-angular) 用于渲染 [Angular](https://angular.dev) 组件

其他框架也有社区包可用：

- [`vitest-browser-lit`](https://github.com/EskiMojo14/vitest-browser-lit) 用于渲染 [lit](https://lit.dev) 组件
- [`vitest-browser-preact`](https://github.com/JoviDeCroock/vitest-browser-preact) 用于渲染 [preact](https://preactjs.com) 组件
- [`vitest-browser-qwik`](https://github.com/QwikDev/vitest-browser-qwik) 用于渲染 [qwik](https://qwik.dev) 组件

如果你的框架没有代表，随时可以创建自己的包——它只是框架渲染器和 `page.elementLocator` API 的简单封装。我们会在此页面上添加指向它的链接。确保它的名称以 `vitest-browser-` 开头。

除了渲染组件和定位元素，你还需要进行断言。Vitest fork 了 [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom) 库，以提供广泛的开箱即用的 DOM 断言。请在 [断言 API](/api/browser/assertions) 阅读更多内容。

```ts
import { expect } from 'vitest'
import { page } from 'vitest/browser'
// 元素渲染正确
await expect.element(page.getByText('Hello World')).toBeInTheDocument()
```

Vitest 暴露了一个 [上下文 API](/api/browser/context)，包含一组可能在测试中有用的工具。例如，如果你需要进行交互，比如点击元素或在输入框中输入文本，你可以使用来自 `vitest/browser` 的 `userEvent`。请在 [交互 API](/api/browser/interactivity) 阅读更多内容。

```ts
import { page, userEvent } from 'vitest/browser'
await userEvent.fill(page.getByLabelText(/username/i), 'Alice')
// 或直接使用 locator.fill
await page.getByLabelText(/username/i).fill('Alice')
```

::: code-group
```ts [vue]
import { render } from 'vitest-browser-vue'
import Component from './Component.vue'

test('properly handles v-model', async () => {
  const screen = await render(Component)

  // 断言初始状态。
  await expect.element(screen.getByText('Hi, my name is Alice')).toBeInTheDocument()

  // 通过查询关联的 label 获取 input DOM 节点。
  const usernameInput = screen.getByLabelText(/username/i)

  // 将名称输入到 input 中。这已经验证了 input
  // 是否填写正确，无需手动检查值。
  await usernameInput.fill('Bob')

  await expect.element(screen.getByText('Hi, my name is Bob')).toBeInTheDocument()
})
```
```ts [svelte]
import { render } from 'vitest-browser-svelte'
import { expect, test } from 'vitest'

import Greeter from './greeter.svelte'

test('greeting appears on click', async () => {
  const screen = await render(Greeter, { name: 'World' })

  const button = screen.getByRole('button')
  await button.click()
  const greeting = screen.getByText(/hello world/iu)

  await expect.element(greeting).toBeInTheDocument()
})
```
```tsx [react]
import { render } from 'vitest-browser-react'
import Fetch from './fetch'

test('loads and displays greeting', async () => {
  // 将 React 元素渲染到 DOM 中
  const screen = render(<Fetch url="/greeting" />)

  await screen.getByText('Load Greeting').click()
  // 在找不到元素时抛出错误之前等待
  const heading = screen.getByRole('heading')

  // 断言警报消息正确
  await expect.element(heading).toHaveTextContent('hello there')
  await expect.element(screen.getByRole('button')).toBeDisabled()
})
```
```ts [lit]
import { render } from 'vitest-browser-lit'
import { html } from 'lit'
import './greeter-button'

test('greeting appears on click', async () => {
  const screen = render(html`<greeter-button name="World"></greeter-button>`)

  const button = screen.getByRole('button')
  await button.click()
  const greeting = screen.getByText(/hello world/iu)

  await expect.element(greeting).toBeInTheDocument()
})
```
```tsx [preact]
import { render } from 'vitest-browser-preact'
import { createElement } from 'preact'
import Greeting from '.Greeting'

test('greeting appears on click', async () => {
  const screen = render(<Greeting />)

  const button = screen.getByRole('button')
  await button.click()
  const greeting = screen.getByText(/hello world/iu)

  await expect.element(greeting).toBeInTheDocument()
})
```
```tsx [qwik]
import { render } from 'vitest-browser-qwik'
import Greeting from './greeting'

test('greeting appears on click', async () => {
  // renderSSR 和 renderHook 也可用
  const screen = render(<Greeting />)

  const button = screen.getByRole('button')
  await button.click()
  const greeting = screen.getByText(/hello world/iu)

  await expect.element(greeting).toBeInTheDocument()
})
```
:::

Vitest 并不开箱即用支持所有框架，但你可以使用外部工具来运行这些框架的测试。我们也鼓励社区创建他们自己的 `vitest-browser` 封装——如果你有一个，随时可以将其添加到上面的示例中。

对于不支持的框架，我们推荐使用 `testing-library` 包：

- [`@solidjs/testing-library`](https://testing-library.com/docs/solid-testing-library/intro) 用于渲染 [solid](https://www.solidjs.com) 组件
- [`@marko/testing-library`](https://testing-library.com/docs/marko-testing-library/intro) 用于渲染 [marko](https://markojs.com) 组件

你也可以在 [`browser-examples`](https://github.com/vitest-tests/browser-examples) 仓库中看到更多示例。

::: warning
`testing-library` 提供了一个包 `@testing-library/user-event`。我们不推荐直接使用它，因为它模拟事件而不是实际触发它们——相反，请使用从 `vitest/browser` 导入的 [`userEvent`](/api/browser/interactivity)，它在底层使用 Chrome DevTools Protocol 或 Webdriver（取决于提供商）。
:::

::: code-group
```tsx [solid]
// 基于 @testing-library/solid API
// https://testing-library.com/docs/solid-testing-library/api

import { render } from '@testing-library/solid'

it('uses params', async () => {
  const App = () => (
    <>
      <Route
        path="/ids/:id"
        component={() => (
          <p>
            Id:
            {useParams()?.id}
          </p>
        )}
      />
      <Route path="/" component={() => <p>Start</p>} />
    </>
  )
  const { baseElement } = render(() => <App />, { location: 'ids/1234' })
  const screen = page.elementLocator(baseElement)

  await expect.screen(screen.getByText('Id: 1234')).toBeInTheDocument()
})
```
```ts [marko]
// 基于 @testing-library/marko API
// https://testing-library.com/docs/marko-testing-library/api

import { render, screen } from '@marko/testing-library'
import Greeting from './greeting.marko'

test('renders a message', async () => {
  const { baseElement } = await render(Greeting, { name: 'Marko' })
  const screen = page.elementLocator(baseElement)
  await expect.element(screen.getByText(/Marko/)).toBeInTheDocument()
  expect(container.firstChild).toMatchInlineSnapshot(`
    <h1>Hello, Marko!</h1>
  `)
})
```
:::

## 限制

### 线程阻塞对话框

使用 Vitest 浏览器模式时，重要的是要注意像 `alert` 或 `confirm` 这样的线程阻塞对话框不能原生使用。这是因为它们会阻塞网页，这意味着 Vitest 无法继续与页面通信，导致执行挂起。

在这种情况下，Vitest 为这些 API 提供了带有默认返回值的默认模拟。这确保了即使用户不小心使用了同步弹出网页 API，执行也不会挂起。然而，仍然建议用户模拟这些网页 API 以获得更好的体验。请在 [模拟](/guide/mocking) 阅读更多内容。

### 监听模块导出

浏览器模式使用浏览器的原生 ESM 支持来提供模块。模块命名空间对象是密封的且无法重新配置，这与 Node.js 测试不同，在 Node.js 测试中 Vitest 可以修补 Module Runner。这意味着你不能在导入的对象上调用 `vi.spyOn`：

```ts
import { vi } from 'vitest'
import * as module from './module.js'

vi.spyOn(module, 'method') // ❌ 抛出错误
```

为了绕过这个限制，Vitest 在 `vi.mock('./module.js')` 中支持 `{ spy: true }` 选项。这将自动监听模块中的每个导出，而不会用假的实现替换它们。

```ts
import { vi } from 'vitest'
import * as module from './module.js'

vi.mock('./module.js', { spy: true })

vi.mocked(module.method).mockImplementation(() => {
  // ...
})
```

然而，模拟导出_变量_的唯一方法是导出一个方法来改变内部值：

::: code-group
```js [module.js]
export let MODE = 'test'
export function changeMode(newMode) {
  MODE = newMode
}
```
```ts [module.test.ts]
import { expect } from 'vitest'
import { changeMode, MODE } from './module.js'

changeMode('production')
expect(MODE).toBe('production')
```
:::
