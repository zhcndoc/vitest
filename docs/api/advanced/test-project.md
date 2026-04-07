---
title: TestProject
---

# TestProject <Version>3.0.0</Version> {#testproject}

::: warning
本指南描述了高级 Node.js API。如果你只是想定义项目，请遵循 ["测试项目"](/guide/projects) 指南。
:::

## name

name 是用户分配或由 Vitest 解释的唯一字符串。如果用户没有提供 name，Vitest 会尝试加载项目根目录中的 `package.json` 并从中获取 `name` 属性。如果没有 `package.json`，Vitest 默认使用文件夹的 name。内联项目使用数字作为 name（转换为字符串）。

::: code-group
```ts [node.js]
import { createVitest } from 'vitest/node'

const vitest = await createVitest('test')
vitest.projects.map(p => p.name) === [
  '@pkg/server',
  'utils',
  '2',
  'custom'
]
```
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './packages/server', // 拥有包含 "@pkg/server" 的 package.json
      './utils', // 没有 package.json 文件
      {
        // 没有自定义 name
        test: {
          pool: 'threads',
        },
      },
      {
        // 自定义了 name
        test: {
          name: 'custom',
        },
      },
    ],
  },
})
```
:::

::: info
如果 [根项目](/api/advanced/vitest#getrootproject) 不是用户项目的一部分，其 `name` 将不会被解析。
:::

## vitest

`vitest` 引用全局 [`Vitest`](/api/advanced/vitest) 进程。

## serializedConfig

这是测试进程接收的配置。Vitest 通过手动移除所有无法序列化的函数和属性来 [序列化配置](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/config/serializeConfig.ts)。由于该值在测试和 node 中都可用，其类型从主入口点导出。

```ts
import type { SerializedConfig } from 'vitest'

const config: SerializedConfig = vitest.projects[0].serializedConfig
```

::: warning
`serializedConfig` 属性是一个 getter。每次访问它时，Vitest 都会再次序列化配置，以防它被更改。这也意味着它总是返回不同的引用：

```ts
project.serializedConfig === project.serializedConfig // ❌
```
:::

## globalConfig

[`Vitest`](/api/advanced/vitest) 初始化时的测试配置。如果这是 [根项目](/api/advanced/vitest#getrootproject)，`globalConfig` 和 `config` 将引用同一个对象。此配置适用于无法在项目级别设置的值，如 `coverage` 或 `reporters`。

```ts
import type { ResolvedConfig } from 'vitest/node'

vitest.config === vitest.projects[0].globalConfig
```

## config

这是项目的解析后测试配置。

## hash <Version>3.2.0</Version> {#hash}

此项目的唯一 hash。此值在重新运行之间保持一致。

它基于项目的根目录及其名称。请注意，根路径在不同操作系统之间不一致，因此 hash 也会不同。

## vite

这是项目的 [`ViteDevServer`](https://vite.dev/guide/api-javascript#vitedevserver)。所有项目都有自己的 Vite 服务器。

## browser

仅当测试在浏览器中运行时才会设置此值。如果启用了 `browser`，但测试尚未运行，这将为 `undefined`。如果你需要检查项目是否支持浏览器测试，请使用 `project.isBrowserEnabled()` 方法。

::: warning
浏览器 API 更具实验性，且不遵循 SemVer。浏览器 API 将与其他 API 分开标准化。
:::

## provide

```ts
function provide<T extends keyof ProvidedContext & string>(
  key: T,
  value: ProvidedContext[T],
): void
```

一种向测试提供自定义值的方法，除了 [`config.provide`](/config/provide) 字段之外。所有值在存储前都会使用 [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) 进行验证，但 `providedContext` 上的值本身不会被克隆。

::: code-group
```ts [node.js]
import { createVitest } from 'vitest/node'

const vitest = await createVitest('test')
const project = vitest.projects.find(p => p.name === 'custom')
project.provide('key', 'value')
await vitest.start()
```
```ts [test.spec.js]
import { inject } from 'vitest'
const value = inject('key')
```
:::

值可以动态提供。测试中提供的值将在下次运行时更新。

::: tip
此方法也可用于 [全局设置文件](/config/globalsetup)，适用于无法使用公共 API 的情况：

```js
export default function setup({ provide }) {
  provide('wsPort', 3000)
}
```
:::

## getProvidedContext

```ts
function getProvidedContext(): ProvidedContext
```

这返回上下文对象。每个项目也继承由 `vitest.provide` 设置的全局上下文。

```ts
import { createVitest } from 'vitest/node'

const vitest = await createVitest('test')
vitest.provide('global', true)
const project = vitest.projects.find(p => p.name === 'custom')
project.provide('key', 'value')

