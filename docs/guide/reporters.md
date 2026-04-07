---
title: 报告器 | 指南
outline: deep
---

# 报告器

Vitest 提供了多种内置报告器以不同格式显示测试输出，同时也支持使用自定义报告器。你可以通过 `--reporter` 命令行选项，或在 [配置文件](/config/reporters) 中包含 `reporters` 属性来选择不同的报告器。如果未指定报告器，Vitest 将使用如下所述的 `default` 报告器。

通过命令行使用报告器：

```bash
npx vitest --reporter=verbose
```

通过 [`vitest.config.ts`](/config/) 使用报告器：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['verbose']
  },
})
```

某些报告器可以通过传递额外选项进行自定义。特定于报告器的选项将在以下部分中描述。

```ts
export default defineConfig({
  test: {
    reporters: [
      'default',
      ['junit', { suiteName: 'UI tests' }]
    ],
  },
})
```

## 报告器输出

默认情况下，Vitest 的报告器会将输出打印到终端。当使用 `json`、`html` 或 `junit` 报告器时，你可以通过在 Vite 配置文件或命令行中包含 `outputFile` [配置选项](/config/outputfile)，将测试输出写入文件。

:::code-group
```bash [命令行]
npx vitest --reporter=json --outputFile=./test-output.json
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['json'],
    outputFile: './test-output.json'
  },
})
```
:::

## 组合报告器

你可以同时使用多个报告器以不同格式打印测试结果。例如：

```bash
npx vitest --reporter=json --reporter=default
```

```ts
export default defineConfig({
  test: {
    reporters: ['json', 'default'],
    outputFile: './test-output.json'
  },
})
```

上面的示例将以默认样式将测试结果打印到终端，并将它们作为 JSON 写入指定的输出文件。

当使用多个报告器时，也可以指定多个输出文件，如下所示：

```ts
export default defineConfig({
  test: {
    reporters: ['junit', 'json', 'verbose'],
    outputFile: {
      junit: './junit-report.xml',
      json: './json-report.json',
    },
  },
})
```

此示例将写入单独的 JSON 和 XML 报告，并向终端打印详细报告。

## 内置报告器

### 默认报告器

默认情况下（即未指定报告器），Vitest 将在底部显示运行测试的摘要及其状态。一旦套件通过，其状态将报告在摘要的顶部。

::: tip
当 Vitest 检测到它在 AI 编程代理内部运行时，将使用 [`agent`](#agent-reporter) 报告器来减少输出并最小化 Token 用量。你可以通过显式配置 [`reporters`](/config/reporters) 选项来覆盖此行为。
:::

你可以通过配置报告器来禁用摘要：

:::code-group
```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: [
      ['default', { summary: false }]
    ]
  },
})
```
:::

测试进行中的示例输出：

```bash
 ✓ test/example-1.test.ts (5 tests | 1 skipped) 306ms
 ✓ test/example-2.test.ts (5 tests | 1 skipped) 307ms

 ❯ test/example-3.test.ts 3/5
 ❯ test/example-4.test.ts 1/5

 Test Files 2 passed (4)
      Tests 10 passed | 3 skipped (65)
   Start at 11:01:36
   Duration 2.00s
```

测试完成后的最终输出：

```bash
 ✓ test/example-1.test.ts (5 tests | 1 skipped) 306ms
 ✓ test/example-2.test.ts (5 tests | 1 skipped) 307ms
 ✓ test/example-3.test.ts (5 tests | 1 skipped) 307ms
 ✓ test/example-4.test.ts (5 tests | 1 skipped) 307ms

 Test Files  4 passed (4)
      Tests  16 passed | 4 skipped (20)
   Start at  12:34:32
   Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms, prepare 267ms)
```

如果只有一个测试文件正在运行，Vitest 将输出该文件的完整测试树，类似于 [`tree`](#tree-reporter) 报告器。如果文件中至少有一个失败的测试，默认报告器也会打印测试树。

```bash
✓ __tests__/file1.test.ts (2) 725ms
   ✓ first test file (2) 725ms
     ✓ 2 + 2 should equal 4
     ✓ 4 - 2 should equal 2

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  12:34:32
   Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms, prepare 267ms)
