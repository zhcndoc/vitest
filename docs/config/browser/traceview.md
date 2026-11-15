---
title: browser.traceView | 配置
outline: deep
---

# browser.traceView <Version>5.0.0</Version>

- **类型：** `boolean | 'off' | 'on' | 'failure-only' | { mode?: 'off' | 'on' | 'failure-only'; recordCanvas?: boolean; inlineImages?: boolean; ariaSnapshot?: boolean }`
- **CLI：** `--browser.traceView`
- **默认值：** `'failure-only'`

为浏览器测试记录操作、断言和标记，并捕获 DOM 快照，以便在 [trace 查看器](/guide/browser/trace-view)中回放。

你可以将其设为[录制模式](#traceview-mode)，例如 `'failure-only'`；也可以使用 `true` 和 `false`，分别作为 `'on'` 和 `'off'` 的简写：

```ts
export default defineConfig({
  test: {
    browser: {
      traceView: true,
    },
  },
})
```

要将录制模式与以下选项组合使用，请传入对象：

```ts
export default defineConfig({
  test: {
    browser: {
      traceView: {
        mode: 'on',
        inlineImages: true,
      },
    },
  },
})
```

## browser.traceView.mode <Version>5.1.0</Version> {#traceview-mode}

- **类型：** `'off' | 'on' | 'failure-only'`
- **默认值：** `'failure-only'`
- **CLI：** `--browser.traceView.mode <mode>`

设置 Trace View 要记录哪些测试，以及每个 trace 保留哪些内容：

- `'failure-only'` 只记录失败的测试。每个 trace 都会保留所有步骤，以及测试失败时的页面快照。
- `'on'` 会记录每个测试，并为每个步骤保存快照；测试运行期间，Vitest UI 也会实时显示步骤。
- `'off'` 不记录任何内容。

## browser.traceView.inlineImages {#traceview-inlineimages}

- **类型：** `boolean`
- **默认值：** `false`
- **CLI：** `--browser.traceView.inlineImages`

将已加载 `<img>` 元素的像素内联到快照中，使 HTML 报告无需加载原始 URL 也能渲染这些图片。详情请参阅[快照包含的内容](/guide/browser/trace-view#what-snapshots-capture)。

## browser.traceView.recordCanvas {#traceview-recordcanvas}

- **类型：** `boolean`
- **默认值：** `false`
- **CLI：** `--browser.traceView.recordCanvas`

在快照中捕获 canvas 像素。对于这些 trace，trace 查看器会允许在回放 iframe 中执行脚本。请参阅[快照包含的内容](/guide/browser/trace-view#what-snapshots-capture)中的 canvas 回放沙箱警告。

## browser.traceView.ariaSnapshot <Version>5.1.0</Version> {#traceview-ariasnapshot}

- **类型：** `boolean`
- **默认值：** `true`
- **CLI：** `--browser.traceView.ariaSnapshot`

随每个快照捕获页面的无障碍树，以便在 trace 查看器的快照窗格中切换 **DOM** 和 **Aria** 视图。Aria 视图使用与 [aria 快照](/guide/browser/aria-snapshots)相同的格式。

## browser.traceView.enabled <Deprecated /> {#traceview-enabled}

- **类型：** `boolean`
- **CLI：** `--browser.traceView.enabled`

请改用 [`mode`](#traceview-mode)。`true` 等同于 `mode: 'on'`，`false` 等同于 `mode: 'off'`。同时设置两者时，以 `mode` 为准。
