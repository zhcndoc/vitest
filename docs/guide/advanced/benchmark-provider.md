# 自定义基准测试提供程序 <Version type="experimental">5.0.0</Version> <Badge type="danger">高级</Badge> {#custom-benchmark-provider}

::: warning
这是一个高级的实验性 API。如果您只需要使用 Vitest 的内置提供程序运行基准测试，请改为阅读[基准测试](/guide/benchmarking)指南。
:::

Vitest 使用基准测试提供程序来执行通过 `bench` 注册的函数，并将其测量结果转换为 Vitest 可以报告的结果。内置提供程序使用 [Tinybench](https://github.com/tinylibs/tinybench)，但您可以替换它，以使用其他基准测试引擎或执行策略。

## 设置

将 [`benchmark.provider`](/config/benchmark#benchmark-provider) 设置为提供程序模块的路径。相对路径将从项目根目录解析。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    benchmark: {
      provider: './benchmark-provider.ts',
    },
  },
})
```

该模块必须使用默认导出，并导出一个实现了 `BenchmarkProvider` 的对象。此示例封装了 Tinybench，用于演示注册信息和结果如何通过提供程序流转。如果在提供程序中使用 Tinybench，请将其作为项目的直接依赖项添加。

```ts [benchmark-provider.ts]
import type { BenchmarkProvider } from 'vitest'
import { Bench } from 'tinybench'

const provider = {
  async run({ test, config, registrations, options }) {
    const bench = new Bench({
      signal: test.context.signal,
      retainSamples: config.retainSamples,
      ...options,
    })

    for (const { name, fn, fnOpts } of registrations) {
      bench.add(name, fn, fnOpts)
    }

    await bench.run()

    return bench.tasks.map((task) => {
      const result = task.result

      if (result.state === 'errored') {
        throw result.error
      }
      if (result.state !== 'completed') {
        throw new Error(`Benchmark "${task.name}" ended in the "${result.state}" state`)
      }

      return {
        ...result,
        name: task.name,
      }
    })
  },
} satisfies BenchmarkProvider

export default provider
```

## Provider API

当调用注册项的 `.run()` 方法时，或当所有传递给 `bench.compare()` 的可运行注册项一起执行时，Vitest 会调用 `provider.run(group)`。`group` 包含：

- `test`：注册基准测试的测试。运行被取消时，`test.context.signal` 会被中止。
- `config`：当前项目解析后的基准测试配置。
- `registrations`：按注册顺序排列的可运行基准测试。每个注册项都包含 `name`、`fn`，以及可选的 `fnOpts`，用于生命周期钩子、取消、异步行为和样本保留。
- `options`：传递给 `.run()` 或 `bench.compare()` 的基准测试运行选项（如果有）。

Provider 负责遵循运行选项和注册项选项，并根据基准测试引擎的生命周期运行每个基准测试函数及其 `beforeAll`、`beforeEach`、`afterEach` 和 `afterAll` 钩子。如果执行失败，应抛出错误以使测试失败。

对于每个可运行的注册项，`run` 必须解析为一个 `BenchResult`。结果通过 `name` 与注册项匹配，并作为 `.run()` 返回值、比较表、报告器和保存的基准测试结果的数据源。自定义引擎必须将其测量结果转换为由 `vitest` 导出的、与 Tinybench 兼容的 `BenchResult` 结构。

由 `bench.from()` 创建的注册项由 Vitest 加载，不会传递给 provider。

## 提供程序生命周期

Vitest 在首次使用时导入提供程序模块，并在工作线程的整个生命周期内缓存其默认导出。该 API 没有单独的设置或拆卸钩子；如有需要，请将工作线程范围的状态保存在提供程序对象上。
