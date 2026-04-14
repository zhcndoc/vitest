---
title: 覆盖率 | 指南
---

# 覆盖率

Vitest 支持通过 [`v8`](https://v8.dev/blog/javascript-code-coverage) 的原生代码覆盖率，以及通过 [`istanbul`](https://istanbul.js.org/) 的插桩代码覆盖率。

## 覆盖率提供者

`v8` 和 `istanbul` 支持都是可选的。默认情况下，将使用 `v8`。

你可以通过将 `test.coverage.provider` 设置为 `v8` 或 `istanbul` 来选择覆盖率工具：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8' // 或 'istanbul'
    },
  },
})
```

当你启动 Vitest 进程时，它会提示你自动安装相应的支持包。

或者如果你更喜欢手动安装它们：

::: code-group
```bash [v8]
npm i -D @vitest/coverage-v8
```
```bash [istanbul]
npm i -D @vitest/coverage-istanbul
```
:::

## V8 提供者

::: info
下面关于 V8 覆盖率的描述是 Vitest 特有的，不适用于其他测试运行器。
自 `v3.2.0` 以来，Vitest 对 V8 覆盖率使用了 [基于 AST 的覆盖率重映射](/blog/vitest-3-2#coverage-v8-ast-aware-remapping)，生成的覆盖率报告与 Istanbul 相同。

这允许用户拥有 V8 覆盖率的速度和 Istanbul 覆盖率的准确性。
:::

默认情况下，Vitest 使用 `'v8'` 覆盖率提供者。
此提供者需要基于 [V8 引擎](https://v8.dev/) 实现的 Javascript 运行时，例如 NodeJS、Deno 或任何基于 Chromium 的浏览器（如 Google Chrome）。

覆盖率收集是在运行时通过 [`node:inspector`](https://nodejs.org/api/inspector.html) 指示 V8 以及在浏览器中使用 [Chrome DevTools 协议](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/) 进行的。用户的源文件可以直接执行，无需任何预插桩步骤。

- ✅ 推荐使用的选项
- ✅ 无需预转译步骤。测试文件可以直接执行。
- ✅ 执行速度比 Istanbul 快。
- ✅ 内存使用量比 Istanbul 低。
- ✅ 覆盖率报告准确性与 Istanbul 一样好（[自 Vitest `v3.2.0` 起](/blog/vitest-3-2#coverage-v8-ast-aware-remapping)）。
- ⚠️ 在某些情况下可能比 Istanbul 慢，例如加载许多不同模块时。V8 不支持将覆盖率收集限制在特定模块。
- ⚠️ V8 引擎设置了一些轻微的限制。参见 [`ast-v8-to-istanbul` | 限制](https://github.com/AriPerkkio/ast-v8-to-istanbul?tab=readme-ov-file#limitations)。
- ❌ 不适用于不使用 V8 的环境，例如 Firefox 或 Bun。或者不适用于不通过 profiler 暴露 V8 覆盖率的环境，例如 Cloudflare Workers。

<script setup>
import ArrowDown from '../.vitepress/components/ArrowDown.vue'
import Box from '../.vitepress/components/Box.vue'
</script>

<div style="display: flex; flex-direction: column; align-items: center; padding: 2rem 0; max-width: 20rem;">
  <Box>测试文件</Box>
  <ArrowDown />
  <Box>启用 V8 运行时覆盖率收集</Box>
  <ArrowDown />
  <Box>运行文件</Box>
  <ArrowDown />
  <Box>从 V8 收集覆盖率结果</Box>
  <ArrowDown />
  <Box>将覆盖率结果重映射到源文件</Box>
  <ArrowDown />
  <Box>覆盖率报告</Box>
</div>

## Istanbul 提供者

[Istanbul 代码覆盖率工具](https://istanbul.js.org/) 自 2012 年以来就一直存在，并且经过了充分的实战测试。
此提供者适用于任何 Javascript 运行时，因为覆盖率跟踪是通过插桩用户的源文件完成的。

实际上，插桩源文件意味着在用户的文件中添加额外的 Javascript：

```js
// 分支和函数覆盖率计数器的简化示例
const coverage = { // [!code ++]
  branches: { 1: [0, 0] }, // [!code ++]
  functions: { 1: 0 }, // [!code ++]
} // [!code ++]

