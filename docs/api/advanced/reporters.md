# 报告器

::: warning
这是一个高级 API。如果你只想配置内置报告器，请阅读 ["报告器"](/guide/reporters) 指南。
:::

Vitest 拥有自己的测试运行生命周期。这些由报告器的方法表示：

- [`onInit`](#oninit)
- [`onTestRunStart`](#ontestrunstart)
  - [`onTestModuleQueued`](#ontestmodulequeued)
  - [`onTestModuleCollected`](#ontestmodulecollected)
  - [`onTestModuleStart`](#ontestmodulestart)
    - [`onTestSuiteReady`](#ontestsuiteready)
      - [`onHookStart(beforeAll)`](#onhookstart)
      - [`onHookEnd(beforeAll)`](#onhookend)
        - [`onTestCaseReady`](#ontestcaseready)
          - [`onTestCaseAnnotate`](#ontestcaseannotate) <Version>3.2.0</Version>
          - [`onTestCaseArtifactRecord`](#ontestcaseartifactrecord) <Version type="experimental">4.0.11</Version>
          - [`onHookStart(beforeEach)`](#onhookstart)
          - [`onHookEnd(beforeEach)`](#onhookend)
          - [`onHookStart(afterEach)`](#onhookstart)
          - [`onHookEnd(afterEach)`](#onhookend)
        - [`onTestCaseResult`](#ontestcaseresult)
      - [`onHookStart(afterAll)`](#onhookstart)
      - [`onHookEnd(afterAll)`](#onhookend)
    - [`onTestSuiteResult`](#ontestsuiteresult)
  - [`onTestModuleEnd`](#ontestmoduleend)
  - [`onCoverage`](#oncoverage)
- [`onTestRunEnd`](#ontestrunend)

单个模块内的测试和套件将按顺序报告，除非它们被跳过。所有被跳过的测试将在套件/模块结束时报告。

请注意，由于测试模块可以并行运行，Vitest 将并行报告它们。

本指南列出了所有支持的报告器方法。但是，不要忘记，你可以 [扩展现有的报告器](/guide/advanced/reporters)，而不是创建自己的报告器：

```ts [custom-reporter.js]
import { BaseReporter } from 'vitest/node'

export default class CustomReporter extends BaseReporter {
  onTestRunEnd(testModules, errors) {
    console.log(testModule.length, 'tests finished running')
    super.onTestRunEnd(testModules, errors)
  }
}
```

## onInit

```ts
function onInit(vitest: Vitest): Awaitable<void>
```

当 [Vitest](/api/advanced/vitest) 被初始化或启动时调用此方法，但在测试被过滤之前。

::: info
内部此方法在 [`vitest.start`](/api/advanced/vitest#start)、[`vitest.standalone`](/api/advanced/vitest#standalone) 或 [`vitest.mergeReports`](/api/advanced/vitest#mergereports) 中被调用。如果你使用的是编程式 API，请确保在调用 [`vitest.runTestSpecifications`](/api/advanced/vitest#runtestspecifications) 之前，根据你的需要调用其中一个方法，例如。内置 CLI 将始终按正确顺序运行方法。
:::

请注意，你还可以通过 [`project`](/api/advanced/test-project) 属性从测试用例、套件和测试模块中访问 `vitest` 实例，但在此方法中存储对 `vitest` 的引用也可能很有用。

::: details 示例
```ts
import type { Reporter, TestSpecification, Vitest } from 'vitest/node'

class MyReporter implements Reporter {
  private vitest!: Vitest

  onInit(vitest: Vitest) {
    this.vitest = vitest
  }

  onTestRunStart(specifications: TestSpecification[]) {
    console.log(
      specifications.length,
      'test files will run in',
      this.vitest.config.root,
    )
  }
}

export default new MyReporter()
```
:::

## onBrowserInit {#onbrowserinit}

```ts
function onBrowserInit(project: TestProject): Awaitable<void>
```

当浏览器实例被初始化时调用此方法。它接收为其初始化浏览器的项目实例。调用此方法时 `project.browser` 将始终被定义。

## onTestRunStart

```ts
function onTestRunStart(
  specifications: TestSpecification[]
): Awaitable<void>
```

当新的测试运行开始时调用此方法。它接收计划运行的 [测试规范](/api/advanced/test-specification) 数组。此数组是只读的，仅用于信息目的。

如果 Vitest 没有找到任何要运行的测试文件，此事件将以空数组调用，然后紧接着调用 [`onTestRunEnd`](#ontestrunend)。

::: details 示例
```ts
import type { Reporter, TestSpecification } from 'vitest/node'

class MyReporter implements Reporter {
  onTestRunStart(specifications: TestSpecification[]) {
    console.log(specifications.length, 'test files will run')
  }
}

export default new MyReporter()
```
:::

## onTestRunEnd

```ts
function onTestRunEnd(
  testModules: ReadonlyArray<TestModule>,
  unhandledErrors: ReadonlyArray<SerializedError>,
  reason: TestRunEndReason
): Awaitable<void>
```

在所有测试完成运行且覆盖率合并了所有报告后调用此方法（如果已启用）。请注意，你可以在 [`onCoverage`](#oncoverage) 钩子中获取覆盖率信息。

它接收一个只读的测试模块列表。你可以通过 [`testModule.children`](/api/advanced/test-collection) 属性迭代它来报告状态和错误（如果有）。

第二个参数是只读的未处理错误列表，Vitest 无法将这些错误归因于任何测试。这些错误可能发生在测试运行之外（由于插件中的错误），或发生在测试运行之内（作为未等待函数的副作用，例如，在测试完成运行后抛出错误的超时）。

第三个参数指示测试运行结束的原因：

- `passed`：测试运行正常结束且没有错误
- `failed`：测试运行至少有一个错误（由于收集期间的语法错误或测试执行期间的实际错误）
- `interrupted`：测试被 [`vitest.cancelCurrentRun`](/api/advanced/vitest#cancelcurrentrun) 调用中断或在终端中按下了 `Ctrl+C`（注意在这种情况下仍然可能有失败的测试）

如果 Vitest 没有找到任何要运行的测试文件，此事件将以空的模块和错误数组调用，并且状态将取决于 [`config.passWithNoTests`](/config/passwithnotests) 的值。

::: details 示例
```ts
import type {
  Reporter,
  SerializedError,
  TestModule,
  TestRunEndReason,
  TestSpecification
} from 'vitest/node'

class MyReporter implements Reporter {
  onTestRunEnd(
    testModules: ReadonlyArray<TestModule>,
    unhandledErrors: ReadonlyArray<SerializedError>,
    reason: TestRunEndReason,
  ) {
    if (reason === 'passed') {
      testModules.forEach(module => console.log(module.moduleId, 'succeeded'))
    }
    else if (reason === 'failed') {
      // 注意这将跳过套件中可能的错误
      // 你可以从 testSuite.errors() 获取它们
      for (const testCase of testModules.children.allTests()) {
        if (testCase.result().state === 'failed') {
          console.log(testCase.fullName, 'in', testCase.module.moduleId, 'failed')
          console.log(testCase.result().errors)
        }
      }
    }
    else {
      console.log('test run was interrupted, skipping report')
    }
  }
}

export default new MyReporter()
```
:::

## onCoverage

```ts
function onCoverage(coverage: unknown): Awaitable<void>
```

此钩子在覆盖率结果处理后调用。覆盖率提供者的报告器在此钩子之后调用。`coverage` 的类型取决于 `coverage.provider`。对于 Vitest 默认的内置提供者，你可以从 `istanbul-lib-coverage` 包导入类型：

```ts
import type { CoverageMap } from 'istanbul-lib-coverage'

declare function onCoverage(coverage: CoverageMap): Awaitable<void>
```

如果 Vitest 未执行任何覆盖率，则不会调用此钩子。

## onTestModuleQueued

```ts
function onTestModuleQueued(testModule: TestModule): Awaitable<void>
```

此方法在 Vitest 导入设置文件和测试模块本身之前立即调用。这意味着 `testModule` 还没有 [`children`](/api/advanced/test-suite#children)，但你可以开始将其报告为下一个要运行的测试。

## onTestModuleCollected

```ts
function onTestModuleCollected(testModule: TestModule): Awaitable<void>
```

当文件中的所有测试都被收集时调用此方法，意味着 [`testModule.children`](/api/advanced/test-suite#children) 集合已填充，但测试还没有任何结果。

## onTestModuleStart

```ts
function onTestModuleStart(testModule: TestModule): Awaitable<void>
```

此方法在 [`onTestModuleCollected`](#ontestmodulecollected) 之后立即调用，除非 Vitest 运行在收集模式下（[`vitest.collect()`](/api/advanced/vitest#collect) 或 CLI 中的 `vitest collect`），在这种情况下它根本不会被调用，因为没有要运行的测试。

## onTestModuleEnd

```ts
function onTestModuleEnd(testModule: TestModule): Awaitable<void>
```

当模块中的每个测试完成运行时调用此方法。这意味着，[`testModule.children`](/api/advanced/test-suite#children) 内的每个测试都将有一个不等于 `pending` 的 `test.result()`。

## onHookStart

```ts
function onHookStart(context: ReportedHookContext): Awaitable<void>
```

当任何以下钩子开始运行时调用此方法：

- `beforeAll`
- `afterAll`
- `beforeEach`
- `afterEach`

如果 `beforeAll` 或 `afterAll` 开始，`entity` 将是 [`TestSuite`](/api/advanced/test-suite) 或 [`TestModule`](/api/advanced/test-module)。

如果 `beforeEach` 或 `afterEach` 开始，`entity` 将始终是 [`TestCase`](/api/advanced/test-case)。

::: warning
如果钩子在测试运行期间未运行，则不会调用 `onHookStart` 方法。
:::

## onHookEnd

```ts
function onHookEnd(context: ReportedHookContext): Awaitable<void>
```

当任何以下钩子完成运行时调用此方法：

- `beforeAll`
- `afterAll`
- `beforeEach`
- `afterEach`

如果 `beforeAll` 或 `afterAll` 完成，`entity` 将是 [`TestSuite`](/api/advanced/test-suite) 或 [`TestModule`](/api/advanced/test-module)。

如果 `beforeEach` 或 `afterEach` 完成，`entity` 将始终是 [`TestCase`](/api/advanced/test-case)。

::: warning
如果钩子在测试运行期间未运行，则不会调用 `onHookEnd` 方法。
:::

## onTestSuiteReady

```ts
function onTestSuiteReady(testSuite: TestSuite): Awaitable<void>
```

此方法在测试套件开始运行其测试之前调用。如果测试套件被跳过，此方法也会被调用。

如果文件没有任何套件，此方法将不会被调用。考虑使用 `onTestModuleStart` 来覆盖此用例。

## onTestSuiteResult

```ts
function onTestSuiteResult(testSuite: TestSuite): Awaitable<void>
```

此方法在测试套件完成运行测试后调用。如果测试套件被跳过，此方法也会被调用。

如果文件没有任何套件，此方法将不会被调用。考虑使用 `onTestModuleEnd` 来覆盖此用例。

## onTestCaseReady

```ts
function onTestCaseReady(testCase: TestCase): Awaitable<void>
```

此方法在测试开始运行之前或被跳过时调用。请注意，`beforeEach` 和 `afterEach` 钩子被视为测试的一部分，因为它们可以影响结果。

::: warning
请注意，当调用 `onTestCaseReady` 时，[`testCase.result()`](/api/advanced/test-case#result) 可能已经处于 `passed` 或 `failed` 状态。如果测试运行得太快，并且 `onTestCaseReady` 和 `onTestCaseResult` 都被安排在同一微任务中运行，就会发生这种情况。
:::

## onTestCaseResult

```ts
function onTestCaseResult(testCase: TestCase): Awaitable<void>
```

此方法在测试完成运行或刚被跳过时调用。请注意，如果有 `afterEach` 钩子，此方法将在其完成后调用。

此时，[`testCase.result()`](/api/advanced/test-case#result) 将具有非等待状态。

## onTestCaseAnnotate <Version>3.2.0</Version> {#ontestcaseannotate}

```ts
function onTestCaseAnnotate(
  testCase: TestCase,
  annotation: TestAnnotation,
): Awaitable<void>
```

`onTestCaseAnnotate` 钩子与 [`context.annotate`](/guide/test-context#annotate) 方法关联。当调用 `annotate` 时，Vitest 会将其序列化并将相同的附件发送到主线程，报告器可以在那里与之交互。

如果指定了路径，Vitest 会将其存储在单独的目录中（由 [`attachmentsDir`](/config/attachmentsdir) 配置），并修改 `path` 属性以引用它。

## onTestCaseArtifactRecord <Version type="experimental">4.0.11</Version> {#ontestcaseartifactrecord}

```ts
function onTestCaseArtifactRecord(
  testCase: TestCase,
  artifact: TestArtifact,
): Awaitable<void>
```

`onTestCaseArtifactRecord` 钩子与 [`recordArtifact`](/api/advanced/artifacts#recordartifact) 工具关联。当调用 `recordArtifact` 时，Vitest 会将其序列化并将相同的附件发送到主线程，报告器可以在那里与之交互。

如果指定了路径，Vitest 会将其存储在单独的目录中（由 [`attachmentsDir`](/config/attachmentsdir) 配置），并修改 `path` 属性以引用它。

注意：注解，[即使它们是基于此功能构建的](/api/advanced/artifacts#relationship-with-annotations)，也不会触发此钩子，并且出于向后兼容性的原因，直到下一个主要版本之前都不会出现在 `task.artifacts` 数组中。
