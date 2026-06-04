---
title: 测试标签 | 指南
outline: deep
---

# 测试标签 <Version>4.1.0</Version> {#test-tags}

[`标签`](/config/tags) 允许你为测试添加标记，以便你可以过滤运行的内容并在需要时覆盖它们的选项。

## 为什么使用标签

当一个测试套件中存在一组共享运行器选项的测试时，标签就会变得非常有用，例如数据库查询需要更长的超时时间，或者 CI 上的集成测试需要重试。手动在每个相关测试上重复这些选项既脆弱又麻烦，而且这些分类通常也未必能和文件路径对应起来，所以按文件拆分并不是一个可行的方案。尤其是易失败测试，它们往往会在 bug 出现的任何地方积累下来，而不是集中在某个 `flaky/` 文件夹里。

标签可以表达这种类别：定义中保存共享选项，而任何标记了该标签的测试都会继承这些选项。这些标签名也可以组合成表达式：`--tags-filter='db && !flaky'` 会运行未标记为 flaky 的数据库测试。[`TestRunner.matchesTags`](#checking-tags-filter-at-runtime) 在运行时提供了相同的表达式，在 `globalSetup` 需要执行昂贵工作、且当没有任何带标签的测试被安排执行时可以跳过它的场景中非常有用。

## 什么时候该使用标签

| 如果你想要…… | 使用 |
| --- | --- |
| 将超时/重试应用到一类测试上 | **标签** |
| 标记分散在多个文件中的横切类别（`flaky`、`slow`、`frontend`） | **标签** |
| 根据过滤结果有条件地运行昂贵的初始化流程 | **标签** + [`matchesTags`](#checking-tags-filter-at-runtime) |
| 按测试名称匹配运行一个子集 | [`-t` / `testNamePattern`](/config/testnamepattern) |
| 按文件路径运行一个子集 | `--include` / `--exclude` |
| 以不同的 *运行器设置*（隔离、池、环境）运行不同文件 | [测试项目](/guide/projects) |

你可以将项目和标签组合使用。位于 `Sequential` 项目中的测试也可以带有 `flaky` 标签，Vitest 会同时应用二者。

## 定义标签

标签必须在你的配置文件中定义。默认情况下，Vitest 不提供任何内置标签。如果测试使用了配置中未定义的标签，测试运行器将抛出错误。这可以防止由于标签名拼写错误而导致的意外行为。你可以使用 [`strictTags`](/config/stricttags) 选项禁用此检查。

你必须定义标签的 `name`，并且可以定义将应用于标记了该标签的每个测试的附加选项，例如 `timeout` 或 `retry`。有关可用选项的完整列表，请参阅 [`tags`](/config/tags)。

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    tags: [
      {
        name: 'frontend',
        description: '面向前端编写的测试。',
      },
      {
        name: 'backend',
        description: '面向后端编写的测试。',
      },
      {
        name: 'db',
        description: '数据库查询测试。',
        timeout: 60_000,
      },
      {
        name: 'flaky',
        description: '不稳定的 CI 测试。',
        retry: process.env.CI ? 3 : 0,
        timeout: 30_000,
        priority: 1,
      },
    ],
  },
})
```

如果你正在使用 TypeScript，可以通过为 `TestTags` 类型添加一个包含字符串联合类型的属性来强制限定可用标签（确保此文件已被你的 `tsconfig` 包含）：

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

要查看所有标签，你可以使用 [`--list-tags`](/guide/cli#listtags) 命令：

```shell
vitest --list-tags

frontend: 面向前端编写的测试。
backend: 面向后端编写的测试。
db: 数据库查询测试。
flaky: 不稳定的 CI 测试。
```

要以 JSON 格式打印，传递 `--list-tags=json`：

```json
{
  "tags": [
    {
      "name": "frontend",
      "description": "Tests written for frontend."
    },
    {
      "name": "backend",
      "description": "Tests written for backend."
    },
    {
      "name": "db",
      "description": "Tests for database queries.",
      "timeout": 60000
    },
    {
      "name": "flaky",
      "description": "Flaky CI tests.",
      "retry": 0,
      "timeout": 30000,
      "priority": 1
    }
  ],
  "projects": []
}
```

### 解决选项冲突

如果多个标签定义了相同的选项并应用于同一个测试，它们会先按 `priority` 解决（数字越小优先级越高），然后按它们在测试 `tags` 数组中出现的顺序解决。不带 `priority` 的标签会先合并，并被更高优先级的标签覆盖：

```ts
test('flaky database test', { tags: ['flaky', 'db'] })
// { timeout: 30_000, retry: 3 }
```

`timeout` 为 30 秒（而不是 60 秒），因为 `flaky` 的优先级是 `1`，而 `db` 没有优先级。

在测试自身上定义的选项始终优先生效：

```ts
test('flaky database test', { tags: ['flaky', 'db'], timeout: 120_000 })
// { timeout: 120_000, retry: 3 }
```

## 在测试中使用标签

你可以使用 `tags` 选项将标签应用于单个测试或整个套件：

```ts
import { describe, test } from 'vitest'

test('renders homepage', { tags: ['frontend'] }, () => {
  // ...
})

describe('API endpoints', { tags: ['backend'] }, () => {
  test('returns user data', () => {
    // 此测试从父套件继承了 "backend" 标签
  })

  test('validates input', { tags: ['validation'] }, () => {
    // 此测试同时拥有 "backend"（继承）和 "validation" 标签
  })
})
```

标签是从父套件继承的，因此标记了 `describe` 块内的所有测试将自动拥有该标签。

也可以通过在文件顶部使用 JSDoc 的 `@module-tag` 为文件中的每个测试定义 `tags`：

```ts
/**
 * 认证测试
 * @module-tag admin/pages/dashboard
 * @module-tag acceptance
 */