export function getUsername(id) {
  // 当此被调用时函数覆盖率增加  // [!code ++]
  coverage.functions['1']++ // [!code ++]

  if (id == null) {
    // 当此被调用时分支覆盖率增加  // [!code ++]
    coverage.branches['1'][0]++ // [!code ++]

    throw new Error('User ID is required')
  }
  // 当 if 语句条件不满足时隐式 else 覆盖率增加  // [!code ++]
  coverage.branches['1'][1]++ // [!code ++]

  return database.getUser(id)
}

globalThis.__VITEST_COVERAGE__ ||= {} // [!code ++]
globalThis.__VITEST_COVERAGE__[filename] = coverage // [!code ++]
```

- ✅ 适用于任何 Javascript 运行时
- ✅ 广泛使用并经过超过 13 年的实战测试。
- ✅ 在某些情况下比 V8 快。覆盖率插桩可以限制在特定文件，而 V8 则是所有模块都被插桩。
- ❌ 需要预插桩步骤
- ❌ 由于插桩开销，执行速度比 V8 慢
- ❌ 插桩会增加文件大小
- ❌ 内存使用量比 V8 高

<div style="display: flex; flex-direction: column; align-items: center; padding: 2rem 0; max-width: 20rem;">
  <Box>测试文件</Box>
  <ArrowDown />
  <Box>使用 Babel 预插桩</Box>
  <ArrowDown />
  <Box>运行文件</Box>
  <ArrowDown />
  <Box>从 Javascript 作用域收集覆盖率结果</Box>
  <ArrowDown />
  <Box>将覆盖率结果重映射到源文件</Box>
  <ArrowDown />
  <Box>覆盖率报告</Box>
</div>

## 覆盖率设置

::: tip
所有覆盖率选项都列在 [覆盖率配置参考](/config/coverage) 中。
:::

要启用覆盖率进行测试，你可以在 CLI 中传递 `--coverage` 标志或在 `vitest.config.ts` 中设置 `coverage.enabled`：

::: code-group
```json [package.json]
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```
```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true
    },
  },
})
```
:::

## 在覆盖率报告中包含和排除文件

你可以通过配置 [`coverage.include`](/config/coverage#coverage-include) 和 [`coverage.exclude`](/config/coverage#coverage-exclude) 来定义哪些文件显示在覆盖率报告中。

默认情况下，Vitest 只会显示在测试运行期间导入的文件。
要将未覆盖的文件包含在报告中，你需要使用能匹配源文件的模式配置 [`coverage.include`](/config/coverage#coverage-include)：

::: code-group
```ts [vitest.config.ts] {6}
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}']
    },
  },
})
```
```sh [覆盖的文件]
├── src
│   ├── components
│   │   └── counter.tsx   # [!code ++]
│   ├── mock-data
│   │   ├── products.json # [!code error]
│   │   └── users.json    # [!code error]
│   └── utils
│       ├── formatters.ts # [!code ++]
│       ├── time.ts       # [!code ++]
│       └── users.ts      # [!code ++]
├── test
│   └── utils.test.ts     # [!code error]
│
├── package.json          # [!code error]
├── tsup.config.ts        # [!code error]
└── vitest.config.ts      # [!code error]
```
:::

要排除匹配 `coverage.include` 的文件，你可以定义额外的 [`coverage.exclude`](/config/coverage#coverage-exclude)：

::: code-group
```ts [vitest.config.ts] {7}
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/utils/users.ts']
    },
  },
})
```
```sh [覆盖的文件]
├── src
│   ├── components
│   │   └── counter.tsx   # [!code ++]
│   ├── mock-data
│   │   ├── products.json # [!code error]
│   │   └── users.json    # [!code error]
│   └── utils
│       ├── formatters.ts # [!code ++]
│       ├── time.ts       # [!code ++]
│       └── users.ts      # [!code error]
├── test
│   └── utils.test.ts     # [!code error]
│
├── package.json          # [!code error]
├── tsup.config.ts        # [!code error]
└── vitest.config.ts      # [!code error]
```
:::

## 自定义覆盖率报告器

你可以通过在 `test.coverage.reporter` 中传递包名或绝对路径来使用自定义覆盖率报告器：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: [
        // 使用 NPM 包名指定报告器
        ['@vitest/custom-coverage-reporter', { someOption: true }],

        // 使用本地路径指定报告器
        '/absolute/path/to/custom-reporter.cjs',
      ],
    },
  },
})
```

