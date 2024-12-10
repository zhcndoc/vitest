# Running Tests

::: warning 注意
本指南介绍如何使用高级 API 通过 Node.js 脚本运行测试。如果您只想[运行测试](/guide/)，则可能不需要这个。它主要被库的作者使用。

破坏性变更可能不会遵循 SemVer，请在使用实验性 API 时固定 Vitest 的版本。
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
  console.log(testModule.moduleId, testModule.ok() ? 'passed' : 'failed')
}
```

<<<<<<< HEAD
::: tip 提示
[`TestModule`](/advanced/reporters#TestModule), [`TestSuite`](/advanced/reporters#TestSuite) 和 [`TestCase`](/advanced/reporters#TestCase) API 不再是实验性的，从 Vitest 2.1 开始遵循 SemVer。
=======
::: tip
[`TestModule`](/advanced/api/test-module), [`TestSuite`](/advanced/api/test-suite) and [`TestCase`](/advanced/api/test-case) APIs are not experimental and follow SemVer since Vitest 2.1.
>>>>>>> 3158871632d11ca43bea7c2f8c72bc95feac15cb
:::

## `createVitest`

<<<<<<< HEAD
`createVitest` 方法不会验证是否已安装所需的软件包。此方法也不遵循 `config.standalone` 或 `config.mergeReports`。即使 `watch` 被禁用，Vitest 也不会自动关闭。
=======
Creates a [Vitest](/advanced/api/vitest) instances without running tests.

`createVitest` method doesn't validate that required packages are installed. It also doesn't respect `config.standalone` or `config.mergeReports`. Vitest won't be closed automatically even if `watch` is disabled.
>>>>>>> 3158871632d11ca43bea7c2f8c72bc95feac15cb

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
<<<<<<< HEAD
  // 如果测试执行失败，process.exitCode 将被设置为 1
  await vitest.start(['my-filter'])
}
catch (err) {
  // 可能会抛出
  // "FilesNotFoundError" 如果没有找到文件
  // "GitNotFoundError" 如果启用了 `--changed` 并且存储库未初始化
=======
  // this will set process.exitCode to 1 if tests failed,
  // and won't close the process automatically
  await vitest.start(['my-filter'])
}
catch (err) {
  // this can throw
  // "FilesNotFoundError" if no files were found
  // "GitNotFoundError" with `--changed` and repository is not initialized
>>>>>>> 3158871632d11ca43bea7c2f8c72bc95feac15cb
}
finally {
  await vitest.close()
}
```

If you intend to keep the `Vitest` instance, make sure to at least call [`init`](/advanced/api/vitest#init). This will initialise reporters and the coverage provider, but won't run any tests. It is also recommended to enable the `watch` mode even if you don't intend to use the Vitest watcher, but want to keep the instance running. Vitest relies on this flag for some of its features to work correctly in a continous process.

After reporters are initialised, use [`runTestSpecifications`](/advanced/api/vitest#runtestspecifications) or [`rerunTestSpecifications`](/advanced/api/vitest#reruntestspecifications) to run tests if manual run is required:

```ts
watcher.on('change', async (file) => {
  const specifications = vitest.getModuleSpecifications(file)
  if (specifications.length) {
    vitest.invalidateFile(file)
    // you can use runTestSpecifications if "reporter.onWatcher*" hooks
    // should not be invoked
    await vitest.rerunTestSpecifications(specifications)
  }
})
```

::: warning
The example above shows a potential usecase if you disable the default watcher behaviour. By default, Vitest already reruns tests if files change.

Also note that `getModuleSpecifications` will not resolve test files unless they were already processed by `globTestSpecifications`. If the file was just created, use `project.matchesGlobPattern` instead:

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

In cases where you need to disable the watcher, you can pass down `server.watch: null` since Vite 5.3 or `server.watch: { ignored: ['*/*'] }` to a Vite config:

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
