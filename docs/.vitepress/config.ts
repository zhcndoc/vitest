import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { transformerNotationWordHighlight } from '@shikijs/transformers'
import { withPwa } from '@vite-pwa/vitepress'
import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'
import { version } from '../../package.json'
import { teamMembers } from './contributors'
import {
  bluesky,
  contributing,
  discord,
  font,
  github,
  mastodon,
  ogImage,
  ogUrl,
  releases,
  vitestDescription,
  vitestName,
} from './meta'
import { pwa } from './scripts/pwa'
import { transformHead } from './scripts/transformHead'
import { extendConfig } from '@voidzero-dev/vitepress-theme/config'

export default ({ mode }: { mode: string }) => {
  return withPwa(extendConfig(defineConfig({
    lang: 'en-US',
    title: vitestName,
    description: vitestDescription,
    srcExclude: [
      '**/guide/examples/*',
      '**/guide/cli-generated.md',
    ],
    locales: {
      root: {
        label: '简体中文',
        lang: 'zh',
      },
      zh: {
        label: 'English',
        lang: 'en-US',
        link: 'https://vitest.dev/',
      },
    },
    head: [
      ['meta', { name: 'theme-color', content: '#22FF84' }],
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
      ['link', { rel: 'icon', href: '/logo-without-border.svg', type: 'image/svg+xml' }],
      ['meta', { name: 'author', content: `${teamMembers.map(c => c.name).join(', ')} and ${vitestName} contributors` }],
      ['meta', { name: 'keywords', content: 'vitest, vite, test, coverage, snapshot, react, vue, preact, svelte, solid, lit, marko, ruby, cypress, puppeteer, jsdom, happy-dom, test-runner, jest, typescript, esm, node' }],
      ['meta', { property: 'og:title', content: vitestName }],
      ['meta', { property: 'og:description', content: vitestDescription }],
      ['meta', { property: 'og:url', content: ogUrl }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['link', { rel: 'preload', as: 'style', onload: 'this.onload=null;this.rel=\'stylesheet\'', href: font }],
      ['noscript', {}, `<link rel="stylesheet" crossorigin="anonymous" href="${font}" />`],
      ['link', { rel: 'me', href: 'https://m.webtoo.ls/@vitest' }],
      ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
      ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
      ['script', { src: 'https://www.zhcndoc.com/js/common.js', defer: '' }],
    ],
    lastUpdated: true,
    vite: {
      plugins: [
        groupIconVitePlugin({
          customIcon: {
            'CLI': 'vscode-icons:file-type-shell',
            '.spec.ts': 'vscode-icons:file-type-testts',
            '.test.ts': 'vscode-icons:file-type-testts',
            '.spec.js': 'vscode-icons:file-type-testjs',
            '.test.js': 'vscode-icons:file-type-testjs',
            'next': '',
          },
        }),
        llmstxt(),
      ],
      define: {
        __VITEST_VERSION__: JSON.stringify(version),
      },
    },
    markdown: {
      config(md) {
        md.use(tabsMarkdownPlugin)
        md.use(groupIconMdPlugin)
      },
      theme: {
        light: 'github-light',
        dark: 'github-dark',
      },
      codeTransformers: mode === 'development'
        ? [transformerNotationWordHighlight()]
        : [
            transformerNotationWordHighlight(),
            transformerTwoslash({
              processHoverInfo: (info) => {
                if (info.includes(process.cwd())) {
                  return info.replace(new RegExp(process.cwd(), 'g'), '')
                }
                return info
              },
            }),
          ],
      languages: ['js', 'jsx', 'ts', 'tsx'],
    },
    themeConfig: {
      variant: 'vitest',
      logo: '/logo.svg',

      editLink: {
        pattern: 'https://github.com/vitest-dev/vitest/edit/main/docs/:path',
        text: '在 GitHub 上编辑此页',
      },

      search: {
        provider: 'local',
      /* provider: 'algolia',
      options: {
        appId: 'ZTF29HGJ69',
        apiKey: '9c3ced6fed60d2670bb36ab7e8bed8bc',
        indexName: 'vitest',
        // searchParameters: {
        //   facetFilters: ['tags:en'],
        // },
      }, */
      },

      banner: {
        id: 'rainyun',
        text: '雨云 RainYun - 企业级云计算服务提供商：新用户注册立享五折！',
        url: 'https://www.rainyun.com/mm_?s=zhcndoc',
      },

      // carbonAds: {
      //   code: 'CW7DVKJE',
      //   placement: 'vitestdev',
      // },

      socialLinks: [
        { icon: 'bluesky', link: bluesky },
        { icon: 'mastodon', link: mastodon },
        { icon: 'discord', link: discord },
        { icon: 'github', link: github },
      ],

      footer: {
        copyright: `© ${new Date().getFullYear()} VoidZero Inc. and Vitest contributors.`,
        nav: [
          {
            title: 'Vitest',
            items: [
              { text: '指南', link: '/guide/' },
              { text: 'API', link: '/api/test' },
              { text: '配置', link: '/config/' },
            ],
          },
          {
            title: '资源',
            items: [
              { text: '团队', link: '/team' },
              { text: '博客', link: '/blog' },
              { text: '发布记录', link: releases },
            ],
          },
          {
            title: '版本',
            items: [
              { text: '未发布文档', link: 'https://main.vitest.dev/' },
              { text: 'Vitest v3 文档', link: 'https://v3.vitest.dev/' },
              { text: 'Vitest v2 文档', link: 'https://v2.vitest.dev/' },
              { text: 'Vitest v1 文档', link: 'https://v1.vitest.dev/' },
              { text: 'Vitest v0 文档', link: 'https://v0.vitest.dev/' },
            ],
          },
          /* {
            title: 'Legal',
            items: [
              { text: 'Terms & Conditions', link: 'https://voidzero.dev/terms' },
              { text: 'Privacy Policy', link: 'https://voidzero.dev/privacy' },
              { text: 'Cookie Policy', link: 'https://voidzero.dev/cookies' },
            ],
          }, */
        ],
        social: [
          { icon: 'github', link: github },
          { icon: 'discord', link: discord },
          // { icon: 'mastodon', link: mastodon }, -- the link shows github
          { icon: 'bluesky', link: bluesky },
        ],
      },

      nav: [
        { text: '指南', link: '/guide/', activeMatch: '^/guide/' },
        { text: 'API', link: '/api/test', activeMatch: '^/api/' },
        { text: '配置', link: '/config/', activeMatch: '^/config/' },
        {
          text: '博客',
          link: '/blog',
        },
        {
          text: `v${version}`,
          items: [
            {
              items: [
                {
                  text: `v${version}`,
                  link: `https://github.com/vitest-dev/vitest/releases/tag/v${version}`,
                },
                {
                  text: '发布说明',
                  link: releases,
                },
                {
                  text: '贡献指南',
                  link: contributing,
                },
                {
                  text: '团队',
                  link: '/team',
                },
                {
                  text: 'Releases',
                  link: '/releases',
                },
              ],
            },
            {
              items: [
                {
                  text: '未发布',
                  link: 'https://main.vitest.dev/',
                },
                {
                  text: 'v3.x',
                  link: 'https://v3.vitest.dev/',
                },
                {
                  text: 'v2.x',
                  link: 'https://v2.vitest.dev/',
                },
                {
                  text: 'v1.x',
                  link: 'https://v1.vitest.dev/',
                },
                {
                  text: 'v0.x',
                  link: 'https://v0.vitest.dev/',
                },
              ],
            },
          ],
        },
      ],

      sidebar: {
        '/config': [
          {
            text: '配置参考',
            collapsed: false,
            items: [
              {
                text: '配置文件',
                link: '/config/',
              },
              {
                text: '包含',
                link: '/config/include',
              },
              {
                text: '排除',
                link: '/config/exclude',
              },
              {
                text: '包含源码',
                link: '/config/include-source',
              },
              {
                text: '名称',
                link: '/config/name',
              },
              {
                text: '服务端',
                link: '/config/server',
              },
              {
                text: '依赖',
                link: '/config/deps',
              },
              {
                text: '运行器',
                link: '/config/runner',
              },
              {
                text: '基准测试',
                link: '/config/benchmark',
              },
              {
                text: '别名',
                link: '/config/alias',
              },
              {
                text: '全局变量',
                link: '/config/globals',
              },
              {
                text: '运行环境',
                link: '/config/environment',
              },
              {
                text: '环境选项',
                link: '/config/environmentoptions',
              },
              {
                text: '监听',
                link: '/config/watch',
              },
              {
                text: '监听触发模式',
                link: '/config/watchtriggerpatterns',
              },
              {
                text: '根目录',
                link: '/config/root',
              },
              {
                text: '目录',
                link: '/config/dir',
              },
              {
                text: '报告器',
                link: '/config/reporters',
              },
              {
                text: '输出文件',
                link: '/config/outputfile',
              },
              {
                text: '线程池',
                link: '/config/pool',
              },
              {
                text: '执行参数',
                link: '/config/execargv',
              },
              {
                text: '虚拟机内存限制',
                link: '/config/vmmemorylimit',
              },
              {
                text: '文件并行度',
                link: '/config/fileparallelism',
              },
              {
                text: '最大工作线程数',
                link: '/config/maxworkers',
              },
              {
                text: '测试超时',
                link: '/config/testtimeout',
              },
              {
                text: '钩子超时',
                link: '/config/hooktimeout',
              },
              {
                text: '清理超时',
                link: '/config/teardowntimeout',
              },
              {
                text: '静默',
                link: '/config/silent',
              },
              {
                text: '初始化文件',
                link: '/config/setupfiles',
              },
              {
                text: '提供',
                link: '/config/provide',
              },
              {
                text: '全局初始化',
                link: '/config/globalsetup',
              },
              {
                text: '强制重新运行触发器',
                link: '/config/forcereruntriggers',
              },
              {
                text: '覆盖率',
                link: '/config/coverage',
              },
              {
                text: '测试名称模式',
                link: '/config/testnamepattern',
              },
              {
                text: '界面',
                link: '/config/ui',
              },
              {
                text: '自动打开',
                link: '/config/open',
              },
              {
                text: 'API',
                link: '/config/api',
              },
              {
                text: '清理 Mock',
                link: '/config/clearmocks',
              },
              {
                text: '重置 Mock',
                link: '/config/mockreset',
              },
              {
                text: '恢复 Mock',
                link: '/config/restoremocks',
              },
              {
                text: '恢复环境变量',
                link: '/config/unstubenvs',
              },
              {
                text: '恢复全局变量',
                link: '/config/unstubglobals',
              },
              {
                text: '快照格式',
                link: '/config/snapshotformat',
              },
              {
                text: '快照序列化器',
                link: '/config/snapshotserializers',
              },
              {
                text: '快照路径解析',
                link: '/config/resolvesnapshotpath',
              },
              {
                text: '仅允许',
                link: '/config/allowonly',
              },
              {
                text: '无测试通过',
                link: '/config/passwithnotests',
              },
              {
                text: '记录堆内存使用',
                link: '/config/logheapusage',
              },
              {
                text: 'CSS',
                link: '/config/css',
              },
              {
                text: '最大并发数',
                link: '/config/maxconcurrency',
              },
              {
                text: '缓存',
                link: '/config/cache',
              },
              {
                text: '执行顺序',
                link: '/config/sequence',
              },
              {
                text: '标签',
                link: '/config/tags',
              },
              {
                text: '严格标签',
                link: '/config/stricttags',
              },
              {
                text: '类型检查',
                link: '/config/typecheck',
              },
              {
                text: '慢测试阈值',
                link: '/config/slowtestthreshold',
              },
              {
                text: 'Chai 配置',
                link: '/config/chaiconfig',
              },
              {
                text: '中止',
                link: '/config/bail',
              },
              {
                text: '重试',
                link: '/config/retry',
              },
              {
                text: '重复',
                link: '/config/repeats',
              },
              {
                text: '控制台日志回调',
                link: '/config/onconsolelog',
              },
              {
                text: '堆栈回调',
                link: '/config/onstacktrace',
              },
              {
                text: '未处理错误回调',
                link: '/config/onunhandlederror',
              },
              {
                text: '忽略未处理错误',
                link: '/config/dangerouslyignoreunhandlederrors',
              },
              {
                text: '差异',
                link: '/config/diff',
              },
              {
                text: '假定时器',
                link: '/config/faketimers',
              },
              {
                text: '项目',
                link: '/config/projects',
              },
              {
                text: '隔离',
                link: '/config/isolate',
              },
              {
                text: '包含任务位置',
                link: '/config/includetasklocation',
              },
              {
                text: '快照环境',
                link: '/config/snapshotenvironment',
              },
              {
                text: '环境变量',
                link: '/config/env',
              },
              {
                text: '断言',
                link: '/config/expect',
              },
              {
                text: '打印控制台堆栈',
                link: '/config/printconsoletrace',
              },
              {
                text: '附件目录',
                link: '/config/attachmentsdir',
              },
              {
                text: '隐藏跳过测试',
                link: '/config/hideskippedtests',
              },
              {
                text: '模式',
                link: '/config/mode',
              },
              {
                text: '展开快照差异',
                link: '/config/expandsnapshotdiff',
              },
              {
                text: '禁用控制台拦截',
                link: '/config/disableconsoleintercept',
              },
              {
                text: 'changed',
                link: '/config/changed',
              },
              {
                text: 'experimental',
                link: '/config/experimental',
              },
            ],
          },
          {
            text: '浏览器模式',
            collapsed: false,
            items: [
              {
                text: '提供程序',
                collapsed: false,
                items: [
                  {
                    text: 'playwright',
                    link: '/config/browser/playwright',
                  },
                  {
                    text: 'webdriverio',
                    link: '/config/browser/webdriverio',
                  },
                  {
                    text: 'preview',
                    link: '/config/browser/preview',
                  },
                ],
              },
              {
                text: 'browser.enabled',
                link: '/config/browser/enabled',
              },
              {
                text: 'browser.instances',
                link: '/config/browser/instances',
              },
              {
                text: 'browser.headless',
                link: '/config/browser/headless',
              },
              {
                text: 'browser.isolate',
                link: '/config/browser/isolate',
              },
              {
                text: 'browser.testerHtmlPath',
                link: '/config/browser/testerhtmlpath',
              },
              {
                text: 'browser.api',
                link: '/config/browser/api',
              },
              {
                text: 'browser.provider',
                link: '/config/browser/provider',
              },
              {
                text: 'browser.ui',
                link: '/config/browser/ui',
              },
              {
                text: 'browser.detailsPanelPosition',
                link: '/config/browser/detailspanelposition',
              },
              {
                text: 'browser.viewport',
                link: '/config/browser/viewport',
              },
              {
                text: 'browser.locators',
                link: '/config/browser/locators',
              },
              {
                text: 'browser.screenshotDirectory',
                link: '/config/browser/screenshotdirectory',
              },
              {
                text: 'browser.screenshotFailures',
                link: '/config/browser/screenshotfailures',
              },
              {
                text: 'browser.orchestratorScripts',
                link: '/config/browser/orchestratorscripts',
              },
              {
                text: 'browser.commands',
                link: '/config/browser/commands',
              },
              {
                text: 'browser.connectTimeout',
                link: '/config/browser/connecttimeout',
              },
              {
                text: 'browser.trace',
                link: '/config/browser/trace',
              },
              {
                text: 'browser.trackUnhandledErrors',
                link: '/config/browser/trackunhandlederrors',
              },
              {
                text: 'browser.expect',
                link: '/config/browser/expect',
              },
            ],
          },
          // {
          //   text: '@vitest/plugin-eslint',
          //   collapsed: true,
          //   items: [
          //     {
          //       text: 'Lints',
          //       link: '/config/eslint',
          //     },
          //     // TODO: generate
          //     {
          //       text: 'consistent-test-filename',
          //       link: '/config/eslint/consistent-test-filename',
          //     },
          //     {
          //       text: 'consistent-test-it',
          //       link: '/config/eslint/consistent-test-it',
          //     },
          //   ],
          // },
          // {
          //   text: 'vscode',
          //   link: '/config/vscode',
          // },
        ],
        '/guide': [
          {
            text: '入门',
            collapsed: false,
            items: [
              {
                text: '为什么选择 Vitest',
                link: '/guide/why',
              },
              {
                text: '开始使用',
                link: '/guide/',
              },
              {
                text: '功能特性',
                link: '/guide/features',
              },
            ],
          },
          {
            text: '学习',
            collapsed: false,
            items: [
              {
                text: '编写测试',
                link: '/guide/learn/writing-tests',
                docFooterText: '编写测试 | 学习',
              },
              {
                text: '使用匹配器',
                link: '/guide/learn/matchers',
                docFooterText: '使用匹配器 | 学习',
              },
              {
                text: '测试异步代码',
                link: '/guide/learn/async',
                docFooterText: '测试异步代码 | 学习',
              },
              {
                text: '初始化与清理',
                link: '/guide/learn/setup-teardown',
                docFooterText: '初始化与清理 | 学习',
              },
              {
                text: 'Mock 函数',
                link: '/guide/learn/mock-functions',
                docFooterText: 'Mock 函数 | 学习',
              },
              {
                text: '快照测试',
                link: '/guide/learn/snapshots',
                docFooterText: '快照测试 | 学习',
              },
              {
                text: '实战测试',
                link: '/guide/learn/testing-in-practice',
                docFooterText: '实战测试 | 学习',
              },
              {
                text: '调试测试',
                link: '/guide/learn/debugging-tests',
                docFooterText: '调试测试 | 学习',
              },
              {
                text: '借助 AI 编写测试',
                link: '/guide/learn/writing-tests-with-ai',
                docFooterText: '借助 AI 编写测试 | 学习',
              },
            ],
          },
          {
            text: '浏览器模式',
            collapsed: false,
            items: [
              {
                text: '为什么使用浏览器模式',
                link: '/guide/browser/why',
                docFooterText: '为什么使用浏览器模式 | 浏览器模式',
              },
              {
                text: '开始使用',
                link: '/guide/browser/',
                docFooterText: '开始使用 | 浏览器模式',
              },
              {
                text: '多种配置方案',
                link: '/guide/browser/multiple-setups',
                docFooterText: '多种配置方案 | 浏览器模式',
              },
              {
                text: '组件测试',
                link: '/guide/browser/component-testing',
                docFooterText: '组件测试 | 浏览器模式',
              },
              {
                text: '视觉回归测试',
                link: '/guide/browser/visual-regression-testing',
                docFooterText: '视觉回归测试 | 浏览器模式',
              },
              {
                text: '轨迹视图',
                link: '/guide/browser/trace-view',
                docFooterText: 'Trace View | Browser Mode',
              },
              {
                text: 'Playwright 轨迹',
                link: '/guide/browser/playwright-traces',
                docFooterText: 'Playwright 轨迹 | 浏览器模式',
              },
              {
                text: 'ARIA 快照',
                link: '/guide/browser/aria-snapshots',
                docFooterText: 'ARIA 快照 | 浏览器模式',
              },
            ],
          },
          // Authoring — how to express a test in code: constructing it,
          // asserting, mocking dependencies, attaching metadata. The page is
          // about *test content*, not the runner. Discriminator: "How do I
          // write X in a test?" If yes, it belongs here. Mocking sub-pages
          // live nested because they're a multi-page subtopic.
          {
            text: '编写测试',
            collapsed: false,
            items: [
              {
                text: '测试上下文',
                link: '/guide/test-context',
              },
              {
                text: '测试运行生命周期',
                link: '/guide/lifecycle',
              },
              {
                text: '快照',
                link: '/guide/snapshot',
              },
              {
                text: '模拟',
                link: '/guide/mocking',
                collapsed: true,
                items: [
                  {
                    text: '日期',
                    link: '/guide/mocking/dates',
                  },
                  {
                    text: '函数',
                    link: '/guide/mocking/functions',
                  },
                  {
                    text: '全局对象',
                    link: '/guide/mocking/globals',
                  },
                  {
                    text: '模块',
                    link: '/guide/mocking/modules',
                  },
                  {
                    text: '文件系统',
                    link: '/guide/mocking/file-system',
                  },
                  {
                    text: '请求',
                    link: '/guide/mocking/requests',
                  },
                  {
                    text: '定时器',
                    link: '/guide/mocking/timers',
                  },
                  {
                    text: '类',
                    link: '/guide/mocking/classes',
                  },
                ],
              },
              {
                text: '测试标签',
                link: '/guide/test-tags',
              },
              {
                text: '测试注解',
                link: '/guide/test-annotations',
              },
              {
                text: '扩展匹配器',
                link: '/guide/extending-matchers',
              },
              {
                text: '测试类型',
                link: '/guide/testing-types',
              },
              {
                text: '基准测试',
                link: '/guide/benchmarking',
              },
              {
                text: '源内测试',
                link: '/guide/in-source',
              },
            ],
          },
          // Workflow — how to invoke, select, and orchestrate test runs
          // across files/projects/processes. The page is about the *runner
          // and tooling around it*, not what's inside a test. Discriminator:
          // "How do I run / filter / parallelize / integrate Vitest?" If a
          // page is about the runtime environment of the tests themselves
          // (jsdom, node), it still belongs here — that's a workflow choice.
          {
            text: '工作流',
            collapsed: false,
            items: [
              {
                text: 'CLI',
                link: '/guide/cli',
              },
              {
                text: '测试过滤',
                link: '/guide/filtering',
              },
              {
                text: '测试项目',
                link: '/guide/projects',
              },
              {
                text: '测试环境',
                link: '/guide/environment',
              },
              {
                text: '并行执行',
                link: '/guide/parallelism',
              },
              {
                text: '报告器',
                link: '/guide/reporters',
              },
              {
                text: 'Vitest 界面',
                link: '/guide/ui',
              },
              {
                text: 'IDE 集成',
                link: '/guide/ide',
              },
            ],
          },
          // Quality & Debugging — how to verify the test run is healthy and
          // diagnose it when it isn't. Coverage, perf, leak detection, error
          // triage, observability. Discriminator: "Is my suite good?" or
          // "Why did this fail / leak / slow down?" If a page primarily
          // measures or fixes the suite (rather than authoring or running
          // it), put it here.
          {
            text: '质量与调试',
            collapsed: false,
            items: [
              {
                text: '覆盖率',
                link: '/guide/coverage',
              },
              {
                text: '调试',
                link: '/guide/debugging',
              },
              {
                text: '常见错误',
                link: '/guide/common-errors',
              },
              {
                text: '性能',
                collapsed: false,
                items: [
                  {
                    text: '剖析测试性能',
                    link: '/guide/profiling-test-performance',
                  },
                  {
                    text: '提升性能',
                    link: '/guide/improving-performance',
                  },
                ],
              },
              {
                text: 'OpenTelemetry',
                link: '/guide/open-telemetry',
              },
            ],
          },
          // Recipes — end-to-end patterns that solve a concrete problem by
          // combining multiple features. Each entry is titled by the problem
          // ("Database Transaction per Test"), not the feature. Add a recipe
          // when a single feature page would over-explain, when the value
          // comes from composition, or when users would search by intent
          // rather than by API name.
          {
            text: '实践方案',
            collapsed: false,
            items: [
              {
                text: '每个测试一个数据库事务',
                link: '/guide/recipes/db-transaction',
              },
              {
                text: '优雅取消长时间运行的操作',
                link: '/guide/recipes/cancellable',
              },
              {
                text: '等待异步条件',
                link: '/guide/recipes/wait-for',
              },
              {
                text: '测试中的类型收窄',
                link: '/guide/recipes/type-narrowing',
              },
              {
                text: '自定义断言辅助函数',
                link: '/guide/recipes/custom-assertions',
              },
              {
                text: '监听未导入的文件',
                link: '/guide/recipes/watch-templates',
              },
              {
                text: '扩展浏览器定位器',
                link: '/guide/recipes/browser-locators',
              },
              {
                text: '基于 Schema 的断言',
                link: '/guide/recipes/schema-matching',
              },
              {
                text: '使用 `using` 自动清理',
                link: '/guide/recipes/explicit-resources',
              },
              {
                text: 'Conditional Mocking with `vi.when`',
                link: '/guide/recipes/conditional-mocking',
              },
              {
                text: 'Per-File Isolation Settings',
                link: '/guide/recipes/disable-isolation',
              },
              {
                text: '并行与顺序测试文件',
                link: '/guide/recipes/parallel-sequential',
              },
            ],
          },
          {
            text: '高级',
            collapsed: false,
            items: [
              {
                text: '入门',
                link: '/guide/advanced/',
              },
              {
                text: '通过 API 运行测试',
                link: '/guide/advanced/tests',
              },
              {
                text: '扩展报告器',
                link: '/guide/advanced/reporters',
              },
              {
                text: '自定义线程池',
                link: '/guide/advanced/pool',
              },
            ],
          },
          // Migration — one-time transitional content: cross-version
          // upgrades and porting from other test runners (Jest, Mocha).
          // Sits near the bottom because it's not daily-use and would push
          // active-use guides further from the user's first scroll.
          {
            text: '迁移',
            link: '/guide/migration',
            collapsed: false,
            items: [
              {
                text: '迁移到 Vitest 5.0',
                link: '/guide/migration#vitest-5',
              },
              {
                text: '从 Jest 迁移',
                link: '/guide/migration#jest',
              },
              {
                text: '从 Mocha + Chai + Sinon 迁移',
                link: '/guide/migration#mocha-chai-sinon',
              },
            ],
          },
          {
            items: [
              {
                text: '对比',
                link: '/guide/comparisons',
              },
            ],
          },
        ],
        '/api': [
          {
            text: '测试 API 参考',
            items: [
              {
                text: '测试',
                link: '/api/test',
              },
              {
                text: '描述',
                link: '/api/describe',
              },
              {
                text: '钩子',
                link: '/api/hooks',
              },
            ],
          },
          {
            text: '模拟',
            link: '/api/mock',
          },
          {
            text: 'Vi 工具',
            link: '/api/vi',
          },
          {
                text: '断言',
            link: '/api/expect',
          },
          {
                text: 'ExpectTypeOf',
            link: '/api/expect-typeof',
          },
          {
                text: '断言',
            link: '/api/assert',
          },
          {
                text: '断言类型',
            link: '/api/assert-type',
          },
          {
            text: '浏览器模式',
            items: [
              {
                text: '渲染函数',
                collapsed: false,
                items: [
                  {
                    text: 'React',
                    link: '/api/browser/react',
                  },
                  {
                    text: 'Vue',
                    link: '/api/browser/vue',
                  },
                  {
                    text: 'Svelte',
                    link: '/api/browser/svelte',
                  },
                  // {
                  //   text: 'angular',
                  //   link: '/api/browser/angular',
                  // },
                ],
              },
              {
                text: '上下文',
                link: '/api/browser/context',
              },
              {
                text: '交互',
                link: '/api/browser/interactivity',
              },
              {
                text: '定位器',
                link: '/api/browser/locators',
              },
              {
                text: '断言',
                link: '/api/browser/assertions',
              },
              {
                text: '命令',
                link: '/api/browser/commands',
              },
            ],
          },
          {
            text: '高级',
            collapsed: false,
            items: [
              {
                text: 'Vitest',
                link: '/api/advanced/vitest',
              },
              {
                text: '测试项目',
                link: '/api/advanced/test-project',
              },
              {
                text: '测试规范',
                link: '/api/advanced/test-specification',
              },
              {
                text: '测试用例',
                link: '/api/advanced/test-case',
              },
              {
                text: '测试套件',
                link: '/api/advanced/test-suite',
              },
              {
                text: '测试模块',
                link: '/api/advanced/test-module',
              },
              {
                text: '测试集合',
                link: '/api/advanced/test-collection',
              },
              {
                text: 'Vitest 插件',
                link: '/api/advanced/plugin',
              },
              {
                text: 'Vitest 运行器',
                link: '/api/advanced/runner',
              },
              {
                text: '报告器',
                link: '/api/advanced/reporters',
              },
              {
                text: '任务元数据',
                link: '/api/advanced/metadata',
              },
              {
                text: '测试产物',
                link: '/api/advanced/artifacts',
              },
            ],
          },
          // {
          //   text: 'Text Runner',
          //   collapsed: false,
          //   items: [
          //     // TODO: generate
          //     {
          //       text: 'test',
          //       link: '/api/test',
          //     },
          //     {
          //       text: 'describe',
          //       link: '/api/describe',
          //     },
          //     {
          //       text: 'beforeEach',
          //       link: '/api/before-each',
          //     },
          //     {
          //       text: 'afterEach',
          //       link: '/api/after-each',
          //     },
          //   ],
          // },
          // {
          //   text: 'Assertion API',
          //   collapsed: false,
          //   items: [
          //     {
          //       text: 'expect',
          //       link: '/api/expect',
          //     },
          //     {
          //       text: 'assert',
          //       link: '/api/assert',
          //     },
          //     {
          //       text: 'expectTypeOf',
          //       link: '/api/expect-typeof',
          //     },
          //     {
          //       text: 'assertType',
          //       link: '/api/assert-type',
          //     },
          //   ],
          // },
          // {
          //   text: 'Vi Utility API',
          //   collapsed: false,
          //   items: [
          //     {
          //       text: 'Mock Modules',
          //       link: '/api/vi/mock-modiles',
          //     },
          //     {
          //       text: 'Mock Functions',
          //       link: '/api/vi/mock-functions',
          //     },
          //     {
          //       text: 'Mock Timers',
          //       link: '/api/vi/mock-timers',
          //     },
          //     {
          //       text: 'Miscellaneous',
          //       link: '/api/vi/miscellaneous',
          //     },
          //   ],
          // },
          // {
          //   text: 'Browser Mode',
          //   collapsed: false,
          //   items: [
          //     // TODO: generate
          //     {
          //       text: 'page',
          //       link: '/api/browser/page',
          //     },
          //     {
          //       text: 'locators',
          //       link: '/api/browser/locators',
          //     },
          //   ],
          // },
        ],
      },
    },
    pwa,
    transformHead,
  })))
}
