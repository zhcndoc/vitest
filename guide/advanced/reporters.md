# 扩展默认报告器 <Badge type="danger">advanced</Badge> {#extending-reporters}

::: warning
这是一个高级 API。如果我们只是想配置内置报告器，请阅读 [报告器](/guide/reporters) 指南。
:::

<<<<<<< HEAD
我们可以从 `vitest/reporters` 导入报告器并扩展它们来创建自定义报告器。
=======
You can import reporters from `vitest/node` and extend them to create your custom reporters.
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

## 扩展内置报告器 {#extending-built-in-reporters}

一般来说，我们不需要从头开始创建报告器。`vitest` 附带了几个可以扩展的默认报告程序。

```ts
import { DefaultReporter } from 'vitest/node'

export default class MyDefaultReporter extends DefaultReporter {
  // 在此实现自定义功能
}
```

<<<<<<< HEAD
当然，我们可以从头开始创建报告器。只需扩展 `BaseReporter` 类并实现我们需要的方法即可。
=======
::: warning
However, note that exposed reports are not considered stable and can change the shape of their API within a minor version.
:::

Of course, you can create your reporter from scratch. Just implement the [`Reporter`](/api/advanced/reporters) interface:
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

这是自定义报告器的示例：

```ts [custom-reporter.js]
<<<<<<< HEAD
import { BaseReporter } from 'vitest/node'

export default class CustomReporter extends BaseReporter {
  onTestModuleCollected() {
    const files = this.ctx.state.getFiles(this.watchFilters)
    this.reportTestSummary(files)
  }
}
```

或者实现 `Reporter` 接口：

```ts [custom-reporter.js]
=======
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4
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

然后我们可以在 `vitest.config.ts` 文件中使用自定义报告器：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import CustomReporter from './custom-reporter.js'

export default defineConfig({
  test: {
    reporters: [new CustomReporter()],
  },
})
```

## 报告的任务 {#reported-tasks}

<<<<<<< HEAD
建议使用 Reported Tasks API，而不是使用报告器接收到的任务。

我们可以通过调用 `vitest.state.getReportedEntity(runnerTask)` 访问此 API：
=======
Reported [events](/api/advanced/reporters) receive tasks for [tests](/api/advanced/test-case), [suites](/api/advanced/test-suite) and [modules](/api/advanced/test-module):
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

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

## 导出报告器 {#exported-reporters}

`vitest` 附带了一些 [内置报告器](/guide/reporters)，我们可以开箱即用。

### 内置报告器: {#built-in-reporters}

1. `DefaultReporter`
2. `DotReporter`
3. `JsonReporter`
4. `VerboseReporter`
5. `TapReporter`
6. `JUnitReporter`
7. `TapFlatReporter`
8. `HangingProcessReporter`
9. `TreeReporter`

<<<<<<< HEAD
### 基础抽象报告器: {#base-abstract-reporters}

1. `BaseReporter`

### 接口报告器: {#interface-reporters}
=======
### Interface reporters:
>>>>>>> 47a54389b1993fcc0b8e5ade4f6dcedeba9ad8f4

1. `Reporter`
