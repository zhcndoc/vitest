# 运行测试 <Badge type="danger">高级</Badge> {#running-tests}

::: warning
本指南解释如何通过 Node.js 脚本使用高级 API 运行测试。如果你只是想 [运行测试](/guide/)，可能不需要这个。它主要由库作者使用。
:::

Vitest 暴露了两个方法来启动 Vitest：

- `startVitest` 启动 Vitest，验证包已安装并立即运行测试
- `createVitest` 仅启动 Vitest 且不运行任何测试

## `startVitest`

```ts
import { startVitest } from 'vitest/node'

const vitest = await startVitest(
  'test',
  [], // CLI 过滤器
  {}, // 覆盖测试配置
  {}, // 覆盖 Vite 配置
  {}, // 自定义 Vitest 选项
)
const testModules = vitest.state.getTestModules()
for (const testModule of testModules) {
  console.log(testModule.moduleId, testModule.ok() ? 'passed' : 'failed')
}
```

## `createVitest`

创建一个 [Vitest](/api/advanced/vitest) 实例而不运行测试。

`createVitest` 方法不验证是否安装了所需的包。它也不尊重 `config.standalone` 或 `config.mergeReports`。即使禁用了 `watch`，Vitest 也不会自动关闭。

```ts
import { createVitest } from 'vitest/node'

const vitest = await createVitest(
  'test',
  {}, // 覆盖测试配置
  {}, // 覆盖 Vite 配置
  {}, // 自定义 Vitest 选项
)

// 当调用 `vitest.cancelCurrentRun()` 时触发
vitest.onCancel(() => {})
// 在 `vitest.close()` 调用期间触发
vitest.onClose(() => {})
// 当 Vitest 重新运行测试文件时触发
vitest.onTestsRerun((files) => {})

try {
  // 如果测试失败，这将把 process.exitCode 设置为 1，
  // 并且不会自动关闭进程
  await vitest.start(['my-filter'])
}
catch (err) {
  // 这可能会抛出
  // 如果没有找到文件则抛出 "FilesNotFoundError"
  // 使用 `--changed` 且仓库未初始化时抛出 "GitNotFoundError"
}
finally {
  await vitest.close()
}
```

如果你打算保留 `Vitest` 实例，请确保至少调用 [`init`](/api/advanced/vitest#init)。这将初始化报告器和覆盖率提供者，但不会运行任何测试。即使你不打算使用 Vitest 监视器，但想保持实例运行，也建议启用 `watch` 模式。Vitest 依赖此标志使其某些功能在持续进程中正常工作。

初始化报告器后，如果需要手动运行，请使用 [`runTestSpecifications`](/api/advanced/vitest#runtestspecifications) 或 [`rerunTestSpecifications`](/api/advanced/vitest#reruntestspecifications) 来运行测试：

```ts
watcher.on('change', async (file) => {
  const specifications = vitest.getModuleSpecifications(file)
  if (specifications.length) {
    vitest.invalidateFile(file)
    // 如果 "reporter.onWatcher*" 钩子
    // 不应被触发，你可以使用 runTestSpecifications
    await vitest.rerunTestSpecifications(specifications)
  }
})
```

::: warning
上述示例展示了禁用默认监视器行为时的一个潜在用例。默认情况下，如果文件发生变化，Vitest 已经会重新运行测试。

还要注意，`getModuleSpecifications` 不会解析测试文件，除非它们已经被 `globTestSpecifications` 处理过。如果文件是刚刚创建的，请改用 `project.matchesGlobPattern`：

```ts
watcher.on('add', async (file) => {
  const specifications = []
  for (const project of vitest.projects) {
    if (project.matchesGlobPattern(file)) {
      specifications.push(project.createSpecification(file))
    }
  }

  if (specifications.length) {
    await vitest.rerunTestSpecifications(specifications)
  }
})
```
:::

在需要禁用监视器的情况下，自 Vite 5.3 起，你可以将 `server.watch: null` 或 `server.watch: { ignored: ['*/*'] }` 传递给 Vite 配置：

```ts
await createVitest(
  'test',
  {},
  {
    plugins: [
      {
        name: 'stop-watcher',
        async configureServer(server) {
          await server.watcher.close()
        }
      }
    ],
    server: {
      watch: null,
    },
  }
)
```
