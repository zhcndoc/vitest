---
outline: deep
title: 测试工件
---

# 测试工件 <Advanced /> <Version type="experimental">4.0.11</Version> <Experimental />

::: warning
这是一个高级 API。作为用户，你很可能想要使用 [测试注解](/guide/test-annotations) 来为你的测试添加笔记或上下文。这主要用于内部和库作者。
:::

测试工件允许在测试执行期间附加或记录结构化数据、文件或元数据。这是一个低级功能，主要设计用于：

- 内部使用（[`annotate`](/guide/test-annotations) 是建立在工件系统之上的）
- 框架作者在 Vitest 之上创建自定义测试工具

每个工件包括：

- 一个类型区分符，它是工件类型的唯一标识符
- 自定义数据，可以是任何相关信息
- 可选附件，要么是文件要么是与工件关联的内联内容
- 一个源代码位置，指示工件创建的位置

Vitest 自动管理附件序列化（文件被复制到 [`attachmentsDir`](/config/attachmentsdir)）并注入源代码位置元数据，所以你可以专注于想要记录的数据。所有工件 **必须** 继承自 [`TestArtifactBase`](#testartifactbase) 并且所有附件继承自 [`TestAttachment`](#testattachment) 才能在内部被正确处理。

## API

### `recordArtifact` <Experimental /> {#recordartifact}

::: warning
`recordArtifact` 是一个实验性 API。破坏性变更可能不遵循 SemVer，请在使用时锁定 Vitest 的版本。

API 表面可能会根据反馈而变化。我们鼓励你尝试并与团队分享你的经验。
:::

```ts
function recordArtifact<Artifact extends TestArtifact>(task: Test, artifact: Artifact): Promise<Artifact>
```

`recordArtifact` 函数在测试执行期间记录工件并返回它。它期望第一个参数是一个 [task](/api/advanced/runner#tasks)，第二个参数是一个可赋值给 [`TestArtifact`](#testartifact) 的对象。

::: info
工件必须在任务被报告之前记录。之后记录的任何工件将不会包含在任务中。
:::

当在测试上记录工件时，它会发出 `onTestArtifactRecord` 运行器事件和 [`onTestCaseArtifactRecord` 报告器事件](/api/advanced/reporters#ontestcaseartifactrecord)。要从测试用例中检索记录的工件，请使用 [`artifacts()`](/api/advanced/test-case#artifacts) 方法。

注意：注解，[即使它们是建立在此功能之上的](#relationship-with-annotations)，为了向后兼容原因，直到下一个主要版本之前，不会出现在 `task.artifacts` 数组中。

### `TestArtifact`

`TestArtifact` 类型是一个联合类型，包含 Vitest 可以产生的所有工件，包括自定义的。所有工件都扩展自 [`TestArtifactBase`](#testartifactbase)

### `TestArtifactBase` <Experimental /> {#testartifactbase}

```ts
export interface TestArtifactBase {
  /** 与此工件关联的文件或数据附件 */
  attachments?: TestAttachment[]
  /** 创建此工件的源代码位置 */
  location?: TestArtifactLocation
}
```

`TestArtifactBase` 接口是所有测试工件的基础。

创建自定义测试工件时扩展此接口。Vitest 自动管理 `attachments` 数组并注入 `location` 属性以指示工件是在测试代码中的何处创建的。

::: danger
当在 [`api.allowWrite`](/config/api#api-allowwrite) 或 [`browser.api.allowWrite`](/config/browser/api#api-allowwrite) 禁用的情况下运行时，Vitest 会在报告之前清空每个工件上的 `attachments` 数组。

如果你的自定义工件缩小了 `attachments` 类型（例如变为元组），请在联合类型中包含 `| []`，以便类型反映运行时实际发生的情况。
:::

### `TestAttachment`

```ts
export interface TestAttachment {
  /** 附件的 MIME 类型（例如，'image/png', 'text/plain'） */
  contentType?: string
  /** 本地文件路径或指向附件的外部 HTTP(S) URL。相对路径从项目根目录解析。 */
  path?: string
  /** 内联附件内容，作为字符串或原始二进制数据 */
  body?: string | Uint8Array
  /**
   * @experimental
   * 字符串 `body` 是如何编码的。
   * - `'base64'` (默认): body 已经是 base64 编码
   * - `'utf-8'`: body 是一个 utf8 字符串
   */
  bodyEncoding?: 'base64' | 'utf-8'
}
```

`TestAttachment` 接口表示与测试工件关联的文件或数据附件。

附件可以基于路径（通过 `path`）或内联内容（通过 `body`）。`contentType` 有助于使用者理解如何解释附件数据。

附件 `path` 可以指向本地文件或外部 `http`/`https` URL。相对本地路径从项目根目录解析。本地文件会在报告器接收之前复制到 Vitest 的附件目录中。外部 URL 会按原样保留。

如果你传递一个字符串 `body`，Vitest 假设它已经是 base64 编码的，除非你设置 `bodyEncoding: 'utf-8'`。当你传递 `body` 为 `Uint8Array` 时，Vitest 自动将其编码为 base64。`bodyEncoding` 选项仅适用于内联 `body` 附件，不适用于 `path` 附件。

### `TestArtifactLocation`

```ts
export interface TestArtifactLocation {
  /** 源文件中的行号（从 1 开始索引） */
  line: number
  /** 行中的列号（从 1 开始索引） */
  column: number
  /** 源文件的路径 */
  file: string
}
```

`TestArtifactLocation` 接口表示测试工件的源代码位置信息。它指示工件源自源代码中的何处。

### `TestArtifactRegistry`

`TestArtifactRegistry` 接口是自定义测试工件类型的注册表。

使用 [TypeScript 的模块增强功能](https://typescriptlang.org/docs/handbook/declaration-merging#module-augmentation) 增强此接口允许注册测试可以产生的自定义工件类型。

每个自定义工件应该扩展 [`TestArtifactBase`](#testartifactbase) 并包含一个唯一的 `type` 区分符属性。

以下是一些要遵循的指南或最佳实践：

- 尝试使用 `Symbol` 作为 **注册表键** 以保证唯一性
- `type` 属性应遵循模式 `'package-name:artifact-name'`，**`'internal:'` 是保留前缀**
- 使用 `attachments` 包含文件或数据；扩展 [`TestAttachment`](#testattachment) 以获取自定义元数据
- 如果你缩小了 `attachments` 类型（例如变为元组），在联合类型中包含 `| []`，因为 Vitest 可能在运行时清空数组（见 [`TestArtifactBase`](#testartifactbase)）
- `location` 属性是自动注入的

## 自定义工件

要以类型安全的方式使用和管理工件，你需要创建其类型并注册它：

```ts
import type { TestArtifactBase, TestAttachment } from 'vitest'

interface A11yReportAttachment extends TestAttachment {
  contentType: 'text/html'
  path: string
}

interface AccessibilityArtifact extends TestArtifactBase {
  type: 'a11y:report'
  passed: boolean
  wcagLevel: 'A' | 'AA' | 'AAA'
  attachments: [A11yReportAttachment] | []
}

const a11yReportKey = Symbol('report')

declare module 'vitest' {
  interface TestArtifactRegistry {
    [a11yReportKey]: AccessibilityArtifact
  }
}
```

只要类型可分配给它们的基础且没有错误，一切应该正常工作，你应该能够使用 [`recordArtifact`](#recordartifact) 记录工件：

```ts
async function toBeAccessible(
  this: MatcherState,
  actual: Element,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): AsyncExpectationResult {
  const report = await runAccessibilityAudit(actual, wcagLevel)

  await recordArtifact(this.task, {
    type: 'a11y:report',
    passed: report.violations.length === 0,
    wcagLevel,
    attachments: [{
      contentType: 'text/html',
      path: report.path,
    }],
  })

  return {
    pass: violations.length === 0,
    message: () => `Found ${report.violations.length} accessibility violation(s)`
  }
}
```

## 与注解的关系

测试注解是建立在工件系统之上的。当在测试中使用注解时，它们在底层创建 `internal:annotation` 工件。然而，注解是：

- 更易于使用
- 为最终用户设计，而不是开发者

如果你只是想给测试添加笔记，请使用注解。如果你需要自定义数据，请使用工件。