自定义报告器由 Istanbul 加载，必须匹配其报告器接口。参见 [内置报告器的实现](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib) 作为参考。

```js [custom-reporter.cjs]
const { ReportBase } = require('istanbul-lib-report')

module.exports = class CustomReporter extends ReportBase {
  constructor(opts) {
    super()

    // 从配置传递的选项在这里可用
    this.file = opts.file
  }

  onStart(root, context) {
    this.contentWriter = context.writer.writeFile(this.file)
    this.contentWriter.println('Start of custom coverage report')
  }

  onEnd() {
    this.contentWriter.println('End of custom coverage report')
    this.contentWriter.close()
  }
}
```

## 自定义覆盖率提供者

也可以通过在 `test.coverage.provider` 中传递 `'custom'` 来提供自定义覆盖率提供者：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'custom',
      customProviderModule: 'my-custom-coverage-provider'
    },
  },
})
```

自定义提供者需要一个 `customProviderModule` 选项，这是一个模块名或路径，用于加载 `CoverageProviderModule`。它必须导出一个实现 `CoverageProviderModule` 的对象作为默认导出：

```ts [my-custom-coverage-provider.ts]
import type {
  CoverageProvider,
  CoverageProviderModule,
  ResolvedCoverageOptions,
  Vitest
} from 'vitest'

const CustomCoverageProviderModule: CoverageProviderModule = {
  getProvider(): CoverageProvider {
    return new CustomCoverageProvider()
  },

  // 实现 CoverageProviderModule 的其余部分 ...
}

class CustomCoverageProvider implements CoverageProvider {
  name = 'custom-coverage-provider'
  options!: ResolvedCoverageOptions

  initialize(ctx: Vitest) {
    this.options = ctx.config.coverage
  }

  // 实现 CoverageProvider 的其余部分 ...
}

