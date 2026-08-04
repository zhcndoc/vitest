---
title: 基准测试 | 指南
---

# 基准测试

Vitest 允许你使用来自[测试上下文](/guide/test-context)的 `bench` 固件，在测试旁编写基准测试。内置的基准测试提供程序由 [Tinybench](https://github.com/tinylibs/tinybench) 提供支持，基准测试定义在常规的 `test()` 调用中，因此你可以使用 Vitest 测试运行器的全部功能：重试、生命周期钩子、筛选和断言。

## 定义基准测试

使用 `bench` fixture 来定义一个基准测试。调用 `.run()` 来执行它：

```ts
import { expect, test } from 'vitest'

test('parsing performance', async ({ bench }) => {
  const result = await bench('parse', () => {
    JSON.parse('{"key":"value"}')
  }).run()
})
```

`bench()` 函数会注册一个基准测试，但不会执行它。调用 `.run()` 会运行该基准测试并返回结果。测试完成后，Vitest 会打印一个 [比较表](#comparing-benchmarks) 的单行版本（ops/sec、平均时间、百分位数等），因此你得到的单次基准测试输出与 `bench.compare()` 的输出是一致的。

::: warning
`bench` fixture 仅在匹配 [`benchmark.include`](/config/benchmark#benchmark-include) 的文件中可用（默认值：`**/*.{bench,benchmark}.?(c|m)[jt]s?(x)`）。在普通测试文件中使用 `{ bench }` 会抛出错误。

某个文件是否参与基准测试运行是由文件名决定的，而不是由测试是否使用 `bench` fixture 决定的。将 `parser.test.ts` 重命名为 `parser.bench.ts`（或调整 `benchmark.include`）才会把它移入基准测试项目。
:::

## 运行基准测试

基准测试文件由 [`benchmark.include`](/config/benchmark#benchmark-include) 匹配（默认值：`**/*.{bench,benchmark}.?(c|m)[jt]s?(x)`），并在独立于常规测试的专属项目中运行。根据你是想跳过基准测试、让它们与测试一起运行，还是单独运行，有三种运行方式。

### `vitest`（默认）

如果未启用 [`benchmark.enabled`](/config/benchmark#benchmark-enabled)，`vitest` 命令只会运行常规测试。基准测试文件会被完全忽略。这是默认设置，也是日常开发的正确选择，因为基准测试运行缓慢且会产生噪声，不应在每次保存时都运行。

### 启用 `benchmark.enabled` 的 `vitest`

在配置中设置 `benchmark.enabled: true`，即可让基准测试与常规测试一起运行：

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    benchmark: {
      enabled: true,
    },
  },
})
```

使用此配置时，`vitest` 会先运行常规测试，然后在一个单独的隔离组中运行基准测试（因此基准测试的执行绝不会与测试执行重叠，也不会给结果增加噪声）。当你希望在 CI 中使用一个命令同时验证正确性和性能时，这很有用。

### `vitest bench`

`bench` 子命令只运行基准测试，跳过常规测试：

```bash
vitest bench
```

这会在本次运行中隐式启用 `benchmark.enabled`，因此你无需在配置中设置它。与 `vitest` 命令一样，它也支持文件名过滤器以及 `-t`/`--testNamePattern` 来缩小运行范围：

```bash
# 仅运行文件名匹配 "parser" 的基准测试
vitest bench parser

# 仅运行测试名称匹配 "JSON" 的基准测试
vitest bench -t JSON
```

如需使用其他基准测试引擎或执行策略运行基准测试，请参阅[自定义基准测试提供程序](/guide/advanced/benchmark-provider)指南。

## 比较基准测试

使用 `bench.compare()` 来相互比较多个基准测试：

```ts
import { expect, test } from 'vitest'

test('compare JSON libraries', async ({ bench }) => {
  const input = '{"key":"value","nested":{"a":1}}'

  const result = await bench.compare(
    bench('JSON.parse', () => {
      JSON.parse(input)
    }),
    bench('custom parser', () => {
      customParse(input)
    }),
  )
})
```

在比较基准测试时，Vitest 会使用交错迭代来运行它们，以减少环境偏差（CPU 降频、GC 压力等），并在测试完成后打印一个比较表：

<<< ./snippets/benchmark-table.ansi

### 选项

你可以将 [选项](https://tinylibs.github.io/tinybench/interfaces/BenchOptions.html) 作为最后一个参数传给 `bench.compare()`：

```ts
test('compare with options', async ({ bench }) => {
  const result = await bench.compare(
    bench('lib1', () => { lib1() }),
    bench('lib2', () => { lib2() }),
    {
      iterations: 100,
      time: 1000,
    },
  )
})
```

你也可以像 `test()` 接受选项那样，将每个基准测试的 [选项](https://tinylibs.github.io/tinybench/interfaces/FnOptions.html) 作为第二个参数传入：

```ts
test('benchmarks with setup', async ({ bench }) => {
  const result = await bench.compare(
    bench('with-cache', () => {
      readFromCache()
    }),
    bench(
      'without-cache',
      { beforeEach: () => clearCache() },
      () => { readFromDisk() },
    ),
  )
})
```

## 跨项目比较

当你的工作区定义了多个项目（例如，不同的浏览器或运行时）时，在基准测试选项中传入 `perProject: true`，即可比较相同基准测试在所有项目中的表现。Vitest 仍会在当前项目中以内联方式打印结果，并且会在测试运行结束时额外收集每个项目的结果，汇总到一个比较表中。

```ts
import { test } from 'vitest'

test('simple example', async ({ bench }) => {
  await bench('1 + 1', { perProject: true }, () => {
    1 + 1
  }).run()
})
```

同一个测试文件会在每个项目中运行（chromium、firefox、webkit 等），Vitest 会对结果进行分组：

<<< ./snippets/benchmark-per-project.ansi

你也可以在 `bench.compare()` 中将 `perProject` 基准测试与常规基准测试混合使用：

```ts
test('compare implementations across browsers', async ({ bench }) => {
  await bench.compare(
    bench('JSON.parse', { perProject: true }, () => {
      JSON.parse('{"key":"value"}')
    }),
    bench('custom parser', () => {
      customParse('{"key":"value"}')
    }),
  )
})
```

在这种情况下，`custom parser` 会出现在每个项目的普通内联比较表中，而 `JSON.parse` 还会额外收集到最后的跨项目比较表中。

## 断言性能

使用 `toBeFasterThan()` 和 `toBeSlowerThan()` 匹配器来断言基准测试之间的相对性能：

```ts
import { expect, test } from 'vitest'

test('lib1 比 lib2 更快', async ({ bench }) => {
  const result = await bench.compare(
    bench('lib1', () => { lib1() }),
    bench('lib2', () => { lib2() }),
  )

  expect(result.get('lib1')).toBeFasterThan(result.get('lib2'))
})
```

`delta` 选项指定了断言通过所需的最小相对差异。这有助于避免由基准测试噪声引起的不稳定测试：

```ts
// lib1 必须至少比 lib2 快 10%
expect(result.get('lib1')).toBeFasterThan(result.get('lib2'), {
  delta: 0.1,
})

// lib2 必须至少比 lib1 慢 20%
expect(result.get('lib2')).toBeSlowerThan(result.get('lib1'), {
  delta: 0.2,
})
```

你也可以使用标准匹配器来断言绝对性能：

```ts
test('解析速度足够快', async ({ bench }) => {
  const result = await bench('parse', () => {
    parse(largeInput)
  }).run()

  expect(result.throughput.mean).toBeGreaterThan(10_000)
})
```

## 重试

由于基准测试可能存在噪声，可以使用 `retry` 选项自动重试失败的基准测试：

```ts
test('performance comparison', { retry: 3 }, async ({ bench }) => {
  const result = await bench.compare(
    bench('lib1', () => { lib1() }),
    bench('lib2', () => { lib2() }),
  )

  expect(result.get('lib1')).toBeFasterThan(result.get('lib2'))
})
```

## 存储和回放结果

有两个原语可以让你将基准测试结果持久化到磁盘，并在未来的运行中与之比较：`writeResult` 选项用于保存结果，而 `bench.from()` 用于读取结果。

### `writeResult`

将 `writeResult` 作为每个基准测试的选项传入，即可在每次基准测试运行时把结果写入一个 JSON 文件。路径会相对于项目根目录解析：

```ts
test('parse', async ({ bench }) => {
  await bench(
    'parse',
    { writeResult: './benchmarks/parse.json' },
    () => parse(largeInput),
  ).run()
})
```

- 基准测试总会运行。没有“缓存时跳过”的行为，也没有 CLI 标志；文件会在每次成功运行后被覆盖。
- 如果函数抛出错误，则不会写入文件。
- 将这些文件与你的代码一并提交，这样评审者和 CI 就能共享相同的参考点。

::: warning
如果你提交这些文件，请记住基准测试结果会因环境而显著变化（开发者机器、CI 运行器、不同操作系统）。请指定单一环境（通常是 CI）来生成这些文件，并避免在本地重新生成它们。
:::

### `bench.from()`

`bench.from(name, source)` 是一种注册方式，不会执行函数。它会读取先前保存的结果，并将其传入 `bench.compare()`（或者在你调用 `.run()` 时直接返回它）。

source 可以是路径（相对于项目根目录），也可以是返回结果数据的函数，包括 Promise：

```ts
test('compare against the stored baseline', async ({ bench }) => {
  const result = await bench.compare(
    bench(
      'current',
      { writeResult: './benchmarks/parse.json' },
      () => parse(largeInput),
    ),
    bench.from('previous', './benchmarks/parse.json'),
    bench.from('remote', () => fetch('https://path/to/external/file.json').then(r => r.json())),
  )

  expect(result.get('current')).toBeFasterThan(result.get('previous'))
})
```

你可以为旧版本保留历史产物，并将它们与当前实现进行比较。由于 `bench.from()` 从不调用生成该文件的函数，一旦产物被提交，原始基准测试代码就可以删除：

```ts
test('compare parser versions', async ({ bench }) => {
  const input = '{"key":"value"}'

  await bench.compare(
    bench.from('v1', './benchmarks/parse.v1.json'),
    bench.from('v2', './benchmarks/parse.v2.json'),
    bench(
      'current',
      { writeResult: './benchmarks/parse.current.json' },
      () => customParser(input),
    ),
  )
})
```

要生成一个新的历史产物，可以将一个新的 `bench()` 指向该版本的实现，把 `writeResult` 设置为一个带版本号的路径（`./benchmarks/parse.v3.json`），运行一次，然后将该调用替换为 `bench.from('v3', './benchmarks/parse.v3.json')`。

如果想按需重新生成基准基线，可以通过环境变量控制写入，使同一个测试要么刷新产物，要么与其比较：

```ts
test('compare parser versions', async ({ bench }) => {
  if (import.meta.env.VITE_WRITE_BENCH) {
    const baseline = bench('baseline', { writeResult: './my-bench.json' }, () => fn())
    await baseline.run()
  }
  else {
    const baseline = bench.from('baseline', './my-bench.json')
    await bench.compare(bench('current', () => fn()), baseline)
  }
})
```

运行 `VITE_WRITE_BENCH=1 vitest bench` 来刷新已保存的结果，运行 `vitest bench` 则将当前实现与之比较。

### 每项目产物

在多项目工作区中（不同浏览器、不同运行时），可以在路径中包含 `${projectName}`，以便在各项目之间共享同一个基准测试文件。该占位符会在写入时被替换为当前项目名称：

```ts
test('cross-project baseline', async ({ bench }) => {
  await bench(
    'parse',
    // eslint-disable-next-line no-template-curly-in-string
    { perProject: true, writeResult: './benchmarks/parse.${projectName}.json' },
    () => parse(largeInput),
  ).run()
})
```

在 `bench.from()` 中使用相同的模板，这样每个项目都会读取自己的产物。

## 稳定性

基准测试本质上是不稳定的：CPU 负载、热降频、GC 压力以及后台进程都会影响结果。Vitest 采取了几项措施来尽量减少这种噪声：

- **独立项目**：基准测试文件会根据 [`benchmark.include`](/config/benchmark#benchmark-include) 模式分组到其专属项目中。`bench` fixture 只会在匹配该模式的文件中提供。在普通测试文件中使用它会抛出错误。
- **不并发执行**：基准测试文件中的测试始终按顺序运行。基准测试文件本身也会逐个运行，绝不会并行执行。这样可以避免基准测试之间相互干扰。

为了进一步提高稳定性：

- 使用 [`retry`](#retries) 选项自动重跑不稳定的基准断言。
- 在 `toBeFasterThan` / `toBeSlowerThan` 中使用 [`delta`](#asserting-performance) 选项，允许可接受的波动。
- 避免在运行基准测试时同时进行 CPU 密集型进程。
- 关闭浏览器、IDE 以及其他会竞争 CPU 时间的应用程序。

### 死代码消除

JavaScript 引擎可以优化掉没有可观察副作用的代码。如果你的基准测试函数没有使用其结果，引擎可能会完全跳过该计算，从而产生误导性的极快数值：

```ts
test('parsing', async ({ bench }) => {
  // 糟糕：引擎可能会消除这段工作
  await bench('parse', () => {
    JSON.parse(input)
  }).run()

  // 良好：结果被消费了
  await bench('parse', () => {
    const result = JSON.parse(input)
    doSomething(result)
  }).run()
})
```

这适用于所有引擎（V8、JavaScriptCore、SpiderMonkey），但在 V8 的 TurboFan 和 JavaScriptCore 的 FTL 编译层级中尤其激进。

### 模块运行器开销

默认情况下，Vitest 会使用 Vite 的模块运行器在 Node.js 中运行测试（由 [`experimental.viteModuleRunner`](/config/experimental#experimental-vitemodulerunner) 配置）。这会把所有模块导出转换为 getter，因此每次访问导入的绑定都会经过类似 `__vite_ssr_module__.value` 的东西。在普通测试中，这种开销可以忽略不计，但在函数会被调用数百万次的基准测试中，getter 调用本身可能会主导测量结果。

如果检测到过多的 getter 调用，Vitest 会打印警告（你可以通过 [`benchmark.suppressExportGetterWarnings`](/config/benchmark#benchmark-suppressexportgetterwarnings) 将其静音），但在基准测试导入函数时，你应当注意这一点：

```ts
import { parse } from './parser.js'

const _parse = parse

test('parsing', async ({ bench }) => {
  // 糟糕：每次调用 `parse` 都要经过 getter
  await bench('parse', () => {
    parse(input)
  }).run()

  // 良好：将引用存到本地以绕过 getter
  await bench('parse', () => {
    _parse(input)
  }).run()
})
```

如果你是库的作者，同样的开销也会出现在你正在基准测试的库内部：其源码中每一次跨模块调用都会经过相同的 getter 包装。如果你在对自己的库进行基准测试，有两种方法可以消除这一点：

**基准测试预构建产物。** 通过包名导入该库（解析到的是其构建后的输出），而不是直接访问源码。构建后的文件已经将内部导入折叠为直接引用，因此 Vite 的模块运行器看到的是一个没有内部 getter 的单一模块：

```ts
// 糟糕：库内部的每次调用都要经过 getter
import { parse } from '../src/index.ts'

// 良好：发布的入口没有内部 getter
import { parse } from 'my-library'
```

如果你将自己的库与其他包进行比较，请为每个实现都基准测试同一种类型的产物。对于工作区包，确保包名解析到的是构建输出而不是源码，例如可以在 Vite 中将该包 externalize，或者从 `dist` 导入。

**为基准测试禁用模块运行器。** 如果基准测试不需要 Vite 转换、mock，或 Vitest 的模块拦截，则可以为基准测试项目禁用 [`experimental.viteModuleRunner`](/config/experimental#experimental-vitemodulerunner)，这样 Node 就会直接运行原生 ESM。

这只影响 Node.js 模式。浏览器模式使用原生 ESM 导入，因此没有这种开销。

### 引擎特定注意事项

#### V8（Node.js，Chrome）

- **JIT 分层**：V8 会通过多个优化层级（Sparkplug → Maglev → TurboFan）来编译函数。函数在预热阶段与稳定运行阶段的速度可能不同。Tinybench 会自动处理预热，但非常短的基准运行可能无法达到最高优化层级。
- **去优化**：如果在基准测试过程中遇到意外的类型或结构，V8 可能会从优化代码中“退出”。请在你的基准测试函数中保持类型一致：

  ```ts
  test('process items', async ({ bench }) => {
    // 糟糕：混合的结构会导致去优化
    await bench('process', () => {
      for (const item of items) {
        // 某些项具有 { name: string }，其他项具有 { name: string, id: number }
        process(item)
      }
    }).run()

    // 良好：对象结构保持一致
    await bench('process', () => {
      for (const item of items) {
        // 所有项都具有相同的结构 { name: string, id: number }
        process(item)
      }
    }).run()
  })
  ```

- **垃圾回收**：基准测试循环中的大量分配会增加 GC 噪声。如果你测量的是计算性能，请在 `setup` 钩子中预先分配数据，而不是在被测函数内部：

  ```ts
  test('sorting', async ({ bench }) => {
    const original = Array.from({ length: 10000 }, () => Math.random())
    let data: number[]

    // 糟糕：每次迭代都会分配一个新数组，GC 会增加噪声
    await bench('sort', () => {
      const data = Array.from({ length: 10000 }, () => Math.random())
      data.sort()
    }).run()

    // 良好：预先分配，在 beforeEach 中复制
    await bench(
      'sort',
      () => { data.sort() },
      {
        beforeEach() {
          data = [...original]
        },
      },
    ).run()
  })
  ```

#### JavaScriptCore（Bun，Safari）

- **不同的优化阈值**：JSC 使用自己的 JIT 层级（LLInt → Baseline → DFG → FTL），并具有不同的内联和优化启发式规则。在 V8 上很快的基准，在 JSC 上可能表现得非常不同。
- **异步基准测试**：Bun 的事件循环实现与 Node.js 不同。如果你的基准测试涉及异步操作或定时器，不同运行时之间的结果可能无法直接比较。

#### 浏览器

- **计时器分辨率**：浏览器可能会降低 `performance.now()` 的精度（例如降低到 100μs 甚至 1ms）作为安全机制。这会使非常快的操作难以准确测量，因此请增加迭代次数以补偿：

  ```ts
  test('fast operations', async ({ bench }) => {
    await bench.compare(
      bench('fast-op', () => { fastOp() }),
      bench('other-op', () => { otherOp() }),
      {
        // 更多迭代有助于克服较低的计时器分辨率
        iterations: 1000,
      },
    )
  })
  ```
- **跨浏览器差异**：V8（Chrome）、SpiderMonkey（Firefox）和 JSC（Safari）会以不同方式优化不同的模式。在 Chrome 中显示某个库获胜的基准，在 Firefox 中可能会显示相反的结果。
