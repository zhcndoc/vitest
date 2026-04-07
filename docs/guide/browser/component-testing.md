---
title: 组件测试 | 指南
outline: deep
---

# 组件测试

组件测试是一种测试策略，专注于孤立地测试各个 UI 组件。与测试整个用户流程的端到端测试不同，组件测试验证每个组件自身是否正常工作，这使得它们运行更快且更易于调试。

Vitest 为包括 Vue、React、Svelte、Lit、Preact、Qwik、Solid、Marko 等在内的多个框架提供了全面的组件测试支持。本指南涵盖了使用 Vitest 有效测试组件的具体模式、工具和最佳实践。

## 为什么需要组件测试？

组件测试位于单元测试和端到端测试之间，提供以下几个优势：

- **更快的反馈** - 无需加载整个应用程序即可测试单个组件
- **孤立测试** - 专注于组件行为，无需外部依赖
- **更好的调试** - 更容易定位特定组件中的问题
- **全面的覆盖** - 更容易测试边界情况和错误状态

## 用于组件测试的浏览器模式

Vitest 中的组件测试使用 **浏览器模式** 通过 Playwright、WebdriverIO 或预览模式在真实的浏览器环境中运行测试。这提供了最准确的测试环境，因为你的组件在真实浏览器中运行，具有实际的 DOM 实现、CSS 渲染和浏览器 API。

### 为什么使用浏览器模式？

浏览器模式是组件测试的推荐方法，因为它提供了最准确的测试环境。与 DOM 模拟库不同，浏览器模式能够捕捉到可能影响用户的现实世界问题。

::: tip
浏览器模式能够捕捉到 DOM 模拟库可能忽略的问题，包括：
- CSS 布局和样式问题
- 真实的浏览器 API 行为
- 准确的事件处理和传播
- 正确的焦点管理和无障碍功能

:::

### 本指南的目的

本指南专门关注使用 Vitest 功能的 **组件测试模式和最佳实践**。虽然许多示例使用浏览器模式（因为它是推荐的方法），但这里的重点是组件特定的测试策略，而不是浏览器配置细节。

有关详细的浏览器设置、配置选项和高级浏览器功能，请参阅 [浏览器模式文档](/guide/browser/)。

## 什么是好的组件测试

好的组件测试专注于 **行为和用户体验** 而不是实现细节：

- **测试契约** - 组件如何接收输入（props）并产生输出（事件、渲染）
- **测试用户交互** - 点击、表单提交、键盘导航
- **测试边界情况** - 错误状态、加载状态、空状态
- **避免测试内部实现** - 状态变量、私有方法、CSS 类

### 组件测试层级

```
1. 关键用户路径 → 始终测试这些
2. 错误处理      → 测试失败场景
3. 边界情况      → 空数据、极端值
4. 无障碍        → 屏幕阅读器、键盘导航
5. 性能          → 大数据集、动画
```

## 组件测试策略

### 孤立策略

通过模拟依赖项来孤立测试组件：

```tsx
// 对于 API 请求，我们推荐使用 MSW (Mock Service Worker)
// 参见：https://vitest.dev/guide/mocking/requests
//
// vi.mock(import('../api/userService'), () => ({
//   fetchUser: vi.fn().mockResolvedValue({ name: 'John' })
// }))

// 模拟子组件以专注于父组件逻辑
vi.mock(import('../components/UserCard'), () => ({
  default: vi.fn(({ user }) => `<div>User: ${user.name}</div>`)
}))

test('UserProfile 处理加载和数据状态', async () => {
  const { getByText } = render(<UserProfile userId="123" />)

  // 测试加载状态
  await expect.element(getByText('Loading...')).toBeInTheDocument()

  // 测试数据加载（expect.element 会自动重试）
  await expect.element(getByText('User: John')).toBeInTheDocument()
})
```

### 集成策略

测试组件协作和数据流：

