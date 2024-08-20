import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { version } from '../package.json'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import {
  contributing,
  font,
  github,
  ogImage,
  ogUrl,
  releases,
  vitestDescription,
  vitestName,
} from './meta'
import { pwa } from './scripts/pwa'
import { transformHead } from './scripts/transformHead'
import { teamMembers } from './contributors'

export default ({ mode }: { mode: string }) => {
  return withPwa(defineConfig({
    lang: 'zh-CN',
    title: vitestName,
    titleTemplate: ':title - Vitest 中文文档',
    description: vitestDescription,
    locales: {
      root: {
        label: '简体中文',
        lang: 'zh',
      },
      en: {
        label: 'English',
        lang: 'en',
        link: 'https://vitest.dev/',
      },
    },
    head: [
      ['meta', { name: 'baidu-site-verification', content: 'codeva-ODQv7tkUKc' }],
      [
        'script',
        {
          'defer': '',
          'src': 'https://analytics.ikxin.com/script.js',
          'data-website-id': 'f0e90b0d-e086-4fdc-b173-de4857b71900',
        },
      ],
      ['meta', { name: 'theme-color', content: '#729b1a' }],
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
      ['link', { rel: 'icon', href: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      ['meta', { name: 'author', content: `${teamMembers.map(c => c.name).join(', ')} and ${vitestName} contributors` }],
      ['meta', { name: 'keywords', content: 'vitest, vite, test, coverage, snapshot, react, vue, preact, svelte, solid, lit, marko, ruby, cypress, puppeteer, jsdom, happy-dom, test-runner, jest, typescript, esm, tinypool, tinyspy, node' }],
      ['meta', { property: 'og:title', content: vitestName }],
      ['meta', { property: 'og:description', content: vitestDescription }],
      ['meta', { property: 'og:url', content: ogUrl }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { name: 'twitter:title', content: vitestName }],
      ['meta', { name: 'twitter:description', content: vitestDescription }],
      ['meta', { name: 'twitter:image', content: ogImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['link', { rel: 'preload', as: 'style', onload: 'this.onload=null;this.rel=\'stylesheet\'', href: font }],
      ['noscript', {}, `<link rel="stylesheet" crossorigin="anonymous" href="${font}" />`],
      ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
      ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
    ],
    lastUpdated: true,
    markdown: {
      config(md) {
        md.use(tabsMarkdownPlugin)
      },
      theme: {
        light: 'github-light',
        dark: 'github-dark',
      },
      codeTransformers: mode === 'development'
        ? []
        : [
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
    ignoreDeadLinks: true,

    sitemap: {
      hostname: 'https://vitest.zhcndoc.com'
    },

    themeConfig: {
      logo: '/logo.svg',

      editLink: {
        text: '在 GitHub 上查看此页面',
        pattern: 'https://github.com/zhcndoc/vitest/tree/main/:path',
      },
      docFooter: {
        prev: '上一页',
        next: '下一页',
      },
      outline: {
        label: '页面导航',
      },
      lastUpdated: {
        text: '最后更新于',
        formatOptions: {
          dateStyle: 'short',
          timeStyle: 'medium',
        },
      },
      langMenuLabel: '多语言',
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',

      search: {
        provider: 'local',
      },

      carbonAds: {
        code: 'CW7DVKJE',
        placement: 'vitestdev',
      },

      carbonAds: {
        code: 'CW7DVKJE',
        placement: 'vitestdev',
      },

      socialLinks: [
        { icon: 'github', link: github },
      ],

      footer: {
        message: `
          <a style="text-decoration: none;" rel="nofollow" target="__blank" href="https://zeabur.com?referralCode=ikxin&amp;utm_source=ikxin">Deployed on Zeabur</a>
          <a style="text-decoration: none; margin-left: 8px;" rel="nofollow" target="__blank" href="https://beian.miit.gov.cn">沪ICP备2024070610号-3</a>
        `,
        copyright: 'Copyright © 2021-2024 Anthony Fu, Matías Capeletto 和 Vitest 贡献者',
      },

      nav: [
        { text: '指南', link: '/guide/', activeMatch: '^/guide/(?!browser)' },
        { text: 'API', link: '/api/', activeMatch: '^/api/' },
        { text: '配置', link: '/config/', activeMatch: '^/config/' },
        { text: '浏览器模式', link: '/guide/browser', activeMatch: '^/guide/browser/' },
        { text: '高级 API', link: '/advanced/api', activeMatch: '^/advanced/' },
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
                  text: '版本发布',
                  link: releases,
                },
                {
                  text: '社区指南',
                  link: contributing,
                },
              ]
            },
            {
              items: [
                {
                  text: 'unreleased',
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
              ],
            },
          ],
        },
      ],

      sidebar: {
        '/guide/browser': [
          {
            text: 'Why Browser Mode?',
            link: '/guide/browser/why',
            docFooterText: 'Why Browser Mode? | Browser Mode',
          },
          {
            text: 'Getting Started',
            link: '/guide/browser/',
            docFooterText: 'Getting Started | Browser Mode',
          },
          {
            text: 'Context API',
            link: '/guide/browser/context',
            docFooterText: 'Context API | Browser Mode',
          },
          {
            text: 'Interactivity API',
            link: '/guide/browser/interactivity-api',
            docFooterText: 'Interactivity API | Browser Mode',
          },
          {
            text: 'Locators',
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
        // TODO: bring sidebar of apis and config back
        '/advanced': [
          {
            text: '高级 API',
            items: [
              {
                text: 'Vitest Node API',
                link: '/advanced/api',
              },
              {
                text: 'Runner API',
                link: '/advanced/runner',
              },
              {
                text: 'Task Metadata',
                link: '/advanced/metadata',
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
        ],
        '/': [
          {
            text: '指南',
            items: [
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
                text: '工作空间',
                link: '/guide/workspace',
              },
              {
                text: '命令行界面',
                link: '/guide/cli',
              },
              {
                text: '测试筛选',
                link: '/guide/filtering',
              },
              {
                text: '报告器',
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
                text: '扩展断言',
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
                text: '与其他测试框架对比',
                link: '/guide/comparisons',
              },
              {
                text: '迁移指南',
                link: '/guide/migration',
              },
              {
                text: '常见错误',
                link: '/guide/common-errors',
              },
              {
                text: '性能优化',
                link: '/guide/improving-performance',
              },
            ],
          },
          {
            text: 'API',
            items: [
              {
                text: 'Test API Reference',
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
            ],
          },
          {
            text: '配置',
            items: [
              {
                text: '配置文件',
                link: '/config/file',
              },
              {
                text: '配置索引',
                link: '/config/',
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
