---
title: browser.provider | 配置
outline: deep
---

# browser.provider {#browser-provider}

- **类型:** `BrowserProviderOption`

provider 工厂的返回值。你可以从 `@vitest/browser-<provider-name>` 导入工厂，或者制作你自己的 provider：

```ts{8-10}
import { playwright } from '@vitest/browser-playwright'
import { webdriverio } from '@vitest/browser-webdriverio'
import { preview } from '@vitest/browser-preview'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      provider: webdriverio(),
      provider: preview(),
    },
  },
})
```

要配置 provider 如何初始化浏览器，你可以将选项传递给工厂函数：

```ts{7-13,20-26}
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      // 所有实例之间共享的 provider 选项
      provider: playwright({
        launchOptions: {
          slowMo: 50,
          channel: 'chrome-beta',
        },
        actionTimeout: 5_000,
      }),
      instances: [
        { browser: 'chromium' },
        {
          browser: 'firefox',
          // 仅针对单个实例覆盖选项
          // 这不会与父级选项合并
          provider: playwright({
            launchOptions: {
              firefoxUserPrefs: {
                'browser.startup.homepage': 'https://example.com',
              },
            },
          })
        }
      ],
    },
  },
})
```

## 自定义 Provider <Badge type="danger">高级</Badge>

::: danger 高级 API
自定义 provider API 处于高度实验阶段，可能会在补丁版本之间发生变化。如果你只需要在浏览器中运行测试，请改用 [`browser.instances`](/config/browser/instances) 选项。
:::

```ts
export interface BrowserProvider {
  name: string
  mocker?: BrowserModuleMocker
  readonly initScripts?: string[]
  /**
   * @experimental 选择加入文件并行化
   */
  supportsParallelism: boolean
  getCommandsContext: (sessionId: string) => Record<string, unknown>
  openPage: (sessionId: string, url: string) => Promise<void>
  getCDPSession?: (sessionId: string) => Promise<CDPSession>
  close: () => Awaitable<void>
}
```