```

### 详细报告器

详细报告器在每个测试用例完成后打印该用例。它不会单独报告套件或文件。如果启用了 `--includeTaskLocation`，它还将在输出中包含每个测试的位置。与 `default` 报告器类似，你可以通过配置报告器来禁用摘要。

除此之外，`verbose` 报告器会立即打印测试错误消息。完整的测试错误将在测试运行结束时报告。

这是唯一一个在测试未失败时报告 [注解](/guide/test-annotations) 的终端报告器。

:::code-group
```bash [命令行]
npx vitest --reporter=verbose
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: [
      ['verbose', { summary: false }]
    ]
  },
})
```
:::

示例输出：

```bash
✓ __tests__/file1.test.ts > first test file > 2 + 2 should equal 4 1ms
✓ __tests__/file1.test.ts > first test file > 4 - 2 should equal 2 1ms
✓ __tests__/file2.test.ts > second test file > 1 + 1 should equal 2 1ms
✓ __tests__/file2.test.ts > second test file > 2 - 1 should equal 1 1ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  12:34:32
   Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms, prepare 267ms)
```

带有 `--includeTaskLocation` 的示例：

```bash
✓ __tests__/file1.test.ts:2:1 > first test file > 2 + 2 should equal 4 1ms
✓ __tests__/file1.test.ts:3:1 > first test file > 4 - 2 should equal 2 1ms
✓ __tests__/file2.test.ts:2:1 > second test file > 1 + 1 should equal 2 1ms
✓ __tests__/file2.test.ts:3:1 > second test file > 2 - 1 should equal 1 1ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  12:34:32
   Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms, prepare 267ms)
```

### 树形报告器

树形报告器与 `default` 报告器相同，但它还会在套件完成后显示每个单独的测试。与 `default` 报告器类似，你可以通过配置报告器来禁用摘要。

:::code-group
```bash [命令行]
npx vitest --reporter=tree
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: [
      ['tree', { summary: false }]
    ]
  },
})
```
:::

使用默认 `slowTestThreshold: 300` 的测试进行中示例输出：

```bash
 ✓ __tests__/example-1.test.ts (2) 725ms
   ✓ first test file (2) 725ms
     ✓ 2 + 2 should equal 4
     ✓ 4 - 2 should equal 2

 ❯ test/example-2.test.ts 3/5
   ↳ should run longer than three seconds 1.57s
 ❯ test/example-3.test.ts 1/5

 Test Files 2 passed (4)
      Tests 10 passed | 3 skipped (65)
   Start at 11:01:36
   Duration 2.00s
```

通过测试套件的最终终端输出示例：

```bash
✓ __tests__/file1.test.ts (2) 725ms
   ✓ first test file (2) 725ms
     ✓ 2 + 2 should equal 4
     ✓ 4 - 2 should equal 2
✓ __tests__/file2.test.ts (2) 746ms
  ✓ second test file (2) 746ms
    ✓ 1 + 1 should equal 2
    ✓ 2 - 1 should equal 1

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  12:34:32
   Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms, prepare 267ms)
```

### 点状报告器

为每个完成的测试打印一个点，以提供最小化输出，同时仍显示所有已运行的测试。仅提供失败测试的详细信息，以及套件的摘要。

:::code-group
```bash [命令行]
npx vitest --reporter=dot
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['dot']
  },
})
```
:::

通过测试套件的示例终端输出：

```bash
....

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  12:34:32
   Duration  1.26s (transform 35ms, setup 1ms, collect 90ms, tests 1.47s, environment 0ms, prepare 267ms)
