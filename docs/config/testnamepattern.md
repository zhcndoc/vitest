---
title: testNamePattern | 配置
outline: deep
---

# testNamePattern <CRoot /> {#testnamepattern}

- **Type:** `string | RegExp`
- **CLI:** `-t <pattern>`, `--testNamePattern=<pattern>`, `--test-name-pattern=<pattern>`

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
