---
title: 测试过滤 | 指南
---

# 测试过滤

套件和测试的过滤、超时和并发

## 命令行

你可以使用命令行按名称过滤测试文件：

```bash
$ vitest basic
```

将只执行包含 `basic` 的测试文件，例如：

```
basic.test.ts
basic-foo.test.ts
basic/foo.test.ts
```

你也可以使用 `-t, --testNamePattern <pattern>` 选项按全名过滤测试。当你想要按文件内定义的名称而不是文件名本身进行过滤时，这很有用。

自 Vitest 3 起，你还可以通过文件名和行号指定测试：

```bash
$ vitest basic/foo.test.ts:10
```

::: warning
注意，Vitest 需要完整文件名才能使此功能正常工作。它可以相对于当前工作目录，也可以是绝对文件路径。

```bash
$ vitest basic/foo.js:10 # ✅
$ vitest ./basic/foo.js:10 # ✅
$ vitest /users/project/basic/foo.js:10 # ✅
$ vitest foo:10 # ❌
$ vitest ./basic/foo:10 # ❌
```

目前 Vitest 也不支持范围：

```bash
$ vitest basic/foo.test.ts:10, basic/foo.test.ts:25 # ✅
$ vitest basic/foo.test.ts:10-25 # ❌
```
:::

## 指定超时时间

你可以选择将毫秒级的超时时间作为第三个参数传递给测试。默认值是 [5 秒](/config/testtimeout)。

```ts
import { test } from 'vitest'

test('name', async () => { /* ... */ }, 1000)
```

钩子也可以接收超时时间，默认同样是 5 秒。

```ts
import { beforeAll } from 'vitest'

beforeAll(async () => { /* ... */ }, 1000)
```

## 跳过套件和测试

使用 `.skip` 以避免运行某些套件或测试

```ts
import { assert, describe, it } from 'vitest'

describe.skip('skipped suite', () => {
  it('test', () => {
    // 套件已跳过，无错误
    assert.equal(Math.sqrt(4), 3)
  })
})

describe('suite', () => {
  it.skip('skipped test', () => {
    // 测试已跳过，无错误
    assert.equal(Math.sqrt(4), 3)
  })
})
```

## 过滤标签

如果你的测试定义了 [标签](/guide/test-tags)，你可以使用 `--tags-filter` 选项过滤测试：

```ts
test('renders a form', { tags: ['frontend'] }, () => {
  // ...
})

test('calls an external API', { tags: ['backend'] }, () => {
  // ...
})
```

```shell
vitest --tags-filter=frontend
```

## 选择要运行的套件和测试

使用 `.only` 仅运行某些套件或测试

```ts
import { assert, describe, it } from 'vitest'

// 仅运行此套件（以及其他标记为 only 的套件）
describe.only('suite', () => {
  it('test', () => {
    assert.equal(Math.sqrt(4), 3)
  })
})

describe('another suite', () => {
  it('skipped test', () => {
    // 测试已跳过，因为测试正在仅运行模式下运行
    assert.equal(Math.sqrt(4), 3)
  })

  it.only('test', () => {
    // 仅运行此测试（以及其他标记为 only 的测试）
    assert.equal(Math.sqrt(4), 2)
  })
})
```

使用文件过滤和行号运行 Vitest：

```shell
vitest ./test/example.test.ts:5
```

```ts:line-numbers
import { assert, describe, it } from 'vitest'

describe('suite', () => {
  // 仅运行此测试
  it('test', () => {
    assert.equal(Math.sqrt(4), 3)
  })
})
```

## 未实现的套件和测试

使用 `.todo` 存根应该实现的套件和测试

```ts
import { describe, it } from 'vitest'

// 报告中将显示此套件的条目
describe.todo('unimplemented suite')

// 报告中将显示此测试的条目
describe('suite', () => {
  it.todo('unimplemented test')
})
```
