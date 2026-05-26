---
title: browser.locators | 配置
outline: deep
---

# browser.locators

内置 [浏览器定位器](/api/browser/locators) 的选项。

## browser.locators.testIdAttribute

- **类型：** `string`
- **默认值：** `data-testid`

用于通过 `getByTestId` 定位器查找元素的属性。

## browser.locators.exact

- **类型：** `boolean`
- **默认值：** `true`

当设置为 `true` 时，[定位器](/api/browser/locators) 默认会精确匹配文本，要求完整且区分大小写的匹配。单独的定位器调用可以通过各自的 `exact` 选项覆盖此默认值。

```ts
// 当 exact: true（默认）时，这只会精确匹配字符串 "Hello, World"。
// 当 exact: false 时，这会匹配 "Hello, World!"、"Say Hello, World" 等。
const locator = page.getByText('Hello, World', { exact: true })
await locator.click()
```

## browser.locators.errorFormat <Version>5.0.0</Version> {#browser-locators-errorformat}

- **类型：** `'html' | 'aria' | 'all'`
- **默认值：** `'all'`

控制当定位器无法找到元素时 Vitest 打印的内容。Vitest 会打印定位器搜索运行所在的 DOM 子树的信息，或者在页面级定位器中打印 `document.body`。

- `'html'` 使用 [`utils.prettyDOM`](/api/browser/context#prettydom) 将该 DOM 子树以 HTML 形式打印出来。
- `'aria'` 将该 DOM 子树作为 [ARIA 快照](/guide/browser/aria-snapshots) 打印出来，重点关注可访问的角色、名称和状态。
- `'all'` 先打印 ARIA 快照，然后输出 HTML。

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      locators: {
        errorFormat: 'aria',
      },
    },
  },
})
```

例如，`all` 会显示如下错误：

```html
VitestBrowserElementError: Cannot find element with locator: getByRole('button', { name: 'Save' })

ARIA tree:
- main:
  - heading "Settings" [level=1]
  - button "Cancel"

HTML:
<body>
  <main>
    <h1>
      Settings
    </h1>
    <button>
      Cancel
    </button>
  </main>
</body>
```