test('dashboard renders items', () => {
  // ...
})
```

::: danger
JSDoc 注释中的 `@module-tag` 适用于该文件中的所有测试，而不仅仅是它前面的测试。

考虑以下示例：

```js{3,10}
describe('forms', () => {
  /**
   * @module-tag frontend
   */
  test('renders a form', () => {
    // ...
  })

  /**
   * @module-tag db
   */
  test('db returns users', () => {
    // ...
  })
})
```

在此示例中，文件中的每个测试都将同时拥有 `frontend` 和 `db` 标签。要为单个测试添加标签，请改用选项参数：

```js{2,6}
describe('forms', () => {
  test('renders a form', { tags: 'frontend' }, () => {
    // ...
  })

  test('db returns users', { tags: 'db' }, () => {
    // ...
  })
})
```
:::

## 按标签过滤测试

要仅运行具有特定标签的测试，请使用 [`--tags-filter`](/guide/cli#tagsfilter) CLI 选项：

```shell
vitest --tags-filter=frontend
vitest --tags-filter="frontend and backend"
```

如果你正在运行 Vitest UI，你可以使用 `tag:` 前缀启动过滤器，以使用相同的标签表达式语法按标签过滤测试：

<img alt="Vitest UI 中的标签过滤器" img-light src="/ui/light-ui-tags.png">
<img alt="Vitest UI 中的标签过滤器" img-dark src="/ui/dark-ui-tags.png">

如果你使用的是编程 API，可以将 `tagsFilter` 选项传递给 [`startVitest`](/guide/advanced/#startvitest) 或 [`createVitest`](/guide/advanced/#createvitest)：

```ts
import { startVitest } from 'vitest/node'

await startVitest([], {
  tagsFilter: ['frontend and backend'],
})
```

或者你可以创建一个带有自定义过滤器的 [测试规范](/api/advanced/test-specification)：

```ts
const specification = vitest.getRootProject().createSpecification(
  '/path-to-file.js',
  {
    testTagsFilter: ['frontend and backend'],
  },
)
```

### 语法

你可以以不同方式组合标签。Vitest 支持这些关键字：

- `and` 或 `&&` 以包含两个表达式
- `or` 或 `||` 以包含至少一个表达式
- `not` 或 `!` 以排除表达式
- `*` 以匹配任意数量的字符（0 个或多个）
- `()` 以分组表达式并覆盖优先级

解析器遵循标准的 [运算符优先级](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence)：`not`/`!` 具有最高优先级，然后是 `and`/`&&`，然后是 `or`/`||`。使用括号覆盖默认优先级。

::: warning 保留名称
标签名称不能是 `and`、`or` 或 `not`（不区分大小写），因为这些是保留关键字。标签名称也不能包含特殊字符（`(`, `)`, `&`, `|`, `!`, `*`, 空格），因为这些由表达式解析器使用。
:::

### 通配符

你可以使用通配符 (`*`) 来匹配任意数量的字符：

```shell
vitest --tags-filter="unit/*"
```

这将匹配诸如 `unit/components`、`unit/utils` 等标签。

### 排除标签

要排除具有特定标签的测试，请在开头添加感叹号 (`!`) 或 "not" 关键字：

```shell
vitest --tags-filter="!slow and not flaky"
```

### 示例

以下是一些常见的过滤模式：

```shell
# 仅运行单元测试
vitest --tags-filter="unit"

# 运行既是 frontend 又是 fast 的测试
vitest --tags-filter="frontend and fast"

# 运行 unit 或 e2e 的测试
vitest --tags-filter="unit or e2e"

# 运行除 slow 之外的所有测试
vitest --tags-filter="!slow"

# 运行不是 flaky 的 frontend 测试
vitest --tags-filter="frontend && !flaky"

# 运行匹配通配符模式的测试
vitest --tags-filter="api/*"

# 带括号的复杂表达式
vitest --tags-filter="(unit || e2e) && !slow"

# 运行 postgres 或 mysql 的数据库测试，但不是 slow
vitest --tags-filter="db && (postgres || mysql) && !slow"
```

你也可以传递多个 `--tags-filter` 标志。它们使用 AND 逻辑组合：

```shell
# 运行匹配 (unit 或 e2e) 且不是 slow 的测试
vitest --tags-filter="unit || e2e" --tags-filter="!slow"
```

### 在运行时检查标签过滤器

你可以使用 `TestRunner.matchesTags` 来检查当前的标签过滤器是否匹配一组标签。这在只想在包含相关测试时才运行昂贵的初始化逻辑时非常有用：

```ts
import { beforeAll, TestRunner } from 'vitest'

beforeAll(async () => {
  // 当使用 "vitest --tags-filter db" 时种子化数据库
  if (TestRunner.matchesTags(['db'])) {
    await seedDatabase()
  }
})
```

该方法接受一个标签数组，如果当前的 `--tags-filter` 会包含带有这些标签的测试，则返回 `true`。如果没有启用标签过滤器，它始终返回 `true`。

## 另请参阅

- [按文件隔离设置](/guide/recipes/disable-isolation) 和 [并行与顺序测试文件](/guide/recipes/parallel-sequential) 使用项目按文件划分测试。当类别需要不同的运行器设置，而不是不同的超时时间或重试次数时，请考虑使用项目。
- [测试过滤](/guide/filtering) 涵盖 `-t`、`--include` 以及其余 CLI 过滤器。
- [`tags`](/config/tags) 和 [`strictTags`](/config/stricttags) 配置参考。
