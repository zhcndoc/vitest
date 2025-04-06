import type { Theme } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import { inBrowser } from 'vitepress'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HomePage from '../components/HomePage.vue'
import Version from '../components/Version.vue'
import '../style/main.css'
import '../style/vars.css'
import 'uno.css'
import '@shikijs/vitepress-twoslash/style.css'
import 'virtual:group-icons.css'

if (inBrowser) {
  import('./pwa')
}

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(HomePage),
      'aside-outline-after': () => h('div', {
        class: 'wwads-cn wwads-vertical',
        'data-id': '354'
      }),
      'doc-footer-before': () => h('div', {
        class: 'wwads-cn wwads-horizontal my-4 xl:!hidden',
        'data-id': '354'
      }),
    })
  },
  enhanceApp({ app }) {
    app.component('Version', Version)
    app.use(TwoslashFloatingVue)
    enhanceAppWithTabs(app)
  },
} satisfies Theme
