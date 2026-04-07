---
title: 入门 | 指南
---

# 入门

## 概述

Vitest（发音为 _"veetest"_) 是一个由 Vite 驱动的下一代测试框架。

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
:::

:::tip
Vitest 需要 Vite >=v6.0.0 和 Node >=v20.0.0
:::

建议你使用上述方法之一在 `package.json` 中安装 `vitest` 副本。但是，如果你更喜欢直接运行 `vitest`，可以使用 `npx vitest`（`npx` 工具随 npm 和 Node.js 一起提供）。

`npx` 工具将执行指定的命令。默认情况下，`npx` 将首先检查命令是否存在于本地项目的二进制文件中。如果在那里没有找到，`npx` 将在系统的 `$PATH` 中查找并在找到时执行它。如果在这两个位置都没有找到命令，`npx` 将在执行前将其安装在临时位置。

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

了解更多关于 Vitest 的用法，请参阅 [API](/api/test) 部分。

## 配置 Vitest

Vitest 的主要优势之一是与 Vite 的统一配置。如果存在，`vitest` 将读取你的根目录 `vite.config.ts` 以匹配你的 Vite 应用的插件和设置。例如，你的 Vite [resolve.alias](https://vitejs.dev/config/shared-options.html#resolve-alias) 和 [plugins](https://vitejs.dev/guide/using-plugins.html) 配置将开箱即用。如果你想在测试期间使用不同的配置，你可以：

- 创建 `vitest.config.ts`，它将具有更高的优先级
- 向 CLI 传递 `--config` 选项，例如 `vitest --config ./path/to/vitest.config.ts`
- 在 `defineConfig` 上使用 `process.env.VITEST` 或 `mode` 属性（如果未被覆盖将设置为 `test`）在 `vite.config.ts` 中条件性地应用不同的配置。注意，像任何其他环境变量一样，`VITEST` 也在你的测试中暴露于 `import.meta.env` 上

Vitest 支持与你配置文件相同的扩展名，就像 Vite 一样：`.js`, `.mjs`, `.cjs`, `.ts`, `.cts`, `.mts`。Vitest 不支持 `.json` 扩展名。

如果你不使用 Vite 作为构建工具，你可以使用配置文件中的 `test` 属性来配置 Vitest：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ...
  },
})
```

::: tip
即使你自己不使用 Vite，Vitest 也严重依赖它来进行转换管道。因此，你也可以配置 [Vite 文档](https://vitejs.dev/config/) 中描述的任何属性。
:::

如果你已经在使用 Vite，请在你的 Vite 配置中添加 `test` 属性。你还需要在配置文件的顶部使用 [triple slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) 添加对 Vitest 类型的引用。

```ts [vite.config.ts]
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // ...
  },
})
```

在 [配置参考](../config/) 中查看配置选项列表

::: warning
如果你决定为 Vite 和 Vitest 使用两个单独的配置文件，请确保在你的 Vitest 配置文件中定义相同的 Vite 选项，因为它将覆盖你的 Vite 文件，而不是扩展它。你也可以使用 `vite` 或 `vitest/config` 条目中的 `mergeConfig` 方法来合并 Vite 配置与 Vitest 配置：

:::code-group
```ts [vitest.config.mjs]
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.mjs'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    // ...
  },
}))
```

```ts [vite.config.mjs]
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [Vue()],
})
```

但是，我们建议对 Vite 和 Vitest 使用同一个文件，而不是创建两个单独的文件。
:::

## 项目支持

使用 [测试项目](/guide/projects) 在同一项目中运行不同的项目配置。你可以在 `vitest.config` 文件中定义一个文件和文件夹列表来定义你的项目。

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // 你可以使用 glob 模式列表来定义你的项目
      // Vitest 期望一个配置文件列表
      // 或者包含配置文件的目录
      'packages/*',
      'tests/*/vitest.config.{e2e,unit}.ts',
      // 你甚至可以运行相同的测试，
      // 但在同一个 "vitest" 进程中使用不同的配置
      {
        test: {
          name: 'happy-dom',
          root: './shared_tests',
          environment: 'happy-dom',
          setupFiles: ['./setup.happy-dom.ts'],
        },
      },
      {
        test: {
          name: 'node',
          root: './shared_tests',
          environment: 'node',
          setupFiles: ['./setup.node.ts'],
        },
      },
    ],
  },
})
```

## 命令行界面

在安装了 Vitest 的项目中，你可以在 npm 脚本中使用 `vitest` 二进制文件，或者直接使用 `npx vitest` 运行它。以下是脚手架化的 Vitest 项目中的默认 npm 脚本：

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

