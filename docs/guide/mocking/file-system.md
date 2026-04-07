# 模拟文件系统

模拟文件系统可确保测试不依赖于实际的文件系统，从而使测试更可靠、可预测。这种隔离有助于避免来自先前测试的副作用。它允许测试错误条件和边缘情况，这些情况在实际文件系统中可能难以或无法复制，例如权限问题、磁盘已满场景或读/写错误。

Vitest 没有提供任何开箱即用的文件系统模拟 API。你可以使用 `vi.mock` 手动模拟 `fs` 模块，但这很难维护。相反，我们推荐使用 [`memfs`](https://npmx.dev/package/memfs) 来为你完成这项工作。`memfs` 创建一个内存文件系统，它在不接触实际磁盘的情况下模拟文件系统操作。这种方法快速且安全，避免了对真实文件系统的任何潜在副作用。

## 示例

要自动将每个 `fs` 调用重定向到 `memfs`，你可以在项目根目录下创建 `__mocks__/fs.cjs` 和 `__mocks__/fs/promises.cjs` 文件：

::: code-group
```ts [__mocks__/fs.cjs]
// 我们也可以使用 `import`，但那样
// 每个导出都应该显式定义

const { fs } = require('memfs')
module.exports = fs
```

```ts [__mocks__/fs/promises.cjs]
// 我们也可以使用 `import`，但那样
// 每个导出都应该显式定义

const { fs } = require('memfs')
module.exports = fs.promises
```
:::

```ts [read-hello-world.js]
import { readFileSync } from 'node:fs'

export function readHelloWorld(path) {
  return readFileSync(path, 'utf-8')
}
```

```ts [hello-world.test.js]
import { beforeEach, expect, it, vi } from 'vitest'
import { fs, vol } from 'memfs'
import { readHelloWorld } from './read-hello-world.js'

// 告诉 vitest 使用来自 __mocks__ 文件夹的 fs 模拟
// 如果应该始终模拟 fs，这可以在 setup 文件中完成
vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  // 重置内存文件系统的状态
  vol.reset()
})

it('should return correct text', () => {
  const path = '/hello-world.txt'
  fs.writeFileSync(path, 'hello world')

  const text = readHelloWorld(path)
  expect(text).toBe('hello world')
})

it('can return a value multiple times', () => {
  // 你可以使用 vol.fromJSON 来定义多个文件
  vol.fromJSON(
    {
      './dir1/hw.txt': 'hello dir1',
      './dir2/hw.txt': 'hello dir2',
    },
    // 默认 cwd
    '/tmp',
  )

  expect(readHelloWorld('/tmp/dir1/hw.txt')).toBe('hello dir1')
  expect(readHelloWorld('/tmp/dir2/hw.txt')).toBe('hello dir2')
})
```
