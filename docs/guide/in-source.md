---
title: 源内测试 | 指南
---

# 源内测试

Vitest 提供了一种在源代码中伴随实现运行测试的方法，类似于 [Rust 的模块测试](https://doc.rust-lang.org/book/ch11-03-test-organization.html#the-tests-module-and-cfgtest)。

这使得测试与实现共享相同的闭包，能够无需导出即可测试私有状态。同时，它也为开发带来了更紧密的反馈循环。

::: warning
本指南解释如何在源代码内部编写测试。如果你需要在单独的测试文件中编写测试，请遵循 ["编写测试" 指南](/guide/#writing-tests)。
:::

## 设置

要开始使用，请在源文件末尾放置一个 `if (import.meta.vitest)` 块，并在其中编写一些测试。例如：

```ts [src/index.ts]
// 实现
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}

// 源内测试套件
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
```

更新 Vitest 的 `includeSource` 配置以获取 `src/` 下的文件：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'], // [!code ++]
  },
})
```

然后你就可以开始测试了！

```bash
$ npx vitest
```

## 生产构建

对于生产构建，你需要在配置文件中设置 `define` 选项，让打包器进行死代码消除。例如，在 Vite 中

```ts [vite.config.ts]
/// <reference types="vitest/config" />

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
  },
  define: { // [!code ++]
    'import.meta.vitest': 'undefined', // [!code ++]
  }, // [!code ++]
})
```

### 其他打包器

::: details Rolldown
```js [rolldown.config.js]
import { defineConfig } from 'rolldown/config'

export default defineConfig({
  transform: {
    define: { // [!code ++]
      'import.meta.vitest': 'undefined', // [!code ++]
    }, // [!code ++]
  },
})
```

了解更多：[Rolldown](https://rolldown.rs/)
:::

::: details Rollup
```js [rollup.config.js]
import replace from '@rollup/plugin-replace' // [!code ++]

export default {
  plugins: [
    replace({ // [!code ++]
      'import.meta.vitest': 'undefined', // [!code ++]
    }) // [!code ++]
  ],
  // 其他选项
}
```

了解更多：[Rollup](https://rollupjs.org/)
:::

::: details unbuild
```js [build.config.js]
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  replace: { // [!code ++]
    'import.meta.vitest': 'undefined', // [!code ++]
  }, // [!code ++]
  // 其他选项
})
```

了解更多：[unbuild](https://github.com/unjs/unbuild)
:::

::: details webpack
```js [webpack.config.js]
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({ // [!code ++]
      'import.meta.vitest': 'undefined', // [!code ++]
    })// [!code ++]
  ],
}
```

了解更多：[webpack](https://webpack.js.org/plugins/define-plugin/)
:::

## TypeScript

要获得 `import.meta.vitest` 的 TypeScript 支持，请将 `vitest/importMeta` 添加到你的 `tsconfig.json` 中：

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": [
      "vitest/importMeta" // [!code ++]
    ]
  }
}
```

参考 [`examples/in-source-test`](https://github.com/vitest-dev/vitest/tree/main/examples/in-source-test) 获取完整示例。

::: warning
使用 [断言函数](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)（如 `assert`）进行源内测试时存在一个限制。详情和解决方法请参见 [`assert`](/api/assert#in-source-testing)。
:::

## 说明

此功能可能适用于：

- 小范围函数或工具函数的单元测试
- 原型设计
- 内联断言

对于更复杂的测试（如组件或 E2E 测试），建议**改用单独的测试文件**。
