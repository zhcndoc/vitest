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
出于安全原因，此 API 遵循 [`server.fs`](https://vitejs.dev/config/server-options.html#server-fs-allow) 限制。

如果 [`browser.api.allowWrite`](/config/browser/api) 或 [`api.allowWrite`](/config/api#api-allowwrite) 被禁用，`writeFile` 和 `removeFile` 函数将不会执行任何操作。
:::

```ts
import { server } from 'vitest/browser'

const { readFile, writeFile, removeFile } = server.commands

it('handles files', async () => {
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
CDP 会话仅适用于 `playwright` 提供者，且仅在使用 `chromium` 浏览器时有效。你可以在 playwright 的 [`CDPSession`](https://playwright.dev/docs/api/class-cdpsession) 文档中阅读更多关于它的信息。
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

test('custom command works correctly', async () => {
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
