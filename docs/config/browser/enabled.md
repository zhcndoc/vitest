---
title: browser.enabled | 配置
---

# browser.enabled

- **类型:** `boolean`
- **默认值:** `false`
- **CLI:** `--browser`, `--browser.enabled=false`

启用此标志会使 Vitest 默认在 [浏览器](/guide/browser/) 中运行所有测试。如果你通过 CLI 配置其他浏览器选项，可以配合使用 `--browser.enabled` 而不是 `--browser`：

```sh
vitest --browser.enabled --browser.headless
```

::: warning
要启用 [浏览器模式](/guide/browser/)，你还必须指定 [`provider`](/config/browser/provider) 和至少一个 [`instance`](/config/browser/instances)。可用的提供者：

- [playwright](/config/browser/playwright)
- [webdriverio](/config/browser/webdriverio)
- [preview](/config/browser/preview)
:::

## 示例

```js{7} [vitest.config.js]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
```

如果你使用 TypeScript，`instances` 中的 `browser` 字段会根据你的提供者提供自动补全。
