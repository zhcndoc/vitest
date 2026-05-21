---
title: watchTriggerPatterns | 配置
outline: deep
---

# watchTriggerPatterns <CRoot /> <Version>3.2.0</Version>

- **类型：** `WatcherTriggerPattern[]`

Vitest 根据模块图重新运行测试，该模块图由静态和动态 `import` 语句生成。但是，如果你是从文件系统读取或从代理获取，那么 Vitest 无法检测到这些依赖。

为了正确地重新运行这些测试，你可以定义一个正则表达式模式和一个函数，该函数返回要运行的测试文件列表。

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watchTriggerPatterns: [
      {
        pattern: /src\/(mailers|templates)\/(.*)\.(ts|html|txt)$/,
        testsToRun: (id, match) => {
          // 相对于 root 的值
          return `./api/tests/mailers/${match[2]}.test.ts`
        },
      },
    ],
  },
})
```

::: warning
返回的文件应该是绝对路径或相对于根目录的路径。请注意，这是一个全局选项，不能在 [项目](/guide/projects) 配置中使用。
:::
