---
title: cache | 配置
outline: deep
---

# cache <CRoot />

- **Type:** `false`
- **CLI:** `--no-cache`, `--cache=false`

如果你想禁用缓存功能，请使用此选项。目前，Vitest 会存储测试结果的缓存，以便优先运行耗时更长和失败的测试。

缓存目录由 Vite 的 [`cacheDir`](https://vitejs.dev/config/shared-options.html#cachedir) 选项控制：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  cacheDir: 'custom-folder/.vitest'
})
```

你可以通过使用 `process.env.VITEST` 将该目录限制为仅用于 Vitest：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  cacheDir: process.env.VITEST ? 'custom-folder/.vitest' : undefined
})
```
