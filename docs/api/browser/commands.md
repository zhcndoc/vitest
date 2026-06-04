---
title: 命令 | 浏览器模式
outline: deep
---

# 命令

命令是一个函数，它在服务器上调用另一个函数并将结果传回浏览器。Vitest 提供了几个内置命令，你可以在浏览器测试中使用。

## 内置命令

### 文件处理

你可以使用 `readFile`、`writeFile` 和 `removeFile` API 在浏览器测试中处理文件。自 Vitest 3.2 起，所有路径都相对于 [项目](/guide/projects) 根目录解析（即 `process.cwd()`，除非手动覆盖）。此前，路径是相对于测试文件解析的。

默认情况下，Vitest 使用 `utf-8` 编码，但你可以通过选项覆盖它。

::: tip
内置文件命令出于安全原因遵循 Vite 的 [`server.fs`](https://vitejs.dev/config/server-options.html#server-fs-allow) 限制。

`writeFile` 和 `removeFile` 还需要通过 [`browser.api.allowWrite`](/config/browser/api) 和 [`api.allowWrite`](/config/api#api-allowwrite) 获得写入权限。
:::

```ts
import { server } from 'vitest/browser'

const { readFile, writeFile, removeFile } = server.commands

it('处理文件', async () => {
  const file = './test.txt'

  await writeFile(file, 'hello world')
  const content = await readFile(file)

  expect(content).toBe('hello world')

  await removeFile(file)
})
```

## CDP 会话

Vitest 通过从 `vitest/browser` 导出的 `cdp` 方法暴露了对原始 Chrome DevTools Protocol 的访问。这对于库作者在此基础上构建工具最有用。

```ts
import { cdp } from 'vitest/browser'

const input = document.createElement('input')
document.body.appendChild(input)
input.focus()

await cdp().send('Input.dispatchKeyEvent', {
  type: 'keyDown',
  text: 'a',
})

expect(input).toHaveValue('a')
```

::: warning
CDP 会话仅适用于 `playwright` provider，并且仅在使用 `chromium` 浏览器时可用。你可以在 playwright 的 [`CDPSession`](https://playwright.dev/docs/api/class-cdpsession) 文档中了解更多。

CDP 是一个特权调试 API。只有在通过 [`browser.api.allowWrite`](/config/browser/api#api-allowwrite)、[`browser.api.allowExec`](/config/browser/api#api-allowexec)、[`api.allowWrite`](/config/api#api-allowwrite) 和 [`api.allowExec`](/config/api#api-allowexec) 启用浏览器 API 的写入和执行操作时，它才可用。
:::

## 自定义命令

你还可以通过 [`browser.commands`](/config/browser/commands) 配置选项添加自己的命令。如果你开发的是一个库，可以通过插件内的 `config` 钩子提供它们：

```ts
import type { Plugin } from 'vitest/config'
import type { BrowserCommand } from 'vitest/node'

const myCustomCommand: BrowserCommand<[arg1: string, arg2: string]> = ({
  testPath,
  provider
}, arg1, arg2) => {
  if (provider.name === 'playwright') {
    console.log(testPath, arg1, arg2)
    return { someValue: true }
  }

  throw new Error(`provider ${provider.name} is not supported`)
}

export default function BrowserCommands(): Plugin {
  return {
    name: 'vitest:custom-commands',
    config() {
      return {
        test: {
          browser: {
            commands: {
              myCustomCommand,
            }
          }
        }
      }
    }
  }
}
```

然后你可以通过从 `vitest/browser` 导入它在测试中调用它：

```ts
import { commands } from 'vitest/browser'
import { expect, test } from 'vitest'

test('自定义命令正常工作', async () => {
  const result = await commands.myCustomCommand('test1', 'test2')
  expect(result).toEqual({ someValue: true })
})

// 如果你使用的是 TypeScript，你可以扩充该模块
declare module 'vitest/browser' {
  interface BrowserCommands {
    myCustomCommand: (arg1: string, arg2: string) => Promise<{
      someValue: true
    }>
  }
}
```

::: warning
如果自定义函数与内置函数同名，它们将覆盖内置函数。
:::

::: warning 安全
自定义命令在 Vitest Node 进程中运行，并可通过 Vitest 的 browser RPC 连接从浏览器测试代码中调用。它们可以访问本地文件、环境变量、网络服务、数据库、shell 命令以及其他 Node API。

Vitest 的内置文件命令会根据 Vite 的 [`server.fs`](https://vite.dev/config/server-options#server-fs-allow) 限制验证路径，并单独检查是否允许写入。自定义命令不会自动继承这些保护。如果某个自定义命令接受浏览器提供的输入并使用它来读取、写入、删除、执行或暴露本地资源，那么在使用之前必须先验证该输入。

对于文件读取或 fixture 加载，请使用 `vitest/node` 中的 `isFileLoadingAllowed` 或显式的 allowlist。对于写入和删除，还应要求显式的变更策略，例如 [`browser.api.allowWrite`](/config/browser/api#api-allowwrite)、[`api.allowWrite`](/config/api#api-allowwrite) 以及某个命令特定的允许目录。对于执行代码、shell 命令或项目脚本的命令，还应检查 [`browser.api.allowExec`](/config/browser/api#api-allowexec) 和 [`api.allowExec`](/config/api#api-allowexec)。

例如，如果你创建自己的文件写入命令而不是使用 Vitest 内置的 `writeFile`，请应用相同的检查：

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { normalizePath } from 'vite'
import { isFileLoadingAllowed } from 'vitest/node'
import type { BrowserCommand } from 'vitest/node'

function assertFileAccess(path: string, project: any) {
  if (
    !isFileLoadingAllowed(project.vite.config, path)
    && !isFileLoadingAllowed(project.vitest.vite.config, path)
  ) {
    throw new Error(`Access denied to "${path}".`)
  }
}

function assertWrite(project: any) {
  if (!project.config.browser.api.allowWrite || !project.vitest.config.api.allowWrite) {
    throw new Error('Writing files is disabled.')
  }
}

export const myWriteFileCommand: BrowserCommand<[path: string, content: string]> = async (
  { project },
  path,
  content,
) => {
  assertWrite(project)

  const file = resolve(project.config.root, path)
  assertFileAccess(normalizePath(file), project)

  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content)
}
```

:::

### 记录 trace 标记

自定义命令可以通过 `context.mark` 为触发它们的测试记录 [trace 标记](/api/browser/context#mark)。这相当于服务端的 `page.mark`，并有助于在 [trace 视图](/guide/browser/trace-view) 中标注命令内部执行的自定义操作。

```ts
import type { BrowserCommand } from 'vitest/node'

export const uploadFixture: BrowserCommand<[name: string]> = async (
  context,
  name,
) => {
  await context.mark(`上传开始：${name}`, { kind: 'action' })
  // ... 执行服务端工作
  await context.mark(`上传完成：${name}`, { kind: 'action' })
}
```

当未启用浏览器追踪或当前会话中没有正在运行的测试时，`context.mark` 不会执行任何操作。与 `page.mark` 不同，它不接受回调形式。

### 自定义 `playwright` 命令

Vitest 在命令上下文上暴露了几个 `playwright` 特定的属性。

- `page` 引用包含测试 iframe 的完整页面。这是编排器 HTML，你最好不要触碰它以免破坏事物。
- `frame` 是一个异步方法，将解析测试器 [`Frame`](https://playwright.dev/docs/api/class-frame)。它具有与 `page` 类似的 API，但不支持某些方法。如果你需要查询元素，应该优先使用 `context.iframe`，因为它更稳定且更快。
- `iframe` 是一个 [`FrameLocator`](https://playwright.dev/docs/api/class-framelocator)，应用于查询页面上的其他元素。
- `context` 指的是唯一的 [BrowserContext](https://playwright.dev/docs/api/class-browsercontext)。

```ts
import { BrowserCommand } from 'vitest/node'

export const myCommand: BrowserCommand<[string, number]> = async (
  ctx,
  arg1: string,
  arg2: number
) => {
  if (ctx.provider.name === 'playwright') {
    const element = await ctx.iframe.findByRole('alert')
    const screenshot = await element.screenshot()
    // 对截图执行某些操作
    return difference
  }
}
```

### 自定义 `webdriverio` 命令

Vitest 在上下文对象上暴露了一些 `webdriverio` 特定的属性。

- `browser` 是 `WebdriverIO.Browser` API。

Vitest 会在调用命令之前通过调用 `browser.switchFrame` 自动将 `webdriver` 上下文切换到测试 iframe，因此 `$` 和 `$$` 方法指的是 iframe 内部的元素，而不是编排器中的元素，但非 webdriver API 仍将引用父框架上下文。
