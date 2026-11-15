---
title: browser.importMapMocks | 配置
outline: deep
---

# browser.importMapMocks <Version type="experimental">5.1.0</Version> <Experimental />

- **类型：** `boolean`
- **默认值：** 浏览器支持时启用
- **CLI：** `--browser.importMapMocks`、`--browser.importMapMocks=false`

通过测试器文档中的[导入映射](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)提供模块模拟，而不是拦截网络请求。

默认情况下，Vitest 会在每个浏览器中检查一次：模块加载后浏览器是否仍接受导入映射。如果不支持，Vitest 就会改为拦截请求。

文档中的导入映射规则无法移除。当 [`isolate`](/config/isolate) 为 `false` 时，所有测试文件会在同一个文档中运行，因此 Vitest 默认也会拦截请求。

将此选项设为 `true` 可始终使用导入映射，设为 `false` 则始终拦截请求。

测试文件调用 `vi.mock` 时，Vitest 会添加一条导入映射规则，将模块 URL 指向其模拟版本：自动模拟的模块、`__mocks__` 文件夹中的文件，或一个导出原始模块所有名称并从工厂读取值的模块。浏览器会直接加载模拟模块，因此提供者不会拦截请求（例如使用 Playwright 的 `page.route`），模拟也只对该测试文件的文档生效。

请求拦截会给页面中的每个请求增加开销；测试文件导入的模块越多，开销越大。导入映射则不会增加逐请求开销。

::: warning
浏览器必须支持在同一文档中使用多个导入映射：Chromium 133+、Safari 18.4+，以及启用了 `dom.multiple_import_maps.enabled` 偏好的 Firefox 150+。`playwright` 提供者会设置此偏好。其他提供者无法设置，因此 Firefox 在这些提供者下会退回到请求拦截。

导入映射规则无法更改文档已经导入的模块。如果模块在 `vi.mock` 注册它之前就已导入（例如，某个设置文件导入了该模块但没有模拟它），Vitest 会报告错误，而不会悄悄使用原始模块。

导入映射规则也无法移除。测试文件对静态路径调用 `vi.unmock` 时，设置文件不会为该模块添加规则，因此设置文件和测试文件都会加载原始模块。`vi.doUnmock` 无法恢复原始模块。

工厂只能提供原始模块声明的导出。Vitest 会从原始模块读取导出名称，因此无法导入工厂额外添加的键，而工厂未提供的导出值为 `undefined`。
:::
