---
title: Vitest UI | 指南
---

# Vitest UI

由 Vite 驱动，Vitest 在运行测试时底层也有一个开发服务器。这使得 Vitest 能够提供一个漂亮的 UI 来查看和交互你的测试。Vitest UI 是可选的，所以你需要通过以下方式安装它：

```bash
npm i -D @vitest/ui
```

然后你可以通过传递 `--ui` 标志来启动带 UI 的测试：

```bash
vitest --ui
```

然后你可以在 <a href="http://localhost:51204/__vitest__/">`http://localhost:51204/__vitest__/`</a> 访问 Vitest UI

::: warning
UI 是交互式的，需要运行中的 Vite 服务器，所以确保以 `watch` 模式运行 Vitest（默认模式）。或者，你可以通过在配置的 `reporters` 选项中指定 `html` 来生成一个看起来与 Vitest UI 完全相同的静态 HTML 报告。
:::

<img alt="Vitest UI 界面" img-light src="/ui-1-light.png">
<img alt="Vitest UI 界面" img-dark src="/ui-1-dark.png">

UI 也可以用作报告器。在 Vitest 配置中使用 `'html'` 报告器来生成 HTML 输出并预览测试结果：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['html'],
  },
})
```

你可以在 Vitest UI 中查看覆盖率报告：详见 [Vitest UI 覆盖率](/guide/coverage#vitest-ui)。

::: warning
如果你仍然希望在终端中实时查看测试运行情况，请将 `configDefaults.reporters` 添加到 `reporters` 选项中：`['html', ...configDefaults.reporters]`。
:::

::: tip
要预览 HTML 报告，你可以使用 [vite preview](https://vitejs.dev/guide/cli.html#vite-preview) 命令：

```sh
npx vite preview --outDir ./html
```

你可以使用 [`outputFile`](/config/outputfile) 配置选项来配置输出。你需要在那里指定 `.html` 路径。例如，`./html/index.html` 是默认值。
:::

::: tip
要从 CI（例如 GitHub Actions）查看 HTML 报告，请将输出目录作为工件上传：

```yaml
- uses: actions/upload-artifact@v4
  id: upload-report
  with:
    name: vitest-report
    path: html/

- name: Viewer link in summary
  run: echo "[查看 HTML 报告](https://viewer.vitest.dev/?url=${{ steps.upload-report.outputs.artifact-url }})" >> $GITHUB_STEP_SUMMARY
