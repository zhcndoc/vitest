---
title: 常见错误 | 指南
---

# 常见错误

## 无法找到模块 './relative-path'

如果你收到模块无法找到的错误，这可能意味着几种不同的情况：

1. 你拼错了路径。确保路径是正确的。

2. 你可能依赖了 `tsconfig.json` 中的 `baseUrl`。Vite 默认不考虑 `tsconfig.json`，所以如果你依赖这种行为，可能需要自己安装 [`vite-tsconfig-paths`](https://npmx.dev/package/vite-tsconfig-paths)。

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()]
})
```

或者重写你的路径，使其不相对于根目录：

```diff
- import helpers from 'src/helpers'
+ import helpers from '../src/helpers'
```

3. 确保你没有相对 [别名](/config/alias)。Vite 将它们视为相对于导入所在的文件，而不是根目录。

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      '@/': './src/', // [!code --]
      '@/': new URL('./src/', import.meta.url).pathname, // [!code ++]
    }
  }
})
```

## 无法终止 Worker

当 NodeJS 的 `fetch` 与 [`pool: 'threads'`](/config/pool#threads) 一起使用时，可能会发生此错误。详见 [#3077](https://github.com/vitest-dev/vitest/issues/3077)。

默认的 [`pool: 'forks'`](/config/pool#forks) 没有这个问题。如果你显式设置了 `pool: 'threads'`，切换回 `'forks'` 或使用 [`'vmForks'`](/config/pool#vmforks) 将解决它。

## 自定义 package 条件未解析

如果你在 `package.json` 的 [exports](https://nodejs.org/api/packages.html#package-entry-points) 或 [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) 中使用了自定义条件，你可能会发现 Vitest 默认不尊重这些条件。

例如，如果你的 `package.json` 中有以下内容：

```json
{
  "exports": {
    ".": {
      "custom": "./lib/custom.js",
      "import": "./lib/index.js"
    }
  },
  "imports": {
    "#internal": {
      "custom": "./src/internal.js",
      "default": "./lib/internal.js"
    }
  }
}
```

默认情况下，Vitest 只会使用 `import` 和 `default` 条件。要使 Vitest 尊重自定义条件，你需要在 Vitest 配置中配置 [`ssr.resolve.conditions`](https://vite.dev/config/ssr-options#ssr-resolve-conditions)：

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  ssr: {
    resolve: {
      conditions: ['custom', 'import', 'default'],
    },
  },
})
```

::: tip 为什么是 `ssr.resolve.conditions` 而不是 `resolve.conditions`？
Vitest 遵循 Vite 的配置约定：
- [`resolve.conditions`](https://vite.dev/config/shared-options#resolve-conditions) 适用于 Vite 的 `client` 环境，对应于 Vitest 的 browser 模式、jsdom、happy-dom 或带有 `viteEnvironment: 'client'` 的自定义环境。
- [`ssr.resolve.conditions`](https://vite.dev/config/ssr-options#ssr-resolve-conditions) 适用于 Vite 的 `ssr` 环境，对应于 Vitest 的 node 环境或带有 `viteEnvironment: 'ssr'` 的自定义环境。

由于 Vitest 默认为 `node` 环境（使用 `viteEnvironment: 'ssr'`），模块解析使用 `ssr.resolve.conditions`。这适用于 package exports 和 subpath imports。

你可以在 [`environment`](/config/environment) 中了解更多关于 Vite 环境和 Vitest 环境的信息。
:::

## 段错误和原生代码错误

在 `pool: 'threads'` 中运行 [原生 NodeJS 模块](https://nodejs.org/api/addons.html) 可能会遇到来自原生代码的神秘错误。

- `Segmentation fault (core dumped)`
- `thread '<unnamed>' panicked at 'assertion failed`
- `Abort trap: 6`
- `internal error: entered unreachable code`

在这些情况下，原生模块可能不是为多线程安全构建的。作为变通方法，你可以切换到 `pool: 'forks'`，它在多个 `node:child_process` 中运行测试用例，而不是多个 `node:worker_threads`。

::: code-group
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
  },
})
```
```bash [CLI]
vitest --pool=forks
```
:::

## 未处理的 Promise 拒绝

当 Promise 被拒绝但在微任务队列刷新之前没有附加 `.catch()` 处理程序或 `await` 时，会发生此错误。这种行为来自 JavaScript 本身，并非 Vitest 特有。请在 [Node.js 文档](https://nodejs.org/api/process.html#event-unhandledrejection) 中了解更多。

一个常见的原因是在没有 `await` 的情况下调用异步函数：

```ts
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) {
    throw new Error(`用户 ${id} 未找到`) // [!code highlight]
  }
  return res.json()
}

