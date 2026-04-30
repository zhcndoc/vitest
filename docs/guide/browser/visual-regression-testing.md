---
title: 视觉回归测试
outline: [2, 3]
---

# 视觉回归测试

Vitest 可以开箱即用地运行视觉回归测试。它会捕获 UI 组件和页面的截图，然后将它们与参考图像进行比较，以检测意外的视觉变化。

与验证行为的功能测试不同，视觉测试能够捕捉样式问题、布局偏移和渲染问题，这些问题如果没有彻底的手动测试可能会被忽视。

## 为什么要进行视觉回归测试？

视觉错误不会抛出错误，它们只是看起来不对。这就是视觉测试发挥作用的地方。

- 那个按钮仍然可以提交表单……但为什么现在变成了亮粉色？
- 文本完美适配……直到有人在手机上查看
- 一切运行良好……除了那两个容器超出了视口
- 那个仔细的 CSS 重构起作用了……但破坏了一个没人测试的页面的布局

视觉回归测试充当了 UI 的安全网，在这些视觉变化到达生产环境之前自动捕获它们。

## 入门

::: warning 浏览器渲染差异
视觉回归测试在不同环境中**本质上是不稳定的**。截图在不同机器上看起来会有所不同，原因是：

- 字体渲染（这是个大问题。Windows、macOS、Linux，它们渲染文本的方式都不同）
- GPU 驱动程序和硬件加速
- 是否以无头模式运行
- 浏览器设置和版本
- ……老实说，有时甚至取决于月相

这就是为什么 Vitest 在截图名称中包含浏览器和平台（例如 `button-chromium-darwin.png`）。

