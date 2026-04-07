---
title: typecheck | 配置
outline: deep
---

# typecheck <Experimental /> {#typecheck}

用于配置 [类型检查](/guide/testing-types) 测试环境的选项。

## typecheck.enabled {#typecheck-enabled}

- **类型**: `boolean`
- **默认值**: `false`
- **CLI**: `--typecheck`, `--typecheck.enabled`

在常规测试的同时启用类型检查。

## typecheck.only {#typecheck-only}

- **类型**: `boolean`
- **默认值**: `false`
- **CLI**: `--typecheck.only`

当启用类型检查时，仅运行类型检查测试。使用 CLI 时，此选项将自动启用类型检查。

## typecheck.checker

- **类型**: `'tsc' | 'vue-tsc' | string`
- **默认值**: `tsc`

使用何种工具进行类型检查。Vitest 将根据类型生成带有特定参数的进程以便于解析。检查器应实现与 `tsc` 相同的输出格式。

你需要安装一个包才能使用类型检查器：

- `tsc` 需要 `typescript` 包
- `vue-tsc` 需要 `vue-tsc` 包

你也可以传递自定义二进制文件的路径或命令名称，只要它产生的输出与 `tsc --noEmit --pretty false` 相同。

## typecheck.include

- **类型**: `string[]`
- **默认值**: `['**/*.{test,spec}-d.?(c|m)[jt]s?(x)']`

应被视为测试文件的文件的 Glob 模式

## typecheck.exclude

- **类型**: `string[]`
- **默认值**: `['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**']`

不应被视为测试文件的文件的 Glob 模式

## typecheck.allowJs

- **类型**: `boolean`
- **默认值**: `false`

检查具有 `@ts-check` 注释的 JS 文件。如果你在 tsconfig 中启用了它，此项不会覆盖它。

## typecheck.ignoreSourceErrors

- **类型**: `boolean`
- **默认值**: `false`

如果 Vitest 在测试文件之外发现错误，不要使测试失败。这根本不会向你显示非测试错误。

默认情况下，如果 Vitest 发现源代码错误，它将使测试套件失败。

## typecheck.tsconfig

- **类型**: `string`
- **默认值**: _尝试查找最近的 tsconfig.json_

自定义 tsconfig 的路径，相对于项目根目录。

## typecheck.spawnTimeout

- **类型**: `number`
- **默认值**: `10_000`

生成类型检查器所需的最短时间（毫秒）。