test('fetches user', async () => {
  fetchUser(123) // [!code error]
})
```

因为 `fetchUser()` 没有被 `await`，它的拒绝没有处理程序，Vitest 报告：

```
Unhandled Rejection: Error: 用户 123 未找到
```

### 修复

`await` 该 promise 以便 Vitest 可以捕获错误：

```ts
test('fetches user', async () => {
  await fetchUser(123) // [!code ++]
})
```

如果你期望调用抛出错误，使用 [`expect().rejects`](/api/expect#rejects)：

```ts
test('rejects for missing user', async () => {
  await expect(fetchUser(123)).rejects.toThrow('User 123 not found')
})
```

## 包在 Vitest 中加载失败，但在你的应用中可以正常工作

有些包在应用构建中可以正常工作，但在 Vitest 中会失败，因为它们只有在打包器重写或解析之后才是有效的。当 Vitest 将依赖外部化时，Node.js 会直接加载它，因此会应用 Node 的 ESM 和 package 规则。有关精确规则，请参阅 Node.js 文档中关于 [ECMAScript 模块](https://nodejs.org/docs/latest/api/esm.html) 和 [packages](https://nodejs.org/docs/latest/api/packages.html) 的说明。

常见示例包括以下包：

- 在 `.js` 文件中提供 ESM 语法，但没有 `"type": "module"`
- 在 ESM 文件中使用不带扩展名的相对导入
- `exports`、`imports`、`main` 或 `module` 条目不正确
- 以只有在打包后才可工作的方式混用 CommonJS 和 ESM 入口点
- 导入 CSS 或其他非 JavaScript 文件，而这些文件本应由打包器处理

你可能会看到如下错误：

- `Cannot find module './relative-path' imported from ...`
- `Unexpected token 'export'`
- `Cannot use import statement outside a module`
- `Module ... seems to be an ES Module but shipped in a CommonJS package.`
- `Unknown file extension ".css"`

在可能的情况下，修复该包，使 Node.js 能够直接加载它：为 ESM `.js` 文件添加 `"type": "module"`，使用 `.mjs`，在 ESM 导入中包含显式文件扩展名，并确保 `exports` 指向 Node.js 可以加载的文件。

如果你无法修复包本身，可以将其内联，这样 Vite 就会处理它，而不是将其作为外部依赖传递给 Node.js。将导致无效包的整条依赖链都内联。如果你的源码导入了 `wrapper-package`，而 `wrapper-package` 又导入了 `broken-package`，则两个包都需要内联：

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['wrapper-package', 'broken-package'],
      },
    },
  },
})
```

你也可以使用 Vite 的 [`ssr.resolve.noExternal`](https://vite.dev/config/ssr-options#ssr-resolve-noexternal) 达到同样的目的。Vitest 会将 `ssr.resolve.noExternal` 合并到 [`server.deps.inline`](/config/server#server-deps-inline) 中，因此当该依赖还需要在 SSR 构建中由 Vite 打包时，这很有用：

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  ssr: {
    resolve: {
      noExternal: ['wrapper-package', 'broken-package'],
    },
  },
})
```
