# 配置 Playwright

要使用 playwright 运行测试，你需要安装 [`@vitest/browser-playwright`](https://npmx.dev/package/@vitest/browser-playwright) npm 包，并在配置的 `test.browser.provider` 属性中指定其 `playwright` 导出：

```ts [vitest.config.js]
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
    },
  },
})
```

你可以在顶层调用 `playwright` 时或在实例内部配置 [`launchOptions`](https://playwright.dev/docs/api/class-browsertype#browser-type-launch)、[`connectOptions`](https://playwright.dev/docs/api/class-browsertype#browser-type-connect) 和 [`contextOptions`](https://playwright.dev/docs/api/class-browser#browser-new-context)：

```ts{7-14,21-26} [vitest.config.js]
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      // 所有实例之间共享的提供者选项
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

::: warning
与 Playwright 测试运行器不同，Vitest 打开_单个_页面来运行定义在同一文件中的所有测试。这意味着隔离限制在单个测试文件，而不是每个单独的测试。
:::

## launchOptions

These options are passed directly to the `playwright[browser].launch` command. You can read more about this command and the available parameters in the [Playwright documentation](https://playwright.dev/docs/api/class-browsertype#browser-type-launch).

::: warning
Vitest will ignore the `launch.headless` option. Instead, use [`test.browser.headless`](/config/browser/headless).

Please note that if [`--inspect`](/guide/cli#inspect) is enabled, Vitest will push the debug flag to `launch.args`.
:::

::: tip Enable the new Chromium headless mode
Playwright supports Chromium's [new headless mode](https://playwright.dev/docs/browsers#chromium-new-headless-mode), which uses a real Chrome browser instead of a dedicated headless shell. This provides a more realistic and reliable test execution, and there is no need to install a separate headless Chromium build.

To enable it, set `channel` to `'chromium'` in `launchOptions`:

```ts [vitest.config.ts]
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      headless: true,
      provider: playwright({
        launchOptions: {
          channel: 'chromium',
        },
      }),
      instances: [{ browser: 'chromium' }],
    },
  },
})
```
:::

## connectOptions

这些选项会直接传递给 `playwright[browser].connect` 命令。你可以在 [Playwright 文档](https://playwright.dev/docs/api/class-browsertype#browser-type-connect) 中阅读有关该命令及可用参数的更多信息。

使用 `connectOptions.wsEndpoint` 连接到现有的 Playwright 服务器，而不是在本地启动浏览器。这对于在 Docker、CI 或远程机器上运行浏览器很有用。

::: warning

Vitest 通过 `x-playwright-launch-options` 头将 `launchOptions` 转发给 Playwright 服务器。此方式仅在远程 Playwright 服务器支持该头时才有效，例如使用 `playwright run-server` CLI 时。

:::

::: details 示例：在 Docker 中运行 Playwright 服务器
要在 Docker 容器中运行浏览器（参见 [Playwright Docker 指南](https://playwright.dev/docs/docker#remote-connection)）：

使用 Docker Compose 启动 Playwright 服务器：

```yaml [docker-compose.yml]
services:
  playwright:
    image: mcr.microsoft.com/playwright:v1.61.0-noble
    command: /bin/sh -c "npx -y playwright@1.61.0 run-server --port 6677 --host 0.0.0.0"
    init: true
    ipc: host
    user: pwuser
    ports:
      - '6677:6677'
```

```sh
docker compose up -d
```

然后配置 Vitest 以连接到它。[`exposeNetwork`](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-option-expose-network) 选项可让容器化浏览器访问主机上的 Vitest 开发服务器：

```ts [vitest.config.ts]
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: playwright({
        connectOptions: {
          wsEndpoint: 'ws://127.0.0.1:6677/',
          exposeNetwork: '<loopback>',
        },
      }),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
  },
})
```
:::

## contextOptions

Vitest 通过调用 [`browser.newContext()`](https://playwright.dev/docs/api/class-browsercontext) 为每个测试文件创建一个新上下文。你可以通过指定 [自定义参数](https://playwright.dev/docs/api/class-browser#browser-new-context) 来配置此行为。

::: tip
请注意，上下文是为每个_测试文件_创建的，而不是像 playwright 测试运行器那样为每个_测试_创建。
:::

::: warning
Vitest 总是将 `ignoreHTTPSErrors` 设置为 `true`，以防你的服务器通过 HTTPS 提供服务，并将 `serviceWorkers` 设置为 `'allow'` 以支持通过 [MSW](https://mswjs.io) 进行模块 mocking。

还建议使用 [`test.browser.viewport`](/config/browser/headless) 而不是在此处指定，因为当测试在无头模式下运行时它会丢失。
:::

## `actionTimeout`

- **默认值：** 无超时

此值配置 Playwright 等待所有无障碍检查通过且 [操作](/api/browser/interactivity) 实际完成的默认超时时间。

你也可以为每个操作配置操作超时：

```ts
import { page, userEvent } from 'vitest/browser'

await userEvent.click(page.getByRole('button'), {
  timeout: 1_000,
})
```

## `persistentContext` <Version>4.1.0</Version> {#persistentcontext}

- **类型：** `boolean | string`
- **默认值：** `false`

启用后，Vitest 使用 Playwright 的 [持久化上下文](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context) 而不是常规浏览器上下文。这允许浏览器状态（cookies、localStorage、DevTools 设置等）在测试运行之间持久化。

::: warning
当并行运行测试时（例如，当启用了 [`fileParallelism`](/config/fileparallelism) 的无头模式时），此选项将被忽略，因为持久化上下文不能在并行会话之间共享。
:::

- 当设置为 `true` 时，用户数据存储在 `./node_modules/.cache/vitest-playwright-user-data`
- 当设置为字符串时，该值用作用户数据目录的路径

```ts [vitest.config.js]
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: playwright({
        persistentContext: true,
        // 或指定自定义目录：
        // persistentContext: './my-browser-data',
      }),
      instances: [{ browser: 'chromium' }],
    },
  },
})
```
