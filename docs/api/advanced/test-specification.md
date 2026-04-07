# TestSpecification

`TestSpecification` 类描述了作为测试运行的模块及其参数。

你只能通过调用测试项目上的 [`createSpecification`](/api/advanced/test-project#createspecification) 方法来创建规范：

```ts
const specification = project.createSpecification(
  resolve('./example.test.ts'),
  {
    testLines: [20, 40],
    testNamePattern: /hello world/,
    testIds: ['1223128da3_0_0_0', '1223128da3_0_0'],
    testTagsFilter: ['frontend and backend'],
  } // 可选的测试过滤器
)
```

`createSpecification` 需要已解析的模块标识符。它不会自动解析文件或检查文件是否存在于文件系统中。

## taskId

[测试模块的](/api/advanced/test-suite#id) 标识符。

## project

这引用了测试模块所属的 [`TestProject`](/api/advanced/test-project)。

## moduleId

Vite 模块图中模块的 ID。通常，它是使用 posix 分隔符的绝对文件路径：

```ts
'C:/Users/Documents/project/example.test.ts' // ✅
'/Users/mac/project/example.test.ts' // ✅
'C:\\Users\\Documents\\project\\example.test.ts' // ❌
```

## testModule

与规范关联的 [`TestModule`](/api/advanced/test-module) 实例。如果测试尚未排队，这将是 `undefined`。

## pool {#pool}

测试模块将在其中运行的 [`pool`](/config/pool)。

::: danger
在单个测试项目中使用 [`typecheck.enabled`](/config/typecheck#typecheck-enabled) 可能拥有多个池。这意味着可能拥有几个具有相同 `moduleId` 但不同 `pool` 的规范。在以后的版本中，项目将只支持单个池。
:::

## testLines

这是源代码中定义测试的行号数组。仅当 `createSpecification` 方法接收到数组时，才会定义此字段。

请注意，如果至少有一行上没有测试，整个套件将失败。正确 `testLines` 配置的示例：

::: code-group
```ts [script.js]
const specification = project.createSpecification(
  resolve('./example.test.ts'),
  [3, 8, 9],
)
```
```ts:line-numbers{3,8,9} [example.test.js]
import { test, describe } from 'vitest'

test('verification works')

describe('a group of tests', () => { // [!code error]
  // ...

  test('nested test')
  test.skip('skipped test')
})
```
:::

## testNamePattern <Version>4.1.0</Version> {#testnamepattern}

与此模块中的测试名称匹配的正则表达式。如果设置了此值，它将覆盖全局 [`testNamePattern`](/config/testnamepattern) 选项。

## testIds <Version>4.1.0</Version> {#testids}

要运行的此规范内部任务的 id。

## testTagsFilter <Version>4.1.0</Version> {#testtagsfilter}

测试必须通过的 [标签过滤器](/guide/test-tags#syntax) 才能被包含在运行中。多个过滤器被视为 `AND`。

## toJSON

```ts
function toJSON(): SerializedTestSpecification
```

`toJSON` 生成一个 JSON 友好的对象，可由 [浏览器模式](/guide/browser/) 或 [Vitest UI](/guide/ui) 使用。
