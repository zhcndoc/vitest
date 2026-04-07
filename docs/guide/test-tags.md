---
title: 测试标签 | 指南
outline: deep
---

# 测试标签 <Version>4.1.0</Version> {#test-tags}

[`标签`](/config/tags) 允许你为测试添加标记，以便你可以过滤运行的内容并在需要时覆盖它们的选项。

## 定义标签

标签必须在配置文件中定义 —— Vitest 不提供任何内置标签。如果测试使用了配置中未定义的标签，测试运行器将抛出错误。这可以防止因标签名称拼写错误而导致意外行为。你可以使用 [`strictTags`](/config/stricttags) 选项禁用此检查。

你必须定义标签的 `name`，并且可以定义将应用于标记了该标签的每个测试的附加选项，例如 `timeout` 或 `retry`。有关可用选项的完整列表，请参阅 [`tags`](/config/tags)。

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    tags: [
      {
        name: 'frontend',
        description: 'Tests written for frontend.',
      },
      {
        name: 'backend',
        description: 'Tests written for backend.',
      },
      {
        name: 'db',
        description: 'Tests for database queries.',
        timeout: 60_000,
      },
      {
        name: 'flaky',
        description: 'Flaky CI tests.',
        retry: process.env.CI ? 3 : 0,
        timeout: 30_000,
        priority: 1,
      },
    ],
  },
})
```

::: warning
如果多个标签具有相同的选项并用于同一个测试，它们将按照指定的顺序解析，或者先按优先级排序（数字越小，优先级越高）。没有定义优先级的标签会先合并，并将被更高优先级的标签覆盖：

```ts
test('flaky database test', { tags: ['flaky', 'db'] })
// { timeout: 30_000, retry: 3 }
```

请注意，`timeout` 是 30 秒（而不是 60 秒），因为 `flaky` 标签的优先级为 `1`，而 `db`（定义了 60 秒超时）没有优先级。

如果测试定义了自己的选项，它们将具有最高优先级：

```ts
test('flaky database test', { tags: ['flaky', 'db'], timeout: 120_000 })
// { timeout: 120_000, retry: 3 }
```
:::

如果你使用的是 TypeScript，可以通过使用包含字符串联合的属性增强 `TestTags` 类型来强制使用可用的标签（确保此文件包含在你的 `tsconfig` 中）：

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

frontend: Tests written for frontend.
backend: Tests written for backend.
db: Tests for database queries.
flaky: Flaky CI tests.
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

await startVitest('test', [], {
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

你可以使用 `TestRunner.matchesTags`（自 Vitest 4.1.1 起）来检查当前标签过滤器是否匹配一组标签。这对于仅在包含相关测试时条件性地运行昂贵的设置逻辑非常有用：

```ts
import { beforeAll, TestRunner } from 'vitest'

beforeAll(async () => {
  // 当使用 "vitest --tags-filter db" 时种子化数据库
  if (TestRunner.matchesTags(['db'])) {
    await seedDatabase()
  }
})
```

该方法接受一个标签数组，如果当前 `--tags-filter` 将包含具有这些标签的测试，则返回 `true`。如果没有激活标签过滤器，它始终返回 `true`。
