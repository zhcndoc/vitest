---
title: 测试环境 | 指南
---

# 测试环境

Vitest 提供了 [`environment`](/config/environment) 选项，用于在特定环境中运行代码。你可以使用 [`environmentOptions`](/config/environmentoptions) 选项来修改环境的行为。

默认情况下，你可以使用这些环境：

- `node` 是默认环境
- `jsdom` 通过提供浏览器 API 模拟浏览器环境，使用 [`jsdom`](https://github.com/jsdom/jsdom) 包
- `happy-dom` 通过提供浏览器 API 模拟浏览器环境，被认为比 jsdom 更快，但缺少一些 API，使用 [`happy-dom`](https://github.com/capricorn86/happy-dom) 包
- `edge-runtime` 模拟 Vercel 的 [edge-runtime](https://edge-runtime.vercel.app/)，使用 [`@edge-runtime/vm`](https://npmx.dev/package/@edge-runtime/vm) 包

::: info
当使用 `jsdom` 或 `happy-dom` 环境时，Vitest 遵循与 Vite 导入 [CSS](https://vitejs.dev/guide/features.html#css) 和 [资源](https://vitejs.dev/guide/features.html#static-assets) 时相同的规则。如果导入外部依赖失败并出现 `unknown extension .css` 错误，你需要通过将所有包添加到 [`server.deps.inline`](/config/server#inline) 来手动内联整个导入链。例如，如果错误发生在此导入链中的 `package-3`：`源代码 -> package-1 -> package-2 -> package-3`，你需要将所有三个包添加到 `server.deps.inline`。

外部依赖内部的 CSS 和资源的 `require` 会自动解析。
:::

::: warning
"环境" 仅在 Node.js 中运行测试时存在。

`browser` 在 Vitest 中不被视为环境。如果你希望使用 [浏览器模式](/guide/browser/) 运行部分测试，你可以创建一个 [测试项目](/guide/browser/#projects-config)。
:::

## 特定文件的环境

当在配置中设置 `environment` 选项时，它将应用于项目中的所有测试文件。为了更细粒度的控制，你可以使用控制注释来指定特定文件的环境。控制注释是以 `@vitest-environment` 开头后跟环境名称的注释：

```ts
// @vitest-environment jsdom

import { expect, test } from 'vitest'

test('test', () => {
  expect(typeof window).not.toBe('undefined')
})
```

## 自定义环境

你可以创建自己的包来扩展 Vitest 环境。为此，创建一个名为 `vitest-environment-${name}` 的包，或指定一个有效 JS/TS 文件的路径。该包应导出一个形状为 `Environment` 的对象：

```ts
import type { Environment } from 'vitest/runtime'

export default <Environment>{
  name: 'custom',
  viteEnvironment: 'ssr',
  // 可选 - 仅当你支持 "vmForks" 或 "vmThreads" 池时
  async setupVM() {
    const vm = await import('node:vm')
    const context = vm.createContext()
    return {
      getVmContext() {
        return context
      },
      teardown() {
        // 在使用此环境的所有测试运行后调用
      }
    }
  },
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

::: warning
Vitest 要求环境对象上具有 `viteEnvironment` 选项（默认回退到 Vitest 环境名称）。它应等于 `ssr`、`client` 或任何自定义 [Vite 环境](https://vite.dev/guide/api-environment) 名称。此值确定使用哪个环境来处理文件。
:::

你还可以通过 `vitest/runtime` 入口访问默认 Vitest 环境：

```ts
import { builtinEnvironments, populateGlobal } from 'vitest/runtime'

console.log(builtinEnvironments) // { jsdom, happy-dom, node, edge-runtime }
```

Vitest 还提供 `populateGlobal` 工具函数，可用于将属性从对象移动到全局命名空间：

```ts
interface PopulateOptions {
  // 非类函数是否应绑定到全局命名空间
  bindFunctions?: boolean
}

interface PopulateResult {
  // 所有已复制键的列表，即使值在原始对象上不存在
  keys: Set<string>
  // 可能已被覆盖的键的属性描述符映射
  // 你可以在 `teardown` 中使用 `Object.defineProperty` 将其恢复
  originals: Map<string | symbol, PropertyDescriptor>
}

export function populateGlobal(global: any, original: any, options: PopulateOptions): PopulateResult
```
