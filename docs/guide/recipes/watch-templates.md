---
title: 监视未导入文件 | 配方
---

# 监视未导入文件

在监视模式下，Vitest 会跟踪导入图：当你更改某个文件时，所有导入链能够追溯到该文件的测试都会重新运行。这涵盖了大多数情况。但它会遗漏那些依赖于未 `import` 的文件的测试，例如通过 `fs.readFile` 加载的电子邮件模板、运行时解析的 JSON 测试夹具、由构建步骤引入的 HTML 或 CSS，或者测试要断言的生成产物。编辑这些文件中的任意一个，都会让相关测试保持过时，而监视循环也无从得知。

[`watchTriggerPatterns`](/config/watchtriggerpatterns) <Version>3.2.0</Version> 使这些依赖关系显式化。你可以针对文件路径声明一个正则表达式，并提供一个回调，在匹配文件发生变化时返回需要重新运行的测试。

## 模式

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watchTriggerPatterns: [
      {
        pattern: /src\/templates\/(.*)\.(ts|html|txt)$/,
        testsToRun: (file, match) => {
          // 编辑 `src/templates/welcome.html` ⇒ 重新运行 `api/tests/mailers/welcome.test.ts`
          return `api/tests/mailers/${match[1]}.test.ts`
        },
      },
    ],
  },
})
```

`testsToRun` 返回一个或多个需要重新运行的测试文件路径（字符串或字符串数组），如果不应重新运行任何测试，则返回 `undefined`。路径会基于工作区根目录解析，不会被解释为 glob。`match` 是对变更文件执行 `RegExp.exec` 的结果。

## 变体

可以同时存在多个模式。下面第一个根据变更文件的目录推导测试路径；第二个将一个共享夹具映射到固定的测试文件列表：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watchTriggerPatterns: [
      {
        pattern: /src\/(.*)\/schema\.json$/,
        testsToRun: (_file, match) => `src/${match[1]}/__tests__/index.test.ts`,
      },
      {
        pattern: /test\/shared-fixture\.json$/,
        testsToRun: () => [
          'test/integration/users.test.ts',
          'test/integration/billing.test.ts',
        ],
      },
    ],
  },
})
```

[`forceRerunTriggers`](/config/forcereruntriggers) 覆盖了同样的一般性缺口，只不过它会在每次匹配时重新运行所有测试。`watchTriggerPatterns` 只会重新运行你为给定模式映射的测试，这使得监视循环保持快速。

## 另请参阅

- [`watchTriggerPatterns`](/config/watchtriggerpatterns)
- [`forceRerunTriggers`](/config/forcereruntriggers)
