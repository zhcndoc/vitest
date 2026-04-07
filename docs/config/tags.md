---
title: tags | 配置
outline: deep
---

# tags <Version>4.1.0</Version> {#tags}

- **类型：** `TestTagDefinition[]`
- **默认值：** `[]`

定义测试项目中所有 [可用的标签](/guide/test-tags)。默认情况下，如果测试定义的名称未在此列出，Vitest 将抛出错误，但可以通过 [`strictTags`](/config/stricttags) 选项进行配置。

如果你正在使用 [`projects`](/config/projects)，它们将自动继承所有全局标签定义。

使用 [`--tags-filter`](/guide/test-tags#syntax) 根据标签过滤测试。使用 [`--list-tags`](/guide/cli#listtags) 打印 Vitest 工作区中的每个标签。

## name

- **类型：** `string`
- **必填：** `true`

标签的名称。这是你在测试的 `tags` 选项中使用的内容。

```ts
export default defineConfig({
  test: {
    tags: [
      { name: 'unit' },
      { name: 'e2e' },
    ],
  },
})
```

::: tip
如果你使用的是 TypeScript，你可以通过扩充 `TestTags` 类型来强制规定可用的标签，该类型包含一个字符串联合属性（确保此文件被你的 `tsconfig` 包含）：

```ts [vitest.shims.ts]
import 'vitest'

declare module 'vitest' {
  interface TestTags {
    tags:
      | 'frontend'
      | 'backend'
      | 'db'
      | 'flaky'
  }
}
```
:::

## description

- **类型：** `string`

标签的人类可读描述。当找不到标签时，这将显示在 UI 和错误消息中。

```ts
export default defineConfig({
  test: {
    tags: [
      {
        name: 'slow',
        description: 'Tests that take a long time to run.',
      },
    ],
  },
})
```

## priority

- **类型：** `number`
- **默认值：** `Infinity`

当多个具有相同选项的标签应用于测试时，用于合并选项的优先级。数字越小意味着优先级越高（例如，优先级 `1` 优先于优先级 `3`）。

```ts
export default defineConfig({
  test: {
    tags: [
      {
        name: 'flaky',
        timeout: 30_000,
        priority: 1, // 更高优先级
      },
      {
        name: 'db',
        timeout: 60_000,
        priority: 2, // 更低优先级
      },
    ],
  },
})
```

当测试同时拥有这两个标签时，`timeout` 将为 `30_000`，因为 `flaky` 具有更高的优先级。

## 测试选项

标签可以定义 [测试选项](/api/test#test-options)，这些选项将应用于标记了该标签的每个测试。这些选项与测试自身的选项合并，测试自身的选项优先。

::: warning
[`retry.condition`](/api/test#retry) 只能是正则表达式，因为配置值需要被序列化。

标签也不能通过这些选项应用其他 [标签](/api/test#tags)。
:::

## 示例

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    tags: [
      {
        name: 'unit',
        description: 'Unit tests.',
      },
      {
        name: 'e2e',
        description: 'End-to-end tests.',
        timeout: 60_000,
      },
      {
        name: 'flaky',
        description: 'Flaky tests that need retries.',
        retry: process.env.CI ? 3 : 0,
        priority: 1,
      },
      {
        name: 'slow',
        description: 'Slow tests.',
        timeout: 120_000,
      },
      {
        name: 'skip-ci',
        description: 'Tests to skip in CI.',
        skip: !!process.env.CI,
      },
    ],
  },
})
```
