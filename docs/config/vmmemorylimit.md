---
title: vmMemoryLimit | 配置
outline: deep
---

# vmMemoryLimit

- **Type:** `string | number`
- **Default:** `1 / maxWorkers`

此选项仅影响 `vmForks` 和 `vmThreads` 池。

指定 worker 在被回收前的内存限制。

默认情况下，系统总内存会在各个 worker 之间平均分配。增加 [`maxWorkers`](/config/maxworkers) 后，每个 worker 可用的内存会减少，因此回收频率会更高。

此值高度取决于您的环境，因此最好手动指定，而不是依赖默认值。

之所以需要回收，是因为 VM 上下文会[泄漏内存](https://github.com/nodejs/node/issues/33439)：worker 每运行一个测试文件，内存使用量就会增加，因此 worker 不可能永久运行。该限制需要在以下因素之间进行权衡：

- 较低的限制会频繁回收 worker。在 `vmThreads` 池中，这会带来较高的开销，因为销毁 worker 线程会对该 worker 的内存执行完整的垃圾回收，并与正在运行的测试争用进程共享的后台线程。`vmForks` 池通过让子进程退出的方式回收 worker，因此频繁回收的成本要低得多。
- 较高的限制会让 worker 累积内存。当所有 worker 的总内存使用量接近机器可承载的内存时，每个池的运行速度都会变慢。

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
