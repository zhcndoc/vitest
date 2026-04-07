---
title: sequence | 配置
outline: deep
---

# sequence

- **类型**: `{ sequencer?, shuffle?, seed?, hooks?, setupFiles?, groupOrder }`

测试排序方式的选项。

你可以使用点表示法向 CLI 提供 sequence 选项：

```sh
npx vitest --sequence.shuffle --sequence.seed=1000
```

## sequence.sequencer <CRoot />

- **类型**: `TestSequencerConstructor`
- **默认值**: `BaseSequencer`

一个自定义类，用于定义分片和排序的方法。如果你只需要重新定义 `sort` 和 `shard` 方法中的一个，可以从 `vitest/node` 扩展 `BaseSequencer`，但两者都必须存在。

分片发生在排序之前，且仅在提供了 `--shard` 选项时发生。

如果指定了 [`sequence.groupOrder`](#sequence-grouporder)，sequencer 将为每个组和池调用一次。

## sequence.groupOrder

- **类型:** `number`
- **默认值:** `0`

控制在使用多个 [项目](/guide/projects) 时，该项目运行测试的顺序。

- 具有相同组顺序号的项目将一起运行，组按从低到高的顺序运行。
- 如果不设置此选项，所有项目将并行运行。
- 如果几个项目使用相同的组顺序，它们将同时运行。

此设置仅影响项目运行的顺序，不影响项目内测试的顺序。
要控制测试隔离或项目内测试的顺序，请使用 [`isolate`](/config/isolate) 和 [`sequence.sequencer`](/config/sequence#sequence-sequencer) 选项。

::: details 示例
考虑此示例：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'slow',
          sequence: {
            groupOrder: 0,
          },
        },
      },
      {
        test: {
          name: 'fast',
          sequence: {
            groupOrder: 0,
          },
        },
      },
      {
        test: {
          name: 'flaky',
          sequence: {
            groupOrder: 1,
          },
        },
      },
    ],
  },
})
```

这些项目中的测试将按以下顺序运行：

```
 0. slow  |
          |> 一起运行
 0. fast  |

 1. flaky |> 在 slow 和 fast 之后单独运行
```
:::

## sequence.shuffle

- **类型**: `boolean | { files?, tests? }`
- **默认值**: `false`
- **CLI**: `--sequence.shuffle`, `--sequence.shuffle=false`

如果你希望文件和测试随机运行，可以通过此选项或 CLI 参数 [`--sequence.shuffle`](/guide/cli) 启用它。

Vitest 通常使用缓存来排序测试，因此运行时间较长的测试会更早开始，从而使测试运行得更快。如果你的文件和测试按随机顺序运行，你将失去这种性能改进，但它可能有助于跟踪偶然依赖于之前运行的另一个测试的测试。

### sequence.shuffle.files {#sequence-shuffle-files}

- **类型**: `boolean`
- **默认值**: `false`
- **CLI**: `--sequence.shuffle.files`, `--sequence.shuffle.files=false`

是否随机化文件，请注意，如果启用此选项，运行时间较长的测试将不会更早开始。

### sequence.shuffle.tests {#sequence-shuffle-tests}

- **类型**: `boolean`
- **默认值**: `false`
- **CLI**: `--sequence.shuffle.tests`, `--sequence.shuffle.tests=false`

是否随机化测试。

## sequence.concurrent {#sequence-concurrent}

- **类型**: `boolean`
- **默认值**: `false`
- **CLI**: `--sequence.concurrent`, `--sequence.concurrent=false`

如果你希望测试并行运行，可以通过此选项或 CLI 参数 [`--sequence.concurrent`](/guide/cli) 启用它。

::: warning
当你在 `sequence.concurrent` 和 `expect.requireAssertions` 设置为 `true` 的情况下运行测试时，应该使用 [本地 expect](/guide/test-context.html#expect) 而不是全局的。否则，这可能在 [某些情况 (#8469)](https://github.com/vitest-dev/vitest/issues/8469) 导致假阴性。
:::

## sequence.seed <CRoot />

- **类型**: `number`
- **默认值**: `Date.now()`
- **CLI**: `--sequence.seed=1000`

设置随机化种子，如果测试按随机顺序运行。

## sequence.hooks

- **类型**: `'stack' | 'list' | 'parallel'`
- **默认值**: `'stack'`
- **CLI**: `--sequence.hooks=<value>`

更改钩子执行的顺序。

- `stack` 将以相反顺序排列 "after" 钩子，"before" 钩子将按定义顺序运行
- `list` 将按定义顺序排列所有钩子
- `parallel` 并行运行单个组中的钩子（父套件中的钩子仍然在当前套件的钩子之前运行）。同时运行的钩子的实际数量受 [`maxConcurrency`](/config/maxconcurrency) 限制。

::: tip
此选项不影响 [`onTestFinished`](/api/hooks#ontestfinished)。它总是按相反顺序调用。
:::

## sequence.setupFiles {#sequence-setupfiles}

- **类型**: `'list' | 'parallel'`
- **默认值**: `'parallel'`
- **CLI**: `--sequence.setupFiles=<value>`

更改 setup 文件执行的顺序。

- `list` 将按定义顺序运行 setup 文件
- `parallel` 将并行运行 setup 文件
