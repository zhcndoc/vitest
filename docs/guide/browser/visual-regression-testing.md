---
title: 视觉回归测试
outline: [2, 3]
---

<script setup>
import MoonPhase from '../../.vitepress/components/MoonPhase.vue'
</script>

# 视觉回归测试

Vitest 可以开箱即用地运行视觉回归测试。它会捕获你的 UI 组件和页面的截图，然后将其与参考图像进行比较，以检测非预期的视觉变化。

与验证行为的功能测试不同，视觉测试可以发现样式问题、布局偏移以及渲染问题，而这些问题如果没有充分的人工测试，可能会被忽略。

## 为什么要进行视觉回归测试？

视觉缺陷不会抛出错误，它们只是看起来不对。这就是视觉测试的作用。

- 那个按钮仍然会提交表单……但为什么它现在变成了亮粉色？
- 这段文字看起来完全没问题……直到有人在移动设备上查看它
- 一切都运行良好……除了那两个容器跑到了视口外面
- 那次小心翼翼的 CSS 重构确实生效了……但把没人测试的某个页面布局弄坏了

视觉回归测试会作为 UI 的安全网，在这些视觉变化到达生产环境之前自动将其捕获。

## 示例

在 Vitest 中可以通过 [`toMatchScreenshot` 断言](/api/browser/assertions#tomatchscreenshot) 来进行视觉回归测试：

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('button renders in default state', async () => {
  // 渲染你的组件

  // 捕获并比较截图
  await expect(page.getByRole('button')).toMatchScreenshot()
})
```

## 开始使用

### 环境稳定性

视觉回归测试对**环境差异很敏感**，因为渲染在不同环境之间并不是完全确定性的，并且依赖多个因素：

- GPU、驱动程序和硬件加速
- 操作系统
- 字体渲染管线
- 浏览器、浏览器版本和设置
- 浏览器是以 headless 还是 headed 模式运行
- 屏幕缩放、色彩配置文件和显示设置
- ……以及偶尔像是月相 <MoonPhase /> 这种因素

在实践中，即使看似完全相同的环境，也偶尔会产生细微的渲染差异。因此，**视觉回归测试在标准化且严格受控的环境中运行时最可靠**。这也是为什么强烈建议使用 [Docker 容器](https://playwright.dev/docs/docker)、[仅在 CI 中运行的视觉测试工作流，或云服务](#visual-testing-for-teams)。

### 不是行为测试的替代品

当视觉测试和行为测试同时失败时，更难判断到底哪里坏了，以及原因是什么。视觉失败在有意进行 UI 改动时也属于预期情况，但单元测试失败通常不是。将它们分开意味着每个测试套件都能在合适的原因下明确失败。

值得特别指出的是，**`toMatchScreenshot` 不能替代正确的断言**。

一个只渲染按钮并截图的测试，只是在记录当前状态。仅凭截图无法判断用户是否可以与按钮交互。**视觉测试最适合作为行为测试之上的补充层，而不是替代品**。

换句话说，**视觉测试不会告诉你某个东西为什么会以这种方式渲染**。它只会告诉你某个东西确实以某种方式渲染了，或者和上一次不一样了。

例如，假设业务需求要求在表格中按购买日期对最近购买进行排序。如果你只看视觉回归测试，可能会注意到上一次测试中的相同条目现在顺序不同了。这可能是因为你刚刚加入了排序，也可能是因为排序坏了。无论哪种情况，仅仅看 UI 都无法知道顺序为什么不同。有人可能会把视觉差异当作噪音而忽略掉，因为表格“看起来没变”，尽管排序逻辑现在已经坏了。现在，生产环境中就出现了一个损坏的业务需求。

### 项目结构

将视觉测试套件与其他测试分开，可以让失败信号更清晰，也能带来更有意图的更新流程。推荐的设置是使用 [projects](/guide/projects) 并采用 `[name].vrt.test.[ext]` 的命名约定来保持它们的独立性，同时以 headless 模式运行以确保一致性。由于浏览器实例可能有不同的默认尺寸，还应设置一个特定的 viewport 大小。

```ts [vitest.config.ts]
import { defaultExclude, defineConfig } from 'vitest/config'

const vrtPattern = '**/*.vrt.test.[tj]s?(x)'

export default defineConfig({
  test: {
    // ...其他配置
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          exclude: [vrtPattern, ...defaultExclude],
        },
      },
      {
        extends: true,
        test: {
          name: 'vrt',
          browser: {
            headless: true,
            instances: [
              {
                browser: '[browser-name]',
                viewport: { width: 1280, height: 720 },
              },
            ],
          },
          include: [vrtPattern],
        },
      },
    ],
  },
})
```

配置完成后，添加脚本以分别启动每个项目：

```json [package.json]
{
  "scripts": {
    "test:unit": "vitest --project unit",
    "test:visual": "vitest --project vrt"
  }
}
```

### 创建参考图

当你第一次运行视觉测试时，Vitest 会创建一张参考（也叫基线）截图，并以如下错误信息使测试失败：

```
expect(element).toMatchScreenshot()

