---
title: fsModuleCachePath | 配置
outline: deep
---

# fsModuleCachePath <Version>5.0.0</Version>

- **类型：** `string`
- **默认值：** `'node_modules/.vitest-cache'`（从工作区根目录解析）
- **CLI：** `--fsModuleCachePath=<path>`

[`fsModuleCache`](/config/fsmodulecache) 的存储目录。

此选项可以按项目设置；未覆盖该设置的项目将回退到根目录的缓存目录。用于使缓存失效的锁文件元数据始终在整个工作区范围内共享。

默认情况下，Vitest 会将缓存存储在工作区根目录的 `node_modules` 中。根目录基于包管理器的锁文件确定（例如 `.package-lock.json`、`.yarn-state.yml`、`.pnpm/lock.yaml` 等）。将缓存保存在 `node_modules` 中意味着每当重新安装依赖项时，缓存都会自然失效。

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fsModuleCache: true,
    fsModuleCachePath: 'node_modules/.vitest-cache',
  },
})
```
