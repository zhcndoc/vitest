---
title: forceRerunTriggers | 配置
outline: deep
---

# forceRerunTriggers <CRoot />

- **Type:** `string[]`
- **Default:** `['**/package.json', '**/vitest.config.*', '**/vite.config.*']`

触发整个套件重新运行的文件路径的 Glob 模式。当与 `--changed` 参数配对使用时，如果在 git diff 中发现触发器，将运行整个测试套件。

如果你正在测试调用 CLI 命令，这会很有用，因为 Vite 无法构建模块图：

```ts
test('执行一个脚本', async () => {
  // 如果 `dist/index.js` 的内容发生变化，Vitest 无法重新运行此测试
  await execa('node', ['dist/index.js'])
})
```

::: tip
确保你的文件没有被 [`server.watch.ignored`](https://vitejs.dev/config/server-options.html#server-watch) 排除。
:::