```

### JUnit 报告器

以 JUnit XML 格式输出测试结果的报告。可以使用 [`outputFile`](/config/outputfile) 配置选项将其打印到终端或写入 XML 文件。

:::code-group
```bash [命令行]
npx vitest --reporter=junit
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['junit']
  },
})
```
:::

JUnit XML 报告示例：
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<testsuites name="vitest tests" tests="2" failures="1" errors="0" time="0.503">
    <testsuite name="__tests__/test-file-1.test.ts" timestamp="2023-10-19T17:41:58.580Z" hostname="My-Computer.local" tests="2" failures="1" errors="0" skipped="0" time="0.013">
        <testcase classname="__tests__/test-file-1.test.ts" name="first test file &gt; 2 + 2 should equal 4" time="0.01">
            <failure message="expected 5 to be 4 // Object.is equality" type="AssertionError">
AssertionError: expected 5 to be 4 // Object.is equality
 ❯ __tests__/test-file-1.test.ts:20:28
            </failure>
        </testcase>
        <testcase classname="__tests__/test-file-1.test.ts" name="first test file &gt; 4 - 2 should equal 2" time="0">
        </testcase>
    </testsuite>
</testsuites>
```

输出的 XML 包含嵌套的 `testsuites` 和 `testcase` 标签。这些也可以通过报告器选项 `suiteName` 和 `classnameTemplate` 进行自定义。`classnameTemplate` 可以是模板字符串或函数。

`classnameTemplate` 选项支持的占位符有：
- filename
- filepath

```ts
export default defineConfig({
  test: {
    reporters: [
      ['junit', { suiteName: 'custom suite name', classnameTemplate: 'filename:{filename} - filepath:{filepath}' }]
    ]
  },
})
```

### JSON 报告器

生成与 Jest 的 `--json` 选项兼容的 JSON 格式测试结果报告。可以使用 [`outputFile`](/config/outputfile) 配置选项将其打印到终端或写入文件。

:::code-group
```bash [命令行]
npx vitest --reporter=json
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['json']
  },
})
```
:::

JSON 报告示例：

```json
{
  "numTotalTestSuites": 4,
  "numPassedTestSuites": 2,
  "numFailedTestSuites": 1,
  "numPendingTestSuites": 1,
  "numTotalTests": 4,
  "numPassedTests": 1,
  "numFailedTests": 1,
  "numPendingTests": 1,
  "numTodoTests": 1,
  "startTime": 1697737019307,
  "success": false,
  "testResults": [
    {
      "assertionResults": [
        {
          "ancestorTitles": [
            "",
            "first test file"
          ],
          "fullName": " first test file 2 + 2 should equal 4",
          "status": "failed",
          "title": "2 + 2 should equal 4",
          "duration": 9,
          "failureMessages": [
            "expected 5 to be 4 // Object.is equality"
          ],
          "location": {
            "line": 20,
            "column": 28
          },
          "meta": {}
        }
      ],
      "startTime": 1697737019787,
      "endTime": 1697737019797,
      "status": "failed",
      "message": "",
      "name": "/root-directory/__tests__/test-file-1.test.ts"
    }
  ],
  "coverageMap": {}
}
```

::: info
自 Vitest 3 起，如果启用了覆盖率，JSON 报告器会在 `coverageMap` 中包含覆盖率信息。
:::

### HTML 报告器

生成一个 HTML 文件，以便通过交互式 [GUI](/guide/ui) 查看测试结果。文件生成后，Vitest 将保持本地开发服务器运行，并提供一个链接以便在浏览器中查看报告。

可以使用 [`outputFile`](/config/outputfile) 配置选项指定输出文件。如果未提供 `outputFile` 选项，将创建一个新的 HTML 文件。

:::code-group
```bash [命令行]
npx vitest --reporter=html
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['html']
  },
})
```
:::

::: tip
此报告器需要安装 [`@vitest/ui`](/guide/ui) 包。
:::

### TAP 报告器

