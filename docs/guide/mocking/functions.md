# 模拟函数

模拟函数可以分为两类：监听（spying）和模拟（mocking）。

如果你需要观察对象上方法的行为，可以使用 [`vi.spyOn()`](/api/vi#vi-spyon) 创建一个监听器来跟踪对该方法的调用。

如果你需要传递自定义函数实现作为参数，或者创建一个新的模拟实体，可以使用 [`vi.fn()`](/api/vi#vi-fn) 创建一个模拟函数。

`vi.spyOn` 和 `vi.fn` 共享相同的方法。

::: tip
如果你需要根据接收到的参数让 mock 返回不同的值，[`vi.when()`](/api/vi#vi-when) 可以让你定义基于参数的行为，而无需自己编写 `if/else` 逻辑。详情请参阅 [条件模拟](/guide/recipes/conditional-mocking) 配方。
:::

## 示例

```js
import { afterEach, describe, expect, it, vi } from 'vitest'

const messages = {
  items: [
    { message: '简单的测试消息', from: 'Testman' },
    // ...
  ],
  addItem(item) {
    messages.items.push(item)
    messages.callbacks.forEach(callback => callback(item))
  },
  onItem(callback) {
    messages.callbacks.push(callback)
  },
  getLatest, // 如果支持，也可以是 `getter 或 setter`
}

function getLatest(index = messages.items.length - 1) {
  return messages.items[index]
}

it('应该使用 spy 获取最新消息', () => {
  const spy = vi.spyOn(messages, 'getLatest')
  expect(spy.getMockName()).toEqual('getLatest')

  expect(messages.getLatest()).toEqual(
    messages.items.at(-1),
  )

  expect(spy).toHaveBeenCalledTimes(1)

  spy.mockImplementationOnce(() => '访问受限')
  expect(messages.getLatest()).toEqual('访问受限')

  expect(spy).toHaveBeenCalledTimes(2)
})

it('传递 mock', () => {
  const callback = vi.fn()
  messages.onItem(callback)

  messages.addItem({ message: '另一条测试消息', from: 'Testman' })
  expect(callback).toHaveBeenCalledWith({
    message: '另一条测试消息',
    from: 'Testman',
  })
})
```
