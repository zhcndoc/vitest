---
title: 扩展浏览器定位器 | 配方
---

# 领域定位器

内置的 [定位器](/api/browser/locators)，如 `getByRole` 和 `getByText`，可以覆盖映射到无障碍属性的查询。当应用中存在不适配 ARIA 的结构时，它们就不够用了，比如“有 N 条回复的评论”或自定义表格组件中的一行。

此时的回退方案是使用 `querySelector`。这当然可行，但得到的只是普通查询而不是定位器，因此你会失去自动重试和严格模式保护。

[`locators.extend`](/api/browser/locators#custom-locators) <Version>3.2.0</Version> 可以在不放弃定位器 API 的前提下，添加一个领域特定的定位器。该方法返回的值仍然是定位器，因此自动重试、严格模式保护以及链式调用都会传递到你的自定义方法中。你为这些方法取的名字会成为团队测试词汇的一部分：`page.getByCard({ id: 'product-1' })` 读起来更像是在描述产品而不是 DOM，而且同一个名称会在整个测试套件中保持一致地出现。

## 返回 Playwright 字符串

最简单的形式是返回一个 [Playwright 定位器字符串](https://playwright.dev/docs/other-locators)。Vitest 会把返回的字符串当作调用该方法的定位器的子查询：当在 `page` 上调用时，该字符串会作用于整个页面；当在父级定位器上调用时，它会限定在该父级的子树中执行。

当新的查询在内置定位器中没有合适的表达方式时，就适合使用这种形式，比如一个适用于既不映射到内置角色的控件的“带文本的 CSS 选择器”，或者一个你无法控制的遗留组件所需的 XPath。

```ts
import { locators } from 'vitest/browser'

locators.extend({
  getByCommentsCount(count: number) {
    return `.comments :text("${count} comments")`
  },
})
```

```ts
import { expect, test } from 'vitest'
import { page } from 'vitest/browser'

test('article shows comment count', async () => {
  await expect.element(page.getByCommentsCount(1)).toBeVisible()
  await expect.element(
    page.getByRole('article', { name: 'Hello World' })
      .getByCommentsCount(1)
  ).toBeVisible()
})
```

## 组合已有定位器

当你返回的是定位器而不是字符串时，Vitest 会直接使用该定位器。在扩展方法内部，`this` 会绑定到该方法被调用时的定位器（或顶层调用时绑定到 `page`），因此你可以链式使用已有定位器，或应用 `filter` 来表达元素之间的关系，而这些关系可能没有任何单一的内置选项能够捕获。

下面的示例使用 `filter({ has })` 将行定位器缩小到包含指定名称按钮的那些行，把常见的“每行操作”模式编码成一个单独命名的查询：

```ts
import { locators } from 'vitest/browser'
import type { Locator } from 'vitest/browser'

locators.extend({
  getRowWithAction(this: Locator, action: string) {
    return this.getByRole('row').filter({
      has: this.getByRole('button', { name: action }),
    })
  },
})
```

```ts
await page.getRowWithAction('Delete').first().click()
```

当这两种方式都能表达查询时，优先选择这种方式而不是原始字符串形式。内置定位器封装了感知无障碍的查询，而对它们进行链式组合或过滤会保留这些保证。只有在没有任何内置定位器链能够覆盖该查询时，才使用原始字符串形式，因为字符串会执行你写下的任意选择器，并绕过你原本想保留的定位器机制。

## 自定义交互

执行交互而不是返回定位器的方法也同样可用。这与用来构建你自己的用户动作 DSL 的机制相同，这些动作与查询并列定义，因此测试词汇保持一致。

`locators.extend` 会把 `this` 类型化为 `BrowserPage | Locator`，因为自定义方法从两者都可以访问。对于查询辅助方法来说这没问题，因为 `getByRole` 和其他查询方法在两者上都存在。对于交互辅助方法就不一样了：`page` 没有 `click` 或 `fill`，因此调用 `page.clickAndFill('x')` 会在运行时失败。你可以通过将 `this` 与 `page` 单例进行比较来避免这一点，这样在抛出异常后 TypeScript 就能把 `this` 缩小为 `Locator`：

```ts
import { locators, page } from 'vitest/browser'
import type { BrowserPage, Locator } from 'vitest/browser'

locators.extend({
  async clickAndFill(this: BrowserPage | Locator, text: string) {
    if (this === page) {
      throw new TypeError(
        'clickAndFill must be called on a locator, like page.getByRole(\'textbox\').clickAndFill(...)',
      )
    }
    await this.click()
    await this.fill(text)
  },
})

await page.getByRole('textbox').clickAndFill('Hello World')
```

交互方法不会组合成选择器。`page.getByRole('textbox').clickAndFill('Hello')` 可以工作，是因为 `getByRole` 返回了一个定位器；`page.clickAndFill('Hello')` 会触发这个保护。此形式适合用于动作辅助方法，而不适合查询辅助方法。

## 扩充定位器类型

`locators.extend` 是一个运行时注册。TypeScript 在你为 [`LocatorSelectors`](/api/browser/locators) 接口做扩展之前，并不知道这些新方法；通常这会放在一个共享的 `.d.ts` 文件中：

```ts
import 'vitest/browser'

declare module 'vitest/browser' {
  interface LocatorSelectors {
    getByCommentsCount: (count: number) => Locator
    getRowWithAction: (action: string) => Locator
    clickAndFill: (text: string) => Promise<void>
  }
}
```

`LocatorSelectors` 是 `Locator` 和 `BrowserPage` 都扩展的接口，因此其上声明的任何方法都会同时出现在两者上。这与 `locators.extend` 在运行时的行为一致，这也是为什么像 `clickAndFill` 这样的交互辅助方法需要前面的保护：TypeScript 会允许 `page.clickAndFill('x')` 通过类型检查，但这个保护会在它触及缺失的方法之前捕获误用。

## 另请参见

- [自定义定位器 API](/api/browser/locators#custom-locators)
- [内置定位器](/api/browser/locators)
- [Playwright “其他定位器”](https://playwright.dev/docs/other-locators)
