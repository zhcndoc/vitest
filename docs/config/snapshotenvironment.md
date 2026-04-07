---
title: snapshotEnvironment | 配置
outline: deep
---

# snapshotEnvironment

- **类型：** `string`

自定义快照环境实现的路径。如果在无法支持 Node.js API 的环境中运行测试，此选项非常有用。此选项对浏览器运行器没有任何影响。

此对象应具有 `SnapshotEnvironment` 的结构，用于解析和读写快照文件：

```ts
export interface SnapshotEnvironment {
  getVersion: () => string
  getHeader: () => string
  resolvePath: (filepath: string) => Promise<string>
  resolveRawPath: (testPath: string, rawPath: string) => Promise<string>
  saveSnapshotFile: (filepath: string, snapshot: string) => Promise<void>
  readSnapshotFile: (filepath: string) => Promise<string | null>
  removeSnapshotFile: (filepath: string) => Promise<void>
}
```

如果只需要覆盖 API 的一部分，可以从 `vitest/snapshot` 入口点扩展默认的 `VitestSnapshotEnvironment`。

::: warning
这是一个底层选项，仅应在无法访问默认 Node.js API 的高级情况下使用。

如果只需要配置快照功能，请使用 [`snapshotFormat`](/config/snapshotformat) 或 [`resolveSnapshotPath`](/config/resolvesnapshotpath) 选项。
:::
