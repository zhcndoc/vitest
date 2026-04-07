---
title: 与其他测试运行器的比较 | 指南
---

# 与其他测试运行器的比较

## Jest

[Jest](https://jestjs.io/) 通过为大多数 JavaScript 项目提供开箱即用的支持、舒适的 API（`it` 和 `expect`）以及大多数设置所需的完整测试功能包（快照、模拟、覆盖率），接管了测试框架领域。我们感谢 Jest 团队和社区创造了令人愉悦的测试 API，并推动了许多现在成为 Web 生态系统标准的测试模式。

在 Vite 设置中使用 Jest 是可能的。[@sodatea](https://bsky.app/profile/haoqun.dev) 构建了 [vite-jest](https://github.com/sodatea/vite-jest#readme)，旨在为 [Jest](https://jestjs.io/) 提供一流的 Vite 集成。[Jest 中的最后一个阻碍](https://github.com/sodatea/vite-jest/blob/main/packages/vite-jest/README.md#vite-jest) 已经解决，所以这是单元测试的有效选项。

然而，在一个我们拥有 [Vite](https://vitejs.dev) 为最常见的 Web 工具（TypeScript、JSX、最流行的 UI 框架）提供支持的世界里，Jest 代表了复杂性的重复。如果你的应用由 Vite 驱动，配置和维护两个不同的管道是不合理的。使用 Vitest，你可以将开发、构建和测试环境的配置定义为单个管道，共享相同的插件和相同的 vite.config.js。

即使你的库没有使用 Vite（例如，如果它是用 esbuild 或 Rollup 构建的），Vitest 也是一个有趣的选项，因为它为你的单元测试提供了更快的运行速度，并且得益于使用 Vite 即时热模块替换（HMR）的默认 watch 模式，DX 有了飞跃。Vitest 提供了与大多数 Jest API 和生态系统库的兼容性，所以在大多数项目中，它应该是 Jest 的直接替代品。

## Cypress

[Cypress](https://www.cypress.io/) 是一个基于浏览器的测试运行器，也是 Vitest 的互补工具。如果你想使用 Cypress，我们建议在你的应用中使用 Vitest 处理所有无头逻辑，使用 Cypress 处理所有基于浏览器的逻辑。

Cypress 被称为端到端测试工具，但他们 [新的组件测试运行器](https://on.cypress.io/component) 对测试 Vite 组件有很好的支持，是测试任何在浏览器中渲染的内容的理想选择。

基于浏览器的运行器，如 Cypress、WebdriverIO 和 Web Test Runner，会捕捉到 Vitest 无法捕捉的问题，因为它们使用真实的浏览器和真实的浏览器 API。

Cypress 的测试驱动专注于确定元素是否可见、可访问和可交互。Cypress 是为 UI 开发和测试而建的，其 DX 围绕着测试驱动你的视觉组件。你会看到你的组件与测试报告器一起渲染。测试完成后，组件保持交互状态，你可以使用浏览器开发工具调试任何发生的失败。

相比之下，Vitest 专注于为闪电般快速的*无头*测试提供尽可能最好的 DX。基于 Node 的运行器（如 Vitest）支持各种部分实现的浏览器环境，如 `jsdom`，它们实现了足够的功能让你快速单元测试任何引用浏览器 API 的代码。权衡的是，这些浏览器环境在它们能实现的内容上有局限性。例如，[jsdom 缺少许多功能](https://github.com/jsdom/jsdom/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc)，如 `window.navigation` 或布局引擎（`offsetTop` 等）。

最后，与 Web Test Runner 相比，Cypress 测试运行器更像是一个 IDE 而不是一个测试运行器，因为你还会在浏览器中看到真实渲染的组件，以及它的测试结果和日志。

Cypress 也一直 [在其产品中集成 Vite](https://www.youtube.com/watch?v=7S5cbY8iYLk)：使用 [Vitesse](https://github.com/antfu/vitesse) 重建他们的 App UI，并使用 Vite 测试驱动他们项目的开发。

我们相信 Cypress 不是单元测试无头代码的好选项，但使用 Cypress（用于 E2E 和组件测试）和 Vitest（用于单元测试）将覆盖你的应用的测试需求。

## WebdriverIO

[WebdriverIO](https://webdriver.io/) 与 Cypress 类似，是一个基于浏览器的替代测试运行器，也是 Vitest 的互补工具。它可以用作端到端测试工具，也可以用于测试 [Web 组件](https://webdriver.io/docs/component-testing)。它甚至在底层使用 Vitest 的组件，例如在组件测试中进行 [模拟和桩](https://webdriver.io/docs/mocksandspies/)。

WebdriverIO 具有与 Cypress 相同的优势，允许你在真实浏览器中测试你的逻辑。然而，它使用实际的 [Web 标准](https://w3c.github.io/webdriver/) 进行自动化，这克服了在 Cypress 中运行测试时的一些权衡和限制。此外，它还允许你在移动设备上运行测试，让你能够在更多的环境中测试你的应用。

## Web Test Runner

[@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) 在无头浏览器中运行测试，提供与你的 Web 应用相同的执行环境，无需 mock 浏览器 API 或 DOM。这也使得可以使用开发工具在真实浏览器中调试，尽管没有像 Cypress 测试中那样的用于逐步测试的 UI 显示。

要在 Vite 项目中使用 @web/test-runner，请使用 [@remcovaes/web-test-runner-vite-plugin](https://github.com/remcovaes/web-test-runner-vite-plugin)。@web/test-runner 不包含断言或 mocking 库，所以由你来添加它们。

## uvu

[uvu](https://github.com/lukeed/uvu) 是一个用于 Node.js 和浏览器的测试运行器。它在单线程中运行测试，所以测试不是隔离的，可能会跨文件泄漏。然而，Vitest 使用 worker 线程来隔离测试并并行运行它们。

对于转换你的代码，uvu 依赖于 require 和 loader hooks。Vitest 使用 [Vite](https://vitejs.dev)，所以文件使用 Vite 插件系统的全部功能进行转换。在一个我们拥有 Vite 为最常见的 Web 工具（TypeScript、JSX、最流行的 UI 框架）提供支持的世界里，uvu 代表了复杂性的重复。如果你的应用由 Vite 驱动，配置和维护两个不同的管道是不合理的。使用 Vitest，你可以将开发、构建和测试环境的配置定义为单个管道，共享相同的插件和相同的配置。

uvu 不提供智能 watch 模式来重新运行更改的测试，而 Vitest 得益于使用 Vite 即时热模块替换（HMR）的默认 watch 模式，为你提供了惊人的 DX。

uvu 是运行简单测试的快速选项，但 Vitest 对于更复杂的测试和项目可以更快且更可靠。

## Mocha

[Mocha](https://mochajs.org) 是一个在 Node.js 和浏览器中运行的测试框架。Mocha 是服务器端测试的流行选择。Mocha 高度可配置，默认不包含某些功能。例如，它不带断言库，其理念是 Node 的内置断言运行器对于大多数用例已经足够好。另一个与 Mocha 一起使用的流行断言选择是 [Chai](https://www.chaijs.com)。

Vitest 还为一些其他功能提供开箱即用的设置，这些功能在 Mocha 中需要额外的配置或添加其他库，例如：

- 快照测试
- TypeScript
- JSX 支持
- 代码覆盖率
- 模拟
- 智能 watch 模式（仅重新运行受影响的测试）

虽然 Mocha 支持原生 ESM，但它有局限性和配置约束。例如，watch 模式不适用于 ES 模块文件。

在性能方面，Mocha 默认串行运行测试，但支持使用 `--parallel` 标志并行执行（尽管某些报告器和功能在并行模式下不起作用）。

如果你已经在构建管道中使用 Vite，Vitest 允许你重用相同的配置和插件进行测试，而 Mocha 则需要单独的测试设置。Vitest 提供与 Jest 兼容的 API，同时也支持 Mocha 熟悉的 `describe`、`it` 和 hook 语法，使得大多数测试套件的迁移变得简单。

Mocha 仍然是需要最小化、灵活测试运行器并完全控制其测试栈的项目的可靠选择。但是，如果你想要一个包含所有开箱即用功能的现代测试体验——特别是对于由 Vite 驱动的应用——Vitest 能满足你的需求。

## Playwright

[Playwright](https://playwright.dev) 是微软的一个测试框架，擅长跨多个浏览器（Chromium、Firefox 和 WebKit）进行端到端测试。它控制真实浏览器来测试完整的用户工作流程——从登录和导航你的应用到提交表单和验证结果。另一方面，Vitest 优化用于在无头环境中进行快速、隔离的单元和组件测试。这些差异使其成为 Vitest 的理想补充。

标准设置是使用 Vitest 进行所有单元和组件测试（业务逻辑、工具、hooks 和 UI 组件测试），并使用 Playwright 进行验证关键用户路径和跨浏览器兼容性的端到端测试。这种组合让你在使用 Vitest 开发期间获得快速反馈，同时确保你的完整应用在使用 Playwright 的真实浏览器中正常工作。

Vitest 最近引入了 [浏览器模式](https://vitest.dev/guide/browser)，在真实浏览器中运行测试。然而，有关键的架构差异：Playwright 组件测试在 Node.js 进程中运行并远程控制浏览器。Vitest 的浏览器模式在浏览器中原生运行测试，保持与 Vitest 测试运行器和开发者体验的一致性，但它确实有一些 [局限性](https://vitest.dev/guide/browser/#limitations)。