```tsx
test('ProductList 正确过滤和显示产品', async () => {
  const mockProducts = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 999 },
    { id: 2, name: 'Book', category: 'Education', price: 29 }
  ]

  const { getByLabelText, getByText } = render(
    <ProductList products={mockProducts} />
  )

  // 最初显示所有产品
  await expect.element(getByText('Laptop')).toBeInTheDocument()
  await expect.element(getByText('Book')).toBeInTheDocument()

  // 按类别过滤
  await userEvent.selectOptions(
    getByLabelText(/category/i),
    'Electronics'
  )

  // 只应保留电子产品
  await expect.element(getByText('Laptop')).toBeInTheDocument()
  await expect.element(queryByText('Book')).not.toBeInTheDocument()
})
```

## Testing Library 集成

虽然 Vitest 为流行框架提供了官方包 ([`vitest-browser-vue`](https://npmx.dev/package/vitest-browser-vue), [`vitest-browser-react`](https://npmx.dev/package/vitest-browser-react), [`vitest-browser-svelte`](https://npmx.dev/package/vitest-browser-svelte))，但对于尚未官方支持的框架，你可以集成 [Testing Library](https://testing-library.com/)。

### 何时使用 Testing Library

- 你的框架还没有官方的 Vitest 浏览器包
- 你正在迁移使用 Testing Library 的现有测试
- 你更喜欢 Testing Library 的 API 用于特定测试场景

### 集成模式

关键是使用 `page.elementLocator()` 将 Testing Library 的 DOM 输出与 Vitest 的浏览器模式 API 桥接起来：

```jsx
// 对于 Solid.js 组件
import { render } from '@testing-library/solid'
import { page } from 'vitest/browser'

test('Solid 组件处理用户交互', async () => {
  // 使用 Testing Library 渲染组件
  const { baseElement, getByRole } = render(() =>
    <Counter initialValue={0} />
  )

  // 桥接到 Vitest 的浏览器模式以进行交互和断言
  const screen = page.elementLocator(baseElement)

  // 使用 Vitest 的页面查询查找元素
  const incrementButton = screen.getByRole('button', { name: /increment/i })

  // 使用 Vitest 的断言和交互
  await expect.element(screen.getByText('Count: 0')).toBeInTheDocument()

  // 使用 Vitest 的页面 API 触发用户交互
  await incrementButton.click()

  await expect.element(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### 可用的 Testing Library 包

与 Vitest 配合良好的流行 Testing Library 包：

- [`@testing-library/solid`](https://github.com/solidjs/solid-testing-library) - 用于 Solid.js
- [`@marko/testing-library`](https://testing-library.com/docs/marko-testing-library/intro) - 用于 Marko
- [`@testing-library/svelte`](https://testing-library.com/docs/svelte-testing-library/intro) - [`vitest-browser-svelte`](https://npmx.dev/package/vitest-browser-svelte) 的替代方案
- [`@testing-library/vue`](https://testing-library.com/docs/vue-testing-library/intro) - [`vitest-browser-vue`](https://npmx.dev/package/vitest-browser-vue) 的替代方案

::: tip 迁移路径
如果你的框架后来获得了官方 Vitest 支持，你可以通过替换 Testing Library 的 `render` 函数来逐步迁移，同时保持大部分测试逻辑不变。
:::

## 最佳实践

### 1. 在 CI/CD 中使用浏览器模式
确保测试在真实的浏览器环境中运行以获得最准确的测试。浏览器模式提供准确的 CSS 渲染、真实的浏览器 API 和正确的事件处理。

### 2. 测试用户交互
模拟真实的用户行为使用 Vitest 的 [交互 API](/api/browser/interactivity)。如我们的 [高级测试模式](#advanced-testing-patterns) 所示，使用 `page.getByRole()` 和 `userEvent` 方法：

```tsx
// 好：测试实际的用户交互
await page.getByRole('button', { name: /submit/i }).click()
await page.getByLabelText(/email/i).fill('user@example.com')

// 避免：测试实现细节
// component.setState({ email: 'user@example.com' })
```

### 3. 测试无障碍性
通过测试键盘导航、焦点管理和 ARIA 属性，确保组件适用于所有用户。请参阅我们的 [测试无障碍性](#testing-accessibility) 示例以获取实用模式：

```tsx
// 测试键盘导航
await userEvent.keyboard('{Tab}')
await expect.element(document.activeElement).toHaveFocus()

// 测试 ARIA 属性
await expect.element(modal).toHaveAttribute('aria-modal', 'true')
```

### 4. 模拟外部依赖
通过模拟 API 和外部服务，将测试集中在组件逻辑上。这使得测试更快且更可靠。请参阅我们的 [孤立策略](#isolation-strategy) 示例：

```tsx
// 对于 API 请求，我们推荐使用 MSW (Mock Service Worker)
// 参见：https://vitest.dev/guide/mocking/requests
// 这提供了更真实的请求/响应模拟

// 对于模块模拟，使用 import() 语法
vi.mock(import('../components/UserCard'), () => ({
  default: vi.fn(() => <div>Mocked UserCard</div>)
}))
```

### 5. 使用有意义的测试描述
编写解释预期行为的测试描述，而不是实现细节：

```tsx
// 好：描述面向用户的行为
test('当电子邮件格式无效时显示错误消息')
test('表单提交时禁用提交按钮')

// 避免：面向实现的描述
test('调用 validateEmail 函数')
test('将 isSubmitting 状态设置为 true')
```

## 高级测试模式

### 测试组件状态管理

```tsx
// 测试有状态组件和状态转换
test('ShoppingCart 正确管理项目', async () => {
  const { getByText, getByTestId } = render(<ShoppingCart />)

  // 最初为空
  await expect.element(getByText('Your cart is empty')).toBeInTheDocument()

  // 添加项目
  await page.getByRole('button', { name: /add laptop/i }).click()

  // 验证状态变化
  await expect.element(getByText('1 item')).toBeInTheDocument()
  await expect.element(getByText('Laptop - $999')).toBeInTheDocument()

  // 测试数量更新
  await page.getByRole('button', { name: /increase quantity/i }).click()
  await expect.element(getByText('2 items')).toBeInTheDocument()
})
```

### 测试带有数据获取的异步组件

```tsx
// 选项 1：推荐 - 使用 MSW (Mock Service Worker) 进行 API 模拟
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

// 设置带有 API 处理程序的 MSW worker
const worker = setupWorker(
  http.get('/api/users/:id', ({ params }) => {
    // 描述成功路径
    return HttpResponse.json({ id: params.id, name: 'John Doe', email: 'john@example.com' })
  })
)

// 在所有测试之前启动 worker
beforeAll(() => worker.start())
afterEach(() => worker.resetHandlers())
afterAll(() => worker.stop())

test('UserProfile 处理加载、成功和错误状态', async () => {
  // 测试成功状态
  const { getByText } = render(<UserProfile userId="123" />)
  // expect.element 会自动重试直到找到元素
  await expect.element(getByText('John Doe')).toBeInTheDocument()
  await expect.element(getByText('john@example.com')).toBeInTheDocument()

  // 通过覆盖此测试的处理程序来测试错误状态
  worker.use(
    http.get('/api/users/:id', () => {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    })
  )

  const { getByText: getErrorText } = render(<UserProfile userId="999" />)
  await expect.element(getErrorText('Error: User not found')).toBeInTheDocument()
})
```

::: tip
查看更多关于 [在浏览器中使用 MSW](https://mswjs.io/docs/integrations/browser) 的详情。
:::

### 测试组件通信

```tsx
// 测试父子组件交互
test('父组件和子组件正确通信', async () => {
  const mockOnSelectionChange = vi.fn()

  const { getByText } = render(
    <ProductCatalog onSelectionChange={mockOnSelectionChange}>
      <ProductFilter />
      <ProductGrid />
    </ProductCatalog>
  )

  // 与子组件交互
  await page.getByRole('checkbox', { name: /electronics/i }).click()

  // 验证父组件接收通信
  expect(mockOnSelectionChange).toHaveBeenCalledWith({
    category: 'electronics',
    filters: ['electronics']
  })

  // 验证其他子组件更新（expect.element 会自动重试）
  await expect.element(getByText('Showing Electronics products')).toBeInTheDocument()
})
```

### 测试带有验证的复杂表单

```tsx
test('ContactForm 处理复杂验证场景', async () => {
  const mockSubmit = vi.fn()
  const { getByLabelText, getByText } = render(
    <ContactForm onSubmit={mockSubmit} />
  )

  const nameInput = page.getByLabelText(/full name/i)
  const emailInput = page.getByLabelText(/email/i)
  const messageInput = page.getByLabelText(/message/i)
  const submitButton = page.getByRole('button', { name: /send message/i })

  // 测试验证触发
  await submitButton.click()

  await expect.element(getByText('Name is required')).toBeInTheDocument()
  await expect.element(getByText('Email is required')).toBeInTheDocument()
  await expect.element(getByText('Message is required')).toBeInTheDocument()

  // 测试部分验证
  await nameInput.fill('John Doe')
  await submitButton.click()

  await expect.element(getByText('Name is required')).not.toBeInTheDocument()
  await expect.element(getByText('Email is required')).toBeInTheDocument()

  // 测试电子邮件格式验证
  await emailInput.fill('invalid-email')
  await submitButton.click()

  await expect.element(getByText('Please enter a valid email')).toBeInTheDocument()

  // 测试成功提交
  await emailInput.fill('john@example.com')
  await messageInput.fill('Hello, this is a test message.')
  await submitButton.click()

  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, this is a test message.'
  })
})
```

### 测试错误边界

```tsx
// 测试组件如何处理和从错误中恢复
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Component error!')
  }
  return <div>Component working fine</div>
}

