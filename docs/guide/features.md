---
title: 特性 | 指南
outline: deep
---

# 特性

<script setup>
import FeaturesList from '../.vitepress/components/FeaturesList.vue'
</script>

<FeaturesList class="!gap-1 text-lg" />

<div h-2 />
<CourseLink href="https://vueschool.io/lessons/your-first-test?friend=vueuse">通过视频学习如何编写你的第一个测试</CourseLink>

::: tip
此页面是 Vitest 能力的高级别概述。如果你是 Vitest 新手，我们建议先阅读 [入门教程](/guide/learn/writing-tests)。
:::

## 测试、开发和构建的共享配置

Vite 的配置、转换器、解析器和插件。使用与应用相同的设置来运行测试。

在 [配置 Vitest](/config/) 中了解更多信息。

## 监听模式

```bash
$ vitest
```

当你修改源代码或测试文件时，Vitest 会智能地搜索模块图并只重新运行相关的测试，就像 Vite 中的 HMR 工作方式一样！

`vitest` 在 **开发环境下默认启动为 `watch mode`**，在 CI 环境下（当存在 `process.env.CI` 时）智能地启动为 `run mode`。你可以使用 `vitest watch` 或 `vitest run` 来明确指定所需的模式。

使用 `--standalone` 标志启动 Vitest 以使其在后台运行。直到测试发生变化之前，它不会运行任何测试。如果源代码发生变化，直到导入该源代码的测试被运行之前，Vitest 都不会运行测试。

## 开箱即用的常见 Web 习惯

开箱即用的 ES Module / TypeScript / JSX 支持 / PostCSS

## 线程

