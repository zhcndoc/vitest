---
title: 工作空间 | 指南
---

# 工作空间

::: tip Sample Project

[GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/workspace) - [Play Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/workspace?initialPath=__vitest__/)

:::

Vitest 通过工作空间配置文件提供了对 monorepos 的内置支持。你可以创建一个工作空间来定义项目的配置。

## 定义工作空间

工作区必须在其根目录（与根配置文件位于同一文件夹，如适用）中包含一个 `vitest.workspace` 或 `vitest.projects` 文件。Vitest 支持该文件的 `ts`、`js` 和 `json` 扩展名。

::: tip NAMING
请注意，该功能的名称是`workspace`，而不是 `workspaces`（后面没有 “s”）。
:::

工作区配置文件必须有一个默认导出，其中包含引用项目的文件列表或 glob 模式。例如，如果你有一个名为 `packages` 的文件夹，其中包含你的项目，你就可以用这个配置文件定义一个工作区：

:::code-group

```ts [vitest.workspace.ts]
export default ['packages/*']
```

:::

即使某个文件夹中没有配置文件，Vitest 也会将 `packages` 文件夹中的每个文件夹视为单独的项目。自 Vitest 2.1 起，如果此 glob 模式匹配到任何文件，即使文件名中没有 `vitest` 也会被视为 Vitest 配置文件。

::: warning
除非在工作区配置中明确指定，否则 Vitest 不会将根配置文件 `vitest.config` 视为工作区项目。因此，根配置只会影响全局选项，如 `reporters` 和 `coverage`。
:::

你还可以使用项目的配置文件引用项目：

:::code-group

```ts [vitest.workspace.ts]
export default ['packages/*/vitest.config.{e2e,unit}.ts']
```

:::

该模式仅包括具有包含 `e2e` 或 `unit` 的 `vitest.config` 文件的项目。这些关键字需要在文件扩展名之前出现。

你也可以使用内联配置定义项目。工作区文件同时支持这两种语法。

:::code-group
```ts [vitest.workspace.ts]
import { defineWorkspace } from 'vitest/config'

// defineWorkspace 会提供一个很好的类型提示开发体验
export default defineWorkspace([
  // matches every folder and file inside the `packages` folder
  'packages/*',
  {
    // 添加 "extends" 将两个配置合并到一起
    extends: './vite.config.js',
    test: {
      include: ['tests/**/*.{browser}.test.{ts,js}'],
      // 在使用内联配置的时候，建议定义一个名称
      name: 'happy-dom',
      environment: 'happy-dom',
    },
  },
  {
    test: {
      include: ['tests/**/*.{node}.test.{ts,js}'],
      name: 'node',
      environment: 'node',
    },
  },
])
```

:::

::: warning
所有项目都必须有唯一的名称，否则 Vitest 会出错。如果内联配置中没有提供名称，Vitest 将分配一个数字。对于使用 glob 语法定义的项目配置，Vitest 将默认使用最近的 `package.json` 文件中的 "name" 属性，如果不存在此类文件，则使用文件夹名称。
:::

如果你不依赖内联配置，你可以在根目录中创建一个小的 JSON 文件：

:::code-group

```json [vitest.workspace.json]
["packages/*"]
```

:::

工作区项目不支持所有配置属性。为了提高类型安全性，请在项目配置文件中使用 `defineProject` 方法而不是 `defineConfig` 方法：

:::code-group
```ts [packages/a/vitest.config.ts] twoslash
// @errors: 2769
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    environment: 'jsdom',
    // "reporters" 在项目配置中是不支持的，
    // 所以会报错
    reporters: ['json'],
  },
})
```

:::

## 运行测试

要在工作区内运行测试，请在根目录 `package.json` 中定义一个脚本：

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

现在可以使用 CLI 运行测试了：

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
bun test
```

:::

如果只需在单个项目内运行测试，使用 `--project` CLI 选项：

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
bun test --project e2e
```
:::

::: tip
CLI 选项 `--project` 可多次使用，以筛选出多个项目：

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
bun test --project e2e --project unit
```
:::

## 配置

没有任何配置选项从根级别的配置文件继承。你可以创建一个共享的配置文件，并将其与项目配置文件合并：

::: code-group
```ts [packages/a/vitest.config.ts]
import { defineProject, mergeConfig } from 'vitest/config'
import configShared from '../vitest.shared.js'

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      environment: 'jsdom',
    },
  })
)
```

:::

在 `defineWorkspace`级别，你也可以使用 `extends`选项来继承根级别配置。所有选项都将合并。

::: code-group
```ts [vitest.workspace.ts]
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['**/*.unit.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      include: ['**/*.integration.test.ts'],
    },
  },
])
```
:::

某些配置选项不允许在项目配置中使用。其中最明显的是：

- `coverage`: 覆盖率是针对整个工作区进行的。
- `reporters`: 仅支持根级别的报告器。
- `resolveSnapshotPath`: 仅支持根级别的解析器。
- 所有其他不影响测试运行器的选项。

::: tip
所有不支持在项目配置中使用的配置选项，在 ["Config"](/config/) 指南中以 <NonProjectOption /> 标记。
:::


