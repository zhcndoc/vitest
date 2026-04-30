# 提升性能

## 测试隔离

默认情况下，Vitest 基于 [pool](/config/pool) 在隔离环境中运行每个测试文件：

- `threads` 池在单独的 [`Worker`](https://nodejs.org/api/worker_threads.html#class-worker) 中运行每个测试文件
- `forks` 池在单独的 [forked child process](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options) 中运行每个测试文件
- `vmThreads` 池在单独的 [VM context](https://nodejs.org/api/vm.html#vmcreatecontextcontextobject-options) 中运行每个测试文件，但它使用 worker 来实现并行

这会大大增加测试时间，对于不依赖副作用并正确清理状态的项目来说，这可能不是理想的（对于 `node` 环境的项目通常是这样）。在这种情况下，禁用隔离将提高测试速度。为此，你可以向 CLI 提供 `--no-isolate` 标志，或在配置中将 [`test.isolate`](/config/isolate) 属性设置为 `false`。

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
          isolate: true, // (默认值)
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

对于某些项目，可能还需要禁用并行性以提高启动时间。为此，向 CLI 提供 `--no-file-parallelism` 标志，或在配置中将 [`test.fileParallelism`](/config/fileparallelism) 属性设置为 `false`。

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

## 限制目录搜索

你可以使用 [`test.dir`](/config/dir) 选项限制 Vitest 搜索文件时的工作目录。如果你的根目录中有不相关的文件夹和文件，这应该会使搜索更快。

## 重运行之间的缓存

在 watch 模式下，Vitest 会将所有转换后的文件缓存到内存中，这使得重运行变得很快。然而，一旦测试运行结束，这个缓存就会被丢弃。通过启用 [`experimental.fsModuleCache`](/config/experimental#experimental-fsmodulecache)，Vitest 会将此缓存持久化到文件系统，以便在重运行之间复用。

这种改进最为明显的是当重运行依赖大型模块图的少量测试时。对于完整的测试套件，并行化已经减轻了成本，因为其他测试会在早期测试仍在运行时填充内存缓存。例如，运行一个具有巨大模块图（>900 个模块）的测试文件：

```shell
# 第一次运行
Duration  8.75s (transform 4.02s, setup 629ms, import 5.52s, tests 2.52s, environment 0ms, prepare 3ms)

# 第二次运行
Duration  5.90s (transform 842ms, setup 543ms, import 2.35s, tests 2.94s, environment 0ms, prepare 3ms)
```

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

从每台机器收集存储在 `.vitest-reports` 目录中的结果，并使用 [`--merge-reports`](/guide/cli#merge-reports) 选项合并它们：

```sh
vitest run --merge-reports
```

::: details GitHub Actions 示例
此设置也用于 https://github.com/vitest-tests/test-sharding。

```yaml
# 灵感来自 https://playwright.dev/docs/test-sharding
name: Tests
on:
  push:
    branches:
      - main
jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@a7487c7e89a18df4991f7f222e4898a00d66ddda # v4.1.0

      - name: Install dependencies
        run: pnpm i

      - name: Run tests
        run: pnpm run test --reporter=blob --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}

      - name: Upload blob report to GitHub Actions Artifacts
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: .vitest-reports/*
          include-hidden-files: true
          retention-days: 1

      - name: Upload attachments to GitHub Actions Artifacts
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-attachments-${{ matrix.shardIndex }}
          path: .vitest/**
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
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@a7487c7e89a18df4991f7f222e4898a00d66ddda # v4.1.0

      - name: Install dependencies
        run: pnpm i

      - name: Download blob reports from GitHub Actions Artifacts
        uses: actions/download-artifact@v4
        with:
          path: .vitest-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Download attachments from GitHub Actions Artifacts
        uses: actions/download-artifact@v4
        with:
          path: .vitest
          pattern: blob-attachments-*
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
