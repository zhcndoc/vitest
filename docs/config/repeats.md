---
title: repeats | Config
outline: deep
---

# repeats

- **类型：** `number`
- **默认值：** `0`
- **CLI：** `--repeats=<number>`

无论结果如何，将每个测试重复指定次数。使用 [`repeats`](/api/test#repeats) 测试选项的测试优先于此值。

这对于验证测试在多次运行中是否稳定非常有用。如果某次重复中测试失败，则整个测试都会被报告为失败。
