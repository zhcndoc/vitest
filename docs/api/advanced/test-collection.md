# TestCollection

`TestCollection` 代表套件或模块中顶层 [套件](/api/advanced/test-suite) 和 [测试](/api/advanced/test-case) 的集合。它还提供了有用的方法来遍历自身。

::: info
大多数方法返回迭代器而不是数组，以便在不需要集合中每个项时获得更好的性能。如果你更喜欢使用数组，可以展开迭代器：`[...children.allSuites()]`。

还要注意集合本身就是一个迭代器：

```ts
for (const child of module.children) {
  console.log(child.type, child.name)
}
```
:::

## size

集合中测试和套件的数量。

::: warning
这个数字仅包括顶层的测试和套件，不包括嵌套的套件和测试。
:::

## at

```ts
function at(index: number): TestCase | TestSuite | undefined
```

返回特定索引处的测试或套件。此方法接受负索引。

## array

```ts
function array(): (TestCase | TestSuite)[]
```

相同的集合，但作为数组。如果你想使用 `TaskCollection` 实现不支持的 `Array` 方法（如 `map` 和 `filter`），这很有用。

## allSuites

```ts
function allSuites(): Generator<TestSuite, undefined, void>
```

过滤属于此集合及其子项的所有套件。

```ts
for (const suite of module.children.allSuites()) {
  if (suite.errors().length) {
    console.log('failed to collect', suite.errors())
  }
}
```

## allTests

```ts
function allTests(state?: TestState): Generator<TestCase, undefined, void>
```

过滤属于此集合及其子项的所有测试。

```ts
for (const test of module.children.allTests()) {
  if (test.result().state === 'pending') {
    console.log('test', test.fullName, 'did not finish')
  }
}
```

你可以传入一个 `state` 值来按状态过滤测试。

## tests

```ts
function tests(state?: TestState): Generator<TestCase, undefined, void>
```

仅过滤属于此集合的测试。你可以传入一个 `state` 值来按状态过滤测试。

## suites

```ts
function suites(): Generator<TestSuite, undefined, void>
```

仅过滤属于此集合的套件。
