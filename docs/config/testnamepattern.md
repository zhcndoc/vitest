---
title: testNamePattern | 配置
outline: deep
---

# testNamePattern <CRoot /> {#testnamepattern}

- **类型：** `string | RegExp`
- **CLI：** `-t <pattern>`、`--testNamePattern=<pattern>`、`--test-name-pattern=<pattern>`

运行全名与模式匹配的测试。
如果在此属性中添加 `OnlyRunThis`，则测试名称中不包含单词 `OnlyRunThis` 的测试将被跳过。

```js
import { expect, test } from 'vitest'

// 运行
test('OnlyRunThis', () => {
  expect(true).toBe(true)
})

// 跳过
test('doNotRun', () => {
  expect(true).toBe(true)
})
```

该模式会与测试的完整名称进行匹配：外层测试套件名称和测试名称使用 `' > '` 连接（与报告器输出中显示的字符串相同）。例如，下面的测试完整名称为 `math > adds`，因此可以通过 `-t 'math > adds'` 或 `-t adds` 进行匹配：

```js
import { describe, expect, test } from 'vitest'

describe('math', () => {
  test('adds', () => {
    expect(1 + 1).toBe(2)
  })
})
```

::: warning
在 Vitest 5 之前，各部分使用单个空格（`math adds`）连接，以与 Jest 保持一致。详情请参阅[迁移指南](/guide/migration#vitest-5)。
:::
