---
title: 快照测试 | 指南
prev:
  text: 模拟函数
  link: /guide/learn/mock-functions
next:
  text: 实际测试
  link: /guide/learn/testing-in-practice
---

# 快照测试

快照测试会捕获一段代码的输出并将其保存到文件中。后续运行时，会将输出与保存的快照进行比较。如果输出发生变化，测试就会失败。这种变化要么是 Bug，要么需要更新快照。

这种方法特别适用于测试会产生结构化输出的内容：一个返回复杂对象的函数、渲染 HTML 的组件，或生成多行消息的错误格式化程序。为每个字段或行编写手动断言会非常繁琐且脆弱。相反，你只需捕获一次完整输出，然后让 Vitest 判断它是否发生变化。

## 你的第一个快照

要创建快照测试，只需向 [`toMatchSnapshot()`](/api/expect#tomatchsnapshot) 传递一个值：

```js
import { expect, test } from 'vitest'

function generateGreeting(name) {
  return {
    message: `Hello, ${name}!`,
    timestamp: null,
    version: 2,
  }
}

test('generates a greeting', () => {
  expect(generateGreeting('Alice')).toMatchSnapshot()
})
```

第一次运行此测试时，没有现有的快照可供比较，因此 Vitest 会创建一个。它将快照存储在测试文件旁边的 `__snapshots__` 目录中：

```
__snapshots__/
  example.test.js.snap
```

如果你打开该文件，会看到一个序列化后的值表示：

```js
exports['generates a greeting 1'] = `
{
  "message": "Hello, Alice!",
  "timestamp": null,
  "version": 2,
}
`
```

从现在起，每次运行此测试时，Vitest 都会序列化 `generateGreeting('Alice')` 的输出，并逐字符地与存储的存储快照进行比较。如果输出发生变化（例如有人修改了消息格式或提升了版本号），测试就会失败，并显示清晰的变更差异。

::: tip
提交你的快照文件到版本控制。它们作为预期输出的记录，应该像其他测试断言一样在代码审查中被检查。
:::

## 内联快照

外部快照文件虽然好用，但你必须跳转到另一个文件才能查看预期输出的实际样子。对于较小的值，使用 [`toMatchInlineSnapshot()`](/api/expect#tomatchinlinesnapshot) 将快照直接保留在测试文件中通常更方便。

首先在不带参数的情况下编写断言：

```js
test('generates a greeting', () => {
  expect(generateGreeting('Alice')).toMatchInlineSnapshot()
})
```

运行测试时，Vitest 会**自动填充**快照作为字符串参数：

```js
test('generates a greeting', () => {
  expect(generateGreeting('Alice')).toMatchInlineSnapshot(`
    {
      "message": "Hello, Alice!",
      "timestamp": null,
      "version": 2,
    }
  `)
})
```

现在预期输出就在产生它的代码旁边。你可以立即理解 `generateGreeting` 的预期返回值。当输出发生变化时，Vitest 会就地更新字符串，这样你就不需要管理单独的快照文件。

内联快照非常适合小型、聚焦的值。对于大型输出（如完整的 HTML 页面），外部快照或文件快照更合适。

## 更新快照

当你有意更改代码的输出时，现有快照会过时，测试会失败。这是设计如此；这正是快照测试的核心目的。但一旦你确认新输出是正确的，就需要更新快照。

有多种方法可以实现：

- **在观察模式中**：在终端中按 `u` 以更新所有失败快照
- **通过 CLI**：运行 `vitest -u` 或 `vitest --update` 来更新快照并退出
- **在 VS Code 中**：使用测试边距图标上的“更新快照”命令（来自 [Vitest 扩展](https://vitest.dev/vscode)）

```bash
vitest -u
```

对于内联快照，Vitest 会直接修改测试文件中的新值。对于外部快照，它会重写 `.snap` 文件。

::: warning
更新快照时要小心。始终检查差异以确认更改是预期的，而不是 Bug。切勿盲目按 `u` 而不小心接受了错误的输出。
:::

## 文件快照

有时你要测试的输出足够大，以至于外部 `.snap` 文件感觉很笨拙，或者你希望在编辑器中用合适的语法高亮查看快照。`[toMatchFileSnapshot()](/api/expect#tomatchfilesnapshot)` 允许你将快照保存为你想要的任何扩展名的文件：

```js
test('renders the component', async () => {
  const html = renderComponent()
  await expect(html).toMatchFileSnapshot('./fixtures/component.html')
})
```

快照存储为一个普通的 `.html` 文件，你可以直接在浏览器中打开、用语法高亮查看，或用标准工具进行差异比较。这适用于 HTML、SVG、CSS、生成的代码，或任何文件格式对可读性很重要的输出。

## 何时使用快照

当你在处理结构化、可序列化的输出，而手动断言会非常痛苦时，快照最为理想。一些常见场景：

- 一个返回具有许多嵌套字段的复杂配置对象的函数
- 由渲染函数或模板引擎生成的 HTML 或标记
- 包含格式化堆栈跟踪或上下文信息的错误消息
- 具有特定格式的 CLI 输出或日志消息
- 你希望捕获任何意外字段变化的 JSON API 响应

另一方面，快照并不总是最佳工具。如果输出经常变化（例如包含时间戳或随机 ID），你将花费更多时间更新快照，而不是它们为你节省的时间。而且，如果你只关心一两个特定字段，像 `[toMatchObject`](/api/expect#tomatchobject) 或 `[toHaveProperty`](/api/expect#tohaveproperty) 这样的目标断言比捕获所有内容的快照更清晰地表达你的意图。

一般规则是：当你希望保护输出的*任何*变化时使用快照，而当你只关心*特定*属性时使用目标断言。

::: tip
有关自定义快照序列化程序、匹配器和高级配置，请参见 [快照](/guide/snapshot) 指南。
:::
