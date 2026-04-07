---
title: 插件 API
outline: deep
---

# 插件 API <Version>3.1.0</Version> {#plugin-api}

::: warning
这是一个高级 API。如果你只是想 [运行测试](/guide/)，可能不需要这个。它主要由库作者使用。

本指南假设你知道如何使用 [Vite 插件](https://vite.dev/guide/api-plugin.html)。
:::

Vitest 自 3.1 版本起支持 `configureVitest` [插件](https://vite.dev/guide/api-plugin.html) 钩子。

::: code-group
```ts [仅 vitest]
import type { Vite, VitestPluginContext } from 'vitest/node'

export function plugin(): Vite.Plugin {
  return {
    name: 'vitest:my-plugin',
    configureVitest(context: VitestPluginContext) {
      // ...
    }
  }
}
```
```ts [vite 和 vitest]
/// <reference types="vitest/config" />

import type { Plugin } from 'vite'

export function plugin(): Plugin {
  return {
    name: 'vitest:my-plugin',
    transform() {
      // ...
    },
    configureVitest(context) {
      // ...
    }
  }
}
```
:::

::: tip TypeScript
Vitest 通过 `Vite` 命名空间重新导出所有 Vite 的纯类型导入，你可以用它来保持版本同步。但是，如果你正在编写一个同时用于 Vite 和 Vitest 的插件，你可以继续使用来自 `vite` 入口的 `Plugin` 类型。只需确保你在某处引用了 `vitest/config`，以便 `configureVitest` 被正确增强：

```ts
/// <reference types="vitest/config" />
```
:::

与 [`reporter.onInit`](/api/advanced/reporters#oninit) 不同，这个钩子在 Vitest 生命周期中运行得更早，允许你对 `coverage` 和 `reporters` 等配置进行更改。一个更显著的变化是，如果你的插件定义在 [测试项目](/guide/projects) 中而不是全局配置中，你可以操纵全局配置。

## 上下文

### project

插件所属的当前 [测试项目](./test-project)。

::: warning 浏览器模式
请注意，如果你依赖浏览器功能，`project.browser` 字段尚未设置。请改用 [`reporter.onBrowserInit`](./reporters#onbrowserinit) 事件。
:::

### vitest

全局 [Vitest](./vitest) 实例。你可以通过直接修改 `vitest.config` 属性来更改全局配置：

```ts
vitest.config.coverage.enabled = false
vitest.config.reporters.push([['my-reporter', {}]])
```

::: warning 配置已解析
请注意，Vitest 已经解析了配置，所以某些类型可能与通常的用户配置不同。这也意味着某些属性将不会再次解析，例如 `setupFile`。如果你要添加新文件，请确保先解析它。

此时报告器尚未创建，因此修改 `vitest.reporters` 将无效，因为它会被覆盖。如果你需要注入自己的报告器，请改为修改配置。
:::

### injectTestProjects

```ts
function injectTestProjects(
  config: TestProjectConfiguration | TestProjectConfiguration[]
): Promise<TestProject[]>
```

此方法接受配置 glob 模式、配置的文件路径或内联配置。它返回已解析的 [测试项目](./test-project) 数组。

```ts
// 注入一个带有自定义别名的单个项目
const newProjects = await injectTestProjects({
  // 你可以通过引用 `extends` 来继承当前项目配置
  // 注意你不能拥有一个名称已存在的项目，
  // 所以定义一个自定义名称是个好习惯
  extends: project.vite.config.configFile,
  test: {
    name: 'my-custom-alias',
    alias: {
      customAlias: resolve('./custom-path.js'),
    },
  },
})
```

::: warning 项目会被过滤
Vitest 在配置解析期间会过滤项目，所以如果用户定义了过滤器，注入的项目可能不会被解析，除非它 [匹配过滤器](./vitest#matchesprojectfilter)。你可以通过 `vitest.config.project` 选项更新过滤器以始终包含你的测试项目：

```ts
vitest.config.project.push('my-project-name')
```

请注意，这只会影响通过 [`injectTestProjects`](#injecttestprojects) 方法注入的项目。
:::

::: tip 引用当前配置
如果你想保留用户配置，可以指定 `extends` 属性。所有其他属性将与用户定义的配置合并。

项目的 `configFile` 可以在 Vite 的配置中访问：`project.vite.config.configFile`。

请注意，这也会继承 `name` - Vitest 不允许多个项目具有相同的名称，所以这会抛出错误。确保你指定了一个不同的名称。你可以通过 `project.name` 属性访问当前名称，所有使用的名称都可在 `vitest.projects` 数组中找到。
:::

### experimental_defineCacheKeyGenerator <Version type="experimental">4.0.11</Version> <Experimental /> {#definecachekeygenerator}

```ts
interface CacheKeyIdGeneratorContext {
  environment: DevEnvironment
  id: string
  sourceCode: string
}

function experimental_defineCacheKeyGenerator(
  callback: (context: CacheKeyIdGeneratorContext) => string | undefined | null | false
): void
```

定义一个生成器，它将在哈希缓存键之前应用。

使用此功能确保 Vitest 生成正确的哈希。如果你的插件可以使用不同选项注册，定义此函数是个好主意。

仅当定义了 [`experimental.fsModuleCache`](/config/experimental#experimental-fsmodulecache) 时才会调用此函数。

```ts
interface PluginOptions {
  replacePropertyKey: string
  replacePropertyValue: string
}

export function plugin(options: PluginOptions) {
  return {
    name: 'plugin-that-replaces-property',
    transform(code) {
      return code.replace(
        options.replacePropertyKey,
        options.replacePropertyValue
      )
    },
    configureVitest({ experimental_defineCacheKeyGenerator }) {
      experimental_defineCacheKeyGenerator(() => {
        // 由于这些选项会影响转换结果，
        // 将它们一起作为唯一字符串返回
        return options.replacePropertyKey + options.replacePropertyValue
      })
    }
  }
}
```

如果返回 `false`，模块将不会被缓存到文件系统中。
