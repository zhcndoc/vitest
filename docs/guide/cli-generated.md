### root

- **CLI:** `-r, --root <path>`
- **Config:** [root](/config/root)

根路径

### config

- **CLI:** `-c, --config <path>`

配置文件路径

### update

- **CLI:** `-u, --update [type]`
- **Config:** [update](/config/update)

更新快照（接受布尔值、"new"、"all" 或 "none"）

### watch

- **CLI:** `-w, --watch`
- **Config:** [watch](/config/watch)

启用监视模式

### testNamePattern

- **CLI:** `-t, --testNamePattern <pattern>`
- **Config:** [testNamePattern](/config/testnamepattern)

运行与指定正则表达式模式完全匹配的测试名称

### dir

- **CLI:** `--dir <path>`
- **Config:** [dir](/config/dir)

扫描测试文件的基础目录

### ui

- **CLI:** `--ui`

启用用户界面

### open

- **CLI:** `--open`
- **Config:** [open](/config/open)

自动打开用户界面（默认：`!process.env.CI`）

### api.port

- **CLI:** `--api.port [port]`

指定服务器端口。 注意如果端口已被使用，Vite 将自动尝试下一个可用端口，因此这可能不是服务器最终监听的实际端口。 如果为 true，将设置为 `51204`

### api.host

- **CLI:** `--api.host [host]`

指定服务器应监听的 IP 地址。 将其设置为 `0.0.0.0` 或 `true` 以监听所有地址，包括局域网和公共地址

### api.strictPort

- **CLI:** `--api.strictPort`

设置为 true 以在端口已被使用时退出，而不是自动尝试下一个可用端口

### api.allowExec

