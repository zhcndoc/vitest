# 提升性能

## 优先分析性能

摘要中的 `Duration` 行会将这次运行按阶段拆分，并以所有已追踪时间的百分比表示：

```
Duration  3.76s (environment 79%, import 13%, transform 6%, tests 1%, setup 1%)
```

这些百分比是相对于所有已追踪阶段时间之和，而不是相对于墙上时钟时间：各阶段会在并行工作进程中运行，因此它们的总和通常会大于整个运行过程本身。在多项目配置中，这些百分比会汇总所有[项目](/guide/projects)的数据，因此某个项目中占主导地位的阶段可能会被其他项目的数据稀释；下面的性能提示会分别分析每个项目。

这些阶段对应以下配置选项：

- `environment` - 为测试文件创建测试环境（例如 `jsdom`、`happy-dom`）。请参阅[测试环境](#test-environments)。
- `transform` - 等待 Vite 解析并转换导入的模块。请参阅[重复运行期间的缓存](#caching-between-reruns)。
- `import` - 评估测试文件及其模块，不包括上面追踪的转换等待时间。当文件导入的模块大多相同时（桶文件导入的典型情况），隔离机制会为每个文件重新评估该共享模块图。请参阅[测试隔离](#test-isolation)。
- `setup` - 运行 [`setupFiles`](/config/setupfiles)。
- `worker` - 在每个工作进程中准备测试运行器。隔离机制会为每个测试文件承担这项开销。请参阅[测试隔离](#test-isolation)。
- `tests` - 运行测试本身。如果运行时间主要消耗在此阶段，那么通过配置更改获得的收益会很小。

当收集到的计时数据显示某项配置更改可以显著加快运行速度时，Vitest 还会在摘要后打印提示，请参阅 [`experimental.diagnostics`](/config/experimental#experimental-diagnostics)。提示不会建议更改已显式设置的选项。

[`vitest doctor`](/guide/cli#vitest-doctor) 不会估算替代配置的效果，而是对其进行实际测量：它会在每个候选配置下运行测试套件并报告比较结果，其中包括测试是否能在 `isolate: false` 下通过。

## 测试隔离

默认情况下，Vitest 基于 [池](/config/pool) 在隔离环境中运行每个测试文件：

- `threads` 池在单独的 [`Worker`](https://nodejs.org/api/worker_threads.html#class-worker) 中运行每个测试文件
- `forks` 池在单独的 [fork 子进程](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options) 中运行每个测试文件
- `vmThreads` 池在单独的 [VM 上下文](https://nodejs.org/api/vm.html#vmcreatecontextcontextobject-options) 中运行每个测试文件，但它使用 worker 来实现并行

这会大大增加测试时间，对于不依赖副作用并能正确清理状态的项目来说，这可能不是理想的选择（对于 `node` 环境的项目通常是这样）。在这种情况下，禁用隔离将提高测试速度。为此，你可以向 CLI 提供 `--no-isolate` 标志，或在配置中将 [`test.isolate`](/config/isolate) 属性设置为 `false`。

::: code-group
```bash [CLI]
vitest --no-isolate
```
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    isolate: false,
  },
})
```
:::

你也可以通过使用 `projects` 仅针对特定文件禁用隔离：

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: '隔离',
          isolate: true, // （默认值）
          exclude: ['**.non-isolated.test.ts'],
        },
      },
      {
        test: {
          name: '非隔离',
          isolate: false,
          include: ['**.non-isolated.test.ts'],
        },
      },
    ],
  },
})
```

:::tip
如果你使用的是 `vmThreads` 池，则无法禁用隔离。请改用 `threads` 池来提高测试性能。
:::

对于某些项目，可能还需要禁用并行性以提高启动速度。为此，向 CLI 提供 `--no-file-parallelism` 标志，或在配置中将 [`test.fileParallelism`](/config/fileparallelism) 属性设置为 `false`。

::: code-group
```bash [CLI]
vitest --no-file-parallelism
```
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
  },
})
```
:::

## 测试环境

DOM 环境的创建成本很高：`jsdom` 每次导入大约需要 200-500ms，`happy-dom` 大约需要 90-200ms，此外还要加上构造窗口的时间。使用隔离池（默认配置）时，每个测试文件都会承担这项成本，因为每个文件都会获得一个全新的工作线程。在大量使用 DOM 的测试套件中，这通常是运行过程中最大的开销；它会显示为 `Duration` 分解中的 `environment` 占比。

以下三种配置可以降低这项成本：

| 配置 | 创建环境的频率 | 隔离方式 | 权衡 |
|---|---|---|---|
| `pool: 'forks'`/`'threads'` + `isolate: true`（默认） | 每个文件一次 | 每个文件使用全新的进程/线程和环境 | 最安全，但速度最慢 |
| `pool: 'vmThreads'` | 每个工作线程一次 | 每个文件使用全新的 VM 上下文和 `window` | 测试代码在 VM realm 中运行：与外部化包一起使用时可能出现跨 realm 的 `instanceof` 边界情况，并且内存回收不够可靠（请参阅 [`vmMemoryLimit`](/config/vmmemorylimit)） |
| `isolate: false` | 每个工作线程一次 | 无 - 同一工作线程中的文件共享环境和模块状态 | 测试不能依赖干净的 `window` 或模块状态；运行 `vitest doctor` 进行检查 |

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    pool: 'vmThreads', // 每个工作线程一个环境，每个文件使用全新的 window
  },
})
```

如果测试能够容忍共享状态，优先将 `isolate: false` 与 `threads` 一起使用：这是最快的选项，并且内存行为更简单。当每个文件都需要全新的 `window`，且每个文件创建环境的成本占运行时间的主要部分时，请使用 `vmThreads`。在所有配置中，创建 `happy-dom` 的成本都低于 `jsdom`。

## 限制目录搜索

你可以使用 [`test.dir`](/config/dir) 选项限制 Vitest 搜索文件时的工作目录。如果你的根目录中有不相关的文件夹和文件，这应该会使搜索更快。

## 重运行之间的缓存

在监视模式下，Vitest 会将所有转换后的文件缓存到内存中，从而加快重运行速度。但是，测试运行完成后，此缓存会被丢弃。启用 [`fsModuleCache`](/config/fsmodulecache) 后，Vitest 会将此缓存持久化到文件系统，以便在重运行之间重复使用。

这种改进最为明显的是当重运行依赖大型模块图的少量测试时。对于完整的测试套件，并行化已经减轻了成本，因为其他测试会在早期测试仍在运行时填充内存缓存。例如，运行一个具有巨大模块图（>900 个模块）的测试文件：

```shell
# 第一次运行
Duration  8.75s (import 43%, transform 32%, tests 20%, setup 5%)

# 第二次运行
Duration  5.90s (tests 44%, import 35%, transform 13%, setup 8%)
```

## Node 编译缓存

Vitest 支持 Node 的[磁盘编译缓存](https://nodejs.org/api/cli.html#node_compile_cachedir)：当 `NODE_COMPILE_CACHE` 环境变量指向某个目录时，Vitest 自身模块和外部化依赖的 V8 字节码会写入磁盘，并在后续运行中重复使用，而不是重新编译。Vitest 会将该变量传递给每个工作线程，并且工作线程会在关闭时持久化它们所编译的模块。

```shell
NODE_COMPILE_CACHE=node_modules/.cache/node-compile-cache vitest
```

首次使用空目录运行时，需要为序列化已编译模块付出开销，因此只有在该目录能在多次运行之间保留时，启用此功能才值得：例如本地运行，或会缓存该目录的 CI 流水线。`NODE_DISABLE_COMPILE_CACHE=1` 会完全禁用缓存，其优先级高于 `NODE_COMPILE_CACHE`。

请注意，启用 `v8` 覆盖率提供程序时，Vitest 会自动在工作线程中禁用编译缓存——V8 序列化缓存脚本时不会包含精确覆盖率所依赖的源代码位置信息。

## 池

默认情况下，Vitest 在 `pool: 'forks'` 中运行测试。虽然 `'forks'` 池更适合兼容性问题（[挂起的进程](/guide/common-errors.html#failed-to-terminate-worker) 和 [段错误](/guide/common-errors.html#segfaults-and-native-code-errors)），但在大型项目中，它可能比 `pool: 'threads'` 稍慢。

你可以尝试在配置中切换 `pool` 选项来提高测试运行时间：

::: code-group
```bash [CLI]
vitest --pool=threads
```
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'threads',
  },
})
```
:::

## 分片

测试分片是将测试套件拆分为组或分片的过程。当你拥有大型测试套件和多台可以同时运行该套件子集的机器时，这很有用。

要在多次不同的运行中拆分 Vitest 测试，请使用 [`--shard`](/guide/cli#shard) 选项配合 [`--reporter=blob`](/guide/reporters#blob-reporter) 选项：

```sh
vitest run --reporter=blob --shard=1/3 # 第 1 台机器
vitest run --reporter=blob --shard=2/3 # 第 2 台机器
vitest run --reporter=blob --shard=3/3 # 第 3 台机器
```

> Vitest 将你的 _测试文件_ 而不是测试用例拆分为分片。如果你有 1000 个测试文件，`--shard=1/4` 选项将运行 250 个测试文件，无论单个文件有多少个测试用例。

从每台机器收集存储在 `.vitest/blob/` 目录中的结果，并使用 [`--merge-reports`](/guide/cli#merge-reports) 选项将它们合并：

```sh
vitest run --merge-reports
```

当在多个环境中运行相同的分片时，请设置 `VITEST_BLOB_LABEL` 环境变量，以便合并后的报告可以分别显示它们：

```sh
VITEST_BLOB_LABEL=linux vitest run --reporter=blob --shard=1/3
```

::: details GitHub Actions 示例
此配置也用于 https://github.com/vitest-tests/test-sharding。

```yaml
# 灵感来自 https://playwright.dev/docs/test-sharding
name: Tests
on:
  push:
    branches:
      - main
jobs:
  tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Install pnpm
        uses: pnpm/action-setup@a7487c7e89a18df4991f7f222e4898a00d66ddda # v4.1.0

      - name: Install dependencies
        run: pnpm i

      - name: Run tests
        run: pnpm run test --reporter=blob --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
        env:
          VITEST_BLOB_LABEL: ${{ matrix.os }}

      - name: Upload Vitest results GitHub Actions Artifacts
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: vitest-results-${{ matrix.os }}-${{ matrix.shardIndex }}
          path: .vitest
          include-hidden-files: true
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: [tests]

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Install pnpm
        uses: pnpm/action-setup@a7487c7e89a18df4991f7f222e4898a00d66ddda # v4.1.0

      - name: Install dependencies
        run: pnpm i

      - name: Download Vitest results from GitHub Actions Artifacts
        uses: actions/download-artifact@v4
        with:
          path: .vitest
          merge-multiple: true

      - name: Merge reports
        run: npx vitest --merge-reports
```

如果你的测试创建了基于文件的附件（例如通过 `context.annotate` 或自定义产物），请在合并作业中上传并还原 [`attachmentsDir`](/config/attachmentsdir)，如上所示。

:::

:::tip
测试分片在高 CPU 数量的机器上也可能变得有用。

Vitest 将在其主线程中只运行一个 Vite 服务器。其余线程用于运行测试文件。
在高 CPU 数量的机器上，主线程可能成为瓶颈，因为它无法处理来自所有线程的请求。例如，在 32 CPU 机器上，主线程负责处理来自 31 个测试线程的负载。

为了减少主线程 Vite 服务器的负载，你可以使用测试分片。负载可以平衡到多个 Vite 服务器上。

```sh
# 在 32 CPU 上将测试拆分为 4 个分片的示例。
# 由于每个进程需要 1 个主线程，因此测试运行器有 7 个线程 (1+7)*4 = 32
# 使用 VITEST_MAX_WORKERS：
VITEST_MAX_WORKERS=7 vitest run --reporter=blob --shard=1/4 & \
VITEST_MAX_WORKERS=7 vitest run --reporter=blob --shard=2/4 & \
VITEST_MAX_WORKERS=7 vitest run --reporter=blob --shard=3/4 & \
VITEST_MAX_WORKERS=7 vitest run --reporter=blob --shard=4/4 & \
wait # https://man7.org/linux/man-pages/man2/waitpid.2.html

vitest run --merge-reports
```

:::
