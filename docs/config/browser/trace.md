---
title: browser.trace | 配置
outline: deep
---

# browser.trace

- **类型：** `'on' | 'off' | 'on-first-retry' | 'on-all-retries' | 'retain-on-failure' | object`
- **CLI：** `--browser.trace=on`, `--browser.trace=retain-on-failure`
- **默认值：** `'off'`

捕获浏览器测试运行的轨迹。您可以使用 [Playwright Trace Viewer](https://trace.playwright.dev/) 预览轨迹。

有关完整工作流程，请参阅 [Playwright Traces](/guide/browser/playwright-traces)。

此选项支持以下值：

- `'on'` - 捕获所有测试的轨迹。（不推荐，因为性能开销大）
- `'off'` - 不捕获轨迹。
- `'on-first-retry'` - 仅在第一次重试测试时捕获轨迹。
- `'on-all-retries'` - 在每次重试测试时捕获轨迹。
- `'retain-on-failure'` - 仅捕获失败测试的轨迹。这将自动删除通过测试的轨迹。
- `object` - 具有以下形状的对象：

```ts
interface TraceOptions {
  mode: 'on' | 'off' | 'on-first-retry' | 'on-all-retries' | 'retain-on-failure'
  /**
   * 所有轨迹将存储的目录。默认情况下，Vitest
   * 将所有轨迹存储在与测试文件相近的 `__traces__` 文件夹中。
   */
  tracesDir?: string
  /**
   * 是否在追踪期间捕获截图。截图用于构建时间线预览。
   * @default true
   */
  screenshots?: boolean
  /**
   * 如果此选项为 true，追踪将
   * - 捕获每次操作的 DOM 快照
   * - 记录网络活动
   * @default true
   */
  snapshots?: boolean
}
```

::: danger 警告
此选项仅由 [**playwright**](/config/browser/playwright) 提供者支持。
:::
