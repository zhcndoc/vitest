# 自定义池 <Badge type="danger">高级</Badge> {#custom-pool}

::: warning
这是一个高级、实验性且非常底层的 API。如果你只是想 [运行测试](/guide/)，可能不需要这个。它主要供库作者使用。
:::

Vitest 在池（pool）中运行测试。默认情况下，有几种池运行器：

- `threads` 使用 `node:worker_threads` 运行测试（隔离通过新的 worker 上下文提供）
- `forks` 使用 `node:child_process` 运行测试（隔离通过新的 `child_process.fork` 进程提供）
- `vmThreads` 使用 `node:worker_threads` 运行测试（但隔离通过 `vm` 模块提供，而不是新的 worker 上下文）
- `browser` 使用浏览器 provider 运行测试
- `typescript` 对测试运行类型检查

::: tip
查看 [`vitest-pool-example`](https://npmx.dev/package/vitest-pool-example) 以获取自定义池运行器实现的示例。
:::

## 用法

你可以通过返回 `PoolRunnerInitializer` 的函数来提供自己的池运行器。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import customPool from './my-custom-pool.ts'

export default defineConfig({
  test: {
    // 默认情况下将使用自定义池运行每个文件
    pool: customPool({
      customProperty: true,
    })
  },
})
```

如果你需要在不同的池中运行测试，请使用 [`projects`](/guide/projects) 功能：

```ts [vitest.config.ts]
import customPool from './my-custom-pool.ts'

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          pool: 'threads',
        },
      },
      {
        extends: true,
        test: {
          pool: customPool({
            customProperty: true,
          })
        }
      }
    ],
  },
})
```

## API

`pool` 选项接受一个 `PoolRunnerInitializer`，可用于自定义池运行器。`name` 属性应指示自定义池运行器的名称。它应该与你的 worker 的 `name` 属性相同。

```ts [my-custom-pool.ts]
import type { PoolRunnerInitializer } from 'vitest/node'

export function customPool(customOptions: CustomOptions): PoolRunnerInitializer {
  return {
    name: 'custom-pool',
    createPoolWorker: options => new CustomPoolWorker(options, customOptions),
  }
}
```

在你的 `CustomPoolWorker` 中，你需要定义所有必需的方法：

```ts [my-custom-pool.ts]
import type { PoolOptions, PoolWorker, WorkerRequest } from 'vitest/node'

class CustomPoolWorker implements PoolWorker {
  name = 'custom-pool'
  private customOptions: CustomOptions

  constructor(options: PoolOptions, customOptions: CustomOptions) {
    this.customOptions = customOptions
  }

  send(message: WorkerRequest): void {
    // 提供向你的 worker 发送消息的方法
  }

  on(event: string, callback: (arg: any) => void): void {
    // 提供监听你的 worker 事件的方法，例如 message, error, exit
  }

  off(event: string, callback: (arg: any) => void): void {
    // 提供取消订阅 `on` 监听器的方法
  }

  async start() {
    // 当 worker 启动时执行某些操作
  }

  async stop() {
    // 清理状态
  }

  deserialize(data) {
    return data
  }
}
```

你的 `CustomPoolRunner` 将控制自定义测试运行器 worker 的生命周期和通信通道如何工作。例如，你的 `CustomPoolRunner` 可以启动一个 `node:worker_threads` `Worker`，并通过 `Worker.postMessage` 和 `parentPort` 提供通信。

在你的 worker 文件中，你可以从 `vitest/worker` 导入辅助工具：

```ts [my-worker.ts]
import { init, runBaseTests, setupEnvironment } from 'vitest/worker'

init({
  post: (response) => {
    // 提供将此消息作为 message 事件发送到 CustomPoolRunner 的 onWorker 的方法
  },
  on: (callback) => {
    // 提供监听 CustomPoolRunner 的 "postMessage" 调用的方法
  },
  off: (callback) => {
    // 可选，提供一种移除由 "on" 调用添加的监听器的方法
  },
  teardown: () => {
    // 可选，提供一种销毁 worker 的方法，例如取消订阅所有 `on` 监听器
  },
  serialize: (value) => {
    // 可选，为 `post` 调用提供自定义序列化器
  },
  deserialize: (value) => {
    // 可选，为 `on` 回调提供自定义反序列化器
  },
  runTests: (state, traces) => runBaseTests('run', state, traces),
  collectTests: (state, traces) => runBaseTests('collect', state, traces),
  setup: setupEnvironment,
})
```
