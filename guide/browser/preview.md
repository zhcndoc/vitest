# Configuring Preview

::: warning
The `preview` provider's main functionality is to show tests in a real browser environment. However, it does not support advanced browser automation features like multiple browser instances or headless mode. For more complex scenarios, consider using [Playwright](/guide/browser/playwright) or [WebdriverIO](/guide/browser/webdriverio).
:::

To see your tests running in a real browser, you need to install the [`@vitest/browser-preview`](https://www.npmjs.com/package/@vitest/browser-preview) npm package and specify its `preview` export in the `test.browser.provider` property of your config:

```ts [vitest.config.js]
import { preview } from '@vitest/browser-preview'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: preview(),
      instances: [{ browser: 'chromium' }]
    },
  },
})
```

This will open a new browser window using your default browser to run the tests. You can configure which browser to use by setting the `browser` property in the `instances` array. Vitest will try to open that browser automatically, but it might not work in some environments. In that case, you can manually open the provided URL in your desired browser.

## 与其他服务商的差异

与 [Playwright](/guide/browser/playwright) 或 [WebdriverIO](/guide/browser/webdriverio) 等其他 Providers 相比，预览服务存在一些限制：

- 它不支持无头模式; 浏览器窗口始终可见.
- 它不支持同一浏览器的多个实例; 每个实例必须使用不同的浏览器.
- 它不支持高级浏览器功能或选项; 你只能指定浏览器名称.
- 它不支持 CDP（Chrome DevTools 协议）命令或其他低层浏览器交互. 与 Playwright 或 WebdriverIO 不同, [`userEvent`](/guide/browser/interactivity-api) API 只是从 [`@testing-library/user-event`](https://www.npmjs.com/package/@testing-library/user-event) 重新导出, 没有与浏览器的特殊集成.
