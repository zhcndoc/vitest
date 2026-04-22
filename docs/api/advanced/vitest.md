---
outline: deep
title: Vitest 接口
---

# Vitest

Vitest 实例需要当前的测试模式。它可以是：

- 运行运行时测试时为 `test`
- 运行基准测试时为 `benchmark` <Badge type="warning">实验性</Badge>

::: details Vitest 4 新增
Vitest 4 添加了几个新 API（它们标有 "4.0.0+" 徽章）并移除了已弃用的 API：

- `invalidates`
- `changedTests`（请使用 [`onFilterWatchedSpecification`](#onfilterwatchedspecification) 代替）
- `server`（请使用 [`vite`](#vite) 代替）
- `getProjectsByTestFile`（请使用 [`getModuleSpecifications`](#getmodulespecifications) 代替）
- `getFileWorkspaceSpecs`（请使用 [`getModuleSpecifications`](#getmodulespecifications) 代替）
- `getModuleProjects`（自行通过 [`this.projects`](#projects) 过滤）
- `updateLastChanged`（重命名为 [`invalidateFile`](#invalidatefile)）
- `globTestSpecs`（请使用 [`globTestSpecifications`](#globtestspecifications) 代替）
- `globTestFiles`（请使用 [`globTestSpecifications`](#globtestspecifications) 代替）
- `listFile`（请使用 [`getRelevantTestSpecifications`](#getrelevanttestspecifications) 代替）
:::

## 模式

### 测试

测试模式只会调用 `test` 或 `it` 内部的函数，当遇到 `bench` 时抛出错误。此模式使用配置中的 `include` 和 `exclude` 选项来查找测试文件。

### 基准测试 <Badge type="warning">实验性</Badge>

基准测试模式调用 `bench` 函数，当遇到 `test` 或 `it` 时抛出错误。此模式使用配置中的 `benchmark.include` 和 `benchmark.exclude` 选项来查找基准测试文件。

## 配置

根配置（或全局配置）。如果定义了项目，它们将会将此引用为 `globalConfig`。

::: warning
这是 Vitest 配置，它不扩展 _Vite_ 配置。它只包含来自 `test` 属性的解析值。
:::

## vite

这是一个全局 [`ViteDevServer`](https://vite.dev/guide/api-javascript#vitedevserver)。

## 状态 <Badge type="warning">实验性</Badge>

::: warning
公共 `state` 是一个实验性 API（`vitest.state.getReportedEntity` 除外）。破坏性变更可能不遵循 SemVer，请在使用时固定 Vitest 的版本。
:::

全局状态存储有关当前测试的信息。默认情况下它使用来自 `@vitest/runner` 的相同 API，但我们建议通过调用 `@vitest/runner` API 上的 `state.getReportedEntity()` 来使用 [Reported Tasks API](/api/advanced/reporters#reported-tasks)：

```ts
const task = vitest.state.idMap.get(taskId) // 旧 API
const testCase = vitest.state.getReportedEntity(task) // 新 API
```

将来，旧 API 将不再暴露。

## 快照

全局快照管理器。Vitest 使用 `snapshot.add` 方法跟踪所有快照。

你可以通过 `vitest.snapshot.summary` 属性获取最新的快照摘要。

## 缓存

缓存管理器，存储有关最新测试结果和测试文件统计信息。在 Vitest 本身中，这仅由默认排序器用于排序测试。

## 监听器 <Version>4.0.0</Version> {#watcher}

Vitest 监听器的实例，具有跟踪文件更改和重新运行测试的有用方法。如果内置监听器被禁用，你可以将自己的监听器与 `onFileChange`、`onFileDelete` 或 `onFileCreate` 一起使用。

## 项目

属于用户项目的 [测试项目](/api/advanced/test-project) 数组。如果用户未指定它们，此数组将仅包含一个 [根项目](#getrootproject)。

Vitest 将确保此数组中始终至少有一个项目。如果用户指定了不存在的 `--project` 名称，Vitest 将在定义此数组之前抛出错误。

## getRootProject

```ts
function getRootProject(): TestProject
```

这返回根测试项目。根项目通常不运行任何测试，也不包含在 `vitest.projects` 中，除非用户在其配置中显式包含根配置，或者根本未定义项目。

根项目的主要目标是设置全局配置。实际上，`rootProject.config` 直接引用 `rootProject.globalConfig` 和 `vitest.config`：

```ts
rootProject.config === rootProject.globalConfig === rootProject.vitest.config
```

## provide

```ts
function provide<T extends keyof ProvidedContext & string>(
  key: T,
  value: ProvidedContext[T],
): void
```

Vitest 暴露了 `provide` 方法，它是 `vitest.getRootProject().provide` 的简写。使用此方法，你可以将值从主线程传递给测试。所有值在存储前都会通过 `structuredClone` 检查，但值本身不会被克隆。

要在测试中接收值，你需要从 `vitest` 入口点导入 `inject` 方法：

```ts
import { inject } from 'vitest'
const port = inject('wsPort') // 3000
```

为了更好的类型安全，我们鼓励你扩充 `ProvidedContext` 的类型：

```ts
import { createVitest } from 'vitest/node'

const vitest = await createVitest('test', {
  watch: false,
})
vitest.provide('wsPort', 3000)

declare module 'vitest' {
  export interface ProvidedContext {
    wsPort: number
  }
}
```

::: warning
技术上，`provide` 是 [`TestProject`](/api/advanced/test-project) 的方法，因此它仅限于特定项目。但是，所有项目都继承根项目的值，这使得 `vitest.provide` 成为将值传递给测试的通用方式。
:::

## getProvidedContext

```ts
function getProvidedContext(): ProvidedContext
```

这返回根上下文对象。这是 `vitest.getRootProject().getProvidedContext` 的简写。

## getProjectByName

```ts
function getProjectByName(name: string): TestProject
```

此方法按其名称返回项目。类似于调用 `vitest.projects.find`。

::: warning
如果项目不存在，此方法将返回根项目 - 如果返回的项目是你正在查找的项目，请再次检查名称。

如果用户未自定义名称，Vitest 将分配一个空字符串作为名称。
:::

## globTestSpecifications

```ts
function globTestSpecifications(
  filters?: string[],
): Promise<TestSpecification[]>
```

此方法通过 [`project.globTestFiles`](/api/advanced/test-project#globtestfiles) 收集所有项目中的每个测试来构建新的 [测试规范](/api/advanced/test-specification)。它接受字符串过滤器来匹配测试文件 - 这些与 [CLI 支持](/guide/filtering#cli) 的过滤器相同。

此方法自动缓存所有测试规范。下次调用 [`getModuleSpecifications`](#getmodulespecifications) 时，它将返回相同的规范，除非之前调用了 [`clearSpecificationsCache`](#clearspecificationscache)。

::: warning
从 Vitest 3 开始，如果 `poolMatchGlob` 有多个池或启用了 `typecheck`，则可能具有相同模块 ID（文件路径）的多个测试规范。此可能性将在 Vitest 4 中移除。
:::

```ts
const specifications = await vitest.globTestSpecifications(['my-filter'])
// [TestSpecification{ moduleId: '/tests/my-filter.test.ts' }]
console.log(specifications)
```

## getRelevantTestSpecifications

```ts
function getRelevantTestSpecifications(
  filters?: string[]
): Promise<TestSpecification[]>
```

此方法通过调用 [`project.globTestFiles`](/api/advanced/test-project#globtestfiles) 解析每个测试规范。它接受字符串过滤器来匹配测试文件 - 这些与 [CLI 支持](/guide/filtering#cli) 的过滤器相同。如果指定了 `--changed` 标志，列表将被过滤为仅包含已更改的文件。`getRelevantTestSpecifications` 不运行任何测试文件。

::: warning
此方法可能很慢，因为它需要过滤 `--changed` 标志。如果你只需要测试文件列表，请不要使用它。

- 如果你需要获取已知测试文件的规范列表，请改用 [`getModuleSpecifications`](#getmodulespecifications)。
- 如果你需要获取所有可能测试文件的列表，请使用 [`globTestSpecifications`](#globtestspecifications)。
:::

## mergeReports

```ts
function mergeReports(directory?: string): Promise<TestRunResult>
```

合并位于指定目录中的多次运行的报告（如果未指定，则为 `--merge-reports` 的值）。此值也可以在 `config.mergeReports` 上设置（默认情况下，它将读取 `.vitest-reports` 文件夹）。

请注意，`directory` 将始终相对于工作目录解析。

如果设置了 `config.mergeReports`，[`startVitest`](/guide/advanced/tests) 会自动调用此方法。

## collect

```ts
function collect(filters?: string[]): Promise<TestRunResult>
```

执行测试文件而不运行测试回调。`collect` 返回未处理的错误和 [测试模块](/api/advanced/test-module) 数组。它接受字符串过滤器来匹配测试文件 - 这些与 [CLI 支持](/guide/filtering#cli) 的过滤器相同。

此方法根据配置 `include`、`exclude` 和 `includeSource` 值解析测试规范。在 [`project.globTestFiles`](/api/advanced/test-project#globtestfiles) 阅读更多。如果指定了 `--changed` 标志，列表将被过滤为仅包含已更改的文件。

::: warning
请注意，Vitest 不使用静态分析来收集测试。Vitest 将隔离运行每个测试文件，就像它运行常规测试一样。

这使得此方法非常慢，除非你在收集测试之前禁用隔离。
:::

## start

```ts
function start(filters?: string[]): Promise<TestRunResult>
```

初始化报告器、覆盖率提供者并运行测试。此方法接受字符串过滤器来匹配测试文件 - 这些与 [CLI 支持](/guide/filtering#cli) 的过滤器相同。

::: warning
如果还调用了 [`vitest.standalone()`](#standalone)，则不应调用此方法。如果你需要在 Vitest 初始化后运行测试，请改用 [`runTestSpecifications`](#runtestspecifications) 或 [`rerunTestSpecifications`](#runtestspecifications)。
:::

如果未设置 `config.mergeReports` 和 `config.standalone`，[`startVitest`](/guide/advanced/tests) 会自动调用此方法。

## standalone <Version type="experimental">4.1.1</Version> {#standalone}

```ts
function standalone(): Promise<void>
```

- **别名:** `init` <Deprecated />

初始化报告器（reporters）和覆盖率提供者（coverage provider）。此方法不运行任何测试。如果提供了 `--watch` 标志，即使未调用此方法，Vitest 仍会运行更改的测试。

内部而言，仅当启用 [`--standalone`](/guide/cli#standalone) 标志时才会调用此方法。

::: warning
如果同时调用了 [`vitest.start()`](#start)，则不应调用此方法。
:::

如果设置了 `config.standalone`，[`startVitest`](/guide/advanced/tests) 会自动调用此方法。

## getModuleSpecifications

```ts
function getModuleSpecifications(moduleId: string): TestSpecification[]
```

返回与模块 ID 相关的测试规范（test specifications）列表。ID 应该已经解析为绝对文件路径。如果 ID 不匹配 `include` 或 `includeSource` 模式，返回的数组将为空。

此方法可以根据 `moduleId` 和 `pool` 返回已缓存的规范。但请注意，[`project.createSpecification`](/api/advanced/test-project#createspecification) 始终返回一个新实例，并且不会自动缓存。然而，当调用 [`runTestSpecifications`](#runtestspecifications) 时，规范会自动缓存。

::: warning
自 Vitest 3 起，此方法使用缓存来检查文件是否为测试文件。为确保缓存不为空，请至少调用一次 [`globTestSpecifications`](#globtestspecifications)。
:::

## clearSpecificationsCache

```ts
function clearSpecificationsCache(moduleId?: string): void
```

当调用 [`globTestSpecifications`](#globtestspecifications) 或 [`runTestSpecifications`](#runtestspecifications) 时，Vitest 会自动缓存每个文件的测试规范。此方法会根据第一个参数清除给定文件的缓存或清除整个缓存。

## runTestSpecifications

```ts
function runTestSpecifications(
  specifications: TestSpecification[],
  allTestsRun = false
): Promise<TestRunResult>
```

此方法根据接收到的 [规范](/api/advanced/test-specification) 运行每个测试。第二个参数 `allTestsRun` 由覆盖率提供者使用，以确定是否需要在报告中包含未覆盖的文件。

::: warning
此方法不会触发 `onWatcherRerun`、`onWatcherStart` 和 `onTestsRerun` 回调。如果你是基于文件更改重新运行测试，请考虑使用 [`rerunTestSpecifications`](#runtestspecifications) 代替。
:::

## rerunTestSpecifications

```ts
function rerunTestSpecifications(
  specifications: TestSpecification[],
  allTestsRun = false
): Promise<TestRunResult>
```

此方法发出 `reporter.onWatcherRerun` 和 `onTestsRerun` 事件，然后使用 [`runTestSpecifications`](#runtestspecifications) 运行测试。如果主进程中没有错误，它将发出 `reporter.onWatcherStart` 事件。

## runTestFiles <Version>4.1.0</Version> {#runtestfiles}

```ts
function runTestFiles(
  filepaths: string[],
  allTestsRun = false
): Promise<TestRunResult>
```

这会自动基于文件路径过滤器创建要运行的规范。

这与 [`start`](#start) 不同，因为它不会创建覆盖率提供者，不会触发 `onInit` 和 `onWatcherStart` 事件，也不会在没有文件可运行时抛出错误（在这种情况下，函数将返回空数组而不触发测试运行）。

此函数接受与 [`start`](#start) 和 CLI 相同的过滤器。

## updateSnapshot

```ts
function updateSnapshot(files?: string[]): Promise<TestRunResult>
```

更新指定文件中的快照。如果未提供文件，它将更新包含失败测试和过时快照的文件。

## collectTests

```ts
function collectTests(
  specifications: TestSpecification[]
): Promise<TestRunResult>
```

执行测试文件而不运行测试回调。`collectTests` 返回未处理的错误和 [测试模块](/api/advanced/test-module) 数组。

此方法的工作原理与 [`collect`](#collect) 完全相同，但你需要自己提供测试规范。

::: warning
请注意，Vitest 不使用静态分析来收集测试。Vitest 将隔离运行每个测试文件，就像运行常规测试一样。这使得此方法非常慢，除非你在收集测试之前禁用隔离。
:::

## cancelCurrentRun

```ts
function cancelCurrentRun(reason: CancelReason): Promise<void>
```

此方法将优雅地取消所有正在进行的测试。它将停止正在进行的测试，并且不会运行已计划但尚未开始的测试。

## setGlobalTestNamePattern

```ts
function setGlobalTestNamePattern(pattern: string | RegExp): void
```

此方法覆盖全局 [测试名称模式](/config/testnamepattern)。

::: warning
此方法不会开始运行任何测试。要使用更新后的模式运行测试，请调用 [`runTestSpecifications`](#runtestspecifications)。
:::

## getGlobalTestNamePattern <Version>4.0.0</Version> {#getglobaltestnamepattern}

```ts
function getGlobalTestNamePattern(): RegExp | undefined
```

返回用于全局测试名称模式的正则表达式。

## resetGlobalTestNamePattern

```ts
function resetGlobalTestNamePattern(): void
```

此方法重置 [测试名称模式](/config/testnamepattern)。这意味着 Vitest 现在不会跳过任何测试。

::: warning
此方法不会开始运行任何测试。要不带模式运行测试，请调用 [`runTestSpecifications`](#runtestspecifications)。
:::

## enableSnapshotUpdate

```ts
function enableSnapshotUpdate(): void
```

启用允许在运行测试时更新快照的模式。调用此方法后运行的每个测试都将更新快照。要禁用该模式，请调用 [`resetSnapshotUpdate`](#resetsnapshotupdate)。

::: warning
此方法不会开始运行任何测试。要更新快照，请使用 [`runTestSpecifications`](#runtestspecifications) 运行测试。
:::

## resetSnapshotUpdate

```ts
function resetSnapshotUpdate(): void
```

禁用允许在运行测试时更新快照的模式。此方法不会开始运行任何测试。

## invalidateFile

```ts
function invalidateFile(filepath: string): void
```

此方法使每个项目缓存中的文件失效。如果你依赖自己的监视器（watcher），因为 Vite 的缓存持久存在于内存中，所以此方法最有用。

::: danger
如果你禁用了 Vitest 的监视器但保持 Vitest 运行，重要的是使用此方法手动清除缓存，因为无法禁用缓存。此方法还将使文件的导入者（importers）失效。
:::

## import

<!--@include: ./import-example.md-->

使用 Vite 模块运行器导入文件。该文件将由 Vite 使用全局配置进行转换，并在单独的上下文中执行。请注意，`moduleId` 将相对于 `config.root`。

::: danger
`project.import` 复用 Vite 的模块图，因此使用常规导入导入相同的模块将返回不同的模块：

```ts
import * as staticExample from './example.js'
const dynamicExample = await vitest.import('./example.js')

dynamicExample !== staticExample // ✅
```
:::

::: info
内部而言，Vitest 使用此方法导入全局设置、自定义覆盖率提供者和自定义报告器，这意味着只要它们属于同一个 Vite 服务器，它们都共享相同的模块图。
:::

## close

```ts
function close(): Promise<void>
```

关闭所有项目及其关联资源。这只能调用一次；关闭承诺（promise）会被缓存直到服务器重启。

## exit

```ts
function exit(force = false): Promise<void>
```

关闭所有项目并退出进程。如果 `force` 设置为 `true`，进程将在关闭项目后立即退出。

此方法还将强制调用 `process.exit()`，如果进程在 [`config.teardownTimeout`](/config/teardowntimeout) 毫秒后仍然处于活动状态。

## shouldKeepServer

```ts
function shouldKeepServer(): boolean
```

如果测试完成后应保持服务器运行，此方法将返回 `true`。这通常意味着启用了 `watch` 模式。

## onServerRestart

```ts
function onServerRestart(fn: OnServerRestartHandler): void
```

注册一个处理程序，当服务器因配置更改而重启时将调用该处理程序。

## onCancel

```ts
function onCancel(fn: (reason: CancelReason) => Awaitable<void>): () => void
```

注册一个处理程序，当使用 [`vitest.cancelCurrentRun`](#cancelcurrentrun) 取消测试运行时将调用该处理程序。

自 4.0.10 起，`onCancel` 实验性地返回一个清理函数，该函数将移除监听器。自 4.1.0 起，此行为被视为稳定。

## onClose

```ts
function onClose(fn: () => Awaitable<void>): void
```

注册一个处理程序，当服务器关闭时将调用该处理程序。

## onTestsRerun

```ts
function onTestsRerun(fn: OnTestsRerunHandler): void
```

注册一个处理程序，当测试重新运行时将调用该处理程序。当手动调用 [`rerunTestSpecifications`](#reruntestspecifications) 或文件更改且内置监视器计划重新运行时，测试可能会重新运行。

## onFilterWatchedSpecification

```ts
function onFilterWatchedSpecification(
  fn: (specification: TestSpecification) => boolean
): void
```
注册一个处理程序，当文件更改时将调用该处理程序。此回调应返回 `true` 或 `false`，指示是否需要重新运行测试文件。

使用此方法，你可以挂钩到默认监视器逻辑中，以延迟或丢弃用户当前不想跟踪的测试：

```ts
const continuesTests: string[] = []

myCustomWrapper.onContinuesRunEnabled(testItem =>
  continuesTests.push(item.fsPath)
)

vitest.onFilterWatchedSpecification(specification =>
  continuesTests.includes(specification.moduleId)
)
```

Vitest 可以根据 `pool` 或 `locations` 选项为同一文件创建不同的规范，因此不要依赖引用。Vitest 还可以从 [`vitest.getModuleSpecifications`](#getmodulespecifications) 返回缓存的规范 - 缓存基于 `moduleId` 和 `pool`。请注意，[`project.createSpecification`](/api/advanced/test-project#createspecification) 始终返回一个新实例。

## matchesProjectFilter <Version>3.1.0</Version> {#matchesprojectfilter}

```ts
function matchesProjectFilter(name: string): boolean
```

检查名称是否匹配当前的 [项目过滤器](/guide/cli#project)。如果没有项目过滤器，这将始终返回 `true`。

无法以编程方式更改 `--project` CLI 选项。

## waitForTestRunEnd <Version>4.0.0</Version> {#waitfortestrunend}

```ts
function waitForTestRunEnd(): Promise<void>
```

如果正在发生测试运行，返回一个将在测试运行完成时 resolve 的 Promise。

## createCoverageProvider <Version>4.0.0</Version> {#createcoverageprovider}

```ts
function createCoverageProvider(): Promise<CoverageProvider | null>
```

如果配置中启用了 `coverage`，则创建一个覆盖率提供者。如果你使用 [`start`](#start) 或 [`standalone`](#standalone) 方法运行测试，这将自动完成。

::: warning
如果 [`coverage.clean`](/config/coverage#coverage-clean) 未设置为 `false`，此方法还将清除所有之前的报告。
:::

## enableCoverage <Version>4.0.0</Version> {#enablecoverage}

```ts
function enableCoverage(): Promise<void>
```

此方法为此调用之后运行的测试启用覆盖率。`enableCoverage` 不运行任何测试；它仅设置 Vitest 以收集覆盖率。

如果尚不存在覆盖率提供者，它会创建一个新的。

## disableCoverage <Version>4.0.0</Version> {#disablecoverage}

```ts
function disableCoverage(): void
```

此方法禁用之后运行的测试的覆盖率收集。

## getSeed <Version>4.0.0</Version> {#getseed}

```ts
function getSeed(): number | null
```

如果测试以随机顺序运行，返回种子值。

## experimental_parseSpecification <Version type="experimental">4.0.0</Version> <Experimental /> {#parsespecification}

```ts
function experimental_parseSpecification(
  specification: TestSpecification
): Promise<TestModule>
```

此函数将收集文件内的所有测试而不运行它。它在 Vite 的 `ssrTransform` 之上使用 rollup 的 `parseAst` 函数来静态分析文件并收集所有能收集到的测试。

::: warning
如果 Vitest 无法分析测试名称，它将向测试或套件注入一个 `dynamic: true` 属性。`id` 还将带有 `-dynamic` 后缀，以免破坏正确收集的测试。

Vitest 总是在带有 `for` 或 `each` 修饰器的测试或具有动态名称的测试（例如，`hello ${property}` 或 `'hello' + ${property}`）中注入此属性。Vitest 仍会为测试分配一个名称，但不能用于过滤测试。

Vitest 无法做到使过滤动态测试成为可能，但你可以使用 `escapeTestName` 函数将带有 `for` 或 `each` 修饰器的测试转换为名称模式：

```ts
import { escapeTestName } from 'vitest/node'

// 转换为 /hello, .+?/
const escapedPattern = new RegExp(escapeTestName('hello, %s', true))
```
:::

::: warning
Vitest 仅收集文件中定义的测试。它永远不会跟踪导入到其他文件。

Vitest 收集所有 `it`、`test`、`suite` 和 `describe` 定义，即使它们不是从 `vitest` 入口点导入的。
:::

## experimental_parseSpecifications <Version type="experimental">4.0.0</Version> <Experimental /> {#parsespecifications}

```ts
function experimental_parseSpecifications(
  specifications: TestSpecification[],
  options?: {
    concurrency?: number
  }
): Promise<TestModule[]>
```

此方法将从规范数组中 [收集测试](#parsespecification)。默认情况下，Vitest 一次仅运行 `os.availableParallelism()` 数量的规范，以减少潜在的性能下降。你可以在第二个参数中指定不同的数字。

## experimental_clearCache <Version type="experimental">4.0.11</Version> <Experimental /> {#clearcache}

```ts
function experimental_clearCache(): Promise<void>
```

删除所有 Vitest 缓存，包括 [`experimental.fsModuleCache`](/config/experimental#experimental-fsmodulecache)。

## experimental_getSourceModuleDiagnostic <Version type="experimental">4.0.15</Version> <Experimental /> {#getsourcemodulediagnostic}

```ts
export function experimental_getSourceModuleDiagnostic(
  moduleId: string,
  testModule?: TestModule,
): Promise<SourceModuleDiagnostic>
```

::: details 类型
```ts
export interface ModuleDefinitionLocation {
  line: number
  column: number
}

export interface SourceModuleLocations {
  modules: ModuleDefinitionDiagnostic[]
  untracked: ModuleDefinitionDiagnostic[]
}

export interface ModuleDefinitionDiagnostic {
  start: ModuleDefinitionLocation
  end: ModuleDefinitionLocation
  startIndex: number
  endIndex: number
  url: string
  resolvedId: string
}

export interface ModuleDefinitionDurationsDiagnostic extends ModuleDefinitionDiagnostic {
  selfTime: number
  totalTime: number
  external?: boolean
}

export interface UntrackedModuleDefinitionDiagnostic {
  url: string
  resolvedId: string
  selfTime: number
  totalTime: number
  external?: boolean
}

export interface SourceModuleDiagnostic {
  modules: ModuleDefinitionDurationsDiagnostic[]
  untrackedModules: UntrackedModuleDefinitionDiagnostic[]
}
```
:::

返回模块的诊断信息。如果未提供 [`testModule`](/api/advanced/test-module)，`selfTime` 和 `totalTime` 将在上次运行的所有测试中聚合。如果模块未转换或执行，诊断信息将为空。

::: warning
目前，不支持 [浏览器](/guide/browser/) 模块。
:::
