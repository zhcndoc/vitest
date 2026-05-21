---
title: 基于 Schema 的断言 | 配方
---

# 基于 Schema 的断言

如果你的项目已经使用 [Zod](https://zod.dev)、[Valibot](https://valibot.dev) 或 [ArkType](https://arktype.io) 验证数据，那么这些 schema 本身就已经描述了一个合法值应当是什么样子。把它们复用于测试中，比在 `toEqual` 和 `toMatchObject` 里重复编写形状检查更直接。

[`expect.schemaMatching`](/api/expect#expect-schemamatching) <Version>4.0.0</Version> 是一个非对称匹配器，它接受任意 [Standard Schema v1](https://standardschema.dev) 对象，并在值符合该 schema 时通过。

## 模式

```ts
import { expect, test } from 'vitest'
import { z } from 'zod'

test('email validation', () => {
  const user = { email: 'john@example.com' }

  expect(user).toEqual({
    email: expect.schemaMatching(z.string().email()),
  })
})
```

`expect.schemaMatching` 是一个非对称匹配器，因此它可以像 `expect.any` 或 `expect.stringMatching` 一样，组合到任何相等性检查中：

- `toEqual` / `toStrictEqual`
- `toMatchObject`
- `toContainEqual`
- `toThrow`
- `toHaveBeenCalledWith`
- `toHaveReturnedWith`
- `toHaveBeenResolvedWith`

## 适用于任何 Standard Schema 库

```ts
import { expect, test } from 'vitest'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'

const user = { email: 'john@example.com' }

// Zod
expect(user).toEqual({
  email: expect.schemaMatching(z.string().email()),
})

// Valibot
expect(user).toEqual({
  email: expect.schemaMatching(v.pipe(v.string(), v.email())),
})

// ArkType
expect(user).toEqual({
  email: expect.schemaMatching(type('string.email')),
})
```

## 验证调用参数

一种常见用法是断言某个 mock 被传入了符合 schema 的数据，而不必把每个字段都逐一写出来：

```ts
import { expect, test, vi } from 'vitest'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.date(),
})

test('persists a valid user', () => {
  const repo = { save: vi.fn() }
  registerUser(repo, { email: 'a@b.com' })

  expect(repo.save).toHaveBeenCalledWith(expect.schemaMatching(UserSchema))
})
```

当你已经为某个值定义了 schema，并且否则就需要手动写出每个属性时，就可以选择 `schemaMatching`。它对于 UUID 或时间戳这类生成字段的断言尤其有用，因为你可以验证格式，而不必预测精确值。

## 另请参阅

- [`expect.schemaMatching`](/api/expect#expect-schemamatching)
- [Standard Schema](https://standardschema.dev)
- [非对称匹配器](/api/expect)
