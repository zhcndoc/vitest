---
title: 覆盖率 | 配置
outline: deep
---

# 覆盖率 <CRoot /> {#coverage}

你可以使用 [`v8`](/guide/coverage.html#v8-provider)、[`istanbul`](/guide/coverage.html#istanbul-provider) 或 [自定义覆盖率解决方案](/guide/coverage#custom-coverage-provider) 进行覆盖率收集。

你可以使用点表示法向 CLI 提供覆盖率选项：

```sh
npx vitest --coverage.enabled --coverage.provider=istanbul
```

::: warning
如果你使用点表示法指定覆盖率选项，别忘了指定 `--coverage.enabled`。在这种情况下不要只提供单个 `--coverage` 选项。
:::

## coverage.provider

- **类型：** `'v8' | 'istanbul' | 'custom'`
- **默认值：** `'v8'`
- **命令行：** `--coverage.provider=<provider>`

使用 `provider` 选择覆盖率收集工具。

## coverage.enabled

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.enabled`, `--coverage.enabled=false`

启用覆盖率收集。可以使用 `--coverage` 命令行选项覆盖。

## coverage.include

- **类型：** `string[]`
- **默认值：** 测试运行期间导入的文件
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.include=<pattern>`, `--coverage.include=<pattern1> --coverage.include=<pattern2>`

作为 glob 模式包含在覆盖率中的文件列表。默认情况下，只包含被测试覆盖的文件。

建议在模式中传递文件扩展名。

模式会根据每个文件相对于项目根目录的路径进行匹配。不包含 glob 通配符的模式会被视为目录，并匹配其中的所有内容，因此 `include: ['src']` 等同于 `include: ['src/**']`。

示例请参阅 [在覆盖率报告中包含和排除文件](/guide/coverage.html#including-and-excluding-files-from-coverage-report)。

## coverage.exclude

- **类型：** `string[]`
- **默认值：** `[]`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.exclude=<path>`, `--coverage.exclude=<path1> --coverage.exclude=<path2>`

以 glob 模式列出从覆盖率中排除的文件。模式的匹配方式与 [`coverage.include`](#coverage-include) 相同。

示例请参阅 [在覆盖率报告中包含和排除文件](/guide/coverage.html#including-and-excluding-files-from-coverage-report)。

## coverage.clean

- **类型：** `boolean`
- **默认值：** `true`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.clean`, `--coverage.clean=false`

在运行测试前清理覆盖率结果。

## coverage.cleanOnRerun

- **类型：** `boolean`
- **默认值：** `true`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.cleanOnRerun`, `--coverage.cleanOnRerun=false`

在监视模式重新运行时清理覆盖率报告。设置为 `false` 以在监视模式下保留上次运行的覆盖率结果。

## coverage.reportsDirectory

- **类型：** `string`
- **默认值：** `'./coverage'`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.reportsDirectory=<path>`

::: warning
如果启用了 `coverage.clean`（默认值），Vitest 将在运行测试前删除此目录。
:::

写入覆盖率报告的目录。

## coverage.reporter

- **类型：** `string | string[] | [string, {}][]`
- **默认值：** `['text', 'html', 'clover', 'json']`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.reporter=<reporter>`, `--coverage.reporter=<reporter1> --coverage.reporter=<reporter2>`

要使用的覆盖率报告器。有关所有报告器的详细列表，请参阅 [istanbul 文档](https://istanbul.js.org/docs/advanced/alternative-reporters/)。有关报告器特定选项的详细信息，请参阅 [`@types/istanbul-reports`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/276d95e4304b3670eaf6e8e5a7ea9e265a14e338/types/istanbul-reports/index.d.ts)。

报告器有三种不同的类型：

- 单个报告器：`{ reporter: 'html' }`
- 多个不带选项的报告器：`{ reporter: ['html', 'json'] }`
- 带报告器选项的单个或多个报告器：
  <!-- eslint-skip -->
  ```ts
  {
    reporter: [
      ['lcov', { 'projectRoot': './src' }],
      ['json', { 'file': 'coverage.json' }],
      ['text']
    ]
  }
  ```

你也可以传递自定义覆盖率报告器。有关更多信息，请参阅 [指南 - 自定义覆盖率报告器](/guide/coverage#custom-coverage-reporter)。

<!-- eslint-skip -->
```ts
  {
    reporter: [
      // 使用 NPM 包名指定报告器
      '@vitest/custom-coverage-reporter',
      ['@vitest/custom-coverage-reporter', { someOption: true }],

      // 使用本地路径指定报告器
      '/absolute/path/to/custom-reporter.cjs',
      ['/absolute/path/to/custom-reporter.cjs', { someOption: true }],
    ]
  }
```

你可以在 Vitest UI 中查看覆盖率报告：查看 [Vitest UI 覆盖率](/guide/coverage#vitest-ui) 了解更多详情。

::: tip AI coding agents
当 Vitest 检测到它正在 AI 编码代理中运行时，它会自动添加 `text-summary` 报告器，并将 `text` 报告器上的 `skipFull: true` 以减少输出并最小化 token 使用。
:::

## coverage.reportOnFailure {#coverage-reportonfailure}

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.reportOnFailure`, `--coverage.reportOnFailure=false`

即使测试失败也生成覆盖率报告。

## coverage.allowExternal

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.allowExternal`, `--coverage.allowExternal=false`

收集 [项目 `根目录`](/config/root) 之外文件的覆盖率。

## coverage.excludeAfterRemap

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.excludeAfterRemap`, `--coverage.excludeAfterRemap=false`

在覆盖率重新映射到原始源代码后再次应用排除项。
当你的源文件经过转译并且可能包含非源文件的源代码映射时，这很有用。

当你看到即使文件匹配你的 `coverage.exclude` 模式仍然出现在报告中时，使用此选项。

## coverage.skipFull

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.skipFull`, `--coverage.skipFull=false`

不显示语句、分支和函数覆盖率为 100% 的文件。

## coverage.thresholds

覆盖率阈值选项。

如果阈值设置为正数，它将被解释为所需的最低覆盖率百分比。例如，将行阈值设置为 `90` 意味着必须覆盖 90% 的行。

如果阈值设置为负数，它将被视为允许的最大未覆盖项数量。例如，将行阈值设置为 `-10` 意味着未覆盖的行数不得超过 10 行。

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      // 需要 90% 的函数覆盖率
      functions: 90,

      // 要求未覆盖的行数不超过 10 行
      lines: -10,
    }
  }
}
```

### coverage.thresholds.lines

- **类型：** `number`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.lines=<number>`

行的全局阈值。

### coverage.thresholds.functions

- **类型：** `number`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.functions=<number>`

函数的全局阈值。

### coverage.thresholds.branches

- **类型：** `number`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.branches=<number>`

分支的全局阈值。

### coverage.thresholds.statements

- **类型：** `number`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.statements=<number>`

语句的全局阈值。

### coverage.thresholds.perFile

- **类型：** `boolean | { 100?: boolean, lines?: number, functions?: number, branches?: number, statements?: number }`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.perFile`, `--coverage.thresholds.perFile=false`

当为 `true` 时，每个文件都会按顶层阈值进行检查，而不是按项目范围的汇总值进行检查。当设置为对象时，两者都会被检查：汇总值按顶层阈值检查，每个文件按这些按文件最低阈值检查。

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      perFile: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    }
  }
}
```

对象中也可以接受 `{ 100: true }` 作为将全部四项指标设置为 `100` 的快捷方式：

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      lines: 80,
      perFile: {
        100: true,
      },
    }
  }
}
```

`perFile` 也可以在单个 [glob 模式阈值](/config/coverage#coverage-thresholds-glob-pattern) 上设置。glob 模式**不会**继承顶层的 `perFile`；请在每个 glob 上单独设置。

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      perFile: true,
      lines: 80,

      'src/utils/**': {
        lines: 90,
        perFile: true,
      },
    }
  }
}
```

