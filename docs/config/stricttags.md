---
title: strictTags | 配置
outline: deep
---

# strictTags <Version>4.1.0</Version> {#stricttags}

- **类型:** `boolean`
- **默认值:** `true`
- **CLI:** `--strict-tags`, `--no-strict-tags`

如果测试拥有一个未在配置中定义的 [`tag`](/config/tags)，Vitest 是否应该抛出错误，以避免因名称拼写错误而静默地执行某些意外操作（例如应用了错误的配置或因 `--tags-filter` 标志而跳过测试）。

请注意，如果 `--tags-filter` 标志定义了一个配置中不存在的标签，Vitest 将始终抛出错误。

例如，此测试将抛出错误，因为标签 `fortnend` 有拼写错误（应为 `frontend`）：

::: code-group
```js [form.test.js]
test('renders a form', { tags: ['fortnend'] }, () => {
  // ...
})
```
```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    tags: [
      { name: 'frontend' },
    ],
  },
})
```
:::
