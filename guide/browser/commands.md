---
title: Commands | Browser Mode
outline: deep
---

# Commands

命令是一个函数，它调用服务器上的另一个函数并将结果传递回浏览器。Vitest 公开了几个可以在浏览器测试中使用的内置命令。

## 内置命令

### 文件处理

在浏览器端的测试中，你可以通过 `readFile` 、`writeFile` 和 `removeFile` 这些 API 来操作文件。从 Vitest 3.2 版本起，所有文件路径都会相对于 [项目](/guide/projects) 根目录解析（默认为 `process.cwd()`，除非你手动修改过）。在此之前，路径是以测试文件所在位置作为基准进行解析的。

默认情况下，Vitest 使用 `utf-8` 编码，但你可以使用选项覆盖它。

::: tip
此 API 遵循 [`server.fs`](https://vitejs.dev/config/server-options.html#server-fs-allow) 出于安全原因的限制。
:::

```ts
import { server } from '@vitest/browser/context'

const { readFile, writeFile, removeFile } = server.commands

it('handles files', async () => {
  const file = './test.txt'

  await writeFile(file, 'hello world')
  const content = await readFile(file)

  expect(content).toBe('hello world')

  await removeFile(file)
})
```

## CDP Session

Vitest 通过 `@vitest/browser/context` 中导出的 `cdp` 方法访问原始 Chrome Devtools 协议。它主要用于库作者在其基础上构建工具。

```ts
import { cdp } from '@vitest/browser/context'

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
CDP session仅适用于 `playwright` provider，并且仅在使用 `chromium` 浏览器时有效。有关详细信息，请参阅 playwright 的 [`CDPSession`](https://playwright.dev/docs/api/class-cdpsession)文档。
:::

## Custom Commands

我们也可以通过 [`browser.commands`](/guide/browser/config#browser-commands) 配置选项添加自己的命令。如果我们正在开发一个库，可以通过插件内的`config`钩子来提供它们：

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

然后，你可以通过从 `@vitest/brower/context` 导入它，在测试中调用它：

```ts
import { commands } from '@vitest/browser/context'
import { expect, test } from 'vitest'

test('custom command works correctly', async () => {
  const result = await commands.myCustomCommand('test1', 'test2')
  expect(result).toEqual({ someValue: true })
})

// 如果你使用 TypeScript，你可以扩展模块。
declare module '@vitest/browser/context' {
  interface BrowserCommands {
    myCustomCommand: (arg1: string, arg2: string) => Promise<{
      someValue: true
    }>
  }
}
```

::: warning
如果自定义命令具有相同的名称，则它们将覆盖内置命令。
:::

### 自定义命令 `playwright`

Vitest 在命令上下文中公开了几个`playwright`特定属性。

- `page`引用包含测试 iframe 的完整页面。这是协调器 HTML，为避免出现问题，最好不要碰它。
- `frame` 是一个异步方法，用于解析测试器 [`Frame`](https://playwright.dev/docs/api/class-frame)。它的 API 与 `page` 类似，但不支持某些方法。如果您需要查询元素，应优先使用 `context.iframe` 代替，因为它更稳定、更快速。
- `iframe` 是一个 [`FrameLocator`](https://playwright.dev/docs/api/class-framelocator)，用于查询页面上的其他元素。
- `context` 是指唯一的[BrowserContext](https://playwright.dev/docs/api/class-browsercontext)。

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
    // 对截图进行一些操作。
    return difference
  }
}
```

::: tip
如果我们使用的是 TypeScript ，请不要忘记在我们的 [setup 文件](/config/#setupfile)或 [config 文件](/config/) 中引用 `@vitest/browser/providers/playwright` ，以便在配置以及 `userEvent` 和 `page` 选项中获得自动补全功能。

```ts
/// <reference types="@vitest/browser/providers/playwright" />
```
:::

### 自定义命令 `webdriverio`

Vitest 在上下文对象上公开了一些 `webdriverio` 特有属性。

- `browser` 是 `WebdriverIO.Browser` API.

Vitest 通过在调用命令前调用 `browser.switchToFrame` 自动将 `webdriver` 上下文切换到测试 iframe，因此 `$` 和 `$` 方法将引用 iframe 内的元素，而不是 orchestrator 中的元素，但非 Webdriver API 仍将引用 parent frame 上下文。

::: tip
如果我们使用的是 TypeScript，请记得在您的 [setup 文件](/config/#setupfile)或 [config 文件](/config/)中引用 `@vitest/browser/providers/webdriverio` ，以便获得自动补全功能。

```ts
/// <reference types="@vitest/browser/providers/webdriverio" />
```
:::
