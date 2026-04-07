# 分析测试性能

当你运行 Vitest 时，它会报告测试的多个时间指标：

> ```bash
> RUN  v2.1.1 /x/vitest/examples/profiling
>
> ✓ test/prime-number.test.ts (1) 4517ms
>   ✓ generate prime number 4517ms
>
> Test Files  1 passed (1)
>      Tests  1 passed (1)
>   Start at  09:32:53
>   Duration  4.80s (transform 44ms, setup 0ms, import 35ms, tests 4.52s, environment 0ms)
>   # 时间指标 ^^
> ```

- Transform：花费在转换文件上的时间。参见 [文件转换](#file-transform)。
- Setup：运行 [`setupFiles`](/config/setupfiles) 文件所花费的时间。
- Import：导入测试文件及其依赖所花费的时间。这也包括收集所有测试所花费的时间。注意，这不包括测试内部的动态导入。
- Tests：实际运行测试用例所花费的时间。
- Environment：设置测试 [`environment`](/config/environment) 所花费的时间，例如 JSDOM。

## 测试运行器

在测试执行时间较高的情况下，你可以生成测试运行器的性能分析文件。参见 NodeJS 文档了解以下选项：

- [`--cpu-prof`](https://nodejs.org/api/cli.html#--cpu-prof)
- [`--heap-prof`](https://nodejs.org/api/cli.html#--heap-prof)
- [`--prof`](https://nodejs.org/api/cli.html#--prof)

:::warning
`--prof` 选项由于 `node:worker_threads` 的限制，无法与 `pool: 'threads'` 一起使用。
:::

要将这些选项传递给 Vitest 的测试运行器，请在你的 Vitest 配置中定义 `execArgv`：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    execArgv: [
      '--cpu-prof',
      '--cpu-prof-dir=test-runner-profile',
      '--heap-prof',
      '--heap-prof-dir=test-runner-profile'
    ],
  },
})
```

测试运行后，应该会生成 `test-runner-profile/*.cpuprofile` 和 `test-runner-profile/*.heapprofile` 文件。参见 [检查性能分析记录](#inspecting-profiling-records) 了解如何分析这些文件的说明。

参见 [性能分析 | 示例](https://github.com/vitest-dev/vitest/tree/main/examples/profiling) 了解示例。

## 主线程

分析主线程对于调试 Vitest 的 Vite 用法和 [`globalSetup`](/config/globalsetup) 文件很有用。
你的 Vite 插件也是在这里运行的。

:::tip
参见 [性能 | Vite](https://vitejs.dev/guide/performance.html) 了解更多关于 Vite 特定性能分析的技巧。

我们推荐使用 [`vite-plugin-inspect`](https://github.com/antfu-collective/vite-plugin-inspect) 来分析你的 Vite 插件性能。
:::

为此，你需要将参数传递给运行 Vitest 的 Node 进程。

```bash
$ node --cpu-prof --cpu-prof-dir=main-profile ./node_modules/vitest/vitest.mjs --run
#      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                                  ^^^^^
#               NodeJS 参数                                           Vitest 参数
```

测试运行后，应该会生成 `main-profile/*.cpuprofile` 文件。参见 [检查性能分析记录](#inspecting-profiling-records) 了解如何分析这些文件的说明。

## 文件转换

这种性能分析策略是识别由 [barrel 文件](https://vitejs.dev/guide/performance.html#avoid-barrel-files) 引起的不必要转换的好方法。
如果这些日志包含在你的测试运行时不应加载的文件，你可能拥有不必要的导入文件的 barrel 文件。

你也可以使用 [Vitest UI](/guide/ui) 来调试由 barrel 文件引起的缓慢问题。
下面的示例展示了不使用 barrel 文件导入文件如何减少约 85% 的转换文件数量。

::: code-group
``` [文件树]
├── src
│   └── utils
│       ├── currency.ts
│       ├── formatters.ts  <-- File to test
│       ├── index.ts
│       ├── location.ts
│       ├── math.ts
│       ├── time.ts
│       └── users.ts
├── test
│   └── formatters.test.ts
└── vitest.config.ts
```
```ts [example.test.ts]
import { expect, test } from 'vitest'
import { formatter } from '../src/utils' // [!code --]
import { formatter } from '../src/utils/formatters' // [!code ++]

test('formatter works', () => {
  expect(formatter).not.toThrow()
})
```
:::

<img src="/module-graph-barrel-file.png" alt="Vitest UI 演示 barrel 文件问题" />

要查看文件是如何转换的，你可以在 UI 中打开 "Module Info" 视图：

<img alt="内联模块的模块信息视图" img-light src="/ui/light-module-info.png">
<img alt="内联模块的模块信息视图" img-dark src="/ui/dark-module-info.png">

## 文件导入

有些模块加载就是需要很长时间。要识别哪些模块最慢，请在你的配置中启用 [`experimental.importDurations`](/config/experimental#experimental-importdurations)：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    experimental: {
      importDurations: {
        print: true,
      },
    },
  },
})
```

这将在测试完成后打印最慢导入的细分情况：

```bash
Import Duration Breakdown (Top 10)

Module                      Self     Total
my-test.test.ts              5ms    620ms [████████████████████]
date-fns/index.js          500ms    500ms [████████████████░░░░] # [!code error]
src/utils/helpers.ts        10ms    120ms [████████░░░░░░░░░░░░]
```

你也可以在不更改配置的情况下从 CLI 使用 `--experimental.importDurations.print`：

```bash
vitest --experimental.importDurations.print
```

一旦你识别了慢速模块，有几种策略可以加速导入：

### 使用特定入口点

许多库提供多个入口点。导入主入口点（通常是 [barrel 文件](https://vitejs.dev/guide/performance.html#avoid-barrel-files)）可能会引入远超你所需的代码。

例如，`date-fns` 从其主入口点重新导出了数百个函数。不要从顶层模块导入，而是直接从特定函数导入：

```ts
import { format } from 'date-fns' // [!code --]
import { format } from 'date-fns/format' // [!code ++]
```

### 使用 resolve.alias 重定向导入

如果依赖项不提供细粒度的入口点，或者第三方代码导入了沉重的入口点，你可以使用 [`resolve.alias`](https://vite.dev/config/shared-options#resolve-alias) 将导入重定向到更轻量级的替代方案：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^date-fns$/,
        replacement: join(dirname(require.resolve('date-fns/package.json')), 'index.cjs'),
      },
    ]
  },
})
```

### 使用依赖优化器

Vitest 可以使用 [`deps.optimizer`](/config/deps#deps-optimizer) 将外部库捆绑到单个文件中，这减少了导入具有许多内部模块的包的开销：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: ['date-fns'],
        },
      },
    },
  },
})
```

这对于 UI 库和具有深层导入树的包特别有效。对 `node`/`edge` 环境使用 `optimizer.ssr`，对 `jsdom`/`happy-dom` 环境使用 `optimizer.client`。

## 代码覆盖率

如果你的项目中代码覆盖率生成缓慢，你可以使用 `DEBUG=vitest:coverage` 环境变量来启用性能日志记录。

```bash
$ DEBUG=vitest:coverage vitest --run --coverage

 RUN  v3.1.1 /x/vitest-example

  vitest:coverage Reading coverage results 2/2
  vitest:coverage Converting 1/2
  vitest:coverage 4 ms /x/src/multiply.ts
  vitest:coverage Converting 2/2
  vitest:coverage 552 ms /x/src/add.ts
  vitest:coverage Uncovered files 1/2
  vitest:coverage File "/x/src/large-file.ts" is taking longer than 3s # [!code error]
  vitest:coverage 3027 ms /x/src/large-file.ts
  vitest:coverage Uncovered files 2/2
  vitest:coverage 4 ms /x/src/untested-file.ts
  vitest:coverage Generate coverage total time 3521 ms
```

这种性能分析方法非常适合检测被覆盖率提供者意外选取的大文件。
例如，如果你的配置意外地将大型构建后的压缩 Javascript 文件包含在代码覆盖率中，它们应该出现在日志中。
在这些情况下，你可能想要调整你的 [`coverage.include`](/config/coverage#coverage-include) 和 [`coverage.exclude`](/config/coverage#coverage-exclude) 选项。

## 检查性能分析记录

你可以使用各种工具检查 `*.cpuprofile` 和 `*.heapprofile` 的内容。参见下面的列表示例。

- [Speedscope](https://www.speedscope.app/)
- [在 Visual Studio Code 中分析 JavaScript 性能](https://code.visualstudio.com/docs/nodejs/profiling#_analyzing-a-profile)
- [使用 Performance 面板分析 Node.js 性能 | developer.chrome.com](https://developer.chrome.com/docs/devtools/performance/nodejs#analyze)
- [Memory 面板概览 | developer.chrome.com](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots#view_snapshots)
