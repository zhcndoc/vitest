import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { transformerNotationWordHighlight } from '@shikijs/transformers'
import { withPwa } from '@vite-pwa/vitepress'
import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { version } from '../package.json'
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

export default ({ mode }: { mode: string }) => {
  return withPwa(defineConfig({
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
      ['meta', { name: 'theme-color', content: '#729b1a' }],
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
      ['link', { rel: 'icon', href: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      ['meta', { name: 'author', content: `${teamMembers.map(c => c.name).join(', ')} and ${vitestName} contributors` }],
      ['meta', { name: 'keywords', content: 'vitest, vite, test, coverage, snapshot, react, vue, preact, svelte, solid, lit, marko, ruby, cypress, puppeteer, jsdom, happy-dom, test-runner, jest, typescript, esm, tinypool, tinyspy, node' }],
      ['meta', { property: 'og:title', content: vitestName }],
      ['meta', { property: 'og:description', content: vitestDescription }],
      ['meta', { property: 'og:url', content: ogUrl }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['link', { rel: 'preload', as: 'style', onload: 'this.onload=null;this.rel=\'stylesheet\'', href: font }],
      ['noscript', {}, `<link rel="stylesheet" crossorigin="anonymous" href="${font}" />`],
      ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
      ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
    ],
    lastUpdated: true,
    vite: {
      plugins: [
        groupIconVitePlugin({
          customIcon: {
            'CLI': 'vscode-icons:file-type-shell',
            'vitest.shims': 'vscode-icons:file-type-vitest',
            'vitest.workspace': 'vscode-icons:file-type-vitest',
            'vitest.config': 'vscode-icons:file-type-vitest',
            '.spec.ts': 'vscode-icons:file-type-testts',
            '.test.ts': 'vscode-icons:file-type-testts',
            '.spec.js': 'vscode-icons:file-type-testjs',
            '.test.js': 'vscode-icons:file-type-testjs',
            'marko': 'vscode-icons:file-type-marko',
          },
        }),
      ],
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
    },
    themeConfig: {
      logo: '/logo.svg',

      editLink: {
        pattern: 'https://github.com/vitest-dev/vitest/edit/main/docs/:path',
        text: 'Suggest changes to this page',
      },

      search: {
        provider: 'local',
      },

      carbonAds: {
        code: 'CW7DVKJE',
        placement: 'vitestdev',
      },

      socialLinks: [
        { icon: 'bluesky', link: bluesky },
        { icon: 'mastodon', link: mastodon },
        { icon: 'discord', link: discord },
        { icon: 'github', link: github },
      ],

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2021-PRESENT Anthony Fu, Matías Capeletto and Vitest contributors',
      },

      nav: [
        { text: '指南 & API', link: '/guide/', activeMatch: '^/(guide|api)/(?!browser)' },
        { text: '配置', link: '/config/', activeMatch: '^/config/' },
        { text: '浏览器模式', link: '/guide/browser', activeMatch: '^/guide/browser/' },
        {
          text: '相关链接',
          items: [
            {
              text: '高级 API',
              link: '/advanced/api/',
              activeMatch: '^/advanced/',
            },
            {
              items: [
                {
                  text: '博客',
                  link: '/blog',
                },
                {
                  text: '团队',
                  link: '/team',
                },
              ],
            },

          ],
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
                  text: '更新日志',
                  link: releases,
                },
                {
                  text: '贡献指南',
                  link: contributing,
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
                  text: 'v0.x',
                  link: 'https://v0.vitest.dev/',
                },
                {
                  text: 'v1.x',
                  link: 'https://v1.vitest.dev/',
                },
                {
                  text: 'v2.x',
                  link: 'https://v2.vitest.dev/',
                },
              ],
            },
          ],
        },
      ],

      sidebar: {
        '/guide/browser': [
          {
            text: '介绍',
            collapsed: false,
            items: [
              {
                text: '什么是浏览器模式',
                link: '/guide/browser/why',
                docFooterText: 'Why Browser Mode | Browser Mode',
              },
              {
                text: '快速起步',
                link: '/guide/browser/',
                docFooterText: 'Getting Started | Browser Mode',
              },
            ],
          },
          {
            text: '配置',
            collapsed: false,
            items: [
              {
                text: '浏览器模式配置',
                link: '/guide/browser/config',
                docFooterText: 'Browser Config Reference | Browser Mode',
              },
              {
                text: '配置 Playwright',
                link: '/guide/browser/playwright',
                docFooterText: 'Configuring Playwright | Browser Mode',
              },
              {
                text: '配置 WebdriverIO',
                link: '/guide/browser/webdriverio',
                docFooterText: 'Configuring WebdriverIO | Browser Mode',
              },
            ],
          },
          {
            text: 'API',
            collapsed: false,
            items: [
              {
                text: '上下文「Context」 API',
                link: '/guide/browser/context',
                docFooterText: 'Context API | Browser Mode',
              },
              {
                text: '交互「Interactivity」 API',
                link: '/guide/browser/interactivity-api',
                docFooterText: 'Interactivity API | Browser Mode',
              },
              {
                text: '定位「Locators」',
                link: '/guide/browser/locators',
                docFooterText: 'Locators | Browser Mode',
              },
              {
                text: 'Assertion API',
                link: '/guide/browser/assertion-api',
                docFooterText: 'Assertion API | Browser Mode',
              },
              {
                text: 'Commands API',
                link: '/guide/browser/commands',
                docFooterText: 'Commands | Browser Mode',
              },
            ],
          },
          {
            text: 'Guides',
            collapsed: false,
            items: [
              {
                text: '多种设置',
                link: '/guide/browser/multiple-setups',
                docFooterText: 'Multiple Setups | Browser Mode',
              },
            ],
          },
          {
            items: [
              ...footer(),
              {
                text: 'Node API Reference',
                link: '/advanced/api/',
              },
            ],
          },
        ],
        '/advanced': [
          {
            text: 'API',
            collapsed: false,
            items: [
              {
                text: 'Node API',
                items: [
                  {
                    text: '快速起步',
                    link: '/advanced/api/',
                  },
                  {
                    text: 'Vitest',
                    link: '/advanced/api/vitest',
                  },
                  {
                    text: 'TestProject',
                    link: '/advanced/api/test-project',
                  },
                  {
                    text: 'TestSpecification',
                    link: '/advanced/api/test-specification',
                  },
                ],
              },
              {
                text: 'Test Task API',
                items: [
                  {
                    text: 'TestCase',
                    link: '/advanced/api/test-case',
                  },
                  {
                    text: 'TestSuite',
                    link: '/advanced/api/test-suite',
                  },
                  {
                    text: 'TestModule',
                    link: '/advanced/api/test-module',
                  },
                  {
                    text: 'TestCollection',
                    link: '/advanced/api/test-collection',
                  },
                ],
              },
              {
                text: '运行器「Runner」 API',
                link: '/advanced/runner',
              },
              {
                text: 'Reporters API',
                link: '/advanced/api/reporters',
              },
              {
                text: 'Task Metadata',
                link: '/advanced/metadata',
              },
            ],
          },
          {
            text: 'Guides',
            collapsed: false,
            items: [
              {
                text: 'Running Tests',
                link: '/advanced/guide/tests',
              },
              {
                text: 'Extending Reporters',
                link: '/advanced/reporters',
              },
              {
                text: 'Custom Pool',
                link: '/advanced/pool',
              },
            ],
          },
          {
            items: footer(),
          },
        ],
        '/team': [],
        '/blog': [],
        '/': [
          {
            text: 'Introduction',
            collapsed: false,
            items: introduction(),
          },
          {
            text: 'API',
            collapsed: false,
            items: api(),
          },
          {
            text: 'Guides',
            collapsed: false,
            items: guide(),
          },
          {
            items: [
              {
                text: 'Browser Mode',
                link: '/guide/browser',
              },
              {
                text: 'Node API Reference',
                link: '/advanced/api',
              },
              {
                text: 'Comparisons',
                link: '/guide/comparisons',
              },
            ],
          },
        ],
      },
    },
    pwa,
    transformHead,
  }))
}