### coverage.thresholds.autoUpdate

- **类型：** `boolean | function`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.autoUpdate=<boolean>`

当当前覆盖率优于配置的阈值时，将所有阈值 `lines`、`functions`、`branches` 和 `statements` 更新到配置文件中。
此选项有助于在覆盖率提高时维护阈值。

你也可以传递一个用于格式化更新后阈值值的函数。该函数接收新的阈值作为第一个参数，接收之前的阈值作为第二个参数：

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      // 记录变更并在不保留小数的情况下更新
      autoUpdate: (newThreshold, previousThreshold) => {
        console.log(`Updated threshold from ${previousThreshold} to ${newThreshold}`)
        return Math.floor(newThreshold)
      },

      // 95.85 -> 95
      functions: 95,
    }
  }
}
```

### coverage.thresholds.100

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.thresholds.100`, `--coverage.thresholds.100=false`

将全局阈值设置为 100。
`--coverage.thresholds.lines 100 --coverage.thresholds.functions 100 --coverage.thresholds.branches 100 --coverage.thresholds.statements 100` 的快捷方式。

### coverage.thresholds[glob-pattern]

- **类型：** `{ statements?: number, functions?: number, branches?: number, lines?: number, perFile?: boolean | object }`
- **默认值：** `undefined`
- **适用提供者：** `'v8' | 'istanbul'`

为匹配 glob 模式的文件设置阈值。

每个 glob 模式都可以设置自己的 `perFile`（`boolean | object`），其检查方式与顶层 `perFile` 完全相同，但作用域限定为匹配的文件。glob 模式不会继承顶层的 `perFile`——请为每个 glob 单独设置。

::: tip NOTE
Vitest 会将所有文件（包括被 glob 模式覆盖的文件）计入全局覆盖率阈值。
这与 Jest 的行为不同。
:::

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      // 所有文件的阈值
      functions: 95,
      branches: 70,

      // 匹配 glob 模式的文件的阈值
      'src/utils/**.ts': {
        statements: 95,
        functions: 90,
        branches: 85,
        lines: 80,
        // 每个匹配文件都必须单独达到上述阈值
        perFile: true,
      },

      // 匹配此模式的文件将只设置行阈值。
      // 不继承全局阈值。
      '**/math.ts': {
        lines: 100,
      }
    }
  }
}
```

