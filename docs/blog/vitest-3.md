---
title: Vitest 3.0 发布
author:
  name: Vitest 团队
date: 2025-01-17
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Vitest 3.0 发布
  - - meta
    - property: og:image
      content: https://vitest.zhcndoc.com/og-vitest-3.jpg
  - - meta
    - property: og:url
      content: https://vitest.zhcndoc.com/blog/vitest-3
  - - meta
    - property: og:description
      content: Vitest 3.0 发布！这个版本带来了许多新功能和改进，包括更好的报告器、内联工作空间、多浏览器配置、按位置过滤和公共 API 更新。
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vitest 3.0 发布

_2025 年 1 月 17 日_

![Vitest 3 发布封面图](/og-vitest-3.jpg)

我们在半年前发布了 Vitest 2。我们看到了巨大的采用率，从每周 480 万 npm 下载量增长到 770 万。我们的生态系统也在迅速增长。其中包括 [Storybook 新的测试功能（由我们的 VSCode 扩展和浏览器模式驱动）](https://storybook.js.org/docs/writing-tests/test-addon)，以及 Matt Pocock 正在 Vitest 之上构建 [Evalite](https://www.evalite.dev/)，这是一个用于评估 AI 驱动应用程序的工具。

## 下一代 Vitest 主版本来了

今天，我们很高兴地宣布 Vitest 3！这是一个大版本！

快速链接：

- [文档](/)
- 翻译：[简体中文](https://cn.vitest.dev/)
- [迁移指南](/guide/migration)
- [GitHub 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v3.0.0)

如果你之前没有使用过 Vitest，我们建议先阅读 [入门](/guide/) 和 [特性](/guide/features) 指南。

我们向 [550 位 Vitest Core 贡献者](https://github.com/vitest-dev/vitest/graphs/contributors) 以及帮助我们开发这个新主版本的 Vitest 集成、工具和翻译的维护者和贡献者表示衷心的感谢。我们鼓励你参与进来，帮助我们为整个生态系统改进 Vitest。了解更多请访问我们的 [贡献指南](https://github.com/vitest-dev/vitest/blob/main/CONTRIBUTING.md)。

为了开始，我们建议帮助 [分类问题](https://github.com/vitest-dev/vitest/issues)，[审查 PR](https://github.com/vitest-dev/vitest/pulls)，根据未解决的问题发送失败测试的 PR，并在 [讨论区](https://github.com/vitest-dev/vitest/discussions) 和 Vitest Land 的 [帮助论坛](https://discord.com/channels/917386801235247114/1057959614160851024) 中支持他人。如果你想和我们交谈，加入我们的 [Discord 社区](http://chat.vitest.dev/) 并在 [#contributing 频道](https://discord.com/channels/917386801235247114/1057959614160851024) 打招呼。

有关 Vitest 生态系统和 Vitest core 的最新消息，请在 [Bluesky](https://bsky.app/profile/vitest.dev) 或 [Mastodon](https://webtoo.ls/@vitest) 上关注我们。

## 报告器更新

[@AriPerkkio](https://github.com/ariperkkio) 重写了 Vitest 报告测试运行的方式。你应该会看到更少的闪烁和更稳定的输出！

<div class="flex align-center justify-center">
  <video controls>
    <source src="/new-reporter.webm" type="video/webm">
  </video>
</div>

除了这一更改外，我们还重新设计了公共报告器 API（`reporters` 字段），使 [生命周期](/api/advanced/reporters) 更易于理解。

你可以在 [#7069](https://github.com/vitest-dev/vitest/pull/7069) PR 中关注设计过程。为了逆向工程之前的 `onTaskUpdate` API 以实现这个新的优雅生命周期，这是一场艰苦的战斗。

<div class="flex align-center justify-center">
  <img src="/on-task-update.gif" alt="来自《It's Always Sunny》的绘图板 GIF" />
</div>

## 内联工作空间

值得高兴！不再需要单独的文件来定义你的 [工作空间](/guide/projects) - 在 `vitest.config` 文件中使用 `workspace` 字段指定项目数组：

```jsx
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: ['packages/*'],
  },
})
```

## 多浏览器配置

Vitest 3 引入了一种性能更高的方式，在不同的浏览器或设置中运行浏览器测试。你可以定义一个 [`instances`](/guide/browser/multiple-setups) 数组来在不同的设置中运行浏览器测试，而不是使用工作空间：

```jsx
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
          launch: { devtools: true },
        },
        {
          browser: 'firefox',
          setupFiles: ['./setup.firefox.ts'],
          provide: {
            secret: 'my-secret',
          },
        },
      ],
    }
  }
})
```

`instances` 相对于 `workspace` 的主要优势是更好的缓存策略 - Vitest 只创建一个 Vite 服务器来提供文件，这些文件只处理一次，与你测试多少个浏览器无关。

此版本还改进了浏览器模式功能的文档，并为 [Playwright](/config/browser/playwright) 和 [WebdriverIO](/config/browser/webdriverio) 引入了单独的指南，希望能使配置更容易。

## 按位置过滤

在 Vitest 3 中，你现在可以按行号过滤测试。

```
$ vitest basic/foo.js:10
$ vitest ./basic/foo.js:10
```

特别感谢 [@mzhubail](https://github.com/mzhubail) 实现了这个功能。

## 公共 API

我们重新设计了 `vitest/node` 提供的公共 API，并计划在下一个次要版本中移除实验性标签。此版本还包括涵盖所有暴露方法的全新文档。

<img alt="Vitest API 文档" img-light src="/docs-api-light.png">
<img alt="Vitest API 文档" img-dark src="/docs-api-dark.png">

## 破坏性变更

Vitest 3 有一些小的破坏性变更，不应影响大多数用户，但我们建议在升级前查看详细的 [迁移指南](/guide/migration.html#vitest-3)。

完整的变更列表位于 [Vitest 3 更新日志](https://github.com/vitest-dev/vitest/releases/tag/v3.0.0)。

## 致谢

Vitest 3 是 [Vitest 团队](/team) 和我们的贡献者无数小时工作的结果。我们感谢赞助 Vitest 开发的个人和公司。[Vladimir](https://github.com/sheremet-va) 和 [Hiroshi](https://github.com/hi-ogawa) 加入 [VoidZero](https://voidzero.dev) 全职从事 Vite 和 Vitest 工作，[StackBlitz](https://stackblitz.com/) 雇佣了 [Ari](https://github.com/ariperkkio) 以投入更多时间进行 Vitest 开发。特别感谢 [NuxtLabs](https://nuxtlabs.com)，[Zammad](https://zammad.com)，以及 [Vitest 的 GitHub 赞助](https://github.com/sponsors/vitest-dev) 和 [Vitest 的 Open Collective](https://opencollective.com/vitest) 上的赞助商。