未找到现有的参考截图；已创建一个新截图。在再次运行测试之前请检查它。

Reference screenshot:
  tests/__screenshots__/button.vrt.test.ts/button-default-state-chromium-darwin.png
```

这是正常的。请检查截图是否正确，然后再次运行测试。此时 Vitest 会将后续运行结果与这个基线进行比较。

::: tip
参考截图保存在测试文件旁边的 `__screenshots__` 文件夹中。**请将它们提交到你的仓库。**
:::

### 截图组织方式

默认情况下，截图的组织方式如下：

```
.
├── __screenshots__
│   └── test-file.vrt.test.ts
│       ├── test-name-chromium-darwin.png
│       ├── test-name-firefox-linux.png
│       └── test-name-webkit-win32.png
└── test-file.vrt.test.ts
```

命名约定包括：
- **测试名称**：要么是 `toMatchScreenshot()` 调用的第一个参数，要么是根据测试名称自动生成
- **浏览器名称**：取决于所配置的浏览器提供方，例如 `chrome`、`chromium`、`firefox` 或 `webkit`
- **平台**：`aix`、`darwin`、`freebsd`、`linux`、`openbsd`、`sunos` 或 `win32`

这确保了来自不同环境的截图不会相互覆盖。

### 更新参考图

当你有意更改 UI 时，就需要像更新快照一样更新参考截图：

```bash
$ vitest --project vrt --update
```

在提交之前请先检查更新后的截图，确保这些变化是有意的。

::: warning 过期截图
请注意，**已删除或已重命名测试的截图不会自动移除**。当你删除或重命名测试时，请手动清理 `__screenshots__` 文件夹，否则过期的参考图会随着时间不断累积。
:::

### 调试失败的测试

当视觉测试失败时，Vitest 会提供三张图片来帮助调试：

1. **参考截图**：期望的基线图像
1. **实际截图**：测试期间捕获到的图像
1. **差异图**：突出显示差异；仅当两张截图尺寸相同时才会生成（使用自定义 matcher 时行为可能不同）

你会在 CLI 输出中看到类似这样的内容：

```
expect(element).toMatchScreenshot()

截图与存储的参考图不匹配。
245 个像素（比例 0.03）不同。

Reference screenshot:
  tests/__screenshots__/button.vrt.test.ts/button-chromium-darwin.png

Actual screenshot:
  tests/.vitest/attachments/button.vrt.test.ts/button-chromium-darwin-actual.png

Diff image:
  tests/.vitest/attachments/button.vrt.test.ts/button-chromium-darwin-diff.png
