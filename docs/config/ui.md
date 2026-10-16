---
title: ui | 配置
outline: deep
---

# ui <CRoot />

- **类型:** `boolean | object`
- **默认值:** `false`
- **CLI:** `--ui`, `--ui=false`

启用 [Vitest UI](/guide/ui)。设置 `ui: true` 等同于 `ui: { enabled: true }`。

::: warning
此功能需要安装 [`@vitest/ui`](https://npmx.dev/package/@vitest/ui) 包。如果您尚未安装，Vitest 将在您首次运行测试命令时为您安装。
:::

::: danger 安全建议
确保您的 UI 服务器未暴露给网络。自 Vitest 4.1 起，出于安全原因，将 [`api.host`](/config/api) 设置为 `localhost` 以外的任何值都将禁用保存代码或运行任何测试的按钮，实际上使 UI 成为只读报告器。
:::

## ui.enabled <Version type="experimental">5.0.4</Version> {#ui-enabled}

- **类型:** `boolean`
- **默认值:** `false`

启用 [Vitest UI](/guide/ui)。

## ui.theme <Version type="experimental">5.0.4</Version> {#ui-theme}

- **类型:** `'auto' | 'light' | 'dark'`
- **默认值:** `'auto'`

Vitest UI 和[浏览器模式 UI](/config/browser/ui)的颜色主题。设为 `'auto'` 时，UI 会跟随系统偏好，并记住你在 UI 中切换的主题。设为 `'light'` 或 `'dark'` 时，每次加载页面都会以该主题打开；切换主题只在页面重新加载前有效。

此选项不会启用 Vitest UI，因此可以与 [`browser.ui`](/config/browser/ui) 一起设置：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    ui: {
      theme: 'dark',
    },
    browser: {
      enabled: true,
      instances: [
        { browser: 'chromium' },
      ],
    }
  },
})
```
