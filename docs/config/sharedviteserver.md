---
title: sharedViteServer | 配置
outline: deep
---

# sharedViteServer <CRoot />

- **类型：** `boolean`
- **默认值：** `true`
- **CLI：** `--sharedViteServer=false`

不修改 Vite 配置的内联[项目](/guide/projects)会复用声明它们的配置所使用的 Vite 服务器。此类项目不会为每个项目解析新的 Vite 配置并创建新的服务器，而是共享声明配置的服务器及其转换缓存，因此共享的源文件只需转换一次，而不是每个项目转换一次，从而使测试运行更快。性能提升取决于内联项目的数量以及它们共有的源文件数量。

此选项_仅_适用于内联项目。作为配置文件或目录引用的项目始终会解析自己的 Vite 配置并创建自己的服务器。

当项目定义了会更改服务器的 Vite 级选项（`plugins`、`resolve` 等）、其 `extends` 未指向声明配置，或定义了会影响 Vite 配置的测试选项时，项目仍会获得自己的 Vite 服务器：

- [`alias`](/config/alias)
- [`browser`](/config/browser/enabled)
- [`css`](/config/css)
- [`deps.moduleDirectories`](/config/deps#deps-moduledirectories)
- [`deps.optimizer`](/config/deps#deps-optimizer)
- `mode`
- [`root`](/config/root)

`env`、`setupFiles`、`server.deps` 或 `environment` 等选项不会阻止共享：每个项目仍会在共享服务器之上保留自己的模块解析规则、模块运行器和模块实例。

对于不会更改服务器的 Vite 级值，情况也相同：空的 `plugins` 列表（`plugins: isCI ? [ciPlugin()] : []`）和 `define` 都不会改变服务器。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // 这些项目共享根 Vite 服务器
      { test: { name: 'unit', include: ['**/*.unit.test.ts'] } },
      { test: { name: 'integration', include: ['**/*.integration.test.ts'] } },
      // `define` 不会创建新服务器，因此此项目也会共享该服务器
      { define: { __DEV__: 'true' }, test: { name: 'dev' } },
      // 此项目由于使用了 `alias`，会解析自己的 Vite 配置
      { test: { name: 'aliased', alias: { lib: './src/lib' } } },
    ],
  },
})
```

::: tip
如果每个项目都重复相同的 `plugins` 配置，请将其移至声明配置中。项目会从共享服务器继承该配置，并继续共享服务器：

```ts [vitest.config.ts]
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // 提升到共享服务器中：只实例化一次
  plugins: [react()],
  test: {
    projects: [
      { test: { name: 'unit', include: ['**/*.unit.test.ts'] } },
      { test: { name: 'integration', include: ['**/*.integration.test.ts'] } },
    ],
  },
})
```
:::

要查看每个项目的决策结果，包括项目解析自己的服务器的原因，请使用 `DEBUG=vitest:projects` 运行 Vitest。API 使用者可以通过 [`project.sharedViteServer`](/api/advanced/test-project#sharedviteserver) 检查项目是否复用了声明配置的服务器。

此选项适用于每个层级：[嵌套项目容器](/guide/projects#nested-projects)中的内联项目会以相同方式共享容器的服务器。

::: warning
当项目共享服务器时，声明配置文件只会执行一次，而不是每个项目执行一次。插件只会实例化一次，其 `config` 钩子无法观察每个项目的测试选项。如果插件需要针对不同项目执行不同的行为，请禁用此选项，或不要让该项目共享服务器（例如设置 `extends: false`，或在项目自己的配置文件中定义该项目）。
:::