默认情况下，Vitest 使用 [`node:child_process`](https://nodejs.org/api/child_process.html) 在 [多个进程](/guide/parallelism) 中运行测试文件，允许测试同时运行。如果你想进一步加快测试套件的速度，考虑启用 `--pool=threads` 以使用 [`node:worker_threads`](https://nodejs.org/api/worker_threads.html) 运行测试（注意某些包可能在此设置下无法工作）。
要在单个线程或进程中运行测试，请参阅 [`fileParallelism`](/config/fileparallelism)。

Vitest 还会隔离每个文件的环境，因此一个文件中的环境突变不会影响其他文件。可以通过向 CLI 传递 `--no-isolate` 来禁用隔离（以正确性换取运行性能）。

## 测试过滤

Vitest 提供了多种方法来缩小要运行的测试范围，以加快测试速度，从而使你可以专注于开发。

了解更多：[测试过滤](/guide/filtering)。

## 并发运行测试

在连续测试中使用 `.concurrent` 以并行启动它们。

```ts
import { describe, it } from 'vitest'

// 标记为 concurrent 的两个测试将并行启动
describe('suite', () => {
  it('serial test', async () => { /* ... */ })
  it.concurrent('concurrent test 1', async ({ expect }) => { /* ... */ })
  it.concurrent('concurrent test 2', async ({ expect }) => { /* ... */ })
})
```

如果你在套件上使用 `.concurrent`，其中的每个测试都将并行启动。

```ts
import { describe, it } from 'vitest'

// 此套件中的所有测试将并行启动
describe.concurrent('suite', () => {
  it('concurrent test 1', async ({ expect }) => { /* ... */ })
  it('concurrent test 2', async ({ expect }) => { /* ... */ })
  it.concurrent('concurrent test 3', async ({ expect }) => { /* ... */ })
})
```

你也可以在并发套件和测试中使用 `.skip`、`.only` 和 `.todo`。请在 [API 参考](/api/test#test-concurrent) 中阅读更多内容。

::: warning
运行并发测试时，快照和断言必须使用本地 [测试上下文](/guide/test-context) 中的 `expect`，以确保检测到正确的测试。
:::

## 快照

[Jest 兼容](https://jestjs.io/docs/snapshot-testing) 的快照支持。

```ts
import { expect, it } from 'vitest'

it('renders correctly', () => {
  const result = render()
  expect(result).toMatchSnapshot()
})
```

了解更多：[快照](/guide/snapshot)。

## Chai 和 Jest `expect` 兼容性

[Chai](https://www.chaijs.com/) 内置用于断言，具有 [Jest `expect`](https://jestjs.io/docs/expect) 兼容的 API。

请注意，如果你使用添加匹配器的第三方库，将 [`test.globals`](/config/globals) 设置为 `true` 将提供更好的兼容性。

## 模拟

Vitest 在 `vi` 对象上提供 `jest` 兼容的 API。

```ts
import { expect, vi } from 'vitest'

const fn = vi.fn()

fn('hello', 1)

expect(vi.isMockFunction(fn)).toBe(true)
expect(fn.mock.calls[0]).toEqual(['hello', 1])

fn.mockImplementation((arg: string) => arg)

fn('world', 2)

expect(fn.mock.results[1].value).toBe('world')
```

Vitest 支持 [happy-dom](https://github.com/capricorn86/happy-dom) 或 [jsdom](https://github.com/jsdom/jsdom) 来模拟 DOM 和浏览器 API。它们不随 Vitest 附带，你需要单独安装它们：

::: code-group
```bash [happy-dom]
$ npm i -D happy-dom
```
```bash [jsdom]
$ npm i -D jsdom
```
:::

之后，更改配置文件中的 `environment` 选项：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom', // 或 'jsdom', 'node'
  },
})
```

了解更多：[模拟](/guide/mocking)。

## 覆盖率

Vitest 支持通过 [`v8`](https://v8.dev/blog/javascript-code-coverage) 的原生代码覆盖率，以及通过 [`istanbul`](https://istanbul.js.org/) 的插桩代码覆盖率。

```json [package.json]
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

了解更多：[覆盖率](/guide/coverage)。

## 源内测试

Vitest 还提供了一种在源代码中随实现一起运行测试的方法，类似于 [Rust 的模块测试](https://doc.rust-lang.org/book/ch11-03-test-organization.html#the-tests-module-and-cfgtest)。

这使得测试与实现共享相同的闭包，并且能够在不导出的情况下针对私有状态进行测试。同时，它也为开发带来了更紧密的反馈循环。

```ts [src/index.ts]
// 实现
export function add(...args: number[]): number {
  return args.reduce((a, b) => a + b, 0)
}

// 源内测试套件
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
```

了解更多：[源内测试](/guide/in-source)。

## 基准测试 <Badge type="warning">实验性</Badge> {#benchmarking}

你可以通过 [Tinybench](https://github.com/tinylibs/tinybench) 使用 [`bench`](/api/test#bench) 函数运行基准测试以比较性能结果。

```ts [sort.bench.ts]
import { bench, describe } from 'vitest'

describe('sort', () => {
  bench('normal', () => {
    const x = [1, 5, 4, 2, 3]
    x.sort((a, b) => {
      return a - b
    })
  })

  bench('reverse', () => {
    const x = [1, 5, 4, 2, 3]
    x.reverse().sort((a, b) => {
      return a - b
    })
  })
})
```

<img alt="基准测试报告" img-dark src="https://github.com/vitest-dev/vitest/assets/4232207/6f0383ea-38ba-4f14-8a05-ab243afea01d">
<img alt="基准测试报告" img-light src="https://github.com/vitest-dev/vitest/assets/4232207/efbcb427-ecf1-4882-88de-210cd73415f6">

## 类型测试 <Badge type="warning">实验性</Badge> {#type-testing}

你可以 [编写测试](/guide/testing-types) 来捕获类型回归。Vitest 附带 [`expect-type`](https://github.com/mmkal/expect-type) 包，为你提供类似且易于理解的 API。

```ts [types.test-d.ts]
import { assertType, expectTypeOf, test } from 'vitest'
import { mount } from './mount.js'

test('my types work properly', () => {
  expectTypeOf(mount).toBeFunction()
  expectTypeOf(mount).parameter(0).toExtend<{ name: string }>()

  // @ts-expect-error name 是一个字符串
  assertType(mount({ name: 42 }))
})
```

## 分片

使用 [`--shard`](/guide/cli#shard) 和 [`--reporter=blob`](/guide/reporters#blob-reporter) 标志在不同机器上运行测试。
所有测试和覆盖率结果可以在 CI 管道末尾使用 `--merge-reports` 命令合并：

```bash
vitest --shard=1/2 --reporter=blob --coverage
vitest --shard=2/2 --reporter=blob --coverage
vitest --merge-reports --reporter=junit --coverage
```

请参阅 [`改进性能 | 分片`](/guide/improving-performance#sharding) 以获取更多信息。

## 环境变量

Vitest 专门从 `.env` 文件自动加载以 `VITE_` 为前缀的环境变量，以保持与前端相关测试的兼容性，遵循 [Vite 的既定约定](https://vitejs.dev/guide/env-and-mode.html#env-files)。无论如何都要从 `.env` 文件加载每个环境变量，你可以使用从 `vite` 导入的 `loadEnv` 方法：

```ts [vitest.config.ts]
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  test: {
    // mode 定义如果存在则选择哪个 ".env.{mode}" 文件
    env: loadEnv(mode, process.cwd(), ''),
  },
}))
```

## 未处理的错误

默认情况下，Vitest 捕获并报告所有 [未处理的拒绝](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event)、[未捕获的异常](https://nodejs.org/api/process.html#event-uncaughtexception)（在 Node.js 中）和 [error](https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event) 事件（在 [浏览器](/guide/browser/) 中）。

你可以通过手动捕获它们来禁用此行为。Vitest 假设回调由你处理，不会报告错误。

::: code-group
```ts [setup.node.js]
// 在 Node.js 中
process.on('unhandledRejection', () => {
  // 你自己的处理程序
})

process.on('uncaughtException', () => {
  // 你自己的处理程序
})
```
```ts [setup.browser.js]
// 在浏览器中
window.addEventListener('error', () => {
  // 你自己的处理程序
})

window.addEventListener('unhandledrejection', () => {
  // 你自己的处理程序
})
```
:::

或者，你也可以使用 [`dangerouslyIgnoreUnhandledErrors`](/config/dangerouslyignoreunhandlederrors) 选项忽略报告的错误。Vitest 仍然会报告它们，但它们不会影响测试结果（退出代码不会改变）。

如果你需要测试错误未被捕获，你可以创建一个如下所示的测试：

```ts
test('my function throws uncaught error', async ({ onTestFinished }) => {
  const unhandledRejectionListener = vi.fn()
  process.on('unhandledRejection', unhandledRejectionListener)
  onTestFinished(() => {
    process.off('unhandledRejection', unhandledRejectionListener)
  })

  callMyFunctionThatRejectsError()

  await expect.poll(unhandledRejectionListener).toHaveBeenCalled()
})
```
