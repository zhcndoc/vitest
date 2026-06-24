---
title: 入门 | 指南
next:
  text: 编写测试
  link: /guide/learn/writing-tests
---

# 入门

## 概述

Vitest（发音为 _"veetest"_）是一个由 Vite 驱动的下一代测试框架。

你可以在 [为什么选择 Vitest](/guide/why) 部分了解更多关于该项目背后的理由。

## 在线尝试 Vitest

你可以在 [StackBlitz](https://vitest.new) 上在线尝试 Vitest。它直接在浏览器中运行 Vitest，几乎与本地设置相同，但不需要在你的机器上安装任何东西。

## 将 Vitest 添加到你的项目

<CourseLink href="https://vueschool.io/lessons/how-to-install-vitest?friend=vueuse">通过视频学习如何安装</CourseLink>

::: code-group
```bash [npm]
npm install -D vitest
```
```bash [yarn]
yarn add -D vitest
```
```bash [pnpm]
pnpm add -D vitest
```
```bash [bun]
bun add -D vitest
```
```bash [deno]
deno add -D vitest
```
:::

:::tip
Vitest 需要 Vite >=v6.4.0 和 Node >=v22.12.0
:::

建议你使用上述方法之一在 `package.json` 中安装 `vitest` 副本。但是，如果你更喜欢直接运行 `vitest`，可以使用 `npx vitest`（`npx` 工具随 npm 和 Node.js 一起提供）。

`npx` 工具将执行指定的命令。默认情况下，`npx` 将首先检查命令是否存在于本地项目的二进制文件中。如果在那里没有找到，`npx` 将在系统的 `$PATH` 中查找并在找到时执行它。如果在这两个位置都没有找到命令，`npx` 将在执行前将其安装在临时位置。

Vitest 和第三方集成可以使用 `.vitest` 目录来存储生成的工件。建议将其添加到你的 `.gitignore` 中。

``` sh [.gitignore]
# Vitest 报告和工件
.vitest/
```

## 编写测试

作为一个例子，我们将编写一个简单的测试，验证一个将两个数字相加的函数的输出。

``` js [sum.js]
export function sum(a, b) {
  return a + b
}
```

``` js [sum.test.js]
import { expect, test } from 'vitest'
import { sum } from './sum.js'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

::: tip
默认情况下，测试文件的文件名中必须包含 `.test.` 或 `.spec.`。
:::

接下来，为了执行测试，将以下部分添加到你的 `package.json` 中：

```json [package.json]
{
  "scripts": {
    "test": "vitest"
  }
}
```

最后，根据你的包管理器运行 `npm run test`、`yarn test` 或 `pnpm test`，Vitest 将打印此消息：

```txt
✓ sum.test.js (1)
  ✓ 1 + 2 等于 3

测试文件  1 个通过 (1)
     测试  1 个通过 (1)
  开始于  02:15:44
  持续时间  311ms
```

::: warning
如果你使用 Bun 作为包管理器，请确保使用 `bun run test` 命令而不是 `bun test`，否则 Bun 将运行其自己的测试运行器。
:::

你的第一个测试已经通过！继续阅读 [编写测试](/guide/learn/writing-tests)，了解如何组织测试、读取测试输出，以及你每天都会使用的核心测试模式。

若要在不监听文件变更的情况下只运行一次测试，请使用 `vitest run`。你也可以传递诸如 `--reporter` 或 `--coverage` 之类的额外标志。有关 CLI 选项的完整列表，请运行 `npx vitest --help` 或查看 [CLI 指南](/guide/cli)。

## 配置 Vitest

Vitest 默认读取你的 `vite.config.*`，因此你现有的 Vite 插件和配置开箱即用。你也可以创建一个专用的 `vitest.config.*` 用于测试特定设置。详细信息请参见 [配置参考](/config/)。

## IDE 集成

我们还为 Visual Studio Code 提供了一个官方扩展，以增强你使用 Vitest 的测试体验。

[从 VS Code 市场安装](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)

了解更多关于 [IDE 集成](/guide/ide)

## 示例

| 示例 | 来源 | 在线玩 |
|---|---|---|
| `basic` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/basic) | [在线试玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/basic?initialPath=__vitest__/) |
| `fastify` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/fastify) | [在线试玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/fastify?initialPath=__vitest__/) |
| `in-source-test` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/in-source-test) | [在线试玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/in-source-test?initialPath=__vitest__/) |
| `lit` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/lit) | [在线试玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/lit?initialPath=__vitest__/) |
| `vue` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/vue) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/vue?initialPath=__vitest__/) |
| `marko` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/marko) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/marko?initialPath=__vitest__/) |
| `preact` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/preact) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/preact?initialPath=__vitest__/) |
| `qwik` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/qwik) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/qwik?initialPath=__vitest__/) |
| `react` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/react) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/react?initialPath=__vitest__/) |
| `solid` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/solid) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/solid?initialPath=__vitest__/) |
| `svelte` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/svelte) | [在线试玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/svelte?initialPath=__vitest__/) |
| `profiling` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/profiling) | 不可用 |
| `typecheck` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/typecheck) | [在线试玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/typecheck?initialPath=__vitest__/) |
| `projects` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/projects) | [在线试玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/projects?initialPath=__vitest__/) |

## 社区

如果你有问题或需要帮助，请在 [Discord](https://chat.vitest.dev) 和 [GitHub Discussions](https://github.com/vitest-dev/vitest/discussions) 联系社区。