function footer(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Config Reference',
      link: '/config/',
    },
    {
      text: 'Test API Reference',
      link: '/api/',
    },
  ]
}

function introduction(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '简介',
      link: '/guide/why',
    },
    {
      text: '快速起步',
      link: '/guide/',
    },
    {
      text: '主要功能',
      link: '/guide/features',
    },
    {
      text: '配置索引',
      link: '/config/',
    },
  ]
}

function guide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '命令行界面',
      link: '/guide/cli',
    },
    {
      text: '测试筛选',
      link: '/guide/filtering',
    },
    {
      text: '工作空间',
      link: '/guide/workspace',
    },
    {
      text: '报告器「Reporters」',
      link: '/guide/reporters',
    },
    {
      text: '测试覆盖率',
      link: '/guide/coverage',
    },
    {
      text: '测试快照',
      link: '/guide/snapshot',
    },
    {
      text: '模拟对象',
      link: '/guide/mocking',
    },
    {
      text: '类型测试',
      link: '/guide/testing-types',
    },
    {
      text: 'Vitest UI',
      link: '/guide/ui',
    },
    {
      text: '源码内联测试',
      link: '/guide/in-source',
    },
    {
      text: '测试上下文',
      link: '/guide/test-context',
    },
    {
      text: '测试环境',
      link: '/guide/environment',
    },
    {
      text: '扩展断言(Matchers)',
      link: '/guide/extending-matchers',
    },
    {
      text: 'IDE 插件',
      link: '/guide/ide',
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
      text: '迁移指南',
      link: '/guide/migration',
      collapsed: false,
      items: [
        {
          text: '迁移到 Vitest 3.0',
          link: '/guide/migration#vitest-3',
        },
        {
          text: '从 Jest 迁移',
          link: '/guide/migration#jest',
        },
      ],
    },
    {
      text: 'Performance',
      collapsed: false,
      items: [
        {
          text: '性能测试分析',
          link: '/guide/profiling-test-performance',
        },
        {
          text: '性能优化',
          link: '/guide/improving-performance',
        },
      ],
    },
  ]
}

function api(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Test API 索引',
      link: '/api/',
    },
    {
      text: 'Mock Functions',
      link: '/api/mock',
    },
    {
      text: 'Vi Utility',
      link: '/api/vi',
    },
    {
      text: 'Expect',
      link: '/api/expect',
    },
    {
      text: 'ExpectTypeOf',
      link: '/api/expect-typeof',
    },
    {
      text: 'Assert',
      link: '/api/assert',
    },
    {
      text: 'AssertType',
      link: '/api/assert-type',
    },
  ]
}
