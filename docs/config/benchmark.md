---
title: benchmark | 配置
outline: deep
---

# benchmark <Experimental /> {#benchmark}

- **类型:** `{ include?, exclude?, ... }`

运行 `vitest bench` 时使用的选项。

## benchmark.include

- **类型:** `string[]`
- **默认值:** `['**/*.{bench,benchmark}.?(c|m)[jt]s?(x)']`

包含基准测试文件的匹配模式

## benchmark.exclude

- **类型:** `string[]`
- **默认值:** `['node_modules', 'dist', '.idea', '.git', '.cache']`

排除基准测试文件的匹配模式

## benchmark.includeSource

- **类型:** `string[]`
- **默认值:** `[]`

包含源内基准测试文件的匹配模式。此选项类似于 [`includeSource`](/config/include-source)。

定义后，Vitest 将运行所有内部包含 `import.meta.vitest` 的匹配文件。

## benchmark.reporters

- **类型:** `Arrayable<BenchmarkBuiltinReporters | Reporter>`
- **默认值:** `'default'`

用于输出的自定义报告器。可以包含一个或多个内置报告器名称、报告器实例和/或自定义报告器的路径。

## benchmark.outputFile

已弃用，推荐使用 `benchmark.outputJson`。

## benchmark.outputJson {#benchmark-outputJson}

- **类型:** `string | undefined`
- **默认值:** `undefined`

存储基准测试结果的文件路径，后续可用于 `--compare` 选项。

例如：

```sh
# 保存主分支的结果
git checkout main
vitest bench --outputJson main.json

# 切换分支并与主分支比较
git checkout feature
vitest bench --compare main.json
```

## benchmark.compare {#benchmark-compare}

- **类型:** `string | undefined`
- **默认值:** `undefined`

用于与当前运行结果进行比较的先前基准测试结果的文件路径。