```

在 UI 模式下，Vitest 会显示带有 A/B 滑块的分页差异视图，如下所示。

<center>
  <img alt="视觉回归差异视图的动画演示，切换标签并使用滑块显示差异" img-light src="/visual-regression/diff-view-light.avif">
  <img alt="视觉回归差异视图的动画演示，切换标签并使用滑块显示差异" img-dark src="/visual-regression/diff-view-dark.avif">

  <sup>视觉回归差异 UI 的示例，展示了“Diff”、“Reference”、“Actual”和“Slider”标签，以及滑块如何揭示组件中非预期的视觉变化。</sup>
</center>

#### 理解差异图

- **红色像素**：参考图和实际图之间不同的区域
- **黄色像素**：抗锯齿差异（当不忽略 anti-alias 时）
- **透明/原始**：未变化的区域

:::tip
如果差异图大部分是红色，那说明确实有问题。如果它只是围绕文本散布着少量红色像素，那你可能只需要提高阈值。
:::

## 配置 `toMatchScreenshot` 断言

可以通过修改默认选项全局配置 `toMatchScreenshot` 断言，也可以针对单个测试进行配置。

要更改默认值，你需要修改 [Vitest 配置](/config/browser/expect#tomatchscreenshot)：

```ts{6-16} [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      expect: {
        toMatchScreenshot: {
          comparatorName: 'pixelmatch',
          comparatorOptions: {
            // 0-1，颜色可以有多大差异？
            threshold: 0.2,
            // 允许 1% 的像素不同
            allowedMismatchedPixelRatio: 0.01,
          },
        },
      },
    },
  },
})
```

如果需要更细粒度的控制，可以直接向断言传递选项，从而在特定测试中覆盖全局设置：

```ts{2-6}
await expect(element).toMatchScreenshot('button', {
  comparatorName: 'pixelmatch',
  comparatorOptions: {
    // 对文本密集的元素进行更宽松的比较
    allowedMismatchedPixelRatio: 0.1,
  },
})
```

## 第三方比较器

Vitest 自带 `pixelmatch` 作为内置比较器。它速度快、按像素逐一比较图像、没有原生依赖，并且能很好地处理大多数情况。默认不包含感知型比较器，因为它们依赖更重，而且并不存在一个明确的单一“最佳”选择——不同算法会做出不同权衡；不过，比较器 API 的存在正是为了让你接入任何符合需求的实现。虽然随着生态成熟，这个决定未来可能会改变。

对于像素级差异会产生过多噪声的场景，感知型或结构相似度比较器可能更合适。它们更像人类一样比较图像，能容忍细微的渲染差异，同时仍可检测有意义的视觉变化。

这类算法有很多，下面这些是不错的起点：

- [`@blazediff/ssim`](https://blazediff.dev/docs/ssim)，用于感知图像质量评估的 [SSIM（结构相似性指数）](https://en.wikipedia.org/wiki/Structural_similarity_index_measure) 实现。它提供标准 SSIM、MS-SSIM（多尺度 SSIM）和 Hitchhiker’s SSIM，适用于不同场景
- [`@blazediff/gmsd`](https://blazediff.dev/docs/gmsd)，用于感知图像质量评估的单线程 GMSD（梯度幅值相似性偏差）指标，适合 CI 环境

要使用其中一个，请先安装并注册它：

```ts{5-11,18-46} [vitest.config.ts]
import ssim from '@blazediff/ssim/ssim'
import type { SsimOptionsExtended } from '@blazediff/ssim/ssim'
import { defineConfig } from 'vitest/config'

declare module 'vitest/browser' {
  interface ScreenshotComparatorRegistry {
    'standard-ssim': SsimOptionsExtended & {
      threshold?: number
    }
  }
}

export default defineConfig({
  test: {
    browser: {
      expect: {
        toMatchScreenshot: {
          comparators: {
            // 简单实现，请务必查看该库的文档
            'standard-ssim': (
              reference,
              actual,
              { createDiff, ...options }
            ) => {
              const diffBuffer = createDiff
                ? new Uint8Array(reference.data.length)
                : undefined

              const output = ssim(
                reference.data,
                actual.data,
                diffBuffer,
                reference.metadata.width,
                reference.metadata.height,
                options,
              )

              const pass = output >= (options.threshold ?? 0.95)

              return {
                pass,
                diff: diffBuffer ?? null,
                message: pass ? null : `SSIM score: ${output}.`,
              }
            },
          },
        },
      },
    },
  },
})
```

注册完成后，就可以在配置中或按单个测试来通过名称引用该比较器：

:::code-group

```ts{8} [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      expect: {
        toMatchScreenshot: {
          comparatorName: 'standard-ssim',
        },
      },
    },
  },
})
```

```ts{2} [button.vrt.test.tsx]
await expect(button).toMatchScreenshot('button', {
  comparatorName: 'standard-ssim',
})
```

:::

## 最佳实践

### 测试特定元素

除非你明确想测试整个页面，否则更建议捕获特定组件，以减少误报：

```ts
// ❌ 捕获整个页面；容易受到无关更改的影响
await expect(page).toMatchScreenshot()

