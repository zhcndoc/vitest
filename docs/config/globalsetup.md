---
title: globalSetup | 配置
outline: deep
---

# globalSetup

- **类型：** `string | string[]`

相对于项目 [root](/config/root) 的全局设置文件路径。

全局设置文件既可以导出名为 `setup` 和 `teardown` 的函数，也可以导出一个返回 teardown 函数的 `default` 函数：

::: code-group
```js [exports]
export function setup(project) {
  console.log('setup')
}

export function teardown() {
  console.log('teardown')
}
```
```js [default]
export default function setup(project) {
  console.log('setup')

  return function teardown() {
    console.log('teardown')
  }
}
```
:::

请注意，`setup` 方法和 `default` 函数接收一个 [测试项目](/api/advanced/test-project) 作为第一个参数。全局设置在测试工作进程创建之前调用，并且仅当至少有一个测试排队时才会调用，而 teardown 在所有测试文件运行完毕后调用。在 [监视模式](/config/watch) 下，teardown 会在进程退出之前调用。如果你需要在测试重新运行之前重新配置你的设置，可以使用 [`onTestsRerun`](#handling-test-reruns) 钩子代替。

可以有多个全局设置文件。`setup` 和 `teardown` 按顺序执行，teardown 则按相反顺序执行。

::: danger
请注意，全局设置甚至在测试工作进程创建之前就在不同的全局作用域中运行，因此你的测试无法访问此处定义的全局变量。但是，你可以通过 [`provide`](/config/provide) 方法将可序列化数据传递给测试，并通过从 `vitest` 导入的 `inject` 在测试中读取它们：

:::code-group
```ts [example.test.ts]
import { inject } from 'vitest'

inject('wsPort') === 3000
```
```ts [globalSetup.ts]
import type { TestProject } from 'vitest/node'

export default function setup(project: TestProject) {
  project.provide('wsPort', 3000)
}

declare module 'vitest' {
  export interface ProvidedContext {
    wsPort: number
  }
}
```

如果你需要在与测试相同的进程中执行代码，请改用 [`setupFiles`](/config/setupfiles)，但请注意它在每个测试文件之前运行。
:::

## 处理测试重新运行

你可以定义一个自定义回调函数，当 Vitest 重新运行测试时调用它。测试运行器将等待它完成后再执行测试。请注意，你不能像 `{ onTestsRerun }` 那样解构 `project`，因为它依赖于上下文。

```ts [globalSetup.ts]
import type { TestProject } from 'vitest/node'

export default function setup(project: TestProject) {
  project.onTestsRerun(async () => {
    await restartDb()
  })
}
```
