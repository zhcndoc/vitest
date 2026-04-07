# 模拟模块

## 定义模块

在模拟“模块”之前，我们应该定义它是什么。在 Vitest 上下文中，“模块”是导出某些内容的文件。使用 [插件](https://vite.dev/guide/api-plugin.html)，任何文件都可以变成 JavaScript 模块。“模块对象”是一个持有导出标识符动态引用的命名空间对象。简单来说，它是一个具有导出方法和属性的对象。在这个例子中，`example.js` 是一个导出 `answer` 和 `variable` 的模块：

```js [example.js]
export function answer() {
  // ...
  return 42
}

export const variable = 'example'
```

这里的 `exampleObject` 是一个模块对象：

```js [example.test.js]
import * as exampleObject from './example.js'
```

即使你使用命名导入导入示例，`exampleObject` 也将始终存在：

```js [example.test.js]
import { answer, variable } from './example.js'
```

你只能在示例模块本身之外引用 `exampleObject`。例如，在测试中。

## 模拟模块

为了本指南的目的，让我们介绍一些定义。

- **被模拟的模块 (Mocked module)** 是完全被另一个模块替换的模块。
- **被监听的模块 (Spied module)** 是被模拟的模块，但其导出的方法保留原始实现。它们也可以被追踪。
- **被模拟的导出 (Mocked export)** 是一个模块导出，其调用可以被追踪。
- **被监听的导出 (Spied export)** 是被模拟的导出。

要完全模拟一个模块，你可以使用 [`vi.mock` API](/api/vi#vi-mock)。你可以通过提供一个返回新模块的工厂函数作为第二个参数来动态定义一个新模块：

```ts
import { vi } from 'vitest'

// ./example.js 模块将被替换为
// 工厂函数的结果，并且
// 原始的 ./example.js 模块将永远不会被调用
vi.mock(import('./example.js'), () => {
  return {
    answer() {
      // ...
      return 42
    },
    variable: 'mock',
  }
})
```

::: tip
记住，你可以在 [设置文件](/config/setupfiles) 中调用 `vi.mock`，以便在每个测试文件中自动应用模块模拟。
:::

::: tip
注意动态导入的使用：`import('./example.ts')`。Vitest 会在代码执行之前剥离它，但它允许 TypeScript 正确地验证字符串并在你的 IDE 或 CLI 中为 `importOriginal` 方法 typing。
:::

如果你的代码试图访问未从此工厂返回的方法，Vitest 将抛出一个带有有帮助消息的错误。注意 `answer` 没有被模拟，即它不能被追踪。要使其可追踪，请使用 `vi.fn()` 代替：

```ts
import { vi } from 'vitest'

vi.mock(import('./example.js'), () => {
  return {
    answer: vi.fn(),
    variable: 'mock',
  }
})
```

工厂方法接受一个 `importOriginal` 函数，该函数将执行原始模块并返回其模块对象：

```ts
import { expect, vi } from 'vitest'
import { answer } from './example.js'

vi.mock(import('./example.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    answer: vi.fn(originalModule.answer),
    variable: 'mock',
  }
})

expect(answer()).toBe(42)

expect(answer).toHaveBeenCalled()
expect(answer).toHaveReturned(42)
```

::: warning
注意 `importOriginal` 是异步的，需要被 await。
:::

在上面的例子中，我们将原始 `answer` 提供给 `vi.fn()` 调用，以便它可以在被追踪的同时继续调用它。

如果你需要使用 `importOriginal`，考虑通过另一个 API 直接监听导出：`vi.spyOn`。你可以只监听单个导出的方法，而不是替换整个模块。为此，你需要将模块作为命名空间对象导入：

```ts
import { expect, vi } from 'vitest'
import * as exampleObject from './example.js'

const spy = vi.spyOn(exampleObject, 'answer').mockReturnValue(0)

expect(exampleObject.answer()).toBe(0)
expect(exampleObject.answer).toHaveBeenCalled()
```

::: danger 浏览器模式支持
这在 [浏览器模式](/guide/browser/) 中不起作用，因为它使用浏览器的原生 ESM 支持来提供模块。模块命名空间对象是密封的，不能重新配置。要绕过此限制，Vitest 在 `vi.mock('./example.js')` 中支持 `{ spy: true }` 选项。这将自动监听模块中的每个导出，而不会用假的导出替换它们。

```ts
import { vi } from 'vitest'
import * as exampleObject from './example.js'

vi.mock('./example.js', { spy: true })

vi.mocked(exampleObject.answer).mockReturnValue(0)
```
:::

::: warning
你只需要在使用 `vi.spyOn` 工具的文件中将模块导入为命名空间对象。如果 `answer` 在另一个文件中被调用并在那里作为命名导出导入，只要调用它的函数在 `vi.spyOn` 之后被调用，Vitest 将能够正确地追踪它：

```ts [source.js]
import { answer } from './example.js'

export function question() {
  if (answer() === 42) {
    return 'Ultimate Question of Life, the Universe, and Everything'
  }

  return 'Unknown Question'
}
```
:::

注意 `vi.spyOn` 只会监听在它监听该方法之后进行的调用。因此，如果函数在导入期间在顶层执行，或者在监听之前被调用，`vi.spyOn` 将无法报告它。

要在任何模块被导入之前自动模拟它，你可以使用路径调用 `vi.mock`：

```ts
import { vi } from 'vitest'

vi.mock(import('./example.js'))
```

如果文件 `./__mocks__/example.js` 存在，那么 Vitest 将加载它。否则，Vitest 将加载原始模块并递归替换所有内容：

{#automocking-algorithm}

- 所有数组将为空
- 所有原始值将保持不变
- 所有 getter 将返回 `undefined`
- 所有方法将返回 `undefined`
- 所有对象将被深度克隆
- 所有类实例及其原型将被克隆

要禁用此行为，你可以传递 `spy: true` 作为第二个参数：

```ts
import { vi } from 'vitest'

vi.mock(import('./example.js'), { spy: true })
```

所有方法将调用原始实现而不是返回 `undefined`，但你仍然可以追踪这些调用：

```ts
import { expect, vi } from 'vitest'
import { answer } from './example.js'

vi.mock(import('./example.js'), { spy: true })

// 调用原始实现
expect(answer()).toBe(42)
// vitest 仍然可以追踪这些调用
expect(answer).toHaveBeenCalled()
```

被模拟的模块支持的一个好处是在实例及其原型之间共享状态。考虑这个模块：

```ts [answer.js]
export class Answer {
  constructor(value) {
    this._value = value
  }

  value() {
    return this._value
  }
}
```

通过模拟它，我们可以追踪 `.value()` 的每次调用，即使无法访问实例本身：

```ts [answer.test.js]
import { expect, test, vi } from 'vitest'
import { Answer } from './answer.js'

vi.mock(import('./answer.js'), { spy: true })

test('instance inherits the state', () => {
  // 这些调用可能是另一个函数内部的私有调用
  // 你在测试中无法访问该函数
  const answer1 = new Answer(42)
  const answer2 = new Answer(0)

  expect(answer1.value()).toBe(42)
  expect(answer1.value).toHaveBeenCalled()
  // 注意不同的实例有自己的状态
  expect(answer2.value).not.toHaveBeenCalled()

  expect(answer2.value()).toBe(0)

  // 但原型状态累积所有调用
  expect(Answer.prototype.value).toHaveBeenCalledTimes(2)
  expect(Answer.prototype.value).toHaveReturned(42)
  expect(Answer.prototype.value).toHaveReturned(0)
})
```

这对于追踪从未暴露的实例的调用非常有用。

## 模拟不存在的模块

Vitest 支持模拟虚拟模块。这些模块在文件系统中不存在，但你的代码导入它们。例如，当你的开发环境与生产环境不同时可能会发生这种情况。一个常见的例子是在单元测试中模拟 `vscode` API。

默认情况下，如果 Vitest 找不到导入的来源，它将无法转换文件并失败。要绕过此问题，你需要在配置中指定它。你可以总是将导入重定向到文件，或者只是信号通知 Vite 忽略它并使用 `vi.mock` 工厂来定义其导出。

要重定向导入，使用 [`test.alias`](/config/alias) 配置选项：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    alias: {
      vscode: resolve(import.meta.dirname, './mock/vscode.js'),
    },
  },
})
```

要将模块标记为始终已解析，从插件的 `resolveId` 钩子返回相同的字符串：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    {
      name: 'virtual-vscode',
      resolveId(id) {
        if (id === 'vscode') {
          return 'vscode'
        }
      }
    }
  ]
})
```

