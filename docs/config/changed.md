---
title: changed | Config
outline: deep
---

### changed <CRoot />

- **类型:** `boolean | string`
- **默认值:** `false`
- **CLI:** `--changed`, `--changed=HEAD~1`

仅针对已更改的文件运行测试。如果未提供值，将针对未提交的更改（包括已暂存和未暂存的更改）运行测试。

要针对上一次提交中的更改运行测试，可以使用 `--changed HEAD~1`。你也可以传入提交哈希（例如 `--changed 09a9920`）或分支名称（例如 `--changed origin/develop`）。

当与代码覆盖率一起使用时，报告将只包含与更改相关的文件。

项目中每个测试文件所依赖的文件发生更改时，会重新运行该项目中的所有测试：[`setupFiles`](/config/setupfiles)、[`globalSetup`](/config/globalsetup)、自定义的 [`runner`](/config/runner) 或 [`environment`](/config/environment)、[`snapshotSerializers`](/config/snapshotserializers)、从 [`envDir`](https://vite.dev/config/shared-options#envdir) 加载的 `.env` 文件，以及项目的配置文件及其导入的所有内容。Vitest 还会跟踪 `@vitest-environment` 注释中设置的环境、没有工厂函数的 `vi.mock` 调用所使用的 `__mocks__` 文件，以及每个测试的快照文件。传递给 `toMatchFileSnapshot` 的文件不会被跟踪。

如果与 [`forceRerunTriggers`](/config/forcereruntriggers) 配置项配对使用，当 `forceRerunTriggers` 列表中的至少一个文件发生更改时，将运行整个测试套件。默认情况下，对 Vitest 配置文件和 `package.json` 的更改将始终重新运行整个套件。
