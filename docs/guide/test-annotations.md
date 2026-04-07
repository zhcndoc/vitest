---
title: 测试注解 | 指南
outline: deep
---

# 测试注解

Vitest 支持通过 [`context.annotate`](/guide/test-context#annotate) API 使用自定义消息和文件来注解你的测试。这些注解将附加到测试用例上，并在 [`onTestAnnotate`](/api/advanced/reporters#ontestannotate) 钩子中传递给报告器。

```ts
test('hello world', async ({ annotate }) => {
  await annotate('this is my test')

  if (condition) {
    await annotate('this should\'ve errored', 'error')
  }

  const file = createTestSpecificFile()
  await annotate('creates a file', { body: file })

  await annotate('creates a file with text', {
    contentType: 'text/markdown',
    body: 'Hello **markdown**',
    bodyEncoding: 'utf-8',
  })
})
```

::: warning
`annotate` 函数返回一个 Promise，所以如果你以某种方式依赖它，则需要等待它。然而，Vitest 也会在测试结束前自动等待任何未等待的注解。
:::

根据你的报告器不同，你会以不同的方式看到这些注解。

## 内置报告器
### default

`default` 报告器仅在测试失败时打印注解：

```
  ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

  FAIL  example.test.js > an example of a test with annotation
Error: thrown error
  ❯ example.test.js:11:21
      9 |    await annotate('annotation 1')
      10|    await annotate('annotation 2', 'warning')
      11|    throw new Error('thrown error')
        |          ^
      12|  })

  ❯ example.test.js:9:15 notice
    ↳ annotation 1
  ❯ example.test.js:10:15 warning
    ↳ annotation 2

  ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
```

### verbose

`verbose` 报告器是唯一一个在测试未失败时也报告注解的终端报告器。

```
✓ example.test.js > an example of a test with annotation

  ❯ example.test.js:9:15 notice
    ↳ annotation 1
  ❯ example.test.js:10:15 warning
    ↳ annotation 2

```

### html

HTML 报告器显示注解的方式与 UI 相同。你可以在调用它的行上看到注解。目前，如果注解不是在测试文件中调用的，你在 UI 中看不到它。我们计划支持一个单独的测试摘要视图，在那里它将可见。

<img alt="Vitest 界面" img-light src="/annotations-html-light.png">
<img alt="Vitest 界面" img-dark src="/annotations-html-dark.png">

### junit

`junit` 报告器将注解列在测试用例的 `properties` 标签内。JUnit 报告器将忽略所有附件，仅打印类型和消息。

```xml
<testcase classname="basic/example.test.js" name="an example of a test with annotation" time="0.14315">
    <properties>
        <property name="notice" value="the message of the annotation">
        </property>
    </properties>
</testcase>
```

### github-actions

`github-actions` 报告器默认会将注解打印为 [notice message](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#setting-a-notice-message)。你可以通过传递第二个参数为 `notice`、`warning` 或 `error` 来配置 `type`。如果类型不是这些，Vitest 会将消息显示为 notice。

<img alt="GitHub Actions" img-light src="/annotations-gha-light.png">
<img alt="GitHub Actions" img-dark src="/annotations-gha-dark.png">

### tap

`tap` 和 `tap-flat` 报告器将注解打印为以 `#` 符号开头的新行上的诊断消息。它们将忽略所有附件，仅打印类型和消息：

```
ok 1 - an example of a test with annotation # time=143.15ms
    # notice: 注解的消息
```
