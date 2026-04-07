---
title: onConsoleLog | 配置
outline: deep
---

# onConsoleLog <CRoot />

```ts
function onConsoleLog(
  log: string,
  type: 'stdout' | 'stderr',
  entity: TestModule | TestSuite | TestCase | undefined,
): boolean | void
```

测试中 `console` 方法的自定义处理程序。如果返回 `false`，Vitest 将不会把日志打印到控制台。注意，Vitest 会忽略所有其他假值。

可用于过滤掉第三方库的日志。

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
      return !(log === 'message from third party library' && type === 'stdout')
    },
  },
})
```
