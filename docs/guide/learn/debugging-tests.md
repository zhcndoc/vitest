---
title: 调试失败的测试 | 指南
prev:
  text: 实际测试
  link: /guide/learn/testing-in-practice
next:
  text: 使用 AI 编写测试
  link: /guide/learn/writing-tests-with-ai
---

# 调试失败的测试

本页面介绍如何在 Vitest 中调查测试失败：阅读错误输出、隔离问题、识别常见原因以及使用可用的调试工具。

## 阅读错误信息

当测试失败时，Vitest 会提供多条信息。让我们来看一个真实的失败案例并逐一分析：

<<< ./snippets/debug-output-fail.ansi

这里内容很多，但每一部分都提供了线索：

**头部信息**（`FAIL src/user.test.js > createUser > sets the default role`）告诉你哪个文件、哪个 describe 块、哪个测试失败了。这是测试树中的完整路径。

**断言消息**（`expected { ... } to deeply equal { ... }`）告诉你是什么类型的检查失败，并展示被比较的两个值。

**差异对比**（diff）精确显示了不同之处。以 <code class="diff-add">+</code> 开头的行是你实际得到的值，以 <code class="diff-remove">-</code> 开头的行是你期望的值。在这个例子中，角色是 <code class="diff-add">"viewer"</code>，但测试期望的是 <code class="diff-remove">"member"</code>。

**代码片段**显示了出错的行及附近几行内容，失败的断言处会有一个冒号（`^`）指向。你可以在大多数终端和 IDE 中点击文件路径直接跳转。

此时的问题是：这是代码发生了变化（默认角色被有意更新为 `"viewer"`），还是测试有误？检查 `createUser` 的源代码来确认。如果默认值被有意修改，就更新测试；否则，你找到了一个 Bug。

## 隔离问题

当测试失败且原因不明显时，第一步是将其隔离。单独运行这个测试，而不是整个套件：

```bash
# 仅运行失败的测试文件
vitest src/user.test.js

# 仅运行匹配名称模式的测试
vitest -t "sets the default role"

# 两者结合以获得最大精度
vitest src/user.test.js -t "sets the default role"
```