为了获得稳定的测试，请在所有地方使用相同的环境。我们**强烈建议**使用云服务，如 [Azure App Testing](https://azure.microsoft.com/en-us/products/app-testing/) 或 [Docker 容器](https://playwright.dev/docs/docker)。
:::

Vitest 中的视觉回归测试可以通过 [`toMatchScreenshot` 断言](/api/browser/assertions.html#tomatchscreenshot) 来完成：

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('hero section looks correct', async () => {
  // ... 测试的其余部分

  // 捕获并比较截图
  await expect(page.getByTestId('hero')).toMatchScreenshot('hero-section')
})
```

### 创建参考图

当你第一次运行视觉测试时，Vitest 会创建一个参考（也称为基线）截图，并使用以下错误消息使测试失败：

```
expect(element).toMatchScreenshot()

未找到现有的参考截图；已创建一个新截图。在再次运行测试之前请检查它。

参考截图：
  tests/__screenshots__/hero.test.ts/hero-section-chromium-darwin.png
```

这是正常的。检查截图看起来是否正确，然后再次运行测试。Vitest 现在会将未来的运行与此基线进行比较。

::: tip
参考截图位于测试旁边的 `__screenshots__` 文件夹中。
**别忘了提交它们！**
:::

### 截图组织

默认情况下，截图的组织方式如下：

```
.
├── __screenshots__
│   └── test-file.test.ts
│       ├── test-name-chromium-darwin.png
│       ├── test-name-firefox-linux.png
│       └── test-name-webkit-win32.png
└── test-file.test.ts
```

命名约定包括：
- **测试名称**：`toMatchScreenshot()` 调用的第一个参数，或从测试名称自动生成。
- **浏览器名称**：`chrome`、`chromium`、`firefox` 或 `webkit`。
- **平台**：`aix`、`darwin`、`freebsd`、`linux`、`openbsd`、`sunos` 或 `win32`。

这确保了来自不同环境的截图不会相互覆盖。

### 更新参考图

当你有意更改 UI 时，你需要更新参考截图：

```bash
$ vitest --update
```

在提交之前检查更新的截图，以确保更改是有意的。

## 视觉测试的工作原理

视觉回归测试需要稳定的截图来进行比较。但是页面不会瞬间稳定，因为图像正在加载、动画结束、字体渲染以及布局稳定。

Vitest 通过“稳定截图检测”自动处理这个问题：

1. Vitest 拍摄第一张截图（如果可用则使用参考截图）作为基线
1. 它拍摄另一张截图并将其与基线进行比较
    - 如果截图匹配，页面稳定且测试继续
    - 如果它们不同，Vitest 使用最新的截图作为基线并重复
1. 这将持续直到达到稳定或达到超时

这确保了短暂的视觉变化（如加载旋转器或动画）不会导致错误失败。但是如果某些东西从未停止动画，你将达到超时，所以考虑 [在测试期间禁用动画](#disable-animations)。

如果在重试（一次或多次）后捕获了稳定截图且存在参考截图，Vitest 会使用 `createDiff: true` 执行与参考图的最终比较。如果它们不匹配，这将生成差异图像。

在稳定性检测期间，Vitest 使用 `createDiff: false` 调用比较器，因为它只需要知道截图是否匹配。这使检测过程保持快速。

## 配置视觉测试

### 全局配置

在你的 [Vitest 配置](/config/browser/expect#tomatchscreenshot) 中配置视觉回归测试默认值：

```ts [vitest.config.ts]
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

### 每个测试的配置

为特定测试覆盖全局设置：

```ts
await expect(element).toMatchScreenshot('button-hover', {
  comparatorName: 'pixelmatch',
  comparatorOptions: {
    // 对文本密集的元素进行更宽松的比较
    allowedMismatchedPixelRatio: 0.1,
  },
})
```

## 最佳实践

### 测试特定元素

除非你明确想要测试整个页面，否则建议捕获特定组件以减少误报：

```ts
// ❌ 捕获整个页面；容易受到无关更改的影响
await expect(page).toMatchScreenshot()

// ✅ 仅捕获正在测试的组件
await expect(page.getByTestId('product-card')).toMatchScreenshot()
```

### 处理动态内容

时间戳、用户数据或随机值等动态内容会导致测试失败。你可以模拟动态内容的来源，或者在使用 Playwright 提供者时通过使用 `screenshotOptions` 中的 [`mask` 选项](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask) 来屏蔽它们。

```ts
await expect(page.getByTestId('profile')).toMatchScreenshot({
  screenshotOptions: {
    mask: [page.getByTestId('last-seen')],
  },
})
```

### 禁用动画

动画可能导致测试不稳定。通过注入自定义 CSS 代码片段在测试期间禁用它们：

```css
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
```

::: tip
使用 Playwright 提供者时，使用断言会自动禁用动画：`screenshotOptions` 中 `animations` 选项的值默认设置为 `"disabled"`。
:::

### 设置适当的阈值

调整阈值很棘手。它取决于内容、测试环境、你的应用可接受的内容，并且也可能根据测试而变化。

Vitest 不为不匹配的像素设置默认值，这由用户根据其需求决定。建议使用 `allowedMismatchedPixelRatio`，以便阈值是根据截图的大小计算的，而不是固定数字。

当同时设置 `allowedMismatchedPixelRatio` 和 `allowedMismatchedPixels` 时，Vitest 使用更严格的限制。

### 设置一致的视口大小

由于浏览器实例可能具有不同的默认大小，最好设置特定的视口大小，无论是在测试上还是在实例配置上：

```ts
await page.viewport(1280, 720)
```

```ts [vitest.config.ts]
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
          viewport: { width: 1280, height: 720 },
        },
      ],
    },
  },
})
```

### 使用 Git LFS

如果你计划拥有大型测试套件，请将参考截图存储在 [Git LFS](https://github.com/git-lfs/git-lfs?tab=readme-ov-file) 中。

## 调试失败的测试

当视觉测试失败时，Vitest 提供三张图像来帮助调试：

1. **参考截图**：预期的基线图像
1. **实际截图**：测试期间捕获的内容
1. **差异图像**：突出显示差异，但这可能不会生成

你会看到类似的内容：

```
expect(element).toMatchScreenshot()

截图与存储的参考图不匹配。
245 个像素（比例 0.03）不同。

参考截图：
  tests/__screenshots__/button.test.ts/button-chromium-darwin.png

Actual screenshot:
  tests/.vitest/attachments/button.test.ts/button-chromium-darwin-actual.png

Diff image:
  tests/.vitest/attachments/button.test.ts/button-chromium-darwin-diff.png
```

### 理解差异图像

- **红色像素**是参考图和实际图之间不同的区域
- **黄色像素**是抗锯齿差异（当不忽略抗锯齿时）
- **透明/原始**是未更改的区域

:::tip
如果差异大部分是红色的，说明真的有问题。如果文本周围点缀着几个红色像素，你可能只需要提高阈值。
:::

## 常见问题和解决方案

### 字体渲染导致的误报

字体的可用性和渲染在不同系统之间差异很大。一些可能的解决方案可能是：

- 使用 Web 字体并等待它们加载：

  ```ts
  // 等待字体加载
  await document.fonts.ready

  // 继续你的测试
  ```

- 增加文本密集区域的比较阈值：

  ```ts
  await expect(page.getByTestId('article-summary')).toMatchScreenshot({
    comparatorName: 'pixelmatch',
    comparatorOptions: {
      // 允许 10% 的像素发生变化
      allowedMismatchedPixelRatio: 0.1,
    },
  })
  ```

- 使用云服务或容器化环境以获得一致的字体渲染。

### 测试不稳定或截图尺寸不同

如果测试随机通过和失败，或者截图在不同运行之间具有不同的尺寸：

- 等待所有内容加载，包括加载指示器
- 设置明确的视口大小：`await page.viewport(1920, 1080)`
- 检查视口边界的响应行为
- 检查意外的动画或过渡
- 增加大截图的测试超时时间
- 使用云服务或容器化环境

## 团队的视觉回归测试

还记得我们提到过视觉测试需要稳定的环境吗？好吧，事实是：你的本地机器并不是那个环境。

对于团队来说，你基本上有三个选项：

1. **自托管运行器**，设置复杂，维护痛苦
1. **GitHub Actions**，免费（对于开源项目），适用于任何提供商
1. **云服务**，比如
[Azure App Testing](https://azure.microsoft.com/en-us/products/app-testing/)，
专为解决此问题而建

我们将重点关注选项 2 和 3，因为它们启动最快。

坦白说，每种方案的主要权衡如下：

- **GitHub Actions**：视觉测试仅在 CI 中运行（开发人员无法在本地运行）
- **Microsoft 的服务**：随处可用，但需要付费且仅适用于 Playwright

:::: tabs key:vrt-for-teams
=== GitHub Actions

这里的技巧是将视觉测试与常规测试分开，
否则，你将浪费数小时检查截图不匹配的失败日志。

### 组织你的测试

首先，隔离你的视觉测试。将它们放在 `visual` 文件夹中（或者任何
适合你项目的结构）：

```json [package.json]
{
  "scripts": {
    "test:unit": "vitest --exclude tests/visual/*.test.ts",
    "test:visual": "vitest tests/visual/*.test.ts"
  }
}
```

现在开发人员可以在本地运行 `npm run test:unit` 而不会受到视觉测试的
干扰。视觉测试保留在环境一致的 CI 中。

::: tip 替代方案
不喜欢 glob 模式？你也可以使用单独的
[测试项目](/guide/projects) 并使用以下命令运行：

- `vitest --project unit`
- `vitest --project visual`
:::

### CI 设置

你的 CI 需要安装浏览器。具体操作取决于你的提供商：

::: tabs key:provider
== Playwright

[Playwright](https://npmx.dev/package/playwright) 让这变得很简单。只需固定
你的版本并在运行测试前添加以下内容：

```yaml [.github/workflows/ci.yml]
# ...工作流的其余部分
- name: Install Playwright Browsers
  run: npx --no playwright install --with-deps --only-shell
```

== WebdriverIO

[WebdriverIO](https://npmx.dev/package/webdriverio) 期望你自带
浏览器。来自
[@browser-actions](https://github.com/browser-actions) 的团队为你提供了支持：

```yaml [.github/workflows/ci.yml]
# ...工作流的其余部分
- uses: browser-actions/setup-chrome@v1
  with:
    chrome-version: 120
```

:::

然后运行你的视觉测试：

```yaml [.github/workflows/ci.yml]
# ...工作流的其余部分
# ...浏览器设置
- name: Visual Regression Testing
  run: npm run test:visual
```

### 更新工作流

有趣的地方在这里。你不希望在每个
PR 上自动更新截图 <small>*(混乱！)*</small>。相反，创建一个
手动触发的工作流，开发人员可以在有意更改
UI 时运行它。

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
这只是一种方法。有些团队更喜欢 PR 评论（`/update-screenshots`），
 others 使用标签。调整它以适合你的工作流！

重要的是要有一种受控的方式来更新基线。
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

      # 魔法发生在下面 🪄
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

=== Azure App Testing

你的测试保持在本地，只有浏览器在云中运行。这是 Playwright 的
远程浏览器功能，但 Microsoft 处理所有基础设施。

### 组织你的测试

保持视觉测试分离以控制成本。只有实际拍摄
截图的测试才应使用该服务。

最干净的方法是使用 [测试项目](/guide/projects)：

```ts [vitest.config.ts]
import { env } from 'node:process'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  // ...全局 Vite 配置
  tests: {
    // ...全局 Vitest 配置
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/**/*.test.ts'],
          // 常规配置，可以使用本地浏览器
        },
      },
      {
        extends: true,
        test: {
          name: 'visual',
          // 或者你也可以使用不同的后缀，例如：`tests/**/*.visual.ts?(x)`
          include: ['visual-regression-tests/**/*.test.ts?(x)'],
          browser: {
            enabled: true,
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
                browser: 'chromium',
                viewport: { width: 2560, height: 1440 },
              },
            ],
          },
        },
      },
    ],
  },
})
```

遵循 [创建 Playwright 工作区的官方指南](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-run-end-to-end-tests?tabs=playwrightcli&pivots=playwright-test-runner#create-a-workspace)。

创建工作区后，配置 Vitest 以使用它：

1. **设置端点 URL**：遵循 [官方指南](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-run-end-to-end-tests?tabs=playwrightcli&pivots=playwright-test-runner#configure-the-browser-endpoint)，检索 URL 并将其设置为 `PLAYWRIGHT_SERVICE_URL` 环境变量。
1. **启用令牌认证**：为你的工作区 [启用访问令牌](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/how-to-manage-authentication?pivots=playwright-test-runner#enable-authentication-using-access-tokens)，然后 [生成令牌](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/how-to-manage-access-tokens#generate-a-workspace-access-token) 并将其设置为 `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` 环境变量。

::: danger 保管好该 Token 秘密！
切勿将 `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` 提交到你的仓库。任何拥有
该令牌的人都可能增加你的账单。在本地使用环境变量，在
CI 中使用 secrets。
:::

然后像这样拆分你的 `test` 脚本：

```json [package.json]
{
  "scripts": {
    "test:visual": "vitest --project visual",
    "test:unit": "vitest --project unit"
  }
}
```

### 运行测试

```bash
# 本地开发
npm run test:unit    # 免费，在本地运行
npm run test:visual  # 使用云浏览器

# 更新截图
npm run test:visual -- --update
```

这种方法最好的部分是它 просто работает（ просто работает 意为“就是能用”）：

- **一致的截图**，每个人都使用相同的云浏览器
- **本地可用**，开发人员可以在他们的机器上运行和更新视觉测试
- **按需付费**，只有视觉测试消耗服务分钟数
- **无需 Docker 或工作流设置**，无需管理或维护

### CI 设置

在你的 CI 中，添加 secrets：

```yaml
env:
  PLAYWRIGHT_SERVICE_URL: ${{ vars.PLAYWRIGHT_SERVICE_URL }}
  PLAYWRIGHT_SERVICE_ACCESS_TOKEN: ${{ secrets.PLAYWRIGHT_SERVICE_ACCESS_TOKEN }}
```

然后像往常一样运行测试。服务会处理其余部分。

::::

### 那么选哪一个？

两种方法都有效。真正的问题是哪些痛点对你的
团队最重要。

如果你已经深入 GitHub 生态系统，GitHub Actions 很难被击败。
对开源免费，适用于任何浏览器提供商，并且你控制
一切。

缺点？当有人在本地生成
截图且它们不再符合 CI 预期时，会出现“在我机器上是好的”这种对话。

如果开发人员需要在本地运行视觉测试，云服务就有意义了。

有些团队让设计师检查工作，或者开发人员更喜欢在
推送之前发现问题。它允许跳过 推送 - 等待 - 检查 - 修复 - 推送 循环。

还在犹豫？从 GitHub Actions 开始。如果本地测试成为
痛点，你以后可以随时添加云服务。
