---
title: 实践中的测试 | 指南
prev:
  text: 快照测试
  link: /guide/learn/snapshots
next:
  text: 调试测试
  link: /guide/learn/debugging-tests
---

# 实践中的测试

之前的页面介绍了 Vitest API：断言、模拟、快照和测试生命周期钩子。本页专注于将这些工具应用于真实代码。它涵盖了如何决定要测试什么、如何有效地构建测试，以及随着项目增长如何组织测试文件。

## 要测试什么

当你坐下来为一个函数或模块编写测试时，首先思考它的**契约**：它对调用它的代码承诺了什么？契约由它的输入（参数、配置）和输出（返回值、副作用、错误）定义。这些就是测试应该验证的内容。

以一个 `formatPrice` 函数为例：

```js [formatPrice.js]
export function formatPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
```

这里的契约是：给定一个金额和货币代码，返回一个格式化后的价格字符串。针对这个函数，良好的测试应覆盖：

```js [formatPrice.test.js]
import { expect, test } from 'vitest'
import { formatPrice } from './formatPrice.js'

test('formats USD prices', () => {
  expect(formatPrice(10, 'USD')).toBe('$10.00')
})

test('formats EUR prices', () => {
  expect(formatPrice(10, 'EUR')).toMatchInlineSnapshot(`"€10.00"`)
})

test('handles zero', () => {
  expect(formatPrice(0, 'USD')).toBe('$0.00')
})

test('handles negative amounts', () => {
  expect(formatPrice(-5.5, 'USD')).toBe('-$5.50')
})

test('rounds to two decimal places', () => {
  expect(formatPrice(10.999, 'USD')).toBe('$11.00')
})
```

注意这些测试*没有*做什么。它们没有检查传递给内部 `Intl.NumberFormat` 的选项，也没有检查中间变量。它们只验证输出。

::: tip
一个实用的经验法则是：如果有人重构了内部实现但输出保持不变，测试应该失败吗？如果是，那么你很可能在测试实现细节而不是行为。
:::

## 测试结构

大多数测试遵循自然的三个部分结构，有时称为“安排、执行、断言”：

1. **设置**测试所需的数据
2. **调用**被测试的函数或执行操作
3. **检查**结果是否符合预期

```js
test('removes an item from the list', () => {
  // 设置
  const list = new ShoppingList()
  list.add('milk')
  list.add('bread')

  // 执行
  list.remove('milk')

  // 检查
  expect(list.getItems()).toEqual(['bread'])
})
```

不需要注释来标记每个部分。写几次测试后，结构会变得自然。重要的是保持每个测试只关注一个行为。

### 每个测试只验证一个行为

如果你发现自己测试名称中写有“并且”（and）、“或者”（or）等连词，这通常是一个信号，表明你应该将其拆分为多个独立的测试。

### 描述性名称

编写描述行为的测试名称，而不是实现细节。“返回美元格式的价格”比“使用正确的选项调用 Intl.NumberFormat”更好。当测试失败时，测试名称应该能告诉你哪里出了问题，而无需阅读测试主体。

## 测试边界情况

在覆盖主要行为之后，考虑边界情况。边缘在哪里？哪些输入不寻常但有效？当出错时应该发生什么？

下面是一个处理 `parseAge` 函数的例子，它接收用户输入并返回数字：

```js [parseAge.js]
export function parseAge(input) {
  const age = Number(input)
  if (Number.isNaN(age) || age < 0 || age > 150) {
    throw new Error(`Invalid age: ${input}`)
  }
  return Math.floor(age)
}
```

快乐路径很直接，但边界情况往往隐藏着 bug：

```js [parseAge.test.js]
import { expect, test } from 'vitest'
import { parseAge } from './parseAge.js'

test('parses a valid age', () => {
  expect(parseAge('25')).toBe(25)
})

test('rounds down decimal ages', () => {
  expect(parseAge('25.9')).toBe(25)
})

test('handles zero', () => {
  expect(parseAge('0')).toBe(0)
})

test('handles the upper boundary', () => {
  expect(parseAge('150')).toBe(150)
})

test('throws for negative numbers', () => {
  expect(() => parseAge('-1')).toThrow('Invalid age: -1')
})

test('throws for numbers above 150', () => {
  expect(() => parseAge('151')).toThrow('Invalid age: 151')
})

test('throws for non-numeric strings', () => {
  expect(() => parseAge('abc')).toThrow('Invalid age: abc')
})

test('throws for empty string', () => {
  expect(() => parseAge('')).toThrow('Invalid age: ')
})
```

不需要测试每一个可能的输入。关注边界值（0、150、151、-1）、错误路径，以及函数可能实际接收的输入类型。

::: tip
如果你不确定某个边界情况是否重要，问问自己：真实用户或调用者会触发它吗？如果会，就测试它。
:::

### 属性基础测试

