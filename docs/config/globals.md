---
title: globals | 配置
---

# globals

- **类型：** `boolean`
- **默认值：** `false`
- **CLI：** `--globals`, `--no-globals`, `--globals=false`

默认情况下，为了明确性，`vitest` 不提供全局 API。如果你像 Jest 一样更喜欢全局使用这些 API，你可以向 CLI 传递 `--globals` 选项，或在配置中添加 `globals: true`。

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

::: tip
注意，某些库（例如 `@testing-library/react`）依赖全局变量存在来执行自动清理。
:::

要让 TypeScript 与全局 API 配合工作，请将 `vitest/globals` 添加到 `tsconfig.json` 的 `types` 字段中：

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

如果你重新定义了 [`typeRoots`](https://www.typescriptlang.org/tsconfig/#typeRoots) 以便在编译中包含额外的类型，你需要将 `node_modules` 添加回去，以使 `vitest/globals` 可被识别：

```json [tsconfig.json]
{
  "compilerOptions": {
    "typeRoots": ["./types", "./node_modules/@types", "./node_modules"],
    "types": ["vitest/globals"]
  }
}
```
