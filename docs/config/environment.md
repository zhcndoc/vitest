---
title: environment | 配置
---

# 环境

- **类型:** `'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string`
- **默认值:** `'node'`
- **CLI:** `--environment=<env>`

用于测试的环境。Vitest 中的默认环境是 Node.js 环境。如果你正在构建 Web 应用，你可以使用 [`jsdom`](https://github.com/jsdom/jsdom) 或 [`happy-dom`](https://github.com/capricorn86/happy-dom) 来代替浏览器类似的环境。
如果你正在构建 edge 函数，你可以使用 [`edge-runtime`](https://edge-runtime.vercel.app/packages/vm) 环境。

::: tip
你也可以使用 [浏览器模式](/guide/browser/) 在浏览器中运行集成或单元测试，而无需模拟环境。
:::

要为你的环境定义自定义选项，请使用 [`environmentOptions`](/config/environmentoptions)。

通过在文件顶部添加 `@vitest-environment` 文档块或注释，你可以指定该文件中所有测试使用的另一个环境：

文档块风格：

```js
/**
 * @vitest-environment jsdom
 */

test('use jsdom in this test file', () => {
  const element = document.createElement('div')
  expect(element).not.toBeNull()
})
```

注释风格：

```js
// @vitest-environment happy-dom

test('use happy-dom in this test file', () => {
  const element = document.createElement('div')
  expect(element).not.toBeNull()
})
```

为了兼容 Jest，还有一个 `@jest-environment`：

```js
/**
 * @jest-environment jsdom
 */

test('use jsdom in this test file', () => {
  const element = document.createElement('div')
  expect(element).not.toBeNull()
})
```

你也可以定义自定义环境。当使用非内置环境时，如果名称是相对或绝对路径，Vitest 将尝试加载该文件；如果是裸说明符，则加载 `vitest-environment-${name}` 包。

自定义环境文件应该导出一个符合 `Environment` 结构的对象：

```ts [environment.js]
import type { Environment } from 'vitest'

export default <Environment>{
  name: 'custom',
  viteEnvironment: 'ssr',
  setup() {
    // 自定义设置
    return {
      teardown() {
        // 在使用此环境的所有测试运行后调用
      }
    }
  }
}
```

::: tip
`viteEnvironment` 字段对应于 [Vite 环境 API](https://vite.dev/guide/api-environment#environment-api) 定义的环境。默认情况下，Vite 暴露 `client`（用于浏览器）和 `ssr`（用于服务器）环境。
:::

Vitest 还通过 `vitest/environments` 入口暴露 `builtinEnvironments`，以防你只是想扩展它。你可以在 [我们的指南](/guide/environment) 中阅读更多关于扩展环境的内容。

::: tip
jsdom 环境暴露了等于当前 [JSDOM](https://github.com/jsdom/jsdom) 实例的 `jsdom` 全局变量。如果你想让 TypeScript 识别它，当你使用此环境时，可以将 `vitest/jsdom` 添加到你的 `tsconfig.json` 中：

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vitest/jsdom"]
  }
}
```
:::