// ✅ 只捕获正在测试的组件
await expect(
  page.getByRole('article', { name: 'Tote bag' })
).toMatchScreenshot()
```

### 处理动态内容

时间戳、用户数据或随机值等动态内容会导致测试失败。你可以 mock 底层数据源，或者在使用 Playwright provider 时，通过 [`mask` 选项](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask) 在 `screenshotOptions` 中将其遮罩掉。

```ts{8}
const profile = page.getByRole(
  'article',
  { name: 'Gracie\'s profile' },
)

await expect(profile).toMatchScreenshot({
  screenshotOptions: {
    mask: [profile.getByRole('status')],
  },
})
```

### 禁用动画

::: tip
使用 Playwright provider 时，内置断言会自动禁用动画：`screenshotOptions` 里的 `animations` 选项默认会被设置为 `"disabled"`。

如果你希望禁用所有动画以节省一些执行时间，请继续阅读。
:::

动画会导致测试不稳定。可以在测试期间通过使用 [`setupFiles`](/config/setupfiles) 注入自定义 CSS 片段，或者直接在测试中禁用它们：

```ts
const stylesheet = document.createElement('style')

stylesheet.textContent = /* css */`
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`

document.head.appendChild(stylesheet)
```

或者，你也可以通过使用 [`browser.testerHtmlPath`](/config/browser/testerhtmlpath) 在自定义 HTML 模板中声明这段 CSS。

### 设置合适的阈值

调整阈值并不容易。它取决于内容、测试环境、你的应用可接受的差异，而且可能还会因测试而变化。

Vitest 没有为不匹配像素定义默认容差。合适的值取决于你的应用和环境。建议使用 `allowedMismatchedPixelRatio`，这样阈值会根据截图大小计算，而不是固定数值。

同时设置 `allowedMismatchedPixelRatio` 和 `allowedMismatchedPixels` 时，Vitest 会采用更严格的那个限制。

### 使用 Git LFS

如果你计划拥有大型测试套件，请将参考截图存储在 [Git LFS](https://github.com/git-lfs/git-lfs?tab=readme-ov-file) 中。

## 常见问题与解决方案

### 字体渲染导致的误报

不同系统之间的字体可用性和渲染差异很大。可尝试的解决方案包括：

- 使用 Web 字体并等待其加载：

  ```ts
  // 等待字体加载
  await document.fonts.ready

  // 继续你的测试
  ```

- 提高文本密集区域的比较阈值：

  ```ts{6-7}
  await expect(
    page.getByRole('article', { name: 'How to grow tomatoes' })
  ).toMatchScreenshot({
    comparatorName: 'pixelmatch',
    comparatorOptions: {
      // 允许 10% 的像素发生变化
      allowedMismatchedPixelRatio: 0.1,
    },
  })
  ```

- [考虑使用共享环境配置](#visual-testing-for-teams)，以获得一致的字体渲染。

### 测试不稳定或截图尺寸不同

如果测试会随机通过或失败，或者不同运行之间的截图尺寸不一致：

- 等待所有内容加载完成，包括加载指示器
- 设置明确的视口大小：`await page.viewport(1920, 1080)`
- 检查视口边界处是否存在响应式行为
- 检查是否有意外的动画或过渡
- 为较大的截图增加测试超时时间
- [考虑使用共享环境配置](#visual-testing-for-teams)

## 团队的视觉测试

即使本地环境受控，在一台机器上生成的参考截图也常常会在另一台机器上失败。一旦不止一个人运行这个测试套件，这个问题就会变得很重要。

在共享环境中运行视觉回归测试套件可以解决这个问题。实现方式有三种：

1. **自托管运行器**（例如 Docker 镜像），设置和维护都比较复杂
1. **在 CI 中生成参考截图**，这需要一些配置
1. **云服务**，例如 [Azure App Testing](https://azure.microsoft.com/en-us/products/app-testing/)，专门用来解决这个问题，但通常只支持特定的提供商和浏览器

方案 2 和 3 最容易快速上手，因此下面主要介绍它们。

:::: tabs key:shared-environment-vrt
=== GitHub Actions（CI）

GitHub runners 默认没有预装浏览器。请在运行测试前根据你的 provider 安装它们：

::: tabs key:provider
== Playwright

[Playwright](https://npmx.dev/package/playwright) 可以轻松完成这件事。只需固定版本，并在运行测试前添加这一步：

```yaml [.github/workflows/ci.yml]
# ...工作流的其余部分
- name: Install Playwright Browsers
  run: npx --no playwright install --with-deps --only-shell
