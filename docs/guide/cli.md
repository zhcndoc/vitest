---
title: 命令行界面 | 指南
outline: deep
---

# 命令行界面

## 命令

### `vitest`

在当前目录启动 Vitest。在开发环境中会自动进入监视模式，在 CI（或非交互式终端）中会自动进入运行模式。

你可以传递一个额外的参数作为要运行的测试文件的过滤器。例如：

```bash
vitest foobar
```

将只运行路径中包含 `foobar` 的测试文件。此过滤器仅检查包含关系，不支持正则表达式或 glob 模式（除非你的终端在 Vitest 接收过滤器之前处理了它）。

自 Vitest 3 起，你还可以通过文件名和行号指定测试：

```bash
$ vitest basic/foo.test.ts:10
```

::: warning
注意，Vitest 需要完整的文件名才能使此功能正常工作。它可以相对于当前工作目录，也可以是绝对文件路径。

```bash
$ vitest basic/foo.js:10 # ✅
$ vitest ./basic/foo.js:10 # ✅
$ vitest /users/project/basic/foo.js:10 # ✅
$ vitest foo:10 # ❌
$ vitest ./basic/foo:10 # ❌
```

目前 Vitest 也不支持范围：

```bash
$ vitest basic/foo.test.ts:10, basic/foo.test.ts:25 # ✅
$ vitest basic/foo.test.ts:10-25 # ❌
```
:::

### `vitest run`

执行单次运行，不进入监视模式。

### `vitest watch`

运行所有测试套件，但监视更改并在更改时重新运行测试。与不带参数调用 `vitest` 相同。在 CI 中或当 stdin 不是 TTY（非交互式环境）时将回退到 `vitest run`。

### `vitest dev`

`vitest watch` 的别名。

### `vitest related`

仅运行覆盖一系列源文件的测试。适用于静态导入（例如，`import('./index.js')` 或 `import index from './index.js`），但不适用于动态导入（例如，`import(filepath)`）。所有文件应相对于根文件夹。

适合与 [`lint-staged`](https://github.com/okonet/lint-staged) 或你的 CI 设置一起运行。

```bash
vitest related /src/index.ts /src/hello-world.js
```

::: tip
别忘了 Vitest 默认启用监视模式运行。如果你正在使用像 `lint-staged` 这样的工具，你还应该传递 `--run` 选项，以便命令可以正常退出。

```js [.lintstagedrc.js]
export default {
  '*.{js,ts}': 'vitest related --run',
}
```
:::

### `vitest bench`

仅运行 [基准测试](/guide/features.html#benchmarking) 测试，比较性能结果。

### `vitest init`

`vitest init <name>` 可用于设置项目配置。目前，它仅支持 [`browser`](/guide/browser/) 值：

```bash
vitest init browser
```

### `vitest list`

`vitest list` 命令继承所有 `vitest` 选项以打印所有匹配测试的列表。此命令忽略 `reporters` 选项。默认情况下，它将打印所有匹配文件过滤器和名称模式的测试名称：

```shell
vitest list filename.spec.ts -t="some-test"
```

```txt
describe > some-test
describe > some-test > test 1
describe > some-test > test 2
```

你可以传递 `--json` 标志以 JSON 格式打印测试或将其保存到单独的文件中：

```bash
vitest list filename.spec.ts -t="some-test" --json=./file.json
```

如果 `--json` 标志没有接收值，它将把 JSON 输出到 stdout。

你还可以传递 `--filesOnly` 标志仅打印测试文件：

```bash
vitest list --filesOnly
```

```txt
tests/test1.test.ts
tests/test2.test.ts
```

自 Vitest 4.1 起，你可以传递 `--static-parse` 来 [解析测试文件](/api/advanced/vitest#parsespecifications) 而不是运行它们来收集测试。Vitest 以有限的并发度解析测试文件，默认为 `os.availableParallelism()`。你可以通过 `--static-parse-concurrency` 选项更改它。

## Shell 自动补全

Vitest 为命令、选项和选项值提供 Shell 自动补全，由 [`@bomb.sh/tab`](https://github.com/bombshell-dev/tab) 提供支持。

### 设置

要在 zsh 中永久设置，请将此添加到你的 `~/.zshrc`：

```bash
# 添加到 ~/.zshrc 以实现永久自动补全（其他 shell 也可以这样做）
source <(vitest complete zsh)
```

### 包管理器集成

`@bomb.sh/tab` 与 [包管理器](https://github.com/bombshell-dev/tab?tab=readme-ov-file#package-manager-completions) 集成。直接运行 vitest 时自动补全生效：

::: code-group

```bash [npm]
npm vitest <Tab>
```

```bash [npm]
npm exec vitest <Tab>
```

```bash [pnpm]
pnpm vitest <Tab>
```

```bash [yarn]
yarn vitest <Tab>
```

```bash [bun]
bun vitest <Tab>
```

:::

对于包管理器自动补全，你应该单独安装 [tab 的包管理器补全](https://github.com/bombshell-dev/tab?tab=readme-ov-file#package-manager-completions)。

## 选项

::: tip
Vitest 支持 [CLI 参数](https://github.com/cacjs/cac#dot-nested-options) 的驼峰式和短横线式。例如，`--passWithNoTests` 和 `--pass-with-no-tests` 都有效（`--no-color` 和 `--inspect-brk` 除外）。

Vitest 还支持不同的指定值的方式：`--reporter dot` 和 `--reporter=dot` 都有效。

如果选项支持值数组，你需要多次传递该选项：

```
vitest --reporter=dot --reporter=default
```

布尔选项可以用 `no-` 前缀否定。将值指定为 `false` 也有效：

```
vitest --no-api
vitest --api=false
```
:::

<!--@include: ./cli-generated.md-->

### changed

- **Type:** `boolean | string`
- **Default:** false

仅针对更改的文件运行测试。如果未提供值，它将针对未提交的更改运行测试（包括暂存和未暂存的）。

要针对最后一次提交中的更改运行测试，你可以使用 `--changed HEAD~1`。你也可以传递提交哈希（例如 `--changed 09a9920`）或分支名称（例如 `--changed origin/develop`）。

与代码覆盖率一起使用时，报告将仅包含与更改相关的文件。

如果与 [`forceRerunTriggers`](/config/forcereruntriggers) 配置选项配对使用，如果 `forceRerunTriggers` 列表中列出的文件至少有一个发生更改，它将运行整个测试套件。默认情况下，对 Vitest 配置文件和 `package.json` 的更改将始终重新运行整个套件。

### shard

- **Type:** `string`
- **Default:** disabled

要执行的测试套件分片，格式为 `<index>`/`<count>`，其中

- `count` 是一个正整数，分割部分的数量
- `index` 是一个正整数，分割部分的索引

此命令将所有测试分为 `count` 个相等的部分，并仅运行恰好位于 `index` 部分的那些测试。例如，要将测试套件分为三部分，请使用此命令：

```sh
vitest run --shard=1/3
vitest run --shard=2/3
vitest run --shard=3/3
```

:::warning
你不能在启用 `--watch` 的情况下使用此选项（开发模式下默认启用）。
:::

::: tip
如果 `--reporter=blob` 在没有输出文件的情况下使用，默认路径将包含当前的分片配置，以避免与其他 Vitest 进程冲突。
:::

### merge-reports

- **类型:** `boolean | string`

合并位于指定文件夹（默认为 `.vitest-reports`）中的每个 blob 报告。你可以将此命令与任何报告器一起使用（[`blob`](/guide/reporters#blob-reporter) 除外）：

```sh
vitest --merge-reports --reporter=junit
```
