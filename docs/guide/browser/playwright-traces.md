# Playwright 跟踪

Vitest Browser Mode 支持生成 Playwright 的 [trace 文件](https://playwright.dev/docs/trace-viewer#viewing-remote-traces)。要启用跟踪，你需要在 `test.browser` 配置中设置 [`trace`](/config/browser/trace) 选项。

::: warning
生成 trace 文件仅在使用 [Playwright provider](/config/browser/playwright) 时可用。
:::

::: code-group
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      trace: 'on',
    },
  },
})
```
```bash [CLI]
vitest --browser.trace=on
```
:::

默认情况下，Vitest 会为每个测试生成一个 trace 文件。你也可以通过将 `trace` 设置为 `'on-first-retry'`、`'on-all-retries'` 或 `'retain-on-failure'` 来配置为仅在测试失败时生成 trace。文件将保存在测试文件旁边的 `__traces__` 文件夹中。trace 的名称包含项目名称、测试名称、[`repeats`](/api/test#repeats) 次数和 [`retry`](/api/test#retry) 次数：

```
chromium-my-test-0-0.trace.zip
^^^^^^^^ 项目名称
         ^^^^^^ 测试名称
                ^ 重复次数
                  ^ 重试次数
```

要更改输出目录，你可以在 `test.browser.trace` 配置中设置 `tracesDir` 选项。这样所有 trace 都将存储在同一个目录中，并按测试文件分组。

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      trace: {
        mode: 'on',
        // 路径相对于项目根目录
        tracesDir: './playwright-traces',
      },
    },
  },
})
```

这些 trace 会在 reporter 中作为 [annotations](/guide/test-annotations) 提供。例如，在 HTML reporter 中，你可以在测试详情里找到 trace 文件的链接。

## Trace 标记

你可以添加显式命名标记，让 trace 时间线更容易阅读：

```ts
import { page } from 'vitest/browser'

document.body.innerHTML = `
  <button type="button">登录</button>
`

await page.getByRole('button', { name: '登录' }).mark('登录按钮已渲染')
```

`page.mark(name)` 和 `locator.mark(name)` 都可用。

你也可以使用 `page.mark(name, callback)` 将多个操作分组到一个标记下：

```ts
await page.mark('登录流程', async () => {
  await page.getByRole('textbox', { name: '邮箱' }).fill('john@example.com')
  await page.getByRole('textbox', { name: '密码' }).fill('secret')
  await page.getByRole('button', { name: '登录' }).click()
})
```

你还可以使用 [`vi.defineHelper()`](/api/vi#vi-defineHelper) 封装可复用的辅助函数，这样 trace 条目会指向辅助函数的调用位置，而不是其内部实现：

```ts
import { vi } from 'vitest'
import { page } from 'vitest/browser'

const myRender = vi.defineHelper(async (content: string) => {
  document.body.innerHTML = content
  await page.elementLocator(document.body).mark('渲染辅助函数')
})

test('渲染内容', async () => {
  await myRender('<button>Hello</button>') // trace 指向这一行
})
```

## 预览

要打开 trace 文件，你可以使用 Playwright Trace Viewer。在终端中运行以下命令：

```bash
npx playwright show-trace "path-to-trace-file"
```

这将启动 Trace Viewer 并加载指定的 trace 文件。

或者，你也可以在浏览器中访问 https://trace.playwright.dev 打开 Trace Viewer，并在那里上传 trace 文件。

<img alt="Trace Viewer showing the trace timeline and rendered component" img-light src="/trace-viewer-light.png">
<img alt="Trace Viewer showing the trace timeline and rendered component" img-dark src="/trace-viewer-dark.png">

## 源位置

当你打开 trace 时，你会注意到 Vitest 会将浏览器交互分组，并把它们链接回触发它们的测试中的精确行。这会自动应用于：

- `expect.element(...)` 断言
- 交互式操作，如 `click`、`fill`、`type`、`hover`、`selectOptions`、`upload`、`dragAndDrop`、`tab`、`keyboard`、`wheel` 和截图

在底层，Playwright 仍然会像往常一样记录自己的低级动作事件。Vitest 会用源位置分组对它们进行包装，这样你就可以直接从 trace 时间线跳转到测试中的相关行。

对于未自动覆盖的内容，你可以使用 `page.mark()` 或 `locator.mark()` 来添加自己的 trace 分组——参见上面的 [Trace 标记](#trace-markers)。
