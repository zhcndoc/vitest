# 配置 Preview

::: warning
`preview` 提供者的主要功能是在真实的浏览器环境中显示测试。但是，它不支持高级浏览器自动化功能，如多浏览器实例或无头模式。对于更复杂的场景，请考虑使用 [Playwright](/config/browser/playwright) 或 [WebdriverIO](/config/browser/webdriverio)。
:::

要在真实浏览器中查看测试运行，你需要安装 [`@vitest/browser-preview`](https://npmx.dev/package/@vitest/browser-preview) npm 包，并在配置的 `test.browser.provider` 属性中指定其 `preview` 导出：

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

这将使用你的默认浏览器打开一个新的浏览器窗口来运行测试。你可以通过设置 `instances` 数组中的 `browser` 属性来配置使用哪个浏览器。Vitest 会尝试自动打开该浏览器，但在某些环境中可能无法工作。在这种情况下，你可以在想要的浏览器中手动打开提供的 URL。

## 与其他提供者的区别

与其他提供者（如 [Playwright](/config/browser/playwright) 或 [WebdriverIO](/config/browser/webdriverio)）相比，preview 提供者有一些限制：

- 它不支持无头模式；浏览器窗口将始终可见。
- 它不支持同一浏览器的多个实例；每个实例必须使用不同的浏览器。
- 它不支持高级浏览器功能或选项；你只能指定浏览器名称。
- 它不支持 CDP (Chrome DevTools Protocol) 命令或其他低级浏览器交互。与 Playwright 或 WebdriverIO 不同，[`userEvent`](/api/browser/interactivity) API 只是从 [`@testing-library/user-event`](https://npmx.dev/package/@testing-library/user-event) 重新导出的，并没有与浏览器进行任何特殊集成。
