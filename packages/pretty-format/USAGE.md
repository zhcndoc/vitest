# @vitest/pretty-format

Vitest 对 Jest 的 [`pretty-format`](https://npmx.dev/package/pretty-format) 的分支，作为仅 ESM 包发布。

此包为 Vitest 中的多个格式化路径提供支持：

- 快照序列化
- 断言差异渲染
- 匹配器和错误消息
- 浏览器 `prettyDOM` 输出

## 用法

```ts
import { format } from '@vitest/pretty-format'

const value = {
  user: 'Ada',
  items: [1, 2, 3],
}

console.log(format(value))
/*
-- output --
Object {
  "items": Array [
    1,
    2,
    3,
  ],
  "user": "Ada",
}
*/
```

## 选项

| key                   | type             | default     | notes                                                                |
| :-------------------- | :--------------- | :---------- | :------------------------------------------------------------------- |
| `callToJSON`          | `boolean`        | `true`      | 如果存在则调用 `toJSON`                                             |
| `compareKeys`         | `function\|null` | `undefined` | 用于排序对象键的比较函数。使用 `null` 可跳过排序                     |
| `escapeRegex`         | `boolean`        | `false`     | 转义正则表达式中的特殊字符                                           |
| `escapeString`        | `boolean`        | `true`      | 转义字符串中的特殊字符                                               |
| `highlight`           | `boolean`        | `false`     | 使用终端颜色高亮语法                                                 |
| `indent`              | `number`         | `2`         | 每级缩进的空格数                                                     |
| `maxDepth`            | `number`         | `Infinity`  | 要打印的最大深度                                                     |
| `maxOutputLength`     | `number`         | `1_000_000` | 每个深度的大致输出预算                                               |
| `maxWidth`            | `number`         | `Infinity`  | 集合中要打印的最大项数                                               |
| `min`                 | `boolean`        | `false`     | 尽量减少额外空白                                                     |
| `plugins`             | `array`          | `[]`        | 用于序列化应用特定数据类型的插件                                     |
| `printBasicPrototype` | `boolean`        | `true`      | 为普通对象和数组打印 `Object` 和 `Array` 前缀                        |
| `printFunctionName`   | `boolean`        | `true`      | 包含或省略函数名称                                                   |
| `printShadowRoot`     | `boolean`        | `true`      | 格式化 DOM 节点时包含 shadow-root 内容                               |

重要：

- `plugins: []` 表示该包默认不会自动启用其内置插件
- Vitest 功能会自行选择接入各自的插件栈和选项预设

## 内置插件

该包导出以下内置插件：

- `ReactTestComponent`
- `ReactElement`
- `DOMElement`
- `DOMCollection`
- `Immutable`
- `AsymmetricMatcher`
- `Error`

你可以直接在 `format(..., { plugins })` 中使用它们：

```ts
import { format, plugins } from '@vitest/pretty-format'

console.log(
  format(document.body, {
    plugins: [plugins.DOMElement, plugins.DOMCollection],
  }),
)
```

## Vitest 扩展

除继承自 `pretty-format` 的 API 表面外，Vitest 目前还添加并记录了这些值得注意的行为：

### `printShadowRoot`

控制 DOM 序列化是否包含 shadow-root 内容。

```ts
format(element, {
  printShadowRoot: false,
})
```

### `maxOutputLength`

用于防止大型递归结构发生病态扩展的每个深度大致输出预算。

这是一种启发式安全阀，而不是最终字符串长度的硬性上限。

```ts
format(value, {
  maxOutputLength: 100_000,
})
```

## Vitest 如何使用它

### 快照

快照使用带有快照特定默认值的 `@vitest/pretty-format`，例如：

- `printBasicPrototype: false`
- `escapeString: false`
- `escapeRegex: true`
- `printFunctionName: false`
- `maxOutputLength: 2 ** 27`

快照使用比包默认值更宽松的安全上限。默认的 `maxOutputLength` 针对日志和错误消息等通用格式化进行了调优，而快照用户可能会有意将大型序列化值持久化到专用文件中。用户仍然可以通过 `test.snapshotFormat.maxOutputLength` 选择更小的上限。

默认的快照插件栈：

- `ReactTestComponent`
- `ReactElement`
- `DOMElement`
- `DOMCollection`
- `Immutable`
- `AsymmetricMatcher`
- `MockSerializer`

快照格式化通过 [`test.snapshotFormat`](https://vitest.dev/config/snapshotformat) 配置，而序列化器注册则通过 [`expect.addSnapshotSerializer`](https://vitest.dev/api/expect#expect-addsnapshotserializer) 或 [`snapshotSerializers`](https://vitest.dev/config/snapshotserializers) 完成。

### Diff

断言差异使用不同的预设和插件栈。

默认 diff 插件：

- `ReactTestComponent`
- `ReactElement`
- `DOMElement`
- `DOMCollection`
- `Immutable`
- `AsymmetricMatcher`
- `Error`

### Vitest `stringify`

匹配器和错误消息通常会经过 Vitest 内部的 [`stringify`](https://github.com/vitest-dev/vitest/blob/59b0e6411be2b4aa5f2b339d02691aa83d5e403f/packages/utils/src/display.ts#L49) 工具，它使用：

- `ReactTestComponent`
- `ReactElement`
- `DOMElement`
- `DOMCollection`
- `Immutable`
- `AsymmetricMatcher`

`stringify` 还在 `@vitest/pretty-format` 之上增加了包装层级的行为：

- `maxLength`：如果格式化输出变得过大，`stringify` 会使用更小的 `maxDepth` 重试，以保持结果有界
- `filterNode`：将默认 DOM 插件替换为过滤版本，使选定节点从输出中省略
- 格式化错误回退：如果格式化抛出错误，`stringify` 会使用 `callToJSON: false` 重试

### 浏览器 `prettyDOM`

浏览器 `prettyDOM` 构建在 Vitest 的 `stringify` 路径之上，并启用面向浏览器的默认值，例如：

- `highlight: true`

当配置了 `filterNode` 时，它还可以将默认 DOM 插件替换为过滤版本。
