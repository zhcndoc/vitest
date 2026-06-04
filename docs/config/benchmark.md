---
title: benchmark | 配置
outline: deep
---

# benchmark <Experimental /> {#benchmark}

- **类型:** `{ include?, exclude?, ... }`

运行 `vitest bench` 时使用的选项。

## benchmark.enabled

- **Type:** `boolean`
- **Default:** `false`

启用基准测试项目。设置后，Vitest 会在常规测试项目旁边创建一个专用的基准测试项目，在其中运行匹配 [`benchmark.include`](#benchmark-include) 的文件，并向这些文件暴露 [`bench` fixture](/guide/test-context#bench)。运行 `vitest bench` 会自动启用此功能。

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

## benchmark.retainSamples

- **Type:** `boolean`
- **Default:** `false`

在每个基准测试结果中包含每次迭代耗时的 `samples` 数组。默认禁用以减少内存使用；当自定义 reporter 或 API 消费者需要原始样本时，请启用此选项。


## benchmark.suppressExportGetterWarnings

- **Type:** `boolean`
- **Default:** `false`

抑制当基准测试过于频繁地访问模块导出 getter 时打印的警告。Vitest 会在基准测试运行期间跟踪 getter 访问，因为 Vite 的模块运行器会将每个导出都包装在 getter 中，而过度访问会主导测量结果（参见 [Module Runner Overhead](/guide/benchmarking#module-runner-overhead)）。当你明确接受了这种开销，或在 getter 成本可以忽略不计、警告又很干扰基准测试时，请启用此选项。

