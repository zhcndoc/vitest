# 扩展报告器 <Badge type="danger">高级</Badge> {#extending-reporters}

::: warning
这是一个高级 API。如果你只是想配置内置报告器，请阅读 ["报告器"](/guide/reporters) 指南。
:::

你可以从 `vitest/node` 导入报告器并扩展它们以创建自定义报告器。

## 扩展内置报告器

通常，你不需要从头创建你的报告器。`vitest` 自带了几个你可以扩展的默认报告器。

```ts
import { DefaultReporter } from 'vitest/node'

export default class MyDefaultReporter extends DefaultReporter {
  // 做一些事情
}
```

::: warning
但是，请注意，暴露的报告器不被视为稳定的，并且它们的 API 结构可能会在小版本内发生变化。
:::

当然，你可以从头创建你的报告器。只需实现 [`Reporter`](/api/advanced/reporters) 接口：

下面是一个自定义报告器的示例：

```ts [custom-reporter.js]
import type { Reporter } from 'vitest/node'

export default class CustomReporter implements Reporter {
  onTestModuleCollected(testModule) {
    console.log(testModule.moduleId, '已完成')

    for (const test of testModule.children.allTests()) {
      console.log(test.name, test.result().state)
    }
  }
}
```

然后你可以在 `vitest.config.ts` 文件中使用你的自定义报告器：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import CustomReporter from './custom-reporter.js'

export default defineConfig({
  test: {
    reporters: [new CustomReporter()],
  },
})
```

## 报告的任务

报告的 [事件](/api/advanced/reporters) 接收用于 [测试](/api/advanced/test-case)、[套件](/api/advanced/test-suite) 和 [模块](/api/advanced/test-module) 的任务：

```ts twoslash
import type { Reporter, TestModule } from 'vitest/node'

class MyReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    for (const testModule of testModules) {
      for (const task of testModule.children) {
        //                          ^?
        console.log('测试运行结束', task.type, task.fullName)
      }
    }
  }
}
```

## 在文件系统中存储工件

::: tip
Vitest 提供了 [`vitest.createReport`](/api/advanced/vitest.html#createreport)，它提供了一组便于在文件系统中写入工件的工具。
:::

如果你的自定义报告器需要在文件系统中存储任何工件，它应该将它们放在 `.vitest` 目录中。这个目录是 Vitest 报告器和第三方集成可以使用的一种约定，用于将它们的结果放在同一个目录中。这样，你的自定义报告器用户就不需要在他们的 `.gitignore` 中添加多个排除项。只需要 `.vitest` 即可。

报告器和其他集成应遵守围绕 `.vitest` 目录的以下规则：

- `.vitest` 目录位于[项目的 `root`](/config/root)
- 如果 `.vitest` 目录不存在，报告器可以创建它
- 报告器绝不应删除 `.vitest` 目录
- 报告器应在 `.vitest` 内创建自己的目录，例如 `.vitest/yaml-reporter/`
- 报告器可以删除 `.vitest` 内自己特定的目录，例如 `.vitest/yaml-reporter/`

```ansi
.vitest
│
├── yaml-reporter
│   ├── results.yaml
│   └── summary.yaml
│
└── junit-reporter
    └── report.xml
```

## 导出的报告器

`vitest` 自带了一些你可以开箱即用的[内置报告器](/guide/reporters)。

### 内置报告器：

1. `DefaultReporter`
2. `DotReporter`
3. `JsonReporter`
4. `VerboseReporter`
5. `TapReporter`
6. `JUnitReporter`
7. `TapFlatReporter`
8. `HangingProcessReporter`
9. `TreeReporter`

### 接口报告器：

1. `Reporter`
