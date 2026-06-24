---
title: outputFile | 配置
outline: deep
---

# outputFile <CRoot /> {#outputfile}

- **类型：** `string | Record<string, string>`
- **命令行：** `--outputFile=<path>`, `--outputFile.json=./path`

在同时指定 `--reporter=json` 或 `--reporter=junit` 选项时，将测试结果写入文件。
通过提供一个对象而不是字符串，你可以在使用多个报告器时定义各自的输出。