```

== WebdriverIO

[WebdriverIO](https://npmx.dev/package/webdriverio) 会在测试开始时如果找不到浏览器就自动安装，但建议将安装过程解耦。为此，[@browser-actions](https://github.com/browser-actions) 的维护者提供了便捷的可复用 action，用于安装 [Chrome](https://github.com/browser-actions/setup-chrome)、[Edge](https://github.com/browser-actions/setup-edge) 和 [Firefox](https://github.com/browser-actions/setup-firefox)：

```yaml [.github/workflows/ci.yml]
# ...工作流的其余部分
- uses: browser-actions/setup-chrome@v1
  with:
    chrome-version: 120
```

:::

然后在你现有的工作流中运行视觉测试：

```yaml [.github/workflows/ci.yml]
# ...工作流的其余部分
# ...浏览器设置
- name: Visual Regression Testing
  run: npm run test:visual
```

### 更新工作流

在本地运行 `vitest --update` 会在你的机器上生成截图，这就违背了受控环境的初衷。相反，你需要一种方式在 CI 中触发更新，因为那里运行测试的环境与生成参考截图的环境一致。

你不希望这件事在每个 PR 上自动发生 <small>*(混乱！)*</small>。相反，应创建一个手动触发的工作流，在 UI 有意更改时运行。

下面的工作流：
- 仅在功能分支上运行（绝不在 main 上）
- 将触发者列为共同作者
- 防止同一分支上的并发运行
- 显示漂亮的摘要：
  - **当截图发生变化时**，它会列出变化内容

    <img alt="更新后的操作摘要" img-light src="/vrt-gha-summary-update-light.png">
    <img alt="更新后的操作摘要" img-dark src="/vrt-gha-summary-update-dark.png">

  - **当没有任何变化时**，它也会告诉你

    <img alt="无更新时的操作摘要" img-light src="/vrt-gha-summary-no-update-light.png">
    <img alt="无更新时的操作摘要" img-dark src="/vrt-gha-summary-no-update-dark.png">

::: tip
这只是其中一种做法。有些人更喜欢 PR 评论（`/update-screenshots`），也有人使用标签。请根据你的工作流进行调整。

最重要的是拥有一种受控的方式来更新参考截图。
:::

```yaml [.github/workflows/update-screenshots.yml]
name: Update Visual Regression Screenshots

on:
  workflow_dispatch: # 仅手动触发

