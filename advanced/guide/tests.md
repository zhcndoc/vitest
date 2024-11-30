# Running Tests

::: warning 注意
本指南介绍如何使用高级 API 通过 Node.js 脚本运行测试。如果您只想[运行测试](/guide/)，则可能不需要这个。它主要被库的作者使用。

重大更改可能不会遵循 SemVer，请在使用实验性 API 时固定 Vitest 的版本。
:::

Vitest 公开了两种启动 Vitest 的方法：

- `startVitest` 启动 Vitest，验证所需软件包是否已安装并立即运行测试
- `createVitest` 仅启动 Vitest，不运行任何测试

## `startVitest`

```ts
import { startVitest } from 'vitest/node'

const vitest = await startVitest(
  'test',
  [], // CLI 筛选
  {}, // 覆盖 test 配置
  {}, // 覆盖 Vite 配置
  {}, // 自定义 Vitest 选项
)
const testModules = vitest.state.getTestModules()
for (const testModule of testModules) {
  console.log(testModule.moduleId, 'results', testModule.result())
}
```

::: tip 提示
[`TestModule`](/advanced/reporters#TestModule), [`TestSuite`](/advanced/reporters#TestSuite) 和 [`TestCase`](/advanced/reporters#TestCase) API 不再是实验性的，从 Vitest 2.1 开始遵循 SemVer。
:::

## `createVitest`

`createVitest` 方法不会验证是否已安装所需的软件包。此方法也不遵循 `config.standalone` 或 `config.mergeReports`。即使 `watch` 被禁用，Vitest 也不会自动关闭。

```ts
import { createVitest } from 'vitest/node'

const vitest = await createVitest(
  'test',
  {}, // 覆盖 test 配置
  {}, // 覆盖 Vite 配置
  {}, // 自定义 Vitest 选项
)

// 当调用 `vitest.cancelCurrentRun()` 时调用
vitest.onCancel(() => {})
// 当调用 `vitest.close()` 时调用
vitest.onClose(() => {})
// 当 Vitest 重新运行测试文件时调用
vitest.onTestsRerun((files) => {})

try {
  // 如果测试执行失败，process.exitCode 将被设置为 1
  await vitest.start(['my-filter'])
}
catch (err) {
  // 可能会抛出
  // "FilesNotFoundError" 如果没有找到文件
  // "GitNotFoundError" 如果启用了 `--changed` 并且存储库未初始化
}
finally {
  await vitest.close()
}
```
