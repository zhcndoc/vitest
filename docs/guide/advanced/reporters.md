# 扩展报告器 <Badge type="danger">高级</Badge> {#extending-reporters}

::: warning
这是一个高级 API。如果你只是想配置内置报告器，请阅读 ["Reporters"](/guide/reporters) 指南。
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
    console.log(testModule.moduleId, 'is finished')

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
        console.log('test run end', task.type, task.fullName)
      }
    }
  }
}
```

## 导出的报告器

`vitest` 自带了一些你可以开箱即用的 [内置报告器](/guide/reporters)。

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
