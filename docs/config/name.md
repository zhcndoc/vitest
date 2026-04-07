---
title: name | 配置
---

# name

- **类型：**

```ts
interface UserConfig {
  name?: string | { label: string; color?: LabelColor }
}
```

为测试项目或 Vitest 进程分配一个自定义名称。该名称将在 CLI 和 UI 中可见，并可通过 [`project.name`](/api/advanced/test-project#name) 在 Node.js API 中使用。

通过提供带有 `color` 属性的对象，可以更改 CLI 和 UI 使用的颜色。

## 颜色

显示的颜色取决于终端的配色方案。在 UI 中，颜色与其 CSS 等效值匹配。

- black
- red
- green
- yellow
- blue
- magenta
- cyan
- white

## 示例

::: code-group
```js [字符串]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'unit',
  },
})
```
```js [对象]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: {
      label: 'unit',
      color: 'blue',
    },
  },
})
```
:::

如果你有多个项目，此属性非常有用，因为它有助于在终端中区分它们：

```js{7,11} [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        name: 'unit',
        include: ['./test/*.unit.test.js'],
      },
      {
        name: 'e2e',
        include: ['./test/*.e2e.test.js'],
      },
    ],
  },
})
```

::: tip
当未提供名称时，Vitest 会自动分配一个名称。解析顺序：

- 如果项目由配置文件或目录指定，Vitest 会使用 package.json 的 `name` 字段。
- 如果没有 `package.json`，Vitest 会回退到项目文件夹的基本名称。
- 如果项目在 `projects` 数组中内联定义（一个对象），Vitest 会分配一个等于该项目数组索引的数字名称（从 0 开始）。
:::

::: warning
请注意，项目不能具有相同的名称。Vitest 将在配置解析期间抛出错误。
:::

你也可以为不同的浏览器 [实例](/config/browser/instances) 分配不同的名称：

```js{10,11} [vitest.config.js]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium', name: 'Chrome' },
        { browser: 'firefox', name: 'Firefox' },
      ],
    },
  },
})
```

::: tip
浏览器实例继承其父项目的名称，并在括号中附加浏览器名称。例如，名为 `browser` 的项目带有 chromium 实例将显示为 `browser (chromium)`。

如果父项目没有名称，或者实例是在根级别定义的（不在命名项目内），则实例名称默认为浏览器值（例如 `chromium`）。要覆盖此行为，请在实例上设置显式的 `name`。
:::
