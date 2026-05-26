### 根路径

- **CLI:** `-r, --root <path>`
- **Config:** [root](/config/root)

根路径

### 配置

- **CLI:** `-c, --config <path>`

配置文件的路径

### 更新

- **CLI:** `-u, --update [type]`
- **Config:** [update](/config/update)

更新快照（接受 boolean、"new"、"all" 或 "none"）

### 监听

- **CLI:** `-w, --watch`
- **Config:** [watch](/config/watch)

启用监听模式

### 测试名称模式

- **CLI:** `-t, --testNamePattern <pattern>`
- **Config:** [testNamePattern](/config/testnamepattern)

运行完整名称匹配指定正则表达式模式的测试

### 目录

- **CLI:** `--dir <path>`
- **Config:** [dir](/config/dir)

扫描测试文件的基础目录

### UI

- **CLI:** `--ui`

启用 UI

### 打开

- **CLI:** `--open`
- **Config:** [open](/config/open)

自动打开 UI（默认：`!process.env.CI`）

### api.port

- **CLI:** `--api.port [port]`

指定服务器端口。注意，如果该端口已被占用，Vite 会自动尝试下一个可用端口，因此这可能不是服务器最终监听的实际端口。如果为 true，将设置为 `51204`

### api.host

- **CLI:** `--api.host [host]`

指定服务器应监听的 IP 地址。将其设置为 `0.0.0.0` 或 `true` 可监听所有地址，包括局域网和公网地址

### api.strictPort

- **CLI:** `--api.strictPort`

设置为 true 时，如果端口已被占用则退出，而不是自动尝试下一个可用端口

### api.allowExec

