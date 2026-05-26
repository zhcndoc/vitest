<script setup>
import SupportedVersions from './.vitepress/theme/SupportedVersions.vue';
</script>

# 发布

Vitest 发布遵循 [语义化版本控制](https://semver.org/)。你可以在 [Vitest npm 包页面](https://www.npmjs.com/package/vite) 查看 Vitest 的最新稳定版本。

过去发布的完整更新日志可在 [GitHub 上查看](https://github.com/vitest-dev/vitest/releases)。

## 发布周期

Vitest 没有固定的发布周期。

- **补丁** 发布按需发布（通常每周一次）。
- **次要** 发布始终包含新功能，并按需发布。次要发布总会有一个 beta 预发布阶段（通常每两个月一次）。
- **主要** 发布通常与 [Vite](https://vite.dev/releases) 和 [Node.js EOL 时间表](https://endoflife.date/nodejs) 保持一致，并会提前公告。这些发布将有较长的 beta 预发布阶段（通常每年一次）。

## 支持的版本

总的来说，当前受支持的 Vitest 版本如下：

<SupportedVersions />

<br>

受支持的版本范围由以下规则自动确定：

- **当前次要版本** 会获得常规修复。
- **上一个主要版本**（仅其最新次要版本）和 **上一个次要版本** 会获得重要修复和安全补丁。
- 早于这些版本的所有版本都不再受支持。

我们建议定期更新 Vitest。每次更新到新的主要版本时，请查看 [迁移指南](/guide/migration)。我们会通过 [vitest-ecosystem-ci 项目](https://github.com/vitest-dev/vitest-ecosystem-ci) 在发布新 Vitest 版本前进行测试。使用 Vitest 的大多数项目都应能够在新版本发布后迅速提供支持或迁移到新版本。

## 语义化版本控制的边缘情况

### TypeScript 定义

我们可能会在次要版本之间发布与 TypeScript 定义不兼容的变更。这是因为：

- 有时 TypeScript 本身会在次要版本之间发布不兼容的变更，而我们可能需要调整类型以支持更新版本的 TypeScript。
- 偶尔我们可能需要采用仅在更新版本的 TypeScript 中可用的功能，从而提高所需的最低 TypeScript 版本。
- 如果你正在使用 TypeScript，你可以使用一个锁定当前次要版本的 semver 范围，并在 Vite 发布新次要版本时手动升级。

## 预发布版本

次要发布通常会经历不固定数量的 beta 发布。主要发布会经历较长的 beta 阶段。

预发布版本允许早期采用者和生态系统维护者进行集成与稳定性测试，并提供反馈。不要在生产环境中使用预发布版本。所有预发布版本都被视为不稳定，并且中间可能包含破坏性变更。使用预发布版本时务必固定到精确版本。

## 弃用

我们会在次要发布中定期弃用已被更好替代方案取代的功能。被弃用的功能仍可继续使用，但会伴随类型或日志警告。它们会在进入弃用状态后的下一个主要版本中被移除。每个主要版本的 [迁移指南](/guide/migration.html) 都会列出这些移除项，并记录相应的升级路径。

## 实验性功能

某些功能在以稳定版本发布时会被标记为实验性。实验性功能使我们能够收集真实世界中的使用经验，以影响其最终设计。其目标是让用户通过在生产环境中测试来提供反馈。实验性功能本身被视为不稳定，只应在受控方式下使用。这些功能可能在不同次要版本之间发生变化，因此依赖它们的用户必须固定其 Vite 版本。我们会为每个实验性功能创建一个 [GitHub 讨论](https://github.com/vitest-dev/vitest/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback)。