env:
  AUTHOR_NAME: 'github-actions[bot]'
  AUTHOR_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com'
  COMMIT_MESSAGE: |
    test: update visual regression screenshots

    Co-authored-by: ${{ github.actor }} <${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com>

jobs:
  update-screenshots:
    runs-on: ubuntu-24.04

    # 安全第一：不要在 main 分支上运行
    if: github.ref_name != github.event.repository.default_branch

    # 每个分支一次只运行一个
    concurrency:
      group: visual-regression-screenshots@${{ github.ref_name }}
      cancel-in-progress: true

    permissions:
      contents: write # 需要推送更改

    steps:
      - name: Checkout selected branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.ref_name }}
          # 如果触发其他工作流请使用 PAT
          # token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configure Git
        run: |
          git config --global user.name "${{ env.AUTHOR_NAME }}"
          git config --global user.email "${{ env.AUTHOR_EMAIL }}"

      # 这里的设置步骤（node, pnpm, 任意）
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx --no playwright install --with-deps --only-shell

      - name: Update Visual Regression Screenshots
        run: npm run test:visual --update

      # 检查发生了什么变化
      - name: Check for changes
        id: check_changes
        run: |
          CHANGED_FILES=$(git status --porcelain | awk '{print $2}')
          if [ "${CHANGED_FILES:+x}" ]; then
            echo "changes=true" >> $GITHUB_OUTPUT
            echo "Changes detected"

            # 保存列表用于摘要
            echo "changed_files<<EOF" >> $GITHUB_OUTPUT
            echo "$CHANGED_FILES" >> $GITHUB_OUTPUT
            echo "EOF" >> $GITHUB_OUTPUT
            echo "changed_count=$(echo "$CHANGED_FILES" | wc -l)" >> $GITHUB_OUTPUT
          else
            echo "changes=false" >> $GITHUB_OUTPUT
            echo "No changes detected"
          fi

      # 如果有更改则提交
      - name: Commit changes
        if: steps.check_changes.outputs.changes == 'true'
        run: |
          git add -A
          git commit -m "${{ env.COMMIT_MESSAGE }}"

      - name: Push changes
        if: steps.check_changes.outputs.changes == 'true'
        run: git push origin ${{ github.ref_name }}

      # 给人看的漂亮摘要
      - name: Summary
        run: |
          if [[ "${{ steps.check_changes.outputs.changes }}" == "true" ]]; then
            echo "### 📸 Visual Regression Screenshots Updated" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "Successfully updated **${{ steps.check_changes.outputs.changed_count }}** screenshot(s) on \`${{ github.ref_name }}\`" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "#### Changed Files:" >> $GITHUB_STEP_SUMMARY
            echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
            echo "${{ steps.check_changes.outputs.changed_files }}" >> $GITHUB_STEP_SUMMARY
            echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "✅ The updated screenshots have been committed and pushed. Your visual regression baseline is now up to date!" >> $GITHUB_STEP_SUMMARY
          else
            echo "### ℹ️ No Screenshot Updates Required" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "The visual regression test command ran successfully but no screenshots needed updating." >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "All screenshots are already up to date! 🎉" >> $GITHUB_STEP_SUMMARY
          fi
```

=== Azure App Testing（云服务）

使用这种方法时，测试仍在本地运行，但浏览器在云端执行。这建立在 Playwright 的远程浏览器功能之上，由 Azure 处理所有基础设施。

每个人都使用相同的云端浏览器，因此无论谁运行测试，参考结果都保持一致。测试可在本地运行，你只需为实际使用量付费，而且无需维护任何东西。

### 配置

要让 Playwright 连接到服务中启动的浏览器，你需要更新 provider 配置。

```ts{14-28} [vitest.config.ts]
import { env } from 'node:process'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    // ...其他配置
    projects: [
      {
        extends: true,
        test: {
          name: 'vrt',
          browser: {
            provider: playwright({
              connectOptions: {
                wsEndpoint: `${env.PLAYWRIGHT_SERVICE_URL}?${new URLSearchParams({
                  'api-version': '2025-09-01',
                  'os': 'linux', // 始终使用 Linux 以保持一致性
                  // 有助于在服务仪表板中识别运行
                  'runName': `Vitest ${env.CI ? 'CI' : 'local'} run @${new Date().toISOString()}`,
                })}`,
                exposeNetwork: '<loopback>',
                headers: {
                  Authorization: `Bearer ${env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN}`,
                },
                timeout: 30_000,
              }
            }),
            headless: true,
            instances: [
              {
                browser: '[browser-name]',
                viewport: { width: 1280, height: 720 },
              },
            ],
          },
          include: [vrtPattern],
        },
      },
      // ...其他项目
    ],
  },
})
```

要创建 Playwright Workspace，请参阅[官方指南](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-run-end-to-end-tests?tabs=playwrightcli&pivots=playwright-test-runner#create-a-workspace)。

创建工作区后，配置 Vitest 以使用它：

1. **设置端点 URL**：遵循 [官方指南](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-run-end-to-end-tests?tabs=playwrightcli&pivots=playwright-test-runner#configure-the-browser-endpoint)，检索 URL 并将其设置为 `PLAYWRIGHT_SERVICE_URL` 环境变量。
1. **启用令牌认证**：为你的工作区 [启用访问令牌](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/how-to-manage-authentication?pivots=playwright-test-runner#enable-authentication-using-access-tokens)，然后 [生成令牌](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/how-to-manage-access-tokens#generate-a-workspace-access-token) 并将其设置为 `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` 环境变量。

::: danger Keep that token secret!
永远不要把 `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` 提交到你的仓库。任何拥有该令牌的人都可能给你产生高额账单。请在本地使用环境变量，在 CI 中使用密钥。
:::

### 运行测试

```bash
# 本地开发
npm run test:unit    # 使用你的浏览器在本地运行
npm run test:visual  # 使用云端浏览器

