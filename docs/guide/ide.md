---
title: IDE 集成 | 指南
---

<script setup>
import { useData } from 'vitepress'
const { isDark } = useData()
</script>

# IDE 集成

## VS Code <Badge>官方</Badge> {#vs-code}

<p text-center>
<img :src="`https://raw.githubusercontent.com/vitest-dev/vscode/main/img/cover-${isDark ? 'light' : 'dark' }.png`" w-60 alt="vscode 徽标">
</p>

[GitHub](https://github.com/vitest-dev/vscode) | [VS Code 市场](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)

![vscode 中 vscode 扩展的 gif 动图](https://i.ibb.co/bJCbCf2/202203292020.gif)

## JetBrains IDE

WebStorm、PhpStorm、IntelliJ IDEA Ultimate 以及其他 JetBrains IDE 均内置支持 Vitest。

<p text-center>
<img :src="`/ide/vitest-jb-${isDark ? 'light' : 'dark'}.png`" w-60 alt="webstorm 徽标">
</p>

[WebStorm 帮助](https://www.jetbrains.com/help/webstorm/vitest.html) | [IntelliJ IDEA Ultimate 帮助](https://www.jetbrains.com/help/idea/vitest.html) | [PhpStorm 帮助](https://www.jetbrains.com/help/phpstorm/vitest.html)

![Vitest WebStorm 演示](https://raw.githubusercontent.com/kricact/WS-info/main/gifs/vitest-run-all.gif)

## Wallaby.js <Badge>付费（开源项目免费）</Badge>

由 [Wallaby 团队](https://wallabyjs.com) 创建

[Wallaby.js](https://wallabyjs.com) 会在您输入时立即运行 Vitest 测试，并在您的 IDE 中代码旁边高亮显示结果。

<p text-left>
  <img :src="`/ide/vitest-wallaby-${isDark ? 'light' : 'dark'}.png`" alt="Vitest + Wallaby 徽标" w-142>
</p>

[VS Code](https://marketplace.visualstudio.com/items?itemName=WallabyJs.wallaby-vscode) | [JetBrains](https://plugins.jetbrains.com/plugin/15742-wallaby) |
[Visual Studio](https://marketplace.visualstudio.com/items?itemName=vs-publisher-999439.WallabyjsforVisualStudio2022) | [Sublime Text](https://packagecontrol.io/packages/Wallaby)

![Wallaby VS Code 演示](https://wallabyjs.com/assets/img/vitest_demo.gif)
