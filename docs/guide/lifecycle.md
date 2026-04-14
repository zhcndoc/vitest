---
title: 测试运行生命周期 | 指南
outline: deep
---

# 测试运行生命周期

::: tip
正在寻找 `beforeEach`、`afterEach` 和其他钩子的实用入门介绍？请参阅 [Setup and Teardown](/guide/learn/setup-teardown) 教程。
:::

理解测试运行生命周期对于编写有效的测试、调试问题以及优化测试套件至关重要。本指南介绍了 Vitest 中不同生命周期阶段何时以及以何种顺序发生，从初始化到清理。

## 概述

典型的 Vitest 测试运行会经历以下主要阶段：

1. **初始化**：配置加载和项目设置
2. **全局设置**：在任何测试运行之前的一次性设置
3. **Worker 创建**：根据 [pool](/config/pool) 配置生成测试 worker
4. **测试文件收集**：发现并组织测试文件
5. **测试执行**：测试与其钩子和断言一起运行
6. **报告**：收集并报告结果
7. **全局清理**：所有测试完成后的最终清理

阶段 4–6 为每个测试文件运行一次，因此在整个测试套件中它们将执行多次，并且当你使用多于 [1 个 worker](/config/maxworkers) 时，它们也可能在不同文件之间并行运行。

## 详细生命周期阶段

### 1. 初始化阶段

当你运行 `vitest` 时，框架首先加载你的配置并准备测试环境。

**发生什么：**
- 解析 [命令行](/guide/cli) 参数
- 加载 [配置文件](/config/)
- 验证项目结构

如果配置文件或其导入之一发生更改，此阶段可以再次运行。

**范围：** 主进程（在任何测试 worker 创建之前）

### 2. 全局设置阶段

如果你配置了 [`globalSetup`](/config/globalsetup) 文件，它们会在任何测试 worker 创建之前运行一次。

**发生什么：**
- 全局设置文件中的 `setup()` 函数（或导出的 `default` 函数）按顺序执行
- 多个全局设置文件按定义顺序运行

**范围：** 主进程（与测试 worker 分离）

**重要说明：**
- 全局设置在与测试**不同的全局范围**中运行
- 测试无法访问全局设置中定义的变量（使用 [`provide`/`inject`](/config/provide) 代替）
- 只有当至少有一个测试排队时，全局设置才会运行

```ts [globalSetup.ts]
export function setup(project) {
  // 在所有测试之前运行一次
  console.log('Global setup')

  // 与测试共享数据
  project.provide('apiUrl', 'http://localhost:3000')
}

export function teardown() {
  // 在所有测试之后运行一次
  console.log('Global teardown')
}
```

### 3. Worker 创建阶段

全局设置完成后，Vitest 根据你的 [池配置](/config/pool) 创建测试 worker。

