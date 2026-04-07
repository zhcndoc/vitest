---
title: browser.orchestratorScripts | 配置
outline: deep
---

# browser.orchestratorScripts

- **类型:** `BrowserScript[]`
- **默认值:** `[]`

在测试 iframe 启动之前，应该注入到 orchestrator HTML 中的自定义脚本。此 HTML 文档仅设置 iframe，实际上并不导入您的代码。

脚本的 `src` 和 `content` 将由 Vite 插件处理。脚本应按以下结构提供：

```ts
export interface BrowserScript {
  /**
   * 如果提供了 "content" 且 type 为 "module"，这将是其标识符。
   *
   * 如果您使用的是 TypeScript，例如可以在此处添加 `.ts` 扩展名。
   * @default `injected-${index}.js`
   */
  id?: string
  /**
   * 要注入的 JavaScript 内容。如果 type 为 "module"，此字符串将由 Vite 插件处理。
   *
   * 您可以使用 `id` 给 Vite 一个关于文件扩展名的提示。
   */
  content?: string
  /**
   * 脚本的路径。此值由 Vite 解析，因此它可以是 node 模块或文件路径。
   */
  src?: string
  /**
   * 脚本是否应异步加载。
   */
  async?: boolean
  /**
   * 脚本类型。
   * @default 'module'
   */
  type?: string
}
```
