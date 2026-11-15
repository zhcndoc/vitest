---
title: 仅运行受影响的测试 | 配方
---

# 仅运行受影响的测试

合并前应完整运行大型测试套件，但对于小改动来说，这样反馈太慢。如果你只修改了一个模块，那么只有加载该模块的测试才可能改变结果。Vitest 提供两个标志来选择这些测试。它们的区别在于一个问题：与什么内容进行比较？

- [`--changed`](/config/changed) 将工作区与一个 Git 参考提交进行比较。
- [`--since-last-run`](/guide/cli#since-last-run) 将测试加载的每个文件与该测试上次运行的时间进行比较。

## `--changed`：与 Git 参考提交的差异 {#changed}

```sh
vitest run --changed              # 未提交的更改，包括已暂存和未暂存的更改
vitest run --changed HEAD~1       # 上一次提交和未提交的更改
vitest run --changed origin/main  # 当前分支中的所有更改
```

Vitest 会通过 Git 获取已更改的文件，然后查找直接或经由其他模块导入这些文件的测试文件。导入图中包含列表内任一文件时，就会运行相应测试。

参考提交就是比较基线，因此只要基线不变，同一条命令就会选择相同的测试。这适用于按 Git 状态定义的检查，例如与 `origin/main` 比较的拉取请求，或覆盖即将推送提交的 pre-push 钩子。此功能需要 Git 仓库；一旦更改已提交并合并，它就不再属于“已更改”内容，即使这些测试还没有在你的机器上运行过。

## `--since-last-run`：自测试上次运行以来的更改 {#since-last-run}

```sh
vitest run --since-last-run
```

首次使用 `--since-last-run` 运行时，会运行所有测试，并记录每个测试加载过的文件，包括动态导入、模拟、设置文件和快照文件。之后的每次运行都会将这些文件的修改时间与记录该信息的那次运行时间进行比较。如果某个文件更新了、已被删除，或该测试还没有记录，Vitest 就会再次运行该测试。上一次运行失败的测试文件也会一直重跑，直到通过，即使修复内容位于记录的文件之外。

每次运行都会更新已运行测试的记录，因此基线会随运行而移动：一次运行后，只有下一次编辑才会重新选中测试。此功能不依赖 Git，因此可以在全新的容器、历史记录无关的工作树，或非仓库目录中使用。新测试文件或从未记录过的测试文件始终会运行。

记录保存在[缓存](/config/cache)中。运行 `vitest run --clearCache` 会删除记录；下一次使用 `--since-last-run` 运行时会再次完整运行。

## 选择哪种方式 {#which-one-to-pick}

| 你想运行受哪些更改影响的测试？                          | 使用方式                           |
| ------------------------------------------------------- | ---------------------------------- |
| 创建或更新拉取请求之前的分支更改                        | `--changed origin/main`            |
| 即将推送的提交                                          | `--changed <upstream>`             |
| Git 仓库中的未提交编辑                                  | `--changed` 或 `--since-last-run`  |
| 上次运行测试后所做的编辑，无论是否已提交                | `--since-last-run`                 |
| 不含 Git 的目录，或历史记录不受你控制的目录            | `--since-last-run`                 |

当基线需要与其他人共享时，`--changed` 更合适：每台机器和 CI 上使用相同的参考提交。当基线是你自己的上次运行时，`--since-last-run` 更合适：无论中间是否提交更改，或目录中是否有 Git，它都能工作。

## AI 代理 {#agents}

AI 编码代理几乎每次编辑后都会运行测试。它们常在容器或临时工作树中工作，在任务中途提交代码，并为每条命令启动一个新进程。Git 基线并不适合这种工作方式：提交之后 `--changed` 就没有结果了，而且它还要求目录是仓库。`--since-last-run` 会跟踪代理实际运行过的测试，因此每次运行 `vitest run --since-last-run` 都只会覆盖自上次运行后受编辑影响的测试；在全新环境中首次运行会执行完整套件并创建记录。

你可以将以下说明添加到项目的指令文件中：

```md [AGENTS.md]
- After a change, run `vitest run --since-last-run` to test only what the change affects.
- Before you finish, run `vitest run` once for the whole suite.
```

记录无法检测两类情况：上次运行时没有任何测试加载过的文件（例如新建的 `.env` 文件或 `__mocks__` 文件），以及检出代码或解压归档时被设置为过去时间的文件。最后完整运行一次可以覆盖这两类情况。

## 另请参阅 {#see-also}

- [`changed`](/config/changed)
- [`--since-last-run`](/guide/cli#since-last-run)
- [`experimental.recordDependencies`](/config/experimental#experimental-recorddependencies)
- [测试过滤](/guide/filtering)