```

这会在作业摘要中添加一个链接。点击它直接在浏览器中的 [Vitest Viewer](https://viewer.vitest.dev/) 打开报告。你也可以手动下载工件并解压，然后像上面那样在本地运行 `vite preview`。
:::

## 模块图

模块图标签页显示所选测试文件的模块图。

::: info
所有提供的图片均使用 [Zammad](https://github.com/zammad/zammad) 仓库作为示例。
:::

<img alt="模块图视图" img-light src="/ui/light-module-graph.png">
<img alt="模块图视图" img-dark src="/ui/dark-module-graph.png">

如果模块超过 50 个，模块图仅显示图的前两级以减少视觉混乱。你可以随时点击 "显示完整图" 图标来预览完整图。

<center>
  <img alt="位于图例附近的 '显示完整图' 按钮" img-light src="/ui/light-ui-show-graph.png">
  <img alt="位于图例附近的 '显示完整图' 按钮" img-dark src="/ui/dark-ui-show-graph.png">
</center>

::: warning
请注意，如果你的图太大，节点位置稳定下来可能需要一些时间。
:::

你可以随时通过点击 "重置" 恢复入口模块图。要展开模块图，右键单击或按住 <kbd>Shift</kbd> 同时点击你感兴趣的节点。它将显示与所选节点相关的所有节点。

默认情况下，Vitest 不显示来自 `node_modules` 的模块。通常，这些模块是被外部化的。你可以通过取消选中 "隐藏 node_modules" 来启用它们。

### 模块信息

通过左键点击模块节点，你可以打开模块信息视图。

<img alt="内联模块的模块信息视图" img-light src="/ui/light-module-info.png">
<img alt="内联模块的模块信息视图" img-dark src="/ui/dark-module-info.png">

此视图分为两部分。顶部显示完整的模块 ID 和一些关于模块的诊断信息。如果启用了 [`experimental.fsModuleCache`](/config/experimental#experimental-fsmodulecache)，将会有 "cached" 或 "not cached" 徽章。在右侧你可以看到时间诊断：

- 自身时间 (Self Time)：导入模块所花费的时间，不包括静态导入。
- 总时间 (Total Time)：导入模块所花费的时间，包括静态导入。请注意，这不包括当前模块的 `transform` 时间。
- 转换 (Transform)：转换模块所花费的时间。

如果你通过点击导入打开此视图，你还会在开头看到一个 "Back" 按钮，它将带你回到上一个模块。

底部部分取决于模块类型。如果模块是外部的，你只会看到该文件的源代码。你将无法进一步遍历模块图，也不会看到导入静态导入花费了多长时间。

<img alt="外部模块的模块信息视图" img-light src="/ui/light-module-info-external.png">
<img alt="外部模块的模块信息视图" img-dark src="/ui/dark-module-info-external.png">

如果模块是内联的，你将看到另外三个窗口：

- 源代码 (Source)：模块未更改的源代码
- 转换后 (Transformed)：Vitest 使用 Vite 的 [module runner](https://vite.dev/guide/api-environment-runtimes#modulerunner) 执行的转换后的代码
- 源代码映射 (Source Map (v3))：源代码映射

"Source" 窗口中的所有静态导入显示当前模块评估它们所花费的总时间。如果导入已经在模块图中被评估过，它将显示 `0ms`，因为那时它已被缓存。

如果模块加载时间超过 [`danger` 阈值](/config/experimental#experimental-importdurations-thresholds)（默认：500ms），时间将显示为红色。如果模块加载时间超过 [`warn` 阈值](/config/experimental#experimental-importdurations-thresholds)（默认：100ms），时间将显示为橙色。

你可以点击导入源跳转到该模块并进一步遍历图（注意下方的 `./support/assertions/index.ts`）。

<img alt="内部模块的模块信息视图" img-light src="/ui/light-module-info-traverse.png">
<img alt="内部模块的模块信息视图" img-dark src="/ui/dark-module-info-traverse.png">

::: warning
请注意，仅类型导入不在运行时执行，也不显示总持续时间。它们也无法被打开。
:::

如果另一个插件在转换期间注入模块导入，这些导入将以灰色显示在模块开头（例如，由 `import.meta.glob` 注入的模块）。它们也显示总时间并且可以进一步遍历。

<img alt="内部模块的模块信息视图" img-light src="/ui/light-module-info-shadow.png">
<img alt="内部模块的模块信息视图" img-dark src="/ui/dark-module-info-shadow.png">

::: tip
如果你正在 Vitest 之上开发自定义集成，你可以使用 [`vitest.experimental_getSourceModuleDiagnostic`](/api/advanced/vitest#getsourcemodulediagnostic) 来检索此信息。
:::

### 导入分解

::: tip 反馈
请在 [GitHub Discussion](https://github.com/vitest-dev/vitest/discussions/9224) 中留下关于此功能的反馈。
:::

模块图标签页还提供导入分解，列出加载时间最长的模块列表（默认前 10 个），按总时间排序。

<img alt="导入分解，列出加载时间最长的前 10 个模块列表" img-light src="/ui/light-import-breakdown.png">
<img alt="导入分解，列出加载时间最长的前 10 个模块列表" img-dark src="/ui/dark-import-breakdown.png">

你可以点击模块查看模块信息。如果模块是外部的，它将显示黄色（与模块图中的颜色相同）。

分解显示模块列表，包含自身时间、总时间以及相对于加载整个测试文件所花费时间的百分比。

如果至少有一个文件加载时间超过 [`danger` 阈值](/config/experimental#experimental-importdurations-thresholds)（默认：500ms），"Show Import Breakdown" 图标将显示红色；如果至少有一个文件加载时间超过 [`warn` 阈值](/config/experimental#experimental-importdurations-thresholds)（默认：100ms），它将显示橙色。

你可以使用 [`experimental.importDurations.limit`](/config/experimental#experimental-importdurationslimit) 来控制显示的导入数量。
