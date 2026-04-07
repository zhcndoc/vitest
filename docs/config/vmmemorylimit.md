---
title: vmMemoryLimit | 配置
outline: deep
---

# vmMemoryLimit

- **类型：** `string | number`
- **默认值：** `1 / CPU 核心数`

此选项仅影响 `vmForks` 和 `vmThreads` 池。

指定 worker 在被回收之前的内存限制。该值很大程度上取决于您的环境，因此最好手动指定它，而不是依赖默认值。

::: tip
实现基于 Jest 的 [`workerIdleMemoryLimit`](https://jestjs.io/docs/configuration#workeridlememorylimit-numberstring)。

限制可以通过多种不同的方式指定，无论结果如何，都会使用 `Math.floor` 将其转换为整数值：

- `<= 1` - 该值被假定为系统内存的百分比。因此 0.5 将 worker 的内存限制设置为总系统内存的一半
- `\> 1` - 假定为固定的字节值。由于上一条规则，如果您想要 1 字节的值（我不知道为什么），您可以使用 1.1。
- 带单位
  - `50%` - 如上所述，占总系统内存的百分比
  - `100KB`, `65MB`, 等 - 带单位表示固定的内存限制。
    - `K` / `KB` - 千字节 (x1000)
    - `KiB` - 二进制千字节 (x1024)
    - `M` / `MB` - 兆字节
    - `MiB` - 二进制兆字节
    - `G` / `GB` - 吉字节
    - `GiB` - 二进制吉字节
:::

::: warning
基于百分比的内存限制 [在 Linux CircleCI 上不起作用](https://github.com/jestjs/jest/issues/11956#issuecomment-1212925677)，因为报告的系统内存不正确。
:::
