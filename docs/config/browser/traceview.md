---
title: browser.traceView | 配置
outline: deep
---

# browser.traceView <Badge type="warning" text="实验性" /> <Version>5.0.0</Version>

- **类型：** `boolean | { enabled?: boolean; recordCanvas?: boolean; inlineImages?: boolean }`
- **CLI：** `--browser.traceView`
- **默认：** `false`

为浏览器测试启用 trace-view 采集。Vitest 会捕获浏览器交互的 DOM 快照，并可在启用这些界面时在浏览器 UI、Vitest UI 或 HTML 报告器中显示它们——无需外部工具。

```ts
export default defineConfig({
  test: {
    browser: {
      traceView: true,
    },
  },
})
```

使用对象形式以启用额外的快照保真度选项：

```ts
export default defineConfig({
  test: {
    browser: {
      traceView: {
        enabled: true,
        inlineImages: true,
        recordCanvas: true,
      },
    },
  },
})
```

| 选项 | 默认值 | 描述 |
| --- | --- | --- |
| `enabled` | `false` | 启用 Vitest trace-view 产物采集。 |
| `inlineImages` | `false` | 将加载的 `<img>` 像素内联到快照中，以实现更便携的回放，这在 HTML 报告器中很有用。 |
| `recordCanvas` | `false` | 在快照中捕获 canvas 像素。 |

## browser.traceView.enabled {#traceview-enabled}

- **类型：** `boolean`
- **默认：** `false`
- **CLI：** `--browser.traceView.enabled`

启用 Vitest trace-view 产物采集。

## browser.traceView.inlineImages {#traceview-inlineimages}

- **类型：** `boolean`
- **默认：** `false`
- **CLI：** `--browser.traceView.inlineImages`

将加载的 `<img>` 像素内联到快照中，以实现更便携的回放，这在 HTML 报告器中很有用。

## browser.traceView.recordCanvas {#traceview-recordcanvas}

- **类型：** `boolean`
- **默认：** `false`
- **CLI：** `--browser.traceView.recordCanvas`

在快照中捕获 canvas 像素。这会启用一个更弱的回放 iframe 沙箱，因为 rrweb 需要脚本来重绘 canvas 数据。

请参阅 [Trace View](/guide/browser/trace-view) 了解完整文档。
