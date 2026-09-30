---
title: Vitest UI | 指南
---

# Vitest UI

Vitest UI 是用于浏览测试结果的可视化界面。你可以在测试运行期间交互使用，也可以将其作为静态 HTML 报告来查看已完成的测试运行。

Vitest UI 是可选的，需要通过以下方式安装：

```bash
npm i -D @vitest/ui
```

<img alt="Vitest UI" img-light src="/ui-1-light.png">
<img alt="Vitest UI" img-dark src="/ui-1-dark.png">

## 实时 UI

实时 UI 会与 Vitest 开发服务器一同运行，并需要启用 [watch 模式](/config/watch)（默认已启用）。它会持续连接运行中的 Vitest 进程，因此测试重新运行时结果也会更新。你还可以直接在 UI 中重新运行选定的测试、更新失败的快照并编辑测试文件。

传入 `--ui` 标志即可启动：

```bash
vitest --ui
```

然后你可以在 <a href="http://localhost:51204/__vitest__/">`http://localhost:51204/__vitest__/`</a> 访问 Vitest UI

::: tip
Vitest UI 访问受保护。如果直接 URL 显示错误，请使用 Vitest 在终端中打印的令牌打开该 URL，例如 `http://localhost:51204/__vitest__/?token=...`。
:::

## HTML 报告器

HTML 报告器会将测试结果写入静态版 Vitest UI。报告中的结果视图仍可浏览，但报告为只读，不能重新运行测试、更新快照或编辑测试文件。它适用于 run 模式、CI 以及之后再查看结果的自动化工作流。

可以在命令行或 Vitest 配置中使用 `html` 报告器：

::: code-group

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['html'],
  },
})
```

```bash [命令行]
vitest run --reporter=html
```

:::

::: tip 保留终端输出
配置 HTML 报告器会替换默认的终端报告器。要保留终端输出，请[包含 Vitest 的默认报告器](/guide/reporters#default-configuration)。

```ts [vitest.config.ts]
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['html', ...configDefaults.reporters],
  },
})
```

:::

### 本地预览

默认情况下，报告入口会写入 `.vitest/index.html`。你可以通过 HTML 报告器的 `outputDir` 选项配置产物目录。

要预览默认输出，请使用 [vite preview](https://vitejs.dev/guide/cli.html#vite-preview) 命令：

```sh
npx vite preview --outDir .vitest
```

在浏览器中打开 Vite 输出的 URL。或者，也可以使用 [VS Code 集成浏览器](https://code.visualstudio.com/docs/debugtest/integrated-browser)直接打开 `.vitest/index.html`，无需预览服务器。

### 以单个文件分享

设置 `singleFile` 以生成自包含的 HTML 报告：

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    reporters: [
      ['html', { singleFile: true }],
    ],
  },
})
```

启用 `singleFile` 后，Vitest 会将 UI 资源、元数据和测试附件内联到单个自包含的 `index.html` 中。这样无需保留整个输出目录，就能将报告作为单个产物轻松分享、上传或下载。

由于所有内容都已内联，你可以通过 `file://` URL 在浏览器中直接打开 `<outputDir>/index.html`，不需要预览服务器。

::: warning
`singleFile` 有两个注意事项：

- 由于所有内容都会内嵌，文件可能变得很大，打开速度慢、占用内存多，或超过产物查看器及静态主机的大小限制。
- 覆盖率 HTML 报告目前不会内联，仍会作为单独文件保留。

如果测试套件包含许多或较大的附件，或需要将覆盖率报告一并打包，建议使用默认的多文件报告。
:::

### 查看 CI 报告

要从 CI（例如 GitHub Actions）查看 HTML 报告，请将输出目录上传为产物：

```yaml
- uses: actions/upload-artifact@v7
  id: upload-report
  with:
    name: vitest-report
    path: .vitest/

- name: Link HTML report
  run: echo "::notice title=Vitest HTML report::$REPORT_URL"
  env:
    REPORT_URL: https://viewer.vitest.dev/?url=${{ steps.upload-report.outputs.artifact-url }}
```

这会在工作流运行中添加报告链接通知。点击链接即可在浏览器中通过 [Vitest Viewer](https://viewer.vitest.dev/) 直接打开报告。你也可以手动下载并解压产物，然后像上面那样在本地运行 `vite preview`。

使用 `singleFile: true` 时，你可以将报告作为单个文件上传，并通过 [`archive: false` 选项](https://github.com/actions/upload-artifact#upload-an-individual-file-unzipped)直接从 GitHub 产物中查看：

```yaml
- uses: actions/upload-artifact@v7
  id: upload-report
  with:
    path: .vitest/index.html
    archive: false

- name: Link HTML report
  run: echo "::notice title=Vitest HTML report::$REPORT_URL"
  env:
    REPORT_URL: ${{ steps.upload-report.outputs.artifact-url }}
```

## 覆盖率

Vitest UI 会在实时 UI 和 HTML 报告中显示覆盖率结果。配置和用法请参阅 [Vitest UI 覆盖率](/guide/coverage#vitest-ui)。

## Trace 查看器

启用 [`browser.traceView`](/guide/browser/trace-view) 后，Vitest UI 可以回放记录的浏览器交互。实时 UI 会在测试运行时持续显示 trace 条目，而 HTML 报告会保留记录，以便之后查看。

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

此视图分为两部分。顶部显示完整的模块 ID 以及有关模块的一些诊断信息。如果启用了 [`fsModuleCache`](/config/fsmodulecache)，则会显示 "已缓存" 或 "未缓存" 徽章。在右侧，你可以看到时间诊断信息：

- 自身时间 (Self Time)：导入模块所花费的时间，不包括静态导入。
- 总时间 (Total Time)：导入模块所花费的时间，包括静态导入。请注意，这不包括当前模块的 `transform` 时间。
- 转换 (Transform)：转换模块所花费的时间。

如果你通过点击导入打开此视图，你还会在开头看到一个 "返回" 按钮，它将带你回到上一个模块。

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

如果至少有一个文件加载时间超过 [`danger` 阈值](/config/experimental#experimental-importdurations-thresholds)（默认：500ms），"显示导入分解" 图标将显示红色；如果至少有一个文件加载时间超过 [`warn` 阈值](/config/experimental#experimental-importdurations-thresholds)（默认：100ms），它将显示橙色。

你可以使用 [`experimental.importDurations.limit`](/config/experimental#experimental-importdurationslimit) 来控制显示的导入数量。
