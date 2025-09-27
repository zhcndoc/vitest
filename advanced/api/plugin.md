---
url: /advanced/api/plugin.md
---

# 插件 API 3.1.0 {#plugin-api}

::: warning
这是一个高级 API。如果我们只想 [运行测试](/guide/)，则可能不需要它。它主要由库作者使用。

本指南假设我们知道如何使用 [Vite 插件](https://vite.dev/guide/api-plugin.html)。
:::

Vitest 自 3.1 版起支持实验性的 `configureVitest` [插件](https://cn.vite.dev/guide/api-plugin) hook。欢迎在 [GitHub](https://github.com/vitest-dev/vitest/discussions/7104) 中提供有关此 API 的任何反馈。

::: code-group

```ts [only vitest]
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

```ts [vite and vitest]
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
Vitest 通过  `Vite` namespace 重新导出所有仅 Vite 类型的导入，我们可以使用它来保持版本同步。但是，如果我们正在为 Vite 和 Vitest 编写插件，则可以继续使用 `vite` 入口点的 `Plugin` 类型。只需确保我们在某处引用了 `vitest/config` ，以便正确增强 `configureVitest` 即可：

```ts
/// <reference types="vitest/config" />
```

:::

与 [`reporter.onInit`](/advanced/api/reporters#oninit) 不同，此 hooks 在 Vitest 生命周期的早期运行，允许我们更改 `coverage` 和 `reporters` 等配置。更值得注意的变化是，如果我们的插件是在项目中定义而不是在全局配置中定义的，我们可以从 [工作区项目](/guide/projects) 操作全局配置。

## Context

### project

该插件所属的当前[测试项目](./test-project)。

::: warning 浏览器模式
请注意，如果我们依赖浏览器功能，则 `project.browser` 字段尚未设置。请改用 [`reporter.onBrowserInit`](./reporters#onbrowserinit) 事件。
:::

### vitest

全局的 [Vitest](./vitest) 实例。我们可以直接改变 `vitest.config` 属性来更改全局配置：

```ts
vitest.config.coverage.enabled = false
vitest.config.reporters.push([['my-reporter', {}]])
```

::: warning Config is Resolved
请注意，Vitest 已经解析了配置，因此某些类型可能与通常的用户配置不同。这也意味着某些属性将不会再次解析，例如 `setupFile` 。如果我们要添加新文件，请确保先解析它。

此时尚未创建记者，因此修改 `vitest.reporters` 将不起作用，因为它将被覆盖。如果我们需要注入自己的记者，请修改配置。
:::

### injectTestProjects

```ts
function injectTestProjects(
  config: TestProjectConfiguration | TestProjectConfiguration[]
): Promise<TestProject[]>
```

此方法接受配置 glob 模式、配置的文件路径或内联配置。它返回已解析的 [测试项目](./test-project) 数组。

```ts
// inject a single project with a custom alias
const newProjects = await injectTestProjects({
  // you can inherit the current project config by referencing `extends`
  // note that you cannot have a project with the name that already exists,
  // so it's a good practice to define a custom name
  extends: project.vite.config.configFile,
  test: {
    name: 'my-custom-alias',
    alias: {
      customAlias: resolve('./custom-path.js'),
    },
  },
})
```

::: warning Projects are Filtered
在解析配置时， Vitest 会对项目进行过滤，因此如果用户配置了过滤条件，某些被注入的项目可能不会被加载，除非它们 符合过滤规则。我们可以使用 vitest.config.project 选项来修改过滤器，从而确保始终包含我们的测试项目：

```ts
vitest.config.project.push('my-project-name')
```

请注意，这只会影响使用 [`injectTestProjects`](#injecttestprojects) 方法注入的项目。
:::

::: tip Referencing the Current Config
若想在使用我们自己的配置时仍保留用户的原有配置，可以通过设置 extends 属性实现。这样，除了 extends 指定的内容外，其他配置项都会与我们配置合并。

项目的 `configFile` 可以在 Vite 的配置中访问：`project.vite.config.configFile`。

请注意，这也将继承 `name` - Vitest 不允许多个项目使用相同的名称，因此这将引发错误。请确保我们指定了不同的名称。我们可以通过 `project.name` 属性访问当前名称，并且所有使用的名称都可以在 `vitest.projects` 数组中找到。
:::