输出遵循 [Test Anything Protocol](https://testanything.org/) (TAP) 的报告。

:::code-group
```bash [命令行]
npx vitest --reporter=tap
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['tap']
  },
})
```
:::

TAP 报告示例：
```bash
TAP version 13
1..1
not ok 1 - __tests__/test-file-1.test.ts # time=14.00ms {
    1..1
    not ok 1 - first test file # time=13.00ms {
        1..2
        not ok 1 - 2 + 2 should equal 4 # time=11.00ms
            ---
            error:
                name: "AssertionError"
                message: "expected 5 to be 4 // Object.is equality"
            at: "/root-directory/__tests__/test-file-1.test.ts:20:28"
            actual: "5"
            expected: "4"
            ...
        ok 2 - 4 - 2 should equal 2 # time=1.00ms
    }
}
```

### TAP 扁平报告器

输出 TAP 扁平报告。与 `tap` 报告器一样，测试结果格式化为遵循 TAP 标准，但测试套件格式化为扁平列表而不是嵌套层级。

:::code-group
```bash [命令行]
npx vitest --reporter=tap-flat
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['tap-flat']
  },
})
```
:::

TAP 扁平报告示例：
```bash
TAP version 13
1..2
not ok 1 - __tests__/test-file-1.test.ts > first test file > 2 + 2 should equal 4 # time=11.00ms
    ---
    error:
        name: "AssertionError"
        message: "expected 5 to be 4 // Object.is equality"
    at: "/root-directory/__tests__/test-file-1.test.ts:20:28"
    actual: "5"
    expected: "4"
    ...
ok 2 - __tests__/test-file-1.test.ts > first test file > 4 - 2 should equal 2 # time=0.00ms
```

### 挂起进程报告器

显示挂起进程的列表（如果有进程阻止 Vitest 安全退出）。`hanging-process` 报告器本身不显示测试结果，但可以与另一个报告器结合使用，以在测试运行时监控进程。使用此报告器可能会消耗大量资源，因此通常应保留用于调试目的，适用于 Vitest  consistently 无法退出进程的情况。

:::code-group
```bash [命令行]
npx vitest --reporter=hanging-process
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['hanging-process']
  },
})
```
:::

### GitHub Actions 报告器 {#github-actions-reporter}

输出 [工作流命令](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message)
以为测试失败提供注解。当未配置 `reporters` 选项且 `process.env.GITHUB_ACTIONS === 'true'`（在 GitHub Actions 环境中）时，此报告器会自动启用。

<img alt="GitHub Actions" img-dark src="https://github.com/vitest-dev/vitest/assets/4232207/336cddc2-df6b-4b8a-8e72-4d00010e37f5">
<img alt="GitHub Actions" img-light src="https://github.com/vitest-dev/vitest/assets/4232207/ce8447c1-0eab-4fe1-abef-d0d322290dca">

如果你配置了报告器，则需要显式添加 `github-actions`。

```ts
export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS === 'true' ? ['dot', 'github-actions'] : ['dot'],
  },
})
```

你可以使用 `onWritePath` 选项自定义以 [GitHub 的注解命令格式](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions) 打印的文件路径。这在容器化环境（如 Docker）中运行 Vitest 时很有用，因为文件路径可能与 GitHub Actions 环境中的路径不匹配。

```ts
export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS === 'true'
      ? [
          'default',
          ['github-actions', { onWritePath(path) {
            return path.replace(/^\/app\//, `${process.env.GITHUB_WORKSPACE}/`)
          } }],
        ]
      : ['default'],
  },
})
```

如果你使用 [注解 API](/guide/test-annotations)，报告器会自动将它们内联到 GitHub UI 中。你可以通过将 `displayAnnotations` 选项设置为 `false` 来禁用此功能：

```ts
export default defineConfig({
  test: {
    reporters: [
      ['github-actions', { displayAnnotations: false }],
    ],
  },
})
```

GitHub Actions 报告器会自动生成一个包含测试结果概览的 [任务摘要](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/)。摘要包括测试文件和测试用例统计信息，并突出显示需要重试的不稳定测试。

<img alt="GitHub Actions 任务摘要" img-dark src="/github-actions-job-summary-dark.png">
<img alt="GitHub Actions 任务摘要" img-light src="/github-actions-job-summary-light.png">

任务摘要默认启用，并写入 `$GITHUB_STEP_SUMMARY` 指定的路径。你可以使用 `jobSummary.outputPath` 选项覆盖它：

```ts
export default defineConfig({
  test: {
    reporters: [
      ['github-actions', {
        jobSummary: {
          outputPath: '/home/runner/jobs/summary/step',
        },
      }],
    ],
  },
})
```

要禁用任务摘要：

```ts
export default defineConfig({
  test: {
    reporters: [
      ['github-actions', { jobSummary: { enabled: false } }],
    ],
  },
})
```

摘要的不稳定测试部分包含永久链接 URL，可将测试名称直接链接到 GitHub 上的相关源代码行。这些链接是使用 GitHub Actions 提供的环境变量（`$GITHUB_REPOSITORY`、`$GITHUB_SHA` 和 `$GITHUB_WORKSPACE`）自动生成的，因此在大多数情况下无需配置。

如果你需要覆盖这些值——例如，在容器或自定义环境中运行时——你可以通过 `fileLinks` 选项自定义它们：

- `repository`：`owner/repo` 格式的 GitHub 仓库。默认为 `process.env.GITHUB_REPOSITORY`。
- `commitHash`：用于永久链接 URL 的 commit SHA。默认为 `process.env.GITHUB_SHA`。
- `workspacePath`：磁盘上仓库根目录的绝对路径。用于计算永久链接 URL 的相对文件路径。默认为 `process.env.GITHUB_WORKSPACE`。

所有三个值都必须可用才能生成链接。

```ts
export default defineConfig({
  test: {
    reporters: [
      ['github-actions', {
        jobSummary: {
          fileLinks: {
            repository: 'owner/repo',
            commitHash: 'abcdefg',
            workspacePath: '/home/runner/work/repo/',
          },
        },
      }],
    ],
  },
})
```

### Agent 报告器

输出为 AI 编程助手和基于 LLM 的工作流优化的最小化报告。仅显示失败的测试及其错误消息。来自通过测试的控制台日志和摘要部分被抑制以减少 Token 用量。

当未配置 `reporters` 选项且 Vitest 检测到它在 AI 编程代理内部运行时，此报告器会自动启用。如果你配置了自定义报告器，可以显式添加 `agent`：

:::code-group
```bash [命令行]
npx vitest --reporter=agent
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['agent']
  },
})
```
:::

### Blob 报告器

将测试结果存储在机器上，以便以后可以使用 [`--merge-reports`](/guide/cli#merge-reports) 命令合并。
默认情况下，将所有结果存储在 `.vitest-reports` 文件夹中，但可以使用 `--outputFile` 或 `--outputFile.blob` 标志覆盖。

```bash
npx vitest --reporter=blob --outputFile=reports/blob-1.json
```

如果你使用 [`--shard`](/guide/cli#shard) 标志在不同机器上运行 Vitest，我们建议使用此报告器。
所有 blob 报告都可以在 CI 流水线结束时使用 `--merge-reports` 命令合并到任何报告中：

```bash
npx vitest --merge-reports=reports --reporter=json --reporter=default
```

Blob 报告器输出不包含基于文件的 [附件](/api/advanced/artifacts.html#testattachment)。
使用此功能时，确保在 CI 上与 blob 报告 separately 合并 [`attachmentsDir`](/config/attachmentsdir)。

::: tip
`--reporter=blob` 和 `--merge-reports` 都不适用于监听模式。
:::

## 自定义报告器

你可以通过在 reporters 选项中指定包名，来使用从 NPM 安装的第三方自定义报告器：

:::code-group
```bash [CLI]
npx vitest --reporter=some-published-vitest-reporter
```

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: ['some-published-vitest-reporter']
  },
})
```
:::

此外，你可以定义自己的 [自定义报告器](/guide/advanced/reporters)，并通过指定文件路径来使用它们：

```bash
npx vitest --reporter=./path/to/reporter.ts
```

自定义报告器应实现 [Reporter 接口](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/types/reporter.ts)。
