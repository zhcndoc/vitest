---
title: 调试 | 指南
---

# 调试

:::tip
调试测试时，你可能想要使用以下选项：

- [`--test-timeout=0`](/guide/cli#testtimeout) 防止在断点处停止时测试超时
- [`--no-file-parallelism`](/guide/cli#fileparallelism) 防止测试文件并行运行

:::

## VS Code

[官方 VS Code](https://vitest.dev/vscode) 扩展支持通过“Debug Tests”按钮调试测试。不过，Vitest 也提供了用于定义自定义配置的工具。

在 VS Code 中调试测试的最快方式是使用 `JavaScript Debug Terminal`。打开一个新的 `JavaScript Debug Terminal`，然后直接运行 `npm run test` 或 `vitest`。*这适用于在 Node 中运行的任何代码，因此也适用于大多数 JS 测试框架*

![image](https://user-images.githubusercontent.com/5594348/212169143-72bf39ce-f763-48f5-822a-0c8b2e6a8484.png)

你也可以在 VS Code 中添加专用的启动配置来调试测试文件：

```json
{
  // 更多信息，请访问：https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "smartStep": true,
      "console": "integratedTerminal"
    }
  ]
}
```

然后在调试标签页中，确保选中了 'Debug Current Test File'。然后你可以打开想要调试的测试文件并按下 F5 开始调试。

### 浏览器模式

调试浏览器测试的最简单方式是使用[官方 VS Code](https://vitest.dev/vscode) 扩展。

不过，你也可以在 CLI 中传入 `--inspect` 或 `--inspect-brk`，或者在 Vitest 配置中定义它：

::: code-group
```bash [CLI]
vitest --inspect-brk --browser --no-file-parallelism
```
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    inspectBrk: true,
    fileParallelism: false,
    browser: {
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
    },
  },
})
```
:::

默认情况下，Vitest 会使用端口 `9229` 作为调试端口。你可以通过在 `--inspect-brk` 中传递值来覆盖它：

```bash
vitest --inspect-brk=127.0.0.1:3000 --browser --no-file-parallelism
```

使用以下 [VSCode 复合配置](https://code.visualstudio.com/docs/editor/debugging#_compound-launch-configurations) 来启动 Vitest 并在浏览器中附加调试器：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run Vitest Browser",
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "console": "integratedTerminal",
      "args": ["--inspect-brk", "--browser", "--no-file-parallelism"]
    },
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach to Vitest Browser",
      "port": 9229
    }
  ],
  "compounds": [
    {
      "name": "Debug Vitest Browser",
      "configurations": ["Attach to Vitest Browser", "Run Vitest Browser"],
      "stopAll": true
    }
  ]
}
```

## IntelliJ IDEA

创建一个 [vitest](https://www.jetbrains.com/help/idea/vitest.html#createRunConfigVitest) 运行配置。使用以下设置以调试模式运行所有测试：

设置 | 值
 --- | ---
工作目录 | `/path/to/your-project-root`

然后以调试模式运行此配置。IDE 将在编辑器中设置的 JS/TS 断点处停止。

## Node 检查器，例如 Chrome DevTools

Vitest 也支持在没有 IDE 的情况下调试测试。但这要求测试不能并行运行。使用以下命令之一启动 Vitest。

```sh
# 在单个 worker 中运行
vitest --inspect-brk --no-file-parallelism

# 在浏览器模式下运行
vitest --inspect-brk --browser --no-file-parallelism
```

Vitest 启动后，它将停止执行并等待你打开可以连接到 [Node.js inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/) 的开发人员工具。你可以通过在浏览器中打开 `chrome://inspect` 来使用 Chrome DevTools 进行此操作。

在监视模式下，你可以通过使用 `--isolate false` 选项，在测试重新运行期间保持调试器打开。
