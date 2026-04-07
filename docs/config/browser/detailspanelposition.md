---
title: browser.detailsPanelPosition | 配置
outline: deep
---

# browser.detailsPanelPosition

- **类型:** `'right' | 'bottom'`
- **默认值:** `'right'`
- **命令行:** `--browser.detailsPanelPosition=bottom`, `--browser.detailsPanelPosition=right`

控制在运行浏览器测试时，Vitest UI 中详情面板的默认位置。

- `'right'` - 在右侧显示详情面板，浏览器视口与详情面板之间为水平分割。
- `'bottom'` - 在底部显示详情面板，浏览器视口与详情面板之间为垂直分割。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      detailsPanelPosition: 'bottom', // 或 'right'
    },
  },
})
```

## 示例

::: tabs
== 底部
<center>
  <img alt="Vitest UI 详情位于底部" img-light src="/ui/light-ui-details-bottom.png">
  <img alt="Vitest UI 详情位于底部" img-dark src="/ui/dark-ui-details-bottom.png">
</center>
== 右侧
<center>
  <img alt="Vitest UI 详情位于右侧" img-light src="/ui/light-ui-details-right.png">
  <img alt="Vitest UI 详情位于右侧" img-dark src="/ui/dark-ui-details-right.png">
</center>
:::
