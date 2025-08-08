# Custom Pool

::: warning
这是一个高级且非常底层的 API。如果你只是想 [运行测试](/guide/)，你可能不需要这个。它主要由库作者使用。
:::

Vitest 在默认情况下以多种方式运行测试：

- `threads` 使用 `node:worker_threads` 运行测试（通过新的 worker 上下文提供隔离）
- `forks` 使用 `node:child_process` 运行测试（通过新的 `child_process.fork` 进程提供隔离）
- `vmThreads` 使用 `node:worker_threads` 运行测试（但是通过 `vm` 模块而不是新的 worker 上下文提供隔离）
- `browser` 使用浏览器提供程序运行测试
- `typescript` 在测试中运行类型检查

你可以通过指定文件路径来提供自己的池：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 默认情况下，将使用自定义池运行每个文件
    pool: './my-custom-pool.ts',
    // 可以使用 `poolOptions` 对象提供选项
    poolOptions: {
      myCustomPool: {
        customProperty: true,
      },
    },
  },
})
```

如果你需要让测试在不同的执行池中分别运行，可以借助 [`projects`](/guide/projects) 功能来实现：

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          pool: 'threads',
        },
      },
    ],
  },
})
```

## API

在 `pool` 选项中指定的文件应该导出一个函数（可以是异步的），该函数接受 `Vitest` 接口作为其第一个选项。这个函数需要返回一个与 `ProcessPool` 接口匹配的对象：

```ts
import type { ProcessPool, TestSpecification } from 'vitest/node'

export interface ProcessPool {
  name: string
  runTests: (files: TestSpecification[], invalidates?: string[]) => Promise<void>
  collectTests: (files: TestSpecification[], invalidates?: string[]) => Promise<void>
  close?: () => Promise<void>
}
```

这个函数只会被调用一次（除非服务器配置被更新），通常最好在这个函数内初始化测试所需的一切，并在调用 `runTests` 时重复使用它。

Vitest 会在安排新的测试任务时调用 runTest 方法；如果 files 为空，则不会调用。该方法的第一个参数是 [TestSpecifications](/advanced/api/test-specification) 组成的数组。在执行 runTests 前，这些文件会先经过 [sequencer](/config/#sequence-sequencer) 排序。虽然比较少见，但同一个文件可能会被多次包含在列表里，不过它们总是归属于不同的项目——这是通过 [projects](/guide/projects) 配置机制实现的。

<<<<<<< HEAD
Vitest 会等到 `runTests` 执行完毕后才结束运行（即只有在 `runTests` 解决后才会触发 [`onFinished`](/advanced/reporters)）。
=======
Vitest will wait until `runTests` is executed before finishing a run (i.e., it will emit [`onTestRunEnd`](/advanced/reporters) only after `runTests` is resolved).
>>>>>>> 0dbbfc0a68127f12d0001ace6c3d1c8601295b63

如果你正在使用自定义池，需要自行提供测试文件及其结果 - 可以参考 [`vitest.state`](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/state.ts)（最重要的是 `collectFiles` 和 `updateTasks`）。Vitest 使用 `@vitest/runner` 包中的 `startTests` 函数来执行这些操作。

如果通过 CLI 命令调用 `vitest.collect` 或 `vitest list`，则 Vitest 将调用 `collectTests`。它的工作方式与 `runTests` 相同，但你不必运行测试回调，只需通过调用 `vitest.state.collectFiles(files)` 来报告它们的任务。

要在不同的进程之间进行通信，可以使用 `vitest/node` 中的 `createMethodsRPC` 创建方法对象，并使用你喜欢的任何形式的通信。例如，要将 WebSockets 与 `birpc` 一起使用，你可以编写以下内容：

```ts
import { createBirpc } from 'birpc'
import { parse, stringify } from 'flatted'
import { createMethodsRPC, TestProject } from 'vitest/node'

function createRpc(project: TestProject, wss: WebSocketServer) {
  return createBirpc(
    createMethodsRPC(project),
    {
      post: msg => wss.send(msg),
      on: fn => wss.on('message', fn),
      serialize: stringify,
      deserialize: parse,
    },
  )
}
```

你可以查看一个从头开始制作的简单池示例，该池不运行测试，而是将它们标记为已收集：[pool/custom-pool.ts](https://github.com/vitest-dev/vitest/blob/main/test/cli/fixtures/custom-pool/pool/custom-pool.ts)。
