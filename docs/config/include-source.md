---
title: includeSource | 配置
---

# includeSource

- **类型：** `string[]`
- **默认值：** `[]`

一个匹配你的 [源内测试文件](/guide/in-source) 的 [glob 模式](https://superchupu.dev/tinyglobby/comparison) 列表。这些模式是相对于 [`root`](/config/root) 解析的（默认为 [`process.cwd()`](https://nodejs.org/api/process.html#processcwd)）。

定义后，Vitest 将运行所有内部包含 `import.meta.vitest` 的匹配文件。

::: warning
Vitest 对源文件执行简单的基于文本的包含检查。如果文件包含 `import.meta.vitest`，即使在注释中，它也会被匹配为源内测试文件。
:::

Vitest 使用 [`tinyglobby`](https://npmx.dev/package/tinyglobby) 包来解析 glob 模式。

## 示例

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
  },
})
```

然后你可以在源文件内部编写测试：

```ts [src/index.ts]
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}

// #region 源内测试套件
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
// #endregion
```

对于生产构建，你需要将 `import.meta.vitest` 替换为 `undefined`，让打包器执行死代码消除。

::: code-group
```js [vite.config.ts]
import { defineConfig } from 'vite'

export default defineConfig({
  define: { // [!code ++]
    'import.meta.vitest': 'undefined', // [!code ++]
  }, // [!code ++]
})
```
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
```js [build.config.js]
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  replace: { // [!code ++]
    'import.meta.vitest': 'undefined', // [!code ++]
  }, // [!code ++]
  // 其他选项
})
```
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
:::

::: tip
要获得 `import.meta.vitest` 的 TypeScript 支持，请将 `vitest/importMeta` 添加到你的 `tsconfig.json` 中：

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vitest/importMeta"]
  }
}
```
:::
