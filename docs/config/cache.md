---
title: cache | 配置
outline: deep
---

# cache <CRoot />

- **Type:** `boolean`
- **Default:** `true`
- **CLI:** `--cache`, `--no-cache`

在文件系统中存储测试运行的结果。Vitest 使用这些结果优先运行失败和耗时较长的测试文件。

对于每个测试文件，Vitest 会存储该文件是否失败、运行时长以及上次运行的时间。如果某次运行没有执行完整个文件（例如使用 [`--testNamePattern`](/config/testnamepattern) 过滤或被 [`bail`](/config/bail) 取消），则可以将该文件标记为失败，但不能将其标记为通过。

你可以运行 [`vitest --clearCache`](/guide/cli#clearcache) 删除缓存。

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

::: warning
已弃用的 `cache.dir` 选项不再生效。使用 `cacheDir` 更改缓存目录。
:::