### coverage.thresholds[glob-pattern].100

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8' | 'istanbul'`

为匹配 glob 模式的文件将阈值设置为 100。

<!-- eslint-skip -->
```ts
{
  coverage: {
    thresholds: {
      // 所有文件的阈值
      functions: 95,
      branches: 70,

      // 匹配 glob 模式的文件的阈值
      'src/utils/**.ts': { 100: true },
      '**/math.ts': { 100: true }
    }
  }
}
```

## coverage.ignoreClassMethods

- **类型：** `string[]`
- **默认值：** `[]`
- **适用提供者：** `'v8' | 'istanbul'`
- **CLI：** `--coverage.ignoreClassMethods=<method>`

设置为要忽略覆盖率的类方法名称数组。
参见 [istanbul 文档](https://github.com/istanbuljs/nyc#ignoring-methods) 获取更多信息。

## coverage.watermarks

- **类型：**
<!-- eslint-skip -->
```ts
{
  statements?: [number, number],
  functions?: [number, number],
  branches?: [number, number],
  lines?: [number, number]
}
```

- **默认值：**
<!-- eslint-skip -->
```ts
{
  statements: [50, 80],
  functions: [50, 80],
  branches: [50, 80],
  lines: [50, 80]
}
```

- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.watermarks.statements=50,80`, `--coverage.watermarks.branches=50,80`

语句、行、分支和函数的水印值。参见 [istanbul 文档](https://github.com/istanbuljs/nyc#high-and-low-watermarks) 获取更多信息。

## coverage.processingConcurrency

- **类型：** `boolean`
- **默认值：** `Math.min(20, os.availableParallelism?.() ?? os.cpus().length)`
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.processingConcurrency=<number>`

处理覆盖率结果时使用的并发限制。

## coverage.instrumenter <Version type="experimental">4.1.5</Version> {#coverage-instrumenter}

- **类型：** `(options: InstrumenterOptions) => CoverageInstrumenter`
- **适用提供者：** `'istanbul'`

用于替代默认 `istanbul-lib-instrument` 的自定义 instrumenter 工厂。Vitest 会在初始化期间调用一次该工厂，并在每个文件中复用返回的 instrumenter。Istanbul 管道的其余部分（收集、合并、报告）保持不变。

该工厂接收一个包含 Vitest 运行时覆盖率设置的 `InstrumenterOptions` 对象，并且必须返回一个实现 `CoverageInstrumenter` 接口的对象。这两个类型都从 `vitest/node` 导出。

<!-- eslint-skip -->
```ts
interface InstrumenterOptions {
  coverageVariable: string
  coverageGlobalScope: string
  coverageGlobalScopeFunc: boolean
  ignoreClassMethods: string[]
}

interface CoverageInstrumenter {
  instrumentSync: (code: string, filename: string, inputSourceMap?: any) => string
  lastSourceMap: () => any
  lastFileCoverage: () => any
}
```

<!-- eslint-skip -->
```ts
import { defineConfig } from 'vitest/config'
import { createInstrumenter } from '@vitest/some-custom-instrumenter'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      instrumenter: options => createInstrumenter(options),
    }
  }
})
```

## coverage.customProviderModule

- **类型：** `string`
- **适用提供者：** `'custom'`
- **命令行：** `--coverage.customProviderModule=<path or module name>`

指定自定义覆盖率提供者模块的模块名称或路径。参见 [指南 - 自定义覆盖率提供者](/guide/coverage#custom-coverage-provider) 获取更多信息。

## coverage.htmlDir

- **类型：** `string`
- **默认值：** 自动从 `html`、`html-spa` 或 `lcov` 覆盖率报告器推断
- **命令行：** `--coverage.htmlDir=<path>`

要在 [Vitest UI](/guide/ui) 和 [HTML 报告器](/guide/reporters.html#html-reporter) 中展示的 HTML 覆盖率输出目录。

当使用生成 HTML 输出的内置覆盖率报告器（`html`、`html-spa` 和 `lcov`）时，此选项会自动配置。当使用自定义覆盖率报告器时，可使用此选项覆盖设置为自定义覆盖率报告位置。

注意，设置此选项不会更改覆盖率 HTML 报告的生成位置。请改为配置 `coverage.reporter` 选项来更改目录。

## coverage.changed

- **类型：** `boolean | string`
- **默认值：** `false`（继承自 `test.changed`）
- **适用提供者：** `'v8' | 'istanbul'`
- **命令行：** `--coverage.changed`, `--coverage.changed=<commit/branch>`

仅为自指定提交或分支以来发生更改的文件收集覆盖率。当设置为 `true` 时，它会使用已暂存和未暂存的更改。

## coverage.autoAttachSubprocess <Version>5.0.0</Version> {#coverage-autoattachsubprocess}

- **类型：** `boolean`
- **默认值：** `false`
- **适用提供者：** `'v8'`
- **命令行：** `--coverage.autoAttachSubprocess`

跟踪测试运行期间生成的 `node:child_process` 和 `node:worker_threads` 的覆盖率。

请注意，此选项会带来一定的性能开销，因为它内部使用了 [`NODE_V8_COVERAGE`](https://nodejs.org/api/cli.html#node-v8-coveragedir)。这会导致 Node 在文件系统上写入大量不必要的文件。
