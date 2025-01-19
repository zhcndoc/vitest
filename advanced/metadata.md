# 任务元数据

::: warning
Vitest 导出了实验性私有 API。重大更改可能不遵循 semver，使用时请固定 Vitest 的版本。
:::

如果你正在开发自定义报告器或使用 Vitest Node.js API，你可能会发现将在各种上下文中执行的测试中的数据传递给报告器或自定义 Vitest 处理程序很有用。

要实现此目的，依靠 [测试上下文](/guide/test-context) 是不可行的，因为它无法序列化。但是，使用 Vitest 时，你可以利用每个任务（套件或测试）上可用的 `meta` 属性在测试和 Node.js 进程之间共享数据。值得注意的是，这种通信只是单向的，因为 `meta` 属性只能在测试上下文中修改。Node.js 上下文中所做的任何更改在你的测试中都将不可见。

你可以在测试上下文中或在套件任务的 `beforeAll`/`afterAll` 钩子中填充 `meta` 属性。

```ts
afterAll((suite) => {
  suite.meta.done = true
})

test('custom', ({ task }) => {
  task.meta.custom = 'some-custom-handler'
})
```

一旦测试完成，Vitest 将通过 RPC 向 Node.js 进程发送一个包含结果和 meta 的任务，然后在 onTestCaseResult 和其他可以访问任务的钩子中报告它。要处理此测试用例，我们可以在报告器实现中使用 onTestCaseResult 方法：

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

::: danger BEWARE
Vitest 使用不同的方法与 Node.js 进程进行通信。

- 如果 Vitest 在工作线程内运行测试，它将通过[消息端口](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort)发送数据
- 如果 Vitest 使用子进程，数据将通过 [`process.send`](https://nodejs.org/api/process.html#processsendmessage-sendhandle-options-callback) API 作为序列化缓冲区发送
- 如果 Vitest 在浏览器中运行测试，数据将使用 [flatted](https://www.npmjs.com/package/flatted) 包进行字符串化

该属性也会出现在每个测试的 `json` 报告中，因此请确保数据可以序列化为 JSON。

另外，请确保在设置[错误属性](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types)之前序列化它们。
:::

当测试运行完成时，你还可以从 Vitest 状态获取此信息：

```ts
const vitest = await createVitest('test')
const { testModules } = await vitest.start()

const testModule = testModules[0]
testModule.meta().done === true
testModule.children.at(0).meta().custom === 'some-custom-handler'
```

使用 TypeScript 时，还可以扩展类型定义：

```ts
declare module 'vitest' {
  interface TaskMeta {
    done?: boolean
    custom?: string
  }
}
```