- **CLI:** `--api.allowExec`
- **Config:** [api.allowExec](/config/api#api-allowexec)

允许 API 执行代码。 （在不受信任的环境中启用此选项时请小心）

### api.allowWrite

- **CLI:** `--api.allowWrite`
- **Config:** [api.allowWrite](/config/api#api-allowwrite)

允许 API 编辑文件。 （在不受信任的环境中启用此选项时请小心）

### silent

- **CLI:** `--silent [value]`
- **Config:** [silent](/config/silent)

测试的静默控制台输出。 使用 `'passed-only'` 仅查看失败测试的日志。

### hideSkippedTests

- **CLI:** `--hideSkippedTests`

隐藏跳过测试的日志

### reporters

- **CLI:** `--reporter <name>`
- **Config:** [reporters](/config/reporters)

指定报告器（default、agent、minimal、blob、verbose、dot、json、tap、tap-flat、junit、tree、hanging-process、github-actions）

### outputFile

- **CLI:** `--outputFile <filename/-s>`
- **Config:** [outputFile](/config/outputfile)

当使用支持的 reporter 时将测试结果写入文件，对多个 reporter 的单独输出使用 cac 的点表示法（示例：`--outputFile.tap=./tap.txt`）

### coverage.provider

- **CLI:** `--coverage.provider <name>`
- **Config:** [coverage.provider](/config/coverage#coverage-provider)

选择覆盖率收集工具，可用值："v8"、"istanbul" 和 "custom"

### coverage.enabled

- **CLI:** `--coverage.enabled`
- **Config:** [coverage.enabled](/config/coverage#coverage-enabled)

启用覆盖率收集。 可以使用 `--coverage` CLI 选项覆盖（默认：`false`）

### coverage.include

- **CLI:** `--coverage.include <pattern>`
- **Config:** [coverage.include](/config/coverage#coverage-include)

作为全局匹配模式包含在覆盖率中的文件。 可以使用多个模式指定多次。 默认仅包含测试覆盖的文件。

### coverage.exclude

- **CLI:** `--coverage.exclude <pattern>`
- **Config:** [coverage.exclude](/config/coverage#coverage-exclude)

排除在覆盖率中的文件。 可以使用多个扩展名指定多次。

### coverage.clean

- **CLI:** `--coverage.clean`
- **Config:** [coverage.clean](/config/coverage#coverage-clean)

运行测试前清理覆盖率结果（默认：true）

### coverage.cleanOnRerun

- **CLI:** `--coverage.cleanOnRerun`
- **Config:** [coverage.cleanOnRerun](/config/coverage#coverage-cleanonrerun)

监视重新运行时清理覆盖率报告（默认：true）

### coverage.reportsDirectory

- **CLI:** `--coverage.reportsDirectory <path>`
- **Config:** [coverage.reportsDirectory](/config/coverage#coverage-reportsdirectory)

写入覆盖率报告的目录（默认：./coverage）

### coverage.reporter

- **CLI:** `--coverage.reporter <name>`
- **Config:** [coverage.reporter](/config/coverage#coverage-reporter)

要使用的覆盖率报告器。 访问 [`coverage.reporter`](/config/coverage#coverage-reporter) 获取更多信息（默认：`["text", "html", "clover", "json"]`）

### coverage.reportOnFailure

- **CLI:** `--coverage.reportOnFailure`
- **Config:** [coverage.reportOnFailure](/config/coverage#coverage-reportonfailure)

即使测试失败也生成覆盖率报告（默认：`false`）

### coverage.allowExternal

- **CLI:** `--coverage.allowExternal`
- **Config:** [coverage.allowExternal](/config/coverage#coverage-allowexternal)

收集项目根目录外文件的覆盖率（默认：`false`）

### coverage.skipFull

- **CLI:** `--coverage.skipFull`
- **Config:** [coverage.skipFull](/config/coverage#coverage-skipfull)

不显示语句、分支和函数覆盖率均为 100% 的文件（默认：`false`）

### coverage.thresholds.100

- **CLI:** `--coverage.thresholds.100`
- **Config:** [coverage.thresholds.100](/config/coverage#coverage-thresholds-100)

将所有覆盖率阈值设置为 100 的快捷方式（默认：`false`）

### coverage.thresholds.perFile

- **CLI:** `--coverage.thresholds.perFile`
- **Config:** [coverage.thresholds.perFile](/config/coverage#coverage-thresholds-perfile)

按文件检查阈值。 有关实际阈值，请参阅 `--coverage.thresholds.lines`、`--coverage.thresholds.functions`、`--coverage.thresholds.branches` 和 `--coverage.thresholds.statements`（默认：`false`）

### coverage.thresholds.autoUpdate

- **CLI:** `--coverage.thresholds.autoUpdate <boolean|function>`
- **Config:** [coverage.thresholds.autoUpdate](/config/coverage#coverage-thresholds-autoupdate)

当当前覆盖率高于配置的阈值时，将 "lines"、"functions"、"branches" 和 "statements" 更新到配置文件中（默认：`false`）

### coverage.thresholds.lines

- **CLI:** `--coverage.thresholds.lines <number>`

行阈值。 访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds) 获取更多信息。 此选项不适用于自定义 provider

### coverage.thresholds.functions

- **CLI:** `--coverage.thresholds.functions <number>`

函数阈值。 访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds) 获取更多信息。 此选项不适用于自定义 provider

### coverage.thresholds.branches

- **CLI:** `--coverage.thresholds.branches <number>`

分支阈值。 访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds) 获取更多信息。 此选项不适用于自定义 provider

### coverage.thresholds.statements

- **CLI:** `--coverage.thresholds.statements <number>`

语句阈值。 访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds) 获取更多信息。 此选项不适用于自定义 provider

### coverage.ignoreClassMethods

- **CLI:** `--coverage.ignoreClassMethods <name>`
- **Config:** [coverage.ignoreClassMethods](/config/coverage#coverage-ignoreclassmethods)

要忽略的类方法名称数组，用于覆盖率统计。 访问 [istanbuljs](https://github.com/istanbuljs/nyc#ignoring-methods) 获取更多信息。 此选项仅适用于 istanbul provider（默认：`[]`）

### coverage.processingConcurrency

- **CLI:** `--coverage.processingConcurrency <number>`
- **Config:** [coverage.processingConcurrency](/config/coverage#coverage-processingconcurrency)

处理覆盖率结果时的并发限制（默认：最小值介于 20 和 CPU 数量之间）

### coverage.customProviderModule

- **CLI:** `--coverage.customProviderModule <path>`
- **Config:** [coverage.customProviderModule](/config/coverage#coverage-customprovidermodule)

指定自定义覆盖率 provider 模块名称或路径。 访问 [Custom Coverage Provider](/guide/coverage#custom-coverage-provider) 获取更多信息。 此选项仅适用于自定义 provider

### coverage.watermarks.statements

- **CLI:** `--coverage.watermarks.statements <watermarks>`

语句的高和低水印，格式为 `<high>,<low>`

### coverage.watermarks.lines

- **CLI:** `--coverage.watermarks.lines <watermarks>`

行的高和低水印，格式为 `<high>,<low>`

### coverage.watermarks.branches

- **CLI:** `--coverage.watermarks.branches <watermarks>`

分支的高和低水印，格式为 `<high>,<low>`

### coverage.watermarks.functions

- **CLI:** `--coverage.watermarks.functions <watermarks>`

函数的高和低水印，格式为 `<high>,<low>`

### coverage.changed

- **CLI:** `--coverage.changed <commit/branch>`
- **Config:** [coverage.changed](/config/coverage#coverage-changed)

仅收集自指定提交或分支（例如 `origin/main` 或 `HEAD~1`）以来更改的文件的覆盖率。 默认继承 `--changed` 的值。

### coverage.excludeAfterRemap

- **CLI:** `--coverage.excludeAfterRemap`
- **Config:** [coverage.excludeAfterRemap](/config/coverage#coverage-excludeafterremap)

在覆盖率重新映射到原始源后再次应用排除。 （默认：false）

### coverage.htmlDir

- **CLI:** `--coverage.htmlDir <path>`
- **Config:** [coverage.htmlDir](/config/coverage#coverage-htmldir)

HTML 覆盖率输出目录，在 UI 模式和 HTML reporter 中提供

### mode

- **CLI:** `--mode <name>`
- **Config:** [mode](/config/mode)

覆盖 Vite 模式（默认：`test` 或 `benchmark`）

### isolate

- **CLI:** `--isolate`
- **Config:** [isolate](/config/isolate)

在每个隔离的环境中运行每个测试文件。 要禁用隔离，请使用 `--no-isolate`（默认：`true`）

### globals

- **CLI:** `--globals`
- **Config:** [globals](/config/globals)

注入全局 API

### dom

- **CLI:** `--dom`

使用 happy-dom 模拟浏览器 API

### browser.enabled

- **CLI:** `--browser.enabled`
- **Config:** [browser.enabled](/config/browser/enabled)

在浏览器中运行测试。 等价于 `--browser.enabled`（默认：`false`）

### browser.name

- **CLI:** `--browser.name <name>`

在所有浏览器中运行所有测试。 一些浏览器仅在特定 provider 中可用（请参阅 `--browser.provider`）

### browser.headless

- **CLI:** `--browser.headless`
- **Config:** [browser.headless](/config/browser/headless)

在无头模式下运行浏览器（即不打开 GUI（图形用户界面））。 如果在 CI 中运行 Vitest，默认启用此选项（默认：`process.env.CI`）

### browser.api.port

- **CLI:** `--browser.api.port [port]`
- **Config:** [browser.api.port](/config/browser/api#api-port)

指定服务器端口。 注意如果端口已被使用，Vite 将自动尝试下一个可用端口，因此这可能不是服务器最终监听的实际端口。 如果为 true，将设置为 `63315`

### browser.api.host

- **CLI:** `--browser.api.host [host]`
- **Config:** [browser.api.host](/config/browser/api#api-host)

指定服务器应监听的 IP 地址。 将其设置为 `0.0.0.0` 或 `true` 以监听所有地址，包括 LAN 和公共地址

### browser.api.strictPort

- **CLI:** `--browser.api.strictPort`
- **Config:** [browser.api.strictPort](/config/browser/api#api-strictport)

设置为 true 以在端口已被使用时退出，而不是自动尝试下一个可用端口

### browser.api.allowExec

- **CLI:** `--browser.api.allowExec`
- **Config:** [browser.api.allowExec](/config/browser/api#api-allowexec)

允许 API 执行代码。 （在不受信任的环境中启用此选项时请小心）

### browser.api.allowWrite

- **CLI:** `--browser.api.allowWrite`
- **Config:** [browser.api.allowWrite](/config/browser/api#api-allowwrite)

允许 API 编辑文件。 （在不受信任的环境中启用此选项时请小心）

### browser.isolate

- **CLI:** `--browser.isolate`
- **Config:** [browser.isolate](/config/browser/isolate)

在每个隔离的环境中运行每个浏览器测试文件。 要禁用隔离，请使用 `--browser.isolate=false`（默认：`true`）

### browser.ui

- **CLI:** `--browser.ui`
- **Config:** [browser.ui](/config/browser/ui)

在运行测试时显示 Vitest 用户界面（默认：`!process.env.CI`）

### browser.detailsPanelPosition

- **CLI:** `--browser.detailsPanelPosition <position>`
- **Config:** [browser.detailsPanelPosition](/config/browser/detailspanelposition)

详细信息面板的默认位置。 可以是 `right`（水平拆分）或 `bottom`（垂直拆分）（默认：`right`）

### browser.fileParallelism

- **CLI:** `--browser.fileParallelism`

浏览器测试文件是否并行运行。 使用 `--browser.fileParallelism=false` 禁用（默认：`true`）

### browser.connectTimeout

- **CLI:** `--browser.connectTimeout <timeout>`
- **Config:** [browser.connectTimeout](/config/browser/connecttimeout)

如果连接到浏览器的时间更长，测试套件将失败（默认：`60_000`）

### browser.trackUnhandledErrors

- **CLI:** `--browser.trackUnhandledErrors`
- **Config:** [browser.trackUnhandledErrors](/config/browser/trackunhandlederrors)

控制 Vitest 是否捕获未处理的异常以便报告（默认：`true`）

### browser.trace

- **CLI:** `--browser.trace <mode>`
- **Config:** [browser.trace](/config/browser/trace)

启用跟踪视图模式。 支持："on"、"off"、"on-first-retry"、"on-all-retries"、"retain-on-failure"。

### browser.locators.exact

- **CLI:** `--browser.locators.exact`
- **Config:** [browser.locators.exact](/config/browser/locators#locators-exact)

定位器默认是否应精确匹配文本（默认：`false`）

### pool

- **CLI:** `--pool <pool>`
- **Config:** [pool](/config/pool)

指定池，如果不在浏览器中运行（默认：`forks`）

### execArgv

- **CLI:** `--execArgv <option>`
- **Config:** [execArgv](/config/execargv)

在生成 worker_threads 或 child_process 时向 node 进程传递额外的参数。

### vmMemoryLimit

- **CLI:** `--vmMemoryLimit <limit>`
- **Config:** [vmMemoryLimit](/config/vmmemorylimit)

虚拟机池的内存限制。 如果看到内存泄漏，请尝试调整此值。

### fileParallelism

- **CLI:** `--fileParallelism`
- **Config:** [fileParallelism](/config/fileparallelism)

所有测试文件是否并行运行。 使用 `--no-file-parallelism` 禁用（默认：`true`）

### maxWorkers

- **CLI:** `--maxWorkers <workers>`
- **Config:** [maxWorkers](/config/maxworkers)

运行测试的最大工作线程数或百分比

### environment

- **CLI:** `--environment <name>`
- **Config:** [environment](/config/environment)

指定运行器环境，如果不在浏览器中运行（默认：`node`）

### passWithNoTests

- **CLI:** `--passWithNoTests`
- **Config:** [passWithNoTests](/config/passwithnotests)

在没有找到测试时通过

### logHeapUsage

- **CLI:** `--logHeapUsage`
- **Config:** [logHeapUsage](/config/logheapusage)

在 node 模式下运行时显示每个测试的堆大小

### detectAsyncLeaks

- **CLI:** `--detectAsyncLeaks`
- **Config:** [detectAsyncLeaks](/config/detectasyncleaks)

检测测试文件中的异步资源泄漏（默认：`false`）

### allowOnly

- **CLI:** `--allowOnly`
- **Config:** [allowOnly](/config/allowonly)

允许标记为 only 的测试和套件（默认：`!process.env.CI`）

### dangerouslyIgnoreUnhandledErrors

- **CLI:** `--dangerouslyIgnoreUnhandledErrors`
- **Config:** [dangerouslyIgnoreUnhandledErrors](/config/dangerouslyignoreunhandlederrors)

忽略任何未处理的错误

### sequence.shuffle.files

- **CLI:** `--sequence.shuffle.files`
- **Config:** [sequence.shuffle.files](/config/sequence#sequence-shuffle-files)

以随机顺序运行文件。 如果启用此选项，长时间运行的测试不会更早开始。 （默认：`false`）

### sequence.shuffle.tests

- **CLI:** `--sequence.shuffle.tests`
- **Config:** [sequence.shuffle.tests](/config/sequence#sequence-shuffle-tests)

以随机顺序运行测试（默认：`false`）

### sequence.concurrent

- **CLI:** `--sequence.concurrent`
- **Config:** [sequence.concurrent](/config/sequence#sequence-concurrent)

使测试并行运行（默认：`false`）

### sequence.seed

- **CLI:** `--sequence.seed <seed>`
- **Config:** [sequence.seed](/config/sequence#sequence-seed)

设置随机化种子。 如果 `--sequence.shuffle` 为假，则此选项无效。 访问 ["Random Seed"](https://en.wikipedia.org/wiki/Random_seed) 页面获取更多信息

### sequence.hooks

- **CLI:** `--sequence.hooks <order>`
- **Config:** [sequence.hooks](/config/sequence#sequence-hooks)

更改钩子的执行顺序。 接受值："stack"、"list" 和 "parallel"。 访问 [`sequence.hooks`](/config/sequence#sequence-hooks) 获取更多信息（默认：`"parallel"`）

### sequence.setupFiles

- **CLI:** `--sequence.setupFiles <order>`
- **Config:** [sequence.setupFiles](/config/sequence#sequence-setupfiles)

更改 setup 文件的执行顺序。 接受值："list" 和 "parallel"。 如果设置为 "list"，将按定义顺序运行 setup 文件。 如果设置为 "parallel"，将并行运行 setup 文件（默认：`"parallel"`）

### inspect

- **CLI:** `--inspect [[host:]port]`

启用 Node.js 检查器（默认：`127.0.0.1:9229`）

### inspectBrk

- **CLI:** `--inspectBrk [[host:]port]`

启用 Node.js 检查器并在测试开始前中断

### testTimeout

- **CLI:** `--testTimeout <timeout>`
- **Config:** [testTimeout](/config/testtimeout)

测试的默认超时时间（毫秒）。 使用 `0` 完全禁用超时（默认：`5000`）

### hookTimeout

- **CLI:** `--hookTimeout <timeout>`
- **Config:** [hookTimeout](/config/hooktimeout)

默认的钩子超时时间（毫秒）。 使用 `0` 完全禁用超时（默认：`10000`）

### bail

- **CLI:** `--bail <number>`
- **Config:** [bail](/config/bail)

在给定数量的测试失败后停止测试执行（默认：`0`）

### retry.count

- **CLI:** `--retry.count <times>`
- **Config:** [retry.count](/config/retry#retry-count)

如果测试失败，重试次数（默认：`0`）

### retry.delay

- **CLI:** `--retry.delay <ms>`
- **Config:** [retry.delay](/config/retry#retry-delay)

重试尝试之间的延迟（毫秒）（默认：`0`）

### retry.condition

- **CLI:** `--retry.condition <pattern>`
- **Config:** [retry.condition](/config/retry#retry-condition)

匹配应触发重试的错误消息的 Regex 模式。 仅重试匹配此模式的错误（默认：在所有错误上重试）

### diff.aAnnotation

- **CLI:** `--diff.aAnnotation <annotation>`
- **Config:** [diff.aAnnotation](/config/diff#diff-aannotation)

预期行的注释（默认：`Expected`）

### diff.aIndicator

- **CLI:** `--diff.aIndicator <indicator>`
- **Config:** [diff.aIndicator](/config/diff#diff-aindicator)

预期行的指示符（默认：`-`）

### diff.bAnnotation

- **CLI:** `--diff.bAnnotation <annotation>`
- **Config:** [diff.bAnnotation](/config/diff#diff-bannotation)

接收行的注释（默认：`Received`）

### diff.bIndicator

- **CLI:** `--diff.bIndicator <indicator>`
- **Config:** [diff.bIndicator](/config/diff#diff-bindicator)

接收行的指示符（默认：`+`）

### diff.commonIndicator

- **CLI:** `--diff.commonIndicator <indicator>`
- **Config:** [diff.commonIndicator](/config/diff#diff-commonindicator)

公共行的指示符（默认：` `）

### diff.contextLines

- **CLI:** `--diff.contextLines <lines>`
- **Config:** [diff.contextLines](/config/diff#diff-contextlines)

每个变更周围显示的上下文行数（默认：`5`）

### diff.emptyFirstOrLastLinePlaceholder

- **CLI:** `--diff.emptyFirstOrLastLinePlaceholder <placeholder>`
- **Config:** [diff.emptyFirstOrLastLinePlaceholder](/config/diff#diff-emptyfirstorlastlineplaceholder)

空的第一行或最后一行的占位符（默认：`""`）

### diff.expand

- **CLI:** `--diff.expand`
- **Config:** [diff.expand](/config/diff#diff-expand)

展开所有公共行（默认：`true`）

### diff.includeChangeCounts

- **CLI:** `--diff.includeChangeCounts`
- **Config:** [diff.includeChangeCounts](/config/diff#diff-includechangecounts)

在差异输出中包含比较计数（默认：`false`）

### diff.omitAnnotationLines

- **CLI:** `--diff.omitAnnotationLines`
- **Config:** [diff.omitAnnotationLines](/config/diff#diff-omitannotationlines)

从输出中省略注释行（默认：`false`）

### diff.printBasicPrototype

- **CLI:** `--diff.printBasicPrototype`
- **Config:** [diff.printBasicPrototype](/config/diff#diff-printbasicprototype)

打印基本的原型对象和数组（默认：`true`）

### diff.maxDepth

- **CLI:** `--diff.maxDepth <maxDepth>`
- **Config:** [diff.maxDepth](/config/diff#diff-maxdepth)

在打印嵌套对象时限制递归深度（默认：`20`）

### diff.truncateThreshold

- **CLI:** `--diff.truncateThreshold <threshold>`
- **Config:** [diff.truncateThreshold](/config/diff#diff-truncatethreshold)

在每次变更前后显示的行数（默认：`0`）

### diff.truncateAnnotation

- **CLI:** `--diff.truncateAnnotation <annotation>`
- **Config:** [diff.truncateAnnotation](/config/diff#diff-truncateannotation)

截断行的注释（默认：`... Diff result is truncated`）

### exclude

- **CLI:** `--exclude <glob>`
- **Config:** [exclude](/config/exclude)

排除测试的额外文件通配符

### expandSnapshotDiff

- **CLI:** `--expandSnapshotDiff`
- **Config:** [expandSnapshotDiff](/config/expandsnapshotdiff)

快照失败时显示完整差异

### disableConsoleIntercept

- **CLI:** `--disableConsoleIntercept`
- **Config:** [disableConsoleIntercept](/config/disableconsoleintercept)

禁用自动拦截控制台日志（默认：`false`）

### typecheck.enabled

- **CLI:** `--typecheck.enabled`
- **Config:** [typecheck.enabled](/config/typecheck#typecheck-enabled)

启用类型检查（默认：`false`）

### typecheck.only

- **CLI:** `--typecheck.only`
- **Config:** [typecheck.only](/config/typecheck#typecheck-only)

仅运行类型检查测试。 这将自动启用类型检查（默认：`false`）

### typecheck.checker

- **CLI:** `--typecheck.checker <name>`
- **Config:** [typecheck.checker](/config/typecheck#typecheck-checker)

指定要使用的类型检查器。可用值："tsc"、"vue-tsc" 和可执行文件路径（默认：`"tsc"`）

### typecheck.allowJs

- **CLI:** `--typecheck.allowJs`
- **Config:** [typecheck.allowJs](/config/typecheck#typecheck-allowjs)

允许 JavaScript 文件进行类型检查。 默认从 tsconfig.json 获取值

### typecheck.ignoreSourceErrors

- **CLI:** `--typecheck.ignoreSourceErrors`
- **Config:** [typecheck.ignoreSourceErrors](/config/typecheck#typecheck-ignoresourceerrors)

忽略源文件中的类型错误

### typecheck.tsconfig

- **CLI:** `--typecheck.tsconfig <path>`
- **Config:** [typecheck.tsconfig](/config/typecheck#typecheck-tsconfig)

自定义 tsconfig 文件的路径

### typecheck.spawnTimeout

- **CLI:** `--typecheck.spawnTimeout <time>`
- **Config:** [typecheck.spawnTimeout](/config/typecheck#typecheck-spawntimeout)

启动类型检查器所需的最小时间（毫秒）

### project

- **CLI:** `--project <name>`

要运行的项目名称（如果你使用的是 Vitest 工作区功能）。 可以重复以运行多个项目：`--project=1 --project=2`。 还可以使用通配符筛选项目，如 `--project=packages*`，并使用 `--project=!pattern` 排除项目。

### slowTestThreshold

- **CLI:** `--slowTestThreshold <threshold>`
- **Config:** [slowTestThreshold](/config/slowtestthreshold)

测试或套件被认定为缓慢的阈值（毫秒）（默认：`300`）

### teardownTimeout

- **CLI:** `--teardownTimeout <timeout>`
- **Config:** [teardownTimeout](/config/teardowntimeout)

清理函数的默认超时时间（毫秒）（默认：`10000`）

### maxConcurrency

- **CLI:** `--maxConcurrency <number>`
- **Config:** [maxConcurrency](/config/maxconcurrency)

测试文件执行期间并发测试和套件的最大数量（默认：`5`）

### expect.requireAssertions

- **CLI:** `--expect.requireAssertions`
- **Config:** [expect.requireAssertions](/config/expect#expect-requireassertions)

要求所有测试至少包含一个断言

### expect.poll.interval

- **CLI:** `--expect.poll.interval <interval>`
- **Config:** [expect.poll.interval](/config/expect#expect-poll-interval)

expect.poll() 断言的轮询间隔（毫秒）（默认：`50`）

### expect.poll.timeout

- **CLI:** `--expect.poll.timeout <timeout>`
- **Config:** [expect.poll.timeout](/config/expect#expect-poll-timeout)

expect.poll() 断言的轮询超时（毫秒）（默认：`1000`）

### printConsoleTrace

- **CLI:** `--printConsoleTrace`
- **Config:** [printConsoleTrace](/config/printconsoletrace)

始终打印控制台堆栈跟踪

### includeTaskLocation

- **CLI:** `--includeTaskLocation`
- **Config:** [includeTaskLocation](/config/includetasklocation)

在 `location` 属性中收集测试和套件位置

### attachmentsDir

- **CLI:** `--attachmentsDir <dir>`
- **Config:** [attachmentsDir](/config/attachmentsdir)

`context.annotate` 存储附件的目录（默认：`.vitest-attachments`）

### run

- **CLI:** `--run`

禁用监视模式

### color

- **CLI:** `--no-color`

从控制台输出中移除颜色

### clearScreen

- **CLI:** `--clearScreen`

在监视模式重新运行时清除终端屏幕（默认：`true`）

### configLoader

- **CLI:** `--configLoader <loader>`

使用 `bundle` 将配置与 esbuild 捆绑，或使用 `runner`（实验性）在运行时处理配置。这仅在 Vite 6.1.0 及更高版本中可用。（默认：`bundle`）

### standalone

- **CLI:** `--standalone`

启动 Vitest 而不运行测试。仅当检测到更改时才会运行测试。如果启用了浏览器模式，将自动打开用户界面。当传递 CLI 文件筛选器时，忽略此选项。（默认：`false`）

### listTags

- **CLI:** `--listTags [type]`

列出所有可用标签而不是运行测试。`--list-tags=json` 将以 JSON 格式输出标签（如果没有标签则不输出）。

### clearCache

- **CLI:** `--clearCache`

删除所有 Vitest 缓存，包括 `experimental.fsModuleCache`，而不运行任何测试。后续测试运行将降低性能。

### tagsFilter

- **CLI:** `--tagsFilter <expression>`

仅运行具有指定标签的测试。可以使用逻辑运算符 `&&`（与）、`||`（或）和 `!`（非）来创建复杂表达式，详见 [Test Tags](/guide/test-tags#syntax)。

### strictTags

- **CLI:** `--strictTags`
- **Config:** [strictTags](/config/stricttags)

如果测试具有配置中未定义的标签，Vitest 应抛出错误。（默认：`true`）

### experimental.fsModuleCache

- **CLI:** `--experimental.fsModuleCache`
- **Config:** [experimental.fsModuleCache](/config/experimental#experimental-fsmodulecache)

启用文件系统模块缓存，以便在重新运行之间缓存模块。

### experimental.importDurations.print

- **CLI:** `--experimental.importDurations.print <boolean|on-warn>`
- **Config:** [experimental.importDurations.print](/config/experimental#experimental-importdurations-print)

何时在 CLI 终端中打印导入分解。使用 `true` 始终打印，`false` 从不打印，或 `on-warn` 仅在导入超过警告阈值时打印（默认：false）

### experimental.importDurations.limit

- **CLI:** `--experimental.importDurations.limit <number>`
- **Config:** [experimental.importDurations.limit](/config/experimental#experimental-importdurations-limit)

收集和显示的最大导入数（默认：0，或者如果启用 print 或 UI，则为 10）

### experimental.importDurations.failOnDanger

- **CLI:** `--experimental.importDurations.failOnDanger`
- **Config:** [experimental.importDurations.failOnDanger](/config/experimental#experimental-importdurations-failondanger)

如果任何导入超过危险阈值，则使测试运行失败（默认：false）

### experimental.importDurations.thresholds.warn

- **CLI:** `--experimental.importDurations.thresholds.warn <number>`
- **Config:** [experimental.importDurations.thresholds.warn](/config/experimental#experimental-importdurations-thresholds-warn)

警告阈值 - 超过此阈值的导入将显示为黄色/橙色（默认：100）

### experimental.importDurations.thresholds.danger

- **CLI:** `--experimental.importDurations.thresholds.danger <number>`
- **Config:** [experimental.importDurations.thresholds.danger](/config/experimental#experimental-importdurations-thresholds-danger)

危险阈值 - 超过此阈值的导入将显示为红色（默认：500）

### experimental.viteModuleRunner

- **CLI:** `--experimental.viteModuleRunner`
- **Config:** [experimental.viteModuleRunner](/config/experimental#experimental-vitemodulerunner)

控制 Vitest 是否使用 Vite 的模块运行器来运行代码，或回退到本机 `import`。（默认：`true`）

### experimental.nodeLoader

- **CLI:** `--experimental.nodeLoader`
- **Config:** [experimental.nodeLoader](/config/experimental#experimental-nodeloader)

控制 Vitest 是否将使用 Node.js Loader API 来处理源代码或模拟文件。这在启用 `viteModuleRunner` 时无效。禁用此选项可以提高性能。（默认：`true`）

### experimental.vcsProvider

- **CLI:** `--experimental.vcsProvider <path>`
- **Config:** [experimental.vcsProvider](/config/experimental#experimental-vcsprovider)

自定义提供程序，用于检测已更改的文件。（默认：`git`）

### experimental.preParse

- **CLI:** `--experimental.preParse`
- **Config:** [experimental.preParse](/config/experimental#experimental-preparse)

在运行测试之前解析测试规范。这将应用 `.only` 标志和测试名称模式到所有文件，而无需运行它们。（默认：`false`）