// { global: true, key: 'value' }
const context = project.getProvidedContext()
```

::: tip
项目上下文值将始终覆盖根项目的上下文。
:::

## createSpecification

```ts
function createSpecification(
  moduleId: string,
  locations?: number[],
): TestSpecification
```

创建一个 [测试规范](/api/advanced/test-specification)，可用于 [`vitest.runTestSpecifications`](/api/advanced/vitest#runtestspecifications)。规范将测试文件范围限定到特定的 `project` 和测试 `locations`（可选）。测试 [locations](/api/advanced/test-case#location) 是源代码中定义测试的代码行。如果提供了 locations，Vitest 将只运行在这些行上定义的测试。请注意，如果定义了 [`testNamePattern`](/config/testnamepattern)，它也将被应用。

```ts
import { createVitest } from 'vitest/node'
import { resolve } from 'node:path/posix'

const vitest = await createVitest('test')
const project = vitest.projects[0]
const specification = project.createSpecification(
  resolve('./example.test.ts'),
  [20, 40], // 可选的测试行
)
await vitest.runTestSpecifications([specification])
```

::: warning
`createSpecification` 期望解析后的 [模块 ID](/api/advanced/test-specification#moduleid)。它不会自动解析文件或检查它是否存在于文件系统中。

还要注意 `project.createSpecification` 总是返回一个新实例。
:::

## isRootProject

```ts
function isRootProject(): boolean
```

检查当前项目是否为根项目。你也可以通过调用 [`vitest.getRootProject()`](/api/advanced/vitest#getrootproject) 获取根项目。

## globTestFiles

```ts
function globTestFiles(filters?: string[]): {
  /**
   * 匹配过滤器的测试文件。
   */
  testFiles: string[]
  /**
   * 匹配过滤器的类型检查测试文件。除非 `typecheck.enabled` 为 `true`，否则这将为空。
   */
  typecheckTestFiles: string[]
}
```

匹配所有测试文件。此函数返回一个包含常规测试和类型检查测试的对象。

此方法接受 `filters`。与 [`Vitest`](/api/advanced/vitest) 实例上的其他方法不同，过滤器只能是文件路径的一部分：

```js
project.globTestFiles(['foo']) // ✅
project.globTestFiles(['basic/foo.js:10']) // ❌
```

::: tip
Vitest 使用 [fast-glob](https://npmx.dev/package/fast-glob) 来查找测试文件。`test.dir`, `test.root`, `root` 或 `process.cwd()` 定义 `cwd` 选项。

此方法查看几个配置选项：

- `test.include`, `test.exclude` 用于查找常规测试文件
- `test.includeSource`, `test.exclude` 用于查找源内测试
- `test.typecheck.include`, `test.typecheck.exclude` 用于查找类型检查测试
:::

## matchesTestGlob

```ts
function matchesTestGlob(
  moduleId: string,
  source?: () => string
): boolean
```

此方法检查文件是否为常规测试文件。它使用与 `globTestFiles` 相同的配置属性进行验证。

此方法还接受第二个参数，即源代码。这用于验证文件是否为源内测试。如果你为多个项目多次调用此方法，建议读取文件一次并直接传递下去。如果文件不是测试文件，但匹配 `includeSource` glob，除非提供了 `source`，否则 Vitest 将同步读取文件。

```ts
import { createVitest } from 'vitest/node'
import { resolve } from 'node:path/posix'

const vitest = await createVitest('test')
const project = vitest.projects[0]

project.matchesTestGlob(resolve('./basic.test.ts')) // true
project.matchesTestGlob(resolve('./basic.ts')) // false
project.matchesTestGlob(resolve('./basic.ts'), () => `
if (import.meta.vitest) {
  // ...
}
`) // 如果设置了 `includeSource` 则为 true
```

## import

<!--@include: ./import-example.md-->

使用 Vite 模块运行器导入文件。文件将由 Vite 使用提供的项目配置进行转换，并在单独的上下文中执行。请注意 `moduleId` 将相对于 `config.root`。

::: danger
`project.import` 复用 Vite 的模块图，因此使用常规导入导入相同的模块将返回不同的模块：

```ts
import * as staticExample from './example.js'
const dynamicExample = await project.import('./example.js')

dynamicExample !== staticExample // ✅
```
:::

::: info
内部而言，Vitest 使用此方法导入全局设置、自定义覆盖率提供程序和自定义报告器，意味着只要它们属于同一个 Vite 服务器，它们都共享相同的模块图。
:::

## onTestsRerun

```ts
function onTestsRerun(cb: OnTestsRerunHandler): void
```

这是 [`project.vitest.onTestsRerun`](/api/advanced/vitest#ontestsrerun) 的简写。它接受一个回调，当测试被计划重新运行时（通常是由于文件更改），该回调将被等待。

```ts
project.onTestsRerun((specs) => {
  console.log(specs)
})
```

## isBrowserEnabled

```ts
function isBrowserEnabled(): boolean
```

如果此项目在浏览器中运行测试，则返回 `true`。

## close

```ts
function close(): Promise<void>
```

关闭项目及其所有关联资源。此方法只能调用一次；关闭 Promise 会被缓存，直到服务器重启。如果需要再次使用这些资源，请创建一个新项目。

具体来说，此方法会关闭 Vite 服务器，停止类型检查服务，如果浏览器正在运行则关闭它，删除存放源代码的临时目录，并重置提供的上下文。
