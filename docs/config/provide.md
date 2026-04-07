---
title: provide | 配置
outline: deep
---

# provide

- **类型：** `Partial<ProvidedContext>`

定义可以在测试内部使用 `inject` 方法访问的值。

:::code-group
```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    provide: {
      API_KEY: '123',
    },
  },
})
```
```ts [api.test.js]
import { expect, inject, test } from 'vitest'

test('api key is defined', () => {
  expect(inject('API_KEY')).toBe('123')
})
```
:::

::: warning
属性必须是字符串，且值需要是 [可序列化的](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types)，因为此对象将在不同进程之间传输。
:::

::: tip
如果你使用的是 TypeScript，你需要扩充 `ProvidedContext` 类型以实现类型安全的访问：

```ts [vitest.shims.d.ts]
declare module 'vitest' {
  export interface ProvidedContext {
    API_KEY: string
  }
}

// 将此文件标记为模块，以便扩充能正常工作
export {}
```
:::