export default CustomCoverageProviderModule
```

请参阅类型定义以获取更多详细信息。

## 忽略代码

两种覆盖率提供者都有各自的方法来忽略覆盖率报告中的代码：

- [`v8`](https://github.com/AriPerkkio/ast-v8-to-istanbul?tab=readme-ov-file#ignoring-code)
- [`istanbul`](https://github.com/istanbuljs/nyc#parsing-hints-ignoring-lines)

当使用 TypeScript 时，源代码会使用 `esbuild` 进行转译，它会剥离源代码中的所有注释 ([esbuild#516](https://github.com/evanw/esbuild/issues/516))。
被视为 [合法注释](https://esbuild.github.io/api/#legal-comments) 的注释会被保留。

你可以在忽略提示中包含 `@preserve` 关键字。
请注意，这些忽略提示现在也可能包含在最终的生产构建中。

::: tip
关注 https://github.com/vitest-dev/vitest/issues/2021 以获取有关 `@preserve` 用法的更新。
:::

```diff
-/* istanbul ignore if */
+/* istanbul ignore if -- @preserve */
if (condition) {

-/* v8 ignore if */
+/* v8 ignore if -- @preserve */
if (condition) {
```

### 示例

::: code-group

```ts [lines: start/stop]
/* istanbul ignore start -- @preserve */
if (parameter) { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
else { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
/* istanbul ignore stop -- @preserve */

console.log('Included')

/* v8 ignore start -- @preserve */
if (parameter) { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
else { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
/* v8 ignore stop -- @preserve */

console.log('Included')
```

```ts [if else]
/* v8 ignore if -- @preserve */
if (parameter) { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
else {
  console.log('Included')
}

/* v8 ignore else -- @preserve */
if (parameter) {
  console.log('Included')
}
else { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
```

```ts [next node]
/* v8 ignore next -- @preserve */
console.log('Ignored') // [!code error]
console.log('Included')

/* v8 ignore next -- @preserve */
function ignored() { // [!code error]
  console.log('all') // [!code error]
  // [!code error]
  console.log('lines') // [!code error]
  // [!code error]
  console.log('are') // [!code error]
  // [!code error]
  console.log('ignored') // [!code error]
} // [!code error]

/* v8 ignore next -- @preserve */
class Ignored { // [!code error]
  ignored() {} // [!code error]
  alsoIgnored() {} // [!code error]
} // [!code error]

/* v8 ignore next -- @preserve */
condition // [!code error]
  ? console.log('ignored') // [!code error]
  : console.log('also ignored') // [!code error]
```

```ts [try catch]
/* v8 ignore next -- @preserve */
try { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
catch (error) { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]

try {
  console.log('Included')
}
catch (error) {
  /* v8 ignore next -- @preserve */
  console.log('Ignored') // [!code error]
  /* v8 ignore next -- @preserve */
  console.log('Ignored') // [!code error]
}

// 由于 esbuild 缺乏支持，需要 rolldown-vite。
// 参见 https://vite.dev/guide/rolldown.html#how-to-try-rolldown
try {
  console.log('Included')
}
catch (error) /* v8 ignore next */ { // [!code error]
  console.log('Ignored') // [!code error]
} // [!code error]
```

```ts [switch case]
switch (type) {
  case 1:
    return 'Included'

  /* v8 ignore next -- @preserve */
  case 2: // [!code error]
    return 'Ignored' // [!code error]

  case 3:
    return 'Included'

  /* v8 ignore next -- @preserve */
  default: // [!code error]
    return 'Ignored' // [!code error]
}
```

```ts [whole file]
/* v8 ignore file -- @preserve */
export function ignored() { // [!code error]
  return 'Whole file is ignored'// [!code error]
}// [!code error]
```
:::

## 覆盖率性能

如果你的项目中代码覆盖率生成缓慢，请参阅 [性能分析测试性能 | 代码覆盖率](/guide/profiling-test-performance.html#code-coverage)。

## Vitest UI

你可以在 [Vitest UI](/guide/ui) 和 [HTML 报告器](/guide/reporters.html#html-reporter) 中查看覆盖率报告。

这与具有 HTML 输出的内置覆盖率报告器集成（`html`、`html-spa` 和 `lcov` 报告器）。`html` 报告器默认启用，开箱即用。要与自定义报告器集成，你可以配置 [`coverage.htmlDir`](/config/coverage#coverage-htmldir)。

<img alt="Vitest UI 中的 html 覆盖率激活" img-light src="/vitest-ui-show-coverage-light.png">
<img alt="Vitest UI 中的 html 覆盖率激活" img-dark src="/vitest-ui-show-coverage-dark.png">

<img alt="html coverage in Vitest UI" img-light src="/ui-coverage-1-light.png">
<img alt="html coverage in Vitest UI" img-dark src="/ui-coverage-1-dark.png">

## Coverage in Agent Environments

When Vitest detects it is running inside an AI coding agent, it automatically adjusts the default `text` reporter to reduce output and minimize token usage:

- `skipFull: true` is set on the `text` reporter, so files with 100% coverage are omitted from the terminal output.
- The [`text-summary`](/config/coverage#coverage-reporter) reporter is added automatically, so the agent always sees a concise totals table even when `skipFull` hides all individual files.

These adjustments only apply when the `text` reporter is already part of the active reporter list (it is included in the default). Explicitly configured reporters are never removed.
