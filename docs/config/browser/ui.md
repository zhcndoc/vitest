---
title: browser.ui | 配置
outline: deep
---

# browser.ui

- **类型：** `boolean`
- **默认值：** `!browser.headless && !isCI`
- **CLI：** `--browser.ui=false`

是否将浏览器 UI 注入页面。默认情况下，开发期间会注入 UI iframe。此选项与 [`browser.headless`](/config/browser/headless) 和顶层 [`--ui`](/guide/ui) 标志的关系，请参阅[无头模式与 UI](/guide/browser/#headless-mode-and-ui)。
