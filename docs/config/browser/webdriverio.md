# 配置 WebdriverIO

::: info Community maintained
WebdriverIO 提供程序（[`@vitest/browser-webdriverio`](https://github.com/vitest-community/vitest-webdriverio)）由 Vitest 社区在 [`vitest-community`](https://github.com/vitest-community) 组织下维护，独立于 Vitest 核心包。请将特定于提供程序的问题报告到其仓库。
:::

要使用 WebdriverIO 运行测试，您需要安装 [`@vitest/browser-webdriverio`](https://npmx.dev/package/@vitest/browser-webdriverio) npm 包，并在配置的 `test.browser.provider` 属性中指定其 `webdriverio` 导出：

```ts [vitest.config.js]
import { webdriverio } from '@vitest/browser-webdriverio'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: webdriverio(),
      instances: [{ browser: 'chrome' }]
    },
  },
})
```

您可以配置 [`remote`](https://webdriver.io/docs/api/modules/#remoteoptions-modifier) 函数接受的所有参数：

```ts{8-12,19-25} [vitest.config.js]
import { webdriverio } from '@vitest/browser-webdriverio'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      // 所有实例之间共享的提供程序选项
      provider: webdriverio({
        capabilities: {
          browserVersion: '82',
        },
      }),
      instances: [
        { browser: 'chrome' },
        {
          browser: 'firefox',
          // 仅覆盖单个实例的选项
          // 这不会与父级选项合并
          provider: webdriverio({
            capabilities: {
              'moz:firefoxOptions': {
                args: ['--disable-gpu'],
              },
            },
          })
        },
      ],
    },
  },
})
```

您可以在 [WebdriverIO 文档](https://webdriver.io/docs/configuration/) 中找到大多数可用选项。请注意，Vitest 将忽略所有测试运行器选项，因为我们只使用 `webdriverio` 的浏览器能力。

::: tip
最有用的选项位于 `capabilities` 对象上。WebdriverIO 允许嵌套能力，但 Vitest 将忽略这些选项，因为我们依赖不同的机制来启动多个浏览器。

请注意，Vitest 会忽略 `capabilities.browserName`；请改用 [`test.browser.instances.browser`](/config/browser/instances#browser)。
:::

## CI 中的有界面 Chrome

Vitest 会在 CI 中自动启用 [`browser.headless`](/config/browser/headless)。
如果您在 Linux CI 运行器上显式将 Chrome 的 `headless` 设置为 `false`，Chrome
仍然需要显示服务器。若没有显示服务器，WebDriverIO 或 ChromeDriver 可能会报出误导性的错误，例如 `session not created: probably user data
directory is already in use`。

当您需要在 GitHub
Actions 或其他 Linux CI 环境中使用有界面 Chrome 时，请通过 `xvfb-run` 运行测试命令：

```bash
xvfb-run npm test
```

或者，在 CI 中保持启用 `browser.headless`，仅在本地调试时使用有界面模式。
