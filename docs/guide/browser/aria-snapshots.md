---
title: ARIA 快照 | 指南
outline: deep
---

# ARIA 快照 <Experimental /> <Version>4.1.4</Version> {#aria-snapshots}

ARIA 快照允许你测试页面的可访问性结构。你不需要断言原始 HTML 或视觉输出，而是断言**可访问性树**——即屏幕阅读器和其他辅助技术所使用的同一结构。

给定以下 HTML：

```html
<nav aria-label="主导航">
  <a href="/">首页</a>
  <a href="/about">关于</a>
</nav>
```

你可以断言其可访问性树：

```ts
await expect.element(page.getByRole('navigation')).toMatchAriaInlineSnapshot(`
  - navigation "主导航":
    - link "首页":
      - /url: /
    - link "关于":
      - /url: /about
`)
```

这可以捕获可访问性回归问题：缺少标签、错误的角色、不正确的标题层级等——这些都是 DOM 快照无法检测到的。即使底层 HTML 结构发生变化，只要语义内容匹配，断言也不会失败。

对于高级场景，你还可以通过 `vitest/browser` 中的 `utils.aria` 生成并检查 ARIA 树。详情请参阅 [Context API](/api/browser/context#aria)。

## 快照工作流

ARIA 快照使用与其它快照断言相同的 Vitest 快照流程。文件快照、内联快照、`--update` / `-u`、监视模式更新以及 CI 快照行为都一致工作。

请参阅主要的[快照指南](/guide/snapshot)了解通用快照流程、更新行为和审核规范。

## 基本用法

给定一个包含以下 HTML 的页面：

```html
<form aria-label="登录">
  <input aria-label="邮箱" />
  <input aria-label="密码" type="password" />
  <button>提交</button>
</form>
```

### 文件快照

使用 `toMatchAriaSnapshot()` 将快照存储在测试旁边的 `.snap` 文件中：

```ts [basic.test.ts]
import { expect, test } from 'vitest'

test('登录表单', async () => {
  await expect.element(page.getByRole('form')).toMatchAriaSnapshot()
})
```

首次运行时，Vitest 会生成一个快照文件条目：

```js [__snapshots__/basic.test.ts.snap]
// Vitest 快照 ...

exports[`登录表单 1`] = `
- form "登录":
  - textbox "邮箱"
  - textbox "密码"
  - button "提交"
`
```

### 内联快照

使用 `toMatchAriaInlineSnapshot()` 将快照直接存储在测试文件中：

```ts
import { expect, test } from 'vitest'

test('登录表单', async () => {
  await expect.element(page.getByRole('form')).toMatchAriaInlineSnapshot(`
    - form "登录":
      - textbox "邮箱"
      - textbox "密码"
      - button "提交"
  `)
})
```

## 浏览器模式下的重试行为

在[浏览器模式](/guide/browser/)中，`expect.element()` 会轮询 DOM 并等待可访问性树**稳定**后再评估结果。每次轮询时，匹配器会重新查询元素并重新捕获可访问性树。当连续两次轮询产生相同输出时，快照被认为已稳定。

```ts
await expect.element(page.getByRole('form')).toMatchAriaInlineSnapshot(`
  - form "登录":
    - textbox "邮箱"
    - textbox "密码"
    - button "提交"
`)
```

在首次运行或使用 `--update` 时，稳定的结果会被写入为新快照。

当存在现有快照时，匹配器也会检查稳定结果是否匹配。如果不匹配，轮询会重置并继续——这为 DOM 达到预期状态提供了时间。这处理了动画、异步渲染或延迟状态更新等情况，在这些情况下，树可能会在中间状态短暂稳定，然后再收束到最终形式。

## 保留手动编辑的模式

当你手动编辑快照以使用正则表达式模式时，这些模式会在 `--update` 时保留。只有发生变化的字面部分会被覆盖。这让你可以编写灵活的断言，而不会在内容变化时断裂。

### 示例

**步骤 1。** 你的购物车页面渲染以下 HTML：

```html
<h1>你的购物车</h1>
<ul aria-label="购物车项">
  <li>无线耳机 — $79.99</li>
</ul>
<button>结账</button>
```

你第一次运行测试时使用 `--update`。Vitest 生成快照：

```yaml
- heading "你的购物车" [level=1]
- list "购物车项":
    - listitem: 无线耳机 — $79.99
- button "结账"
```

**步骤 2。** 商品名称和价格是测试种子数据，可能会变化。你手动编辑这些行为正则模式，但保留稳定结构为字面量：

```yaml
- heading "你的购物车" [level=1]
- list "购物车项":
    - listitem: /.+ — \$\d+\.\d+/
- button "结账"
```

**步骤 3。** 后续，开发人员将按钮从“结账”重命名为“下单”。运行 `--update` 会更新该字面量，但保留你的正则模式：

```yaml
- heading "你的购物车" [level=1]
- list "购物车项":
    - listitem: /.+ — \$\d+\.\d+/
- button "下单"   👈 新快照更新为新字符串
```

你在步骤 2 中编写的正则模式会被保留，因为它们仍然匹配实际内容。只有不匹配的“结账”字面量才被更新为“下单”。

## 快照格式

ARIA 快照使用类似 YAML 的语法。每一行代表可访问性树中的一个节点。

::: info
ARIA 快照模板使用 **YAML 的子集**语法。仅支持可访问性树所需的特性：标量值、通过缩进实现的嵌套映射，以及序列（`- item`）。不支持高级 YAML 功能，如锚点、标签、流式集合和多行标量。

捕获的文本在渲染到快照之前也会进行空白规范化。换行符、`<br>` 换行、制表符和重复的空白都会折叠为单个空格，因此多行 DOM 文本会以单行快照值形式输出。
:::

每个可访问元素在树中表示为一个 YAML 节点：

```yaml
- role "name" [attribute=value]
```

- `role`: 元素的 ARIA 角色，例如 `heading`、`list`、`listitem` 或 `button`
- `"name"`: [可访问名称](https://w3c.github.io/accname/)，如果存在。使用引号字符串匹配精确值，`/patterns/` 匹配正则表达式
- `[attribute=value]`: 可访问性状态和属性，如 `checked`、`disabled`、`expanded`、`level`、`pressed` 或 `selected`

这些值来自 ARIA 属性和浏览器的可访问性树，包括从原生 HTML 元素推导出的语义。

因为 ARIA 快照反映的是浏览器的可访问性树，所以被排除在可访问性树之外的内容（如 `aria-hidden="true"` 或 `display: none`）不会出现在快照中。

### 角色和可访问名称

例如：

```html
<button>提交</button>
<h1>欢迎</h1>
<a href="/">首页</a>
<input aria-label="邮箱" />
```

```yaml
- button "提交"
- heading "欢迎" [level=1]
- link "首页"
- textbox "邮箱"
```

角色通常来自元素的原生语义，也可以通过 ARIA 定义。可访问名称根据文本内容、关联标签、`aria-label`、`aria-labelledby` 以及相关命名规则计算得出。

要更深入了解名称的计算方式，请参阅[可访问名称和描述计算](https://w3c.github.io/accname/)。

某些内容在快照中作为文本节点而不是基于角色的元素显示：

```html
<span>你好世界</span>
```

```yaml
- text: 你好世界
```

文本值在空白规范化后始终序列化为单行。例如：

```html
<p>
第一行
第二行<br />第三行
第四行
</p>
```

```yaml
- paragraph: 第一行 第二行 第三行 第四行
```

### 子元素

子元素嵌套在父元素下：

```html
<ul>
  <li>第一</li>
  <li>第二</li>
  <li>第三</li>
</ul>
```

```yaml
- list:
    - listitem: 第一
    - listitem: 第二
    - listitem: 第三
```

如果父元素具有可访问名称，则在嵌套子元素之前，快照会包含该名称：

```html
<nav aria-label="主导航">
  <a href="/">首页</a>
  <a href="/about">关于</a>
</nav>
```

```yaml
- navigation "主导航":
    - link "首页"
    - link "关于"
```

如果元素只包含一个文本子元素且没有其他属性，文本会以内联形式渲染：

```html
<p>你好世界</p>
```

```yaml
- paragraph: 你好世界
```

### 属性

ARIA 状态和属性以方括号显示：

| HTML                                                                   | 快照                                  |
| ---------------------------------------------------------------------- | ------------------------------------- |
| `<input type="checkbox" checked aria-label="同意">`                   | `- checkbox "同意" [checked]`         |
| `<input type="checkbox" aria-checked="mixed" aria-label="全选">` | `- checkbox "全选" [checked=mixed]`   |
| `<button aria-disabled="true">提交</button>`                         | `- button "提交" [disabled]`          |
| `<button aria-expanded="true">菜单</button>`                           | `- button "菜单" [expanded]`          |
| `<h2>标题</h2>`                                                       | `- heading "标题" [level=2]`          |
| `<button aria-pressed="true">粗体</button>`                            | `- button "粗体" [pressed]`           |
| `<button aria-pressed="mixed">粗体</button>`                           | `- button "粗体" [pressed=mixed]`     |
| `<option selected>英语</option>`                                    | `- option "英语" [selected]`       |

仅当属性处于活动状态时才会显示。未被禁用的按钮不会显示 `[disabled]` 属性——没有 `[disabled=false]`。

### 伪属性

一些不属于 ARIA 但对测试有用的 DOM 属性会以 `/` 前缀暴露：

#### `/url:`

链接包含其 URL：

```html
<a href="/">首页</a>
```

```yaml
- link "首页":
    - /url: /
```

#### `/placeholder:`

文本框可以包含其占位符文本：

```html
<input aria-label="邮箱" placeholder="user@example.com" />
```

```yaml
- textbox "邮箱":
    - /placeholder: user@example.com
```

::: tip 何时显示 `/placeholder:`

只有当占位符文本**与可访问名称不同**时，`/placeholder:` 才会显示。如果输入框有占位符但没有 `aria-label` 或关联的 `<label>`，浏览器会将占位符用作可访问名称。在这种情况下，占位符信息已在名称中，不会重复显示。

- 当占位符为可访问名称时：

```html
<input placeholder="搜索" />
```

```yaml
- textbox "搜索"
```

- 当占位符与可访问名称不同时：

```html
<input placeholder="搜索" aria-label="搜索商品" />
```

```yaml
- textbox "搜索商品":
    - /placeholder: 搜索
```

:::

## 匹配

### 正则表达式

使用正则表达式灵活匹配名称：

```html
<h1>欢迎，爱丽丝</h1>
<a href="https://example.com/profile/123">个人资料</a>
```

```yaml
- heading /欢迎, .*/
- link "个人资料":
    - /url: /https:\/\/example\.com\/.*/
```

正则表达式也可用于伪属性值：

```html
<input aria-label="搜索" placeholder="键入以搜索..." />
```

```yaml
- textbox "搜索":
    - /placeholder: 键入 .*/
```

::: warning 转义正则表达式中的反斜杠

快照存储为 JavaScript 字符串——在反引号模板字面量中（用于内联快照）和 `.snap` 文件中。由于此原因，处理正则表达式模式时需要**双重转义**反斜杠。

例如，要使用 `\d+` 匹配一个或多个数字：

```ts
// ✅ 正确 — 双反斜杠
await expect.element(button).toMatchAriaInlineSnapshot(`
  - button: /item \\d+/
`)

// ❌ 错误 — 单反斜杠会被 JS 消耗，正则表达式看到 "d+" 而不是 "\d+"
await expect.element(button).toMatchAriaInlineSnapshot(`
  - button: /item \d+/
`)
```

这适用于内联快照和 `.snap` 文件。当 Vitest **自动生成**或**更新**快照时，转义会自动处理——你只需在手动编辑正则表达式时注意这一点。
:::

### 子元素匹配

`/children` 指令控制节点子元素的比较方式。有三种模式：

#### 部分匹配（默认）

默认情况下（无 `/children` 指令），模板使用**包含**语义——只要模板中的所有子元素按顺序出现，额外的实际子元素是允许的。这等同于 `/children: contain`。

```html
<main>
  <h1>欢迎</h1>
  <p>一些介绍文本</p>
  <button>开始</button>
</main>
```

```ts
// 通过——模板子元素是实际子元素的子集
await expect.element(page.getByRole('main')).toMatchAriaInlineSnapshot(`
  - main:
    - heading "欢迎" [level=1]
`)
```

这对于专注于测试且不会在添加无关内容时断裂的弹性测试很有用。

#### 精确匹配（`/children: equal`）

要求节点的直接子元素与模板完全匹配——相同的数量，相同的顺序。不允许在此层级有额外的子元素。

```html
<ul aria-label="特性">
  <li>特性 A</li>
  <li>特性 B</li>
  <li>特性 C</li>
</ul>
```

```ts
// 失败——列表有 3 个条目但模板只列出了 2 个
await expect.element(page.getByRole('list')).toMatchAriaInlineSnapshot(`
  - list "特性":
    - /children: equal
    - listitem: 特性 A
    - listitem: 特性 B
`)
```

```ts
// 通过——所有 3 个条目都列出
await expect.element(page.getByRole('list')).toMatchAriaInlineSnapshot(`
  - list "特性":
    - /children: equal
    - listitem: 特性 A
    - listitem: 特性 B
    - listitem: 特性 C
`)
```

严格匹配仅应用于放置 `/children` 的层级。每个 `listitem` 的后代仍使用默认的包含语义。

#### 深度精确匹配（`/children: deep-equal`）

类似于 `equal`，但严格匹配**传播到所有后代**。每个嵌套层级都必须完全匹配——相同的数量、相同的顺序，且任何层级都不能有额外节点。

```ts
await expect.element(page.getByRole('navigation')).toMatchAriaInlineSnapshot(`
  - navigation "主导航":
    - /children: deep-equal
    - link "首页":
      - /url: /
    - link "关于":
      - /url: /about
`)
```

使用 `deep-equal` 时，每个 `link` 的每个子节点也必须完全匹配。如果链接有模板中未列出的额外子节点，断言将失败。

#### 比较

| 模式 | 指令 | 行为 |
| --- | --- | --- |
| 部分 | _(默认)_ 或 `/children: contain` | 模板子元素是有序子序列——额外的实际子元素会被忽略 |
| 精确 | `/children: equal` | 必须立即子元素完全匹配；后代仍使用部分匹配 |
| 深度精确 | `/children: deep-equal` | 每个深度的所有子元素都必须完全匹配 |
