# assertType

::: warning
此函数在运行时不会执行任何操作。要 [启用类型检查](/guide/testing-types#run-typechecking)，别忘了传递 `--typecheck` 标志。
:::

- **类型：** `<T>(value: T): void`

你可以将此函数作为 [`expectTypeOf`](/api/expect-typeof) 的替代方案，以便轻松断言参数类型与提供的泛型相等。

```ts
import { assertType } from 'vitest'

function concat(a: string, b: string): string
function concat(a: number, b: number): number
function concat(a: string | number, b: string | number): string | number

assertType<string>(concat('a', 'b'))
assertType<number>(concat(1, 2))
// @ts-expect-error 类型错误
assertType(concat('a', 2))
```