对于具有广泛有效输入的函数，手动选择边界情况可能远远不够。**属性基础测试**是一种技术：你描述应该对任何输入成立的*属性*，测试框架会生成数百个随机输入，试图找到破坏属性的反例。

例如，你可以说“对于任何有效的年龄字符串，parseAge 应该返回一个非负整数”，然后让工具寻找反例。[fast-check](https://fast-check.dev/) 是一个与 Vitest 集成的流行属性基础测试库。这是一个高级技术，但随着测试需求的增长，了解它是非常有价值的。

## 何时使用模拟

模拟是一个强大的工具，但很容易被滥用。

### 慢速依赖

网络请求、文件系统操作和数据库调用会让测试从毫秒级变成秒级。使用模拟来保持反馈循环快速。

对于 HTTP 请求，建议使用 [Mock Service Worker](https://mswjs.io/) 而不是直接模拟 fetch。请参阅[模拟请求指南](/guide/mocking/requests)了解设置说明。

### 非确定性值

如果代码依赖于当前日期、随机数或 UUID 生成器，请在测试中模拟这些以确保可预测性。Vitest 提供了 [`vi.useFakeTimers()`](/api/vi#vi-usefaketimers) 和 [`vi.setSystemTime()`](/api/vi#vi-setsystemtime) 来控制测试中的时间。

### 不要模拟什么

不要模拟你正在测试的东西。如果你正在测试一个 `UserService`，不要模拟 `UserService`。而是模拟它的*依赖项*（数据库、邮件发送器），让服务本身真实运行。

另外，当依赖项是简单内存数据结构或纯函数时，优先使用真实实现。越接近真实使用场景，测试提供的信心就越多。

::: tip
只有在真实对象缓慢、不稳定或具有无法在测试中控制的副作用时，才使用模拟。
:::

## 通过测试修复 Bug

当发现一个 Bug 时，直接去修复代码是很诱人的。更好的方法是先编写一个失败的重现代码的测试，然后修复代码并观察测试变绿。

这样做有几个好处。测试证明 Bug 的存在（不仅仅是误解）。它记录了确切的问题所在。并且它能防止同样的 Bug 以后再次出现，因为如果有人不小心重新引入同样的问题，测试会捕获它。

这在实际中看起来是这样的。假设用户报告 `parseAge` 在收到带前导空格的字符串（如 `" 25"`）时会崩溃。首先编写一个重现问题的测试：

```js
test('handles leading spaces', () => {
  expect(parseAge(' 25')).toBe(25)
})
```

运行它并确认它失败。现在你确切知道哪里出了问题，并有一个明确的目标。修复实现：

```js
export function parseAge(input) {
  const age = Number(input.trim())
  // ...
}
```

再次运行测试。它通过了。Bug 已修复，并且你还有一个回归测试，如果有人之后删除了 `.trim()` 调用，它还能捕获这个问题。

::: tip
如果你使用 AI 代理来修复 Bug，请配置它们遵循相同的原则：首先用失败的测试重现问题，然后再修复代码。这可以防止代理通过修改测试而不是代码来“修复” Bug，并让你确信修复确实有效。
:::

## 组织测试文件

没有唯一正确的测试组织方式，但某些模式比其他模式更具扩展性。

### 文件布局

最简单的起点是每个源文件对应一个测试文件。对于每个 `utils.js`，旁边都有一个 `utils.test.js`。这使得查找任何给定代码的测试变得容易，并且大多数编辑器会在文件树中并排显示它们：

```
src/
  utils.js
  utils.test.js
  formatPrice.js
  formatPrice.test.js
```

一些团队更喜欢使用单独的 `__tests__` 或 `test` 目录。这两种方法都可行。重要的是在整个项目中保持一致性。Vitest 的 [`include`](/config#include) 模式默认匹配这两种布局。

### 使用 `describe` 进行分组

当一个模块导出多个函数时，使用 `describe` 块来分组每个函数的测试。这使得测试输出更有条理，并清楚哪个函数对应哪个失败测试：

```js
describe('formatPrice', () => {
  test('formats USD prices', () => { /* ... */ })
  test('handles zero', () => { /* ... */ })
})

describe('parseAmount', () => {
  test('parses valid amounts', () => { /* ... */ })
  test('throws for invalid input', () => { /* ... */ })
})
```

避免嵌套超过一两层的 `describe` 块。深度嵌套的测试树难以阅读，通常意味着源模块承担了太多职责。

### 拆分大型文件

随着项目增长，一些测试文件不可避免地会变长。如果测试文件超过几百行，考虑按主题或功能区域拆分。例如，`userService.test.js` 可能变成 `userService.creation.test.js` 和 `userService.auth.test.js`。这也有助于在开发过程中更快地运行测试子集。

### 命名测试

测试名称比你想象的更重要。当测试在 CI 中失败时，测试名称通常是人们首先看到的内容。“工作正常”或“处理边界情况”这样的名称无法告诉你哪里出了问题。

更倾向于描述具体行为的名称：“返回空购物车时返回 0”、“如果电子邮件格式无效则抛出”、“添加新项时保留现有项”。测试输出应该像模块功能的规范说明一样可读。

## 一个完整示例

我们来整合所有内容。这是一个小型 `TodoList` 模块：

```js [todoList.js]
let nextId = 1

export function createTodoList() {
  const items = []

  return {
    add(text) {
      if (!text.trim()) {
        throw new Error('Todo text cannot be empty')
      }
      const todo = { id: nextId++, text, completed: false }
      items.push(todo)
      return todo
    },

    remove(id) {
      const index = items.findIndex(item => item.id === id)
      if (index === -1) {
        throw new Error(`Todo with id ${id} not found`)
      }
      items.splice(index, 1)
    },

    toggle(id) {
      const todo = items.find(item => item.id === id)
      if (!todo) {
        throw new Error(`Todo with id ${id} not found`)
      }
      todo.completed = !todo.completed
    },

    getAll() {
      return items
    },

    getCompleted() {
      return items.filter(item => item.completed)
    },
  }
}
```

从这段代码中，我们可以识别出需要测试的行为：

- 添加项目（主要目的）
- 添加空项目（应失败）
- 通过 ID 移除项目
- 移除不存在的项目（应失败）
- 切换完成状态
- 获取所有项目与已完成项目

下面是测试文件的可能样子：

```js [todoList.test.js]
import { describe, expect, test } from 'vitest'
import { createTodoList } from './todoList.js'

describe('add', () => {
  test('adds a new todo', () => {
    const list = createTodoList()
    const todo = list.add('Buy groceries')

    expect(todo.text).toBe('Buy groceries')
    expect(todo.completed).toBe(false)
    expect(list.getAll()).toHaveLength(1)
  })

  test('assigns unique IDs to each todo', () => {
    const list = createTodoList()
    const first = list.add('First')
    const second = list.add('Second')

    expect(first.id).not.toBe(second.id)
  })

  test('throws when text is empty', () => {
    const list = createTodoList()
    expect(() => list.add('')).toThrow('Todo text cannot be empty')
  })

  test('throws when text is only whitespace', () => {
    const list = createTodoList()
    expect(() => list.add('   ')).toThrow('Todo text cannot be empty')
  })
})

describe('remove', () => {
  test('removes a todo by ID', () => {
    const list = createTodoList()
    const todo = list.add('Buy groceries')

    list.remove(todo.id)

    expect(list.getAll()).toHaveLength(0)
  })

  test('keeps other items when removing one', () => {
    const list = createTodoList()
    const first = list.add('First')
    list.add('Second')

    list.remove(first.id)

    expect(list.getAll()).toHaveLength(1)
    expect(list.getAll()[0].text).toBe('Second')
  })

  test('throws when ID does not exist', () => {
    const list = createTodoList()
    expect(() => list.remove(999)).toThrow('Todo with id 999 not found')
  })
})

describe('toggle', () => {
  test('marks a todo as completed', () => {
    const list = createTodoList()
    const todo = list.add('Buy groceries')

    list.toggle(todo.id)

    expect(list.getAll()[0].completed).toBe(true)
  })

  test('toggles back to incomplete', () => {
    const list = createTodoList()
    const todo = list.add('Buy groceries')

    list.toggle(todo.id)
    list.toggle(todo.id)

    expect(list.getAll()[0].completed).toBe(false)
  })

  test('throws when ID does not exist', () => {
    const list = createTodoList()
    expect(() => list.toggle(999)).toThrow('Todo with id 999 not found')
  })
})

describe('getCompleted', () => {
  test('returns only completed todos', () => {
    const list = createTodoList()
    const buy = list.add('Buy groceries')
    list.add('Clean house')
    list.toggle(buy.id)

    const completed = list.getCompleted()

    expect(completed).toHaveLength(1)
    expect(completed[0].text).toBe('Buy groceries')
  })

  test('returns empty array when nothing is completed', () => {
    const list = createTodoList()
    list.add('Buy groceries')

    expect(list.getCompleted()).toHaveLength(0)
  })
})
```

每个 `describe` 块专注于一个方法。每个测试验证一个具体行为。测试名称读起来就像模块的规范说明。如果任何测试失败，名称和断言会告诉你确切哪里出了问题。

::: tip
注意我们在每个测试中都创建了一个新的 `createTodoList()` 实例。这保持了测试的独立性，意味着它们可以按任意顺序运行而互不影响。如果你发现自己每个测试都重复相同的设置代码，这正是使用 [`beforeEach`](/api/hooks#beforeeach) 或 [`test.extend`](/guide/test-context#extend-test-context) 固定装置的时机。
:::

---

如果你正在构建一个 Web 应用程序并希望在真实的浏览器环境中测试组件，请查阅[组件测试指南](/guide/browser/component-testing)，了解如何测试 React、Vue、Svelte 和其他 UI 框架。
