# Explorer 整体行为

本文档描述了新 Explorer 组件的整体行为，以及以下逻辑：
- 搜索
- 展开/折叠节点
- 按状态过滤
- `Test Only` 过滤器

请查看 [Notes](#notes) 以获取旧逻辑和新逻辑的简要总结。

## 新逻辑

Explorer 不会直接使用来自 `ws-client` 状态中的 `idsMap` 和 `filesMap` 来渲染树。它将使用新的类型来在 UI 中表示树，并使用新的逻辑来处理 DOM 中的树列表：
- [nodes](client/composables/explorer/tree.ts)：`ws-client` 状态中的变化会在这里映射为树结构。
- [uiEntries](client/composables/explorer/state.ts)：一个浅层 ref，用于表示 UI 中的扁平树条目，逻辑会使用 `nodes` 来构建它。

Explorer 中的任何操作都会使用 `queueMicrotask` 来避免阻塞主线程，并且对 list/map 的任何操作都会使用 `generators`。

Explorer 逻辑将动作分为三个主要部分：
- 在运行测试时收集任务
- 搜索/过滤：为简洁起见，以下统称为搜索
- 展开/折叠节点

其中，收集和搜索是复杂操作，而展开/折叠节点是简单操作。为什么呢？：
- 收集任务：我们需要遍历整棵树来更新 UI 树中的每个 test/suite/file：我们正在从服务器收集 `ws-client` 消息，而 UI 中的节点必须更新以反映状态。
- 搜索：我们需要遍历整棵树来收集树中所有符合应用的搜索和/或过滤条件的 test/suite/file。
- 展开/折叠：这是一个简单操作，只需要遍历 UI 中存在的节点并切换 `expanded` 属性（_展开所有节点需要完整搜索_）。

### 收集任务

旧的 [ws-client](client/composables/client/index.ts) 逻辑会在每次 `onTaskUpdate` 回调时遍历整棵树，以更新 UI 中的所有节点（当时使用的是 `ws-client` 状态中响应式的 `idsMap`）。
新逻辑只会遍历 `onTaskUpdate` 回调中提供的任务结果里的任务文件，这在性能上是一个巨大的提升。

新逻辑的主要变化在于使用 `requestAnimationFrame` 每 100ms 收集一次 UI 更新，汇总在 `onTaskUpdate` 回调中接收到的所有变更。每一轮循环中，都会使用收集到的变更重建 [uiEntries](client/composables/state.ts)，虚拟滚动器会正确处理这些更新。

该逻辑实现于 [collect](client/composables/explorer/collector.ts) 函数，以及在 [tree class](client/composables/explorer/tree.ts) 中配置的 `requestAnimationFrame` 循环，即 `runCollect` 函数。

### 搜索

搜索和过滤相当简单，我们只需要对任务名称、模式和结果状态应用一些逻辑。
复杂性在于过滤整棵树的节点。我们需要多次遍历树：
- 自上而下收集所有符合搜索/过滤条件的任务（整棵树）：[filter](client/composables/explorer/filter.ts) 模块中的 `visitNodes` 函数。
- 自下而上收集包含匹配搜索/过滤条件子节点的任务和父任务（整棵树）：[filter](client/composables/explorer/filter.ts) 模块中的 `filterParents`。
- 自上而下收集已展开文件任务的父任务，或者其父任务已展开的父任务（来自上一步的过滤树）。
- 自下而上收集文件类型的任务，或者前一个列表中包含且已展开的父任务（过滤树）。

主要逻辑是 [filter](client/composables/explorer/filter.ts) 模块中的 `expandNode` 函数，它会应用前述逻辑。

搜索逻辑可以在 [filter](client/composables/explorer/filter.ts) 模块中找到。

### 折叠节点

这是 Explorer 中最便宜的操作，它只需要遍历 UI 中的节点并更新 `expanded` 属性：
- 折叠所有节点：遍历整棵树（Explorer 树中的 [nodes](client/composables/explorer/tree.ts)）并将 `expanded` 设为 `false`，然后按 `file` 类型过滤 `uiEntries`。
- 折叠单个节点：遍历整棵树并将该节点及其所有子节点的 `expanded` 设为 `false`，然后在 `uiEntries` 中用新的折叠后节点替换该子节点，并从 `uiEntries` 中移除其子节点。

这些动作可以在 [tree class](client/composables/explorer/tree.ts) 中找到，即 `collapseAllNodes` 和 `collapseNode` 方法，以及 [collapse.ts](client/composables/explorer/collapse.ts) 模块中的逻辑。

### 展开节点

这在 Explorer 中也是一个开销较低的操作，它只需要遍历 UI 中的节点并更新 `expanded` 属性：
- 折叠所有节点：遍历整棵树（Explorer 树中的 [nodes](client/composables/explorer/tree.ts)）并将 `expanded` 设为 `true`，然后使用 `search` 模块中的 `filterAll` 重建 `uiEntries`。
- 展开单个节点：遍历其在 UI 中的子节点（Explorer 树中的 [nodes](client/composables/explorer/tree.ts)）并将 `expanded` 设为 `true`，然后使用 `search` 模块中的 `filterNode` 过滤其子节点，并通过在 UI 树中用新的节点及其过滤后的子节点替换当前节点来重建 `uiEntries`。

这些动作可以在 [tree class](client/composables/explorer/tree.ts) 中找到，即 `expandAllNodes` 和 `expandNode` 方法，以及 [expand.ts](client/composables/explorer/expand.ts) 模块中的逻辑。

## Notes

之前的树列表方案使用嵌套结构来映射在 DOM 中渲染整棵树。它使用 WebSocket 客户端状态中的条目（`idsMap` 和 `filesMap`），并对这两个 map 都使用 Vue reactive。自从我们将 Vue 依赖更新到最新的 v3.4.27 后，服务器接收到的每条消息都会更新 map 中对应的条目。树列表也会相应更新，在递归树中的 Vue 组件上触发大量 patch 更新，这导致了性能问题。

新的 Explorer 使用扁平结构通过虚拟滚动器（`vue-virtual-scroller`）来表示树。这种新结构更易于处理和操作，同时也提升了性能，因为虚拟滚动器只会更新 UI 中少量节点，而不是 DOM 中的整棵树。
它采用了一种处理树列表的新方法：现在我们有一个独立的 vue shallow ref 用于 UI 中的条目（[uiEntries in composables/explorer/state.ts](client/composables/explorer/state.ts)），而 WebSocket 状态则为 `idsMap` 和 `filesMap` 都使用 vue shallow ref，同时状态本身仍保持 Vue reactive。
现在我们能够只在条目更新时更新树列表，而不是在 WebSocket 状态更新时更新，这带来了巨大的性能提升。

在 `i7-12700H` 笔记本上使用 Vitest UI 运行 `test/unit` 时的一些数据（3 个 workspace、162 个文件：5100+ tests）：
- 树列表：服务器完成运行测试后，Vitest UI 花了约 1 分钟才完成整棵树的渲染（约 150MB 内存占用）
- Explorer：Vitest UI 在服务器 reporter 显示测试总结之前就完成了整棵树的渲染（约 10MB 内存占用）

使用树列表方案时，展开/折叠节点或搜索会阻塞主线程；而在新的 Explorer 中，这不再阻塞主线程，几乎是瞬时完成的。

虽然新的 Explorer 不会受到测试数量的影响，但树列表方案会受到测试数量的影响，测试越多，UI 越慢。
不过，对于非常庞大的项目，这两种方案都会有性能问题，但新的 Explorer 会比树列表方案好得多（`vue-virtual-scroller` 在大约 500_000 条目时应该仍然表现良好，参见文档）。
