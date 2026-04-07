---
title: update | 配置
outline: deep
---

# update <CRoot /> {#update}

- **类型:** `boolean | 'new' | 'all' | 'none'`
- **默认值:** `false`
- **命令行:** `-u`, `--update`, `--update=false`, `--update=new`, `--update=none`

定义快照更新行为。

- `true` 或 `'all'`：更新所有已更改的快照并删除过时的快照
- `new`：生成新快照，而不更改或删除过时的快照
- `none`：不写入快照，并在快照不匹配、快照缺失和快照过时时失败

当 `update` 为 `false`（默认值）时，Vitest 会根据环境解析快照更新模式：

- 本地运行（非 CI）：工作方式与 `new` 相同
- CI 运行（`process.env.CI` 为真值）：工作方式与 `none` 相同