- **CLI:** `--api.allowExec`
- **Config:** [api.allowExec](/config/api#api-allowexec)

允许 API 执行代码。（在不受信任的环境中启用此选项时请谨慎）

### api.allowWrite

- **CLI:** `--api.allowWrite`
- **Config:** [api.allowWrite](/config/api#api-allowwrite)

允许 API 编辑文件。（在不受信任的环境中启用此选项时请谨慎）

### 静默

- **CLI:** `--silent [value]`
- **Config:** [silent](/config/silent)

静默输出测试日志。使用 `'passed-only'` 仅查看失败测试的日志。

### 隐藏跳过的测试

- **CLI:** `--hideSkippedTests`

隐藏被跳过测试的日志

### 报告器

- **CLI:** `--reporter <name>`
- **Config:** [reporters](/config/reporters)

指定报告器（default、agent、minimal、blob、verbose、dot、json、tap、tap-flat、junit、tree、hanging-process、github-actions）

### 输出文件

- **CLI:** `--outputFile <filename/-s>`
- **Config:** [outputFile](/config/outputfile)

当同时指定了受支持的 reporter 时，将测试结果写入文件；使用 cac 的点号语法为多个 reporter 的单独输出指定路径（例如：`--outputFile.tap=./tap.txt`）

### coverage.provider

- **CLI:** `--coverage.provider <name>`
- **Config:** [coverage.provider](/config/coverage#coverage-provider)

选择用于收集覆盖率的工具，可用值为："v8"、"istanbul" 和 "custom"

### coverage.enabled

- **CLI:** `--coverage.enabled`
- **Config:** [coverage.enabled](/config/coverage#coverage-enabled)

启用覆盖率收集。可通过 `--coverage` CLI 选项覆盖（默认：`false`）

### coverage.include

- **CLI:** `--coverage.include <pattern>`
- **Config:** [coverage.include](/config/coverage#coverage-include)

以 glob 模式包含在覆盖率中的文件。使用多个模式时可指定多次。默认仅包含被测试覆盖到的文件。

### coverage.exclude

- **CLI:** `--coverage.exclude <pattern>`
- **Config:** [coverage.exclude](/config/coverage#coverage-exclude)

要从覆盖率中排除的文件。使用多个扩展名时可指定多次。

### coverage.clean

- **CLI:** `--coverage.clean`
- **Config:** [coverage.clean](/config/coverage#coverage-clean)

在运行测试前清理覆盖率结果（默认：`true`）

### coverage.cleanOnRerun

- **CLI:** `--coverage.cleanOnRerun`
- **Config:** [coverage.cleanOnRerun](/config/coverage#coverage-cleanonrerun)

在 watch 重新运行时清理覆盖率报告（默认：`true`）

### coverage.reportsDirectory

- **CLI:** `--coverage.reportsDirectory <path>`
- **Config:** [coverage.reportsDirectory](/config/coverage#coverage-reportsdirectory)

写入覆盖率报告的目录（默认：`./coverage`）

### coverage.reporter

- **CLI:** `--coverage.reporter <name>`
- **Config:** [coverage.reporter](/config/coverage#coverage-reporter)

要使用的覆盖率报告器。更多信息请访问 [`coverage.reporter`](/config/coverage#coverage-reporter)（默认：`["text", "html", "clover", "json"]`）

### coverage.reportOnFailure

- **CLI:** `--coverage.reportOnFailure`
- **Config:** [coverage.reportOnFailure](/config/coverage#coverage-reportonfailure)

即使测试失败也生成覆盖率报告（默认：`false`）

### coverage.allowExternal

- **CLI:** `--coverage.allowExternal`
- **Config:** [coverage.allowExternal](/config/coverage#coverage-allowexternal)

收集项目根目录之外文件的覆盖率（默认：`false`）

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

按文件检查阈值。实际阈值请参见 `--coverage.thresholds.lines`、`--coverage.thresholds.functions`、`--coverage.thresholds.branches` 和 `--coverage.thresholds.statements`（默认：`false`）

### coverage.thresholds.autoUpdate

- **CLI:** `--coverage.thresholds.autoUpdate <boolean|function>`
- **Config:** [coverage.thresholds.autoUpdate](/config/coverage#coverage-thresholds-autoupdate)

当当前覆盖率高于配置阈值时，将 "lines"、"functions"、"branches" 和 "statements" 的阈值更新到配置文件（默认：`false`）

### coverage.thresholds.lines

- **CLI:** `--coverage.thresholds.lines <number>`

行覆盖率阈值。更多信息请访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds)。此选项不适用于自定义 provider

### coverage.thresholds.functions

- **CLI:** `--coverage.thresholds.functions <number>`

函数覆盖率阈值。更多信息请访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds)。此选项不适用于自定义 provider

### coverage.thresholds.branches

- **CLI:** `--coverage.thresholds.branches <number>`

分支覆盖率阈值。更多信息请访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds)。此选项不适用于自定义 provider

### coverage.thresholds.statements

- **CLI:** `--coverage.thresholds.statements <number>`

语句覆盖率阈值。更多信息请访问 [istanbuljs](https://github.com/istanbuljs/nyc#coverage-thresholds)。此选项不适用于自定义 provider

### coverage.ignoreClassMethods

- **CLI:** `--coverage.ignoreClassMethods <name>`
- **Config:** [coverage.ignoreClassMethods](/config/coverage#coverage-ignoreclassmethods)

用于忽略覆盖率统计的类方法名数组。更多信息请访问 [istanbuljs](https://github.com/istanbuljs/nyc#ignoring-methods)。此选项仅适用于 istanbul providers（默认：`[]`）

### coverage.processingConcurrency

- **CLI:** `--coverage.processingConcurrency <number>`
- **Config:** [coverage.processingConcurrency](/config/coverage#coverage-processingconcurrency)

处理覆盖率结果时使用的并发限制。（默认值为 20 与 CPU 数量之间的较小值）

### coverage.customProviderModule

- **CLI:** `--coverage.customProviderModule <path>`
- **Config:** [coverage.customProviderModule](/config/coverage#coverage-customprovidermodule)

指定自定义覆盖率 provider 模块的模块名或路径。更多信息请访问 [自定义覆盖率 provider](/guide/coverage#custom-coverage-provider)。此选项仅适用于自定义 provider

### coverage.watermarks.statements

- **CLI:** `--coverage.watermarks.statements <watermarks>`

语句的高低水位线，格式为 `<high>,<low>`

### coverage.watermarks.lines

- **CLI:** `--coverage.watermarks.lines <watermarks>`

行的高低水位线，格式为 `<high>,<low>`

### coverage.watermarks.branches

- **CLI:** `--coverage.watermarks.branches <watermarks>`

分支的高低水位线，格式为 `<high>,<low>`

### coverage.watermarks.functions

- **CLI:** `--coverage.watermarks.functions <watermarks>`

函数的高低水位线，格式为 `<high>,<low>`

### coverage.changed

- **CLI:** `--coverage.changed <commit/branch>`
- **Config:** [coverage.changed](/config/coverage#coverage-changed)

仅收集自指定提交或分支以来发生变更文件的覆盖率（例如 `origin/main` 或 `HEAD~1`）。默认继承 `--changed` 的值。

### coverage.excludeAfterRemap

- **CLI:** `--coverage.excludeAfterRemap`
- **Config:** [coverage.excludeAfterRemap](/config/coverage#coverage-excludeafterremap)

在覆盖率映射回原始源文件后再次应用排除规则。（默认：`false`）

### coverage.htmlDir

- **CLI:** `--coverage.htmlDir <path>`
- **Config:** [coverage.htmlDir](/config/coverage#coverage-htmldir)

在 UI 模式和 HTML reporter 中提供的 HTML 覆盖率输出目录。

### coverage.autoAttachSubprocess

- **CLI:** `--coverage.autoAttachSubprocess`
- **Config:** [coverage.autoAttachSubprocess](/config/coverage#coverage-autoattachsubprocess)

跟踪测试运行期间启动的 `node:child_process` 和 `node:worker_threads` 的覆盖率。仅受 `v8` provider 支持。（默认：`false`）

### 模式

- **CLI:** `--mode <name>`
- **Config:** [mode](/config/mode)

覆盖 Vite 模式（默认：`test` 或 `benchmark`）

### 隔离

- **CLI:** `--isolate`
- **Config:** [isolate](/config/isolate)

隔离运行每个测试文件。要禁用隔离，请使用 `--no-isolate`（默认：`true`）

### 全局变量

- **CLI:** `--globals`

全局注入 API

### dom

- **CLI:** `--dom`

使用 happy-dom 模拟浏览器 API

### browser.enabled

- **CLI:** `--browser.enabled`
- **Config:** [browser.enabled](/config/browser/enabled)

在浏览器中运行测试。等同于 `--browser.enabled`（默认：`false`）

### browser.name

- **CLI:** `--browser.name <name>`

在指定浏览器中运行所有测试。某些浏览器仅对特定 provider 可用（请参见 `--browser.provider`）。

### browser.headless

- **CLI:** `--browser.headless`
- **Config:** [browser.headless](/config/browser/headless)

以无头模式运行浏览器（即不打开 GUI（图形用户界面））。如果你在 CI 中运行 Vitest，则默认启用（默认：`process.env.CI`）

### browser.api.port

- **CLI:** `--browser.api.port [port]`
- **Config:** [browser.api.port](/config/browser/api#api-port)

指定服务器端口。注意，如果该端口已被占用，Vite 会自动尝试下一个可用端口，因此这可能不是服务器最终监听的实际端口。如果为 true，将设置为 `63315`

### browser.api.host

- **CLI:** `--browser.api.host [host]`
- **Config:** [browser.api.host](/config/browser/api#api-host)

指定服务器应监听的 IP 地址。将其设置为 `0.0.0.0` 或 `true` 可监听所有地址，包括局域网和公网地址

### browser.api.strictPort

- **CLI:** `--browser.api.strictPort`
- **Config:** [browser.api.strictPort](/config/browser/api#api-strictport)

设置为 true 时，如果端口已被占用则退出，而不是自动尝试下一个可用端口

### browser.api.allowExec

- **CLI:** `--browser.api.allowExec`
- **Config:** [browser.api.allowExec](/config/browser/api#api-allowexec)

允许 API 执行代码。（在不受信任的环境中启用此选项时请谨慎）

### browser.api.allowWrite

- **CLI:** `--browser.api.allowWrite`
- **Config:** [browser.api.allowWrite](/config/browser/api#api-allowwrite)

允许 API 编辑文件。（在不受信任的环境中启用此选项时请谨慎）

### browser.isolate

- **CLI:** `--browser.isolate`
- **Config:** [browser.isolate](/config/browser/isolate)

隔离运行每个浏览器测试文件。要禁用隔离，请使用 `--browser.isolate=false`（默认：`true`）

### browser.ui

- **CLI:** `--browser.ui`
- **Config:** [browser.ui](/config/browser/ui)

运行测试时显示 Vitest UI（默认：`!process.env.CI`）

### browser.detailsPanelPosition

- **CLI:** `--browser.detailsPanelPosition <position>`
- **Config:** [browser.detailsPanelPosition](/config/browser/detailspanelposition)

浏览器模式下详情面板的默认位置。可以是 `right`（水平分割）或 `bottom`（垂直分割）（默认：`right`）

### browser.fileParallelism

- **CLI:** `--browser.fileParallelism`

浏览器测试文件是否应并行运行。使用 `--browser.fileParallelism=false` 可禁用（默认：`true`）

### browser.connectTimeout

- **CLI:** `--browser.connectTimeout <timeout>`
- **Config:** [browser.connectTimeout](/config/browser/connecttimeout)

如果连接浏览器耗时更长，测试套件将失败（默认：`60_000`）

### browser.trackUnhandledErrors

- **CLI:** `--browser.trackUnhandledErrors`
- **Config:** [browser.trackUnhandledErrors](/config/browser/trackunhandlederrors)

控制 Vitest 是否捕获未处理异常以便报告（默认：`true`）

### browser.trace

- **CLI:** `--browser.trace <mode>`
- **Config:** [browser.trace](/config/browser/trace)

启用 trace 视图模式。支持："on"、"off"、"on-first-retry"、"on-all-retries"、"retain-on-failure"。

### browser.traceView.enabled

- **CLI:** `--browser.traceView.enabled`
- **Config:** [browser.traceView.enabled](/config/browser/traceview#traceview-enabled)

为浏览器测试启用 Vitest trace-view 收集（默认：`false`）

### browser.traceView.recordCanvas

- **CLI:** `--browser.traceView.recordCanvas`
- **Config:** [browser.traceView.recordCanvas](/config/browser/traceview#traceview-recordcanvas)

在 trace-view 快照中捕获 canvas 像素（默认：`false`）

### browser.traceView.inlineImages

- **CLI:** `--browser.traceView.inlineImages`
- **Config:** [browser.traceView.inlineImages](/config/browser/traceview#traceview-inlineimages)

在 trace-view 快照中内联已加载的图像像素（默认：`false`）

### browser.locators.exact

- **CLI:** `--browser.locators.exact`
- **Config:** [browser.locators.exact](/config/browser/locators#locators-exact)

定位器默认是否应精确匹配文本（默认：`true`）

### 池

- **CLI:** `--pool <pool>`
- **Config:** [pool](/config/pool)

指定池，如果不是在浏览器中运行（默认：`forks`）

### execArgv

- **CLI:** `--execArgv <option>`
- **Config:** [execArgv](/config/execargv)

在启动 `worker_threads` 或 `child_process` 时向 `node` 进程传递额外参数。

### vmMemoryLimit

- **CLI:** `--vmMemoryLimit <limit>`
- **Config:** [vmMemoryLimit](/config/vmmemorylimit)

VM 池的内存限制。如果你看到内存泄漏，可以尝试调整此值。

### fileParallelism

- **CLI:** `--fileParallelism`
- **Config:** [fileParallelism](/config/fileparallelism)

是否应并行运行所有测试文件。使用 `--no-file-parallelism` 可禁用（默认：`true`）

### maxWorkers

- **CLI:** `--maxWorkers <workers>`
- **Config:** [maxWorkers](/config/maxworkers)

运行测试的 worker 最大数量或百分比

### 环境

- **CLI:** `--environment <name>`
- **Config:** [environment](/config/environment)

指定运行器环境，如果不是在浏览器中运行（默认：`node`）

### 未找到测试时通过

- **CLI:** `--passWithNoTests`
- **Config:** [passWithNoTests](/config/passwithnotests)

当未找到测试时通过

### 显示堆内存使用情况

- **CLI:** `--logHeapUsage`
- **Config:** [logHeapUsage](/config/logheapusage)

在 node 中运行时显示每个测试的堆内存大小

### 检测异步泄漏

- **CLI:** `--detectAsyncLeaks`
- **Config:** [detectAsyncLeaks](/config/detectasyncleaks)

检测测试文件中泄漏的异步资源（默认：`false`）

### 允许 only

- **CLI:** `--allowOnly`
- **Config:** [allowOnly](/config/allowonly)

允许标记为 only 的测试和测试套件（默认：`!process.env.CI`）

### 危险地忽略未处理错误

- **CLI:** `--dangerouslyIgnoreUnhandledErrors`
- **Config:** [dangerouslyIgnoreUnhandledErrors](/config/dangerouslyignoreunhandlederrors)

忽略发生的任何未处理错误

### sequence.shuffle.files

- **CLI:** `--sequence.shuffle.files`
- **Config:** [sequence.shuffle.files](/config/sequence#sequence-shuffle-files)

按随机顺序运行文件。启用此选项后，长时间运行的测试不会更早开始。（默认：`false`）

### sequence.shuffle.tests

- **CLI:** `--sequence.shuffle.tests`
- **Config:** [sequence.shuffle.tests](/config/sequence#sequence-shuffle-tests)

按随机顺序运行测试（默认：`false`）

### sequence.concurrent

- **CLI:** `--sequence.concurrent`
- **Config:** [sequence.concurrent](/config/sequence#sequence-concurrent)

使测试并行运行（默认：`false`）

### sequence.seed

- **CLI:** `--sequence.seed <seed>`
- **Config:** [sequence.seed](/config/sequence#sequence-seed)

设置随机化种子。如果 `--sequence.shuffle` 为假值，此选项将无效。更多信息请访问 ["Random Seed" page](https://en.wikipedia.org/wiki/Random_seed)

### sequence.hooks

- **CLI:** `--sequence.hooks <order>`
- **Config:** [sequence.hooks](/config/sequence#sequence-hooks)

更改 hooks 的执行顺序。可接受值为："stack"、"list" 和 "parallel"。更多信息请访问 [`sequence.hooks`](/config/sequence#sequence-hooks)（默认：`"parallel"`）

### sequence.setupFiles

- **CLI:** `--sequence.setupFiles <order>`
- **Config:** [sequence.setupFiles](/config/sequence#sequence-setupfiles)

更改 setup 文件的执行顺序。可接受值为："list" 和 "parallel"。如果设置为 "list"，将按定义顺序运行 setup 文件。如果设置为 "parallel"，将并行运行 setup 文件（默认：`"parallel"`）

### inspect

- **CLI:** `--inspect [[host:]port]`

启用 Node.js inspector（默认：`127.0.0.1:9229`）

### inspectBrk

- **CLI:** `--inspectBrk [[host:]port]`

启用 Node.js inspector，并在测试开始前中断

### testTimeout

- **CLI:** `--testTimeout <timeout>`
- **Config:** [testTimeout](/config/testtimeout)

测试的默认超时时间（毫秒）（默认：`5000`）。使用 `0` 可完全禁用超时。

### hookTimeout

- **CLI:** `--hookTimeout <timeout>`
- **Config:** [hookTimeout](/config/hooktimeout)

hook 的默认超时时间（毫秒）（默认：`10000`）。使用 `0` 可完全禁用超时。

### bail

- **CLI:** `--bail <number>`
- **Config:** [bail](/config/bail)

当给定数量的测试失败时停止测试执行（默认：`0`）

### retry.count

- **CLI:** `--retry.count <times>`
- **Config:** [retry.count](/config/retry#retry-count)

测试失败时重试的次数（默认：`0`）

### retry.delay

- **CLI:** `--retry.delay <ms>`
- **Config:** [retry.delay](/config/retry#retry-delay)

重试尝试之间的延迟（毫秒）（默认：`0`）

### retry.condition

- **CLI:** `--retry.condition <pattern>`
- **Config:** [retry.condition](/config/retry#retry-condition)

匹配应触发重试的错误消息的正则表达式模式。只有匹配此模式的错误才会重试（默认：对所有错误重试）

### diff.aAnnotation

- **CLI:** `--diff.aAnnotation <annotation>`
- **Config:** [diff.aAnnotation](/config/diff#diff-aannotation)

预期行的注释（默认：`Expected`）

### diff.aIndicator

- **CLI:** `--diff.aIndicator <indicator>`
- **Config:** [diff.aIndicator](/config/diff#diff-aindicator)

预期行的标记（默认：`-`）

### diff.bAnnotation

- **CLI:** `--diff.bAnnotation <annotation>`
- **Config:** [diff.bAnnotation](/config/diff#diff-bannotation)

接收行的注释（默认：`Received`）

### diff.bIndicator

- **CLI:** `--diff.bIndicator <indicator>`
- **Config:** [diff.bIndicator](/config/diff#diff-bindicator)

接收行的标记（默认：`+`）

### diff.commonIndicator

- **CLI:** `--diff.commonIndicator <indicator>`
- **Config:** [diff.commonIndicator](/config/diff#diff-commonindicator)

公共行的标记（默认：` `）

### diff.contextLines

- **CLI:** `--diff.contextLines <lines>`
- **Config:** [diff.contextLines](/config/diff#diff-contextlines)

每个变更周围显示的上下文行数（默认：`5`）

### diff.emptyFirstOrLastLinePlaceholder

- **CLI:** `--diff.emptyFirstOrLastLinePlaceholder <placeholder>`
- **Config:** [diff.emptyFirstOrLastLinePlaceholder](/config/diff#diff-emptyfirstorlastlineplaceholder)

空的首行或末行占位符（默认：`""`）

### diff.expand

- **CLI:** `--diff.expand`
- **Config:** [diff.expand](/config/diff#diff-expand)

展开所有公共行（默认：`true`）

### diff.includeChangeCounts

- **CLI:** `--diff.includeChangeCounts`
- **Config:** [diff.includeChangeCounts](/config/diff#diff-includechangecounts)

在 diff 输出中包含比较计数（默认：`false`）

### diff.omitAnnotationLines

- **CLI:** `--diff.omitAnnotationLines`
- **Config:** [diff.omitAnnotationLines](/config/diff#diff-omitannotationlines)

从输出中省略注释行（默认：`false`）

### diff.printBasicPrototype

- **CLI:** `--diff.printBasicPrototype`
- **Config:** [diff.printBasicPrototype](/config/diff#diff-printbasicprototype)

打印基础原型 Object 和 Array（默认：`true`）

### diff.maxDepth

- **CLI:** `--diff.maxDepth <maxDepth>`
- **Config:** [diff.maxDepth](/config/diff#diff-maxdepth)

打印嵌套对象时限制递归深度（默认：`20`）

### diff.truncateThreshold

- **CLI:** `--diff.truncateThreshold <threshold>`
- **Config:** [diff.truncateThreshold](/config/diff#diff-truncatethreshold)

每个变更前后显示的行数（默认：`0`）

### diff.truncateAnnotation

- **CLI:** `--diff.truncateAnnotation <annotation>`
- **Config:** [diff.truncateAnnotation](/config/diff#diff-truncateannotation)

截断行的注释（默认：`... Diff result is truncated`）

### 排除

- **CLI:** `--exclude <glob>`
- **Config:** [exclude](/config/exclude)

要从测试中排除的额外文件 glob

### 展开快照差异

- **CLI:** `--expandSnapshotDiff`
- **Config:** [expandSnapshotDiff](/config/expandsnapshotdiff)

当快照失败时显示完整 diff

### 禁用控制台拦截

- **CLI:** `--disableConsoleIntercept`
- **Config:** [disableConsoleIntercept](/config/disableconsoleintercept)

禁用对 console 日志的自动拦截（默认：`false`）

### typecheck.enabled

- **CLI:** `--typecheck.enabled`
- **Config:** [typecheck.enabled](/config/typecheck#typecheck-enabled)

在测试同时启用类型检查（默认：`false`）

### typecheck.only

- **CLI:** `--typecheck.only`
- **Config:** [typecheck.only](/config/typecheck#typecheck-only)

仅运行类型检查测试。这会自动启用 typecheck（默认：`false`）

### typecheck.checker

- **CLI:** `--typecheck.checker <name>`
- **Config:** [typecheck.checker](/config/typecheck#typecheck-checker)

指定要使用的类型检查器。可用值为："tsc" 和 "vue-tsc"，以及可执行文件路径（默认：`"tsc"`）

### typecheck.allowJs

- **CLI:** `--typecheck.allowJs`
- **Config:** [typecheck.allowJs](/config/typecheck#typecheck-allowjs)

允许对 JavaScript 文件进行类型检查。默认取自 tsconfig.json

### typecheck.ignoreSourceErrors

- **CLI:** `--typecheck.ignoreSourceErrors`
- **Config:** [typecheck.ignoreSourceErrors](/config/typecheck#typecheck-ignoresourceerrors)

忽略源文件中的类型错误

### typecheck.build

- **CLI:** `--typecheck.build`
- **Config:** [typecheck.build](/config/typecheck#typecheck-build)

使用 TypeScript 构建模式

### typecheck.tsconfig

- **CLI:** `--typecheck.tsconfig <path>`
- **Config:** [typecheck.tsconfig](/config/typecheck#typecheck-tsconfig)

自定义 tsconfig 文件的路径

### typecheck.spawnTimeout

- **CLI:** `--typecheck.spawnTimeout <time>`
- **Config:** [typecheck.spawnTimeout](/config/typecheck#typecheck-spawntimeout)

启动类型检查器所需的最短时间（毫秒）

### 项目

- **CLI:** `--project <name>`

如果你使用 Vitest workspace 功能，这是要运行的项目名称。可以重复指定多个项目：`--project=1 --project=2`。你也可以使用通配符过滤项目，如 `--project=packages*`，并通过 `--project=!pattern` 排除项目。

### 慢测试阈值

- **CLI:** `--slowTestThreshold <threshold>`
- **Config:** [slowTestThreshold](/config/slowtestthreshold)

被视为慢测试或慢测试套件的阈值（毫秒）（默认：`300`）

### teardownTimeout

- **CLI:** `--teardownTimeout <timeout>`
- **Config:** [teardownTimeout](/config/teardowntimeout)

teardown 函数的默认超时时间（毫秒）（默认：`10000`）

### maxConcurrency

- **CLI:** `--maxConcurrency <number>`
- **Config:** [maxConcurrency](/config/maxconcurrency)

测试文件执行期间测试和测试套件的最大并发数（默认：`5`）

### expect.requireAssertions

- **CLI:** `--expect.requireAssertions`
- **Config:** [expect.requireAssertions](/config/expect#expect-requireassertions)

要求所有测试至少有一个断言

### expect.poll.interval

- **CLI:** `--expect.poll.interval <interval>`
- **Config:** [expect.poll.interval](/config/expect#expect-poll-interval)

`expect.poll()` 断言的轮询间隔（毫秒）（默认：`50`）

### expect.poll.timeout

- **CLI:** `--expect.poll.timeout <timeout>`
- **Config:** [expect.poll.timeout](/config/expect#expect-poll-timeout)

`expect.poll()` 断言的轮询超时时间（毫秒）（默认：`1000`）

### printConsoleTrace

- **CLI:** `--printConsoleTrace`
- **Config:** [printConsoleTrace](/config/printconsoletrace)

始终打印 console 堆栈跟踪

### includeTaskLocation

- **CLI:** `--includeTaskLocation`
- **Config:** [includeTaskLocation](/config/includetasklocation)

在 `location` 属性中收集测试和测试套件的位置

### attachmentsDir

- **CLI:** `--attachmentsDir <dir>`
- **Config:** [attachmentsDir](/config/attachmentsdir)

存储 `context.annotate` 附件的目录（默认：`.vitest/attachments`）

### 运行

- **CLI:** `--run`

禁用监听模式

### 颜色

- **CLI:** `--no-color`

移除控制台输出中的颜色

### 清空屏幕

- **CLI:** `--clearScreen`

在 watch 模式下重新运行测试时清空终端屏幕（默认：`true`）

### configLoader

- **CLI:** `--configLoader <loader>`

使用 `bundle` 通过 esbuild 打包配置，或使用 `runner`（实验性）即时处理配置。此功能仅在 vite 6.1.0 及以上版本可用。（默认：`bundle`）

### 独立运行

- **CLI:** `--standalone`

启动 Vitest 而不运行测试。测试将仅在变更时运行。如果启用了浏览器模式，UI 将自动打开。传入 CLI 文件过滤器时，此选项会被忽略。（默认：`false`）

### 列出标签

- **CLI:** `--listTags [type]`

列出所有可用标签，而不是运行测试。`--list-tags=json` 将以 JSON 格式输出标签，除非没有标签。

### 清除缓存

- **CLI:** `--clearCache`

删除所有 Vitest 缓存，包括 `experimental.fsModuleCache`，而不运行任何测试。这将降低后续测试运行的性能。

### 标签过滤器

- **CLI:** `--tagsFilter <expression>`

仅运行具有指定标签的测试。你可以使用逻辑运算符 `&&`（与）、`||`（或）和 `!`（非）创建复杂表达式，更多信息请参见 [测试标签](/guide/test-tags#syntax)。

### 严格标签

- **CLI:** `--strictTags`
- **Config:** [strictTags](/config/stricttags)

如果测试具有配置中未定义的标签，Vitest 是否应抛出错误。（默认：`true`）

### experimental.fsModuleCache

- **CLI:** `--experimental.fsModuleCache`
- **Config:** [experimental.fsModuleCache](/config/experimental#experimental-fsmodulecache)

在重新运行之间启用文件系统中的模块缓存。

### experimental.importDurations.print

- **CLI:** `--experimental.importDurations.print <boolean|on-warn>`
- **Config:** [experimental.importDurations.print](/config/experimental#experimental-importdurations-print)

何时将导入耗时拆解打印到 CLI 终端。使用 `true` 始终打印，`false` 永不打印，或使用 `on-warn` 仅在导入超过警告阈值时打印（默认：`false`）。

### experimental.importDurations.limit

- **CLI:** `--experimental.importDurations.limit <number>`
- **Config:** [experimental.importDurations.limit](/config/experimental#experimental-importdurations-limit)

要收集并显示的导入最大数量（默认：`0`，如果启用了 print 或 UI，则为 `10`）。

### experimental.importDurations.failOnDanger

- **CLI:** `--experimental.importDurations.failOnDanger`
- **Config:** [experimental.importDurations.failOnDanger](/config/experimental#experimental-importdurations-failondanger)

如果任何导入超过危险阈值，则使测试运行失败（默认：`false`）。

### experimental.importDurations.thresholds.warn

- **CLI:** `--experimental.importDurations.thresholds.warn <number>`
- **Config:** [experimental.importDurations.thresholds.warn](/config/experimental#experimental-importdurations-thresholds-warn)

警告阈值 - 超过此值的导入将以黄色/橙色显示（默认：`100`）。

### experimental.importDurations.thresholds.danger

- **CLI:** `--experimental.importDurations.thresholds.danger <number>`
- **Config:** [experimental.importDurations.thresholds.danger](/config/experimental#experimental-importdurations-thresholds-danger)

危险阈值 - 超过此值的导入将以红色显示（默认：`500`）。

### experimental.viteModuleRunner

- **CLI:** `--experimental.viteModuleRunner`
- **Config:** [experimental.viteModuleRunner](/config/experimental#experimental-vitemodulerunner)

控制 Vitest 是使用 Vite 的 module runner 运行代码，还是回退到原生 `import`。（默认：`true`）

### experimental.nodeLoader

- **CLI:** `--experimental.nodeLoader`
- **Config:** [experimental.nodeLoader](/config/experimental#experimental-nodeloader)

控制 Vitest 是否使用 Node.js Loader API 处理源码内或被 mock 的文件。如果启用了 `viteModuleRunner`，此项无效。禁用它可以提升性能。（默认：`true`）

### experimental.vcsProvider

- **CLI:** `--experimental.vcsProvider <path>`
- **Config:** [experimental.vcsProvider](/config/experimental#experimental-vcsprovider)

用于检测变更文件的自定义 provider。（默认：`git`）

### experimental.preParse

- **CLI:** `--experimental.preParse`
- **Config:** [experimental.preParse](/config/experimental#experimental-preparse)

在运行测试前解析测试规范。这将在不运行文件的情况下，对所有文件应用 `.only` 标记和测试名称模式。（默认：`false`）