要运行测试一次而不监视文件更改，请使用 `vitest run`。
你可以指定额外的 CLI 选项，如 `--port` 或 `--https`。有关 CLI 选项的完整列表，请在你的项目中运行 `npx vitest --help`。

了解更多关于 [命令行界面](/guide/cli)

## 自动依赖安装

如果某些依赖尚未安装，Vitest 将提示你安装它们。你可以通过设置 `VITEST_SKIP_INSTALL_CHECKS=1` 环境变量来禁用此行为。

## IDE 集成

我们还为 Visual Studio Code 提供了一个官方扩展，以增强你使用 Vitest 的测试体验。

[从 VS Code 市场安装](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)

了解更多关于 [IDE 集成](/guide/ide)

## 示例

| 示例 | 来源 | 在线玩 |
|---|---|---|
| `basic` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/basic) | [在线玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/basic?initialPath=__vitest__/) |
| `fastify` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/fastify) | [在线玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/fastify?initialPath=__vitest__/) |
| `in-source-test` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/in-source-test) | [在线玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/in-source-test?initialPath=__vitest__/) |
| `lit` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/lit) | [在线玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/lit?initialPath=__vitest__/) |
| `vue` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/vue) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/vue?initialPath=__vitest__/) |
| `marko` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/marko) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/marko?initialPath=__vitest__/) |
| `preact` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/preact) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/preact?initialPath=__vitest__/) |
| `qwik`| [Github](https://github.com/vitest-tests/browser-examples/tree/main/examples/qwik) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/qwik?initialPath=__vitest__/) |
| `react` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/react) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/react?initialPath=__vitest__/) |
| `solid` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/solid) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/solid?initialPath=__vitest__/) |
| `svelte` | [GitHub](https://github.com/vitest-tests/browser-examples/tree/main/examples/svelte) | [在线玩](https://stackblitz.com/fork/github/vitest-tests/browser-examples/tree/main/examples/svelte?initialPath=__vitest__/) |
| `profiling` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/profiling) | 不可用 |
| `typecheck` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/typecheck) | [在线玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/typecheck?initialPath=__vitest__/) |
| `projects` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/projects) | [在线玩](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/projects?initialPath=__vitest__/) |

## 使用 Vitest 的项目

- [unocss](https://github.com/unocss/unocss)
- [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import)
- [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- [vue](https://github.com/vuejs/core)
- [vite](https://github.com/vitejs/vite)
- [vitesse](https://github.com/antfu/vitesse)
- [vitesse-lite](https://github.com/antfu/vitesse-lite)
- [fluent-vue](https://github.com/demivan/fluent-vue)
- [vueuse](https://github.com/vueuse/vueuse)
- [milkdown](https://github.com/Saul-Mirone/milkdown)
- [gridjs-svelte](https://github.com/iamyuu/gridjs-svelte)
- [spring-easing](https://github.com/okikio/spring-easing)
- [bytemd](https://github.com/bytedance/bytemd)
- [faker](https://github.com/faker-js/faker)
- [million](https://github.com/aidenybai/million)
- [Vitamin](https://github.com/wtchnm/Vitamin)
- [neodrag](https://github.com/PuruVJ/neodrag)
- [svelte-multiselect](https://github.com/janosh/svelte-multiselect)
- [iconify](https://github.com/iconify/iconify)
- [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)
- [cz-git](https://github.com/Zhengqbbb/cz-git)

<!--
致贡献者：
我们目前不再接受此列表的新条目。
感谢选择 Vitest！
-->

## 使用未发布的提交

main 分支上的每个提交以及带有 `cr-tracked` 标签的 PR 都会发布到 [pkg.pr.new](https://github.com/stackblitz-labs/pkg.pr.new)。你可以通过 `npm i https://pkg.pr.new/vitest@{commit}` 安装它。

如果你想在本地测试自己的修改，你可以自己构建并链接它（需要 [pnpm](https://pnpm.io/)）：

```bash
git clone https://github.com/vitest-dev/vitest.git
cd vitest
pnpm install
cd packages/vitest
pnpm run build
pnpm link --global # 你可以在此步骤使用你喜欢的包管理器
```

然后进入你使用 Vitest 的项目并运行 `pnpm link --global vitest`（或者你用来全局链接 `vitest` 的包管理器）。

## 社区

如果你有问题或需要帮助，请在 [Discord](https://chat.vitest.dev) 和 [GitHub Discussions](https://github.com/vitest-dev/vitest/discussions) 联系社区。
