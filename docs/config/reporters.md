---
title: reporters | 配置
---

# reporters <CRoot />

- **类型：**

```ts
interface UserConfig {
  reporters?: ConfigReporter | Array<ConfigReporter>
}

type ConfigReporter = string | Reporter | [string, object?]
```

- **默认值：** [`'default'`](/guide/reporters#default-reporter)（或 <code>[['default'](/guide/reporters#default-reporter), ['github-actions'](/guide/reporters#github-actions-reporter)]</code> 当 `process.env.GITHUB_ACTIONS === 'true'` 时）
- **命令行：**
  - `--reporter=tap` 用于单个报告器
  - `--reporter=verbose --reporter=github-actions` 用于多个报告器

此选项定义了在测试运行期间可供 Vitest 使用的单个报告器或报告器列表。

除了内置报告器外，你还可以传递 [`Reporter` 接口](/api/advanced/reporters) 的自定义实现，或者导出它作为默认导出的模块路径（例如 `'./path/to/reporter.ts'`，`'@scope/reporter'`）。

你可以通过提供一个元组来配置报告器：`[string, object]`，其中字符串是报告器名称，对象是报告器的选项。

::: warning
请注意，[coverage](/guide/coverage) 功能使用不同的 [`coverage.reporter`](/config/coverage#reporter) 选项，而不是此选项。
:::

## 内置报告器

- [`default`](/guide/reporters#default-reporter)
- [`verbose`](/guide/reporters#verbose-reporter)
- [`tree`](/guide/reporters#tree-reporter)
- [`dot`](/guide/reporters#dot-reporter)
- [`junit`](/guide/reporters#junit-reporter)
- [`json`](/guide/reporters#json-reporter)
- [`html`](/guide/reporters#html-reporter)
- [`tap`](/guide/reporters#tap-reporter)
- [`tap-flat`](/guide/reporters#tap-flat-reporter)
- [`hanging-process`](/guide/reporters#hanging-process-reporter)
- [`github-actions`](/guide/reporters#github-actions-reporter)
- [`agent`](/guide/reporters#agent-reporter)
- [`blob`](/guide/reporters#blob-reporter)

## 示例

::: code-group
```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: [
      'default',
      // 条件报告器
      process.env.CI ? 'github-actions' : {},
      // 来自 npm 包的自定义报告器
      // 选项作为元组传递
      [
        'vitest-sonar-reporter',
        { outputFile: 'sonar-report.xml' }
      ],
    ]
  }
})
```
```bash [CLI]
vitest --reporter=github-actions --reporter=junit
```
:::
