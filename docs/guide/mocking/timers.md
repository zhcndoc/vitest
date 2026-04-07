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
