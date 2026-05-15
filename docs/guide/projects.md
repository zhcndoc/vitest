---
title: 测试项目 | 指南
---

# 测试项目

::: tip 示例项目

[GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/projects) - [在线运行](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/projects?initialPath=__vitest__/)

:::

::: warning
此功能也被称为 `workspace`。`workspace` 自 3.2 起已弃用，并被 `projects` 配置取代。它们在功能上是相同的。
:::

Vitest 提供了一种在单个 Vitest 进程中定义多个项目配置的方法。此功能对于 monorepo 设置特别有用，但也可用于使用不同配置运行测试，例如 `resolve.alias`、`plugins` 或 `test.browser` 等。

## 定义项目

你可以在根 [config](/config/) 中定义项目：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
})
```

项目配置可以是内联配置、文件或引用你项目的 glob 模式。例如，如果你有一个名为 `packages` 的文件夹包含你的项目，你可以在根 Vitest 配置中定义一个数组：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
})
```

Vitest 会将 `packages` 中的每个文件夹视为一个单独的项目，即使里面没有配置文件。如果项目条目解析为文件（来自 glob 模式或直接文件路径），Vitest 将验证名称是否：

- 以 `vitest.config` 或 `vite.config` 开头（例如，`vitest.config.unit.ts`）
- 或匹配 `vitest.<name>.config.*` / `vite.<name>.config.*`，其中 `<name>` 可以包含字母、数字、`_` 和 `-`

例如，这些配置文件是有效的：

- `vitest.config.ts`
- `vite.config.js`
- `vitest.unit.config.ts`
- `vitest.e2e-node.config.ts`
- `vite.e2e.config.js`
- `vitest.config.unit.js`
- `vite.config.e2e.js`

要排除文件夹和文件，你可以使用否定模式：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 包含 "packages" 内的所有文件夹，除了 "excluded"
    projects: [
      'packages/*',
      '!packages/excluded'
    ],
  },
})
```

如果你有一个嵌套结构，其中某些文件夹需要成为项目，但其他文件夹有自己的子文件夹，你必须使用括号以避免匹配父文件夹：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

// 例如，这将创建项目：
// packages/a
// packages/b
// packages/business/c
// packages/business/d
// 注意 "packages/business" 本身不是一个项目

export default defineConfig({
  test: {
    projects: [
      // 匹配 "packages" 内的每个文件夹，除了 "business"
      'packages/!(business)',
      // 匹配 "packages/business" 内的每个文件夹
      'packages/business/*',
    ],
  },
})
```

::: warning
Vitest 不会将根 `vitest.config` 文件视为项目，除非在配置中明确指定。因此，根配置只会影响全局选项，例如 `reporters` 和 `coverage`。请注意，Vitest 将始终运行根配置文件中指定的某些插件钩子，如 `apply`、`config`、`configResolved` 或 `configureServer`。Vitest 还使用相同的插件来执行全局设置和自定义覆盖率提供者。
:::

你也可以通过配置文件引用项目：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.{e2e,unit}.ts'],
  },
})
```

此模式将仅包含扩展名之前包含 `e2e` 或 `unit` 的 `vitest.config` 文件的项目。

你也可以使用内联配置定义项目。配置同时支持这两种语法。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // 匹配 `packages` 文件夹内的每个文件夹和文件
      'packages/*',
      {
        // 添加 "extends: true" 以继承根配置中的选项
        extends: true,
        test: {
          include: ['tests/**/*.{browser}.test.{ts,js}'],
          // 建议在使用内联配置时定义名称
          name: 'happy-dom',
          environment: 'happy-dom',
        }
      },
      {
        test: {
          include: ['tests/**/*.{node}.test.{ts,js}'],
          // 名称标签的颜色可以更改
          name: { label: 'node', color: 'green' },
          environment: 'node',
        }
      }
    ]
  }
})
```

::: warning
所有项目必须具有唯一的名称；否则，Vitest 将抛出错误。如果内联配置中未提供名称，Vitest 将分配一个数字。对于使用 glob 语法定义的项目配置，Vitest 默认使用最近 `package.json` 文件中的 "name" 属性，如果不存在，则使用文件夹名称。
:::

项目不支持所有配置属性。为了更好的类型安全，在项目配置文件中使用 `defineProject` 方法而不是 `defineConfig`：

```ts twoslash [packages/a/vitest.config.ts]
// @errors: 2769
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    environment: 'jsdom',
    // "reporters" 在项目配置中不受支持，
    // 因此它会显示错误
    reporters: ['json']
  }
})
```

## 运行测试

要运行测试，请在根 `package.json` 中定义一个脚本：

```json [package.json]
{
  "scripts": {
    "test": "vitest"
  }
}
```

现在可以使用你的包管理器运行测试：

::: code-group
```bash [npm]
npm run test
```
```bash [yarn]
yarn test
```
```bash [pnpm]
pnpm run test
```
```bash [bun]
bun run test
```
:::

如果你只需要在单个项目中运行测试，请使用 `--project` CLI 选项：

::: code-group
```bash [npm]
npm run test --project e2e
```
```bash [yarn]
yarn test --project e2e
```
```bash [pnpm]
pnpm run test --project e2e
```
```bash [bun]
bun run test --project e2e
```
:::

::: tip
CLI 选项 `--project` 可以多次使用以过滤出多个项目：

::: code-group
```bash [npm]
npm run test --project e2e --project unit
```
```bash [yarn]
yarn test --project e2e --project unit
```
```bash [pnpm]
pnpm run test --project e2e --project unit
```
```bash [bun]
bun run test --project e2e --project unit
```
:::

## 配置

没有任何配置选项是从根级配置文件继承的。你可以创建一个共享配置文件并将其与项目配置自行合并：

```ts [packages/a/vitest.config.ts]
import { defineProject, mergeConfig } from 'vitest/config'
import configShared from '../vitest.shared.js'

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      environment: 'jsdom',
    }
  })
)
```

此外，你可以使用 `extends` 选项从根级配置继承。所有选项都将合并。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    pool: 'threads',
    projects: [
      {
        // 将从此配置继承选项，如 plugins 和 pool
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.test.ts'],
        },
      },
      {
        // 不会从此配置继承任何选项
        // 这是默认行为
        extends: false,
        test: {
          name: 'integration',
          include: ['**/*.integration.test.ts'],
        },
      },
    ],
  },
})
```

::: danger 不支持的选项
某些配置选项不允许在项目配置中使用。最值得注意的是：

- `coverage`: 覆盖率在整个进程中计算
- `reporters`: 仅支持根级报告器
- `resolveSnapshotPath`: 仅支持根级解析器
- `attachmentsDir`: 附件存储在一个由所有项目共享的根级目录中
- all other options that don't affect test runners

所有在项目配置中不受支持的配置选项都在其名称旁边标记有 <CRoot /> 图标。它们只能在根配置文件中定义一次。
:::