test('ErrorBoundary 捕获并优雅地显示错误', async () => {
  const { getByText, rerender } = render(
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  )

  // 最初正常工作
  await expect.element(getByText('Component working fine')).toBeInTheDocument()

  // 触发错误
  rerender(
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  )

  // 错误边界应该捕获它
  await expect.element(getByText('Something went wrong')).toBeInTheDocument()
})
```

### 测试无障碍性

```tsx
test('Modal 组件是可访问的', async () => {
  const { getByRole, getByLabelText } = render(
    <Modal isOpen={true} title="Settings">
      <SettingsForm />
    </Modal>
  )

  // 测试焦点管理 - 模态框打开时应接收焦点
  // 这对于屏幕阅读器用户知道模态框已打开至关重要
  const modal = getByRole('dialog')
  await expect.element(modal).toHaveFocus()

  // 测试 ARIA 属性 - 这些为屏幕阅读器提供语义信息
  await expect.element(modal).toHaveAttribute('aria-labelledby') // 链接到标题元素
  await expect.element(modal).toHaveAttribute('aria-modal', 'true') // 指示模态框行为

  // 测试键盘导航 - Escape 键应关闭模态框
  // 这是 ARIA 创作实践所要求的
  await userEvent.keyboard('{Escape}')
  // expect.element 会自动重试直到模态框被移除
  await expect.element(modal).not.toBeInTheDocument()

  // 测试焦点陷阱 - 标签导航应在模态框内循环
  // 这防止用户标签导航到模态框后面的内容
  const firstInput = getByLabelText(/username/i)
  const lastButton = getByRole('button', { name: /save/i })

  // 使用点击聚焦到第一个输入，然后测试标签导航
  await firstInput.click()
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}') // Shift+Tab 向后移动
  await expect.element(lastButton).toHaveFocus() // 应该环绕到最后一个元素
})
```

## 调试组件测试

### 1. 使用浏览器开发工具

Browser Mode 在真实浏览器中运行测试，让你可以使用完整的开发工具。当测试失败时，你可以：

- 在测试执行期间**打开浏览器开发工具**（F12 或右键 → 检查）
- 在测试代码或组件代码中**设置断点**
- **检查 DOM** 以查看实际渲染的输出
- **检查控制台错误** 以查找 JavaScript 错误或警告
- **监控网络请求** 以调试 API 调用

对于有头模式调试，临时在你的浏览器配置中添加 `headless: false`。

### 2. 添加调试语句

使用策略性日志记录来理解测试失败原因：

```tsx
test('debug form validation', async () => {
  render(<ContactForm />)

  const submitButton = page.getByRole('button', { name: /submit/i })
  await submitButton.click()

  // 调试：使用不同的查询检查元素是否存在
  const errorElement = page.getByText('Email is required')
  console.log('Error element found:', errorElement.length)

  await expect.element(errorElement).toBeInTheDocument()
})
```

### 3. 检查渲染输出

当组件未按预期渲染时，系统地调查：

**使用 Vitest 的浏览器 UI：**
- 启用 browser mode 运行测试
- 打开终端中显示的浏览器 URL 以查看测试运行
- 视觉检查有助于识别 CSS 问题、布局问题或缺失的元素

**测试元素查询：**
```tsx
// 调试为什么找不到元素
const button = page.getByRole('button', { name: /submit/i })
console.log('Button count:', button.length) // 应该是 1

