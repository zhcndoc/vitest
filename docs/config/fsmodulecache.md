---
title: fsModuleCache | 配置
outline: deep
---

# fsModuleCache <Version>5.0.0</Version>

- **类型：** `boolean`
- **默认值：** `false`
- **CLI：** `--fsModuleCache`、`--fsModuleCache=false`

在监听模式下，Vitest 会将所有转换后的文件缓存在内存中，从而加快重新运行的速度。但是，测试运行结束后，此缓存会被丢弃。启用此选项后，Vitest 会将转换后的模块持久化到文件系统中，以便在后续重新运行以及不同的 Vitest 进程之间重复使用。

工作区中的每个项目共享同一个缓存目录。默认情况下，该目录位于工作区根目录的 `node_modules` 中（因此在重新安装依赖项时会自然失效）；使用 [`fsModuleCachePath`](/config/fsmodulecachepath) 可以更改其位置。你可以运行 [`vitest --clearCache`](/guide/cli#clearcache) 来删除缓存。

::: warning 浏览器支持
目前，此选项不会影响[浏览器](/guide/browser/)。
:::

你可以通过使用 `DEBUG=vitest:cache:fs` 环境变量运行 vitest，来检查模块是否已被缓存：

```shell
DEBUG=vitest:cache:fs vitest --fsModuleCache
```

::: tip
缓存的位置是一个工作区范围内的统一目录。请参阅 [`fsModuleCachePath`](/config/fsmodulecachepath) 以更改其位置。
:::

## 已知问题

Vitest 会基于文件内容、文件 ID、Vite 的环境配置和覆盖率状态创建持久化文件哈希。Vitest 会尝试使用它所掌握的尽可能多的配置信息，但这些信息仍然不完整。目前，由于没有标准接口，无法跟踪插件选项。

如果你的插件依赖于文件内容或公开配置之外的内容（例如读取其他文件或文件夹），缓存可能会变得过时。为了解决这个问题，你可以定义一个[缓存键生成器](/api/advanced/plugin#definecachekeygenerator)来指定动态选项，或选择不对该模块进行缓存：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    {
      name: 'vitest-cache',
      configureVitest({ defineCacheKeyGenerator }) {
        defineCacheKeyGenerator(({ id, sourceCode }) => {
          // 永远不要缓存此 ID
          if (id.includes('do-not-cache')) {
            return false
          }

          // 根据动态变量的值缓存此文件
          if (sourceCode.includes('myDynamicVar')) {
            return process.env.DYNAMIC_VAR_VALUE
          }
        })
      }
    }
  ],
  test: {
    fsModuleCache: true,
  },
})
```

如果你是插件作者，请考虑在插件中定义一个[缓存键生成器](/api/advanced/plugin#definecachekeygenerator)，前提是该插件可以使用会影响转换结果的不同选项进行注册。

另一方面，如果你的插件不应影响缓存键，可以将 `api.vitest.ignoreFsModuleCache` 设置为 `true` 来选择退出：

```js [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    {
      name: 'vitest-cache',
      api: {
        vitest: {
          ignoreFsModuleCache: true,
        },
      },
    },
  ],
  test: {
    fsModuleCache: true,
  },
})
```

请注意，即使插件选择退出模块缓存，你仍然可以定义缓存键生成器。
