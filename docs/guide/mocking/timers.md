# 定时器

当我们测试涉及超时或间隔的代码时，我们可以使用模拟 `setTimeout` 和 `setInterval` 调用的“虚假”定时器来加速测试，而不必让测试实际等待或超时。

请参阅 [`vi.useFakeTimers` API 部分](/api/vi#vi-usefaketimers) 以获取更深入的详细 API 描述。

## 示例

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function executeAfterTwoHours(func) {
  setTimeout(func, 1000 * 60 * 60 * 2) // 2 小时
}

function executeEveryMinute(func) {
  setInterval(func, 1000 * 60) // 1 分钟
}

const mock = vi.fn(() => console.log('executed'))

describe('delayed execution', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })
  it('should execute the function', () => {
    executeAfterTwoHours(mock)
    vi.runAllTimers()
    expect(mock).toHaveBeenCalledTimes(1)
  })
  it('should not execute the function', () => {
    executeAfterTwoHours(mock)
    // 推进 2ms 不会触发该函数
    vi.advanceTimersByTime(2)
    expect(mock).not.toHaveBeenCalled()
  })
  it('should execute every minute', () => {
    executeEveryMinute(mock)
    vi.advanceTimersToNextTimer()
    expect(mock).toHaveBeenCalledTimes(1)
    vi.advanceTimersToNextTimer()
    expect(mock).toHaveBeenCalledTimes(2)
  })
})
```

## 自动推进 {#automatic-advancing}

Vitest 的一些 API 会等待条件满足。启用假计时器时，这些 API 会在运行期间推进计时器：

- [`vi.waitFor`](/api/vi#vi-waitfor) 和 [`vi.waitUntil`](/api/vi#vi-waituntil) 会在每次检查前将计时器推进 `interval`。
- [`expect.poll`](/api/expect#poll) 会在每次尝试失败后将计时器推进 `interval`。
- 在浏览器模式下，[`expect.element`](/api/browser/assertions) 会在重试期间推进计时器；接受元素的 [locator](/api/browser/locators#methods) 和 [`userEvent`](/api/browser/interactivity) 方法也会在运行期间推进计时器，即使元素已经存在也是如此。推进量取决于操作在真实时间中耗时，因此每次运行可能不同。不接受元素的方法（例如 `userEvent.keyboard` 和 `userEvent.tab`）不会推进计时器。

## 计时模式 {#tick-modes}

默认情况下，只有显式推进计时器或运行上述 API 时，假计时器才会前进。[`vi.setTimerTickMode`](/api/vi#vi-settimertickmode) 可以让它们自动推进：

- `interval` 会按照真实时间间隔，以固定步长推进假时间，使其大致与真实时间同步。适用于某些状态只会短暂存在的代码。
- `nextTimerAsync` 会在每个宏任务后运行下一个待处理计时器，因此一连串计时器几乎会连续触发。适用于最终会稳定下来的代码；但只短暂存在的状态可能会在断言或操作观察到它之前消失。
