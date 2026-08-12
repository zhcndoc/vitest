# 模拟类

你可以使用单个 [`vi.fn`](/api/vi#fn) 调用来模拟整个类。

```ts
class Dog {
  name: string

  constructor(name: string) {
    this.name = name
  }

  static getType(): string {
    return 'animal'
  }

  greet = (): string => {
    return `Hi! My name is ${this.name}!`
  }

  speak(): string {
    return 'bark!'
  }

  isHungry() {}
  feed() {}
}
```

请注意，这个类以两种不同的方式定义了成员，而这种差异对于模拟来说很重要：

- `greet` 是一个类字段。赋值会在构造过程中执行，因此每个实例都会将该函数的独立副本作为自身属性。
- `speak`、`isHungry` 和 `feed` 是原型方法。它们只会被创建一次，并存储在所有实例共享的 `Dog.prototype` 对象上。实例自身并没有 `speak` 属性：当你调用 `dog.speak()` 时，JavaScript 在实例上找不到 `speak`，于是会继续在 `Dog.prototype` 上查找。每个实例都会在那里找到同一个函数，因此 `dog.speak === Dog.prototype.speak` 为 `true`。

我们可以使用 `vi.fn`（或 `vi.spyOn().mockImplementation()`）重新创建这个类。通过将每个方法定义为类字段，每个实例都会获得自己独立的模拟函数，这样就可以检查单个实例上的调用：

```ts
const Dog = vi.fn(class {
  static getType = vi.fn(() => 'mocked animal')

  constructor(name) {
    this.name = name
  }

  greet = vi.fn(() => `Hi! My name is ${this.name}!`)
  speak = vi.fn(() => 'loud bark!')
  feed = vi.fn()
})
```

::: warning
如果构造函数返回了一个非原始值，该值将成为 new 表达式的结果。在这种情况下，`[[Prototype]]` 可能无法正确绑定：

```ts
const CorrectDogClass = vi.fn(function (name) {
  this.name = name
})

const IncorrectDogClass = vi.fn(name => ({
  name
}))

const Marti = new CorrectDogClass('Marti')
const Newt = new IncorrectDogClass('Newt')

Marti instanceof CorrectDogClass // ✅ true
Newt instanceof IncorrectDogClass // ❌ false!
```

如果你正在模拟类，优先使用 class 语法而不是 function。
:::

::: tip 何时使用？
一般来说，如果类是从另一个模块重新导出的，你会在模块工厂中像这样重新创建该类：

```ts
import { Dog } from './dog.js'

vi.mock(import('./dog.js'), () => {
  const Dog = vi.fn(class {
    feed = vi.fn()
    // ... 其他模拟
  })
  return { Dog }
})
```

此方法也可用于将类的实例传递给接受相同接口的函数：

```ts [src/feed.ts]
function feed(dog: Dog) {
  // ...
}
```
```ts [tests/dog.test.ts]
import { expect, test, vi } from 'vitest'
import { feed } from '../src/feed.js'

const Dog = vi.fn(class {
  feed = vi.fn()
  isHungry = vi.fn(() => false)
})

test('can feed dogs', () => {
  const dogMax = new Dog('Max')

  feed(dogMax)

  expect(dogMax.feed).toHaveBeenCalled()
  expect(dogMax.isHungry()).toBe(false)
})
```
:::

现在，当我们创建 `Dog` 类的新实例时，它的 `speak` 方法（以及 `feed` 和 `greet`）已经被模拟了：

```ts
const Cooper = new Dog('Cooper')
Cooper.speak() // 大声吠叫！
Cooper.greet() // 嗨！我的名字是 Cooper！

// 你可以使用内置断言来检查调用的有效性
expect(Cooper.speak).toHaveBeenCalled()
expect(Cooper.greet).toHaveBeenCalled()

const Max = new Dog('Max')

// 如果你直接分配了方法，它们不会在实例之间共享
expect(Max.speak).not.toHaveBeenCalled()
expect(Max.greet).not.toHaveBeenCalled()
```

你不必将每个方法都重新定义为类字段。实例会保留传递给 `vi.fn` 的类的原型链，因此原型方法在构造期间和构造完成后都能在实例上使用，并且实例通过针对该类的 `instanceof` 检查：

```ts
class OriginalDog {
  constructor(name) {
    this.name = name
  }

  speak() {
    return 'bark!'
  }
}

const MockedDog = vi.fn(OriginalDog)
const dog = new MockedDog('Cooper')

dog.speak() // bark!
dog instanceof MockedDog // true
dog instanceof OriginalDog // true
```

请注意，这个示例中没有任何内容被模拟。与上面 `Dog` 示例中的 `speak = vi.fn()` 字段不同，实例不会获得自己的模拟函数。`dog.speak` 是通过原型链找到的，并且指向原始类方法（`dog.speak === MockedDog.prototype.speak`），因此调用断言会抛出错误：

```ts
expect(dog.speak).toHaveBeenCalled()
// TypeError: [Function speak] is not a spy or a call to a spy!
```

由于每个实例都会在原型上找到 `speak`，因此你可以通过在那里分配一个模拟函数，一次为所有实例模拟它：

```ts
MockedDog.prototype.speak = vi.fn(() => 'woof!')

const cooper = new MockedDog('Cooper')
const max = new MockedDog('Max')

cooper.speak() // woof!
max.speak() // woof!

// 两个实例的调用都会由同一个模拟函数记录
expect(MockedDog.prototype.speak).toHaveBeenCalledTimes(2)
// `mock.contexts` 保存每次调用的实例
expect(vi.mocked(MockedDog.prototype.speak).mock.contexts).toEqual([cooper, max])
```

在 `MockedDog.prototype` 上而不是 `OriginalDog.prototype` 上进行赋值，可以保持原始类不受影响：查找顺序是 `instance` → `MockedDog.prototype` → `OriginalDog.prototype`，因此分配的函数会遮蔽原始方法。由于实例会在每次调用时查找该方法，而不是保留一个副本，因此所有实例都能看到这个模拟函数，即使是在赋值之前创建的实例也一样。代价是它们还会共享一份调用历史记录，不同于类字段，后者会为每个实例提供自己的模拟函数。

::: warning
模拟函数的 `prototype` 始终跟随当前实现：当你设置新的实现、构造排队的 `mockImplementationOnce` 类以及重置模拟函数时，`prototype` 都会被重新指向。如果单个模拟函数使用不同的类实现，那么较早实现创建的实例会在更新的实现接管后失去对其原型方法的访问权。构造函数中或通过类字段赋值的自身属性不受影响。
:::

如果你只想模拟某个实例的方法，请使用 [`vi.spyOn`](/api/vi#vi-spyon)。它会直接在该实例上定义模拟函数，仅为该实例遮蔽原型方法：

```ts
const cooper = new MockedDog('Cooper')
const max = new MockedDog('Max')

vi.spyOn(cooper, 'speak').mockReturnValue('meow!')

cooper.speak() // meow!
max.speak() // bark!, 仍然是原始方法

expect(cooper.speak).toHaveBeenCalledTimes(1)
```

当方法被定义为类字段时，就像本页面开头模拟的 `Dog` 类一样，每个实例已经拥有自己的模拟函数，因此你可以直接为特定实例重新分配返回值：

```ts
const dog = new Dog('Cooper')

// "vi.mocked" 是一个类型辅助函数，因为
// TypeScript 不知道 Dog 是一个被模拟的类，
// 它将任何函数包装为 Mock<T> 类型
// 而不验证该函数是否为模拟
vi.mocked(dog.speak).mockReturnValue('woof woof')

dog.speak() // 汪汪
```

要模拟非函数属性（例如 `name`），我们可以使用 `vi.spyOn(dog, 'name', 'get')` 方法。这样就可以对模拟属性使用 spy 断言：

```ts
const dog = new Dog('Cooper')

const nameSpy = vi.spyOn(dog, 'name', 'get').mockReturnValue('Max')

expect(dog.name).toBe('Max')
expect(nameSpy).toHaveBeenCalledTimes(1)
```

::: tip
你也可以使用相同的方法监听 getter 和 setter。
:::

::: danger
在 Vitest 4 中引入了将类与 `vi.fn()` 一起使用的功能。此前，你必须直接使用 `function` 和 `prototype` 继承。请参阅 [v3 指南](https://v3.vitest.dev/guide/mocking.html#classes)。
:::