// 如果第一个查询失败，尝试替代查询
if (button.length === 0) {
  console.log('All buttons:', page.getByRole('button').length)
  console.log('By test ID:', page.getByTestId('submit-btn').length)
}
```

### 4. 验证选择器

选择器问题是测试失败的常见原因。系统地调试它们：

**检查可访问名称：**
```tsx
// 如果 getByRole 失败，检查有哪些可用的角色/名称
const buttons = page.getByRole('button').all()
for (const button of buttons) {
  // 使用 element() 获取 DOM 元素并访问原生属性
  const element = button.element()
  const accessibleName = element.getAttribute('aria-label') || element.textContent
  console.log(`Button: "${accessibleName}"`)
}
```

**测试不同的查询策略：**
```tsx
// 使用 .or 自动重试的多种查找同一元素的方法
const submitButton = page.getByRole('button', { name: /submit/i }) // 通过可访问名称
  .or(page.getByTestId('submit-button')) // 通过测试 ID
  .or(page.getByText('Submit')) // 通过精确文本
// 注意：Vitest 没有 page.locator()，请使用特定的 getBy* 方法代替
```

**常见选择器调试模式：**
```tsx
test('debug element queries', async () => {
  render(<LoginForm />)

  // 检查元素是否可见且启用
  const emailInput = page.getByLabelText(/email/i)
  await expect.element(emailInput).toBeVisible() // 如果元素可见将显示，否则将打印 DOM
})
```

### 5. 调试异步问题

组件测试通常涉及时序问题：

```tsx
test('debug async component behavior', async () => {
  render(<AsyncUserProfile userId="123" />)

  // expect.element 将自动重试并显示有用的错误消息
  await expect.element(page.getByText('John Doe')).toBeInTheDocument()
})
```

## 从其他测试框架迁移

### 从 Jest + Testing Library

大多数 Jest + Testing Library 测试只需极少更改即可工作：

```ts
// 之前 (Jest)
import { render, screen } from '@testing-library/react' // [!code --]

// 之后 (Vitest)
import { render } from 'vitest-browser-react' // [!code ++]
```

### 主要区别

- 对于 DOM 断言，使用 `await expect.element()` 而不是 `expect()`
- 对于用户交互，使用 `vitest/browser` 而不是 `@testing-library/user-event`
- Browser Mode 提供真实的浏览器环境以实现准确测试

## 了解更多

- [Browser Mode 文档](/guide/browser/)
- [断言 API](/api/browser/assertions)
- [交互 API](/api/browser/interactivity)
- [示例仓库](https://github.com/vitest-tests/browser-examples)