**发生什么：**
- 根据 `browser.enabled` 或 `pool` 设置生成 Worker（`threads`、`forks`、`vmThreads` 或 `vmForks`）
- 每个 Worker 都有自己的隔离环境（除非禁用 [隔离](/config/isolate)）
- 默认情况下，为了提供隔离，Worker 不会被复用。只有在以下情况下才会复用 Worker：
  - 禁用 [隔离](/config/isolate)
  - 或者池是 `vmThreads` 或 `vmForks`，因为 [VM](https://nodejs.org/api/vm.html) 提供了足够的隔离

**范围：** Worker 进程/线程

### 4. 测试文件设置阶段

在每个测试文件运行之前，执行 [设置文件](/config/setupfiles)。

**发生什么：**
- 设置文件与测试在同一进程中运行
- 默认情况下，设置文件**并行**运行（可通过 [`sequence.setupFiles`](/config/sequence#sequence-setupfiles) 配置）
- 设置文件在**每个测试文件**之前执行
- 任何全局_状态_或配置都可以在此处初始化

**范围：** Worker 进程（与测试相同）

**重要说明：**
- 如果禁用 [隔离](/config/isolate)，设置文件仍会在每个测试文件之前重新运行以触发副作用，但导入的模块会被缓存
- 编辑设置文件会触发 watch 模式下所有测试的重新运行

```ts [setupFile.ts]
import { afterEach } from 'vitest'

// 在每个测试文件之前运行
console.log('Setup file executing')

// 注册适用于所有测试的钩子
afterEach(() => {
  cleanup()
})
```

### 5. 测试收集和执行阶段

这是测试实际运行的主要阶段。

#### 测试文件执行顺序

测试文件根据你的配置执行：

- 在 worker 内默认**顺序**执行
- 文件将在不同 worker 之间**并行**运行，由 [`maxWorkers`](/config/maxworkers) 配置
- 顺序可以通过 [`sequence.shuffle`](/config/sequence#sequence-shuffle) 随机化，或通过 [`sequence.sequencer`](/config/sequence#sequence-sequencer) 微调
- 长时间运行的测试通常更早开始（基于缓存），除非启用了 shuffle

#### 在每个测试文件内

执行遵循以下顺序：

1. **文件级代码：** 所有 `describe` 块之外的代码立即运行
2. **测试收集：** 处理 `describe` 块，测试作为导入测试文件的副作用被注册
3. **[`aroundAll`](/api/hooks#aroundall) 钩子：** 包裹套件中的所有测试（必须调用 `runSuite()`）
4. **[`beforeAll`](/api/hooks#beforeall) 钩子：** 在套件中的任何测试之前运行一次
5. **对于每个测试：**
   - [`aroundEach`](/api/hooks#aroundeach) 钩子包裹测试（必须调用 `runTest()`）
   - `beforeEach` 钩子执行（按定义顺序，或基于 [`sequence.hooks`](/config/sequence#sequence-hooks)）
   - 测试函数执行
   - `afterEach` 钩子执行（默认逆序，使用 `sequence.hooks: 'stack'`）
   - [`onTestFinished`](/api/hooks#ontestfinished) 回调运行（始终逆序）
   - 如果测试失败：[`onTestFailed`](/api/hooks#ontestfailed) 回调运行
   - 注意：如果设置了 `repeats` 或 `retry`，所有这些步骤将再次执行
6. **[`afterAll`](/api/hooks#afterall) 钩子：** 在套件中的所有测试完成后运行一次

**示例执行流程：**

```ts
// 这立即运行（收集阶段）
console.log('File loaded')

describe('User API', () => {
  // 这立即运行（收集阶段）
  console.log('Suite defined')

  aroundAll(async (runSuite) => {
    // 包裹此套件中的所有测试
    console.log('aroundAll before')
    await runSuite()
    console.log('aroundAll after')
  })

  beforeAll(() => {
    // 在此套件中的所有测试之前运行一次
    console.log('beforeAll')
  })

  aroundEach(async (runTest) => {
    // 包裹每个测试
    console.log('aroundEach before')
    await runTest()
    console.log('aroundEach after')
  })

  beforeEach(() => {
    // 在每个测试之前运行
    console.log('beforeEach')
  })

  test('creates user', () => {
    // 测试执行
    console.log('test 1')
  })

  test('updates user', () => {
    // 测试执行
    console.log('test 2')
  })

  afterEach(() => {
    // 在每个测试之后运行
    console.log('afterEach')
  })

  afterAll(() => {
    // 在此套件中的所有测试之后运行一次
    console.log('afterAll')
  })
})

// 输出：
// File loaded
// Suite defined
// aroundAll before
//   beforeAll
//   aroundEach before
//     beforeEach
//       test 1
//     afterEach
//   aroundEach after
//   aroundEach before
//     beforeEach
//       test 2
//     afterEach
//   aroundEach after
//   afterAll
// aroundAll after
```

#### 嵌套套件

使用嵌套 `describe` 块时，钩子遵循层次模式。`aroundAll` 和 `aroundEach` 钩子包裹它们各自的范围，父钩子包裹子钩子：

```ts
describe('outer', () => {
  aroundAll(async (runSuite) => {
    console.log('outer aroundAll before')
    await runSuite()
    console.log('outer aroundAll after')
  })

  beforeAll(() => console.log('outer beforeAll'))

  aroundEach(async (runTest) => {
    console.log('outer aroundEach before')
    await runTest()
    console.log('outer aroundEach after')
  })

  beforeEach(() => console.log('outer beforeEach'))

  test('outer test', () => console.log('outer test'))

  describe('inner', () => {
    aroundAll(async (runSuite) => {
      console.log('inner aroundAll before')
      await runSuite()
      console.log('inner aroundAll after')
    })

    beforeAll(() => console.log('inner beforeAll'))

    aroundEach(async (runTest) => {
      console.log('inner aroundEach before')
      await runTest()
      console.log('inner aroundEach after')
    })

    beforeEach(() => console.log('inner beforeEach'))

    test('inner test', () => console.log('inner test'))

    afterEach(() => console.log('inner afterEach'))
    afterAll(() => console.log('inner afterAll'))
  })

  afterEach(() => console.log('outer afterEach'))
  afterAll(() => console.log('outer afterAll'))
})

// 输出：
// outer aroundAll before
//   outer beforeAll
//   outer aroundEach before
//     outer beforeEach
//       outer test
//     outer afterEach
//   outer aroundEach after
//   inner aroundAll before
//     inner beforeAll
//     outer aroundEach before
//       inner aroundEach before
//         outer beforeEach
//           inner beforeEach
//             inner test
//           inner afterEach
//         outer afterEach
//       inner aroundEach after
//     outer aroundEach after
//     inner afterAll
//   inner aroundAll after
//   outer afterAll
// outer aroundAll after
```

#### 并发测试

当使用 `test.concurrent` 或 [`sequence.concurrent`](/config/sequence#sequence-concurrent) 时：

- 同一文件内的测试可以并行运行
- 每个并发测试仍然运行其自己的 `beforeEach` 和 `afterEach` 钩子
- 使用 [测试上下文](/guide/test-context) 进行并发快照：`test.concurrent('name', async ({ expect }) => {})`

### 6. 报告阶段

在整个测试运行过程中，报告器接收生命周期事件并显示结果。

**发生什么：**
- 报告器在测试进行时接收事件
- 结果被收集和格式化
- 生成测试摘要
- 生成覆盖率报告（如果启用）

有关报告器生命周期的详细信息，请参阅 [报告器](/api/advanced/reporters) 指南。

### 7. 全局清理阶段

所有测试完成后，全局清理函数执行。

**发生什么：**
- [`globalSetup`](/config/globalsetup) 文件中的 `teardown()` 函数运行
- 多个清理函数按其设置的**逆序**运行
- 在 watch 模式下，清理在进程退出前运行，而不是在测试重新运行之间

**范围：** 主进程

```ts [globalSetup.ts]
export function teardown() {
  // 清理全局资源
  console.log('Global teardown complete')
}
```

## 不同作用域中的生命周期

了解代码执行的位置对于避免常见陷阱至关重要：

| 阶段 | 作用域 | 访问测试上下文 | 运行次数 |
|-------|-------|----------------------|------|
| 配置文件 | 主进程 | ❌ 否 | 每次 Vitest 运行一次 |
| 全局设置 | 主进程 | ❌ 否（使用 `provide`/`inject`） | 每次 Vitest 运行一次 |
| 设置文件 | 工作线程（与测试相同） | ✅ 是 | 每个测试文件之前 |
| 文件级代码 | 工作线程 | ✅ 是 | 每个测试文件一次 |
| `aroundAll` | 工作线程 | ✅ 是 | 每个套件一次（包裹所有测试） |
| `beforeAll` / `afterAll` | 工作线程 | ✅ 是 | 每个套件一次 |
| `aroundEach` | 工作线程 | ✅ 是 | 每个测试（包裹每个测试） |
| `beforeEach` / `afterEach` | 工作线程 | ✅ 是 | 每个测试 |
| 测试函数 | 工作线程 | ✅ 是 | 一次（重试/重复时可能多次） |
| 全局清理 | 主进程 | ❌ 否 | 每次 Vitest 运行一次 |

## 监视模式生命周期

在监视模式下，生命周期会重复，但有一些区别：

1. **初始运行**：完整的生命周期，如上所述
2. **文件变更时**：
   - 新的 [测试运行](/api/advanced/reporters#ontestrunstart) 开始
   - 仅重新运行受影响的测试文件
   - [设置文件](/config/setupfiles) 会为这些测试文件再次运行
   - [全局设置](/config/globalsetup) **不会**重新运行（使用 [`project.onTestsRerun`](/config/globalsetup#handling-test-reruns) 处理特定于重新运行的逻辑）
3. **退出时**：
   - 执行全局清理
   - 进程终止

## 性能考量

了解生命周期有助于优化测试性能：

- **全局设置** 适合用于昂贵的一次性操作（数据库种子数据、服务器启动）
- **设置文件** 在每个测试文件之前运行 - 如果你有很多测试文件，请避免在此处进行繁重操作
- 对于不需要隔离的昂贵设置，**`beforeAll`** 比 `beforeEach` 更好
- **禁用 [隔离](/config/isolate)** 可以提高性能，但设置文件仍然会在每个文件之前执行
- **[池配置](/config/pool)** 影响并行化和可用的 API

有关如何提高性能的技巧，请阅读 [提高性能](/guide/improving-performance) 指南。

## 相关文档

- [全局设置配置](/config/globalsetup)
- [设置文件配置](/config/setupfiles)
- [测试排序选项](/config/sequence)
- [隔离配置](/config/isolate)
- [池配置](/config/pool)
- [扩展报告器](/guide/advanced/reporters) - 用于报告器生命周期事件
- [测试 API 参考](/api/hooks) - 用于钩子 API