# 更新截图
npm run test:visual -- --update
```

### CI 设置

将密钥添加到你的 CI 配置中：

```yaml
env:
  PLAYWRIGHT_SERVICE_URL: ${{ vars.PLAYWRIGHT_SERVICE_URL }}
  PLAYWRIGHT_SERVICE_ACCESS_TOKEN: ${{ secrets.PLAYWRIGHT_SERVICE_ACCESS_TOKEN }}
```

然后像平常一样运行测试。服务会处理浏览器基础设施。

::::

### 选择合适的方案

所有方案都可行。真正的问题是，哪些痛点对你和你的团队最重要。

如果你熟悉容器化，自托管 Docker 方案可以为你提供一个受控环境，不依赖外部服务，也没有额外成本。缺点是维护成本，因为你要自己负责环境、浏览器版本以及任何故障修复。

CI 运行适用于任何浏览器提供商，并且能让你完全掌控，但截图只能在 CI 中生成。如果有人在本地运行 `vitest --update` 并提交结果，这些参考图在下一次 CI 运行时很可能会失败。可以通过在 CI 环境检查之后再允许执行该命令来避免这个问题。

如果你希望开发者能够在本地运行和更新视觉测试，而不必担心参考图不一致，那么云服务就很合适。当设计师也参与审查变更，或者“推送—等待—检查—修复—再推送”的循环成为真正瓶颈时，它会更有价值。

还在犹豫？先从 CI 工作流开始。如果之后它变成了痛点，你随时可以再迁移到容器或云服务。

## 进一步了解

### Vitest 如何确保截图稳定性

视觉回归测试依赖于跨运行保持截图稳定。实际上，页面不会瞬间稳定：图片会异步加载，动画在不同时间结束，字体会渲染，布局也会逐渐稳定。为缓解这一点，Vitest 使用一种“稳定截图检测”策略：

1. 它会先拍摄一张初始截图（如果有参考截图，则使用参考截图）作为基线
1. 它再拍摄一张截图，并将其与基线进行比较
    - 如果截图匹配，说明页面已稳定，测试继续进行
    - 如果它们不同，Vitest 会使用最新的截图作为基线并重复此过程
1. 这一过程会持续，直到达到稳定状态或超时

这可以确保临时性的视觉变化（例如加载中的旋转图标或动画）不会导致误报。不过，如果某些内容一直在持续动画，你就会触发超时，因此可以考虑在测试期间[禁用动画](#disable-animations)。

如果在一次或多次重试后捕获到稳定截图，并且存在参考截图，Vitest 会使用 `createDiff: true` 与参考图进行最终比较。如果它们不匹配，就会生成一张差异图。

在稳定性检测期间，Vitest 会以 `createDiff: false` 调用比较器，因为它只需要知道截图是否匹配。这样可以让检测过程更快。