现在你可以在测试中像往常一样使用 `vi.mock`：

```ts
import { vi } from 'vitest'

vi.mock(import('vscode'), () => {
  return {
    window: {
      createOutputChannel: vi.fn(),
    }
  }
})
```

## 工作原理

Vitest 根据环境实现不同的模块模拟机制。它们共享的唯一功能是插件转换器。当 Vitest 看到文件内部有 `vi.mock` 时，它将把每个静态导入转换为动态导入，并将 `vi.mock` 调用移动到文件顶部。这允许 Vitest 在导入发生之前注册模拟，而不会破坏 ESM 的提升导入规则。

::: code-group
```ts [example.js]
import { answer } from './answer.js'

vi.mock(import('./answer.js'))

console.log(answer)
```
```ts [example.transformed.js]
vi.mock('./answer.js')

const __vitest_module_0__ = await __handle_mock__(
  () => import('./answer.js')
)
// 为了保持实时绑定，我们必须访问
// 模块命名空间上的导出
console.log(__vitest_module_0__.answer())
```
:::

`__handle_mock__` 包装器只是确保在启动导入之前解析模拟，它不会以任何方式修改模块。

模块模拟插件可在 [`@vitest/mocker` 包](https://github.com/vitest-dev/vitest/tree/main/packages/mocker) 中找到。

### JSDOM, happy-dom, Node

当你在模拟环境中运行测试时，Vitest 创建一个可以消费 Vite 代码的 [模块运行器](https://vite.dev/guide/api-environment-runtimes.html#modulerunner)。模块运行器的设计使得 Vitest 可以钩入模块评估并将其替换为模拟（如果已注册）。这意味着 Vitest 在类似 ESM 的环境中运行你的代码，但它不直接使用原生 ESM 机制。这允许测试运行器绕过 ES 模块不可变性的规则，允许用户在看似 ES 模块上调用 `vi.spyOn`。

如果模块运行器被 [禁用](/config/experimental#experimental-vitemodulerunner) 且 [node 加载器](/config/experimental#experimental-nodeloader) 未显式禁用，Vitest 将 [注册一个加载器钩子](https://nodejs.org/api/module.html#customization-hooks)，将原始模块转换为模拟模块。在此模式下，用户不能在 ES 模块上调用 `vi.spyOn`，因为 Vitest 使用具有所有保护机制的原生加载器机制。除此之外，Vitest 还必须向每个被模拟的模块注入一个 `mock` 查询，这在堆栈跟踪中可见。

### 浏览器模式

Vitest 在浏览器模式中使用原生 ESM。这意味着我们不能那么容易地替换模块。相反，Vitest 拦截 fetch 请求（通过 playwright 的 `page.route` 或 Vite 插件 API，如果使用 `preview` 或 `webdriverio`），如果模块被模拟，则提供转换后的代码。

例如，如果模块被自动模拟，Vitest 可以解析静态导出并创建一个占位模块：

::: code-group
```ts [answer.js]
export function answer() {
  return 42
}
```
```ts [answer.transformed.js]
function answer() {
  return 42
}

const __private_module__ = {
  [Symbol.toStringTag]: 'Module',
  answer: vi.fn(answer),
}

export const answer = __private_module__.answer
```
:::

示例为了简洁进行了简化，但概念不变。我们可以向模块中注入一个 `__private_module__` 变量来保存模拟值。如果用户使用 `spy: true` 调用 `vi.mock`，我们传递原始值；否则，我们创建一个简单的 `vi.fn()` 模拟。

如果用户定义了自定义工厂，这使得注入代码变得更难，但并非不可能。当提供被模拟的文件时，我们首先在浏览器中解析工厂，然后将键传回服务器，并使用它们创建占位模块：

```ts
const resolvedFactoryKeys = await resolveBrowserFactory(url)
const mockedModule = `
const __private_module__ = getFactoryReturnValue(${url})
${resolvedFactoryKeys.map(key => `export const ${key} = __private_module__["${key}"]`).join('\n')}
`
```

现在可以将此模块提供回浏览器。你可以在运行测试时在开发者工具中检查代码。

## 模拟模块的陷阱

请注意，无法模拟同一文件中其他方法内部调用的方法。例如，在这段代码中：

```ts [foobar.js]
export function foo() {
  return 'foo'
}

export function foobar() {
  return `${foo()}bar`
}
```

无法从外部模拟 `foo` 方法，因为它是被直接引用的。因此这段代码不会对 `foobar` 内部的 `foo` 调用产生任何影响（但它会影响其他模块中的 `foo` 调用）：

```ts [foobar.test.ts]
import { vi } from 'vitest'
import * as mod from './foobar.js'

// 这只会影响原始模块外部的 "foo"
vi.spyOn(mod, 'foo')
vi.mock(import('./foobar.js'), async (importOriginal) => {
  return {
    ...await importOriginal(),
    // 这只会影响原始模块外部的 "foo"
    foo: () => 'mocked'
  }
})
```

你可以通过直接向 `foobar` 方法提供实现来确认此行为：

```ts [foobar.test.js]
import * as mod from './foobar.js'

vi.spyOn(mod, 'foo')

// 导出的 foo 引用了模拟方法
mod.foobar(mod.foo)
```

```ts [foobar.js]
export function foo() {
  return 'foo'
}

export function foobar(injectedFoo) {
  return injectedFoo === foo // false
}
```

这是预期的行为，我们不计划提供变通方案。考虑将代码重构为多个文件，或使用诸如 [依赖注入](https://en.wikipedia.org/wiki/Dependency_injection) 之类的技术。我们相信，使应用程序可测试不是测试运行器的责任，而是应用程序架构的责任。
