---
title: browser.expect | 配置
outline: deep
---

# browser.expect

- **类型:** `ExpectOptions`

## browser.expect.toMatchScreenshot

[`toMatchScreenshot` 断言](/api/browser/assertions.html#tomatchscreenshot) 的默认选项。
这些选项将应用于所有截图断言。

::: tip
为截图断言设置全局默认值有助于保持测试套件的一致性，并减少单个测试中的重复内容。当特定测试用例需要时，您仍然可以在断言级别覆盖这些默认值。
:::

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      expect: {
        toMatchScreenshot: {
          comparatorName: 'pixelmatch',
          comparatorOptions: {
            threshold: 0.2,
            allowedMismatchedPixels: 100,
          },
          resolveScreenshotPath: ({ arg, browserName, ext, testFileName }) =>
            `custom-screenshots/${testFileName}/${arg}-${browserName}${ext}`,
        },
      },
    },
  },
})
```

此处可配置 [`toMatchScreenshot` 断言](/api/browser/assertions#options) 中的所有选项。此外，还提供两个路径解析函数：`resolveScreenshotPath` 和 `resolveDiffPath`。

## browser.expect.toMatchScreenshot.resolveScreenshotPath

- **类型:** `(data: PathResolveData) => string`
- **默认输出:** `` `${root}/${testFileDirectory}/${screenshotDirectory}/${testFileName}/${arg}-${browserName}-${platform}${ext}` ``

用于自定义参考截图存储位置的函数。该函数接收一个包含以下属性的对象：

- `arg: string`

  路径，**不含**扩展名，经过清理且相对于测试文件。

  这来自传递给 `toMatchScreenshot` 的参数；如果无参数调用，这将是自动生成的名称。

  ```ts
  test('calls `onClick`', () => {
    expect(locator).toMatchScreenshot()
    // arg = "calls-onclick-1"
  })

  expect(locator).toMatchScreenshot('foo/bar/baz.png')
  // arg = "foo/bar/baz"

  expect(locator).toMatchScreenshot('../foo/bar/baz.png')
  // arg = "foo/bar/baz"
  ```

- `ext: string`

  截图扩展名，包含前导点。

  这可以通过传递给 `toMatchScreenshot` 的参数进行设置，但如果使用了不支持的扩展名，该值将回退为 `'.png'`。

- `browserName: string`

  实例的浏览器名称。

- `platform: NodeJS.Platform`

  [`process.platform`](https://nodejs.org/docs/v22.16.0/api/process.html#processplatform) 的值。

- `screenshotDirectory: string`

  提供给 [`browser.screenshotDirectory`](/config/browser/screenshotdirectory) 的值，如果未提供，则为其默认值。

- `root: string`

  项目 [`root`](/config/root) 的绝对路径。

- `testFileDirectory: string`

  测试文件的路径，相对于项目的 [`root`](/config/root)。

- `testFileName: string`

  测试的文件名。

- `testName: string`

  [`test`](/api/test) 的名称，包括父级 [`describe`](/api/describe)，经过清理。

- `attachmentsDir: string`

  提供给 [`attachmentsDir`](/config/attachmentsdir) 的值，如果未提供，则为其默认值。

例如，按浏览器对截图进行分组：

```ts
resolveScreenshotPath: ({ arg, browserName, ext, root, testFileName }) =>
  `${root}/screenshots/${browserName}/${testFileName}/${arg}${ext}`
```

## browser.expect.toMatchScreenshot.resolveDiffPath

- **类型:** `(data: PathResolveData) => string`
- **默认输出:** `` `${root}/${attachmentsDir}/${testFileDirectory}/${testFileName}/${arg}-${browserName}-${platform}${ext}` ``

当截图比较失败时，用于自定义差异图像存储位置的函数。接收与 [`resolveScreenshotPath`](#browser-expect-tomatchscreenshot-resolvescreenshotpath) 相同的数据对象。

例如，将差异图像存储在附件的子目录中：

```ts
resolveDiffPath: ({ arg, attachmentsDir, browserName, ext, root, testFileName }) =>
  `${root}/${attachmentsDir}/screenshot-diffs/${testFileName}/${arg}-${browserName}${ext}`
```

## browser.expect.toMatchScreenshot.comparators

- **类型:** `Record<string, Comparator>`

注册自定义截图比较算法，例如 [SSIM](https://en.wikipedia.org/wiki/Structural_similarity_index_measure) 或其他感知相似度指标。

要创建自定义比较器，您需要在配置中注册它。如果使用 TypeScript，请在 `ScreenshotComparatorRegistry` 接口中声明其选项。

```ts
import { defineConfig } from 'vitest/config'

// 1. 声明比较器的选项类型
declare module 'vitest/browser' {
  interface ScreenshotComparatorRegistry {
    myCustomComparator: {
      sensitivity?: number
      ignoreColors?: boolean
    }
  }
}

// 2. 实现比较器
export default defineConfig({
  test: {
    browser: {
      expect: {
        toMatchScreenshot: {
          comparators: {
            myCustomComparator: async (
              reference,
              actual,
              {
                createDiff, // 始终由 Vitest 提供
                sensitivity = 0.01,
                ignoreColors = false,
              }
            ) => {
              // ...算法实现
              return { pass, diff, message }
            },
          },
        },
      },
    },
  },
})
```

然后在您的测试中使用它：

```ts
await expect(locator).toMatchScreenshot({
  comparatorName: 'myCustomComparator',
  comparatorOptions: {
    sensitivity: 0.08,
    ignoreColors: true,
  },
})
```

**比较器函数签名:**

```ts
type Comparator<Options> = (
  reference: {
    metadata: { height: number; width: number }
    data: TypedArray
  },
  actual: {
    metadata: { height: number; width: number }
    data: TypedArray
  },
  options: {
    createDiff: boolean
  } & Options
) => Promise<{
  pass: boolean
  diff: TypedArray | null
  message: string | null
}> | {
  pass: boolean
  diff: TypedArray | null
  message: string | null
}
```

`reference` 和 `actual` 图像使用适当的编解码器解码（目前仅支持 PNG）。`data` 属性是一个扁平的 `TypedArray`（`Buffer`、`Uint8Array` 或 `Uint8ClampedArray`），包含 RGBA 格式的像素数据：

- **每个像素 4 字节**: 红、绿、蓝、Alpha（每个从 `0` 到 `255`）
- **行主序**: 像素从左到右、从上到下存储
- **总长度**: `width × height × 4` 字节
- **Alpha 通道**: 始终存在。没有透明度的图像 Alpha 值设置为 `255`（完全不透明）

::: tip 性能考虑
`createDiff` 选项指示是否需要差异图像。在 [稳定截图检测](/guide/browser/visual-regression-testing#how-visual-tests-work) 期间，Vitest 会以 `createDiff: false` 调用比较器以避免不必要的工作。

**尊重此标志以保持测试快速**。
:::

::: warning 处理缺失选项
`toMatchScreenshot()` 中的 `options` 参数是可选的，因此用户可能不会提供所有的比较器选项。始终将它们设为可选并提供默认值：

```ts
myCustomComparator: (
  reference,
  actual,
  { createDiff, threshold = 0.1, maxDiff = 100 },
) => {
  // ...比较逻辑
}
```
:::