你也可以在测试本身中添加 [`.only`](/api/test#only)：

```js
test.only('sets the default role', () => {
  // 只有这个测试会在文件中运行
})
```

如果你有很多失败项，并且想先关注第一个，可以使用 [`--bail`](/config/bail) 在达到指定失败次数后停止：

```bash
vitest --bail 1
```

如果测试单独运行时通过，但与其他测试一起运行时失败，那么你遇到了测试隔离问题（下文会进一步说明）。如果它在单独运行时也失败，那么问题出在测试本身或它所测试的代码中。

## 失败的常见原因

### 测试之间的共享状态

这是最常见且最令人沮丧的问题之一。测试单独运行时通过，但完整套件运行时失败。通常原因是某个其他测试修改了共享状态（全局变量、模块级缓存、数据库）且未清理。

```js
// 这是一个问题：`users` 在测试之间共享
const users = []

test('adds a user', () => {
  users.push('Alice')
  expect(users).toEqual(['Alice'])
})

test('starts empty', () => {
  // 这里会失败，因为 'Alice' 仍在数组中！
  expect(users).toEqual([])
})
```

解决方法是使用 [`beforeEach`](/api/hooks#beforeeach) 在每个测试前重置状态，更好的方式是使用 [`test.extend`](/guide/test-context#extend-test-context) 为每个测试自动创建新的状态：

```js
const test = baseTest.extend('users', () => [])

test('adds a user', ({ users }) => {
  users.push('Alice')
  expect(users).toEqual(['Alice'])
})

test('starts empty', ({ users }) => {
  // 通过：每个测试都有独立的数组
  expect(users).toEqual([])
})
```

### 异步问题

涉及 Promise 的测试如果异步流程处理不当，可能会间歇性失败或产生令人困惑的结果。最常见的错误是忘记 `await`：

```js
// 即使 fetchUser 拒绝了，这个测试也会通过！
test('fetches user', () => {
  // 缺少 await：测试在 Promise 完成前就结束了
  expect(fetchUser(1)).resolves.toMatchObject({ name: 'Alice' })
})
```

Vitest 通常会在测试结束时警告你未等待的断言。如果看到该警告，请添加缺失的 `await`：

```js
test('fetches user', async () => {
  await expect(fetchUser(1)).resolves.toMatchObject({ name: 'Alice' })
})
```

如果测试挂起并最终超时，通常意味着某个 Promise 从未解决。检查缺失的回调、未满足的条件或所测试代码中的死锁。

### 过时的快照

如果你使用了 [快照测试](/guide/learn/snapshots) 并有意修改了代码输出，现有的快照将过期。测试会失败，并显示旧快照与新输出之间的差异。

这是预期行为。检查差异以确认修改是否正确，然后在观看模式下按 `u` 或运行 `vitest -u` 来更新快照。

### 错误的测试环境

如果你的代码访问浏览器 API（如 `document` 或 `window`），并看到类似 "document is not defined" 的错误，说明测试在 Node 环境（默认环境）中运行。你可以通过 [`environment`](/config/environment) 配置选项切换到类似浏览器的环境，或者更好的方式是使用 [浏览器模式](/guide/browser/)，它在真实的浏览器中运行测试。

### Mock 未清理

如果一个测试中的 Mock 泄漏到另一个测试，会导致意外行为。例如，一个 `vi.spyOn` 覆盖的方法返回值会持续存在，除非被恢复。

最简单的修复方法是在配置中启用自动恢复 Mock：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
  },
})
```

这会在每个测试后调用 [`mockRestore()`](/api/mock#mockrestore)。有关更多详细信息，请参阅 [Mock 函数](/guide/learn/mock-functions#resetting-mocks) 教程。

## 调试工具

### 控制台日志

在测试中添加 `console.log` 并没有什么问题。这是最快检查值和了解正在发生的事情的方式：

```js
test('transforms data correctly', () => {
  const input = getData()
  console.log('input:', input)

  const result = transform(input)
  console.log('result:', result)

  expect(result).toMatchObject({ status: 'ok' })
})
```

Vitest 会将控制台输出与测试结果内联显示，因此你可以看到哪个测试产生了哪些日志。

### Vitest UI

要直观查看测试套件，请使用 `--ui` 标志运行 Vitest：

```bash
vitest --ui
```

这将打开一个基于浏览器的仪表板，你可以查看所有测试、它们的状态和输出。它还包含一个模块关系图，可以帮助你理解一个文件的更改如何导致另一个文件的失败。有关更多详细信息，请参阅 [Vitest UI](/guide/ui) 指南。

### VS Code 扩展

[Vitest VS Code 扩展](https://vitest.dev/vscode) 允许你直接从编辑器运行和调试单个测试。你可以点击任意测试旁边的“播放”按钮、设置断点，并在 VS Code 调试器中逐步执行代码。这通常比在终端和编辑器之间切换更快。

### 详细输出

如果默认输出没有显示足够细节，请使用详细报告模式：

```bash
vitest --reporter=verbose
```

这会为每个测试单独显示（而不仅仅是文件），有助于发现哪些测试通过、哪些失败的模式。

### 附加调试器

对于更复杂的问题，如果你需要逐行调试代码，可以使用 `--inspect-brk` 标志运行 Vitest 并附加调试器。`--no-file-parallelism` 标志可确保测试在主线程中运行，以便断点可靠生效：

```bash
vitest --inspect-brk --no-file-parallelism
```

然后从 VS Code、IntelliJ 或 Chrome DevTools（`chrome://inspect`）中附加。有关每个编辑器的详细设置说明，请参阅 [调试](/guide/debugging) 指南。

## 获取帮助

如果遇到困难，这些资源可以提供帮助：

- [常见错误](/guide/common-errors) 页面涵盖了具体的错误信息及其解决方案
- [GitHub Issues](https://github.com/vitest-dev/vitest/issues) 用于搜索已知错误和解决方法
- [Discord 社区](https://chat.vitest.dev) 可从其他 Vitest 用户和维护者那里获得实时帮助

<style>
.vp-doc code.diff-add {
  color: var(--vp-c-green-2) !important;
}
.vp-doc code.diff-remove {
  color: var(--vp-c-red-2) !important;
}
</style>
