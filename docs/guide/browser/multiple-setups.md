# 多种设置

你可以使用 [`browser.instances`](/config/browser/instances) 选项指定几种不同的浏览器设置。

使用 `browser.instances` 而不是 [测试项目](/guide/projects) 的主要优势是提高了缓存效率。每个项目都将使用相同的 Vite 服务器，这意味着文件转换和 [依赖预构建](https://vite.dev/guide/dep-pre-bundling.html) 只需发生一次。

## 多个浏览器

你可以使用 `browser.instances` 字段为不同的浏览器指定选项。例如，如果你想在不同的浏览器中运行相同的测试，最小配置如下所示：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
  },
})
```

## 不同的设置

你也可以独立于浏览器指定不同的配置选项（尽管实例 _也可以_ 拥有 `browser` 字段）：

::: code-group
```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        {
          browser: 'chromium',
          name: 'chromium-1',
          setupFiles: ['./ratio-setup.ts'],
          provide: {
            ratio: 1,
          },
        },
        {
          browser: 'chromium',
          name: 'chromium-2',
          provide: {
            ratio: 2,
          },
        },
      ],
    },
  },
})
```
```ts [example.test.ts]
import { expect, inject, test } from 'vitest'
import { globalSetupModifier } from './example.js'

test('ratio works', () => {
  expect(inject('ratio') * globalSetupModifier).toBe(14)
})
```
:::

在此示例中，Vitest 将在 `chromium` 浏览器中运行所有测试，但仅在第一个配置中执行 `'./ratio-setup.ts'` 文件，并根据 [`provide` 字段](/config/provide) 注入不同的 `ratio` 值。

::: warning
请注意，如果你使用相同的浏览器名称，则需要定义自定义 `name` 值，否则 Vitest 会将 `browser` 分配为项目名称。
:::

## 过滤

你可以使用 [`--project` 标志](/guide/cli#project) 过滤要运行的项目。如果未手动分配，Vitest 将自动把浏览器名称分配为项目名称。如果根配置已经有一个名称，Vitest 将合并它们：`custom` -> `custom (browser)`。

```shell
$ vitest --project=chromium
```

::: code-group
```ts{6,8} [default]
export default defineConfig({
  test: {
    browser: {
      instances: [
        // 名称：chromium
        { browser: 'chromium' },
        // 名称：custom
        { browser: 'firefox', name: 'custom' },
      ]
    }
  }
})
```
```ts{3,7,9} [custom]
export default defineConfig({
  test: {
    name: 'custom',
    browser: {
      instances: [
        // 名称：custom (chromium)
        { browser: 'chromium' },
        // 名称：manual
        { browser: 'firefox', name: 'manual' },
      ]
    }
  }
})
```
:::
