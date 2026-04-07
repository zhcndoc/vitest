# 任务元数据 <Badge type="danger">高级</Badge>

如果您正在开发自定义报告器或使用 Vitest Node.js API，您可能会发现将正在各种上下文中执行的测试数据传递给您的报告器或自定义 Vitest 处理程序很有用。

要实现这一点，依赖 [测试上下文](/guide/test-context) 是不可行的，因为它无法被序列化。但是，使用 Vitest，您可以利用每个任务（套件或测试）上可用的 `meta` 属性在测试和 Node.js 进程之间共享数据。重要的是要注意，这种通信是单向的，因为 `meta` 属性只能从测试上下文内部修改。在 Node.js 上下文中所做的任何更改在测试中都将不可见。

您可以在测试上下文上填充 `meta` 属性，或者在套件任务的 `beforeAll`/`afterAll` 钩子内部填充。

```ts
afterAll((suite) => {
  suite.meta.done = true
})

test('custom', ({ task }) => {
  task.meta.custom = 'some-custom-handler'
})
```

测试完成后，Vitest 将使用 RPC 向 Node.js 进程发送包含结果和 `meta` 的任务，然后在 `onTestCaseResult` 和其他可以访问任务的钩子中报告它。要处理此测试用例，您可以利用报告器实现中可用的 `onTestCaseResult` 方法：

```ts [custom-reporter.js]
import type { Reporter, TestCase, TestModule } from 'vitest/node'

export default {
  onTestCaseResult(testCase: TestCase) {
    // custom === 'some-custom-handler' ✅
    const { custom } = testCase.meta()
  },
  onTestRunEnd(testModule: TestModule) {
    testModule.meta().done === true
    testModule.children.at(0).meta().custom === 'some-custom-handler'
  }
} satisfies Reporter
```

::: danger 注意
Vitest 使用不同的方法与 Node.js 进程通信。

- 如果 Vitest 在工作线程内运行测试，它将通过 [消息端口](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort) 发送数据
- 如果 Vitest 使用子进程，数据将通过 [`process.send`](https://nodejs.org/api/process.html#processsendmessage-sendhandle-options-callback) API 作为序列化的 Buffer 发送
- 如果 Vitest 在浏览器中运行测试，数据将使用 [flatted](https://npmx.dev/package/flatted) 包进行字符串化

此属性也存在于 `json` 报告器中的每个测试上，因此请确保数据可以序列化为 JSON。

此外，请确保在设置 [Error 属性](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types) 之前对其进行序列化。
:::

当测试运行完成后，您也可以从 Vitest 状态中获取此信息：

```ts
const vitest = await createVitest('test')
const { testModules } = await vitest.start()

const testModule = testModules[0]
testModule.meta().done === true
testModule.children.at(0).meta().custom === 'some-custom-handler'
```

使用 TypeScript 时也可以扩展类型定义：

```ts
declare module 'vitest' {
  interface TaskMeta {
    done?: boolean
    custom?: string
  }
}
```
